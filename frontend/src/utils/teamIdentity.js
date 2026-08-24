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