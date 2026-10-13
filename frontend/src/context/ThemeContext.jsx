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

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'Parish of the Alliance of the Two Hearts',
    site_short_name: 'PATH',
    tagline: 'A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary',
    ...BRAND_THEME,
    address: 'J. Fortich St., Banawa, Cebu City, Philippines',
    phone: '(032) 255 3241',
    email: 'office@pathparish.org',
    office_hours: 'Tuesday – Saturday: 8:00 AM – 12:00 PM, 1:30 PM – 5:00 PM\nSunday: 8:00 AM – 12:00 PM\nMonday: Closed',
    mass_schedules: 'Monday – Friday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n12:15 PM [English]\n5:00 PM [Cebuano] (Every Monday at the Columbary)\n6:00 PM [English] 🔴 LIVE\n\nSaturday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n5:30 PM [English] 🔴 LIVE (Anticipated Mass)\n\nSunday:\n5:30 AM [Cebuano]\n7:00 AM [English]\n9:00 AM [English] 🔴 LIVE\n11:00 AM [English]\n4:00 PM [English]\n5:30 PM [Cebuano] 🔴 LIVE\n7:00 PM [English]',
    confession_schedule: 'Approach the Parish Priest at the sacristy after the mass or inform any mass servers immediately',
    facebook_url: 'https://www.facebook.com/PATHBanawa',
    youtube_url: '',
    footer_copyright: '© 2026 Parish of the Alliance of the Two Hearts. All Rights Reserved.',
  });

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
      const res = await publicApi.getSettings();
      if (res.data) {
        // Merge operational settings (contact, schedules) while keeping theme tokens strictly from code
        setSettings(prev => ({
          ...prev,
          ...res.data,
          ...BRAND_THEME, // Code-defined theme always takes precedence
        }));
      }
    } catch (err) {
      console.warn('Could not fetch settings, using code defaults', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, refreshSettings: fetchSettings, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
