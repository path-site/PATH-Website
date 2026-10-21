import React, { createContext, useContext, useState, useEffect } from 'react';
import { publicApi } from '../services/api';

// Brand Theme & Liturgical Tokens - Set Strictly Through Code Only
export const BRAND_THEME = {
  primary_color: '#C59B3F', // Liturgical Antique Gold
  secondary_color: '#0B3B95', // Marian Deep Blue
  accent_color: '#A81B2B', // Sacred Heart Red
  background_ivory: '#F7F4EB', // Ecclesiastical Warm Ivory / Parchment
  text_bronze: '#1C1814', // Roman Bronze Text
  font_heading: 'Cinzel',
  font_body: 'Plus Jakarta Sans',
  logo_url: '/logo.png',
};

export const SETTINGS_CACHE_KEY = 'path_site_settings_cache';
export const MAINTENANCE_OVERALL_KEY = 'path_maintenance_overall';

const DEFAULT_SETTINGS = {
  site_name: 'Parish of the Alliance of the Two Hearts',
  site_short_name: 'PATH',
  tagline: 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary',
  ...BRAND_THEME,
  address: 'J. Fortich St., Banawa, Cebu City, Philippines',
  phone: '(032) 255 3241 | 0942 361 3174',
  email: 'pathbanawa1988@gmail.com',
  office_hours: 'Monday – Sunday: 8:00 AM – 12:00 NN, 1:00 PM – 5:00 PM',
  mass_schedules: 'Monday – Friday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n12:15 PM [English]\n5:00 PM [Cebuano] (Every Monday at the Columbary)\n6:00 PM [English] 🔴 LIVE\n\nSaturday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n5:30 PM [English] 🔴 LIVE (Anticipated Mass)\n\nSunday:\n5:30 AM [Cebuano]\n7:00 AM [English]\n9:00 AM [English] 🔴 LIVE\n11:00 AM [English]\n4:00 PM [English]\n5:30 PM [Cebuano] 🔴 LIVE\n7:00 PM [English]',
  confession_schedule: 'Approach the Parish Priest at the sacristy after the mass or inform any mass servers immediately',
  facebook_url: 'https://www.facebook.com/PATHBanawa',
  youtube_url: '',
  footer_copyright: '© 2026 Parish of the Alliance of the Two Hearts. All Rights Reserved.',
  maintenance_overall_desc: '',
};

// Synchronously retrieve initial settings from localStorage to eliminate any render flash/glimpse
const getInitialSettings = () => {
  try {
    const cachedMaintenance = localStorage.getItem(MAINTENANCE_OVERALL_KEY);
    const cachedJson = localStorage.getItem(SETTINGS_CACHE_KEY);
    let merged = { ...DEFAULT_SETTINGS };

    if (cachedJson) {
      const parsed = JSON.parse(cachedJson);
      if (parsed && typeof parsed === 'object') {
        merged = { ...merged, ...parsed, ...BRAND_THEME };
      }
    }
    if (cachedMaintenance !== null && cachedMaintenance !== undefined) {
      merged.maintenance_overall = cachedMaintenance;
    }
    return merged;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialSettings);
  const [loading, setLoading] = useState(true);

  const applyThemeStyles = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', BRAND_THEME.primary_color);
    root.style.setProperty('--brand-red', BRAND_THEME.accent_color);
    root.style.setProperty('--secondary-color', BRAND_THEME.secondary_color);
    root.style.setProperty('--brand-blue', BRAND_THEME.secondary_color);
    root.style.setProperty('--accent-gold', BRAND_THEME.primary_color);
    root.style.setProperty('--brand-gold', BRAND_THEME.primary_color);
    root.style.setProperty('--font-heading', `'${BRAND_THEME.font_heading}', Georgia, serif`);
    root.style.setProperty('--font-body', `'${BRAND_THEME.font_body}', system-ui, sans-serif`);
  };

  const fetchSettings = async () => {
    try {
      applyThemeStyles();

      // Check for parallel pre-fetch started in index.html <head>
      let res = null;
      if (typeof window !== 'undefined' && window.__SETTINGS_PROMISE__) {
        try {
          res = await window.__SETTINGS_PROMISE__;
        } catch (e) {
          res = null;
        }
        window.__SETTINGS_PROMISE__ = null;
      }

      if (!res) {
        res = await publicApi.getSettings();
      }

      let dataMap = null;
      if (res) {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          dataMap = (res.data.data && typeof res.data.data === 'object') ? res.data.data : res.data;
        } else if (typeof res === 'object') {
          dataMap = res;
        }
      }

      if (dataMap && typeof dataMap === 'object') {
        setSettings(prev => ({
          ...prev,
          ...dataMap,
          ...BRAND_THEME, // Code-defined theme always takes precedence
        }));

        // Persist to localStorage for instant Frame-0 retrieval on next visit/refresh
        try {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(dataMap));
          if (dataMap.maintenance_overall !== undefined) {
            localStorage.setItem(MAINTENANCE_OVERALL_KEY, String(dataMap.maintenance_overall));
          }
        } catch (e) {
          // Ignore storage quota/permission issues
        }
      }
    } catch (err) {
      console.warn('Could not fetch settings, using code defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen for cross-tab or in-page instant settings and maintenance updates
    const handleSync = (e) => {
      if (e.detail && typeof e.detail === 'object') {
        setSettings(prev => ({ ...prev, ...e.detail, ...BRAND_THEME }));
        if (e.detail.maintenance_overall !== undefined) {
          try {
            localStorage.setItem(MAINTENANCE_OVERALL_KEY, String(e.detail.maintenance_overall));
          } catch (err) {}
        }
      }
    };

    const handleStorage = (e) => {
      if (e.key === SETTINGS_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings(prev => ({ ...prev, ...parsed, ...BRAND_THEME }));
        } catch (err) {}
      } else if (e.key === MAINTENANCE_OVERALL_KEY && e.newValue) {
        setSettings(prev => ({ ...prev, maintenance_overall: e.newValue }));
      }
    };

    window.addEventListener('path_settings_updated', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('path_settings_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, refreshSettings: fetchSettings, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
