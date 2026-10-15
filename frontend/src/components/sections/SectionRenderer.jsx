import React from 'react';
import HeroSlideshow from './HeroSlideshow';
import WelcomeSection from './WelcomeSection';
import AnnouncementCardsSection from './AnnouncementCardsSection';
import EventCardsSection from './EventCardsSection';
import AboutPreviewSection from './AboutPreviewSection';
import PriestCardsSection from './PriestCardsSection';
import GalleryPreviewSection from './GalleryPreviewSection';
import ContactSection from './ContactSection';
import RichTextSection from './RichTextSection';

import { useTheme } from '../../context/ThemeContext';
import { isSectionUnderMaintenance } from '../../config/maintenanceConfig';

export default function SectionRenderer({ section }) {
  const { settings } = useTheme();

  if (!section || section.isVisible === false) return null;

  // STRICT MAINTENANCE MODE: If corresponding section is under maintenance, strictly hide section
  if (section.sectionType === 'ANNOUNCEMENT_CARDS' && isSectionUnderMaintenance('announcements', settings)) return null;
  if (section.sectionType === 'EVENT_CARDS' && isSectionUnderMaintenance('events', settings)) return null;
  if (section.sectionType === 'PRIEST_CARDS' && isSectionUnderMaintenance('priests', settings)) return null;
  if (section.sectionType === 'GALLERY_PREVIEW' && isSectionUnderMaintenance('gallery', settings)) return null;
  if (section.sectionType === 'CONTACT_SECTION' && isSectionUnderMaintenance('contactSettings', settings)) return null;

  let config = {};
  if (section.contentJson) {
    try {
      config = typeof section.contentJson === 'string'
        ? JSON.parse(section.contentJson)
        : section.contentJson;
    } catch (e) {
      console.warn('Error parsing section content JSON for section', section.id, e);
    }
  }

  switch (section.sectionType) {
    case 'HERO_SLIDESHOW':
      return <HeroSlideshow key={section.id} config={config} />;
    case 'WELCOME':
      return <WelcomeSection key={section.id} config={config} />;
    case 'ANNOUNCEMENT_CARDS':
      return <AnnouncementCardsSection key={section.id} config={config} />;
    case 'EVENT_CARDS':
      return <EventCardsSection key={section.id} config={config} />;
    case 'ABOUT_PREVIEW':
      return <AboutPreviewSection key={section.id} config={config} />;
    case 'PRIEST_CARDS':
      return <PriestCardsSection key={section.id} config={config} />;
    case 'GALLERY_PREVIEW':
      return <GalleryPreviewSection key={section.id} config={config} />;
    case 'CONTACT_SECTION':
      return <ContactSection key={section.id} config={config} />;
    case 'RICH_TEXT':
      return <RichTextSection key={section.id} config={config} title={section.title} />;
    default:
      return null;
  }
}
