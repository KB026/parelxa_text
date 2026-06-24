import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail, sendSubmissionConfirmation, sendListingStatusUpdate, sendReviewAlert, sendReplyAlert, sendVerificationUpdate, sendFeaturedAlert } from '@/lib/email/actions';

export const dynamic = 'force-dynamic';

export default async function CommunicationsPage({ searchParams }: { searchParams: { message?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  async function triggerTest(formData: FormData) {
    'use server';
    const type = formData.get('type') as string;
    const email = formData.get('email') as string;
    const name = "Admin User";
    
    let result;
    try {
      switch (type) {
        case 'welcome_user': result = await sendWelcomeEmail(email, name, 'user'); break;
        case 'welcome_vendor': result = await sendWelcomeEmail(email, name, 'vendor'); break;
        case 'otp': result = await sendOTPEmail(email, '558899'); break;
        case 'reset': result = await sendPasswordResetEmail(email, 'https://parlexa.in/reset-password?token=123'); break;
        case 'submitted': result = await sendSubmissionConfirmation(email, 'Sample AI Agent'); break;
        case 'approved': result = await sendListingStatusUpdate(email, 'Sample AI Agent', 'approved', { liveUrl: 'https://parlexa.in/products/sample-ai' }); break;
        case 'rejected': result = await sendListingStatusUpdate(email, 'Sample AI Agent', 'rejected', { reason: 'Missing screenshots and landing page url.' }); break;
        case 'review': result = await sendReviewAlert(email, 'Sample AI Agent', 5, 'Jane Doe'); break;
        case 'reply': result = await sendReplyAlert(email, 'Sample AI Agent'); break;
        case 'verified': result = await sendVerificationUpdate(email, 'Sample AI Agent', true); break;
        case 'featured_active': result = await sendFeaturedAlert(email, 'Sample AI Agent', false); break;
        case 'featured_expiring': result = await sendFeaturedAlert(email, 'Sample AI Agent', true); break;
        default: throw new Error('Unknown template');
      }

      if (result.success) {
        return { success: true, message: `Successfully sent ${type} email to ${email}` };
      } else {
        return { success: false, message: `Failed: ${result.error}` };
      }
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  const emailTypes = [
    { id: 'welcome_user', label: 'Welcome (User)', group: 'Transactional' },
    { id: 'welcome_vendor', label: 'Welcome (Vendor)', group: 'Transactional' },
    { id: 'otp', label: 'OTP Code', group: 'Transactional' },
    { id: 'reset', label: 'Password Reset', group: 'Transactional' },
    { id: 'submitted', label: 'Listing Submitted', group: 'Lister' },
    { id: 'approved', label: 'Listing Approved', group: 'Lister' },
    { id: 'rejected', label: 'Listing Rejected', group: 'Lister' },
    { id: 'review', label: 'New Review Alert', group: 'Lister' },
    { id: 'reply', label: 'Review Reply Alert', group: 'Consumer' },
    { id: 'verified', label: 'Verification Approved', group: 'Lister' },
    { id: 'featured_active', label: 'Featured Activated', group: 'Lister' },
    { id: 'featured_expiring', label: 'Featured Expiring', group: 'Lister' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>Communications Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Test and manually trigger email templates to users.</p>
      </header>

      {searchParams.message && (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(56,189,248,0.1)', color: 'var(--cyan)', marginBottom: '24px', border: '1px solid rgba(56,189,248,0.2)' }}>
          {searchParams.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {emailTypes.map((type) => (
          <div key={type.id} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', marginBottom: '8px', display: 'inline-block' }}>
                {type.group}
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>{type.label}</h3>
            </div>
            
            <form action={async (fd) => {
              'use server';
              await triggerTest(fd);
              // Handle response? Or redirect with message
            }} style={{ display: 'flex', gap: '8px' }}>
              <input type="hidden" name="type" value={type.id} />
              <input 
                name="email" 
                defaultValue={user?.email || ''} 
                placeholder="Target email..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '14px' }} 
              />
              <button className="btn-primary" style={{ padding: '10px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                Send Test
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
