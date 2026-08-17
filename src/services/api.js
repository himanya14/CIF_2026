const API_BASE =
  import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(
  path,
  options = {}
) {
  const isFormData =
    options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),
    ...options.headers,
  };

  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
      }
    );

  const payload =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.error ||
        `Request failed (${response.status})`
    );
  }

  return payload;
}

export const getDashboard =
  () =>
    apiRequest(
      "/dashboard"
    );

export const inspectPrompt =
  (prompt) =>
    apiRequest(
      "/inspect",
      {
        method: "POST",
        body: JSON.stringify({
          prompt,
        }),
      }
    );

export const uploadDocument =
  (file) => {
    const formData =
      new FormData();

    formData.append(
      "document",
      file
    );

    return apiRequest(
      "/documents/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  };

export const getIncidents =
  () =>
    apiRequest(
      "/incidents"
    );

export const updateIncident =
  (id, action) =>
    apiRequest(
      `/incidents/${id}/${action}`,
      {
        method: "POST",
      }
    );

export const getRedTeamTests =
  () =>
    apiRequest(
      "/red-team/tests"
    );

export const createRedTeamTest =
  (test) =>
    apiRequest(
      "/red-team/tests",
      {
        method: "POST",
        body: JSON.stringify(
          test
        ),
      }
    );