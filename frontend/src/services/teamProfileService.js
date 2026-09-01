const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ACCESS_TOKEN_PREFIX = "team_access_token_";

const getAccessTokenKey = (teamId) =>
  `${ACCESS_TOKEN_PREFIX}${teamId}`;

export const storeAccessToken = (teamId, token) => {
  if (!teamId || !token) {
    return;
  }

  localStorage.setItem(getAccessTokenKey(teamId), token);
};

export const retrieveAccessToken = (teamId) => {
  if (!teamId) {
    return null;
  }

  return localStorage.getItem(getAccessTokenKey(teamId));
};

const buildAuthHeaders = (teamId) => {
  const accessToken = retrieveAccessToken(teamId);

  return accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error || payload?.message || "Team profile request failed.",
    );

    error.status = response.status;

    throw error;
  }

  if (!payload?.success) {
    throw new Error(
      payload?.error || "The server returned an unsuccessful response.",
    );
  }

  return payload.data;
};

export const saveTeamProfile = async (profile) => {
  const result = await request(`${API_BASE_URL}/api/team-profile`, {
    method: "POST",
    headers: buildAuthHeaders(profile.teamId),
    body: JSON.stringify(profile),
  });

  if (result?.accessToken) {
    storeAccessToken(profile.teamId, result.accessToken);
  }

  return result;
};

export const fetchTeamProfile = async (teamId) => {
  if (!teamId) {
    throw new Error("teamId is required.");
  }

  return request(
    `${API_BASE_URL}/api/team-profile/${encodeURIComponent(teamId)}`,
    {
      headers: buildAuthHeaders(teamId),
    },
  );
};
