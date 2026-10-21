/**
 * In-memory and Session Cache for Parish Homepage Sections.
 * Eliminates loading spinners, blank screens, and layout flashes when navigating back to Home.
 * Supports stale-while-revalidate background sync and admin cache invalidation.
 */

const CACHE_STORAGE_KEY = 'path_home_sections_cache_v2';
const CACHE_TIMESTAMP_KEY = 'path_home_sections_time_v2';
const CACHE_MAX_AGE_MS = 1000 * 60 * 15; // 15 minutes soft freshness

let memoryHomeSections = null;
let memoryFetchPromise = null;

export const DEFAULT_HOME_SECTIONS = [
  {
    id: 'default-hero',
    sectionType: 'HERO_SLIDESHOW',
    isVisible: true,
    displayOrder: 0,
    contentJson: JSON.stringify({
      slides: [
        {
          imageUrl: '',
          title: 'Welcome to the Parish of the Alliance of the Two Hearts',
          description: 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary.',
          buttonText: 'Learn More',
          buttonLink: '/about/mission-vision',
          overlayOpacity: 0.45
        }
      ],
      autoplay: true,
      intervalSeconds: 6
    })
  },
  {
    id: 'default-welcome',
    sectionType: 'WELCOME',
    isVisible: true,
    displayOrder: 1,
    contentJson: JSON.stringify({
      heading: 'A Sanctuary of Faith, Hope, and Love',
      welcomeMessage: 'Welcome to our parish family! We are honored to accompany you on your spiritual journey.',
      supportingDescription: 'The Parish of the Alliance of the Two Hearts is dedicated to fostering deep prayer life, reverent sacramental worship, and compassionate outreach to all parishioners and seekers.',
      imageUrl: '',
      buttonText: 'About Our Parish',
      buttonLink: '/about/mission-vision',
      layout: 'centered'
    })
  },
  {
    id: 'default-announcements',
    sectionType: 'ANNOUNCEMENT_CARDS',
    isVisible: true,
    displayOrder: 2,
    contentJson: JSON.stringify({
      heading: 'Official Parish Announcements',
      subheading: 'Stay informed on liturgical celebrations, pastoral advisories, and community news.',
      maxItems: 3,
      showViewAll: true
    })
  },
  {
    id: 'default-events',
    sectionType: 'EVENT_CARDS',
    isVisible: true,
    displayOrder: 3,
    contentJson: JSON.stringify({
      heading: 'Upcoming Parish Activities',
      subheading: 'Mark your calendar and participate in our communal devotions, seminars, and parish celebrations.',
      maxItems: 3,
      showViewAll: true
    })
  },
  {
    id: 'default-contact',
    sectionType: 'CONTACT_SECTION',
    isVisible: true,
    displayOrder: 4,
    contentJson: JSON.stringify({})
  }
];

/**
 * Retrieve cached home sections synchronously.
 * Checks memory cache first, then sessionStorage.
 */
export const getCachedHomeSections = () => {
  if (Array.isArray(memoryHomeSections) && memoryHomeSections.length > 0) {
    return memoryHomeSections;
  }

  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryHomeSections = parsed;
      return parsed;
    }
  } catch (e) {
    console.warn('[HomeCache] Failed to parse cached sections:', e);
  }

  return null;
};

/**
 * Store sections in memory and sessionStorage.
 */
export const setCachedHomeSections = (sections) => {
  if (!Array.isArray(sections)) return;

  memoryHomeSections = sections;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(sections));
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('[HomeCache] Storage write error:', e);
    }
  }
};

/**
 * Clear cached sections (used when admin saves changes in HomepageBuilder).
 */
export const clearHomeCache = () => {
  memoryHomeSections = null;
  memoryFetchPromise = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CACHE_STORAGE_KEY);
      sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Check if valid cache exists to render instantly.
 */
export const hasCachedHomeSections = () => {
  return getCachedHomeSections() !== null;
};

/**
 * Notify all listening components that home sections were modified.
 */
export const notifyHomeCacheInvalidated = () => {
  clearHomeCache();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('path:home-cache-invalidated'));
  }
};
