'use client';
import { useEffect, useState } from 'react';
import { Heart, Download, Folder, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface SavedTool {
  id: string;
  agent_id: string;
  folder_name: string;
  agents: {
    id: string;
    name: string;
    summary: string;
    rating: number;
    slug: string;
    logo_url: string;
    category: string;
  };
}

interface FolderType {
  id: string;
  folder_name: string;
}

export default function ConsumerDashboard() {
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('All Tools');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch saved tools
      const toolsRes = await fetch('/api/saved-tools');
      if (!toolsRes.ok) throw new Error('Failed to fetch tools');
      const toolsData = await toolsRes.json();
      setSavedTools(toolsData.savedTools || []);

      // Fetch folders
      const foldersRes = await fetch('/api/saved-tool-folders');
      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData.folders || []);
      }

      console.log('✅ Loaded data');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      console.error('❌ Fetch error:', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch('/api/saved-tool-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: newFolderName }),
      });

      if (!res.ok) throw new Error('Failed to create folder');
      
      setNewFolderName('');
      setShowNewFolder(false);
      fetchData();
    } catch (err) {
      console.error('❌ Folder create error:', err);
    }
  };

  const handleRemove = async (agentId: string) => {
    try {
      const res = await fetch('/api/saved-tools', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      if (!res.ok) throw new Error('Failed to remove');
      
      setSavedTools(prev => prev.filter(t => t.agent_id !== agentId));
      console.log('✅ Removed tool:', agentId);
    } catch (err) {
      console.error('❌ Remove error:', err);
    }
  };

  const handleMoveToFolder = async (agentId: string, folderName: string) => {
    try {
      const res = await fetch('/api/saved-tools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, folderName }),
      });

      if (!res.ok) throw new Error('Failed to move');
      
      setSavedTools(prev =>
        prev.map(t => t.agent_id === agentId ? { ...t, folder_name: folderName } : t)
      );
      console.log('✅ Moved tool to folder:', folderName);
    } catch (err) {
      console.error('❌ Move error:', err);
    }
  };

  const folderList = ['All Tools', ...folders.map(f => f.folder_name)];
  const filteredTools = selectedFolder === 'All Tools' 
    ? savedTools 
    : savedTools.filter(t => t.folder_name === selectedFolder);

  return (
    <section>
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px', marginBottom: '48px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            My Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
            Manage your saved tools and organize them into folders
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div 
          onClick={() => setSelectedFolder('All Tools')}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} className="text-red-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Saved Tools</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>{savedTools.length}</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={24} className="text-blue-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Folders</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>{folderList.length}</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={24} className="text-purple-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Downloaded</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>0</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} className="text-green-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Favorites</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)' }}>0</div>
          </div>
        </div>
      </div>

      {/* Saved Tools Section */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Saved Tools</h2>
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
              background: 'var(--cyan)', border: 'none', borderRadius: '12px',
              color: 'black', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
            }}
          >
            <Plus size={16} /> New Folder
          </button>
        </div>

        {/* Create Folder Input */}
        {showNewFolder && (
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              style={{
                flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)', borderRadius: '12px',
                color: 'var(--text-white)', fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button
              onClick={handleCreateFolder}
              style={{
                padding: '12px 24px', background: '#22c55e', border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
              }}
            >
              Create
            </button>
          </div>
        )}

        {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>Loading...</p>}
        
        {error && (
          <div style={{ color: '#f87171', textAlign: 'center', padding: '48px 0', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Folder Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', overflowX: 'auto' }}>
              {folderList.map(folder => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: selectedFolder === folder ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
                    color: selectedFolder === folder ? 'black' : 'var(--text-muted)',
                    fontWeight: 600, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {folder} ({folder === 'All Tools' ? savedTools.length : savedTools.filter(t => t.folder_name === folder).length})
                </button>
              ))}
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Heart size={48} style={{ color: 'var(--text-dim)', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No tools in this folder</p>
                <Link href="/products">
                  <button style={{
                    padding: '12px 24px', background: 'var(--cyan)', border: 'none', borderRadius: '12px',
                    color: 'black', fontWeight: 700, cursor: 'pointer', fontSize: '14px'
                  }}>
                    Explore Tools
                  </button>
                </Link>
              </div>
            ) : (
              <div className="agents-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {filteredTools.map(saved => (
                  <div
                    key={saved.id}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      borderRadius: '20px', padding: '24px', transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {saved.agents?.logo_url ? (
                          <img src={saved.agents.logo_url} alt={saved.agents.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '20px', fontWeight: 700 }}>{saved.agents?.name?.[0] || '?'}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{saved.agents?.name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{saved.agents?.category}</span>
                      </div>
                      <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '14px' }}>
                        ★ {saved.agents?.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {saved.agents?.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <Link href={`/products/${saved.agents?.slug}`} style={{ flex: 1 }}>
                        <button style={{
                          width: '100%', padding: '10px', background: 'var(--cyan)', border: 'none', borderRadius: '10px',
                          color: 'black', fontWeight: 700, cursor: 'pointer', fontSize: '13px'
                        }}>
                          View Tool
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemove(saved.agent_id)}
                        style={{
                          padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                          color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <select
                      value={saved.folder_name}
                      onChange={(e) => handleMoveToFolder(saved.agent_id, e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)', borderRadius: '10px',
                        color: 'var(--text-white)', fontSize: '13px', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      {folderList.map(f => (
                        <option key={f} value={f} style={{ background: 'var(--bg-card)', color: 'var(--text-white)' }}>{f}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
