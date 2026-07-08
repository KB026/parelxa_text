'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { sendMessageToVendor } from '@/app/(admin)/admin/resolution-center/actions';
import { useSearchParams, useRouter } from 'next/navigation';

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

export type Thread = {
  agent_id: number;
  agent_name: string;
  vendor_email: string;
  website: string | null;
  messages: Message[];
};

export function ResolutionCenterClient({ threads: initialThreads }: { threads: Thread[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialAgentId = searchParams.get('agentId');
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeAgentId, setActiveAgentId] = useState<number | null>(
    initialAgentId ? Number(initialAgentId) : (threads.length > 0 ? threads[0].agent_id : null)
  );

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.agent_id === activeAgentId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // Clean up URL if we loaded with a query param
  useEffect(() => {
    if (initialAgentId) {
      window.history.replaceState(null, '', '/admin/resolution-center');
    }
  }, [initialAgentId]);

  const handleSend = async () => {
    if (!message.trim() || !activeAgentId) return;

    const content = message.trim();
    setMessage('');
    setIsSending(true);

    // Optimistic UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      agent_id: activeAgentId,
      vendor_id: '',
      admin_id: 'me',
      message_content: content,
      sender_type: 'admin',
      is_read: false,
      created_at: new Date().toISOString()
    };

    setThreads(prev => prev.map(t => {
      if (t.agent_id === activeAgentId) {
        return { ...t, messages: [...t.messages, optimisticMessage] };
      }
      return t;
    }));

    const result = await sendMessageToVendor(activeAgentId, content);
    
    if (!result.success) {
      // Revert on failure (simplified - we could add better error handling)
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

  return (
    <section className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Resolution Center</h1>
        <p className="text-gray-500 text-sm">Communicate with vendors regarding their tool submissions.</p>
      </div>

      <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden flex min-h-0">
        
        {/* Left Column: Thread List */}
        <div className="w-80 border-r border-white/[0.08] flex flex-col bg-[#0A0A0C]">
          <div className="p-4 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Threads</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No active conversations.
              </div>
            ) : (
              threads.map(thread => {
                const latestMsg = thread.messages[thread.messages.length - 1];
                const isActive = thread.agent_id === activeAgentId;
                const isUnreadVendor = latestMsg && latestMsg.sender_type === 'vendor' && !latestMsg.is_read;
                
                return (
                  <button
                    key={thread.agent_id}
                    onClick={() => setActiveAgentId(thread.agent_id)}
                    className={`w-full text-left p-4 border-b border-white/[0.04] transition-colors relative
                      ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                  >
                    {isUnreadVendor && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    )}
                    <h4 className="text-sm font-medium text-white truncate pr-6">{thread.agent_name}</h4>
                    <p className="text-xs text-sky-400 truncate mb-2">{thread.vendor_email}</p>
                    {latestMsg ? (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        <span className="font-medium text-gray-400">
                          {latestMsg.sender_type === 'admin' ? 'You: ' : 'Vendor: '}
                        </span>
                        {latestMsg.message_content}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 italic">No messages yet. Start the conversation.</p>
                    )}
                  </button>
                );
              })
            )}
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
                  <p className="text-xs text-gray-500 mt-0.5">Vendor: {activeThread.vendor_email}</p>
                </div>
                {activeThread.website && (
                  <a
                    href={activeThread.website.startsWith('http') ? activeThread.website : `https://${activeThread.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 hover:bg-white/[0.05]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit Website
                  </a>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeThread.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
                    <h3 className="text-white font-medium mb-1">Start a conversation</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Send a message to the vendor to request changes, better screenshots, or clarify details about their tool.
                    </p>
                  </div>
                ) : (
                  activeThread.messages.map((msg, idx) => {
                    const isAdmin = msg.sender_type === 'admin';
                    const showTime = idx === 0 || 
                      (new Date(msg.created_at).getTime() - new Date(activeThread.messages[idx - 1].created_at).getTime() > 3600000); // 1 hour

                    return (
                      <div key={msg.id || idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        {showTime && (
                          <div className="text-[10px] text-gray-600 font-medium mb-3 uppercase tracking-wider px-2">
                            {new Date(msg.created_at).toLocaleString('en-IN', {
                              day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
                            })}
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm
                            ${isAdmin 
                              ? 'bg-sky-600/20 text-sky-50 border border-sky-500/20 rounded-tr-sm' 
                              : 'bg-[#1E1E24] text-gray-200 border border-white/[0.05] rounded-tl-sm'
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
                    placeholder="Type a message to the vendor... (Press Enter to send)"
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-sky-500/40 resize-none min-h-[50px] max-h-32"
                    rows={1}
                    style={{ height: message.split('\n').length > 1 ? `${Math.min(message.split('\n').length * 24 + 24, 128)}px` : '50px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex-shrink-0 h-[50px] px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-600/20"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-16 h-16 text-gray-700 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">No thread selected</h3>
              <p className="text-sm text-gray-600">Select a conversation from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
