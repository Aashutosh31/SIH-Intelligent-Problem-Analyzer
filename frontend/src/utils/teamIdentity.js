import { retrieveAccessToken } from "../services/teamProfileService";

const TEAM_ID_STORAGE_KEY =
  "sih-intelligence-team-id";

export const getTeamId = () => {
  let teamId = localStorage.getItem(
    TEAM_ID_STORAGE_KEY
  );

  if (teamId) {
    return teamId;
  }

  teamId = crypto.randomUUID();

  localStorage.setItem(
    TEAM_ID_STORAGE_KEY,
    teamId
  );

  return teamId;
};

// Returns a valid, server-owned team session when the browser holds BOTH a
// teamId and the access token issued for exactly that teamId. A client-side
// generated teamId alone is NOT proof that a server-side team profile exists,
// so this returns null in that case (the caller should analyze anonymously).
//
// Returns:
//   null                                    -> treat as anonymous
//   { teamId: string, accessToken: string } -> use as team context
export const getActiveTeamContext = () => {
  const teamId = localStorage.getItem(TEAM_ID_STORAGE_KEY);

  if (!teamId) {
    return null;
  }

  const accessToken = retrieveAccessToken(teamId);

  if (!accessToken) {
    return null;
  }

  return {
    teamId,
    accessToken,
  };
};