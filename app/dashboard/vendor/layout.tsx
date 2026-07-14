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

  if (!user) {
    redirect('/dashboard?message=Unauthorized access to vendor portal');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'vendor' && profile?.role !== 'admin') {
    redirect('/dashboard?message=Unauthorized access to vendor portal');
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 min-h-[90vh] bg-[#020617] text-slate-200">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-8 px-6 pb-24">
          <VendorSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
