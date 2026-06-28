import Link from 'next/link';
import Image from 'next/image';
import { getCategories } from '@/lib/api';
import { Category } from '@/lib/types';

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="bg-[#0d1524] border-t border-white/5 pt-20 px-10 pb-10 mt-16">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(300px,2fr)_1fr_1fr] gap-14 mb-14">
        <div>
          <div className="flex items-center gap-2.5 shrink-0 mb-5">
            <Image src="/logo.png" alt="Parlexa Logo" width={200} height={54} className="h-[54px] w-auto object-contain" />
          </div>
          <p className="text-slate-400 text-[15px] leading-relaxed mb-6 max-w-[380px]">
            The global premier marketplace for AI agents and tools. Discover, compare, and integrate powerful AI solutions built to scale enterprises worldwide.
          </p>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1a2540] flex items-center justify-center text-slate-100 cursor-pointer hover:bg-white/10 transition-colors">X</div>
            <div className="w-9 h-9 rounded-full bg-[#1a2540] flex items-center justify-center text-slate-100 cursor-pointer hover:bg-white/10 transition-colors">in</div>
            <div className="w-9 h-9 rounded-full bg-[#1a2540] flex items-center justify-center text-slate-100 cursor-pointer hover:bg-white/10 transition-colors">✉</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold text-slate-100 mb-1">Categories</h4>
          <ul className="list-none flex flex-col gap-3 p-0 m-0">
            {categories.slice(0, 6).map((c: Category) => (
              <li key={c.name}><Link href={`/products?category=${encodeURIComponent(c.name)}`} className="text-slate-400 text-sm hover:text-slate-200 transition-colors">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-base font-semibold text-slate-100 mb-1">Resources</h4>
          <ul className="list-none flex flex-col gap-3 p-0 m-0">
            <li><Link href="/products" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">All AI Agents</Link></li>
            <li><Link href="/vendor/listings/new" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">List your tool</Link></li>
            <li><Link href="/compare" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">Compare Agents</Link></li>
            <li><Link href="/products" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">Search Marketplace</Link></li>
            <li><Link href="/about" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-slate-400 text-sm hover:text-slate-200 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-[1320px] mx-auto pt-8 border-t border-white/5 flex justify-between items-center text-slate-500 text-sm flex-wrap gap-4">
        <p className="m-0">A Global Ecosystem for AI</p>
        <p className="m-0">Â© 2026 Parlexa. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-slate-300 transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-slate-300 transition-colors">Terms</span>
        </div>
      </div>
    </footer>
  );
}
