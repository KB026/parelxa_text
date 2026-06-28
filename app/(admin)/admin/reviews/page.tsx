/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

type PendingAgent = {
  id: number;
  name: string;
  category: string;
  website: string;
};

export default async function ListingReviews() {
  const supabase = createClient();

  // Fetch pending listings
  const { data: pendingData } = await supabase
    .from('agents')
    .select('*')
    .eq('approval_status', 'pending')
    .order('id', { ascending: false });

  const pendingQueue: PendingAgent[] = Array.isArray(pendingData)
    ? (pendingData as PendingAgent[])
    : [];

  async function approveListing(formData: FormData) {
    'use server';

    const id = Number(formData.get('id'));
    const supabase = createClient();

    const { error } = await supabase
      .from('agents')
      .update({ approval_status: 'approved' })
      .eq('id', id);

    if (error) {
      console.error('Approval failed:', error);
    }

    revalidatePath('/admin/reviews');
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/products');
  }

  async function flagListing(formData: FormData) {
    'use server';

    const id = Number(formData.get('id'));
    const supabase = createClient();

    const { error } = await supabase
      .from('agents')
      .update({ approval_status: 'flagged' })
      .eq('id', id);

    if (error) {
      console.error('Flagging failed:', error);
    }

    revalidatePath('/admin/reviews');
    revalidatePath('/admin');
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <h1
          className="page-title"
          style={{ fontSize: '28px', marginBottom: '8px' }}
        >
          Listing Review Queue
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Review and approve pending AI tool submissions.
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        {pendingQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸŽ‰</div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-white)',
                marginBottom: '8px',
              }}
            >
              All caught up!
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              No listings are currently pending review.
            </p>
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              textAlign: 'left',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Agent Name
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Website
                </th>
                <th
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pendingQueue.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      padding: '16px 0',
                      fontWeight: 600,
                      color: 'var(--text-white)',
                    }}
                  >
                    {item.name}
                  </td>

                  <td
                    style={{
                      padding: '16px 0',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {item.category}
                  </td>

                  <td
                    style={{
                      padding: '16px 0',
                      color: 'var(--cyan)',
                    }}
                  >
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--cyan)' }}
                    >
                      Visit Site
                    </a>
                  </td>

                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <form action={approveListing}>
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#059669',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Approve
                        </button>
                      </form>

                      <form action={flagListing}>
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Flag
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
