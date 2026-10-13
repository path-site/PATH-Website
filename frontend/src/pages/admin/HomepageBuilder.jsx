import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi, publicApi } from '../../services/api';
import { 
  ArrowUp, ArrowDown, Eye, EyeOff, Edit, Copy, Trash2, 
  Plus, Check, X, LayoutTemplate, ExternalLink, AlertCircle,
  Upload, Image as ImageIcon
} from 'lucide-react';

// User-friendly visual image selector and uploader (No coding required)
function VisualImageInput({ label, value, onChange, placeholder = "Image URL or upload from your computer..." }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name);

    setUploading(true);
    try {
      const res = await adminApi.uploadMedia(formData);
      const url = res?.data?.fileUrl || res?.fileUrl || (res?.data && typeof res.data === 'string' ? res.data : '');
      if (url) {
        onChange(url);
      } else {
        alert('File uploaded, but could not retrieve image URL.');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {value ? (
          <div className="w-16 h-16 rounded-xl border border-stone-200 overflow-hidden shrink-0 bg-stone-100 shadow-xs relative group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove Picture"
              className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center shrink-0 text-stone-400 bg-stone-50">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 font-bold uppercase tracking-wider">No Pic</span>
          </div>
        )}

        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white"
          />
          <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shrink-0 shadow-xs ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-3.5 h-3.5 text-[#800020]" />
            <span>{uploading ? 'Uploading...' : 'Upload Picture'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

const SECTION_TYPES = [
  { type: 'HERO_SLIDESHOW', label: 'Hero Slideshow', desc: 'Full-width photography slideshow with headlines & CTA buttons' },
  { type: 'WELCOME', label: 'Welcome Section', desc: 'Greeting message, supporting description, and parish image' },
  { type: 'ANNOUNCEMENT_CARDS', label: 'Announcement Cards', desc: 'Feed of latest published announcements' },
  { type: 'EVENT_CARDS', label: 'Event Cards', desc: 'Upcoming parish activities, dates, and venues' },
  { type: 'ABOUT_PREVIEW', label: 'About Preview', desc: 'Feature block introducing parish heritage with button' },
  { type: 'PRIEST_CARDS', label: 'Priest Cards', desc: 'Highlight cards of the parish priests and pastoral clergy' },
  { type: 'GALLERY_PREVIEW', label: 'Gallery Preview', desc: 'Photo grid previewing selected church photos' },
  { type: 'CONTACT_SECTION', label: 'Contact Section', desc: 'Quick mass schedules, address, and office hours' },
  { type: 'RICH_TEXT', label: 'Rich Text Section', desc: 'Custom text, HTML, and formatted paragraphs' },
];

export default function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [pageId, setPageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Modal states
  const [editingSection, setEditingSection] = useState(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNewType, setSelectedNewType] = useState('WELCOME');
  const [newTitle, setNewTitle] = useState('');

  const fetchSections = async () => {
    try {
      const pageRes = await publicApi.getPage('home');
      if (pageRes.data && pageRes.data.page) {
        setPageId(pageRes.data.page.id);
        const secRes = await adminApi.getPageSections(pageRes.data.page.id);
        if (secRes.data) {
          setSections(secRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load sections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (editingSection || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingSection, isAddModalOpen]);

  const showNotification = (msg, isError = false) => {
    setNotice({ msg, isError });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleToggleVisibility = async (sec) => {
    try {
      const updated = { ...sec, isVisible: !sec.isVisible };
      await adminApi.updateSection(sec.id, updated);
      setSections(sections.map(s => s.id === sec.id ? updated : s));
      showNotification(`Section "${sec.title}" is now ${updated.isVisible ? 'Visible' : 'Hidden'}.`);
    } catch (err) {
      showNotification('Failed to update visibility', true);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Reassign displayOrder
    const reordered = newSections.map((s, idx) => ({
      ...s,
      displayOrder: idx
    }));

    setSections(reordered);

    try {
      await adminApi.reorderSections(reordered.map(s => ({ id: s.id, displayOrder: s.displayOrder })));
      showNotification('Sections reordered successfully.');
    } catch (err) {
      showNotification('Failed to persist order', true);
      fetchSections();
    }
  };

  const handleDuplicate = async (secId) => {
    try {
      await adminApi.duplicateSection(secId);
      showNotification('Section duplicated successfully.');
      fetchSections();
    } catch (err) {
      showNotification('Failed to duplicate section', true);
    }
  };

  const handleDelete = async (sec) => {
    if (!window.confirm(`Are you sure you want to remove the section "${sec.title}"?`)) return;
    try {
      await adminApi.deleteSection(sec.id);
      setSections(sections.filter(s => s.id !== sec.id));
      showNotification('Section removed.');
    } catch (err) {
      showNotification('Failed to delete section', true);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!pageId) return;

    let defaultContent = {};
    if (selectedNewType === 'WELCOME') {
      defaultContent = {
        heading: newTitle || "Welcome to Our Parish",
        welcomeMessage: "A warm greeting from our pastor and community.",
        supportingDescription: "We invite you to participate in our holy sacraments and parish activities.",
        imageUrl: "",
        buttonText: "Learn More",
        buttonLink: "/about/mission-vision",
        layout: "image-right"
      };
    } else if (selectedNewType === 'ANNOUNCEMENT_CARDS') {
      defaultContent = {
        heading: newTitle || "Official Parish Announcements",
        subheading: "Latest notices from the parish office.",
        maxItems: 3,
        showViewAll: true
      };
    } else if (selectedNewType === 'EVENT_CARDS') {
      defaultContent = {
        heading: newTitle || "Upcoming Parish Activities",
        subheading: "Mark your calendar for upcoming communal devotions.",
        maxItems: 3,
        showViewAll: true
      };
    } else if (selectedNewType === 'RICH_TEXT') {
      defaultContent = {
        html: "<p>Custom content paragraph.</p>"
      };
    }

    try {
      const newSec = {
        title: newTitle || selectedNewType,
        sectionType: selectedNewType,
        contentJson: JSON.stringify(defaultContent),
        isVisible: true,
        displayOrder: sections.length
      };

      await adminApi.addSection(pageId, newSec);
      showNotification(`Section "${newSec.title}" added to homepage.`);
      setIsAddModalOpen(false);
      setNewTitle('');
      fetchSections();
    } catch (err) {
      showNotification('Failed to add section', true);
    }
  };

  // Section Content Editor State
  const handleOpenEditor = (sec) => {
    let parsedConfig = {};
    try {
      parsedConfig = typeof sec.contentJson === 'string'
        ? JSON.parse(sec.contentJson)
        : sec.contentJson;
    } catch (e) {
      parsedConfig = {};
    }
    if (!parsedConfig) parsedConfig = {};

    // For Hero Slideshow, guarantee slides is a valid array
    if (sec.sectionType === 'HERO_SLIDESHOW') {
      if (!parsedConfig.slides || !Array.isArray(parsedConfig.slides) || parsedConfig.slides.length === 0) {
        parsedConfig.slides = [
          {
            imageUrl: "",
            title: "Welcome to the Parish of the Alliance of the Two Hearts",
            description: "A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary.",
            buttonText: "Learn More",
            buttonLink: "/about/mission-vision",
            overlayOpacity: 0.45
          }
        ];
      }
    }

    setEditingSection({
      ...sec,
      parsedConfig
    });
    setActiveSlideIdx(0);
  };

  // Visual Slide Management Helpers (No code / JSON required)
  const handleAddSlide = () => {
    if (!editingSection) return;
    const currentSlides = Array.isArray(editingSection.parsedConfig?.slides)
      ? [...editingSection.parsedConfig.slides]
      : [];
    currentSlides.push({
      imageUrl: '',
      title: 'New Parish Headline',
      description: 'Slide description and announcements...',
      buttonText: 'Learn More',
      buttonLink: '/about/mission-vision',
      overlayOpacity: 0.45
    });
    setEditingSection({
      ...editingSection,
      parsedConfig: {
        ...editingSection.parsedConfig,
        slides: currentSlides
      }
    });
    setActiveSlideIdx(currentSlides.length - 1);
  };

  const handleUpdateSlide = (index, field, value) => {
    if (!editingSection) return;
    const currentSlides = Array.isArray(editingSection.parsedConfig?.slides)
      ? [...editingSection.parsedConfig.slides]
      : [];
    currentSlides[index] = {
      ...currentSlides[index],
      [field]: value
    };
    setEditingSection({
      ...editingSection,
      parsedConfig: {
        ...editingSection.parsedConfig,
        slides: currentSlides
      }
    });
  };

  const handleRemoveSlide = (index) => {
    if (!editingSection) return;
    const currentSlides = Array.isArray(editingSection.parsedConfig?.slides)
      ? [...editingSection.parsedConfig.slides]
      : [];
    if (currentSlides.length <= 1) {
      alert('The slideshow requires at least 1 slide.');
      return;
    }
    currentSlides.splice(index, 1);
    const newActiveIdx = Math.max(0, Math.min(activeSlideIdx, currentSlides.length - 1));
    setActiveSlideIdx(newActiveIdx);
    setEditingSection({
      ...editingSection,
      parsedConfig: {
        ...editingSection.parsedConfig,
        slides: currentSlides
      }
    });
  };

  const handleMoveSlide = (index, direction) => {
    if (!editingSection) return;
    const currentSlides = Array.isArray(editingSection.parsedConfig?.slides)
      ? [...editingSection.parsedConfig.slides]
      : [];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;
    const temp = currentSlides[index];
    currentSlides[index] = currentSlides[targetIndex];
    currentSlides[targetIndex] = temp;
    if (activeSlideIdx === index) {
      setActiveSlideIdx(targetIndex);
    } else if (activeSlideIdx === targetIndex) {
      setActiveSlideIdx(index);
    }
    setEditingSection({
      ...editingSection,
      parsedConfig: {
        ...editingSection.parsedConfig,
        slides: currentSlides
      }
    });
  };

  const handleSaveEditor = async (e) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    try {
      const payload = {
        id: editingSection.id,
        pageId: editingSection.pageId,
        title: editingSection.title,
        sectionType: editingSection.sectionType,
        isVisible: editingSection.isVisible,
        displayOrder: editingSection.displayOrder,
        contentJson: JSON.stringify(editingSection.parsedConfig)
      };

      await adminApi.updateSection(editingSection.id, payload);
      setSections(sections.map(s => s.id === editingSection.id ? payload : s));
      showNotification('Section configuration saved successfully.');
      setEditingSection(null);
    } catch (err) {
      showNotification('Failed to save changes: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1.5 border border-amber-200">
            <LayoutTemplate className="w-3.5 h-3.5 text-amber-600" />
            <span>Modular CMS</span>
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Homepage Section Builder
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Reorder, toggle, add, or customize homepage sections. Changes take effect on the live website immediately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-all shadow-xs"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Notification alert */}
      {notice && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xs transition-all ${
          notice.isError 
            ? 'bg-rose-50 text-rose-800 border border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {notice.isError ? <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" /> : <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
          <span>{notice.msg}</span>
        </div>
      )}

      {/* Sections List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-20 bg-white rounded-2xl animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 text-stone-500">
          No sections found on the homepage. Click "Add Section" to create one.
        </div>
      ) : (
        <div className="space-y-3.5">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                sec.isVisible
                  ? 'bg-white border-stone-200/90 shadow-xs hover:border-[#800020]/40'
                  : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
              }`}
            >
              {/* Order number & title */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                      {sec.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 uppercase tracking-wider shrink-0">
                      {sec.sectionType}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">
                    Status: {sec.isVisible ? 'Visible on Public Page' : 'Hidden from Visitors'}
                  </span>
                </div>
              </div>

              {/* Actions Button Group */}
              <div className="flex items-center gap-1.5 shrink-0 justify-end">
                {/* Move Up */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  title="Move Up"
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-20 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  title="Move Down"
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-20 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(sec)}
                  title={sec.isVisible ? "Hide from website" : "Show on website"}
                  className={`p-2 rounded-lg transition-colors ${
                    sec.isVisible
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit Content */}
                <button
                  id={`configure-section-${idx}`}
                  type="button"
                  onClick={() => handleOpenEditor(sec)}
                  title="Edit Section Content & Images"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-amber-700" />
                  <span>Configure</span>
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => handleDuplicate(sec.id)}
                  title="Duplicate Section"
                  className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(sec)}
                  title="Remove Section"
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ADD SECTION MODAL */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 max-h-[86vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h3 className="font-serif-heading text-xl font-bold text-stone-900">Add Homepage Section</h3>
                <p className="text-xs text-stone-500">Choose a predefined modular section to insert.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Section Title / Internal Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Feast Announcement Block"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Section Type
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {SECTION_TYPES.map((t) => (
                    <label
                      key={t.type}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedNewType === t.type
                          ? 'border-[#800020] bg-[#800020]/5 ring-1 ring-[#800020]'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sectionType"
                        value={t.type}
                        checked={selectedNewType === t.type}
                        onChange={() => setSelectedNewType(t.type)}
                        className="mt-1 text-[#800020] focus:ring-[#800020]"
                      />
                      <div>
                        <span className="text-sm font-bold text-stone-900 block leading-tight">{t.label}</span>
                        <span className="text-xs text-stone-500 leading-snug">{t.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Add to Homepage
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT SECTION CONTENT MODAL - 1 SCREEN ARCHITECTURE */}
      {editingSection && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 max-h-[86vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* 1. FIXED MODAL HEADER - ALWAYS VISIBLE */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 uppercase tracking-wider">
                  {editingSection.sectionType}
                </span>
                <h3 className="font-serif-heading text-lg font-bold text-stone-900 truncate max-w-md">
                  Configure: {editingSection.title}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingSection(null)} 
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. FORM BODY WITH SCROLLABLE INTERNAL CONTAINER */}
            <form onSubmit={handleSaveEditor} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
                
                {/* SECTION TITLE / HEADER */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Section Title / Header
                  </label>
                  <input
                    type="text"
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white"
                  />
                </div>

                {/* HERO SLIDESHOW: 1-SCREEN TABBED SLIDE EDITOR */}
                {editingSection.sectionType === 'HERO_SLIDESHOW' && (
                  <div className="space-y-3.5">
                    {/* SLIDE TABS BAR */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(Array.isArray(editingSection.parsedConfig?.slides) ? editingSection.parsedConfig.slides : []).map((_, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setActiveSlideIdx(sIdx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              activeSlideIdx === sIdx
                                ? 'bg-[#800020] text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Slide {sIdx + 1}</span>
                          </button>
                        ))}
                        <button
                          id="add-slide-button"
                          type="button"
                          onClick={handleAddSlide}
                          className="px-2.5 py-1.5 rounded-xl border border-dashed border-[#800020] text-[#800020] hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Slide</span>
                        </button>
                      </div>

                      {/* Reorder and Delete controls for current active slide */}
                      {editingSection.parsedConfig?.slides?.[activeSlideIdx] && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={activeSlideIdx === 0}
                            onClick={() => handleMoveSlide(activeSlideIdx, -1)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 disabled:opacity-20 cursor-pointer hover:bg-stone-100"
                            title="Move Slide Earlier"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={activeSlideIdx === (editingSection.parsedConfig?.slides?.length || 1) - 1}
                            onClick={() => handleMoveSlide(activeSlideIdx, 1)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 disabled:opacity-20 cursor-pointer hover:bg-stone-100"
                            title="Move Slide Later"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(activeSlideIdx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete This Slide"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ACTIVE SLIDE EDITOR CARD */}
                    {editingSection.parsedConfig?.slides?.[activeSlideIdx] && (
                      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-3">
                        <VisualImageInput
                          label={`Slide #${activeSlideIdx + 1} Picture`}
                          value={editingSection.parsedConfig.slides[activeSlideIdx].imageUrl}
                          onChange={(newUrl) => handleUpdateSlide(activeSlideIdx, 'imageUrl', newUrl)}
                          placeholder="Paste image URL or click Upload Picture..."
                        />

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                            Headline Title
                          </label>
                          <input
                            type="text"
                            value={editingSection.parsedConfig.slides[activeSlideIdx].title || ''}
                            onChange={(e) => handleUpdateSlide(activeSlideIdx, 'title', e.target.value)}
                            placeholder="e.g. Welcome to the Parish of the Alliance of the Two Hearts"
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                            Subtitle / Description
                          </label>
                          <textarea
                            rows="2"
                            value={editingSection.parsedConfig.slides[activeSlideIdx].description || ''}
                            onChange={(e) => handleUpdateSlide(activeSlideIdx, 'description', e.target.value)}
                            placeholder="e.g. A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary."
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                              Button Label
                            </label>
                            <input
                              type="text"
                              value={editingSection.parsedConfig.slides[activeSlideIdx].buttonText || ''}
                              onChange={(e) => handleUpdateSlide(activeSlideIdx, 'buttonText', e.target.value)}
                              placeholder="e.g. Learn More or Mass Schedules"
                              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                              Button Destination Link
                            </label>
                            <input
                              type="text"
                              value={editingSection.parsedConfig.slides[activeSlideIdx].buttonLink || ''}
                              onChange={(e) => handleUpdateSlide(activeSlideIdx, 'buttonLink', e.target.value)}
                              placeholder="e.g. /about/mission-vision or /contact"
                              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Autoplay & Duration settings - compact */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <label className="flex items-center gap-2 font-bold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSection.parsedConfig.autoplay !== false}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, autoplay: e.target.checked }
                          })}
                          className="rounded text-[#800020] focus:ring-[#800020]"
                        />
                        <span>Cycle slides automatically (Autoplay)</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700">Display duration:</span>
                        <input
                          type="number"
                          min="2"
                          max="30"
                          value={editingSection.parsedConfig.intervalSeconds || 6}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, intervalSeconds: parseInt(e.target.value) || 6 }
                          })}
                          className="w-14 px-2 py-0.5 rounded-lg border border-stone-300 text-center font-bold text-xs bg-white"
                        />
                        <span className="text-stone-500">seconds</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* WELCOME SECTION: VISUAL COMPACT FORM */}
                {editingSection.sectionType === 'WELCOME' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Main Heading
                      </label>
                      <input
                        type="text"
                        value={editingSection.parsedConfig.heading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, heading: e.target.value }
                        })}
                        placeholder="e.g. A Sanctuary of Faith, Hope, and Love"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Welcome Message / Quotation
                        </label>
                        <textarea
                          rows="2"
                          value={editingSection.parsedConfig.welcomeMessage || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, welcomeMessage: e.target.value }
                          })}
                          placeholder="A short pastor greeting or motto..."
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Supporting Description
                        </label>
                        <textarea
                          rows="2"
                          value={editingSection.parsedConfig.supportingDescription || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, supportingDescription: e.target.value }
                          })}
                          placeholder="Detailed parish community description..."
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                        />
                      </div>
                    </div>

                    <VisualImageInput
                      label="Parish Picture"
                      value={editingSection.parsedConfig.imageUrl || ''}
                      onChange={(newUrl) => setEditingSection({
                        ...editingSection,
                        parsedConfig: { ...editingSection.parsedConfig, imageUrl: newUrl }
                      })}
                      placeholder="Paste image URL or click Upload Picture to choose a file..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={editingSection.parsedConfig.buttonText || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, buttonText: e.target.value }
                          })}
                          placeholder="e.g. About Our Parish"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Button Destination Link
                        </label>
                        <input
                          type="text"
                          value={editingSection.parsedConfig.buttonLink || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, buttonLink: e.target.value }
                          })}
                          placeholder="e.g. /about/mission-vision"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ABOUT PREVIEW: VISUAL COMPACT FORM */}
                {editingSection.sectionType === 'ABOUT_PREVIEW' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Feature Heading
                      </label>
                      <input
                        type="text"
                        value={editingSection.parsedConfig.heading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, heading: e.target.value }
                        })}
                        placeholder="e.g. Rooted in Faith, Growing in Fellowship"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Heritage Description
                      </label>
                      <textarea
                        rows="2"
                        value={editingSection.parsedConfig.description || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, description: e.target.value }
                        })}
                        placeholder="Parish history summary..."
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                      />
                    </div>

                    <VisualImageInput
                      label="Heritage Feature Picture"
                      value={editingSection.parsedConfig.imageUrl || ''}
                      onChange={(newUrl) => setEditingSection({
                        ...editingSection,
                        parsedConfig: { ...editingSection.parsedConfig, imageUrl: newUrl }
                      })}
                      placeholder="Paste image URL or click Upload Picture to choose a file..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={editingSection.parsedConfig.buttonText || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, buttonText: e.target.value }
                          })}
                          placeholder="e.g. Discover Our History"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Button Destination Link
                        </label>
                        <input
                          type="text"
                          value={editingSection.parsedConfig.buttonLink || ''}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, buttonLink: e.target.value }
                          })}
                          placeholder="e.g. /about/history"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CARDS SECTIONS: ANNOUNCEMENTS, EVENTS, GALLERY, PRIESTS */}
                {(editingSection.sectionType === 'ANNOUNCEMENT_CARDS' || 
                  editingSection.sectionType === 'EVENT_CARDS' || 
                  editingSection.sectionType === 'GALLERY_PREVIEW' || 
                  editingSection.sectionType === 'PRIEST_CARDS') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Display Heading
                      </label>
                      <input
                        type="text"
                        value={editingSection.parsedConfig.heading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, heading: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Subheading / Advisory Note
                      </label>
                      <textarea
                        rows="2"
                        value={editingSection.parsedConfig.subheading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, subheading: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Maximum Items to Display
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={editingSection.parsedConfig.maxItems || 3}
                          onChange={(e) => setEditingSection({
                            ...editingSection,
                            parsedConfig: { ...editingSection.parsedConfig, maxItems: parseInt(e.target.value) || 3 }
                          })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingSection.parsedConfig.showViewAll !== false}
                            onChange={(e) => setEditingSection({
                              ...editingSection,
                              parsedConfig: { ...editingSection.parsedConfig, showViewAll: e.target.checked }
                            })}
                            className="rounded text-[#800020] focus:ring-[#800020]"
                          />
                          <span>Show "View All" link button</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTACT SECTION: VISUAL COMPACT FORM */}
                {editingSection.sectionType === 'CONTACT_SECTION' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Display Heading
                      </label>
                      <input
                        type="text"
                        value={editingSection.parsedConfig.heading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, heading: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Subheading / Note
                      </label>
                      <textarea
                        rows="2"
                        value={editingSection.parsedConfig.subheading || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          parsedConfig: { ...editingSection.parsedConfig, subheading: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* RICH TEXT: VISUAL TEXTBOX */}
                {editingSection.sectionType === 'RICH_TEXT' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Content / Message
                    </label>
                    <textarea
                      rows="6"
                      value={editingSection.parsedConfig.html || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        parsedConfig: { ...editingSection.parsedConfig, html: e.target.value }
                      })}
                      placeholder="Type or paste your text here..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                    />
                  </div>
                )}

              </div>

              {/* 3. FIXED MODAL FOOTER - ALWAYS IN VIEW IN 1 SCREEN */}
              <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between shrink-0">
                <span className="text-xs text-stone-500 hidden sm:inline">
                  All changes take effect immediately on public site upon saving.
                </span>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    id="modal-cancel-button"
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-save-button"
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save & Publish Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
