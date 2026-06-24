'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';
import { getAgentsByIds } from '@/lib/api';
import { Agent } from '@/lib/types';

export function CompareBar() {
  const { selectedIds, removeFromCompare, clearCompare } = useCompare();
  const [agents, setAgents] = useState<Agent[]>([]);
  useEffect(() => {
    if (selectedIds.length === 0) {
      setAgents([]);
      return;
    }

    const fetchAgents = async () => {
      try {
        const data = await getAgentsByIds(selectedIds);
        setAgents(data);
      } catch (err) {
        console.error('Failed to fetch compare agents:', err);
      }
    };

    fetchAgents();
  }, [selectedIds]);

  if (selectedIds.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, width: 'auto', maxWidth: '90vw',
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
      padding: '12px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: '32px',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '50%', background: 'var(--cyan)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: 'black'
        }}>
          {selectedIds.length}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)', whiteSpace: 'nowrap' }}>
          Tools to Compare
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {selectedIds.map(id => {
          const agent = agents.find(a => a.id === id);
          return (
            <div key={id} style={{ 
              position: 'relative', width: '48px', height: '48px', 
              borderRadius: '12px', background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)', overflow: 'hidden'
            }}>
              {agent?.logoUrl ? (
                <img src={agent.logoUrl} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>ðŸ¤–</div>
              )}
              <button 
                onClick={() => removeFromCompare(id)}
                style={{
                  position: 'absolute', top: '-4px', right: '-4px', 
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                  border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', zIndex: 1
                }}
              >
                âœ•
              </button>
            </div>
          );
        })}
        {selectedIds.length < 3 && (
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            border: '2px dashed var(--border-subtle)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', color: 'var(--text-dim)'
          }}>
            +
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={clearCompare}
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-dim)', 
            fontSize: '13px', cursor: 'pointer', fontWeight: 500
          }}
        >
          Clear All
        </button>
        <Link 
          href={`/compare?ids=${selectedIds.join(',')}`}
          style={{ 
            background: 'var(--cyan)', color: 'black', padding: '10px 24px', 
            borderRadius: '12px', fontWeight: 700, fontSize: '14px', 
            textDecoration: 'none', transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Compare {selectedIds.length >= 2 ? 'Now' : ''}
        </Link>
      </div>
    </div>
  );
}
