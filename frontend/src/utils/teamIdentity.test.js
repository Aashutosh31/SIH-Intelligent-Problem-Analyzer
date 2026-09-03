import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  getTeamId,
  getActiveTeamContext,
} from "./teamIdentity";
import {
  storeAccessToken,
  retrieveAccessToken,
  clearAccessToken,
  saveTeamProfile,
  fetchTeamProfile,
} from "../services/teamProfileService";
import { analyzeProblem } from "../services/analysisService";

// ---- Minimal localStorage mock ----
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    __store: () => store,
  };
})();

// Deterministic UUID generator for tests
let uuidCounter = 0;
const uuid = () => `team-${++uuidCounter}`;

// Capture the last analyzeRequest
let lastFetch;
let lastFetchCall;

const mockFetchSuccess = (body) => {
  lastFetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", lastFetch);
};

const mockFetchError = (status, error) => {
  lastFetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ success: false, error }),
  });
  vi.stubGlobal("fetch", lastFetch);
};

const parseLastRequest = () => {
  const [url, init] = lastFetch.mock.calls[lastFetch.mock.calls.length - 1];
  lastFetchCall = {
    url,
    method: init?.method,
    headers: init?.headers || {},
    body: init?.body ? JSON.parse(init.body) : null,
  };
  return lastFetchCall;
};

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("crypto", {
    randomUUID: uuid,
  });
  lastFetch = null;
  lastFetchCall = null;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getActiveTeamContext", () => {
  it("A: fresh browser with no teamId -> null (anonymous)", () => {
    expect(getActiveTeamContext()).toBeNull();
  });

  it("B: generated local teamId but no access token -> null (anonymous)", () => {
    getTeamId();
    expect(localStorage.getItem("sih-intelligence-team-id")).toBeTruthy();
    expect(getActiveTeamContext()).toBeNull();
  });

  it("E: stale teamId + missing token -> null (anonymous)", () => {
    localStorage.setItem("sih-intelligence-team-id", "old-stale-team");
    expect(getActiveTeamContext()).toBeNull();
  });

  it("C: saved team + stored token -> active context", () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "token-abc");
    expect(getActiveTeamContext()).toEqual({
      teamId,
      accessToken: "token-abc",
    });
  });

  it("returns null when token exists for a different teamId than the active one", () => {
    getTeamId();
    storeAccessToken("some-other-team", "token-xyz");
    expect(getActiveTeamContext()).toBeNull();
  });
});

describe("analyzeProblem request construction", () => {
  it("A: anonymous -> omits teamId and Authorization header", async () => {
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    await analyzeProblem({ problemStatement: "Build a chatbot." });
    const req = parseLastRequest();
    expect(req.body.problemStatement).toBe("Build a chatbot.");
    expect(req.body).not.toHaveProperty("teamId");
    expect(req.headers.Authorization).toBeUndefined();
  });

  it("B: generated teamId with no token passed -> omits teamId and Authorization", async () => {
    const teamId = getTeamId();
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    // Caller must not pass a teamId that has no token; passing it alone is
    // treated as anonymous by the service.
    await analyzeProblem({ problemStatement: "X", teamId });
    const req = parseLastRequest();
    expect(req.body).not.toHaveProperty("teamId");
    expect(req.headers.Authorization).toBeUndefined();
  });

  it("C: teamId + token -> includes teamId and Bearer header", async () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "token-abc");
    const ctx = getActiveTeamContext();
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    await analyzeProblem({
      problemStatement: "X",
      teamId: ctx.teamId,
      accessToken: ctx.accessToken,
    });
    const req = parseLastRequest();
    expect(req.body.teamId).toBe(teamId);
    expect(req.headers.Authorization).toBe(`Bearer token-abc`);
  });

  it("D: teamId + (wrong/invalid) token -> still sends the token; backend rejects", async () => {
    const teamId = getTeamId();
    mockFetchError(401, "Invalid team access token.");
    const call = analyzeProblem({
      problemStatement: "X",
      teamId,
      accessToken: "wrong-token",
    });
    const req = parseLastRequest();
    expect(req.body.teamId).toBe(teamId);
    expect(req.headers.Authorization).toBe("Bearer wrong-token");
    await expect(call).rejects.toMatchObject({ status: 401 });
  });

  it("E: stale teamId + no token passed -> anonymous request", async () => {
    localStorage.setItem("sih-intelligence-team-id", "stale-team");
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    const ctx = getActiveTeamContext();
    expect(ctx).toBeNull();
    await analyzeProblem({ problemStatement: "X" });
    const req = parseLastRequest();
    expect(req.body).not.toHaveProperty("teamId");
    expect(req.headers.Authorization).toBeUndefined();
  });
});

describe("stale session handling (F)", () => {
  it("F: backend 404 for a stale team -> clearAccessToken removes the stored token", async () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "stale-token");
    expect(retrieveAccessToken(teamId)).toBe("stale-token");

    mockFetchError(404, "Team profile not found.");
    // Simulate what App.jsx does: attempt team analysis, get 404, clear token.
    await expect(
      analyzeProblem({
        problemStatement: "X",
        teamId,
        accessToken: retrieveAccessToken(teamId),
      }),
    ).rejects.toMatchObject({ status: 404 });

    clearAccessToken(teamId);
    expect(retrieveAccessToken(teamId)).toBeNull();
    expect(getActiveTeamContext()).toBeNull();

    // Anonymous analysis now works after clearing.
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    await analyzeProblem({ problemStatement: "X" });
    const req = parseLastRequest();
    expect(req.body).not.toHaveProperty("teamId");
  });

  it("F: backend 403 for a stale team -> clearAccessToken removes the stored token", async () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "stale-token");
    mockFetchError(403, "Invalid team access token.");
    await expect(
      analyzeProblem({
        problemStatement: "X",
        teamId,
        accessToken: retrieveAccessToken(teamId),
      }),
    ).rejects.toMatchObject({ status: 403 });
    clearAccessToken(teamId);
    expect(getActiveTeamContext()).toBeNull();
    expect(retrieveAccessToken(teamId)).toBeNull();
  });
});

describe("team profile creation & reuse (G, H)", () => {
  it("G: first creation stores returned token; subsequent analysis uses team context", async () => {
    const teamId = getTeamId();

    // First creation returns a fresh accessToken (mirrors backend behavior).
    mockFetchSuccess({
      success: true,
      data: { teamId, name: "Team A", accessToken: "fresh-token" },
    });
    await saveTeamProfile({ teamId, name: "Team A", members: [], preferences: {} });
    expect(retrieveAccessToken(teamId)).toBe("fresh-token");

    // Subsequent save (update) returns no accessToken; existing one persists.
    mockFetchSuccess({
      success: true,
      data: { teamId, name: "Team A updated" },
    });
    await saveTeamProfile({ teamId, name: "Team A updated", members: [], preferences: {} });
    expect(retrieveAccessToken(teamId)).toBe("fresh-token");

    // Analysis uses the stored token.
    mockFetchSuccess({ success: true, data: { identity: { domain: "x" } } });
    await analyzeProblem({
      problemStatement: "X",
      teamId,
      accessToken: retrieveAccessToken(teamId),
    });
    const req = parseLastRequest();
    expect(req.body.teamId).toBe(teamId);
    expect(req.headers.Authorization).toBe(`Bearer fresh-token`);
  });

  it("H: existing profile fetch includes stored bearer token (no regression)", async () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "token-abc");

    mockFetchSuccess({ success: true, data: { teamId, name: "Team A" } });
    await fetchTeamProfile(teamId);
    const req = parseLastRequest();
    expect(req.url).toContain(encodeURIComponent(teamId));
    expect(req.headers.Authorization).toBe("Bearer token-abc");
  });
});

describe("teamProfileService save request wire format (I)", () => {
  it("I1: new team save always sends Content-Type: application/json", async () => {
    const teamId = getTeamId();
    mockFetchSuccess({
      success: true,
      data: { teamId, name: "Team A", accessToken: "fresh-token" },
    });
    await saveTeamProfile({ teamId, name: "Team A", members: [], preferences: {} });
    const req = parseLastRequest();
    expect(req.method).toBe("POST");
    expect(req.url).toContain("/api/team-profile");
    expect(req.headers["Content-Type"]).toBe("application/json");
    expect(req.body).toEqual({
      teamId,
      name: "Team A",
      members: [],
      preferences: {},
    });
  });

  it("I2: existing team save keeps Content-Type AND adds Bearer header", async () => {
    const teamId = getTeamId();
    storeAccessToken(teamId, "token-abc");
    mockFetchSuccess({ success: true, data: { teamId, name: "Team A" } });
    await saveTeamProfile({ teamId, name: "Team A", members: [], preferences: {} });
    const req = parseLastRequest();
    expect(req.headers["Content-Type"]).toBe("application/json");
    expect(req.headers.Authorization).toBe("Bearer token-abc");
    expect(req.body.teamId).toBe(teamId);
  });

  it("I3: invalid profile (no teamId) throws locally WITHOUT any HTTP request", async () => {
    await expect(
      saveTeamProfile({ name: "Team A", members: [], preferences: {} }),
    ).rejects.toThrow("teamId is required.");
    expect(lastFetch?.mock.calls.length ?? 0).toBe(0);
  });

  it("I4: undefined profile throws locally WITHOUT any HTTP request", async () => {
    await expect(saveTeamProfile()).rejects.toThrow(
      "Profile must be a non-null object.",
    );
    expect(lastFetch?.mock.calls.length ?? 0).toBe(0);
  });

  it("I5: profile with non-array members throws locally WITHOUT HTTP request", async () => {
    await expect(
      saveTeamProfile({ teamId: "t1", name: "A", members: "nope" }),
    ).rejects.toThrow("members must be an array.");
    expect(lastFetch?.mock.calls.length ?? 0).toBe(0);
  });
});
