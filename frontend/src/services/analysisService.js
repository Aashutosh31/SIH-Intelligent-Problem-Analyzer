import { retrieveAccessToken } from "./teamProfileService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const analyzeProblem = async ({ problemStatement, teamId }) => {
  if (!problemStatement?.trim()) {
    throw new Error("Problem statement cannot be empty.");
  }

  const hasTeamContext = Boolean(teamId);

  const accessToken = hasTeamContext
    ? retrieveAccessToken(teamId)
    : null;

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(hasTeamContext && accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    body: JSON.stringify({
      problemStatement: problemStatement.trim(),
      teamId: teamId || undefined,
    }),
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error || payload?.message || "Problem analysis failed.",
    );

    error.status = response.status;

    throw error;
  }

  if (!payload?.success || !payload?.data) {
    throw new Error("The server returned an invalid analysis response.");
  }

  return payload.data;
};
