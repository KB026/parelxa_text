'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface PendingAgent {
  id: number;
  name: string;
  slug: string;
  summary: string;
  category: string;
  website: string;
  user_id: string;
  created_at: string;
}

interface Vendor {
  id: string;
  contact_email: string;
  company_name?: string;
}

export default function ApprovalQueuePage() {
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchPendingAgents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending agents:', error);
    }

    if (!error && data) {
      setPendingAgents(data as PendingAgent[]);
    }
    setLoading(false);
  };

  const handleApprove = async (agentId: number, agentName: string, vendorId: string) => {
    setProcessingId(agentId);

    try {
      // Update agent status
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          approval_status: 'approved',
        })
        .eq('id', agentId);

      if (updateError) throw updateError;

      // Get vendor email
      const { data: vendor } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', vendorId)
        .single();

      if (vendor?.email) {
        // Send approval email
        await fetch('/api/admin/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor_email: vendor.email,
            tool_name: agentName,
            tool_slug: agentId,
          }),
        });
      }

      // Remove from pending list
      setPendingAgents(pendingAgents.filter(a => a.id !== agentId));

      alert(`✅ ${agentName} approved! Vendor notified.`);
    } catch (error) {
      console.error('Approval error:', error);
      alert('❌ Error approving tool');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (agentId: number) => {
    setRejectingId(agentId);
    setShowFeedbackModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !feedbackText.trim()) return;

    setProcessingId(rejectingId);

    try {
      const agent = pendingAgents.find(a => a.id === rejectingId);
      if (!agent) return;

      // Update agent status
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          approval_status: 'rejected',
        })
        .eq('id', rejectingId);

      if (updateError) throw updateError;

      // Get vendor email
      const { data: vendor } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', agent.user_id)
        .single();

      if (vendor?.email) {
        // Send rejection email
        await fetch('/api/admin/send-rejection-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendor_email: vendor.email,
            tool_name: agent.name,
            feedback: feedbackText,
          }),
        });
      }

      // Remove from pending list
      setPendingAgents(pendingAgents.filter(a => a.id !== rejectingId));

      alert(`❌ ${agent.name} rejected. Vendor notified.`);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setRejectingId(null);
    } catch (error) {
      console.error('Rejection error:', error);
      alert('❌ Error rejecting tool');
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
            {pendingAgents.length} {pendingAgents.length === 1 ? 'tool' : 'tools'} pending review
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading pending tools...</p>
          </div>
        )}

        {/* No Pending Tools */}
        {!loading && pendingAgents.length === 0 && (
          <div className="text-center py-12 bg-white/[0.04] border border-white/[0.08] rounded-lg">
            <p className="text-gray-400 text-lg">No pending approvals!</p>
            <p className="text-gray-500 mt-2">All tools have been reviewed.</p>
          </div>
        )}

        {/* Pending Tools List */}
        {!loading && pendingAgents.length > 0 && (
          <div className="space-y-4">
            {pendingAgents.map(agent => (
              <div
                key={agent.id}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.15] transition-all"
              >
                <div className="flex justify-between items-start gap-6">
                  {/* Tool Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                    <p className="text-gray-400 mb-3">{agent.summary}</p>
                    
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-300 ml-2">{agent.category || 'Uncategorized'}</span>
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
                          rel="noopener"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          Visit Website →
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(agent.id, agent.name, agent.user_id)}
                      disabled={processingId === agent.id}
                      className="px-6 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 disabled:opacity-50 font-semibold transition-all"
                    >
                      {processingId === agent.id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectClick(agent.id)}
                      disabled={processingId === agent.id}
                      className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-semibold transition-all"
                    >
                      {processingId === agent.id ? 'Processing...' : '✕ Reject'}
                    </button>
                    <Link
                      href={`/products/${agent.slug}`}
                      target="_blank"
                      className="px-4 py-2 bg-white/[0.1] border border-white/[0.2] text-white rounded-lg hover:bg-white/[0.15] transition-all"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1419] border border-white/[0.2] rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Rejection Feedback</h3>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Explain why this tool is being rejected..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:border-cyan-400 outline-none mb-4 h-32"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setRejectingId(null);
                }}
                className="flex-1 px-4 py-2 bg-white/[0.1] text-white rounded-lg hover:bg-white/[0.15]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!feedbackText.trim() || processingId !== null}
                className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 font-semibold"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
