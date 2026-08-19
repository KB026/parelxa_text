'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Shield, Star, Settings, LayoutDashboard, MessageSquare, CreditCard } from 'lucide-react';

export function VendorSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard/vendor', icon: <LayoutDashboard size={18} /> },
    { label: 'My Listing', href: '/dashboard/vendor/listings', icon: <FileText size={18} /> },
    { label: 'Customer Reviews', href: '/dashboard/vendor/reviews', icon: <Star size={18} /> },
    { label: 'Deep Analytics', href: '/dashboard/vendor/analytics', icon: <FileText size={18} /> },
    { label: 'Verification', href: '/dashboard/vendor/verification', icon: <Shield size={18} /> },
    { label: 'Resolution Center', href: '/dashboard/vendor/resolution', icon: <MessageSquare size={18} /> },
    { label: 'Billing & Plan', href: '/dashboard/vendor/billing', icon: <CreditCard size={18} /> },
    { label: 'Settings', href: '/dashboard/vendor/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-32 flex flex-col gap-2">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">
          Vendor Dashboard
        </h2>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard/vendor/listings' && pathname.startsWith('/dashboard/vendor/listings'));
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-6 pt-6 border-t border-slate-800/50 flex flex-col gap-1">
          <Link 
            href="/dashboard/consumer/saved-tools"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-sm font-medium group"
          >
            <span className="text-slate-600 group-hover:text-slate-400 transition-colors">🔖</span> Saved Tools
          </Link>
          <Link 
            href="/dashboard/consumer/reviews"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-sm font-medium group"
          >
            <span className="text-slate-600 group-hover:text-slate-400 transition-colors">⭐</span> My Reviews
          </Link>
        </div>
      </div>
    </aside>
  );
}
