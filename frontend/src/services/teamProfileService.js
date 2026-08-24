const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        payload?.message ||
        "Team profile request failed."
    );
  }

  if (!payload?.success) {
    throw new Error(
      payload?.error ||
        "The server returned an unsuccessful response."
    );
  }

  return payload.data;
};

export const saveTeamProfile = async (profile) => {
  return request(`${API_BASE_URL}/api/team-profile`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
};

export const fetchTeamProfile = async (teamId) => {
  if (!teamId) {
    throw new Error("teamId is required.");
  }

  return request(
    `${API_BASE_URL}/api/team-profile/${encodeURIComponent(
      teamId
    )}`
  );
};