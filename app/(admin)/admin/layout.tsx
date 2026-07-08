import Link from "next/link";
import { LayoutDashboard, Clock, ListOrdered, DollarSign, Key, Users, Shield, CheckCircle, ClipboardCheck, FileText, Settings, MessageSquare } from 'lucide-react';
import { Navbar } from "@/components/parlexa/Navbar";
import { Footer } from "@/components/parlexa/Footer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createClient();
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error('AdminLayout: Auth fetch failed', err);
    redirect('/login?message=Authentication error. Please sign in again.');
  }

  if (!user) {
    redirect('/dashboard?message=Unauthorized access to admin portal');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard?message=Unauthorized access to admin portal');
  }

  const navLinks = [
    { href: '/admin', label: 'Platform Overview', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/reviews', label: 'Review Queue', icon: <Clock size={18} />, accent: '#fbbf24' },
    { href: '/admin/listings', label: 'Manage Listings', icon: <ListOrdered size={18} /> },
    { href: '/admin/transactions', label: 'Transactions', icon: <DollarSign size={18} />, accent: '#34d399' },
    { href: '/admin/claims', label: 'Listing Claims', icon: <Key size={18} /> },
    { href: '/admin/users', label: 'User Management', icon: <Users size={18} /> },
    { href: '/admin/moderation/reviews', label: 'Review Moderation', icon: <Shield size={18} /> },
    { href: '/admin/verifications', label: 'Vendor Verifications', icon: <CheckCircle size={18} />, accent: '#60a5fa' },
    { href: '/admin/approval-queue', label: 'Agent Approvals', icon: <ClipboardCheck size={18} />, accent: '#a78bfa' },
    { href: '/admin/resolution-center', label: 'Resolution Center', icon: <MessageSquare size={18} />, accent: '#38bdf8' },
    { href: '/admin/promotions', label: 'Promotions & Revenue', icon: <DollarSign size={18} />, accent: '#fb923c' },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: <FileText size={18} /> },
    { href: '/admin/settings', label: 'Site Settings', icon: <Settings size={18} /> },
  ];

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '48px', padding: '100px 60px 80px' }}>
        <aside style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Control</h2>
          </div>
          
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              style={{ 
                padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-card)', 
                border: '1px solid var(--border-subtle)', color: 'var(--text-white)', 
                fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'all 0.2s ease',
                // Using a hover-supporting approach for CSS-in-JS or just clean styles
              }}
              className="admin-sidebar-link"
            >
              <span style={{ fontSize: '18px' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(251,146,60,0.05)', borderRadius: '20px', border: '1px solid rgba(251,146,60,0.2)' }}>
            <p style={{ fontSize: '12px', color: '#fb923c', fontWeight: 700, marginBottom: '4px' }}>Logged in as Admin</p>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{user.email}</p>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
