import { Navbar } from "@/components/parlexa/Navbar";
import { Footer } from "@/components/parlexa/Footer";

export const dynamic = 'force-dynamic';
import { DashboardSidebar } from "@/components/parlexa/dashboard/DashboardSidebar";

export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '90vh', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '60px', padding: '80px 40px 100px' }}>
          <DashboardSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
