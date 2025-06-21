import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock authentication headers (in real app, this would come from login)
const mockAuthHeaders = {
  'Authorization': 'Bearer netrunnerX',
};

// Add auth headers to requests
api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...mockAuthHeaders };
  return config;
});

// API endpoints
export const disasterAPI = {
  // Get all disasters
  getDisasters: (tag) => api.get('/disasters', { params: { tag } }),
  
  // Create new disaster
  createDisaster: (data) => api.post('/disasters', data),
  
  // Update disaster
  updateDisaster: (id, data) => api.put(`/disasters/${id}`, data),
  
  // Delete disaster
  deleteDisaster: (id) => api.delete(`/disasters/${id}`),
  
  // Get social media reports for a disaster
  getSocialMedia: (id) => api.get(`/disasters/${id}/social-media`),
  
  // Get resources for a disaster
  getResources: (id, lat, lon, radius = 10) => 
    api.get(`/disasters/${id}/resources`, { 
      params: { lat, lon, radius } 
    }),
  
  // Get official updates for a disaster
  getOfficialUpdates: (id) => api.get(`/disasters/${id}/official-updates`),
  
  // Verify image for a disaster
  verifyImage: (id, imageUrl) => 
    api.post(`/disasters/${id}/verify-image`, { image_url: imageUrl }),
  
  // Get a single disaster
  getDisasterById: (id) => api.get(`/disasters/${id}`),
};

export const geocodeAPI = {
  // Geocode a description
  geocode: (description) => api.post('/geocode', { description }),
};

export const resourceAPI = {
  // Create new resource
  createResource: (data) => api.post('/resources', data),
  
  // Get resources for a disaster
  getResources: (disasterId, lat, lon, radius = 10) => 
    api.get(`/resources/disaster/${disasterId}`, { 
      params: { lat, lon, radius } 
    }),
  
  // Update resource
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  
  // Delete resource
  deleteResource: (id) => api.delete(`/resources/${id}`),
  
  // Get resources by type
  getResourcesByType: (disasterId, type, lat, lon, radius = 10) => 
    api.get(`/resources/disaster/${disasterId}/type`, { 
      params: { type, lat, lon, radius } 
    }),
};

export const reportAPI = {
  // Create new report
  createReport: (data) => api.post('/reports', data),
  
  // Get reports for a disaster
  getReports: (disasterId, filters = {}) => 
    disasterId ? api.get(`/reports/disaster/${disasterId}`, { params: filters }) : api.get('/reports', { params: filters }),
  
  // Get all reports
  getAllReports: (filters = {}) => api.get('/reports', { params: filters }),
  
  // Get single report
  getReport: (id) => api.get(`/reports/${id}`),
  
  // Update report
  updateReport: (id, data) => api.put(`/reports/${id}`, data),
  
  // Delete report
  deleteReport: (id) => api.delete(`/reports/${id}`),
  
  // Verify/reject report
  verifyReport: (id, data) => api.patch(`/reports/${id}/verify`, data),
  
  // Get report statistics
  getReportStats: (disasterId) => api.get(`/reports/disaster/${disasterId}/stats`),
};

export default api; 