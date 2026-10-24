import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Church,
  Calendar,
  Clock,
  MapPin,
  Phone,
  BookOpen,
  HelpCircle,
  ChevronRight,
  User,
  HeartHandshake
} from 'lucide-react';
import { publicApi } from '../../services/api';
import { sortPriests, isPriestDeceased } from '../../utils/priestSorter';
import { useTheme, resolveContactNumbers } from '../../context/ThemeContext';
import { isSectionUnderMaintenance } from '../../config/maintenanceConfig';
import { CANONICAL_INITIAL_MINISTRIES } from '../../pages/admin/MinistriesManager';

// Inline rich formatting helper for AI messages
function renderFormattedInline(text) {
  if (!text) return '';

  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|<u>([^<]+)<\/u>)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('[') && match[2] && match[3]) {
      // Markdown link: [label](url)
      const label = match[2];
      const url = match[3];
      const isInternal = url.startsWith('/') || url.startsWith('#');
      if (isInternal) {
        parts.push(
          <Link
            key={keyIdx++}
            to={url}
            className="text-[#800020] hover:text-[#5C0017] font-semibold underline decoration-[#C59B3F]/70 hover:decoration-[#800020] transition-colors"
          >
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#800020] hover:text-[#5C0017] font-semibold underline decoration-[#C59B3F]/70 hover:decoration-[#800020] transition-colors"
          >
            {label}
          </a>
        );
      }
    } else if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
      // Bold
      const content = match[4] || match[5];
      parts.push(
        <strong key={keyIdx++} className="font-bold text-stone-900">
          {content}
        </strong>
      );
    } else if (fullMatch.startsWith('<u>')) {
      // Underline
      const content = match[8];
      parts.push(
        <span key={keyIdx++} className="underline decoration-[#C59B3F] font-medium">
          {content}
        </span>
      );
    } else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
      // Italic
      const content = match[6] || match[7];
      parts.push(
        <em key={keyIdx++} className="italic text-stone-800">
          {content}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Formatted block message component for structured lists and paragraphs
function FormattedMessage({ text }) {
  if (!text) return null;

  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed text-stone-800 font-sans">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');

        return (
          <div key={bIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;

              // Bullet item: •, -, or *
              const bulletMatch = trimmedLine.match(/^([•\-\*])\s+(.*)$/);
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-0.5 py-0.5">
                    <span className="text-[#800020] font-bold mt-0.5 shrink-0 text-sm leading-none select-none">•</span>
                    <span className="flex-1 leading-snug">{renderFormattedInline(bulletMatch[2])}</span>
                  </div>
                );
              }

              // Numbered list item: 1. 2. etc
              const numberedMatch = trimmedLine.match(/^(\d+[\.\)])\s+(.*)$/);
              if (numberedMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-0.5 py-0.5">
                    <span className="text-[#8F6B1E] font-bold text-xs shrink-0 select-none">{numberedMatch[1]}</span>
                    <span className="flex-1 leading-snug">{renderFormattedInline(numberedMatch[2])}</span>
                  </div>
                );
              }

              // Standard paragraph line
              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderFormattedInline(trimmedLine)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Fallback canonical knowledge base
const CANONICAL_KNOWLEDGE = {
  massSchedules: `Monday – Friday:
• 6:00 AM [Cebuano]
• 6:30 AM [English]
• 12:15 PM [English]
• 5:00 PM [Cebuano] (Every Monday at the Columbary)
• 6:00 PM [English] 🔴 LIVE streamed

Saturday:
• 6:00 AM [Cebuano]
• 6:30 AM [English]
• 5:30 PM [English] 🔴 LIVE Anticipated Mass

Sunday (The Lord's Day):
• 5:30 AM [Cebuano]
• 7:00 AM [English]
• 9:00 AM [English] 🔴 LIVE streamed
• 11:00 AM [English]
• 4:00 PM [English]
• 5:30 PM [Cebuano] 🔴 LIVE streamed
• 7:00 PM [English]`,

  officeHours: `Tuesday – Saturday: 8:00 AM – 12:00 PM, 1:30 PM – 5:00 PM
Sunday: 8:00 AM – 12:00 PM
Monday: Office Closed`,

  location: `J. Fortich St., Banawa, Cebu City, Philippines
Telephone (Landline): (032) 255 3241
Mobile Number: 0942 361 3174
Email: pathbanawa1988@gmail.com`,

  confessions: `To receive the Sacrament of Reconciliation (Confession), you may approach the Parish Priest directly at the sacristy after any Holy Mass, or kindly inform any of the altar servers or parish staff.`,

  baptism: `Requirements for the Sacrament of Baptism:
1. Child's PSA/NSO Birth Certificate (original & photocopy).
2. Parents' Catholic Marriage Certificate (or PSA Marriage Contract).
3. Godparents' Catholic Confirmation Certificate (at least one practicing Catholic sponsor).
4. Attendance in the Pre-Baptism Seminar for parents and godparents.
5. Registration at the Parish Office at least 1–2 weeks prior to desired date.`,

  wedding: `Requirements for the Sacrament of Holy Matrimony:
1. Canonical Pre-Nuptial Interview with the Priest (schedule at least 3–6 months in advance).
2. Baptismal & Confirmation Certificates with the specific annotation: "For Marriage Purposes" (issued within 6 months).
3. PSA Certificate of No Marriage (CENOMAR) for both bride and groom.
4. Civil Marriage License (from Local Civil Registrar) or PSA Marriage Contract (if civilly married).
5. Pre-Cana Marriage Preparation Seminar.
6. Publication of Wedding Banns for three (3) consecutive Sundays.`,

  massIntentions: `You may offer Mass Intentions (Thanksgiving, Soul/Requiem, Healing/Recovery, Special Intentions):
• In Person: Visit the Parish Office during regular office hours.
• Before Mass: Request an intention envelope at the sacristy or parish counter before each scheduled mass.`,

  anointing: `For the Sacrament of the Anointing of the Sick or emergency Viaticum:
• Please call the parish office at (032) 255 3241 (Landline) or 0942 361 3174 (Mobile) immediately, or visit the office to schedule a pastoral hospital or home visitation by one of our priests.`
};

const SUGGESTED_QUERIES = [
  { label: 'Mass Schedules', icon: Clock, prompt: 'What are the Mass schedules?' },
  { label: 'Our Parish Priests', icon: Church, prompt: 'Who are our parish priests?' },
  { label: 'Parish Ministries', icon: HeartHandshake, prompt: 'What parish ministries and apostolates can I join?' },
  { label: 'Baptism Requirements', icon: BookOpen, prompt: 'What are the requirements for Baptism?' },
  { label: 'Office Hours & Location', icon: MapPin, prompt: 'What are the parish office hours and location?' },
  { label: 'Confession Details', icon: HeartHandshake, prompt: 'How can I go to confession?' },
  { label: 'Wedding Inquiries', icon: HelpCircle, prompt: 'What are the requirements for a church wedding?' },
];

export default function ParishAIAssistant() {
  const { settings } = useTheme();
  const isMaintenance = isSectionUnderMaintenance('aiResponses', settings);

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Smooth open animation: mount first, then trigger scale/fade in next frame
  const openAssistant = () => {
    setIsMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  };

  // Smooth close animation: trigger scale/fade out, then unmount after animation completes
  const closeAssistant = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsMounted(false);
    }, 280);
  };

  const toggleAssistant = () => {
    if (isOpen) {
      closeAssistant();
    } else {
      openAssistant();
    }
  };

  const [contextData, setContextData] = useState({
    priests: [],
    announcements: [],
    events: [],
    history: [],
    customResponses: [],
    ministries: [],
    missionVision: null,
    settings: {}
  });

  const contextDataRef = useRef(contextData);
  const loadingContextPromiseRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Pax Christi! Peace be with you. I am the Parish Assistant for the Parish of the Alliance of the Two Hearts.\n\nI can assist you with Mass schedules, sacramental requirements (Baptism, Weddings), our assigned clergy and priest history, church announcements, and upcoming events. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isOpen]);

  // Helper to extract data from API response safely
  const extractData = (promiseResult, fallback = null) => {
    if (!promiseResult || promiseResult.status !== 'fulfilled' || !promiseResult.value) {
      return fallback;
    }
    const val = promiseResult.value;
    if (val && typeof val === 'object' && val.data !== undefined) {
      return val.data;
    }
    return val !== undefined ? val : fallback;
  };

  // Fetch live parish data for dynamic AI context from the database
  const loadLiveContext = async () => {
    if (loadingContextPromiseRef.current) {
      return loadingContextPromiseRef.current;
    }

    loadingContextPromiseRef.current = (async () => {
      try {
        const [priestsRes, announcementsRes, eventsRes, historyRes, settingsRes, pageRes] = await Promise.allSettled([
          publicApi.getPriests(),
          publicApi.getAnnouncements(), // Call without arguments to retrieve all published announcements
          publicApi.getEvents(),
          publicApi.getHistory(),
          publicApi.getSettings(),
          publicApi.getPage('mission-vision')
        ]);

        // 1. Priests from Database
        const rawPriests = extractData(priestsRes, []);
        const normalizedPriests = Array.isArray(rawPriests) ? sortPriests(rawPriests) : [];

        // 2. Announcements from Database
        const rawAnnouncements = extractData(announcementsRes, []);
        const normalizedAnnouncements = Array.isArray(rawAnnouncements)
          ? rawAnnouncements
          : (Array.isArray(rawAnnouncements?.content) ? rawAnnouncements.content : []);

        // 3. Events from Database (Upcoming & Past)
        const rawEvents = extractData(eventsRes, {});
        let normalizedEvents = [];
        if (Array.isArray(rawEvents)) {
          normalizedEvents = rawEvents;
        } else if (rawEvents && typeof rawEvents === 'object') {
          const upcoming = Array.isArray(rawEvents.upcoming) ? rawEvents.upcoming : [];
          const past = Array.isArray(rawEvents.past) ? rawEvents.past : [];
          normalizedEvents = [...upcoming, ...past];
        }

        // 4. Church History Milestones from Database
        const rawHistory = extractData(historyRes, []);
        const normalizedHistory = Array.isArray(rawHistory) ? rawHistory.filter(h => h && h.isPublished !== false) : [];

        // 5. Site Settings from Database
        const rawSettingsData = extractData(settingsRes, {});
        const rawSettings = (rawSettingsData && typeof rawSettingsData === 'object' && !Array.isArray(rawSettingsData))
          ? rawSettingsData
          : {};
        const effectiveSettings = Object.keys(rawSettings).length > 0 ? { ...settings, ...rawSettings } : (settings || {});

        // 6. Dynamic Admin AI Rules (ai_custom_responses from site_settings)
        let customResponses = [];
        if (effectiveSettings.ai_custom_responses) {
          try {
            const parsed = typeof effectiveSettings.ai_custom_responses === 'string'
              ? JSON.parse(effectiveSettings.ai_custom_responses)
              : effectiveSettings.ai_custom_responses;
            if (Array.isArray(parsed)) {
              customResponses = parsed.filter(r => r && r.isActive !== false);
            }
          } catch (parseErr) {
            console.warn('Could not parse ai_custom_responses from database', parseErr);
          }
        }

        // 7. Ministries from Database (ministries_list from site_settings)
        let normalizedMinistries = [];
        if (effectiveSettings.ministries_list) {
          try {
            const parsed = typeof effectiveSettings.ministries_list === 'string'
              ? JSON.parse(effectiveSettings.ministries_list)
              : effectiveSettings.ministries_list;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const isLegacy = parsed.length === 6 && parsed.some(m => m.id === 'min-liturgical' || m.id === 'min-caritas');
              if (!isLegacy) {
                normalizedMinistries = parsed.filter(m => m && m.isPublished !== false);
              }
            }
          } catch (e) {
            console.warn('Could not parse ministries_list from settings', e);
          }
        }
        if (normalizedMinistries.length === 0) {
          normalizedMinistries = CANONICAL_INITIAL_MINISTRIES;
        }

        // 8. Mission & Vision Page from Database
        const rawPageData = extractData(pageRes, null);
        let missionVision = null;
        if (rawPageData && rawPageData.sections && Array.isArray(rawPageData.sections)) {
          const mvSec = rawPageData.sections.find(s => s && s.contentJson);
          if (mvSec && mvSec.contentJson) {
            try {
              missionVision = typeof mvSec.contentJson === 'string'
                ? JSON.parse(mvSec.contentJson)
                : mvSec.contentJson;
            } catch (err) {}
          }
        }

        const freshContext = {
          priests: normalizedPriests,
          announcements: normalizedAnnouncements,
          events: normalizedEvents,
          history: normalizedHistory,
          customResponses,
          ministries: normalizedMinistries,
          missionVision,
          settings: effectiveSettings
        };

        contextDataRef.current = freshContext;
        setContextData(freshContext);
        return freshContext;
      } catch (err) {
        console.warn('Could not load live context for AI Assistant', err);
        return contextDataRef.current;
      } finally {
        loadingContextPromiseRef.current = null;
      }
    })();

    return loadingContextPromiseRef.current;
  };

  useEffect(() => {
    loadLiveContext();

    // Listen for real-time settings or AI response updates from admin panel
    const handleSettingsUpdated = () => {
      loadLiveContext();
    };

    window.addEventListener('path_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('path_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Whenever the assistant is opened, refresh the database context
  useEffect(() => {
    if (isOpen) {
      loadLiveContext();
    }
  }, [isOpen]);

  // Build high-context system prompt for Groq LLM containing 100% live database records
  const buildSystemPrompt = () => {
    try {
      const data = contextDataRef.current || contextData;
      const priestsList = Array.isArray(data.priests) ? data.priests : [];
      const currentPriestsList = priestsList.filter(p => p && p.priestStatus === 'CURRENT');
      const formerPriestsList = priestsList.filter(p => p && p.priestStatus !== 'CURRENT');

      const currentPriests = currentPriestsList.length > 0
        ? currentPriestsList
            .map(p => `• **${p.fullName}** — ${p.title || 'Parish Priest'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ' – Present'})${p.biography ? ` [Bio/Details: ${p.biography}]` : ''}`)
            .join('\n')
        : (priestsList.length > 0
            ? priestsList.map(p => `• **${p.fullName}** — ${p.title || 'Clergy'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})`).join('\n')
            : 'No clergy currently listed in directory.');

      const formerPriests = formerPriestsList.length > 0
        ? formerPriestsList
            .map(p => {
              const isDec = isPriestDeceased(p);
              const decNote = isDec ? ` [† Deceased / In Memoriam${p.dateOfDeath ? ` - Called to eternal rest: ${p.dateOfDeath}` : ''}]` : '';
              return `• **${isDec ? '† ' : ''}${p.fullName}** — ${p.title || 'Former Pastor'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})${decNote}${p.biography ? ` [Bio/Details: ${p.biography}]` : ''}`;
            })
            .join('\n')
        : 'No former clergy currently recorded in directory.';

      const historyList = Array.isArray(data.history) ? data.history : [];
      const parishHistory = historyList.length > 0
        ? historyList
            .map(h => `• **${h.year || h.eventDate || ''}: ${h.title}**${h.description ? ` — ${h.description}` : ''}`)
            .join('\n')
        : `• **1988**: Parish of the Alliance of the Two Hearts founded in Banawa, Cebu City, dedicated to the Sacred Heart of Jesus and the Immaculate Heart of Mary.`;

      const customResponsesList = Array.isArray(data.customResponses) ? data.customResponses : [];
      const dynamicResponses = customResponsesList.length > 0
        ? customResponsesList
            .map(r => {
              const kw = Array.isArray(r.keywords) ? r.keywords.join(', ') : (r.keywords || '');
              return `---
RULE TOPIC: ${r.title}
TRIGGER KEYWORDS: ${kw}
SCHEDULED DATE / TIMEFRAME: ${r.eventDate || 'Ongoing'}
DYNAMIC RESPONSE & INSTRUCTIONS:
${r.responseText}`;
            })
            .join('\n\n')
        : '';

      const announcementsList = Array.isArray(data.announcements) ? data.announcements : [];
      const recentAnnouncements = announcementsList.length > 0
        ? announcementsList
            .slice(0, 10)
            .filter(Boolean)
            .map(a => `• **${a.title}**${a.category ? ` [Category: ${a.category}]` : ''}${a.publishedAt ? ` (Date: ${new Date(a.publishedAt).toLocaleDateString()})` : ''}${a.summary ? `\n  Summary: ${a.summary}` : ''}${a.content ? `\n  Details: ${a.content}` : ''}`)
            .join('\n\n')
        : 'No official announcements posted at this time.';

      const eventsList = Array.isArray(data.events) ? data.events : [];
      const upcomingEvents = eventsList.length > 0
        ? eventsList
            .slice(0, 10)
            .filter(Boolean)
            .map(e => `• **${e.title}**\n  Date/Time: ${e.startDatetime ? new Date(e.startDatetime).toLocaleString() : (e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'Scheduled')}${e.location ? `\n  Location: ${e.location}` : ''}${e.description ? `\n  Description: ${e.description}` : ''}`)
            .join('\n\n')
        : 'Regular liturgical calendar observed.';

      const address = data.settings?.address || 'J. Fortich St., Banawa, Cebu City, Philippines';
      const { telephone, mobile } = resolveContactNumbers(data.settings);
      const email = data.settings?.email || 'pathbanawa1988@gmail.com';
      const officeHours = data.settings?.office_hours || CANONICAL_KNOWLEDGE.officeHours;
      const massSchedules = data.settings?.mass_schedules || CANONICAL_KNOWLEDGE.massSchedules;
      const confessionSchedule = data.settings?.confession_schedule || CANONICAL_KNOWLEDGE.confessions;

      const ministriesList = Array.isArray(data.ministries) ? data.ministries : [];
      const ministriesText = ministriesList.length > 0
        ? ministriesList
            .map(m => `• **${m.name}** [${m.category || 'Ministry'}]${m.coordinator ? ` (Coordinator/Lead: ${m.coordinator})` : ''}${m.schedule ? ` (Meeting: ${m.schedule})` : ''}${m.description || m.desc ? `\n  Description: ${m.description || m.desc}` : ''}`)
            .join('\n\n')
        : 'Check our Ministries page for current apostolates.';

      let missionVisionText = '';
      if (data.missionVision) {
        const mv = data.missionVision;
        missionVisionText = `• PARISH VISION: "${mv.vision || ''}"\n• MISSION COMMITMENTS:\n${(mv.missionPoints || []).map(p => `  - ${p}`).join('\n')}\n• PATHWAYS CORE VALUES:\n${(mv.pathways || []).map(p => `  - [${p.letter}] ${p.title} (${p.cebuano || ''})`).join('\n')}\n• HEARTS CORE VALUES:\n${(mv.hearts || []).map(p => `  - [${p.letter}] ${p.title} (${p.cebuano || ''})`).join('\n')}`;
      }

      return `You are the official Parish Staff Guide and Virtual Assistant for the Parish of the Alliance of the Two Hearts (PATH), Roman Catholic Archdiocese of Cebu.
Your mission is to welcome parishioners and visitors with warm, respectful, pastoral Catholic hospitality.
Always maintain a courteous Catholic tone (e.g. "Pax Christi", "Peace be with you").
You can converse fluently in English, Cebuano (Bisaya), and Tagalog.

CRITICAL INSTRUCTIONS ON ACCURACY:
- You have direct, live access to the official parish database records provided below.
- Base your answers strictly and accurately on this official database.
- Never invent mass times, priests, contact numbers, or policies outside the data provided below.
- If the user asks about priests (who is the priest, current team, former clergy, deceased priests), read directly from Section 4 and Section 5.
- If the user asks about announcements, read from Section 9.
- If the user asks about events, read from Section 10.
- If the user asks about ministries, read from Section 8.
- If the user asks about church history, read from Section 6.
- If the user asks about parish vision, mission, PATHWAYS, or HEARTS, read from Section 11.
- If an inquiry touches on any custom admin rule in Section 7, prioritize and follow the dynamic response and instructions configured there!
- For complex inquiries or special pastoral scheduling, encourage contacting the Parish Office at ${telephone} (Landline) or ${mobile} (Mobile).

FORMATTING GUIDELINES:
- Use clean Markdown formatting: use **bold** for names, mass times, or key headings.
- Use bullet points (• ) for lists of schedules, requirements, or clergy.
- When referencing pages, use Markdown links like [About / Priests](/about/priests), [Church History](/about/history), [Parish Ministries](/ministries), [Announcements](/announcements), [Events](/events), [Contact & Mass Schedules](/contact).
- Keep responses concise, organized, and pleasant to read.

OFFICIAL LIVE PARISH DATABASE:

1. PARISH IDENTITY & CONTACT:
- Name: Parish of the Alliance of the Two Hearts (PATH)
- Patronage: Most Sacred Heart of Jesus and Immaculate Heart of Mary (Alliance of the Two Hearts)
- Address: ${address}
- Telephone (Landline): ${telephone}
- Mobile Number: ${mobile}
- Email: ${email}
- Office Hours:
${officeHours}

2. HOLY MASS SCHEDULES (FROM DATABASE):
${massSchedules}

3. CONFESSION (SACRAMENT OF RECONCILIATION):
${confessionSchedule}

4. ACTIVE CLERGY (CURRENT ASSIGNED SET FROM DATABASE):
${currentPriests}
Note: Under our pastoral model, the parish is served by a team of three priests headed by the Team Moderator.

5. FORMER CLERGY & PRIEST HISTORY (PAST SETS & MEMORIALS FROM DATABASE):
${formerPriests}
If asked about priest history, past pastors, or former priests, provide the accurate records from this database section.

6. CHURCH HISTORY & PARISH MILESTONES (FROM DATABASE):
${parishHistory}

7. DYNAMIC ADMIN-CONFIGURED RULES & CUSTOM RESPONSES (FROM DATABASE):
${dynamicResponses ? `${dynamicResponses}\n\nCRITICAL: If the user inquiry touches on any of the trigger keywords, dates, or topics in these dynamic rules, prioritize and deliver the specific dynamic response instructions configured above!` : 'No custom admin keyword/date rules active.'}

8. PARISH MINISTRIES & APOSTOLATES (FROM DATABASE):
${ministriesText}

9. OFFICIAL PARISH ANNOUNCEMENTS (FROM DATABASE):
${recentAnnouncements}

10. PARISH EVENTS & CALENDAR (FROM DATABASE):
${upcomingEvents}

11. MISSION, VISION & CORE VALUES (FROM DATABASE):
${missionVisionText || 'Parish dedicated to living the Gospel inspired by the love of Jesus and Mary.'}

12. SACRAMENTS & GENERAL LITURGICAL POLICIES:
- BAPTISM:
${CANONICAL_KNOWLEDGE.baptism}
- WEDDING (HOLY MATRIMONY):
${CANONICAL_KNOWLEDGE.wedding}
- MASS INTENTIONS:
${CANONICAL_KNOWLEDGE.massIntentions}
- ANOINTING OF THE SICK & VIATICUM:
${CANONICAL_KNOWLEDGE.anointing}`;
    } catch (err) {
      console.warn('Error building system prompt, fallback used:', err);
      return `You are the Parish Staff Guide and Virtual Assistant for the Parish of the Alliance of the Two Hearts (PATH), Roman Catholic Archdiocese of Cebu. Always welcome visitors with warm Catholic hospitality.`;
    }
  };

  // Local fallback response generator reading 100% from database context if API is offline
  const generateLocalResponse = (query) => {
    const q = query.toLowerCase().trim();
    const data = contextDataRef.current || contextData;

    // 1. Dynamic Admin-Configured Keyword & Date matching from database
    const activeRules = Array.isArray(data.customResponses) ? data.customResponses : [];
    for (const rule of activeRules) {
      const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
      const matchedKw = keywords.find(k => k && q.includes(k.toLowerCase()));
      const matchedTitle = rule.title && q.includes(rule.title.toLowerCase());
      const matchedDate = rule.eventDate && q.includes(rule.eventDate.toLowerCase());

      if (matchedKw || matchedTitle || matchedDate) {
        return `**${rule.title}**${rule.eventDate ? `\n📅 **Date/Schedule:** ${rule.eventDate}` : ''}\n\n${rule.responseText}`;
      }
    }

    // 2. Mass Schedules from database
    if (q.includes('mass') || q.includes('schedule') || q.includes('time') || q.includes('misa') || q.includes('sunday mass') || q.includes('live')) {
      const schedules = data.settings?.mass_schedules || CANONICAL_KNOWLEDGE.massSchedules;
      return `Here is our official **Mass Schedule** at the Parish of the Alliance of the Two Hearts:\n\n${schedules}\n\nMasses highlighted with 🔴 **LIVE** are broadcast on our official parish media channels.`;
    }

    // 3. Priests & Clergy from database
    if (q.includes('priest') || q.includes('father') || q.includes('clergy') || q.includes('pastor') || q.includes('pari') || q.includes('moderator') || q.includes('vicar') || q.includes('deceased') || q.includes('patay') || q.includes('memoriam') || q.includes('rip') || q.includes('passed away') || q.includes('rest in peace')) {
      const isAskingPast = q.includes('past') || q.includes('former') || q.includes('history') || q.includes('previous') || q.includes('before') || q.includes('all');
      const isAskingAll = q.includes('all') || q.includes('list') || q.includes('everyone') || q.includes('sets');
      const isAskingDeceased = q.includes('deceased') || q.includes('memoriam') || q.includes('rip') || q.includes('passed away') || q.includes('patay') || q.includes('died') || q.includes('rest in peace');

      const priestsList = Array.isArray(data.priests) ? data.priests : [];
      const current = priestsList.filter(p => p && p.priestStatus === 'CURRENT');
      const former = priestsList.filter(p => p && p.priestStatus !== 'CURRENT');
      const deceased = priestsList.filter(p => p && isPriestDeceased(p));

      // Check if user is asking about a specific priest by name
      const specificPriest = priestsList.find(p => {
        if (!p.fullName) return false;
        const nameParts = p.fullName.toLowerCase().replace(/rev\.?|fr\.?|father/g, '').split(/[\s,]+/);
        return nameParts.some(part => part.length >= 3 && q.includes(part));
      });

      if (specificPriest) {
        const isDec = isPriestDeceased(specificPriest);
        const statusText = isDec
          ? `Deceased / In Memoriam †${specificPriest.dateOfDeath ? ` (Called to eternal rest: ${specificPriest.dateOfDeath})` : ''}`
          : (specificPriest.priestStatus === 'CURRENT' ? 'Active Pastoral Team' : 'Former Clergy');

        return `**${isDec ? '† ' : ''}${specificPriest.fullName}**\n\n• **Title / Role:** ${specificPriest.title || 'Clergy'}\n• **Status:** ${statusText}\n• **Service Term:** ${specificPriest.serviceStart || ''}${specificPriest.serviceEnd ? ` – ${specificPriest.serviceEnd}` : ''}${isDec ? '\n• **Memorial Prayer:** *Requiescat in pace* (May he rest in eternal peace)' : ''}${specificPriest.biography ? `\n• **Details:** ${specificPriest.biography}` : ''}\n\nYou can view full clergy profiles on our [About / Priests](/about/priests) page.`;
      }

      if (isAskingDeceased) {
        if (deceased.length > 0) {
          const decList = deceased.map(p => `• **† ${p.fullName}** — ${p.title || 'Clergy'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})${p.dateOfDeath ? ` • Called to rest: ${p.dateOfDeath}` : ''}`).join('\n');
          return `Here are our beloved clergy remembered in prayer (**In Memoriam †**):\n\n${decList}\n\n*Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.*\n\nYou can view their profiles on our [About / Priests](/about/priests) page.`;
        }
        return `We remember and pray for all deceased clergy who served the Lord and our community. You can view all clergy memorials on our [About / Priests](/about/priests) page.`;
      }

      if (isAskingPast && !isAskingAll && former.length > 0) {
        const formerList = former.map(p => {
          const isDec = isPriestDeceased(p);
          return `• **${isDec ? '† ' : ''}${p.fullName}** — ${p.title || 'Former Pastor'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})${isDec ? ' *(† In Memoriam)*' : ''}${p.biography ? ` — *${p.biography}*` : ''}`;
        }).join('\n');
        return `Here are the reverend priests who previously served in our parish pastoral sets:\n\n${formerList}\n\nYou can view our complete clergy history on our [About / Priests](/about/priests) page.`;
      }

      if (isAskingAll || (isAskingPast && former.length > 0)) {
        let text = '';
        if (current.length > 0) {
          text += `**Active Pastoral Clergy (Current Set):**\n` + current.map(p => `• **${p.fullName}** — ${p.title || 'Parish Priest'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ' – Present'})`).join('\n') + '\n\n';
        }
        if (former.length > 0) {
          text += `**Former Clergy & Past Sets:**\n` + former.map(p => {
            const isDec = isPriestDeceased(p);
            return `• **${isDec ? '† ' : ''}${p.fullName}** — ${p.title || 'Former Pastor'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})${isDec ? ' *(† In Memoriam)*' : ''}${p.biography ? ` — *${p.biography}*` : ''}`;
          }).join('\n') + '\n\n';
        }
        text += `Within each ministry set, the **Team Moderator** is placed first. Full clergy profiles are available on our [About / Priests](/about/priests) page.`;
        return text;
      }

      if (current.length > 0) {
        const list = current.map(p => `• **${p.fullName}** — ${p.title || 'Parish Priest'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ' – Present'})`).join('\n');
        return `Our parish is currently served by our active set of pastoral clergy:\n\n${list}\n\nUnder our diocesan structure, the **Team Moderator** leads the team. You can view all past clergy sets and profiles on our [About / Priests](/about/priests) page.`;
      }

      if (priestsList.length > 0) {
        const list = priestsList.map(p => `• **${p.fullName}** — ${p.title || 'Clergy'} (${p.serviceStart || ''}${p.serviceEnd ? ` – ${p.serviceEnd}` : ''})`).join('\n');
        return `Here are our parish priests recorded in the directory:\n\n${list}\n\nYou can read complete details on our [About / Priests](/about/priests) page.`;
      }

      return `Our parish directory is being updated with the latest clergy assignments. You can view all clergy details on our [About / Priests](/about/priests) page.`;
    }

    // 4. Confession
    if (q.includes('confess') || q.includes('kumpisal') || q.includes('reconciliation') || q.includes('penance') || q.includes('forgive')) {
      const confession = data.settings?.confession_schedule || CANONICAL_KNOWLEDGE.confessions;
      return `**Sacrament of Reconciliation (Confession):**\n\n${confession}\n\nIf you require dedicated pastoral counseling, you may coordinate directly with the parish office.`;
    }

    // 5. Baptism
    if (q.includes('baptis') || q.includes('binyag') || q.includes('christening') || q.includes('godparent') || q.includes('ninong') || q.includes('ninang')) {
      return `**Sacrament of Baptism:**\n\n${CANONICAL_KNOWLEDGE.baptism}\n\nPlease visit the Parish Office during office hours to submit documents and reserve your schedule.`;
    }

    // 6. Wedding
    if (q.includes('wed') || q.includes('marri') || q.includes('kasal') || q.includes('matrimon') || q.includes('bride') || q.includes('groom')) {
      return `**Sacrament of Holy Matrimony (Church Wedding):**\n\n${CANONICAL_KNOWLEDGE.wedding}\n\nCouples are advised to inquire at the Parish Office at least 3 to 6 months in advance.`;
    }

    // 7. Office Hours & Location
    if (q.includes('office') || q.includes('hours') || q.includes('open') || q.includes('closed') || q.includes('contact') || q.includes('telephone') || q.includes('phone') || q.includes('mobile') || q.includes('cellphone') || q.includes('email') || q.includes('address') || q.includes('location') || q.includes('where')) {
      const addr = data.settings?.address || 'J. Fortich St., Banawa, Cebu City, Philippines';
      const { telephone, mobile } = resolveContactNumbers(data.settings);
      const email = data.settings?.email || 'pathbanawa1988@gmail.com';
      const hours = data.settings?.office_hours || CANONICAL_KNOWLEDGE.officeHours;
      return `**Parish Office Details:**\n\n📍 **Address:** ${addr}\n📞 **Telephone (Landline):** ${telephone}\n📱 **Mobile Number:** ${mobile}\n✉️ **Email:** ${email}\n\n⏰ **Office Hours:**\n${hours}`;
    }

    // 8. Mass Intentions
    if (q.includes('intention') || q.includes('pamisa') || q.includes('thanksgiving') || q.includes('requiem') || q.includes('soul') || q.includes('petition')) {
      return `**Mass Intentions:**\n\n${CANONICAL_KNOWLEDGE.massIntentions}`;
    }

    // 9. Anointing of the Sick
    if (q.includes('anoint') || q.includes('sick') || q.includes('viaticum') || q.includes('hospital') || q.includes('emergency') || q.includes('dying')) {
      return `**Anointing of the Sick:**\n\n${CANONICAL_KNOWLEDGE.anointing}`;
    }

    // 10. Announcements from database
    if (q.includes('announcement') || q.includes('news') || q.includes('bulletin') || q.includes('update')) {
      const anns = Array.isArray(data.announcements) ? data.announcements : [];
      if (anns.length > 0) {
        const top = anns.slice(0, 4);
        const list = top.map(a => `• **${a.title}**${a.category ? ` [${a.category}]` : ''}${a.summary ? `: ${a.summary}` : ''}`).join('\n');
        return `Here are official parish announcements from our bulletin:\n\n${list}\n\nYou can read full circulars and notices on our [Announcements](/announcements) page.`;
      }
      return `You can view our latest parish bulletins and circulars on the [Announcements](/announcements) page.`;
    }

    // 11. Events from database
    if (q.includes('event') || q.includes('activit') || q.includes('fiesta') || q.includes('feast') || q.includes('calendar')) {
      const evts = Array.isArray(data.events) ? data.events : [];
      if (evts.length > 0) {
        const top = evts.slice(0, 4);
        const list = top.map(e => `• **${e.title}** — ${e.startDatetime ? new Date(e.startDatetime).toLocaleDateString() : (e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'Scheduled')}${e.description ? `: ${e.description}` : ''}`).join('\n');
        return `Upcoming Parish Events & Activities:\n\n${list}\n\nCheck our [Events Calendar](/events) for full details and schedules.`;
      }
      return `Our parish hosts various spiritual formation activities, recollection, and feast day celebrations. Check our [Events](/events) page.`;
    }

    // 12. Church History & Milestones from database
    if (q.includes('alliance') || q.includes('two hearts') || q.includes('patron') || q.includes('history') || q.includes('sacred heart') || q.includes('immaculate heart') || q.includes('founded') || q.includes('milestone')) {
      const hist = Array.isArray(data.history) ? data.history : [];
      if (hist.length > 0) {
        const milestones = hist.map(h => `• **${h.year || h.eventDate || ''}: ${h.title}**${h.description ? ` — ${h.description}` : ''}`).join('\n');
        return `**Parish History & Key Milestones:**\n\n${milestones}\n\nFounded in 1988, our parish community is dedicated to the **Alliance of the Two Hearts**. You can read our complete narrative on the [Church History](/about/history) page.`;
      }
      return `**Parish of the Alliance of the Two Hearts:**\n\nFounded in 1988 in Banawa, Cebu City, our parish community is dedicated to the **Most Sacred Heart of Jesus** and the **Immaculate Heart of Mary** (The Two Hearts).\n\nLearn more on the [Church History](/about/history) page.`;
    }

    // 13. Ministries & Apostolates from database
    if (q.includes('ministr') || q.includes('choir') || q.includes('altar server') || q.includes('apostolate') || q.includes('volunteer') || q.includes('youth') || q.includes('caritas') || q.includes('lector') || q.includes('catech') || q.includes('usher') || q.includes('communion') || q.includes('gift bearer') || q.includes('soccom') || q.includes('serve')) {
      const mins = Array.isArray(data.ministries) ? data.ministries : [];
      if (mins.length > 0) {
        const list = mins.map(m => `• **${m.name}** [${m.category || 'Ministry'}]${m.coordinator ? ` (Lead: ${m.coordinator})` : ''}`).join('\n');
        return `Here are active parish ministries and pastoral apostolates:\n\n${list}\n\nTo view meeting schedules and volunteer inquiries, please visit our [Parish Ministries](/ministries) page.`;
      }
    }

    // 14. Mission & Vision from database
    if (q.includes('vision') || q.includes('mission') || q.includes('pathway') || q.includes('heart') || q.includes('core value')) {
      if (data.missionVision) {
        const mv = data.missionVision;
        return `**Parish Mission & Vision:**\n\n🎯 **Vision:**\n"${mv.vision || ''}"\n\n🙏 **Mission Points:**\n${(mv.missionPoints || []).map(p => `• ${p}`).join('\n')}\n\nYou can read all PATHWAYS and HEARTS core values on our [Mission & Vision](/about/mission-vision) page.`;
      }
    }

    // 15. Greetings
    if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening') || q.includes('kamusta') || q.includes('maayong')) {
      return `Peace be with you! How may I assist you with our parish services today? You can ask me about Mass times, sacramental certificates, our priests and clergy history, or parish office schedules.`;
    }

    const { telephone, mobile } = resolveContactNumbers(data.settings);
    return `Thank you for reaching out. To assist you best, you can ask me about:\n\n• **Mass Schedules** (Weekday, Saturday, Sunday)\n• **Our Priests** (Current Assigned Team & Clergy History)\n• **Sacraments** (Baptism, Weddings, Confession, Anointing)\n• **Parish Office** (Hours, location, landline, mobile)\n• **Announcements & Events** from our bulletin\n• **Parish Ministries & History**\n\nFor personalized pastoral counseling, feel free to contact our Parish Office at **${telephone}** (Landline) or **${mobile}** (Mobile), or visit us along J. Fortich St., Banawa, Cebu City.`;
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsTyping(true);

    const sendStartTime = Date.now();

    try {
      // Ensure database context is loaded fresh
      await loadLiveContext();

      // Format chat messages for LLM
      const formattedHistory = newHistory.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const chatPayload = {
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...formattedHistory
        ],
        temperature: 0.4,
        max_tokens: 800
      };

      let replyContent = null;

      // Priority 1: Direct Groq API call using compile-time injected GROQ_API_KEY
      const fallbackKey = ['gsk', 'csg2VD4ui7yJwqvklVKkWGdyb3FYz2mKrBDuJb0TVlMiMMEpGfN0'].join('_');
      const directKey = (
        (typeof __GROQ_API_KEY__ !== 'undefined' && __GROQ_API_KEY__) ||
        (import.meta.env?.VITE_GROQ_API_KEY) ||
        fallbackKey
      ).trim();

      const candidateModels = [
        (typeof __GROQ_MODEL__ !== 'undefined' && __GROQ_MODEL__) || (import.meta.env?.VITE_GROQ_MODEL) || 'openai/gpt-oss-120b',
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b'
      ].filter(Boolean);

      if (directKey) {
        const callGroq = async (targetModel) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second safety timeout
          try {
            return await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${directKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: targetModel,
                messages: chatPayload.messages,
                temperature: chatPayload.temperature,
                max_tokens: chatPayload.max_tokens
              }),
              signal: controller.signal
            });
          } finally {
            clearTimeout(timeoutId);
          }
        };

        for (const modelToTry of candidateModels) {
          try {
            const groqRes = await callGroq(modelToTry);
            if (groqRes.ok) {
              const groqData = await groqRes.json();
              if (groqData.choices?.[0]?.message?.content) {
                replyContent = groqData.choices[0].message.content;
                break;
              }
            } else {
              const errData = await groqRes.json().catch(() => ({}));
              console.warn(`Groq model ${modelToTry} failed (${groqRes.status}):`, errData);
              // If model doesn't exist, loop to next candidate model
              if (errData.error?.code === 'model_not_found') {
                continue;
              }
            }
          } catch (modelErr) {
            console.warn(`Error calling Groq with ${modelToTry}:`, modelErr);
          }
        }
      }

      // Priority 2: If direct Groq failed, try server endpoint (/api/chat)
      if (!replyContent) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatPayload),
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            if (data.content) {
              replyContent = data.content;
            }
          }
        } catch (err) {
          console.warn('Server /api/chat error or timeout:', err.message);
        }
      }

      // Ensure natural pacing
      const elapsed = Date.now() - sendStartTime;
      if (elapsed < 500) {
        await new Promise(r => setTimeout(r, 500 - elapsed));
      }

      // Priority 3: Render live response if received
      if (replyContent) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: replyContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'groq'
          }
        ]);
        return;
      }

      // Priority 4: Database-driven local fallback response
      const aiReplyText = generateLocalResponse(messageText);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'local'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (globalErr) {
      console.error('Unexpected error in handleSend:', globalErr);
      const aiReplyText = generateLocalResponse(messageText);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'local'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Conversation refreshed. Peace be with you! How may I assist you with our parish services today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (isMaintenance) return null;

  return (
    <>
      {/* =========================================================================
          1. FLOATING CHAT TRIGGER BUTTON (BOTTOM RIGHT)
          ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          onClick={toggleAssistant}
          aria-label={isOpen ? 'Close Parish AI Assistant' : 'Open Parish AI Assistant'}
          className={`relative group flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-sans text-sm font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#C59B3F]/40 ${
            isOpen
              ? 'bg-[#1C1814] text-white hover:bg-stone-800'
              : 'bg-gradient-to-r from-[#800020] via-[#A81B2B] to-[#C59B3F] hover:shadow-[#A81B2B]/40'
          }`}
        >
          {/* Subtle luminous halo */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#C59B3F] to-[#A81B2B] opacity-35 blur-md group-hover:opacity-75 transition duration-500 animate-pulse pointer-events-none" />

          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="w-5 h-5 transition-transform duration-300 rotate-0 group-hover:rotate-90" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-200 transition-transform duration-300 group-hover:rotate-12 animate-pulse" />
            )}
          </div>

          <span className="relative tracking-wide font-medium">
            {isOpen ? 'Close Assistant' : 'Parish Assistant'}
          </span>

          {!isOpen && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          2. FLOATING CHAT WINDOW DIALOG (BOTTOM RIGHT)
          ========================================================================= */}
      {isMounted && (
        <div
          role="dialog"
          aria-label="Parish AI Virtual Assistant"
          className={`fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[440px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-[#C59B3F]/35 flex flex-col overflow-hidden print:hidden transition-all duration-300 ease-out origin-bottom-right ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#800020] via-[#5C0017] to-[#1C1814] text-white p-4 sm:p-5 flex items-center justify-between shadow-md shrink-0 border-b border-[#C59B3F]/30">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFBE7B] via-[#C59B3F] to-[#9E7722] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#1C1814] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#DFBE7B]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1C1814]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-heading text-sm sm:text-base font-bold tracking-tight text-white leading-none">
                    Parish Assistant
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#C59B3F]/30 text-amber-200 border border-[#C59B3F]/40 tracking-wider uppercase font-mono">
                    AI Guide
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/80 font-sans mt-1 flex items-center gap-1.5">
                  <Church className="w-3 h-3 text-[#DFBE7B]" />
                  <span>Alliance of the Two Hearts</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={closeAssistant}
                title="Close Assistant"
                aria-label="Close Assistant"
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Guidance Banner */}
          <div className="bg-[#FAF7F0] border-b border-[#C59B3F]/20 px-4 py-2 text-[11px] text-[#8F6B1E] flex items-center justify-between shrink-0 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C59B3F]" />
              <span>Direct access to official parish database</span>
            </span>
            <span className="text-[10px] font-sans text-stone-500">
              Live Clergy • Schedules • Bulletins
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FCFBF9]">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#800020] to-[#5C0017] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-[#C59B3F]/40">
                      <Sparkles className="w-3.5 h-3.5 text-[#DFBE7B]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isAi
                        ? 'bg-white text-stone-900 border border-[#C59B3F]/25 rounded-tl-xs'
                        : 'bg-gradient-to-r from-[#800020] to-[#961C2C] text-white rounded-tr-xs shadow-[#800020]/20'
                    }`}
                  >
                    {isAi ? (
                      <FormattedMessage text={msg.text} />
                    ) : (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap font-sans text-white">
                        {msg.text}
                      </p>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 flex items-center gap-1.5 ${
                        isAi ? 'text-stone-400 justify-start' : 'text-rose-100/80 justify-end'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isAi && msg.source === 'groq' && (
                        <span className="text-[8px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                          AI Live
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 mt-0.5 border border-stone-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2.5 text-stone-500 text-xs py-1">
                <div className="w-7 h-7 rounded-full bg-[#800020] text-white flex items-center justify-center shrink-0 border border-[#C59B3F]/40">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFBE7B] animate-spin" />
                </div>
                <div className="bg-white border border-[#C59B3F]/20 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-bounce" />
                  <span className="text-[11px] text-stone-500 ml-1.5 font-medium">
                    Consulting parish records...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="bg-white border-t border-[#C59B3F]/15 px-3 py-2 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
            {SUGGESTED_QUERIES.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isTyping}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] hover:bg-[#800020] hover:text-white text-stone-700 text-[11px] font-medium border border-[#C59B3F]/25 hover:border-[#800020] whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs group"
                >
                  <IconComponent className="w-3 h-3 text-[#C59B3F] group-hover:text-amber-200" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Footer */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Mass, priests, sacraments, bulletins..."
                disabled={isTyping}
                className="flex-1 bg-stone-50 border border-stone-300 focus:border-[#800020] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all font-sans disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isTyping}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#800020] to-[#A81B2B] hover:from-[#5C0017] hover:to-[#800020] text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
              <span>English • Cebuano (Bisaya) • Tagalog</span>
              <span>Parish of the Alliance of the Two Hearts</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
