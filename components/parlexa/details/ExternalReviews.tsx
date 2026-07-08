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
    <section className="relative">
      {/* Decorative ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-white)', letterSpacing: '-0.02em' }}>
          Market Proof Around the Web
        </h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.5 }}>
          What enterprise buyers and makers are saying about <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{agentName}</span> on other platforms.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        {reviews.map((review) => {
          const brandColor = sourceColors[review.source] || 'var(--cyan)';
          return (
            <a 
              key={review.id} 
              href={review.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-review-card group"
              style={{
                background: 'rgba(20, 20, 22, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '28px',
                textDecoration: 'none',
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top accent line that expands on hover */}
              <div 
                className="absolute top-0 left-0 h-[2px] bg-gradient-to-r transition-all duration-500 opacity-50 group-hover:opacity-100 group-hover:w-full"
                style={{ 
                  width: '40px',
                  backgroundImage: `linear-gradient(90deg, ${brandColor}, transparent)` 
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `color-mix(in srgb, ${brandColor} 15%, transparent)`,
                      color: brandColor
                    }}
                  >
                    {sourceIcons[review.source] || <Globe className="w-5 h-5" />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'white', letterSpacing: '-0.01em' }}>{review.source}</span>
                </div>
                {review.rating > 0 && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    color: '#fbbf24', fontSize: '15px', fontWeight: 800,
                    background: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '20px'
                  }}>
                    <Star className="w-4 h-4 fill-current" /> {review.rating ? review.rating.toFixed(1) : '0.0'}
                  </div>
                )}
              </div>

              <p style={{ 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.8)', 
                lineHeight: 1.65, 
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontWeight: 400
              }}>
                &quot;{review.snippet.replace(/Rating: [0-9.]+ · [0-9,]+ reviews/i, '').trim()}&quot;
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {review.reviews_count > 0 ? `${review.reviews_count.toLocaleString()} Reviews` : 'Verified Source'}
                </span>
                <span className="read-more-btn" style={{ 
                  color: 'var(--text-white)', fontSize: '13px', fontWeight: 600, 
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'color 0.3s ease'
                }}>
                  Read More 
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .external-review-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0, 255, 255, 0.05);
          background: rgba(30, 30, 32, 0.7) !important;
        }
        .external-review-card:hover .read-more-btn {
          color: var(--cyan) !important;
        }
      `}} />
    </section>
  );
}
