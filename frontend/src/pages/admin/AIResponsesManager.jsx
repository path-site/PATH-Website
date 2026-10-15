import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminApi } from '../../services/api';
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Send,
  X,
  AlertCircle,
  Tag
} from 'lucide-react';

export default function AIResponsesManager() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: 'success' });

  // Test Assistant State
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    eventDate: '',
    responseText: '',
    isActive: true
  });

  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'success' }), 4000);
  };

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.data) {
        const rawJson = res.data.ai_custom_responses;
        if (rawJson) {
          try {
            const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
            if (Array.isArray(parsed)) {
              setResponses(parsed);
              return;
            }
          } catch (e) {
            console.error('Failed to parse ai_custom_responses JSON', e);
          }
        }
      }
      setResponses([]);
    } catch (err) {
      console.error('Failed to fetch AI responses', err);
      showNotice('Failed to load AI responses from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      keywords: '',
      eventDate: '',
      responseText: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
      eventDate: item.eventDate || '',
      responseText: item.responseText || '',
      isActive: item.isActive !== false
    });
    setModalOpen(true);
  };

  const saveAllToDatabase = async (updatedList) => {
    try {
      const payload = {
        ai_custom_responses: JSON.stringify(updatedList)
      };
      await adminApi.saveSettings(payload);
      setResponses(updatedList);
      return true;
    } catch (err) {
      console.error('Failed to save AI responses', err);
      showNotice('Failed to save to database. Please check connection.', 'error');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.responseText.trim()) {
      showNotice('Please fill in both the Title and the Response text.', 'error');
      return;
    }

    setSaving(true);

    // Normalize keywords into clean array of lowercase terms
    const rawKeywords = formData.keywords || '';
    const keywordsArray = rawKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    const newItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: formData.title.trim(),
      keywords: keywordsArray,
      eventDate: formData.eventDate.trim(),
      responseText: formData.responseText.trim(),
      isActive: formData.isActive,
      updatedAt: new Date().toISOString(),
      createdAt: editingItem?.createdAt || new Date().toISOString()
    };

    let updatedList;
    if (editingItem) {
      updatedList = responses.map(item => item.id === editingItem.id ? newItem : item);
    } else {
      updatedList = [newItem, ...responses];
    }

    const ok = await saveAllToDatabase(updatedList);
    setSaving(false);

    if (ok) {
      setModalOpen(false);
      showNotice(editingItem ? 'AI Response updated successfully!' : 'New AI Response rule created!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this AI Response rule?')) return;
    const updated = responses.filter(r => r.id !== id);
    const ok = await saveAllToDatabase(updated);
    if (ok) {
      showNotice('AI Response rule deleted successfully.');
      if (testResult?.matchedRule?.id === id) {
        setTestResult(null);
      }
    }
  };

  const handleToggleActive = async (item) => {
    const updated = responses.map(r => r.id === item.id ? { ...r, isActive: !r.isActive } : r);
    const ok = await saveAllToDatabase(updated);
    if (ok) {
      showNotice(`Rule "${item.title}" is now ${!item.isActive ? 'Active' : 'Inactive'}.`);
    }
  };

  // Test keyword/date matching simulator
  const handleTestPrompt = (e) => {
    e.preventDefault();
    if (!testQuery.trim()) {
      setTestResult(null);
      return;
    }

    const queryLower = testQuery.toLowerCase();
    const activeRules = responses.filter(r => r.isActive !== false);

    // Find best match: check keywords, title, and date
    let matched = null;
    let matchReason = '';

    for (const rule of activeRules) {
      // 1. Keyword match
      const keywords = Array.isArray(rule.keywords) ? rule.keywords : [];
      const matchedKeyword = keywords.find(k => k && queryLower.includes(k.toLowerCase()));
      if (matchedKeyword) {
        matched = rule;
        matchReason = `Matched keyword "${matchedKeyword}"`;
        break;
      }

      // 2. Title match
      if (rule.title && queryLower.includes(rule.title.toLowerCase())) {
        matched = rule;
        matchReason = `Matched title topic "${rule.title}"`;
        break;
      }

      // 3. Date match
      if (rule.eventDate && queryLower.includes(rule.eventDate.toLowerCase())) {
        matched = rule;
        matchReason = `Matched date "${rule.eventDate}"`;
        break;
      }
    }

    if (matched) {
      setTestResult({
        matched: true,
        matchedRule: matched,
        reason: matchReason,
        response: matched.responseText,
        date: matched.eventDate
      });
    } else {
      setTestResult({
        matched: false,
        reason: 'No custom rule triggered. The AI assistant will fall back to canonical parish knowledge (Mass schedules, clergy, etc.).'
      });
    }
  };

  // Filtered responses
  const filteredResponses = responses.filter(r => {
    const matchesStatus =
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? r.isActive !== false :
      r.isActive === false;

    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = r.title?.toLowerCase().includes(q);
    const inDate = r.eventDate?.toLowerCase().includes(q);
    const inResponse = r.responseText?.toLowerCase().includes(q);
    const inKeywords = Array.isArray(r.keywords) && r.keywords.some(k => k.toLowerCase().includes(q));

    return inTitle || inDate || inResponse || inKeywords;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Notification */}
      {notice.text && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all transform animate-bounce ${
          notice.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#1C1814] text-[#DFBE7B] border border-[#C59B3F]/40'
        }`}>
          {notice.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1814] via-[#2A231C] to-[#14110E] p-8 rounded-3xl border border-[#C59B3F]/30 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C59B3F]/20 text-[#DFBE7B] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#C59B3F]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic AI Knowledge Base
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold text-white tracking-tight">
              AI Assistant Responses
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
              Configure trigger keywords, dates, and dynamic responses. Whenever parishioners ask the AI Assistant about these keywords, upcoming dates, or special events, the AI dynamically adapts its answers using this database.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#C59B3F] to-[#DFBE7B] text-[#1C1814] font-bold text-sm shadow-md hover:brightness-110 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add AI Response Rule
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#C59B3F]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive AI Tester Widget */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
          <div className="w-9 h-9 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Quick AI Rule Simulator</h3>
            <p className="text-xs text-stone-500">Test how user prompts trigger your keywords and custom dates</p>
          </div>
        </div>

        <form onSubmit={handleTestPrompt} className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. When is the parish fiesta? or Tell me about October 28 schedules"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#1C1814] text-white hover:bg-stone-800 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#DFBE7B]" />
            Test Prompt
          </button>
        </form>

        {testResult && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm border transition-all ${
            testResult.matched 
              ? 'bg-amber-50/70 border-amber-200 text-stone-800' 
              : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}>
            <div className="flex items-center gap-2 mb-2 font-semibold">
              {testResult.matched ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Triggered: {testResult.matchedRule.title}</span>
                  <span className="text-xs font-normal text-stone-500">({testResult.reason})</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-600">{testResult.reason}</span>
                </>
              )}
            </div>

            {testResult.matched && (
              <div className="space-y-1.5 pl-6 border-l-2 border-amber-300">
                {testResult.date && (
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C59B3F]" />
                    <span>Configured Date: {testResult.date}</span>
                  </div>
                )}
                <p className="text-stone-700 font-normal leading-relaxed whitespace-pre-wrap">
                  {testResult.response}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keyword, topic, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200/90 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50 bg-white shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#800020] text-white shadow-xs ring-1 ring-[#800020]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {status === 'ALL' ? 'All Rules' : status === 'ACTIVE' ? 'Active Only' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 h-64 border border-stone-200 animate-pulse" />
          ))}
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#C59B3F]/15 text-[#8F6B1E] flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="font-serif-heading font-bold text-xl text-stone-900 mb-1">
            {responses.length === 0 ? 'No AI Response Rules Yet' : 'No Rules Match Your Search'}
          </h3>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            {responses.length === 0 
              ? 'Add custom keywords, dates, and responses so the AI assistant can provide real-time custom answers for your parish.'
              : 'Try clearing your search query or switching filters.'}
          </p>
          {responses.length === 0 && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] text-white text-sm font-semibold hover:bg-[#600018] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First AI Rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResponses.map((item) => {
            const keywords = Array.isArray(item.keywords) ? item.keywords : [];
            const isActive = item.isActive !== false;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative group ${
                  isActive ? 'border-stone-200/90' : 'border-stone-200 bg-stone-50/60 opacity-80'
                }`}
              >
                <div>
                  {/* Status & Date Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </button>

                    {item.eventDate && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8F6B1E] bg-[#FAF7F0] px-2.5 py-1 rounded-full border border-[#C59B3F]/25">
                        <Calendar className="w-3.5 h-3.5 text-[#C59B3F]" />
                        <span>{item.eventDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif-heading text-lg font-bold text-stone-900 group-hover:text-[#800020] transition-colors mb-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Keywords Badges */}
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60"
                        >
                          <Tag className="w-2.5 h-2.5 text-stone-400" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Response Text Preview */}
                  <p className="text-xs text-stone-600 leading-relaxed font-normal line-clamp-4 whitespace-pre-wrap bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                    {item.responseText}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>Updated {new Date(item.updatedAt || Date.now()).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                      title="Edit Rule"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C59B3F]/20 text-[#8F6B1E] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-heading font-bold text-lg text-stone-900">
                    {editingItem ? 'Edit AI Response Rule' : 'Create AI Response Rule'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Define keywords, date, and the dynamic response for the assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Title / Topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Topic / Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Parish Fiesta 2026, Simbang Gabi Schedules"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50 font-medium"
                />
              </div>

              {/* Trigger Keywords */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Trigger Keywords <span className="text-stone-400 font-normal">(Comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. fiesta, feast day, celebration, patron, annual feast"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  When a user message contains any of these keywords, this rule will be dynamically triggered.
                </p>
              </div>

              {/* Date / Timeframe */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C59B3F]" />
                  Event Date / Timeframe <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 28, 2026, or December 16–24, 2026, or Every 1st Friday"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Specify any relevant date or date range. The AI will cross-reference this date in user conversations.
                </p>
              </div>

              {/* Response Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Dynamic Response / Instructions for AI <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write the full response details, instructions, mass timings, or guidelines that the AI should provide..."
                  value={formData.responseText}
                  onChange={(e) => setFormData({ ...formData, responseText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C59B3F]/50 font-sans leading-relaxed"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Supports clean Markdown formatting (e.g. **bold**, bullet points •, links [Label](/url)).
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-[#800020] focus:ring-[#800020] cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Rule is Active (Available to the AI Assistant immediately)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#A81B2B] text-white text-sm font-bold shadow-md hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving to Database...' : editingItem ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
