import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import SectionMaintenanceBar from '../../components/admin/SectionMaintenanceBar';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import {
  HeartHandshake,
  Plus,
  Edit,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  BookOpen,
  Music,
  Sparkles,
  Heart,
  Users,
  Church,
  Cross,
  Flame,
  Sun,
  Bell,
  Compass,
  Star,
  Award,
  Scroll,
  Feather,
  HandHeart,
  Save,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Phone,
  MessageSquare,
  Radio,
  Camera,
  Gift,
  GraduationCap,
  Mic,
  Upload,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

// Registry of supported church & apostolate icons
export const MINISTRY_ICON_MAP = {
  Shield,
  BookOpen,
  Music,
  Sparkles,
  Heart,
  Users,
  Church,
  Cross,
  HeartHandshake,
  Flame,
  Sun,
  Bell,
  Compass,
  Star,
  Award,
  Scroll,
  Feather,
  HandHeart,
  Radio,
  Camera,
  Gift,
  GraduationCap,
  Mic,
};

export const AVAILABLE_ICONS = [
  { key: 'Shield', label: 'Shield (Altar Servers / Protection)' },
  { key: 'BookOpen', label: 'Book (Lectors / Scriptures)' },
  { key: 'Music', label: 'Music (Music Ministry & Cantors)' },
  { key: 'Cross', label: 'Cross (EMHC / Sacramental)' },
  { key: 'HeartHandshake', label: 'Handshake (Ushering / Hospitality)' },
  { key: 'HandHeart', label: 'Hand & Heart (Gift Bearers / Offerings)' },
  { key: 'Camera', label: 'Camera (Social Communications / Media)' },
  { key: 'Scroll', label: 'Scroll (Catechists / Doctrine)' },
  { key: 'GraduationCap', label: 'Cap (Catechists / Faith Formation)' },
  { key: 'Radio', label: 'Radio (SocCom / Broadcasts)' },
  { key: 'Mic', label: 'Mic (Cantors / Singing)' },
  { key: 'Gift', label: 'Gift (Gift Bearers / Offertory)' },
  { key: 'Users', label: 'Users (Community / Apostolates)' },
  { key: 'Church', label: 'Church (Parish Sanctuary)' },
  { key: 'Flame', label: 'Flame (Holy Spirit)' },
  { key: 'Sun', label: 'Sun (Dawn Rosary / Light)' },
  { key: 'Bell', label: 'Bell (Sacristans / Worship)' },
  { key: 'Heart', label: 'Heart (Family & Charity)' },
  { key: 'Sparkles', label: 'Sparkles (Youth / Charisms)' },
  { key: 'Star', label: 'Star (Marian Guiding Light)' },
  { key: 'Award', label: 'Award (Honor / Service)' },
  { key: 'Feather', label: 'Feather (Secretarial / Scriptorium)' },
];

export const CATEGORY_PRESETS = [
  'Worship & Liturgy',
  'Ministry of the Word',
  'Liturgical Music',
  'Faith Formation & Catechesis',
  'Media & Communications',
  'Hospitality & Service',
  'Sacramental Ministry',
  'Youth Apostolate',
  'Family & Life',
  'Charity & Outreach',
];

export const STATUS_PRESETS = [
  { value: 'Active', label: 'Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'Open for Volunteers', label: 'Open for Volunteers', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'Roster Updating', label: 'Roster Updating', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'Recruiting', label: 'Recruiting', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'Special Apostolate', label: 'Special Apostolate', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

// Normalize photos array from any legacy format (null, strings, objects)
export const normalizeMinistryPhotos = (photos) => {
  if (!photos) return [];
  if (Array.isArray(photos)) {
    return photos
      .map((p, idx) => {
        if (!p) return null;
        if (typeof p === 'string') {
          return { id: `p-${idx}-${Date.now()}`, url: p, caption: '' };
        }
        if (typeof p === 'object' && p.url) {
          return {
            id: p.id || `p-${idx}-${Date.now()}`,
            url: p.url,
            caption: p.caption || '',
          };
        }
        return null;
      })
      .filter(Boolean);
  }
  if (typeof photos === 'string') {
    return [{ id: `p-0-${Date.now()}`, url: photos, caption: '' }];
  }
  return [];
};

export const CANONICAL_INITIAL_MINISTRIES = [
  {
    id: 'min-soccom',
    name: 'Social Communications Ministry',
    category: 'Media & Communications',
    desc: 'Proclaiming the Gospel in the digital continent through live streaming of Eucharistic celebrations, multimedia documentation, social media apostolate, and parish announcements.',
    icon: 'Camera',
    coordinator: 'Eliza Reinne Estomata',
    schedule: '-',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 0,
    photos: [],
  },
  {
    id: 'min-altar-servers',
    name: 'Ministry of Altar Servers',
    category: 'Worship & Liturgy',
    desc: 'Dedicated young servants of the sanctuary assisting the sacred ministers at the altar with reverent devotion during the Holy Sacrifice of the Mass and liturgical rites.',
    icon: 'Shield',
    coordinator: 'Cyril Nathanael Orbeta',
    schedule: '-',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 1,
    photos: [],
  },
  {
    id: 'min-ushers',
    name: 'Ushering Ministry',
    category: 'Hospitality & Service',
    desc: 'Welcoming the faithful with Christian warmth, maintaining solemnity and order in the assembly, assisting during communion lines, and facilitating offertory collections.',
    icon: 'HeartHandshake',
    coordinator: 'Cherry Ann Alburo',
    schedule: 'Assigned Sunday & Feast Day Masses',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 2,
    photos: [],
  },
  {
    id: 'min-lectors',
    name: 'Ministry of Lectors',
    category: 'Ministry of the Word',
    desc: 'Proclaimers of the Living Word of God who reverently read the Sacred Scriptures during the Liturgy of the Word and lead the community in the General Intercessions.',
    icon: 'BookOpen',
    coordinator: 'Esperanza Estomata',
    schedule: 'Every 3rd Friday of the Month',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 3,
    photos: [],
  },
  {
    id: 'min-catechists',
    name: 'Catechists',
    category: 'Faith Formation & Catechesis',
    desc: 'Teaching, catechizing, and guiding children, youth, and adult converts in the Catholic faith, sacramental preparations (Baptism, First Communion, Confirmation), and Christian doctrine.',
    icon: 'Scroll',
    coordinator: '-',
    schedule: '-',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 4,
    photos: [],
  },
  {
    id: 'min-gift-bearers',
    name: 'Ministry of Gift Bearers',
    category: 'Worship & Liturgy',
    desc: 'Representing the parish family in presenting the offertory gifts of bread, wine, and offerings of the faithful to the priest at the altar for the Eucharistic sacrifice.',
    icon: 'HandHeart',
    coordinator: '-',
    schedule: 'Every 1st Saturday of the Month',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 5,
    photos: [],
  },
  {
    id: 'min-music',
    name: 'Music Ministry & Cantors',
    category: 'Liturgical Music',
    desc: 'Choirs, vocalists, cantors, and instrumentalists dedicated to leading congregational praise, psalms, and sacred liturgical music that elevates the soul in holy worship.',
    icon: 'Music',
    coordinator: 'Boboi Quieta',
    schedule: '-',
    contact: '',
    statusBadge: 'Open for Volunteers',
    isPublished: true,
    displayOrder: 6,
    photos: [],
  },
  {
    id: 'min-emhc',
    name: 'Extraordinary Minister of Holy Communion',
    category: 'Sacramental Ministry',
    desc: 'Commissioned lay ministers mandated by the Archdiocese to assist priests in distributing the Most Holy Eucharist during mass and carrying the Blessed Sacrament to the homebound sick.',
    icon: 'Cross',
    coordinator: '-',
    schedule: '-',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    displayOrder: 7,
    photos: [],
  },
];

/**
 * Reusable Photo Section with direct file upload, URL addition,
 * thumbnail preview, captions, reordering, and deletion.
 */
export function MinistryPhotoSection({ photos = [], onChange, label = "Ministry Photographs & Gallery" }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const added = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('altText', file.name);
        const res = await adminApi.uploadMedia(fd);
        const mediaData = res?.data || res;
        const url = mediaData?.fileUrl || (typeof mediaData === 'string' ? mediaData : '');
        if (url) {
          const autoCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          added.push({
            id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url,
            caption: autoCaption,
          });
        }
      }
      if (added.length > 0) {
        onChange([...photos, ...added]);
      } else {
        setUploadError('Uploaded file, but could not read the image URL from server.');
      }
    } catch (err) {
      console.error('Photo upload failed', err);
      setUploadError(err.message || 'Failed to upload photo to the server.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    const newPhoto = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: urlInput.trim(),
      caption: captionInput.trim(),
    };
    onChange([...photos, newPhoto]);
    setUrlInput('');
    setCaptionInput('');
  };

  const handleRemove = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange(updated);
  };

  const handleCaptionChange = (index, newCaption) => {
    const updated = photos.map((p, i) => (i === index ? { ...p, caption: newCaption } : p));
    onChange(updated);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
            {label}
          </label>
          <p className="text-[11px] text-stone-500">
            Upload pictures of apostolate activities, altar serving, formations, or church events ({photos.length} photos)
          </p>
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Or Add Photo via URL */}
      <div className="pt-2 border-t border-stone-200/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
          Or Add Photo via Image URL
        </span>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Image URL (https://... or /api/media/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            className="sm:w-44 px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            + Add URL
          </button>
        </div>
      </div>

      {/* Photos List Grid */}
      {photos.length === 0 ? (
        <div className="py-6 border-2 border-dashed border-stone-200 rounded-xl text-center text-stone-400 bg-white/60">
          <ImageIcon className="w-8 h-8 mx-auto mb-1 text-stone-300" />
          <p className="text-xs font-medium text-stone-600">No photos added yet for this ministry</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Click &ldquo;Upload Photos&rdquo; above to select images from your computer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-72 overflow-y-auto p-1">
          {photos.map((photo, index) => {
            const resolved = resolveMediaUrl(photo.url);
            return (
              <div
                key={photo.id || index}
                className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs flex items-start gap-3 group relative"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200 relative">
                  <img
                    src={resolved}
                    alt={photo.caption || 'Ministry photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {index === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-amber-600/90 text-white text-[9px] font-bold text-center py-0.5">
                      Cover
                    </span>
                  )}
                </div>

                {/* Details & Caption */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-stone-400">
                      Photo #{index + 1}
                    </span>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        title="Move Earlier"
                        className="p-1 rounded hover:bg-stone-100 text-stone-500 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={index === photos.length - 1}
                        title="Move Later"
                        className="p-1 rounded hover:bg-stone-100 text-stone-500 disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        title="Delete Photo"
                        className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Add caption or description..."
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#800020]"
                  />
                  <div className="text-[10px] text-stone-400 truncate" title={photo.url}>
                    {photo.url}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MinistriesManager() {
  const { refreshSettings } = useTheme();

  // State
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: 'success' });

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Active Modals
  const [ministryModalOpen, setMinistryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Dedicated Photo Manager Modal State
  const [photoModalMinistry, setPhotoModalMinistry] = useState(null);
  const [photoList, setPhotoList] = useState([]);

  // Form State for Individual Ministry
  const [formData, setFormData] = useState({
    name: '',
    category: 'Worship & Liturgy',
    desc: '',
    icon: 'Shield',
    coordinator: '',
    schedule: '',
    contact: '',
    statusBadge: 'Active',
    isPublished: true,
    photos: [],
  });

  // Settings for Page Layout & Notice Banner
  const [pageSettings, setPageSettings] = useState({
    ministries_eyebrow: 'Pastoral Apostolates & Organizations',
    ministries_title: 'Parish Ministries',
    ministries_subtitle: 'United in the Sacred Hearts of Jesus and Mary to serve the Lord, the Church, and our community.',
    ministries_banner_enabled: 'true',
    ministries_banner_badge: 'Section Under Preparation',
    ministries_banner_title: 'Ministries Directory is Currently in the Making',
    ministries_banner_desc: 'We are currently compiling and updating the complete directory of parish ministries, apostolic movements, coordinators, and schedules. The finalized directory and online sign-up details will be published here soon.',
    ministries_banner_show_phone: 'true',
    ministries_banner_show_fb: 'true',
    ministries_cta_title: 'Interested in joining a ministry or serving as a volunteer?',
    ministries_cta_desc: 'Visit our parish office at J. Fortich St., Banawa, Cebu City during regular office hours.',
    ministries_cta_btn_text: 'View Office Details',
    ministries_cta_btn_link: '/contact',
  });

  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'success' }), 4000);
  };

  // Fetch from settings on mount
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res?.data) {
        const data = res.data;

        // Parse Ministries List
        if (data.ministries_list) {
          try {
            const parsed = typeof data.ministries_list === 'string'
              ? JSON.parse(data.ministries_list)
              : data.ministries_list;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const isLegacyDefault =
                parsed.length === 6 &&
                parsed.some((m) => m.id === 'min-liturgical' || m.id === 'min-caritas');
              if (isLegacyDefault) {
                setMinistries(CANONICAL_INITIAL_MINISTRIES);
                // Auto-upgrade database with the 8 official parish ministries
                adminApi.saveSettings({ ministries_list: JSON.stringify(CANONICAL_INITIAL_MINISTRIES) }).catch(() => {});
              } else {
                const normalized = parsed.map((m) => ({
                  ...m,
                  photos: normalizeMinistryPhotos(m.photos),
                }));
                setMinistries(normalized);
              }
            } else {
              setMinistries(CANONICAL_INITIAL_MINISTRIES);
            }
          } catch (e) {
            console.error('Failed to parse ministries_list JSON', e);
            setMinistries(CANONICAL_INITIAL_MINISTRIES);
          }
        } else {
          setMinistries(CANONICAL_INITIAL_MINISTRIES);
        }

        // Parse Page Settings
        setPageSettings({
          ministries_eyebrow: data.ministries_eyebrow || 'Pastoral Apostolates & Organizations',
          ministries_title: data.ministries_title || 'Parish Ministries',
          ministries_subtitle: data.ministries_subtitle || 'United in the Sacred Hearts of Jesus and Mary to serve the Lord, the Church, and our community.',
          ministries_banner_enabled: data.ministries_banner_enabled !== undefined ? String(data.ministries_banner_enabled) : 'true',
          ministries_banner_badge: data.ministries_banner_badge || 'Section Under Preparation',
          ministries_banner_title: data.ministries_banner_title || 'Ministries Directory is Currently in the Making',
          ministries_banner_desc: data.ministries_banner_desc || 'We are currently compiling and updating the complete directory of parish ministries, apostolic movements, coordinators, and schedules. The finalized directory and online sign-up details will be published here soon.',
          ministries_banner_show_phone: data.ministries_banner_show_phone !== undefined ? String(data.ministries_banner_show_phone) : 'true',
          ministries_banner_show_fb: data.ministries_banner_show_fb !== undefined ? String(data.ministries_banner_show_fb) : 'true',
          ministries_cta_title: data.ministries_cta_title || 'Interested in joining a ministry or serving as a volunteer?',
          ministries_cta_desc: data.ministries_cta_desc || 'Visit our parish office at J. Fortich St., Banawa, Cebu City during regular office hours.',
          ministries_cta_btn_text: data.ministries_cta_btn_text || 'View Office Details',
          ministries_cta_btn_link: data.ministries_cta_btn_link || '/contact',
        });
      }
    } catch (err) {
      console.error('Failed to load ministries data', err);
      setMinistries(CANONICAL_INITIAL_MINISTRIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save ministries list to database
  const saveMinistriesToDb = async (updatedList) => {
    setSaving(true);
    try {
      await adminApi.saveSettings({
        ministries_list: JSON.stringify(updatedList),
      });
      await refreshSettings();
      setMinistries(updatedList);
      showNotice('Ministries directory updated successfully!');
    } catch (err) {
      console.error(err);
      showNotice(err.message || 'Failed to save ministries changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Page & Notice Banner Settings
  const handleSavePageSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await adminApi.saveSettings(pageSettings);
      await refreshSettings();
      setBannerModalOpen(false);
      showNotice('Page and notice banner settings saved successfully!');
    } catch (err) {
      console.error(err);
      showNotice(err.message || 'Failed to save page settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Worship & Liturgy',
      desc: '',
      icon: 'Shield',
      coordinator: '',
      schedule: '',
      contact: '',
      statusBadge: 'Active',
      isPublished: true,
      photos: [],
    });
    setMinistryModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Worship & Liturgy',
      desc: item.desc || '',
      icon: item.icon || 'Shield',
      coordinator: item.coordinator || '',
      schedule: item.schedule || '',
      contact: item.contact || '',
      statusBadge: item.statusBadge || 'Active',
      isPublished: item.isPublished !== false,
      photos: normalizeMinistryPhotos(item.photos),
    });
    setMinistryModalOpen(true);
  };

  // Open Dedicated Quick Photo Manager Modal
  const openPhotoModal = (item) => {
    setPhotoModalMinistry(item);
    setPhotoList(normalizeMinistryPhotos(item.photos));
  };

  // Save photos from Quick Photo Modal
  const handleSavePhotosForMinistry = async (ministryId, updatedPhotos) => {
    const updated = ministries.map((m) =>
      m.id === ministryId ? { ...m, photos: updatedPhotos } : m
    );
    await saveMinistriesToDb(updated);
    setPhotoModalMinistry(null);
    showNotice(`Photos updated for ${photoModalMinistry?.name || 'ministry'}`);
  };

  // Duplicate an item
  const handleDuplicate = (item) => {
    const copy = {
      ...item,
      id: `min-${Date.now()}`,
      name: `${item.name} (Copy)`,
      displayOrder: ministries.length,
      photos: normalizeMinistryPhotos(item.photos),
    };
    const updated = [...ministries, copy];
    saveMinistriesToDb(updated);
  };

  // Submit Add / Edit
  const handleSubmitMinistry = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotice('Ministry name is required', 'error');
      return;
    }

    let updatedList;
    if (editingItem) {
      updatedList = ministries.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              displayOrder: item.displayOrder,
            }
          : item
      );
    } else {
      const newItem = {
        id: `min-${Date.now()}`,
        ...formData,
        displayOrder: ministries.length,
      };
      updatedList = [...ministries, newItem];
    }

    setMinistryModalOpen(false);
    saveMinistriesToDb(updatedList);
  };

  // Toggle Published
  const handleTogglePublished = (id) => {
    const updated = ministries.map((item) =>
      item.id === id ? { ...item, isPublished: !item.isPublished } : item
    );
    saveMinistriesToDb(updated);
  };

  // Move up or down
  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= ministries.length) return;

    const copy = [...ministries];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((item, idx) => ({ ...item, displayOrder: idx }));
    saveMinistriesToDb(reordered);
  };

  // Delete
  const handleDelete = (id) => {
    const filtered = ministries
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, displayOrder: idx }));
    setDeleteConfirmId(null);
    saveMinistriesToDb(filtered);
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (window.confirm('Reset all ministries to the official 8 parish ministries? Custom additions will be overwritten.')) {
      saveMinistriesToDb(CANONICAL_INITIAL_MINISTRIES);
    }
  };

  // Filtered List
  const filteredMinistries = ministries.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.coordinator?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && item.isPublished) ||
      (statusFilter === 'HIDDEN' && !item.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Extract unique categories for filter
  const allCategories = Array.from(
    new Set(ministries.map((m) => m.category).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {notice.text && (
        <div
          className={`fixed bottom-6 right-6 z-[120] px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200 ${
            notice.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {notice.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{notice.text}</span>
        </div>
      )}

      {/* Section Maintenance Control Switch */}
      <SectionMaintenanceBar sectionKey="ministries" />

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#800020] block">
              Parish Content Suite
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Live Public Screen
            </span>
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Ministries & Apostolates Manager
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage parish commissions, liturgical guilds, youth apostolates, coordinators, meeting schedules, and customize the public directory notice banner.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setBannerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
            title="Configure public page notice banner and header text"
          >
            <Sliders className="w-4 h-4 text-[#800020]" />
            <span>Notice & Page Settings</span>
          </button>

          <a
            href="/ministries"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-4 h-4 text-stone-400" />
          </a>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Ministry</span>
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ministry by name, category, coordinator, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/20 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-[#800020]/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="HIDDEN">Hidden Only</option>
            </select>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Reset ministries list to the canonical 6 default apostolates"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
              <span>Defaults</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories ({ministries.length})
          </button>
          {allCategories.map((cat) => {
            const count = ministries.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Ministries List Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-[#800020] mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-600">Loading ministries directory...</p>
        </div>
      ) : filteredMinistries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-heading text-lg font-bold text-stone-800">
              No Ministries Found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
              {searchQuery || selectedCategory !== 'ALL' || statusFilter !== 'ALL'
                ? 'No ministries matched your search or category filter. Try clearing filters.'
                : 'You have not added any ministries yet. Click below to add the first parish ministry.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold transition-all shadow-md"
            >
              + Add Ministry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMinistries.map((item) => {
            const actualIndex = ministries.findIndex((m) => m.id === item.id);
            const IconComponent = MINISTRY_ICON_MAP[item.icon] || Shield;
            const itemPhotos = normalizeMinistryPhotos(item.photos);

            // Status chip color
            const statusConfig =
              STATUS_PRESETS.find((s) => s.value === item.statusBadge) || {
                color: 'bg-stone-100 text-stone-700 border-stone-200',
              };

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                  item.isPublished
                    ? 'border-stone-200'
                    : 'border-stone-300 bg-stone-50/80 opacity-75'
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Icon + Category */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-[#071838] group-hover:text-amber-300 transition-colors shadow-xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block truncate">
                          {item.category}
                        </span>
                        <h3 className="font-serif-heading text-base font-bold text-stone-900 leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${statusConfig.color}`}
                    >
                      {item.statusBadge || 'Active'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {item.desc || 'No description provided.'}
                  </p>

                  {/* Photos Preview & Quick Manage Trigger */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {itemPhotos.length > 0 ? (
                        <div className="flex -space-x-2 overflow-hidden py-0.5">
                          {itemPhotos.slice(0, 3).map((p, pIdx) => (
                            <img
                              key={p.id || pIdx}
                              src={resolveMediaUrl(p.url)}
                              alt={p.caption || 'Thumbnail'}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover bg-stone-100 shadow-xs"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="text-[11px] font-semibold text-stone-600">
                        {itemPhotos.length === 0 ? 'No photos yet' : `${itemPhotos.length} ${itemPhotos.length === 1 ? 'photo' : 'photos'}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openPhotoModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/60 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Upload or manage photos for this ministry"
                    >
                      <Camera className="w-3 h-3 text-amber-700" />
                      <span>Photos ({itemPhotos.length})</span>
                    </button>
                  </div>

                  {/* Coordinator & Schedule Details */}
                  {(item.coordinator || item.schedule) && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                      {item.coordinator && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">
                            <strong className="text-stone-700 font-semibold">Lead:</strong>{' '}
                            {item.coordinator}
                          </span>
                        </div>
                      )}
                      {item.schedule && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">
                            <strong className="text-stone-700 font-semibold">Schedule:</strong>{' '}
                            {item.schedule}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                  
                  {/* Reordering Controls */}
                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => handleMove(actualIndex, -1)}
                      disabled={actualIndex === 0}
                      className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold text-stone-400 px-1">
                      #{actualIndex + 1}
                    </span>
                    <button
                      onClick={() => handleMove(actualIndex, 1)}
                      disabled={actualIndex === ministries.length - 1}
                      className="p-1 rounded-lg hover:bg-stone-200 text-stone-600 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Operational Controls */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* Manage Photos Quick Button */}
                    <button
                      onClick={() => openPhotoModal(item)}
                      className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer font-bold flex items-center gap-1"
                      title="Upload and manage photos"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px]">Photos</span>
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      onClick={() => handleTogglePublished(item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        item.isPublished
                          ? 'text-emerald-700 hover:bg-emerald-100'
                          : 'text-stone-400 hover:bg-stone-200'
                      }`}
                      title={item.isPublished ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                    >
                      {item.isPublished ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
                      title="Duplicate ministry"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-[#800020] hover:bg-[#800020]/10 transition-colors cursor-pointer font-bold flex items-center gap-1"
                      title="Edit details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Edit</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete ministry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && createPortal(
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-stone-200 shadow-2xl">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-serif-heading font-bold text-stone-900 text-base">
                Delete Ministry?
              </h4>
              <p className="text-xs text-stone-500">
                Are you sure you want to remove this ministry from the directory? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add / Edit Ministry Modal */}
      {ministryModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#800020]/15 text-[#800020] flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-heading font-bold text-lg text-stone-900">
                    {editingItem ? 'Edit Ministry Details' : 'Add New Parish Ministry'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Enter the apostolate name, liturgical category, coordinator, and schedule
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMinistryModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitMinistry} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Ministry Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Ministry / Apostolate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liturgical Commission & Altar Servers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30 font-medium"
                />
              </div>

              {/* Category & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Category / Apostolate Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    placeholder="e.g. Worship & Liturgy"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Status Badge */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Status Tag
                  </label>
                  <select
                    value={formData.statusBadge}
                    onChange={(e) => setFormData({ ...formData, statusBadge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30 bg-white"
                  >
                    {STATUS_PRESETS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Summary / Scope of Service
                </label>
                <textarea
                  rows={3}
                  placeholder="Servants of the sanctuary assisting the clergy in sacred celebrations and solemn liturgical rites..."
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Select Visual Icon
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl border border-stone-200 bg-stone-50">
                  {AVAILABLE_ICONS.map((ico) => {
                    const Comp = MINISTRY_ICON_MAP[ico.key] || Shield;
                    const isSelected = formData.icon === ico.key;
                    return (
                      <button
                        type="button"
                        key={ico.key}
                        onClick={() => setFormData({ ...formData, icon: ico.key })}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#800020] text-amber-300 ring-2 ring-amber-400 shadow-sm'
                            : 'bg-white hover:bg-stone-200/80 text-stone-700 border border-stone-200'
                        }`}
                        title={ico.label}
                      >
                        <Comp className="w-5 h-5" />
                        <span className="text-[10px] font-semibold truncate max-w-full">
                          {ico.key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coordinator & Meeting Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Lead Coordinator / Spiritual Director
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bro. Michael Santos / Sis. Maria Garcia"
                    value={formData.coordinator}
                    onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Meeting Schedule / Practice Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saturdays 3:00 PM (Parish Hall)"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#800020]/30"
                  />
                </div>
              </div>

              {/* Ministry Photos Gallery Section */}
              <MinistryPhotoSection
                photos={formData.photos || []}
                onChange={(newPhotos) => setFormData({ ...formData, photos: newPhotos })}
              />

              {/* Publication Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                    Publish in Public Directory
                  </span>
                  <span className="text-[11px] text-stone-500">
                    If toggled off, this ministry will remain saved as a draft in CMS and hidden from visitors.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setMinistryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingItem ? 'Update Ministry' : 'Save Ministry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Notice Banner & Page Layout Settings Modal */}
      {bannerModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-heading font-bold text-lg text-stone-900">
                    Public Notice & Page Layout Settings
                  </h2>
                  <p className="text-xs text-stone-500">
                    Customize the announcement card, call-to-actions, and page titles on the public screen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePageSettings} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Notice Banner Section */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#800020] block">
                      Announcement / Notice Banner
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      The large Marian blue card displayed at the top of the public ministries directory.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={pageSettings.ministries_banner_enabled === 'true'}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          ministries_banner_enabled: e.target.checked ? 'true' : 'false',
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
                  </label>
                </div>

                {pageSettings.ministries_banner_enabled === 'true' && (
                  <div className="space-y-4 pt-3 border-t border-stone-200">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Banner Badge Text
                      </label>
                      <input
                        type="text"
                        value={pageSettings.ministries_banner_badge}
                        onChange={(e) =>
                          setPageSettings({
                            ...pageSettings,
                            ministries_banner_badge: e.target.value,
                          })
                        }
                        placeholder="e.g. Section Under Preparation, Volunteer Drive 2026"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Banner Title
                      </label>
                      <input
                        type="text"
                        value={pageSettings.ministries_banner_title}
                        onChange={(e) =>
                          setPageSettings({
                            ...pageSettings,
                            ministries_banner_title: e.target.value,
                          })
                        }
                        placeholder="e.g. Ministries Directory is Currently in the Making"
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Banner Announcement Message
                      </label>
                      <textarea
                        rows={3}
                        value={pageSettings.ministries_banner_desc}
                        onChange={(e) =>
                          setPageSettings({
                            ...pageSettings,
                            ministries_banner_desc: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Page Title & Subtitle Section */}
              <div className="space-y-4">
                <h3 className="font-serif-heading font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
                  Page Header Titles
                </h3>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Super-title / Eyebrow Tag
                  </label>
                  <input
                    type="text"
                    value={pageSettings.ministries_eyebrow}
                    onChange={(e) =>
                      setPageSettings({ ...pageSettings, ministries_eyebrow: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Main Page Heading (H1)
                  </label>
                  <input
                    type="text"
                    value={pageSettings.ministries_title}
                    onChange={(e) =>
                      setPageSettings({ ...pageSettings, ministries_title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={pageSettings.ministries_subtitle}
                    onChange={(e) =>
                      setPageSettings({ ...pageSettings, ministries_subtitle: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Bottom Call to Action Section */}
              <div className="space-y-4">
                <h3 className="font-serif-heading font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
                  Bottom Call to Action Box
                </h3>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    CTA Heading
                  </label>
                  <input
                    type="text"
                    value={pageSettings.ministries_cta_title}
                    onChange={(e) =>
                      setPageSettings({ ...pageSettings, ministries_cta_title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    CTA Description
                  </label>
                  <input
                    type="text"
                    value={pageSettings.ministries_cta_desc}
                    onChange={(e) =>
                      setPageSettings({ ...pageSettings, ministries_cta_desc: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Ministry Photos Manager Modal */}
      {photoModalMinistry && createPortal(
        <div className="fixed inset-0 z-[105] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-heading font-bold text-lg text-stone-900">
                    Manage Photos &mdash; {photoModalMinistry.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Upload church pictures, add captions, and organize photos displayed in the public popup window
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModalMinistry(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <MinistryPhotoSection
                photos={photoList}
                onChange={setPhotoList}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">
                {photoList.length} {photoList.length === 1 ? 'photo' : 'photos'} ready to display
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoModalMinistry(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSavePhotosForMinistry(photoModalMinistry.id, photoList)}
                  className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#66001a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Photos</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
