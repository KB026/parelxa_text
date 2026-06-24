import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
type Transaction = {
  id: string;
  user_id: string;
  agent_id: string | null;
  amount: number | string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway: string | null;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
  agents?: {
    name?: string;
    slug?: string;
  } | null;
};
export const dynamic = 'force-dynamic';

type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

async function updateTransactionStatus(formData: FormData) {
  'use server';

  const transactionId = formData.get('transactionId') as string;
  const status = formData.get('status') as TransactionStatus;

  if (!transactionId || !status) {
    return;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await supabase
    .from('transactions')
    .update({ status })
    .eq('id', transactionId);

  revalidatePath('/admin/transactions');
  revalidatePath('/admin/promotions');
  revalidatePath('/admin/reports');
}

export default async function AdminTransactions({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page || '1'));
  const pageSize = 20;
  const status = (searchParams.status || 'all') as TransactionStatus | 'all';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('transactions')
    .select('id, user_id, agent_id, amount, currency, status, gateway, gateway_order_id, gateway_payment_id, created_at, profiles(full_name, email), agents(name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

const {
  data: transactions,
  count,
  error,
} = (await query) as {
  data: Transaction[] | null;
  count: number | null;
  error: Error | null;
};

  if (error) {
    return (
      <section>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Transactions</h1>
        <p style={{ color: '#f87171' }}>Failed to load transactions: {error.message}</p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize));

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor payments, adjust statuses, and reconcile marketplace revenue.</p>
        </div>

        <form>
          <select
            name="status"
            defaultValue={status}
            onChange={(event) => event.currentTarget.form?.submit()}
            style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--border-subtle)' }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </form>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Transaction</th>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Agent</th>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '18px 20px', color: 'var(--text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(transactions || []).map((transaction) => {
              const profile = transaction.profiles as unknown as { full_name?: string; email?: string } | null;
              const agent = transaction.agents as unknown as { name?: string; slug?: string } | null;

              return (
                <tr key={transaction.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ fontWeight: 700, color: 'white' }}>#{transaction.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(transaction.created_at).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ fontWeight: 600, color: 'white' }}>{profile?.full_name || 'Unknown user'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--cyan)' }}>{profile?.email || transaction.user_id}</div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    {agent?.slug ? (
                      <Link href={`/products/${agent.slug}`} style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
                        {agent.name || `Agent #${transaction.agent_id}`}
                      </Link>
                    ) : (
                      <span style={{ color: 'white' }}>{agent?.name || `Agent #${transaction.agent_id || 'â€”'}`}</span>
                    )}
                  </td>
                  <td style={{ padding: '18px 20px', color: 'white', fontWeight: 700 }}>
                    {transaction.currency} {Number(transaction.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800,
                      background: transaction.status === 'completed' ? 'rgba(16,185,129,0.1)' : transaction.status === 'failed' ? 'rgba(239,68,68,0.1)' : transaction.status === 'refunded' ? 'rgba(251,191,36,0.1)' : 'rgba(148,163,184,0.1)',
                      color: transaction.status === 'completed' ? '#10b981' : transaction.status === 'failed' ? '#f87171' : transaction.status === 'refunded' ? '#fbbf24' : '#94a3b8'
                    }}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <form action={updateTransactionStatus}>
                        <input type="hidden" name="transactionId" value={transaction.id} />
                        <input type="hidden" name="status" value={transaction.status === 'completed' ? 'refunded' : 'completed'} />
                        <button
                          type="submit"
                          style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--cyan)', border: '1px solid rgba(56,189,248,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          {transaction.status === 'completed' ? 'Refund' : 'Mark Complete'}
                        </button>
                      </form>
                      <form action={updateTransactionStatus}>
                        <input type="hidden" name="transactionId" value={transaction.id} />
                        <input type="hidden" name="status" value="failed" />
                        <button
                          type="submit"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Mark Failed
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', color: 'var(--text-dim)' }}>
        <span>Page {page} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href={`/admin/transactions?page=${Math.max(1, page - 1)}${status !== 'all' ? `&status=${status}` : ''}`}
            style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', textDecoration: 'none' }}
          >
            Previous
          </Link>
          <Link
            href={`/admin/transactions?page=${Math.min(totalPages, page + 1)}${status !== 'all' ? `&status=${status}` : ''}`}
            style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', textDecoration: 'none' }}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
