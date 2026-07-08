'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ExternalLink, Clock, AlertCircle, Inbox, Shield } from 'lucide-react';
import { sendVendorReply } from '@/app/dashboard/vendor/resolution/actions';

export type Message = {
  id: string;
  agent_id: number;
  vendor_id: string;
  admin_id: string;
  message_content: string;
  sender_type: 'admin' | 'vendor';
  is_read: boolean;
  created_at: string;
};

export type VendorThread = {
  agent_id: number;
  agent_name: string;
  approval_status: string;
  messages: Message[];
};

export function VendorResolutionClient({ threads: initialThreads }: { threads: VendorThread[] }) {
  const [threads, setThreads] = useState<VendorThread[]>(initialThreads);
  const [activeAgentId, setActiveAgentId] = useState<number | null>(
    threads.length > 0 ? threads[0].agent_id : null
  );

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.agent_id === activeAgentId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeAgentId) return;

    const content = message.trim();
    setMessage('');
    setIsSending(true);

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      agent_id: activeAgentId,
      vendor_id: 'me',
      admin_id: '',
      message_content: content,
      sender_type: 'vendor',
      is_read: false,
      created_at: new Date().toISOString()
    };

    setThreads(prev => prev.map(t => {
      if (t.agent_id === activeAgentId) {
        return { ...t, messages: [...t.messages, optimisticMessage] };
      }
      return t;
    }));

    const result = await sendVendorReply(activeAgentId, content);
    
    if (!result.success) {
      // Revert on failure
      setThreads(prev => prev.map(t => {
        if (t.agent_id === activeAgentId) {
          return { ...t, messages: t.messages.filter(m => m.id !== optimisticMessage.id) };
        }
        return t;
      }));
      alert('Failed to send message: ' + result.error);
    } else if (result.message) {
      // Update temp id with real id
      setThreads(prev => prev.map(t => {
        if (t.agent_id === activeAgentId) {
          return {
            ...t,
            messages: t.messages.map(m => m.id === optimisticMessage.id ? result.message : m)
          };
        }
        return t;
      }));
    }

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
    }
  };

  if (threads.length === 0) {
    return (
      <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center bg-white/[0.02] border border-white/[0.08] rounded-2xl">
        <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(14,165,233,0.15)]">
          <Inbox className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Inbox is Clear</h2>
        <p className="text-gray-500 max-w-sm text-center">
          No active support tickets. When admins request changes to your tool submissions, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <section className="h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Resolution Center</h1>
        <p className="text-gray-500 text-sm">Read and reply to messages from Parlexa Admins.</p>
      </div>

      <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex min-h-0">
        
        {/* Left Column: Thread List */}
        <div className="w-80 border-r border-white/[0.08] flex flex-col bg-[#0A0A0C]">
          <div className="p-4 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Support Tickets</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map(thread => {
              const latestMsg = thread.messages[thread.messages.length - 1];
              const isActive = thread.agent_id === activeAgentId;
              const isUnreadAdmin = latestMsg && latestMsg.sender_type === 'admin' && !latestMsg.is_read;
              
              return (
                <button
                  key={thread.agent_id}
                  onClick={() => setActiveAgentId(thread.agent_id)}
                  className={`w-full text-left p-4 border-b border-white/[0.04] transition-colors relative
                    ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                >
                  {isUnreadAdmin && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
                  )}
                  <div className="flex items-center justify-between mb-1.5 pr-6">
                    <h4 className="text-sm font-medium text-white truncate pr-2">{thread.agent_name}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getStatusColor(thread.approval_status)} flex-shrink-0`}>
                      {thread.approval_status}
                    </span>
                  </div>
                  {latestMsg ? (
                    <p className="text-xs text-gray-500 line-clamp-2 pr-2">
                      <span className="font-medium text-gray-400">
                        {latestMsg.sender_type === 'vendor' ? 'You: ' : 'Admin: '}
                      </span>
                      {latestMsg.message_content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 italic">No messages yet.</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Area */}
        <div className="flex-1 flex flex-col bg-[#09090B]">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h2 className="text-lg font-semibold text-white">{activeThread.agent_name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                    Communicate with Parlexa Admins
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeThread.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
                    <h3 className="text-white font-medium mb-1">Awaiting Admin</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      There are no messages in this thread yet.
                    </p>
                  </div>
                ) : (
                  activeThread.messages.map((msg, idx) => {
                    const isVendor = msg.sender_type === 'vendor';
                    const showTime = idx === 0 || 
                      (new Date(msg.created_at).getTime() - new Date(activeThread.messages[idx - 1].created_at).getTime() > 3600000); // 1 hour

                    return (
                      <div key={msg.id || idx} className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                        {showTime && (
                          <div className="text-[10px] text-gray-600 font-medium mb-3 uppercase tracking-wider px-2">
                            {new Date(msg.created_at).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
                            })}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm
                            ${isVendor 
                              ? 'bg-sky-600 text-white border border-sky-500 rounded-tr-sm shadow-[0_0_15px_rgba(2,132,199,0.2)]' 
                              : 'bg-[#2A2A2E] text-gray-200 border border-white/[0.05] rounded-tl-sm'
                            }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message_content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/[0.08] bg-[#0A0A0C]">
                <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply to the admin... (Press Enter to send)"
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-sky-500/40 resize-none min-h-[50px] max-h-32 transition-colors"
                    rows={1}
                    style={{ height: message.split('\n').length > 1 ? `${Math.min(message.split('\n').length * 24 + 24, 128)}px` : '50px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex-shrink-0 h-[50px] px-5 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <span>Send Reply</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">Select a ticket</h3>
              <p className="text-sm text-gray-600">Choose a support ticket from the sidebar to read and reply.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
