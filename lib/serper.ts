import axios from 'axios';

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  rating?: number;
  ratingCount?: number;
  source: string;
}

interface SerperOrganic {
  title: string;
  link: string;
  snippet: string;
  rating?: number;
  ratingCount?: number;
  reviewCount?: number;
}

export async function searchReviews(agentName: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error('SERPER_API_KEY is not defined in environment variables');
    return [];
  }

  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: `${agentName} software reviews ratings`,
        num: 10,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const organic = (response.data as { organic?: SerperOrganic[] }).organic || [];
    const results: SerperResult[] = [];

    const targetDomains = [
      { host: 'g2.com', name: 'G2' },
      { host: 'producthunt.com', name: 'Product Hunt' },
      { host: 'trustpilot.com', name: 'Trustpilot' },
      { host: 'capterra.com', name: 'Capterra' },
      { host: 'gartner.com', name: 'Gartner' },
      { host: 'sourceforge.net', name: 'SourceForge' },
      { host: 'appsumo.com', name: 'AppSumo' },
    ];

    organic.forEach((item: SerperOrganic) => {
      const domainMatch = targetDomains.find(d => item.link.includes(d.host));
      if (domainMatch) {
        // Extract rating/count from snippet if not provided as structured data
        // Google often provides: "Rating: 4.8 · ‎12 reviews" or "4.8/5 (120)"
        let rating = item.rating;
        let ratingCount = item.ratingCount || item.reviewCount;

        if (!rating) {
          const ratingMatch = item.snippet.match(/Rating:\s*([0-9.]+)/i) || 
                          item.snippet.match(/([0-9.]+)\/5/i) ||
                          item.snippet.match(/([0-9.]+)\s*stars/i);
          if (ratingMatch) rating = parseFloat(ratingMatch[1]);
        }

        if (!ratingCount) {
          const countMatch = item.snippet.match(/([0-9,]+)\s*reviews/i) ||
                         item.snippet.match(/\(([0-9,]+)\)/);
          if (countMatch) ratingCount = parseInt(countMatch[1].replace(/,/g, ''));
        }

        results.push({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          rating: rating || 0,
          ratingCount: ratingCount || 0,
          source: domainMatch.name,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Serper API call failed:', error);
    return [];
  }
}
