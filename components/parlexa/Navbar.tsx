import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { NavbarClient } from './NavbarClient';
import { ListingLink } from './ListingLink';
import { UserProfile } from '@/lib/types';
import { CategoriesDropdown } from './CategoriesDropdown';
import { NavbarScrollWrapper } from './NavbarScrollWrapper';

export async function Navbar() {
  let userData: UserProfile | null = null;
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('missing')) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        userData = {
          id: data.user.id,
          email: data.user.email || '',
          role: profile?.role || data.user.user_metadata?.role,
          initial: (data.user.email?.[0] || 'U').toUpperCase(),
        };
      }
    }
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error('Navbar: Could not fetch user:', err);
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-white/[0.08]">
      {/* Left (Logo) */}
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
        <Image src="/logo.png" alt="Parlexa Logo" width={220} height={44} className="object-contain w-[140px] md:w-[180px] lg:w-[220px] h-auto" priority />
      </Link>
      
      {/* Center (Nav Links) */}
      <div className="hidden md:flex items-center gap-6 text-sm text-[#A1A1AA]">
        <Link href="/products" className="hover:text-[#EDEDED] transition-colors duration-200">All Agents</Link>
        <div className="hover:text-[#EDEDED] transition-colors duration-200 [&_button]:text-[#A1A1AA] [&_button]:hover:text-[#EDEDED] [&_button]:font-medium [&_button]:transition-colors [&_button]:duration-200">
          <CategoriesDropdown />
        </div>
        <Link href="/ai-finder" className="hover:text-[#EDEDED] transition-colors duration-200 flex items-center gap-1.5">
          ✨ AI Finder
        </Link>
        <ListingLink 
          user={userData} 
          className="hover:text-[#EDEDED] transition-colors duration-200"
        >
          List your tool
        </ListingLink>
      </div>

      {/* Right (CTAs) */}
      <div className="flex items-center gap-4">
        <NavbarClient user={userData} />
      </div>
    </header>
  );
}
