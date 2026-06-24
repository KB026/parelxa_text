import React from 'react';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string;
}

// Fetches live news from Serper Dev API (Google News)
async function fetchAINews(): Promise<NewsItem[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error('AINewsTicker: SERPER_API_KEY is missing from environment variables.');
    return [];
  }
  
  try {
    const raw = JSON.stringify({
      q: "Artificial Intelligence OR AI",
      tbm: "nws",
      num: 10
    });
    
    // next: { revalidate: 3600 } applies ISR caching to prevent burning API credits. (Refreshes server cache every hour)
    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: raw,
      next: { revalidate: 3600 } 
    });
    
    const data = await response.json();
    return data.news || [];
  } catch (e) {
    console.error('Failed to fetch AI news from Serper:', e);
    return [];
  }
}

export async function AINewsTicker() {
  const news = await fetchAINews();
  
  // Graceful degradation if no news can be fetched
  if (!news || news.length === 0) {
    return null; 
  }

  // Duplicate items 3 times to create a seamless infinite scroll illusion spanning ultra-wide monitors
  const tickerItems = [...news, ...news, ...news];

  return (
    <section style={{ 
      borderTop: '1px solid var(--border-subtle)', 
      borderBottom: 'none', 
      background: 'rgba(255,255,255,0.02)', 
      overflow: 'hidden',
      padding: '24px 0'
    }}>
      <div className="category-ticker-container">
        {/* We use a much slower animation duration (90s) since text phrases are longer than single word categories */}
        <div className="category-ticker-track" style={{ animationDuration: '90s' }}>
          {tickerItems.map((item: NewsItem, i: number) => (
            <a 
              key={i} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--text-dim)', 
                fontSize: '15px', 
                fontWeight: 500, 
                textDecoration: 'none', 
                transition: 'color 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ color: 'var(--cyan)', fontSize: '18px' }}>â€¢</span>
              <span style={{ color: '#fff' }}>{item.title}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                â€” {item.source}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
