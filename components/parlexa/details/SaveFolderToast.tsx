'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getFolders, moveToolToFolder } from '@/app/actions/wishlist';
import { Check, FolderPlus, X } from 'lucide-react';
import Link from 'next/link';

interface FolderDB {
  id: string;
  name: string;
}

interface SaveFolderToastProps {
  agentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveFolderToast({ agentId, isOpen, onClose }: SaveFolderToastProps) {
  const [folders, setFolders] = useState<FolderDB[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [moving, setMoving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      getFolders().then(f => setFolders(f));
      setShowOptions(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !showOptions) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showOptions, onClose]);

  const handleMove = async (folderId: string | null) => {
    setMoving(true);
    await moveToolToFolder(agentId, folderId);
    setMoving(false);
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: '300px', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={14} color="black" strokeWidth={3} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Saved!</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {!showOptions ? (
            <button 
              onClick={() => setShowOptions(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--cyan)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              className="hover:text-sky-300"
            >
              Organize
            </button>
          ) : (
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {showOptions && (
        <div style={{
          marginTop: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '16px', padding: '16px', width: '100%', minWidth: '300px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Save to Folder</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {folders.length === 0 && (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>
                No folders created yet.
              </div>
            )}
            {folders.map(f => (
              <button
                key={f.id}
                disabled={moving}
                onClick={() => handleMove(f.id)}
                style={{
                  width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
                  color: 'white', textAlign: 'left', borderRadius: '8px', cursor: moving ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: 500, display: 'flex', justifyContent: 'space-between'
                }}
                className="hover:bg-white/10"
              >
                {f.name}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <Link 
              href="/dashboard/consumer/saved"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan)',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600, justifyContent: 'center'
              }}
            >
              <FolderPlus size={16} /> Manage Folders in Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
