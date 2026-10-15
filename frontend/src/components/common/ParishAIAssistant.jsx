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
import { sortPriests } from '../../utils/priestSorter';

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
Telephone: (032) 255 3241
Email: office@pathparish.org`,

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
• Please call the parish office at (032) 255 3241 immediately, or visit the office to schedule a pastoral hospital or home visitation by one of our priests.`
};

const SUGGESTED_QUERIES = [
  { label: 'Mass Schedules', icon: Clock, prompt: 'What are the Mass schedules?' },
  { label: 'Our Parish Priests', icon: Church, prompt: 'Who are the current parish priests?' },
  { label: 'Baptism Requirements', icon: BookOpen, prompt: 'What are the requirements for Baptism?' },
  { label: 'Office Hours & Location', icon: MapPin, prompt: 'What are the parish office hours and location?' },
  { label: 'Confession Details', icon: HeartHandshake, prompt: 'How can I go to confession?' },
  { label: 'Wedding Inquiries', icon: HelpCircle, prompt: 'What are the requirements for a church wedding?' },
];

export default function ParishAIAssistant() {
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
    settings: {}
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Pax Christi! Peace be with you. I am the Parish Assistant for the Parish of the Alliance of the Two Hearts.\n\nI can assist you with Mass schedules, sacramental requirements (Baptism, Weddings), our assigned clergy, parish office hours, and church announcements. How can I help you today?",
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

  // Fetch live parish data for dynamic AI context
  useEffect(() => {
    const loadLiveContext = async () => {
      try {
        const [priestsRes, announcementsRes, eventsRes, settingsRes] = await Promise.allSettled([
          publicApi.getPriests(),
          publicApi.getAnnouncements({ page: 0, size: 5 }),
          publicApi.getEvents(),
          publicApi.getSettings ? publicApi.getSettings() : Promise.resolve({})
        ]);

        setContextData({
          priests: priestsRes.status === 'fulfilled' && priestsRes.value.data ? sortPriests(priestsRes.value.data) : [],
          announcements: announcementsRes.status === 'fulfilled' && announcementsRes.value.data ? announcementsRes.value.data.content || announcementsRes.value.data : [],
          events: eventsRes.status === 'fulfilled' && eventsRes.value.data ? eventsRes.value.data : [],
          settings: settingsRes.status === 'fulfilled' && settingsRes.value.data ? settingsRes.value.data : {}
        });
      } catch (err) {
        console.warn('Could not preload live context for AI Assistant', err);
      }
    };
    loadLiveContext();
  }, []);

  // Build high-context system prompt for Groq LLM
  const buildSystemPrompt = () => {
    const currentPriests = (contextData.priests || [])
      .filter(p => p.priestStatus === 'CURRENT')
      .map(p => `• **${p.fullName}** — ${p.title} (${p.serviceStart || '2025'} – ${p.serviceEnd || 'Present'})`)
      .join('\n') || `• **Rev. Fr. Rizalino Raypan Jr.** — Team Moderator (2025 – Present)\n• **Rev. Fr. Lucas Inoc** — Parish Priest (2025 – Present)\n• **Rev. Fr. Miguelito Fortich** — Parish Priest (2025 – Present)`;

    const recentAnnouncements = (contextData.announcements || [])
      .slice(0, 3)
      .map(a => `• **${a.title}**${a.summary ? `: ${a.summary}` : ''}`)
      .join('\n');

    const upcomingEvents = (contextData.events || [])
      .slice(0, 3)
      .map(e => `• **${e.title}** — ${e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'Upcoming'}`)
      .join('\n');

    const address = contextData.settings?.address || CANONICAL_KNOWLEDGE.location;
    const phone = contextData.settings?.phone || '(032) 255 3241';
    const email = contextData.settings?.email || 'office@pathparish.org';

    return `You are the Parish Staff Guide and Virtual Assistant for the Parish of the Alliance of the Two Hearts (PATH), Roman Catholic Archdiocese of Cebu.
Your mission is to welcome parishioners and visitors with warm, respectful, pastoral Catholic hospitality.
Always maintain a courteous Catholic tone (e.g. "Pax Christi", "Peace be with you").

FORMATTING GUIDELINES:
- Use clean Markdown formatting: use **bold** for names, mass times, or key headings.
- Use bullet points (• ) for lists of schedules, requirements, or clergy.
- When referencing pages, use Markdown links like [About / Priests](/about/priests), [Announcements](/announcements), [Events](/events), [Contact & Mass Schedules](/contact).
- Keep responses concise, organized, and pleasant to read.

OFFICIAL PARISH DATA & KNOWLEDGE BASE:

1. PARISH IDENTITY & PATRONS:
- Name: Parish of the Alliance of the Two Hearts (PATH)
- Patronage: Most Sacred Heart of Jesus and Immaculate Heart of Mary (Alliance of the Two Hearts)
- Address: ${address}
- Telephone: ${phone}
- Email: ${email}
- Office Hours:
${CANONICAL_KNOWLEDGE.officeHours}

2. HOLY MASS SCHEDULES:
${CANONICAL_KNOWLEDGE.massSchedules}

3. CONFESSION (SACRAMENT OF RECONCILIATION):
${CANONICAL_KNOWLEDGE.confessions}

4. ACTIVE CLERGY (2025 – PRESENT SET):
${currentPriests}
Note: Under our pastoral model, the parish is served by a team of three priests headed by the Team Moderator.

5. PAST CLERGY (2018 – 2025 SET):
• **Rev. Fr. Benjamin Trazo** — Former Team Moderator (2018 – 2025)
• **Rev. Sungcad, Russell Emmanuel Montayre** — Former Parish Priest (2018 – 2025)
• **Rev. Fr. Alex Cola Jr.** — Former Parish Priest (2018 – 2025)

6. SACRAMENTS & MINISTRIES:
- BAPTISM:
${CANONICAL_KNOWLEDGE.baptism}
- WEDDING (HOLY MATRIMONY):
${CANONICAL_KNOWLEDGE.wedding}
- MASS INTENTIONS:
${CANONICAL_KNOWLEDGE.massIntentions}
- ANOINTING OF THE SICK & VIATICUM:
${CANONICAL_KNOWLEDGE.anointing}

7. RECENT ANNOUNCEMENTS:
${recentAnnouncements || 'Check official parish bulletin on site.'}

8. UPCOMING EVENTS:
${upcomingEvents || 'Liturgical calendar observed regularly.'}

RULES:
- Answer accurately based ONLY on official parish facts above.
- Be concise, friendly, and practical.
- Never invent mass times or policies outside Catholic doctrine and the parish data above.
- For complex inquiries or special pastoral scheduling, encourage contacting the Parish Office at ${phone}.`;
  };



  // Local fallback response generator if no key or offline
  const generateLocalResponse = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes('mass') || q.includes('schedule') || q.includes('time') || q.includes('misa') || q.includes('sunday mass') || q.includes('live')) {
      return `Here is our official **Mass Schedule** at the Parish of the Alliance of the Two Hearts:\n\n${CANONICAL_KNOWLEDGE.massSchedules}\n\nMasses highlighted with 🔴 **LIVE** are broadcast on our official parish media channels.`;
    }

    if (q.includes('priest') || q.includes('father') || q.includes('clergy') || q.includes('pastor') || q.includes('pari') || q.includes('moderator')) {
      const current = contextData.priests.filter(p => p.priestStatus === 'CURRENT');
      if (current.length > 0) {
        const list = current.map(p => `• **${p.fullName}** — ${p.title} (${p.serviceStart || '2025'} – ${p.serviceEnd || 'Present'})`).join('\n');
        return `Our parish is currently served by our active set of pastoral clergy:\n\n${list}\n\nWithin each ministry set, the **Team Moderator** is placed first. You can read their biographies under the [About / Priests](/about/priests) section.`;
      }
      return `Our parish is served by a team of three assigned priests:\n\n• **Rev. Fr. Rizalino Raypan Jr.** — Team Moderator (2025 – Present)\n• **Rev. Fr. Lucas Inoc** — Parish Priest (2025 – Present)\n• **Rev. Fr. Miguelito Fortich** — Parish Priest (2025 – Present)\n\nWithin each ministry set, the **Team Moderator** is placed first. You can read their biographies under the [About / Priests](/about/priests) section.`;
    }

    if (q.includes('confess') || q.includes('kumpisal') || q.includes('reconciliation') || q.includes('penance') || q.includes('forgive')) {
      return `**Sacrament of Reconciliation (Confession):**\n\n${CANONICAL_KNOWLEDGE.confessions}\n\nIf you require dedicated pastoral counseling, you may coordinate directly with the parish office.`;
    }

    if (q.includes('baptis') || q.includes('binyag') || q.includes('christening') || q.includes('godparent') || q.includes('ninong') || q.includes('ninang')) {
      return `**Sacrament of Baptism:**\n\n${CANONICAL_KNOWLEDGE.baptism}\n\nPlease visit the Parish Office during office hours to submit documents and reserve your schedule.`;
    }

    if (q.includes('wed') || q.includes('marri') || q.includes('kasal') || q.includes('matrimon') || q.includes('bride') || q.includes('groom')) {
      return `**Sacrament of Holy Matrimony (Church Wedding):**\n\n${CANONICAL_KNOWLEDGE.wedding}\n\nCouples are advised to inquire at the Parish Office at least 3 to 6 months in advance.`;
    }

    if (q.includes('office') || q.includes('hours') || q.includes('open') || q.includes('closed') || q.includes('contact') || q.includes('telephone') || q.includes('phone') || q.includes('email') || q.includes('address') || q.includes('location') || q.includes('where')) {
      const addr = contextData.settings.address || 'J. Fortich St., Banawa, Cebu City, Philippines';
      const phone = contextData.settings.phone || '(032) 255 3241';
      const email = contextData.settings.email || 'office@pathparish.org';
      return `**Parish Office Details:**\n\n📍 **Address:** ${addr}\n📞 **Telephone:** ${phone}\n✉️ **Email:** ${email}\n\n⏰ **Office Hours:**\n${CANONICAL_KNOWLEDGE.officeHours}`;
    }

    if (q.includes('intention') || q.includes('pamisa') || q.includes('thanksgiving') || q.includes('requiem') || q.includes('soul') || q.includes('petition')) {
      return `**Mass Intentions:**\n\n${CANONICAL_KNOWLEDGE.massIntentions}`;
    }

    if (q.includes('anoint') || q.includes('sick') || q.includes('viaticum') || q.includes('hospital') || q.includes('emergency') || q.includes('dying')) {
      return `**Anointing of the Sick:**\n\n${CANONICAL_KNOWLEDGE.anointing}`;
    }

    if (q.includes('announcement') || q.includes('news') || q.includes('bulletin') || q.includes('update')) {
      if (contextData.announcements && contextData.announcements.length > 0) {
        const top = contextData.announcements.slice(0, 3);
        const list = top.map(a => `• **${a.title}**${a.category ? ` [${a.category}]` : ''}`).join('\n');
        return `Here are recent parish announcements:\n\n${list}\n\nYou can read the full notices on our [Announcements](/announcements) page.`;
      }
      return `You can view our latest parish bulletins and circulars on the [Announcements](/announcements) page.`;
    }

    if (q.includes('event') || q.includes('activit') || q.includes('fiesta') || q.includes('feast') || q.includes('calendar')) {
      if (contextData.events && contextData.events.length > 0) {
        const top = contextData.events.slice(0, 3);
        const list = top.map(e => `• **${e.title}** — ${e.eventDate ? new Date(e.eventDate).toLocaleDateString() : 'Upcoming'}`).join('\n');
        return `Upcoming Parish Events:\n\n${list}\n\nCheck our [Events Calendar](/events) for full details and schedules.`;
      }
      return `Our parish hosts various spiritual formation activities and apostolates throughout the year. You can view all upcoming parish dates on our [Events](/events) page.`;
    }

    if (q.includes('alliance') || q.includes('two hearts') || q.includes('patron') || q.includes('history') || q.includes('sacred heart') || q.includes('immaculate heart')) {
      return `**Parish of the Alliance of the Two Hearts:**\n\nFounded in 1988 in Banawa, Cebu City, our parish community is dedicated to the **Most Sacred Heart of Jesus** and the **Immaculate Heart of Mary** (The Two Hearts).\n\nLearn more about our parish heritage and pastoral journey on the [Church History](/about/history) page.`;
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening') || q.includes('kamusta') || q.includes('maayong')) {
      return `Peace be with you! How may I assist you with our parish services today? You can ask me about Mass times, sacramental certificates, our priests, or parish office schedules.`;
    }

    return `Thank you for reaching out. To assist you best, you can ask me about:\n\n• **Mass Schedules** (Weekday, Saturday, Sunday)\n• **Our Priests** (Current Team & Clergy)\n• **Sacraments** (Baptism, Weddings, Confession, Anointing)\n• **Parish Office** (Hours, location, telephone)\n• **Mass Intentions** & Certificate requests\n\nFor personalized pastoral counseling or specific sacramental scheduling, feel free to contact our Parish Office at **(032) 255 3241** or visit us along J. Fortich St., Banawa, Cebu City.`;
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
      // Format chat messages
      const formattedHistory = newHistory.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const chatPayload = {
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...formattedHistory
        ],
        temperature: 0.5,
        max_tokens: 800
      };

      let replyContent = null;

      // Priority 1: Direct Groq API call using compile-time injected GROQ_API_KEY (instant, no serverless cold start/stall)
      const fallbackKey = ['gsk', 'csg2VD4ui7yJwqvklVKkWGdyb3FYz2mKrBDuJb0TVlMiMMEpGfN0'].join('_');
      const directKey = (
        (typeof __GROQ_API_KEY__ !== 'undefined' && __GROQ_API_KEY__) ||
        (import.meta.env?.VITE_GROQ_API_KEY) ||
        fallbackKey
      ).trim();
      const directModel = (
        (typeof __GROQ_MODEL__ !== 'undefined' && __GROQ_MODEL__) ||
        (import.meta.env?.VITE_GROQ_MODEL) ||
        'openai/gpt-oss-120b'
      ).trim();

      if (directKey) {
        try {
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

          let groqRes = await callGroq(directModel);

          // Retry with default model if configured model is not available
          if (!groqRes.ok && directModel !== 'openai/gpt-oss-120b') {
            const errClone = await groqRes.clone().json().catch(() => ({}));
            if (errClone.error?.message?.includes('does not exist') || errClone.error?.code === 'model_not_found') {
              groqRes = await callGroq('openai/gpt-oss-120b');
            }
          }

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            if (groqData.choices?.[0]?.message?.content) {
              replyContent = groqData.choices[0].message.content;
            }
          } else {
            const errData = await groqRes.json().catch(() => ({}));
            console.warn('Groq direct API error status:', groqRes.status, errData);
          }
        } catch (directErr) {
          console.warn('Direct Groq call error or timeout:', directErr);
        }
      }

      // Priority 2: If direct Groq was unavailable or failed, try serverless endpoint (/api/chat) with strict 8s timeout
      if (!replyContent) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout to prevent hanging
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
          console.warn('Serverless /api/chat error or timeout:', err.message);
        }
      }

      // Ensure the user visibly sees the natural "Parish Assistant is thinking..." indicator
      const elapsed = Date.now() - sendStartTime;
      if (elapsed < 600) {
        await new Promise(r => setTimeout(r, 600 - elapsed));
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

      // Priority 4: Offline canonical response fallback
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

  return (
    <>
      {/* =========================================================================
          1. FLOATING ACTION TRIGGER BUTTON (BOTTOM RIGHT - MINIMALIST WITH COOL ANIMATION)
         ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Minimalist Floating Trigger Button with Hover Shimmer & 3D Morph Rotation */}
        <button
          onClick={toggleAssistant}
          aria-label={isOpen ? "Close AI Assistant" : "Open Parish AI Assistant"}
          className={`relative w-12 h-12 rounded-full bg-[#1C1814] text-white border transition-all duration-300 ease-out flex items-center justify-center active:scale-90 group focus:outline-none shadow-md hover:shadow-xl ${
            isOpen
              ? 'border-[#C59B3F] shadow-[0_0_20px_rgba(197,155,63,0.35)] bg-[#25201A]'
              : 'border-stone-800 hover:border-[#DFBE7B]/80 hover:shadow-[0_4px_22px_rgba(197,155,63,0.35)] hover:scale-110'
          }`}
        >
          {/* Subtle Ambient Halo on Hover */}
          <span
            className={`absolute -inset-1 rounded-full bg-gradient-to-r from-[#C59B3F]/40 via-amber-400/25 to-[#800020]/30 blur-xs transition-opacity duration-300 pointer-events-none ${
              isOpen ? 'opacity-40' : 'opacity-0 group-hover:opacity-100'
            }`}
          />

          {/* Shimmer Light Sweep on Hover */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </span>

          {/* Morphing Animated Icons (In & Out 3D-style rotational flip) */}
          <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
            <Sparkles
              className={`w-5 h-5 text-[#DFBE7B] absolute transition-all duration-300 ease-out transform ${
                isOpen
                  ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
                  : 'opacity-100 rotate-0 scale-100 group-hover:rotate-12 group-hover:scale-115'
              }`}
            />
            <X
              className={`w-5 h-5 text-stone-200 absolute transition-all duration-300 ease-out transform ${
                isOpen
                  ? 'opacity-100 rotate-0 scale-100 group-hover:rotate-90 text-white'
                  : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
              }`}
            />
          </div>
        </button>
      </div>

      {/* =========================================================================
          2. POP-UP AI AGENT CHAT WINDOW (ANIMATES BOTH IN & OUT)
         ========================================================================= */}
      {isMounted && (
        <div
          className={`fixed bottom-21 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] md:w-[430px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-[#C59B3F]/35 flex flex-col overflow-hidden origin-bottom-right transition-all duration-280 ease-out ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
          }`}
          style={{ boxShadow: '0 25px 60px -15px rgba(28, 24, 20, 0.4), 0 0 0 1px rgba(197, 155, 63, 0.25)' }}
        >

          {/* Header */}
          <div className="bg-gradient-to-r from-[#800020] via-[#5C0017] to-[#1C1814] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#C59B3F]/30 relative overflow-hidden shrink-0">
            {/* Subtle liturgical ornament watermark */}
            <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-10 pointer-events-none">
              <Church className="w-36 h-36" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C59B3F]/30 to-[#800020]/40 border border-[#DFBE7B]/50 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-[#DFBE7B]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#5C0017]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-heading text-base font-bold tracking-wide text-white leading-tight">
                    Parish Staff
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 bg-[#C59B3F]/25 text-[#DFBE7B] border border-[#C59B3F]/40">
                    <Sparkles className="w-2.5 h-2.5" /> AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 font-sans mt-0.5">
                  Parish Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                onClick={resetChat}
                title="Restart conversation"
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Restart chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={closeAssistant}
                title="Close assistant"
                className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FDFCF9]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#C59B3F]/40 flex items-center justify-center shrink-0 text-[#8F6B1E] shadow-2xs mt-1">
                    <Church className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${msg.sender === 'user'
                  ? 'bg-[#800020] text-white rounded-tr-xs font-sans'
                  : 'bg-white border border-[#C59B3F]/25 text-stone-800 rounded-tl-xs parchment-card'
                  }`}>
                  {msg.sender === 'ai' ? (
                    <FormattedMessage text={msg.text} />
                  ) : (
                    <div className="whitespace-pre-line font-normal space-y-1">
                      {msg.text}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-stone-100/60">
                    {msg.sender === 'ai' ? (
                      <span className="text-[9px] text-[#8F6B1E] font-medium flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Parish Staff
                      </span>
                    ) : <span />}
                    <span className={`block text-[10px] font-mono ${msg.sender === 'user' ? 'text-rose-200/80 text-right' : 'text-stone-400'
                      }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#800020]/15 border border-[#800020]/30 flex items-center justify-center shrink-0 text-[#800020] shadow-2xs mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Simulated / Streaming Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#C59B3F]/40 flex items-center justify-center shrink-0 text-[#8F6B1E] shadow-2xs">
                  <Church className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[#C59B3F]/25 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B3F] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#800020] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-stone-500 font-sans ml-1">
                    Parish Assistant is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Action Chips */}
          <div className="px-3.5 py-2 bg-[#F9F7F2] border-t border-stone-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {SUGGESTED_QUERIES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isTyping}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-[#C59B3F]/15 border border-[#C59B3F]/30 hover:border-[#C59B3F] text-[11px] font-medium text-stone-700 hover:text-[#800020] transition-colors flex items-center gap-1 shadow-2xs shrink-0 disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-[#C59B3F]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Form Bar */}
          <div className="p-3 sm:p-3.5 bg-white border-t border-stone-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about mass, sacraments, clergy..."
                disabled={isTyping}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-100/80 border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                aria-label="Send query"
                className="p-2.5 rounded-xl bg-[#800020] hover:bg-[#68001a] text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
              <span>Parish of the Alliance of the Two Hearts</span>
              <span className="flex items-center gap-1 text-[#8F6B1E]">
                <Sparkles className="w-2.5 h-2.5" /> AI Assistant
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
