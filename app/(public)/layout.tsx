import { Navbar } from '@/components/parlexa/Navbar';
import { Footer } from '@/components/parlexa/Footer';

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
