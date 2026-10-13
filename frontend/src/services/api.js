import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
let baseURL = '/api';
if (rawBaseUrl) {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token for admin endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('path_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      if (!window.location.pathname.includes('/admin/login')) {
        localStorage.removeItem('path_admin_token');
        localStorage.removeItem('path_admin_user');
        window.location.href = '/admin/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Public API
export const publicApi = {
  getNavigation: () => api.get('/public/navigation'),
  getPage: (slug) => api.get(`/public/pages/${slug}`),
  getAnnouncements: (category, search) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return api.get(`/public/announcements?${params.toString()}`);
  },
  getAnnouncement: (slug) => api.get(`/public/announcements/${slug}`),
  getEvents: () => api.get('/public/events'),
  getEvent: (slug) => api.get(`/public/events/${slug}`),
  getPriests: () => api.get('/public/priests'),
  getHistory: () => api.get('/public/history'),
  getGallery: () => api.get('/public/gallery'),
  getSettings: () => api.get('/public/settings'),
  submitContact: (data) => api.post('/public/contact', data),
};

// Admin API
export const adminApi = {
  login: (credentials) => api.post('/admin/auth/login', credentials),
  getMe: () => api.get('/admin/auth/me'),

  // Pages & Homepage Builder
  getPages: () => api.get('/admin/pages'),
  getPage: (id) => api.get(`/admin/pages/${id}`),
  createPage: (page) => api.post('/admin/pages', page),
  updatePage: (id, page) => api.put(`/admin/pages/${id}`, page),
  publishPage: (id) => api.post(`/admin/pages/${id}/publish`),
  unpublishPage: (id) => api.post(`/admin/pages/${id}/unpublish`),
  deletePage: (id) => api.delete(`/admin/pages/${id}`),

  // Page Sections
  getPageSections: (pageId) => api.get(`/admin/pages/${pageId}/sections`),
  addSection: (pageId, section) => api.post(`/admin/pages/${pageId}/sections`, section),
  updateSection: (sectionId, section) => api.put(`/admin/sections/${sectionId}`, section),
  deleteSection: (sectionId) => api.delete(`/admin/sections/${sectionId}`),
  duplicateSection: (sectionId) => api.post(`/admin/sections/${sectionId}/duplicate`),
  reorderSections: (items) => api.post('/admin/sections/reorder', items),

  // Navigation
  getNavigation: () => api.get('/admin/navigation'),
  createNavigationItem: (item) => api.post('/admin/navigation', item),
  updateNavigationItem: (id, item) => api.put(`/admin/navigation/${id}`, item),
  deleteNavigationItem: (id) => api.delete(`/admin/navigation/${id}`),
  reorderNavigation: (items) => api.post('/admin/navigation/reorder', items),

  // Announcements
  getAnnouncements: () => api.get('/admin/announcements'),
  getAnnouncement: (id) => api.get(`/admin/announcements/${id}`),
  createAnnouncement: (ann) => api.post('/admin/announcements', ann),
  updateAnnouncement: (id, ann) => api.put(`/admin/announcements/${id}`, ann),
  publishAnnouncement: (id) => api.post(`/admin/announcements/${id}/publish`),
  publishBatchAnnouncements: (ids) => api.post('/admin/announcements/publish-batch', ids),
  unpublishAnnouncement: (id) => api.post(`/admin/announcements/${id}/unpublish`),
  archiveAnnouncement: (id) => api.post(`/admin/announcements/${id}/archive`),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),

  // Events
  getEvents: () => api.get('/admin/events'),
  getEvent: (id) => api.get(`/admin/events/${id}`),
  createEvent: (evt) => api.post('/admin/events', evt),
  updateEvent: (id, evt) => api.put(`/admin/events/${id}`, evt),
  publishEvent: (id) => api.post(`/admin/events/${id}/publish`),
  unpublishEvent: (id) => api.post(`/admin/events/${id}/unpublish`),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  // Priests
  getPriests: () => api.get('/admin/priests'),
  createPriest: (priest) => api.post('/admin/priests', priest),
  updatePriest: (id, priest) => api.put(`/admin/priests/${id}`, priest),
  deletePriest: (id) => api.delete(`/admin/priests/${id}`),
  reorderPriests: (items) => api.post('/admin/priests/reorder', items),

  // History
  getHistory: () => api.get('/admin/history'),
  createMilestone: (milestone) => api.post('/admin/history', milestone),
  updateMilestone: (id, milestone) => api.put(`/admin/history/${id}`, milestone),
  deleteMilestone: (id) => api.delete(`/admin/history/${id}`),
  reorderHistory: (items) => api.post('/admin/history/reorder', items),

  // Gallery
  getAlbums: () => api.get('/admin/gallery/albums'),
  createAlbum: (album) => api.post('/admin/gallery/albums', album),
  updateAlbum: (id, album) => api.put(`/admin/gallery/albums/${id}`, album),
  deleteAlbum: (id) => api.delete(`/admin/gallery/albums/${id}`),
  getAlbumImages: (albumId) => api.get(`/admin/gallery/albums/${albumId}/images`),
  addAlbumImage: (albumId, img) => api.post(`/admin/gallery/albums/${albumId}/images`, img),
  updateAlbumImage: (id, img) => api.put(`/admin/gallery/images/${id}`, img),
  deleteAlbumImage: (id) => api.delete(`/admin/gallery/images/${id}`),

  // Media Library
  getMedia: (search) => api.get(`/admin/media${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  uploadMedia: (formData) => api.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),

  // Site Settings
  getSettings: () => api.get('/admin/settings'),
  saveSettings: (settings) => api.post('/admin/settings', settings),

  // Users
  getUsers: () => api.get('/admin/users'),
  createUser: (user) => api.post('/admin/users', user),
  updateUser: (id, user) => api.put(`/admin/users/${id}`, user),
};

export default api;
