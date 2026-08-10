'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  AlertTriangle,
  Loader2,
  X,
  Save,
  Send,
  ExternalLink,
  Bot,
  UserCheck
} from 'lucide-react';
import { BlogMarkdownRenderer } from '@/components/blog/BlogMarkdownRenderer';

interface FAQ {
  question: string;
  answer: string;
}

interface BlogDraft {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  author: string | null;
  published_date: string | null;
  read_time_minutes: number | null;
  faqs: FAQ[] | null;
  status: string;
  source: string | null;
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

export default function BlogReviewQueuePage() {
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Modals State
  const [previewDraft, setPreviewDraft] = useState<BlogDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<BlogDraft | null>(null);
  const [rejectingDraft, setRejectingDraft] = useState<BlogDraft | null>(null);

  // Form State for Editing
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    body: ''
  });

  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blog-review/list');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch draft posts');
      }

      console.log(`[blog-review UI] Loaded ${data.drafts?.length || 0} draft posts from API:`, data.drafts);
      setDrafts(data.drafts || []);
    } catch (err: any) {
      console.error('Error fetching blog drafts:', err);
      setError(err.message || 'Failed to load blog drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch('/api/admin/blog-review/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve draft');
      }

      // Remove approved post from queue
      setDrafts(prev => prev.filter(d => d.id !== id));
      if (previewDraft?.id === id) setPreviewDraft(null);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingDraft) return;
    const id = rejectingDraft.id;
    setActionLoadingId(id);

    try {
      const res = await fetch('/api/admin/blog-review/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject draft');
      }

      setDrafts(prev => prev.filter(d => d.id !== id));
      setRejectingDraft(null);
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const startEdit = (draft: BlogDraft) => {
    setEditingDraft(draft);
    setEditForm({
      title: draft.title || '',
      slug: draft.slug || '',
      excerpt: draft.excerpt || '',
      meta_title: draft.meta_title || '',
      meta_description: draft.meta_description || '',
      body: draft.body || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDraft) return;
    setSaveLoading(true);

    try {
      const res = await fetch('/api/admin/blog-review/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDraft.id,
          ...editForm
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update draft');
      }

      // Update in local state
      setDrafts(prev => prev.map(d => d.id === editingDraft.id ? { ...d, ...data.post } : d));
      setEditingDraft(null);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#A78BFA]">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Blog Review Queue</h1>
              <p className="text-sm text-[#A1A1AA]">
                Human approval gate for AI-generated and manual blog post drafts before live publication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#18181B] border border-white/10 text-xs font-medium text-[#D4D4D8] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse"></span>
            <span>{drafts.length} Pending {drafts.length === 1 ? 'Draft' : 'Drafts'}</span>
          </div>
          <button
            onClick={fetchDrafts}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Queue List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#A1A1AA] gap-3">
          <Loader2 size={32} className="animate-spin text-[#8B5CF6]" />
          <p className="text-sm">Loading blog review queue...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#141414] border border-white/10 rounded-2xl text-center p-8 space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">All Clear! No Pending Drafts</h3>
            <p className="text-sm text-[#A1A1AA] max-w-md">
              There are currently no blog drafts waiting for review. The weekly blog agent runs every Monday at 6 AM UTC.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => {
            const wordCount = draft.body ? draft.body.split(/\s+/).length : 0;
            const faqCount = draft.faqs?.length || 0;
            const isAutomated = draft.source === 'automated_agent';

            return (
              <div
                key={draft.id}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    {isAutomated ? (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold flex items-center gap-1.5">
                        <Bot size={12} />
                        Automated AI Agent
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold flex items-center gap-1.5">
                        <UserCheck size={12} />
                        Manual Draft
                      </span>
                    )}
                    <span className="text-[#71717A]">•</span>
                    <span className="text-[#A1A1AA] font-mono">/blog/{draft.slug}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(draft.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span>{wordCount} words</span>
                    <span>{faqCount} FAQs</span>
                    <span>{draft.read_time_minutes || Math.ceil(wordCount / 200)} min read</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                    {draft.title}
                  </h2>
                  {draft.excerpt && (
                    <p className="text-sm text-[#D4D4D8] line-clamp-2 leading-relaxed">
                      {draft.excerpt}
                    </p>
                  )}
                </div>

                {/* SEO Metadata Box */}
                {(draft.meta_title || draft.meta_description) && (
                  <div className="p-3.5 rounded-xl bg-[#1C1C22] border border-white/5 space-y-1 text-xs">
                    {draft.meta_title && (
                      <p className="text-[#A78BFA] font-medium truncate">
                        <span className="text-[#71717A] mr-2">Meta Title:</span>
                        {draft.meta_title}
                      </p>
                    )}
                    {draft.meta_description && (
                      <p className="text-[#A1A1AA] truncate">
                        <span className="text-[#71717A] mr-2">Meta Description:</span>
                        {draft.meta_description}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDraft(draft)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-2"
                    >
                      <Eye size={14} className="text-[#A78BFA]" />
                      Preview Post
                    </button>
                    <button
                      onClick={() => startEdit(draft)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={14} className="text-amber-400" />
                      Edit Post
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRejectingDraft(draft)}
                      disabled={actionLoadingId === draft.id}
                      className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Reject & Delete
                    </button>
                    <button
                      onClick={() => handleApprove(draft.id)}
                      disabled={actionLoadingId === draft.id}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {actionLoadingId === draft.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Approve & Publish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Full Rendered Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#101014] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#18181C]">
              <div>
                <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">Live Preview</span>
                <h3 className="text-lg font-bold text-white truncate max-w-2xl">{previewDraft.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDraft(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-8 flex-1">
              <div className="border-b border-white/10 pb-6 space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-white tracking-tight leading-tight">
                  {previewDraft.title}
                </h1>
                {previewDraft.excerpt && (
                  <p className="text-base text-[#A1A1AA] leading-relaxed italic">
                    {previewDraft.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#71717A] pt-2">
                  <span>Author: {previewDraft.author || 'Parlexa Team'}</span>
                  <span>•</span>
                  <span>{previewDraft.read_time_minutes || 4} min read</span>
                </div>
              </div>

              {/* Rendered Body */}
              <BlogMarkdownRenderer content={previewDraft.body} />

              {/* FAQs Section Preview */}
              {previewDraft.faqs && previewDraft.faqs.length > 0 && (
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle size={20} className="text-[#8B5CF6]" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {previewDraft.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-4 rounded-2xl bg-[#18181C] border border-white/10 space-y-2">
                        <p className="text-sm font-semibold text-white">Q: {faq.question}</p>
                        <p className="text-xs text-[#D4D4D8] leading-relaxed">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-white/10 bg-[#18181C] flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleApprove(previewDraft.id)}
                disabled={actionLoadingId === previewDraft.id}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {actionLoadingId === previewDraft.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Approve & Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#101014] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Edit Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#18181C]">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit Draft Post</h3>
              </div>
              <button
                onClick={() => setEditingDraft(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Form */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#18181C] border border-white/10 text-white font-medium focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-white">Slug</label>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#18181C] border border-white/10 text-white font-mono focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Excerpt</label>
                <textarea
                  rows={2}
                  value={editForm.excerpt}
                  onChange={e => setEditForm({ ...editForm, excerpt: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#18181C] border border-white/10 text-white leading-relaxed focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-white">Meta Title (Max 60 chars)</label>
                  <input
                    type="text"
                    value={editForm.meta_title}
                    onChange={e => setEditForm({ ...editForm, meta_title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#18181C] border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-white">Meta Description (Max 150 chars)</label>
                  <input
                    type="text"
                    value={editForm.meta_description}
                    onChange={e => setEditForm({ ...editForm, meta_description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#18181C] border border-white/10 text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Body Markdown Content</label>
                <textarea
                  rows={14}
                  value={editForm.body}
                  onChange={e => setEditForm({ ...editForm, body: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#18181C] border border-white/10 text-white font-mono leading-relaxed focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            {/* Edit Actions */}
            <div className="p-4 border-t border-white/10 bg-[#18181C] flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saveLoading}
                className="px-5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rejection Confirmation Dialog */}
      {rejectingDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/30 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reject & Delete Draft?</h3>
                <p className="text-xs text-[#A1A1AA]">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#D4D4D8] bg-[#18181C] p-4 rounded-xl border border-white/5 italic">
              "{rejectingDraft.title}"
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingDraft(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoadingId === rejectingDraft.id}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoadingId === rejectingDraft.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Yes, Reject & Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
