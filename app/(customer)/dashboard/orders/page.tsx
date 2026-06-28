export default function CustomerOrders() {
  return (
    <section>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>My Orders</h1>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Order ID</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Date</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Agent</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Amount</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#ORD-1152', date: '2026-04-01', agent: 'Krutrim', amount: '₹0 (Free tier)', status: 'Active', statusColor: '#34d399', statusBg: '#064e3b' },
              { id: '#ORD-1108', date: '2026-03-15', agent: 'Sarvam AI', amount: '₹10,000/mo', status: 'Active', statusColor: '#34d399', statusBg: '#064e3b' },
            ].map(order => (
              <tr key={order.id}>
                <td style={{ padding: '16px 0', color: 'var(--cyan)' }}>{order.id}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-dim)' }}>{order.date}</td>
                <td style={{ padding: '16px 0', fontWeight: 600 }}>{order.agent}</td>
                <td style={{ padding: '16px 0' }}>{order.amount}</td>
                <td style={{ padding: '16px 0' }}><span className="cat-pill" style={{ background: order.statusBg, color: order.statusColor }}>{order.status}</span></td>
                <td style={{ padding: '16px 0' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}>View Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
