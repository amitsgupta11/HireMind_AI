const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Thin fetch wrapper — every call returns the parsed JSON body and throws
// a normal Error carrying the backend's { message, errorCode } on failure,
// so callers can show real server errors instead of guessing.
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // No JSON body (e.g. network failure) — payload stays null.
  }

  if (!res.ok) {
    const message = payload?.message || "Something went wrong. Please try again.";
    const error = new Error(message);
    error.errorCode = payload?.errorCode || "UNKNOWN_ERROR";
    error.details = payload?.details || null;
    error.status = res.status;
    throw error;
  }

  return payload;
}

export const authApi = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  me: (token) => apiRequest("/auth/me", { token }),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (data) => apiRequest("/auth/reset-password", { method: "POST", body: data }),
  changePassword: (data, token) =>
    apiRequest("/auth/change-password", { method: "PUT", body: data, token }),
};

export const companyApi = {
  getMine: (token) => apiRequest("/company/me", { token }),
  upsertMine: (data, token) => apiRequest("/company/me", { method: "PUT", body: data, token }),
};

export const jobsApi = {
  listMine: (token, query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return apiRequest(`/jobs/mine${qs ? `?${qs}` : ""}`, { token });
  },
  listPublic: (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return apiRequest(`/jobs${qs ? `?${qs}` : ""}`);
  },
  discover: (token, query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return apiRequest(`/jobs/discover${qs ? `?${qs}` : ""}`, { token });
  },
  getMatch: (id, token) => apiRequest(`/jobs/${id}/match`, { token }),
  getById: (id) => apiRequest(`/jobs/${id}`),
  create: (data, token) => apiRequest("/jobs", { method: "POST", body: data, token }),
  update: (id, data, token) => apiRequest(`/jobs/${id}`, { method: "PUT", body: data, token }),
  remove: (id, token) => apiRequest(`/jobs/${id}`, { method: "DELETE", token }),
  setPublish: (id, isPublished, token) =>
    apiRequest(`/jobs/${id}/publish`, { method: "PATCH", body: { isPublished }, token }),
  apply: (id, token) => apiRequest(`/jobs/${id}/apply`, { method: "POST", token }),
  getApplicants: (id, token) => apiRequest(`/jobs/${id}/applicants`, { token }),
};

export const applicationApi = {
  listMine: (token) => apiRequest("/applications/mine", { token }),
  getById: (id, token) => apiRequest(`/applications/${id}`, { token }),
  getResume: (id, token) => apiRequest(`/applications/${id}/resume`, { token }),
  updateStatus: (id, status, token) =>
    apiRequest(`/applications/${id}/status`, { method: "PATCH", body: { status }, token }),
  shortlist: (id, token) => apiRequest(`/applications/${id}/shortlist`, { method: "POST", token }),
  reject: (id, token) => apiRequest(`/applications/${id}/reject`, { method: "POST", token }),
};

export const assessmentApi = {
  create: (data, token) => apiRequest("/assessments", { method: "POST", body: data, token }),
  update: (id, data, token) => apiRequest(`/assessments/${id}`, { method: "PUT", body: data, token }),
  getByJob: (jobId, token) => apiRequest(`/assessments/job/${jobId}`, { token }),
  getForRecruiter: (id, token) => apiRequest(`/assessments/${id}`, { token }),
  start: (id, token) => apiRequest(`/assessments/${id}/start`, { method: "POST", token }),
  submit: (id, answers, token) =>
    apiRequest(`/assessments/${id}/submit`, { method: "POST", body: { answers }, token }),
};

export const interviewApi = {
  start: (applicationId, token) =>
    apiRequest("/interviews/start", { method: "POST", body: { applicationId }, token }),
  answer: (id, questionId, answerText, token) =>
    apiRequest(`/interviews/${id}/answer`, { method: "POST", body: { questionId, answerText }, token }),
  complete: (id, token) => apiRequest(`/interviews/${id}/complete`, { method: "POST", token }),
  getReport: (id, token) => apiRequest(`/interviews/${id}/report`, { token }),
};

export const intelligenceApi = {
  getForApplication: (applicationId, token) =>
    apiRequest(`/intelligence/application/${applicationId}`, { token }),
};

export const notificationApi = {
  listMine: (token) => apiRequest("/notifications/mine", { token }),
  markAsRead: (id, token) => apiRequest(`/notifications/${id}/read`, { method: "PATCH", token }),
  markAllAsRead: (token) => apiRequest("/notifications/read-all", { method: "PATCH", token }),
};

export const adminApi = {
  listUsers: (token, query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ""}`, { token });
  },
  listCompanies: (token) => apiRequest("/admin/companies", { token }),
  listJobs: (token) => apiRequest("/admin/jobs", { token }),
  setUserStatus: (id, status, token) =>
    apiRequest(`/admin/users/${id}/status`, { method: "PATCH", body: { status }, token }),
  getAnalytics: (token) => apiRequest("/admin/analytics", { token }),
};

export const candidateApi = {
  getMe: (token) => apiRequest("/candidates/me", { token }),
  updateMe: (data, token) => apiRequest("/candidates/me", { method: "PUT", body: data, token }),
};

export const resumeApi = {
  upload: async (file, token) => {
    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch(`${API_URL}/resumes/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    let payload = null;
    try {
      payload = await res.json();
    } catch {
      // No JSON body — payload stays null.
    }

    if (!res.ok) {
      const message = payload?.message || "Upload failed. Please try again.";
      const error = new Error(message);
      error.errorCode = payload?.errorCode || "UNKNOWN_ERROR";
      throw error;
    }

    return payload;
  },
  // XHR-based variant that reports REAL upload progress (fetch has no
  // portable upload-progress event) — used by the drag & drop uploader so
  // the progress bar reflects actual bytes sent, never a fake timer.
  uploadWithProgress: (file, token, onProgress) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("resume", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/resumes/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        let payload = null;
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          // No JSON body — payload stays null.
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload);
        } else {
          const error = new Error(payload?.message || "Upload failed. Please try again.");
          error.errorCode = payload?.errorCode || "UNKNOWN_ERROR";
          reject(error);
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
      xhr.send(formData);
    });
  },
  listMine: (token) => apiRequest("/resumes/mine", { token }),
  getLatest: (token) => apiRequest("/resumes/latest", { token }),
  getById: (id, token) => apiRequest(`/resumes/${id}`, { token }),
};
