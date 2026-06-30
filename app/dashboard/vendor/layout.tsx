import { Navbar } from "@/components/parlexa/Navbar";
import { Footer } from "@/components/parlexa/Footer";

export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VendorSidebar } from "@/components/parlexa/dashboard/VendorSidebar";

export default async function VendorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'vendor') {
    redirect('/login?message=Unauthorized access to vendor portal');
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '60px', padding: '80px 40px 100px' }}>
          <VendorSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
