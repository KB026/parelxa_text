import { redirect } from 'next/navigation';

export default function LoginPage({ searchParams }: { searchParams: { mode?: string; redirected?: string; next?: string } }) {
  const authMode = searchParams?.mode === 'register' ? 'register' : 'login';
  const nextPath = searchParams?.next ? `&next=${encodeURIComponent(searchParams.next)}` : '';
  
  redirect(`/?auth=${authMode}${nextPath}`);
}
