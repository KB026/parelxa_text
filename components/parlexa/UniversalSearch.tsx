'use client';

import { useState, useEffect, useRef } from 'react';


// Static App Routing Map
const INTERNAL_PAGES = [
  { title: 'Dashboard', url: '/dashboard', type: 'System', icon: 'ðŸ ' },
  { title: 'Admin Controls', url: '/admin', type: 'System', icon: 'âš™ï¸' },
  { title: 'List Your Tool', url: '/vendor/listings/new', type: 'Vendor', icon: 'ðŸš€' },
  { title: 'All AI Prompts / Tools', url: '/products', type: 'Directory', icon: 'ðŸ¤–' },
  { title: 'Categories', url: '/products', type: 'Directory', icon: 'ðŸ“' },
  { title: 'Contact Support', url: '/contact', type: 'Page', icon: 'ðŸ“ž' },
  { title: 'Compare AI Tools', url: '/compare', type: 'Feature', icon: 'âš–ï¸' },
  { title: 'Sign Out / Logout', url: '/login', type: 'Auth', icon: 'ðŸšª' }
];

export function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staticMatches, setStaticMatches] = useState(INTERNAL_PAGES.slice(0, 3));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbResults, setDbResults] = useState<any[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus Shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced DB Search Logic
  useEffect(() => {
    if (query.trim().length === 0) {
      setStaticMatches(INTERNAL_PAGES.slice(0, 3));
      setDbResults([]);
      return;
    }

    // Filter Static Pages
    const lowers = query.toLowerCase();
    const sf = INTERNAL_PAGES.filter(p => p.title.toLowerCase().includes(lowers) || p.type.toLowerCase().includes(lowers));
    setStaticMatches(sf.slice(0, 3));

    if (query.trim().length >= 2) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setDbResults(data.results || []);
          }
        } catch (err) {
          console.error("Search fetch error", err);
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    } else {
      setDbResults([]);
    }
  }, [query]);

  const handleRoute = (url: string) => {
    setIsOpen(false);
    setQuery('');
    window.location.assign(url); // hard redirect to avoid caching race
  };

  return (
    <div className="universal-search-container" ref={searchRef} style={{ position: 'relative', zIndex: 1000, width: '100%' }}>
      {/* Search Input Bar */}
      <div 
        style={{
          display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', 
          border: '1px solid var(--border-subtle)', borderRadius: '24px', 
          padding: '6px 16px', gap: '8px', transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 2px rgba(56, 189, 248, 0.4)' : 'none'
        }}
      >
        <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>ðŸ”</span>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search tools, pages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          style={{
            background: 'transparent', border: 'none', outline: 'none', 
            color: 'white', fontSize: '13px', width: '100%', padding: '4px 0'
          }}
        />
        <div style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-dim)', fontWeight: 600 }}>
          âŒ˜K
        </div>
      </div>

      {/* Dropdown Palette Override */}
      {isOpen && (
        <div className="universal-search-dropdown"
          style={{
            position: 'absolute', top: 'calc(100% + 12px)', left: 0, right: 0, 
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
            borderRadius: '16px', padding: '12px', width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)',
            maxHeight: '400px', overflowY: 'auto'
          }}
        >
          {/* Static Page Matches */}
          {staticMatches.length > 0 && (
            <div style={{ marginBottom: dbResults.length > 0 ? '16px' : '0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
                Pages & Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {staticMatches.map((match, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleRoute(match.url)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', 
                      borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '16px' }}>{match.icon}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-white)' }}>{match.title}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>{match.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic DB Tool Matches */}
          {query.trim().length >= 2 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>AI Tools</span>
                {loading && <span style={{ fontSize: '10px', color: 'var(--cyan)' }}>Searching...</span>}
              </div>
              
              {!loading && dbResults.length === 0 ? (
                <div style={{ padding: '12px 8px', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>
                  No tools found for &quot;{query}&quot;
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {dbResults.map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => handleRoute(`/products/${tool.slug || tool.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', 
                        borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>ðŸ¤–</div>
                      )}
                      
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-white)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.name}</span>
                          {tool.is_verified && <span style={{ color: 'var(--cyan)', fontSize: '10px' }}>âœ“</span>}
                        </div>
                        {tool.one_liner && (
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tool.one_liner}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
