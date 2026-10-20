// Secret Admin Gateway Link Configuration
// This is the secret access gateway URL slug. It MUST be opened to unlock admin access.
export const ADMIN_GATEWAY_SECRET = 
  (import.meta.env.VITE_ADMIN_SECRET_PATH || '/portal-access-gateway-path-secure-7f89d3a1c5e4b208').replace(/\/+$/, '');

// Clean admin base path: shown in the address bar once unlocked via the secret link.
export const ADMIN_BASE_PATH = '/admin';

// Backward compatibility alias for any existing imports
export const ADMIN_SECRET_PATH = ADMIN_BASE_PATH;

export const ADMIN_ROUTES = {
  gateway: ADMIN_GATEWAY_SECRET,
  base: ADMIN_BASE_PATH,
  login: `${ADMIN_BASE_PATH}/login`,
  dashboard: ADMIN_BASE_PATH,
  homepageBuilder: `${ADMIN_BASE_PATH}/homepage-builder`,
  pages: `${ADMIN_BASE_PATH}/pages`,
  navigation: `${ADMIN_BASE_PATH}/navigation`,
  announcements: `${ADMIN_BASE_PATH}/announcements`,
  events: `${ADMIN_BASE_PATH}/events`,
  priests: `${ADMIN_BASE_PATH}/priests`,
  ministries: `${ADMIN_BASE_PATH}/ministries`,
  history: `${ADMIN_BASE_PATH}/history`,
  gallery: `${ADMIN_BASE_PATH}/gallery`,
  media: `${ADMIN_BASE_PATH}/media`,
  contactSettings: `${ADMIN_BASE_PATH}/contact-settings`,
  users: `${ADMIN_BASE_PATH}/users`,
  aiResponses: `${ADMIN_BASE_PATH}/ai-responses`,
  settings: `${ADMIN_BASE_PATH}/settings`,
  preview: `${ADMIN_BASE_PATH}/preview`,
};

export const GATEWAY_STORAGE_KEY = 'path_portal_unlocked';

export const unlockAdminGateway = () => {
  try {
    sessionStorage.setItem(GATEWAY_STORAGE_KEY, 'true');
  } catch (e) {
    // Ignore storage errors in restricted iframe/private mode
  }
};

export const lockAdminGateway = () => {
  try {
    sessionStorage.removeItem(GATEWAY_STORAGE_KEY);
  } catch (e) {
    // Ignore storage errors
  }
};

export const isAdminGatewayUnlocked = () => {
  try {
    const isUnlocked = sessionStorage.getItem(GATEWAY_STORAGE_KEY) === 'true';
    const hasToken = !!localStorage.getItem('path_admin_token');
    return isUnlocked || hasToken;
  } catch (e) {
    return false;
  }
};
