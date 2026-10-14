// Secret Admin Portal URL Configuration
// Changing this path changes the URL required to access the admin portal.
// You can also override it via VITE_ADMIN_SECRET_PATH in .env
export const ADMIN_SECRET_PATH = 
  (import.meta.env.VITE_ADMIN_SECRET_PATH || '/portal-access-gateway-path-secure-7f89d3a1c5e4b208').replace(/\/+$/, '');

export const ADMIN_ROUTES = {
  base: ADMIN_SECRET_PATH,
  login: `${ADMIN_SECRET_PATH}/login`,
  dashboard: ADMIN_SECRET_PATH,
  homepageBuilder: `${ADMIN_SECRET_PATH}/homepage-builder`,
  pages: `${ADMIN_SECRET_PATH}/pages`,
  navigation: `${ADMIN_SECRET_PATH}/navigation`,
  announcements: `${ADMIN_SECRET_PATH}/announcements`,
  events: `${ADMIN_SECRET_PATH}/events`,
  priests: `${ADMIN_SECRET_PATH}/priests`,
  history: `${ADMIN_SECRET_PATH}/history`,
  gallery: `${ADMIN_SECRET_PATH}/gallery`,
  media: `${ADMIN_SECRET_PATH}/media`,
  contactSettings: `${ADMIN_SECRET_PATH}/contact-settings`,
  users: `${ADMIN_SECRET_PATH}/users`,
  settings: `${ADMIN_SECRET_PATH}/settings`,
};
