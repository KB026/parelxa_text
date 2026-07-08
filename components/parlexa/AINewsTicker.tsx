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
    <section className="bg-[#111111] border-y border-white/[0.08] py-3 overflow-hidden">
      <div className="category-ticker-container">
        {/* We use a much slower animation duration (90s) since text phrases are longer than single word categories */}
        <div className="category-ticker-track" style={{ animationDuration: '90s' }}>
          {tickerItems.map((item: NewsItem, i: number) => (
            <a 
              key={i} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[#A1A1AA] text-sm font-medium tracking-wide hover:text-[#EDEDED] transition-colors"
            >
              <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>
              <span className="text-[#EDEDED]">{item.title}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#71717A]">— {item.source}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
