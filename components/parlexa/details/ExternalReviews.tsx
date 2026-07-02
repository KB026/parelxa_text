import { ExternalReview } from '@/lib/api/externalReviews';
import { Trophy, Cat, Star, Shield, TrendingUp, Laptop, Pizza, Globe, ArrowRight } from 'lucide-react';
interface ExternalReviewsProps {
  reviews: ExternalReview[];
  agentName: string;
}

export function ExternalReviews({ reviews, agentName }: ExternalReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  const sourceIcons: Record<string, React.ReactNode> = {
    'G2': <Trophy className="w-5 h-5" />,
    'Product Hunt': <Cat className="w-5 h-5" />,
    'Trustpilot': <Star className="w-5 h-5" />,
    'Capterra': <Shield className="w-5 h-5" />,
    'Gartner': <TrendingUp className="w-5 h-5" />,
    'SourceForge': <Laptop className="w-5 h-5" />,
    'AppSumo': <Pizza className="w-5 h-5" />,
  };

  const sourceColors: Record<string, string> = {
    'G2': '#ff492c',
    'Product Hunt': '#da552f',
    'Trustpilot': '#00b67a',
    'Capterra': '#0065ff',
    'Gartner': '#002856',
    'SourceForge': '#ff6600',
    'AppSumo': '#ffcc00',
  };

  return (
    <section style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Market Proof Around the Web</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>What enterprise buyers and makers are saying about {agentName} on other platforms.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {reviews.map((review) => (
          <a 
            key={review.id} 
            href={review.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '20px', 
              padding: '24px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="external-review-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sourceIcons[review.source] || <Globe className="w-5 h-5" />}</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{review.source}</span>
              </div>
              {review.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '14px', fontWeight: 700 }}>
                  <Star className="w-3.5 h-3.5 fill-current" /> {review.rating ? review.rating.toFixed(1) : '0.0'}
                </div>
              )}
            </div>

            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-white)', 
              lineHeight: 1.6, 
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              &quot;{review.snippet.replace(/Rating: [0-9.]+ · [0-9,]+ reviews/i, '').trim()}&quot;
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                {review.reviews_count > 0 ? `${review.reviews_count.toLocaleString()} Reviews` : 'Verified Source'}
              </span>
              <span style={{ color: 'var(--cyan)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>Read More <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
              .external-review-card:hover {
                transform: translateY(-8px);
                border-color: ${sourceColors[review.source] || 'var(--cyan)'};
                box-shadow: 0 12px 30px rgba(0,0,0,0.4);
              }
            `}} />
          </a>
        ))}
      </div>
    </section>
  );
}
