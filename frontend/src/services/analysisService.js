import { API_BASE_URL } from "../config";

export const analyzeProblem = async ({
  problemStatement,
  teamId,
  accessToken,
}) => {
  if (!problemStatement?.trim()) {
    throw new Error("Problem statement cannot be empty.");
  }

  // Only send team context (teamId + bearer token) when BOTH are present.
  // A teamId without its access token is treated as anonymous to avoid asking
  // the backend to authorize a team that may not exist locally/serverside.
  const hasValidTeamContext =
    typeof teamId === "string" &&
    teamId.length > 0 &&
    typeof accessToken === "string" &&
    accessToken.length > 0;

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(hasValidTeamContext
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    body: JSON.stringify({
      problemStatement: problemStatement.trim(),
      ...(hasValidTeamContext ? { teamId } : {}),
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
