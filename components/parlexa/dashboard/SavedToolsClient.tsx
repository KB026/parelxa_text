/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AgentCard } from '@/components/parlexa/AgentCard';
import { Trash2, FolderPlus, Folder, Check } from 'lucide-react';
import { Agent } from '@/lib/types';
import { toggleWishlist, createFolder, moveToolToFolder } from '@/app/actions/wishlist';

interface FolderDB {
  id: string;
  name: string;
}

interface SavedToolsClientProps {
  initialTools: Agent[];
  initialFolders: FolderDB[];
}

export function SavedToolsClient({ initialTools, initialFolders }: SavedToolsClientProps) {
  const [tools, setTools] = useState<Agent[]>(initialTools);
  const [folders, setFolders] = useState<FolderDB[]>(initialFolders);
  const [activeFolder, setActiveFolder] = useState<string | null>('all');

  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);

  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);
  
  // Folder Creation State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Move Tool State
  const [movingToolId, setMovingToolId] = useState<number | null>(null);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    const { folder, error } = await createFolder(newFolderName);
    if (folder) {
      setFolders([...folders, folder]);
      setIsCreatingFolder(false);
      setNewFolderName('');
    } else {
      alert(error || 'Failed to create folder');
    }
  };

  const handleRemove = async (agentId: number) => {
    // Optimistic UI update
    setTools(tools.filter(t => Number(t.id) !== agentId));
    await toggleWishlist(agentId);
  };

  const handleMoveTool = async (agentId: number, folderId: string | null) => {
    // Optimistic UI update
    setTools(tools.map(t => Number(t.id) === agentId ? { ...t, folder_id: folderId } as Agent : t));
    setMovingToolId(null);
    await moveToolToFolder(agentId, folderId);
  };

  const filteredTools = activeFolder === 'all' 
    ? tools 
    : activeFolder === 'unassigned'
      ? tools.filter((t: any) => !t.folder_id)
      : tools.filter((t: any) => t.folder_id === activeFolder);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px' }}>Saved Tools</h1>
          <p style={{ color: 'var(--text-muted)' }}>Organize and manage your integration shortlist.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            href="/products" 
            className="bg-transparent border border-sky-500/50 hover:bg-sky-500/10 text-sky-400 transition-all" 
            style={{ padding: '12px 20px', fontSize: '14px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            Add More to Wishlist
          </Link>
          <button 
            onClick={() => setIsCreatingFolder(true)}
            className="bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-lg shadow-sky-500/20" 
            style={{ padding: '12px 20px', fontSize: '14px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FolderPlus size={18} /> New Folder
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button 
          onClick={() => setActiveFolder('all')}
          style={{ 
            padding: '10px 20px', borderRadius: '12px', 
            background: activeFolder === 'all' ? 'var(--cyan)' : 'var(--bg-secondary)', 
            color: activeFolder === 'all' ? 'black' : 'var(--text-white)', 
            fontWeight: activeFolder === 'all' ? 700 : 500, 
            border: activeFolder === 'all' ? 'none' : '1px solid var(--border-subtle)', 
            cursor: 'pointer', whiteSpace: 'nowrap' 
        }}>
          All Tools ({tools.length})
        </button>
        <button 
          onClick={() => setActiveFolder('unassigned')}
          style={{ 
            padding: '10px 20px', borderRadius: '12px', 
            background: activeFolder === 'unassigned' ? 'var(--cyan)' : 'var(--bg-secondary)', 
            color: activeFolder === 'unassigned' ? 'black' : 'var(--text-white)', 
            fontWeight: activeFolder === 'unassigned' ? 700 : 500, 
            border: activeFolder === 'unassigned' ? 'none' : '1px solid var(--border-subtle)', 
            cursor: 'pointer', whiteSpace: 'nowrap' 
        }}>
          Unassigned ({tools.filter((t: any) => !t.folder_id).length})
        </button>
        {folders.map(folder => {
          const count = tools.filter((t: any) => t.folder_id === folder.id).length;
          return (
            <button 
              key={folder.id} 
              onClick={() => setActiveFolder(folder.id)}
              style={{ 
                padding: '10px 20px', borderRadius: '12px', 
                background: activeFolder === folder.id ? 'var(--cyan)' : 'var(--bg-secondary)', 
                color: activeFolder === folder.id ? 'black' : 'var(--text-white)', 
                fontWeight: activeFolder === folder.id ? 700 : 500, 
                border: activeFolder === folder.id ? 'none' : '1px solid var(--border-subtle)', 
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              <Folder size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {folder.name} ({count})
            </button>
          )
        })}
      </div>

      {filteredTools.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
          <FolderPlus size={48} className="text-slate-500 mb-4" />
          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>No tools in this folder</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Save tools from the marketplace to organize them here.</p>
        </div>
      ) : (
        <div className="agents-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {filteredTools.map(agent => (
            <div key={agent.id} style={{ position: 'relative' }}>
              <AgentCard agent={agent} />
              <div 
                onClick={() => handleRemove(Number(agent.id))}
                style={{ 
                  position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', 
                  backdropFilter: 'blur(8px)', borderRadius: '8px', padding: '8px', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
                title="Remove from wishlist"
                className="hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
              >
                <Trash2 size={20} className="text-red-400" />
              </div>
              
              <div style={{ position: 'relative', marginTop: '12px' }}>
                <button 
                  onClick={() => setMovingToolId(movingToolId === Number(agent.id) ? null : Number(agent.id))}
                  style={{ 
                    width: '100%', padding: '10px', borderRadius: '8px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-white)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                  }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <Folder size={14} /> 
                  Move to Folder
                </button>

                {movingToolId === Number(agent.id) && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: '12px', padding: '8px', zIndex: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '4px 8px', marginBottom: '4px' }}>Select Folder</div>
                    <button 
                      onClick={() => handleMoveTool(Number(agent.id), null)}
                      style={{ 
                        width: '100%', padding: '8px', background: 'transparent', border: 'none',
                        color: 'white', textAlign: 'left', cursor: 'pointer', borderRadius: '6px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                      className="hover:bg-white/10"
                    >
                      Unassigned {!(agent as any).folder_id && <Check size={14} className="text-sky-400" />}
                    </button>
                    {folders.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => handleMoveTool(Number(agent.id), f.id)}
                        style={{ 
                          width: '100%', padding: '8px', background: 'transparent', border: 'none',
                          color: 'white', textAlign: 'left', cursor: 'pointer', borderRadius: '6px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        className="hover:bg-white/10"
                      >
                        {f.name} {(agent as any).folder_id === f.id && <Check size={14} className="text-sky-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Folder Modal */}
      {isCreatingFolder && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px' }}>Create New Folder</h2>
            <form onSubmit={handleCreateFolder}>
              <label htmlFor="new-folder-name" style={{ display: 'block', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>Folder Name</label>
              <input 
                id="new-folder-name"
                name="newFolderName"
                type="text" 
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. HR Tools, Q3 Evaluation"
                style={{ 
                  width: '100%', padding: '12px 16px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)', borderRadius: '12px',
                  color: 'white', fontSize: '15px', marginBottom: '24px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCreatingFolder(false)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newFolderName.trim()}
                  style={{ padding: '10px 20px', background: 'var(--cyan)', border: 'none', color: 'black', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, opacity: newFolderName.trim() ? 1 : 0.5 }}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
