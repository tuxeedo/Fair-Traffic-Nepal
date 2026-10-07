import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', res.data.access);
          if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }

    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  login: (data) => api.post('/accounts/login/', data),
  register: (data) => api.post('/accounts/register/', data),
  verifyIdentity: (data) => api.post('/accounts/verify-identity/', data),
  getProfile: () => api.get('/accounts/profile/'),

  updateProfile: (data) => {
    if (data instanceof FormData) {
      return api.patch('/accounts/profile/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.patch('/accounts/profile/', data);
  },
  changePassword: (data) => api.post('/accounts/change-password/', data),
};

// ─── Corrections ───
export const correctionsAPI = {
  myCorrections: () => api.get('/accounts/corrections/'),
  allCorrections: (params) => api.get('/accounts/corrections/', { params }),
  requestCorrection: (data) => {
    if (data instanceof FormData) {
      return api.post('/accounts/corrections/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/accounts/corrections/', data);
  },
  reviewCorrection: (id, data) => api.post(`/accounts/corrections/${id}/review/`, data),
};


// ─── Users (Admin) ───
export const usersAPI = {
  list: (params) => api.get('/accounts/users/', { params }),
  detail: (id) => api.get(`/accounts/users/${id}/`),
  update: (id, data) => api.patch(`/accounts/users/${id}/`, data),
  deactivate: (id) => api.delete(`/accounts/users/${id}/`),
  officers: (params) => api.get('/accounts/officers/', { params }),
  createOfficer: (data) => api.post('/accounts/officers/', data),
  searchDrivers: (params) => api.get('/accounts/drivers/search/', { params }),
};

// ─── Vehicles ───
export const vehiclesAPI = {
  myVehicles: () => api.get('/vehicles/my/'),
  addVehicle: (data) => api.post('/vehicles/my/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateVehicle: (id, data) => api.patch(`/vehicles/my/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteVehicle: (id) => api.delete(`/vehicles/my/${id}/`),
  search: (params) => api.get('/vehicles/search/', { params }),
  byOwner: (ownerId) => api.get(`/vehicles/owner/${ownerId}/`),
  
  // Admin Endpoints
  pendingVerifications: () => api.get('/vehicles/admin/verifications/'),
  approveVerification: (id) => api.post(`/vehicles/admin/verifications/${id}/approve/`),
  rejectVerification: (id) => api.post(`/vehicles/admin/verifications/${id}/reject/`),
  requestInfoVerification: (id) => api.post(`/vehicles/admin/verifications/${id}/request-info/`),
};

// ─── Violations ───
export const violationsAPI = {
  types: () => api.get('/violations/types/'),
  rules: () => api.get('/violations/rules/'),
  createRule: (data) => api.post('/violations/rules/', data),
  updateRule: (id, data) => api.patch(`/violations/rules/${id}/`, data),
  deleteRule: (id) => api.delete(`/violations/rules/${id}/`),
  preview: (data) => api.post('/violations/preview/', data),
  record: (data) => api.post('/violations/record/', data),
  my: (params) => api.get('/violations/my/', { params }),
  all: (params) => api.get('/violations/all/', { params }),
  detail: (id) => api.get(`/violations/${id}/`),
  driverViolations: (driverId) => api.get(`/violations/driver/${driverId}/`),
  pay: (id, data) => api.post(`/violations/${id}/pay/`, data),
  myWarnings: () => api.get('/violations/warnings/my/'),
  acknowledgeWarning: (id) => api.post(`/violations/warnings/${id}/acknowledge/`),
  mySafetyScore: () => api.get('/violations/safety-score/my/'),
  mySafetyHistory: () => api.get('/violations/safety-score/my/history/'),
  driverSafetyScore: (id) => api.get(`/violations/safety-score/driver/${id}/`),
};

// ─── Evidence ───
export const evidenceAPI = {
  forViolation: (violationId) => api.get(`/evidence/violation/${violationId}/`),
  uploadOfficer: (data) => api.post('/evidence/upload/officer/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadCitizen: (data) => api.post('/evidence/upload/citizen/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/evidence/${id}/delete/`),
};

// ─── Appeals ───
export const appealsAPI = {
  submit: (data) => api.post('/appeals/submit/', data),
  my: (params) => api.get('/appeals/my/', { params }),
  all: (params) => api.get('/appeals/all/', { params }),
  detail: (id) => api.get(`/appeals/${id}/`),
  review: (id, data) => api.post(`/appeals/${id}/review/`, data),
};

// ─── Complaints ───
export const complaintsAPI = {
  submit: (data) => api.post('/appeals/complaints/submit/', data),
  my: (params) => api.get('/appeals/complaints/my/', { params }),
  all: (params) => api.get('/appeals/complaints/all/', { params }),
  detail: (id) => api.get(`/appeals/complaints/${id}/`),
  review: (id, data) => api.post(`/appeals/complaints/${id}/review/`, data),
};

// ─── Reports ───
export const reportsAPI = {
  submit: (data) => api.post('/reports/submit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  my: (params) => api.get('/reports/my/', { params }),
  all: (params) => api.get('/reports/all/', { params }),
  detail: (id) => api.get(`/reports/${id}/`),
  review: (id, data) => api.post(`/reports/${id}/review/`, data),
};

// ─── Locations ───
export const locationsAPI = {
  map: (params) => api.get('/locations/map/', { params }),
  create: (data) => api.post('/locations/create/', data),
  update: (id, data) => api.patch(`/locations/${id}/`, data),
  delete: (id) => api.delete(`/locations/${id}/`),
  all: (params) => api.get('/locations/all/', { params }),
};

// ─── Notifications ───
export const notificationsAPI = {
  my: (params) => api.get('/notifications/my/', { params }),
  unreadCount: () => api.get('/notifications/unread-count/'),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
};

// ─── Analytics ───
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard/'),
  dailyViolations: (params) => api.get('/analytics/daily-violations/', { params }),
  monthlyViolations: (params) => api.get('/analytics/monthly-violations/', { params }),
  violationsByType: () => api.get('/analytics/violations-by-type/'),
  topOffenders: (params) => api.get('/analytics/top-offenders/', { params }),
  heatmap: () => api.get('/analytics/heatmap/'),
  officerPerformance: () => api.get('/analytics/officer-performance/'),
  appealStats: () => api.get('/analytics/appeal-stats/'),
  reportStats: () => api.get('/analytics/report-stats/'),
};

// ─── Community Service ───
export const communityServiceAPI = {
  myService: () => api.get('/violations/community-service/my/'),
  allService: (params) => api.get('/violations/community-service/all/', { params }),
  create: (data) => api.post('/violations/community-service/create/', data),
  update: (id, data) => api.patch(`/violations/community-service/${id}/`, data),
};

// ─── Audit ───
export const auditAPI = {
  logs: (params) => api.get('/audit/logs/', { params }),
};

export default api;
