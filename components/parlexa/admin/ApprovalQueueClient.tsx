'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, ExternalLink, X, Loader2, Clock } from 'lucide-react';
import { approveAgent, rejectAgent } from '@/app/(admin)/admin/approval-queue/actions';
import Link from 'next/link';

export type PendingAgent = {
  id: number;
  name: string;
  summary: string | null;
  one_liner: string | null;
  website: string | null;
  category: string | null;
  logo_url: string | null;
  created_at: string;
  user_email: string | null;
};

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-medium
        ${type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
        {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        {message}
        <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Slide-over Detail Panel ──────────────────────────────────
function ReviewPanel({
  agent,
  onClose,
  onApproved,
  onRejected,
}: {
  agent: PendingAgent;
  onClose: () => void;
  onApproved: (id: number) => void;
  onRejected: (id: number) => void;
}) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    const result = await approveAgent(agent.id);
    setApproving(false);
    if (result.success) onApproved(agent.id);
  };

  const handleReject = async () => {
    setRejecting(true);
    const result = await rejectAgent(agent.id, rejectNotes);
    setRejecting(false);
    if (result.success) onRejected(agent.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg z-[95] animate-in slide-in-from-right duration-300">
        <div className="h-full bg-[#0C0C0E] border-l border-white/[0.08] flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
            <h2 className="text-lg font-semibold text-white">Review Agent</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-6">
            {/* Agent name + logo */}
            <div className="flex items-start gap-4">
              {agent.logo_url ? (
                <img
                  src={agent.logo_url}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-white/[0.05] border border-white/[0.1]"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xl font-bold text-gray-500">
                  {agent.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-white truncate">{agent.name}</h3>
                {agent.category && (
                  <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {agent.category}
                  </span>
                )}
              </div>
            </div>

            {/* Website link */}
            {agent.website && (
              <a
                href={agent.website.startsWith('http') ? agent.website : `https://${agent.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 hover:bg-white/[0.05]"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span className="truncate">{agent.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            {/* One-liner */}
            {agent.one_liner && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">One-Liner</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{agent.one_liner}</p>
              </div>
            )}

            {/* Summary / Description */}
            {agent.summary && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{agent.summary}</p>
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Submitted</div>
                <div className="text-sm text-white">
                  {new Date(agent.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
              {agent.user_email && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Vendor Email</div>
                  <div className="text-sm text-sky-400 truncate">{agent.user_email}</div>
                </div>
              )}
            </div>

            {/* Rejection notes input (shown when reject clicked) */}
            {showRejectInput && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Rejection Notes (optional)
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explain why this agent is being rejected..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-rose-500/40 resize-none"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-5 border-t border-white/[0.08] space-y-3">
            {/* Approve */}
            <button
              onClick={handleApprove}
              disabled={approving || rejecting}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            >
              {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {approving ? 'Approving...' : 'Approve Agent'}
            </button>

            {/* Reject */}
            {!showRejectInput ? (
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={approving}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20"
              >
                <XCircle className="w-4 h-4" />
                Reject Agent
              </button>
            ) : (
              <button
                onClick={handleReject}
                disabled={approving || rejecting}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
              >
                {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            )}

            {/* Request Changes */}
            <Link
              href={`/admin/resolution-center?agentId=${agent.id}`}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              Request Changes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────
export function ApprovalQueueClient({ agents: initialAgents }: { agents: PendingAgent[] }) {
  const [agents, setAgents] = useState<PendingAgent[]>(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<PendingAgent | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproved = (id: number) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setSelectedAgent(null);
    showToast('Agent approved and published');
  };

  const handleRejected = (id: number) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setSelectedAgent(null);
    showToast('Agent rejected');
  };

  return (
    <section>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Approval Queue</h1>
        <p className="text-gray-500 text-sm">
          {agents.length} pending {agents.length === 1 ? 'tool' : 'tools'} awaiting review
        </p>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
        {agents.length === 0 ? (
          <div className="text-center py-20 px-6">
            <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">All clear</h3>
            <p className="text-gray-500 text-sm">No pending agents to review. Check back later.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Tool Name</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Category</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Submitted</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {agent.logo_url ? (
                        <img
                          src={agent.logo_url}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-white/[0.05] border border-white/[0.1]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-gray-500">
                          {agent.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors">{agent.name}</div>
                        {agent.one_liner && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{agent.one_liner}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {agent.category ? (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.08]">
                        {agent.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(agent.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 hover:bg-sky-500/20">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over */}
      {selectedAgent && (
        <ReviewPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onApproved={handleApproved}
          onRejected={handleRejected}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </section>
  );
}
