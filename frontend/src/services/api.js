import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await client.post('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await client.post('/api/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await client.get('/api/auth/me');
    return res.data;
  },
  updateMe: async (userData) => {
    const res = await client.put('/api/auth/me', userData);
    return res.data;
  },

  // Locations & Crops
  getStates: async () => {
    const res = await client.get('/api/locations/states');
    return res.data;
  },
  getDistricts: async (state = 'Tamil Nadu') => {
    const res = await client.get(`/api/locations/districts/${encodeURIComponent(state)}`);
    return res.data;
  },
  getBlocks: async (district) => {
    const res = await client.get(`/api/locations/blocks/${encodeURIComponent(district)}`);
    return res.data;
  },
  getPanchayats: async (block) => {
    const res = await client.get(`/api/locations/panchayats/${encodeURIComponent(block)}`);
    return res.data;
  },
  getAllLocations: async () => {
    const res = await client.get('/api/locations/all');
    return res.data;
  },
  getCrops: async () => {
    const res = await client.get('/api/crops');
    return res.data;
  },

  // Weather & Teleconnections
  getCurrentWeather: async (locationId) => {
    const res = await client.get(`/api/weather/current/${locationId}`);
    return res.data;
  },
  getWeatherHistory: async (locationId) => {
    const res = await client.get(`/api/weather/history/${locationId}`);
    return res.data;
  },
  getClimateIndices: async () => {
    const res = await client.get('/api/climate/indices');
    return res.data;
  },

  // Predictions & Risk
  getPredictionSummary: async (locationId) => {
    const res = await client.get(`/api/predictions/summary/${locationId}`);
    return res.data;
  },
  get30DayPrediction: async (locationId) => {
    const res = await client.get(`/api/predictions/${locationId}`);
    return res.data;
  },
  getRiskMap: async () => {
    const res = await client.get('/api/risk-map');
    return res.data;
  },

  // Advisories
  getAdvisory: async (locationId, cropId = 1) => {
    const res = await client.get(`/api/advisories/${locationId}?crop_id=${cropId}`);
    return res.data;
  },
  generateAdvisory: async (locationId, cropId = 1) => {
    const res = await client.post('/api/advisories/generate', { location_id: locationId, crop_id: cropId });
    return res.data;
  },
  getSowingWindow: async (locationId, cropId = 1) => {
    const res = await client.get(`/api/advisories/sowing-window/${locationId}?crop_id=${cropId}`);
    return res.data;
  },

  // Alerts
  getAlerts: async () => {
    const res = await client.get('/api/alerts');
    return res.data;
  },
  sendAlert: async (alertData) => {
    const res = await client.post('/api/alerts/send', alertData);
    return res.data;
  },
  dismissAlert: async (alertId) => {
    const res = await client.post(`/api/alerts/dismiss/${alertId}`);
    return res.data;
  },
  getAlertHistory: async () => {
    const res = await client.get('/api/alerts/history');
    return res.data;
  },

  // Dashboards
  getFarmerDashboard: async (locationId = 1, cropId = 1) => {
    const res = await client.get(`/api/dashboard/farmer?location_id=${locationId}&crop_id=${cropId}`);
    return res.data;
  },
  getOfficerDashboard: async (district = null, cropId = null) => {
    let url = '/api/dashboard/officer';
    const params = [];
    if (district) params.push(`district=${encodeURIComponent(district)}`);
    if (cropId) params.push(`crop_id=${cropId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await client.get(url);
    return res.data;
  },
  getAdminDashboard: async () => {
    const res = await client.get('/api/dashboard/admin');
    return res.data;
  }
};

export default api;
