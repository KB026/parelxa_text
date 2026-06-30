'use client';
import { useEffect, useState } from 'react';
import { useUserRole } from '@/lib/auth/useUserRole';
import { Heart, BarChart3, MessageSquare, GitCompare } from 'lucide-react';
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
  };
}

export default function ConsumerDashboard() {
  const { role, loading } = useUserRole();
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  const [folders, setFolders] = useState<string[]>(['All Tools']);
  const [selectedFolder, setSelectedFolder] = useState('All Tools');

  useEffect(() => {
    if (role === 'consumer' || role === 'admin') {
      fetchSavedTools();
    }
  }, [role]);

  const fetchSavedTools = async () => {
    try {
      const res = await fetch('/api/saved-tools');
      if (res.ok) {
        const { savedTools } = await res.json();
        setSavedTools(savedTools || []);
        
        // Extract unique folders
        const uniqueFolders = ['All Tools', ...Array.from(new Set((savedTools || []).map((t: SavedTool) => t.folder_name)))];
        setFolders(uniqueFolders as string[]);
      }
    } catch (err) {
      console.error('Failed to fetch saved tools:', err);
    }
  };

  const filteredTools = selectedFolder === 'All Tools' 
    ? savedTools 
    : savedTools.filter(t => t.folder_name === selectedFolder);

  if (loading) return <div className="p-8">Loading...</div>;
  if (role !== 'consumer' && role !== 'admin') return <div className="p-8">Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-900 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-gray-400">Manage your saved tools and discover new solutions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <Heart className="w-6 h-6 text-red-400 mb-2" />
            <div className="text-2xl font-bold text-white">{savedTools.length}</div>
            <div className="text-sm text-gray-400">Saved Tools</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <BarChart3 className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{folders.length}</div>
            <div className="text-sm text-gray-400">Folders</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <MessageSquare className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-sm text-gray-400">My Reviews</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <GitCompare className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-sm text-gray-400">Comparisons</div>
          </div>
        </div>

        {/* Folders + Saved Tools */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Saved Tools</h2>

          {/* Folder tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
            {folders.map(folder => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedFolder === folder
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {folder} ({folder === 'All Tools' ? savedTools.length : savedTools.filter(t => t.folder_name === folder).length})
              </button>
            ))}
          </div>

          {/* Tools grid */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tools saved yet</p>
              <Link href="/products">
                <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                  Explore Tools
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map(saved => (
                <div
                  key={saved.id}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{saved.agents?.name}</h3>
                      <p className="text-xs text-gray-400">{saved.folder_name}</p>
                    </div>
                    <div className="text-yellow-400 font-bold">{saved.agents?.rating?.toFixed(1) || '0.0'}</div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{saved.agents?.summary}</p>
                  <div className="flex gap-2">
                    <Link href={`/products/${saved.agents?.slug}`}>
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold">
                        View
                      </button>
                    </Link>
                    <button 
                      onClick={async () => {
                        await fetch('/api/saved-tools', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ agent_id: saved.agent_id })
                        });
                        fetchSavedTools();
                      }}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
