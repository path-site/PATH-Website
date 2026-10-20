import { ADMIN_ROUTES } from './adminConfig';

export const MAINTENANCE_SECTIONS = [
  {
    id: 'homepage',
    routeKey: 'homepageBuilder',
    adminPath: ADMIN_ROUTES.homepageBuilder,
    label: 'Homepage Builder',
    shortLabel: 'Homepage',
    settingKey: 'maintenance_homepage',
    publicPath: '/',
    defaultBadge: 'Website Updates in Progress',
    defaultTitle: 'Parish Homepage is Undergoing Maintenance',
    defaultDesc: 'Our parish digital team is currently updating homepage sections, announcements, and featured schedules. Regular parish services and sacraments proceed as scheduled.',
    iconName: 'LayoutTemplate',
  },
  {
    id: 'pages',
    routeKey: 'pages',
    adminPath: ADMIN_ROUTES.pages,
    label: 'Pages',
    shortLabel: 'Pages',
    settingKey: 'maintenance_pages',
    publicPath: '/',
    defaultBadge: 'Page Revisions in Progress',
    defaultTitle: 'Parish Pages are Undergoing Maintenance',
    defaultDesc: 'Custom parish documentation and informational pages are currently being refreshed by the parish office.',
    iconName: 'FileText',
  },
  {
    id: 'navigation',
    routeKey: 'navigation',
    adminPath: ADMIN_ROUTES.navigation,
    label: 'Navigation',
    shortLabel: 'Navigation',
    settingKey: 'maintenance_navigation',
    publicPath: '/',
    defaultBadge: 'Navigation Updates',
    defaultTitle: 'Site Navigation is Being Updated',
    defaultDesc: 'Parish site links and menu hierarchies are undergoing scheduled reorganization.',
    iconName: 'Menu',
  },
  {
    id: 'announcements',
    routeKey: 'announcements',
    adminPath: ADMIN_ROUTES.announcements,
    label: 'Announcements',
    shortLabel: 'Announcements',
    settingKey: 'maintenance_announcements',
    publicPath: '/announcements',
    defaultBadge: 'Bulletin Updating',
    defaultTitle: 'Parish Announcements are Undergoing Maintenance',
    defaultDesc: 'The parish editorial team is currently updating parish notices, bulletins, and pastoral announcements.',
    iconName: 'Bell',
  },
  {
    id: 'events',
    routeKey: 'events',
    adminPath: ADMIN_ROUTES.events,
    label: 'Events',
    shortLabel: 'Events',
    settingKey: 'maintenance_events',
    publicPath: '/events',
    defaultBadge: 'Calendar Scheduling',
    defaultTitle: 'Parish Events Calendar is Undergoing Maintenance',
    defaultDesc: 'Liturgical schedules, feast day calendars, and parish events are currently being synchronized.',
    iconName: 'Calendar',
  },
  {
    id: 'priests',
    routeKey: 'priests',
    adminPath: ADMIN_ROUTES.priests,
    label: 'Priests',
    shortLabel: 'Priests',
    settingKey: 'maintenance_priests',
    publicPath: '/about/priests',
    defaultBadge: 'Roster Updates in Progress',
    defaultTitle: 'Clergy Directory is Undergoing Maintenance',
    defaultDesc: 'The parish clergy directory and priestly assignments are currently being reviewed and updated. Regular mass schedules, sacraments, and office hours remain active.',
    iconName: 'Users',
  },
  {
    id: 'ministries',
    routeKey: 'ministries',
    adminPath: ADMIN_ROUTES.ministries,
    label: 'Ministries',
    shortLabel: 'Ministries',
    settingKey: 'maintenance_ministries',
    legacyKey: 'ministries_banner_enabled',
    publicPath: '/ministries',
    defaultBadge: 'Section Under Preparation',
    defaultTitle: 'Ministries Directory is Currently in the Making',
    defaultDesc: 'We are currently compiling and updating the complete directory of parish ministries, apostolic movements, coordinators, and schedules. The finalized directory and online sign-up details will be published here soon.',
    iconName: 'HeartHandshake',
  },
  {
    id: 'history',
    routeKey: 'history',
    adminPath: ADMIN_ROUTES.history,
    label: 'Church History',
    shortLabel: 'Church History',
    settingKey: 'maintenance_history',
    publicPath: '/about/history',
    defaultBadge: 'Historical Archives Updating',
    defaultTitle: 'Parish Archives & Church History are Being Updated',
    defaultDesc: 'Parish historical milestones and archival records are currently being compiled and updated for the parish community.',
    iconName: 'History',
  },
  {
    id: 'aiResponses',
    routeKey: 'aiResponses',
    adminPath: ADMIN_ROUTES.aiResponses,
    label: 'AI Responses',
    shortLabel: 'AI Responses',
    settingKey: 'maintenance_ai',
    publicPath: '/',
    defaultBadge: 'Assistant Updating',
    defaultTitle: 'Parish AI Virtual Assistant is in Maintenance',
    defaultDesc: 'The virtual assistant knowledge base and seasonal prompts are currently undergoing pastoral review.',
    iconName: 'Bot',
  },
  {
    id: 'gallery',
    routeKey: 'gallery',
    adminPath: ADMIN_ROUTES.gallery,
    label: 'Gallery',
    shortLabel: 'Gallery',
    settingKey: 'maintenance_gallery',
    publicPath: '/gallery',
    defaultBadge: 'Curating Photo Albums',
    defaultTitle: 'Photo Gallery is Undergoing Maintenance',
    defaultDesc: 'Our media team is curating liturgical photo albums, feast day memories, and parish event photos.',
    iconName: 'Image',
  },
  {
    id: 'media',
    routeKey: 'media',
    adminPath: ADMIN_ROUTES.media,
    label: 'Media Library',
    shortLabel: 'Media Library',
    settingKey: 'maintenance_media',
    publicPath: '/',
    defaultBadge: 'Storage Maintenance',
    defaultTitle: 'Media Asset Storage is Being Organized',
    defaultDesc: 'Parish media assets and files are undergoing routine cataloging and organization.',
    iconName: 'HardDrive',
  },
  {
    id: 'contactSettings',
    routeKey: 'contactSettings',
    adminPath: ADMIN_ROUTES.contactSettings,
    label: 'Contact Settings',
    shortLabel: 'Contact Settings',
    settingKey: 'maintenance_contact',
    publicPath: '/contact',
    defaultBadge: 'Directory Updating',
    defaultTitle: 'Parish Office Contact Directory is Being Updated',
    defaultDesc: 'Parish office contact channels and office hour schedules are currently being revised.',
    iconName: 'PhoneCall',
  },
];

export const getSectionByPath = (pathname) => {
  if (!pathname) return null;
  return MAINTENANCE_SECTIONS.find((sec) => pathname.startsWith(sec.adminPath)) || null;
};

export const getSectionById = (id) => {
  return MAINTENANCE_SECTIONS.find((sec) => sec.id === id) || null;
};

export const OVERALL_MAINTENANCE_DEFAULTS = {
  settingKey: 'maintenance_overall',
  defaultBadge: 'Scheduled System-Wide Maintenance',
  defaultTitle: 'Parish Digital Portal is Undergoing Scheduled Maintenance',
  defaultDesc: 'Our parish digital team is currently performing essential system-wide updates, security enhancements, and pastoral content refreshes. Sacramental celebrations, regular Mass schedules, confessions, and parish office operations remain fully active.',
  defaultAdvisory: 'Mass celebrations, Sacraments, and Parish Office operations proceed as scheduled.',
};

export const ADMIN_PREVIEW_MODE_KEY = 'path_admin_preview_active';
export const ADMIN_PREVIEW_SIMULATE_KEY = 'path_admin_preview_simulate_public';

export const isAdminPreviewAllowed = () => {
  if (typeof window === 'undefined') return false;
  try {
    const hasToken = !!localStorage.getItem('path_admin_token');
    const isGateway = sessionStorage.getItem('path_portal_unlocked') === 'true';
    return hasToken || isGateway;
  } catch (e) {
    return false;
  }
};

export const isAdminPreviewMode = () => {
  if (typeof window === 'undefined') return false;
  if (!isAdminPreviewAllowed()) return false;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get('admin_preview') === '1' ||
      searchParams.get('admin_preview') === 'true' ||
      searchParams.get('preview') === 'admin' ||
      searchParams.get('preview') === 'true'
    ) {
      return true;
    }
    if (sessionStorage.getItem(ADMIN_PREVIEW_MODE_KEY) === 'true') {
      return true;
    }
    if (
      window.location.pathname === '/preview' ||
      window.location.pathname.startsWith('/preview/') ||
      window.location.pathname.startsWith('/admin/preview')
    ) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const isBypassMaintenance = () => {
  if (!isAdminPreviewMode()) return false;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('simulate_public') === 'true' || searchParams.get('simulate_public') === '1') {
      return false;
    }
    const isSimulating = sessionStorage.getItem(ADMIN_PREVIEW_SIMULATE_KEY) === 'true';
    return !isSimulating;
  } catch (e) {
    return true;
  }
};

export const enableAdminPreviewMode = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ADMIN_PREVIEW_MODE_KEY, 'true');
    sessionStorage.removeItem(ADMIN_PREVIEW_SIMULATE_KEY);
  } catch (e) {}
};

export const disableAdminPreviewMode = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_PREVIEW_MODE_KEY);
    sessionStorage.removeItem(ADMIN_PREVIEW_SIMULATE_KEY);
  } catch (e) {}
};

export const setAdminPreviewSimulatePublic = (simulate) => {
  if (typeof window === 'undefined') return;
  try {
    if (simulate) {
      sessionStorage.setItem(ADMIN_PREVIEW_SIMULATE_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_PREVIEW_SIMULATE_KEY);
    }
  } catch (e) {}
};

/**
 * Resolves any public site path to its corresponding protected Admin Preview URL.
 * e.g. '/' -> '/admin/preview'
 *      '/ministries' -> '/admin/preview/ministries'
 *      '/events' -> '/admin/preview/events'
 */
export const resolvePreviewPath = (path) => {
  if (!path) return '/admin/preview';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path;
  }
  if (path.startsWith('/admin/preview')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') {
    return '/admin/preview';
  }
  return `/admin/preview${clean}`;
};

// Raw check without admin preview bypass (used by Admin CMS dashboards, toggle bars, and settings)
export const getRawOverallMaintenance = (settings) => {
  if (!settings) return false;
  const val = settings.maintenance_overall;
  return val !== undefined && (String(val) === 'true' || val === true || val === '1');
};

export const getRawSectionMaintenance = (section, settings) => {
  if (!settings) return false;
  if (getRawOverallMaintenance(settings)) {
    return true;
  }
  if (!section) return false;
  const sec = typeof section === 'string' ? getSectionById(section) : section;
  if (!sec) return false;

  const val = settings[sec.settingKey];
  if (val !== undefined && (String(val) === 'true' || val === true || val === '1')) {
    return true;
  }

  if (sec.legacyKey) {
    const legacyVal = settings[sec.legacyKey];
    if (legacyVal !== undefined && (String(legacyVal) === 'true' || legacyVal === true || legacyVal === '1')) {
      return true;
    }
  }

  return false;
};

// Public & Runtime Maintenance Checks: Bypassed automatically when viewing as an authenticated admin in Preview Mode
export const isOverallMaintenance = (settings, options = {}) => {
  const checkBypass = options?.checkBypass !== false;
  if (checkBypass && isBypassMaintenance()) {
    return false;
  }
  return getRawOverallMaintenance(settings);
};

export const isSectionUnderMaintenance = (section, settings, options = {}) => {
  const checkBypass = options?.checkBypass !== false;
  if (checkBypass && isBypassMaintenance()) {
    return false;
  }

  if (isOverallMaintenance(settings, options)) {
    return true;
  }

  if (!section) return false;
  const sec = typeof section === 'string' ? getSectionById(section) : section;
  if (!sec) return false;

  const val = settings[sec.settingKey];
  if (val !== undefined && (String(val) === 'true' || val === true || val === '1')) {
    return true;
  }

  if (sec.legacyKey) {
    const legacyVal = settings[sec.legacyKey];
    if (legacyVal !== undefined && (String(legacyVal) === 'true' || legacyVal === true || legacyVal === '1')) {
      return true;
    }
  }

  return false;
};

