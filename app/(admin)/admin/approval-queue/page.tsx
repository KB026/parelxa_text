'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, Sparkles, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

import { ExternalReview } from '@/lib/api/externalReviews';

interface SubScore {
  score: number;
  reason: string;
}

interface AiScores {
  business_application?: SubScore;
  user_friendliness?: SubScore;
  ui_ux_design?: SubScore;
  foundation_leadership?: SubScore;
  indian_pricing?: SubScore;
  clarity?: SubScore;
  credibility?: SubScore;
  visual?: SubScore;
}

interface PendingAgent {
  id: number;
  name: string;
  slug: string;
  summary: string;
  category: string;
  website: string;
  user_id: string;
  created_at: string;
  approval_status: string;
  ai_score: number | null;
  ai_scores: AiScores | null;
  quality_score: number | null;
  quality_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  external_reviews?: ExternalReview[] | null;
}

export default function ApprovalQueuePage() {
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Rejection modal state
  const [rejectingAgent, setRejectingAgent] = useState<{
    id: number;
    name: string;
    userId: string;
  } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // State A tracking: per-agent scoring loading & error state
  const [scoringState, setScoringState] = useState<
    Record<number, { loading: boolean; error: string | null }>
  >({});

  // State B tracking: per-agent form state (adminScore, notes, loading, error, result)
  const [reviewFormState, setReviewFormState] = useState<
    Record<
      number,
      {
        adminScore: string;
        notes: string;
        loading: boolean;
        error: string | null;
        result: { final_score: number; decision: string } | null;
      }
    >
  >({});

  // External review verification modal state
  const [verifyingReview, setVerifyingReview] = useState<{
    id: number;
    platform: string;
    url: string;
    agentId: number;
  } | null>(null);
  const [extRating, setExtRating] = useState('4.5');
  const [extCount, setExtCount] = useState('10');
  const [verifyingLoading, setVerifyingLoading] = useState(false);

  const handleVerifyReviewSubmit = async () => {
    if (!verifyingReview) return;
    setVerifyingLoading(true);

    try {
      const res = await fetch('/api/admin/verify-external-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: verifyingReview.id,
          rating: parseFloat(extRating),
          reviews_count: parseInt(extCount, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify external review');
      }

      setPendingAgents(prev =>
        prev.map(agent => {
          if (agent.id === verifyingReview.agentId && agent.external_reviews) {
            const updatedExt = agent.external_reviews.map(r =>
              r.id === verifyingReview.id
                ? {
                    ...r,
                    status: 'verified' as const,
                    rating: parseFloat(extRating),
                    reviews_count: parseInt(extCount, 10),
                  }
                : r
            );
            return { ...agent, external_reviews: updatedExt };
          }
          return agent;
        })
      );

      setVerifyingReview(null);
    } catch (err: any) {
      alert('Error verifying external review: ' + (err.message || String(err)));
    } finally {
      setVerifyingLoading(false);
    }
  };

  const supabase = createClient();

  useEffect(() => {
    fetchPendingAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending-agents');
      const data = await res.json();
      if (data.agents) {
        setPendingAgents(data.agents as PendingAgent[]);
      } else {
        console.error('Error fetching pending agents:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch pending agents', err);
    }
    setLoading(false);
  };

  // State A: Trigger AI scoring for a specific agent
  const handleSendToReview = async (agentId: number) => {
    setScoringState(prev => ({
      ...prev,
      [agentId]: { loading: true, error: null },
    }));

    try {
      const res = await fetch('/api/admin/send-to-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to score tool with AI');
      }

      // On success: update agent in local state in-place
      setPendingAgents(prev =>
        prev.map(agent =>
          agent.id === agentId
            ? { ...agent, ai_score: data.ai_score, ai_scores: data.ai_scores }
            : agent
        )
      );

      setScoringState(prev => ({
        ...prev,
        [agentId]: { loading: false, error: null },
      }));
    } catch (err: any) {
      console.error('Send to review error:', err);
      setScoringState(prev => ({
        ...prev,
        [agentId]: { loading: false, error: err.message || 'Scoring failed' },
      }));
    }
  };

  // State B: Submit manual score & final decision
  const handleSubmitReview = async (agentId: number) => {
    const form = reviewFormState[agentId] || { adminScore: '7.0', notes: '' };
    const numericScore = parseFloat(form.adminScore);

    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      setReviewFormState(prev => ({
        ...prev,
        [agentId]: {
          ...(prev[agentId] || { adminScore: '7.0', notes: '', result: null }),
          loading: false,
          error: 'Please enter a valid score between 0.0 and 10.0',
        },
      }));
      return;
    }

    setReviewFormState(prev => ({
      ...prev,
      [agentId]: {
        ...(prev[agentId] || { adminScore: form.adminScore, notes: form.notes, result: null }),
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await fetch('/api/admin/review-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          admin_score: numericScore,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review decision');
      }

      setReviewFormState(prev => ({
        ...prev,
        [agentId]: {
          adminScore: form.adminScore,
          notes: form.notes,
          loading: false,
          error: null,
          result: {
            final_score: data.final_score,
            decision: data.decision,
          },
        },
      }));

      // If approved or rejected automatically, remove from queue after 3.5s
      if (data.decision === 'approved' || data.decision === 'rejected') {
        setTimeout(() => {
          setPendingAgents(prev => prev.filter(a => a.id !== agentId));
        }, 3500);
      }
    } catch (err: any) {
      console.error('Review submission error:', err);
      setReviewFormState(prev => ({
        ...prev,
        [agentId]: {
          adminScore: form.adminScore,
          notes: form.notes,
          loading: false,
          error: err.message || 'Submission failed',
          result: null,
        },
      }));
    }
  };

  // Manual Override for Flagged Tools (Score 4.0 - 7.0)
  const handleManualOverride = async (
    agentId: number,
    agentName: string,
    vendorUserId: string,
    action: 'approved' | 'rejected'
  ) => {
    if (action === 'rejected') {
      setRejectingAgent({ id: agentId, name: agentName, userId: vendorUserId });
      setShowFeedbackModal(true);
      return;
    }

    setProcessingId(agentId);
    try {
      const res = await fetch('/api/admin/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          vendor_id: vendorUserId,
          tool_name: agentName,
          tool_slug: agentId.toString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to approve');

      setReviewFormState(prev => ({
        ...prev,
        [agentId]: {
          ...(prev[agentId] || { adminScore: '7.0', notes: '', error: null, loading: false }),
          result: {
            final_score: prev[agentId]?.result?.final_score || 5.5,
            decision: 'approved',
          },
        },
      }));

      setTimeout(() => {
        setPendingAgents(prev => prev.filter(a => a.id !== agentId));
      }, 2500);
    } catch (err: any) {
      console.error('Manual approve error:', err);
      alert('Error approving tool');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingAgent || !feedbackText.trim()) return;

    setProcessingId(rejectingAgent.id);

    try {
      const res = await fetch('/api/admin/send-rejection-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: rejectingAgent.id,
          vendor_id: rejectingAgent.userId,
          tool_name: rejectingAgent.name,
          feedback: feedbackText,
        }),
      });

      if (!res.ok) throw new Error('Failed to send rejection');

      setReviewFormState(prev => ({
        ...prev,
        [rejectingAgent.id]: {
          ...(prev[rejectingAgent.id] || { adminScore: '7.0', notes: '', error: null, loading: false }),
          result: {
            final_score: prev[rejectingAgent.id]?.result?.final_score || 3.5,
            decision: 'rejected',
          },
        },
      }));

      setShowFeedbackModal(false);
      setFeedbackText('');
      setRejectingAgent(null);

      setTimeout(() => {
        setPendingAgents(prev => prev.filter(a => a.id !== rejectingAgent.id));
      }, 2500);
    } catch (err: any) {
      console.error('Manual reject error:', err);
      alert('Error rejecting tool');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Approval Queue</h1>
          <p className="text-gray-400">
            Review and score pending AI tool submissions. {pendingAgents.length}{' '}
            {pendingAgents.length === 1 ? 'tool' : 'tools'} pending review
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Loading pending tools...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingAgents.length === 0 && (
          <div className="text-center py-12 bg-white/[0.04] border border-white/[0.08] rounded-lg">
            <p className="text-gray-400 text-lg">No pending approvals!</p>
            <p className="text-gray-500 mt-2">All tools have been reviewed.</p>
          </div>
        )}

        {/* Pending Tools List */}
        {!loading && pendingAgents.length > 0 && (
          <div className="space-y-6">
            {pendingAgents.map(agent => {
              const currentScoring = scoringState[agent.id] || {
                loading: false,
                error: null,
              };
              const currentReview = reviewFormState[agent.id] || {
                adminScore: '7.0',
                notes: '',
                loading: false,
                error: null,
                result: null,
              };

              const isScored =
                agent.ai_score !== null && agent.ai_score !== undefined;

              return (
                <div
                  key={agent.id}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.15] transition-all"
                >
                  {/* Tool Basic Info */}
                  <div className="flex justify-between items-start gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                        {isScored && (
                          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            AI Score: {agent.ai_score}/10
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">{agent.summary}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-300 ml-2">
                            {agent.category || 'Uncategorized'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Listed:</span>
                          <span className="text-gray-300 ml-2">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <a
                            href={agent.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Visit Website →
                          </a>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/products/${agent.slug || agent.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-white/[0.08] border border-white/[0.15] text-white rounded-lg hover:bg-white/[0.12] transition-all text-sm font-medium shrink-0"
                    >
                      Preview Listing
                    </Link>
                  </div>

                  {/* SCORING & REVIEW SECTION */}
                  <div className="pt-6">
                    {/* STATE A: NOT YET SCORED */}
                    {!isScored && (
                      <div>
                        {currentScoring.loading ? (
                          <div className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-300">
                            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                            <span className="text-sm font-medium">
                              Scoring with AI, this takes about 15 seconds...
                            </span>
                          </div>
                        ) : (
                          <div>
                            {currentScoring.error && (
                              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{currentScoring.error}</span>
                                </div>
                                <button
                                  onClick={() => handleSendToReview(agent.id)}
                                  className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 rounded text-xs font-semibold"
                                >
                                  Try Again
                                </button>
                              </div>
                            )}

                            {!currentScoring.error && (
                              <button
                                onClick={() => handleSendToReview(agent.id)}
                                disabled={currentScoring.loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                              >
                                <Sparkles className="w-4 h-4" />
                                Send to Review Queue
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STATE B: SCORED, AWAITING ADMIN DECISION */}
                    {isScored && (
                      <div className="space-y-6">
                        {/* Result Summary */}
                        {currentReview.result ? (
                          <div
                            className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              currentReview.result.decision === 'approved'
                                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                                : currentReview.result.decision === 'rejected'
                                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            }`}
                          >
                            <div className="flex-1">
                              {currentReview.result.decision === 'approved' && (
                                <div className="flex items-center gap-2 font-bold text-lg text-green-400">
                                  <CheckCircle className="w-5 h-5 shrink-0" />
                                  <span>Decision: Approved & Email Sent</span>
                                </div>
                              )}

                              {currentReview.result.decision === 'rejected' && (
                                <div className="flex items-center gap-2 font-bold text-lg text-red-400">
                                  <XCircle className="w-5 h-5 shrink-0" />
                                  <span>Decision: Rejected & Email Sent</span>
                                </div>
                              )}

                              {/* Flagged 4.0 - 7.0 Neutral Range: Direct Action Buttons */}
                              {currentReview.result.decision === 'pending' && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 font-bold text-lg text-amber-400">
                                    <Clock className="w-5 h-5 shrink-0" />
                                    <span>Flagged for Manual Follow-up (Score: {currentReview.result.final_score}/10)</span>
                                  </div>
                                  <p className="text-sm opacity-90 text-amber-200/80">
                                    Final score is between 4.0 and 7.0. Review the tool details above and select a final action:
                                  </p>
                                  <div className="flex gap-3 pt-2">
                                    <button
                                      onClick={() =>
                                        handleManualOverride(
                                          agent.id,
                                          agent.name,
                                          agent.user_id,
                                          'approved'
                                        )
                                      }
                                      disabled={processingId === agent.id}
                                      className="px-6 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 font-semibold transition-all flex items-center gap-2 text-sm"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      {processingId === agent.id ? 'Processing...' : 'Approve Tool'}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleManualOverride(
                                          agent.id,
                                          agent.name,
                                          agent.user_id,
                                          'rejected'
                                        )
                                      }
                                      disabled={processingId === agent.id}
                                      className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-semibold transition-all flex items-center gap-2 text-sm"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      {processingId === agent.id ? 'Processing...' : 'Reject Tool'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="px-4 py-2 bg-black/40 rounded-lg border border-white/10 text-center font-semibold shrink-0">
                              <span className="text-xs text-gray-400 block">Final Score</span>
                              <span className="text-xl text-white font-bold">
                                {currentReview.result.final_score} / 10
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Read-Only AI Sub-Scores */}
                            {agent.ai_scores && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {agent.ai_scores.business_application ? (
                                  <>
                                    {/* Business Application */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Business App
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.business_application.score}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.business_application.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* User Friendliness */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          User Friendliness
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.user_friendliness?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.user_friendliness?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* UI / UX Design */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          UI/UX Design
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.ui_ux_design?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.ui_ux_design?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* Foundation & Leadership */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Leadership
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.foundation_leadership?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.foundation_leadership?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* Indian Sensitive Pricing */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Indian Pricing
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.indian_pricing?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.indian_pricing?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Clarity */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Clarity
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.clarity?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.clarity?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* Credibility */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Credibility
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.credibility?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.credibility?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>

                                    {/* Visual */}
                                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                          Visual (UI/UX)
                                        </span>
                                        <span className="text-sm font-bold text-cyan-400">
                                          {agent.ai_scores.visual?.score ?? 0}/10
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed">
                                        {agent.ai_scores.visual?.reason || 'No reasoning provided.'}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* External Reviews Proof Submissions (if present) */}
                            {agent.external_reviews && agent.external_reviews.length > 0 && (
                              <div className="bg-white/[0.02] border border-cyan-500/20 rounded-xl p-5 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                                    <span>External Review Proofs</span>
                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                                      {agent.external_reviews.filter(r => r.status === 'verified').length} / {agent.external_reviews.length} Verified
                                    </span>
                                  </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {agent.external_reviews.map(rev => (
                                    <div
                                      key={rev.id}
                                      className="p-3 bg-black/40 border border-white/10 rounded-lg flex flex-col justify-between gap-2"
                                    >
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-bold text-white">{rev.platform || rev.source}</span>
                                          {rev.status === 'verified' ? (
                                            <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                                              <CheckCircle className="w-3 h-3" /> Verified
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                              Unverified
                                            </span>
                                          )}
                                        </div>

                                        <a
                                          href={rev.url || rev.source_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-cyan-400 hover:underline break-all block"
                                        >
                                          {rev.url || rev.source_url || 'View Link'} →
                                        </a>

                                        {rev.status === 'verified' && (
                                          <div className="text-xs text-gray-300 mt-2 font-mono">
                                            ★ {rev.rating} / 5.0 ({rev.reviews_count} reviews)
                                          </div>
                                        )}
                                      </div>

                                      {rev.status !== 'verified' && (
                                        <button
                                          onClick={() => {
                                            setVerifyingReview({
                                              id: rev.id,
                                              platform: rev.platform || rev.source,
                                              url: rev.url || rev.source_url,
                                              agentId: agent.id,
                                            });
                                            setExtRating('4.5');
                                            setExtCount('15');
                                          }}
                                          className="w-full mt-1 py-1 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded transition-all"
                                        >
                                          Check & Verify Rating
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Scoring Form */}
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
                              <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wide">
                                Admin Manual Review
                              </h4>

                              {/* Error display */}
                              {currentReview.error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{currentReview.error}</span>
                                </div>
                              )}

                              {/* Admin Score Input & Slider */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div className="md:col-span-3">
                                  <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Manual Quality Score (0.0 - 10.0):{' '}
                                    <span className="text-cyan-400 font-bold ml-1">
                                      {currentReview.adminScore}
                                    </span>
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={currentReview.adminScore}
                                    onChange={e =>
                                      setReviewFormState(prev => ({
                                        ...prev,
                                        [agent.id]: {
                                          ...currentReview,
                                          adminScore: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Exact Value
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={currentReview.adminScore}
                                    onChange={e =>
                                      setReviewFormState(prev => ({
                                        ...prev,
                                        [agent.id]: {
                                          ...currentReview,
                                          adminScore: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white font-bold text-sm outline-none focus:border-cyan-400"
                                  />
                                </div>
                              </div>

                              {/* Admin Notes Textarea */}
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  Review Notes (Optional)
                                </label>
                                <textarea
                                  value={currentReview.notes}
                                  onChange={e =>
                                    setReviewFormState(prev => ({
                                      ...prev,
                                      [agent.id]: {
                                        ...currentReview,
                                        notes: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Add notes explaining your manual score or feedback..."
                                  rows={2}
                                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 resize-none"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => handleSubmitReview(agent.id)}
                                  disabled={currentReview.loading}
                                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
                                >
                                  {currentReview.loading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Submitting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Submit Review</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rejection Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f1419] border border-white/[0.15] rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Rejection Feedback</h3>
              <p className="text-xs text-gray-400 mb-4">
                Explain to the vendor what needs improvement before their tool can be approved.
              </p>

              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Specify requirements to fix (e.g., update logo, clarify description, provide screenshot)..."
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:border-cyan-400 outline-none mb-4 h-32 text-sm"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText('');
                    setRejectingAgent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white/[0.08] text-gray-300 rounded-lg hover:bg-white/[0.12] text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!feedbackText.trim() || processingId !== null}
                  className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* External Review Verification Modal */}
        {verifyingReview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f1419] border border-cyan-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-1">
                Verify {verifyingReview.platform} Rating
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Open the URL in a tab, verify the real rating and review count on {verifyingReview.platform}, then save below.
              </p>

              <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <span className="text-xs text-gray-400 block mb-1">Submitted Link:</span>
                <a
                  href={verifyingReview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 underline font-mono break-all"
                >
                  {verifyingReview.url} ↗
                </a>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Rating (0.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={extRating}
                    onChange={e => setExtRating(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Total Review Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extCount}
                    onChange={e => setExtCount(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-white font-bold text-sm outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setVerifyingReview(null)}
                  className="flex-1 px-4 py-2 bg-white/[0.08] text-gray-300 rounded-lg hover:bg-white/[0.12] text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyReviewSubmit}
                  disabled={verifyingLoading}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 disabled:opacity-50 text-sm transition-all flex items-center justify-center gap-2"
                >
                  {verifyingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirm & Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
