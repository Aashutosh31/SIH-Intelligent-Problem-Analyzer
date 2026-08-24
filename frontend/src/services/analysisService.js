const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const analyzeProblem = async (problemStatement) => {
  if (!problemStatement?.trim()) {
    throw new Error("Problem statement cannot be empty.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        problemStatement: problemStatement.trim(),
      }),
    }
  );

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
        "Problem analysis failed."
    );
  }

  if (!payload?.success || !payload?.data) {
    throw new Error(
      "The server returned an invalid analysis response."
    );
  }

  return payload.data;
};