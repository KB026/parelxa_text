import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { NavbarClient } from './NavbarClient';
import { ListingLink } from './ListingLink';
import { UserProfile } from '@/lib/types';
import { CategoriesDropdown } from './CategoriesDropdown';

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
  } catch (err) {
    console.error('Navbar: Could not fetch user:', err);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-[#080d1a]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-5 md:px-10 gap-4 md:gap-8">
      <Link href="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
        <Image src="/logo.png" alt="Parlexa Logo" width={220} height={44} className="w-[220px] h-auto object-contain" />
      </Link>
      
      <div className="hidden md:flex items-center gap-7 flex-1">
        <Link href="/products" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 relative">All Agents</Link>
        
        <CategoriesDropdown />

        <Link href="/ai-finder" className="text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-3 py-1.5 rounded-md transition-all shadow-lg shadow-sky-500/20 flex items-center gap-1.5">
          ✨ AI Finder
        </Link>
        <ListingLink 
          user={userData} 
          className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1.5 relative" 
        >
          List your tool
        </ListingLink>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <NavbarClient user={userData} />
      </div>
    </nav>
  );
}
