import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { NavbarClient } from './NavbarClient';
import { ListingLink } from './ListingLink';
import { UserProfile } from '@/lib/types';

export async function Navbar() {
  let userData: UserProfile | null = null;
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('missing')) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        userData = {
          id: data.user.id,
          email: data.user.email || '',
          role: data.user.user_metadata?.role,
          initial: (data.user.email?.[0] || 'U').toUpperCase(),
        };
      }
    }
  } catch (err) {
    console.error('Navbar: Could not fetch user:', err);
  }

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <img src="/logo.png" alt="Parlexa Logo" style={{ width: '220px', height: 'auto', objectFit: 'contain' }} />
      </Link>
      
      <div className="nav-links">
        <Link href="/products" className="nav-link">All Agents</Link>
        
        <div className="nav-categories">
          <button className="nav-link">Categories <span style={{fontSize:'8px'}}>â–¼</span></button>
          <div className="categories-dropdown">
            <Link href="/products?cats=AI+%26+LLMs" className="dropdown-item"><span>ðŸ¤–</span> AI &amp; LLMs</Link>
            <Link href="/products?cats=Customer+Experience" className="dropdown-item"><span>ðŸ’¬</span> Customer Experience</Link>
            <Link href="/products?cats=Marketing+%26+Sales" className="dropdown-item"><span>ðŸ“£</span> Marketing &amp; Sales</Link>
            <Link href="/products?cats=Enterprise+%26+Automation" className="dropdown-item"><span>âš™ï¸</span> Enterprise &amp; Automation</Link>
            <Link href="/products" className="dropdown-item" style={{justifyContent: 'center', color: 'var(--cyan)'}}>View All Categories â†’</Link>
          </div>
        </div>

        <Link href="/ai-finder" className="nav-link">
          AI Finder <span className="nav-badge">NEW</span>
        </Link>
        <ListingLink 
          user={userData} 
          className="nav-link" 
          style={{ color: 'var(--cyan)', fontWeight: 600 }}
        >
          List your tool
        </ListingLink>
      </div>

      <div className="nav-right">
        <NavbarClient user={userData} />
      </div>
    </nav>
  );
}
