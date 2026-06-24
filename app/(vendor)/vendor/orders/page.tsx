export default function VendorOrders() {
  return (
    <section>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>All Orders</h1>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Order ID</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Date</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Customer</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Product</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Amount</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: '#ORD-902', date: '2026-04-05', customer: 'Acme Corp', product: 'Enterprise API', amount: 'â‚¹120,000', status: 'Completed', statusColor: '#34d399', statusBg: '#064e3b' },
              { id: '#ORD-901', date: '2026-04-03', customer: 'TechFlow India', product: 'Chatbot Pro Module', amount: 'â‚¹25,000', status: 'Pending', statusColor: '#fbbf24', statusBg: '#713f12' },
            ].map(order => (
              <tr key={order.id}>
                <td style={{ padding: '16px 0', color: 'var(--cyan)' }}>{order.id}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-dim)' }}>{order.date}</td>
                <td style={{ padding: '16px 0' }}>{order.customer}</td>
                <td style={{ padding: '16px 0' }}>{order.product}</td>
                <td style={{ padding: '16px 0', fontWeight: 600 }}>{order.amount}</td>
                <td style={{ padding: '16px 0' }}><span className="cat-pill" style={{ background: order.statusBg, color: order.statusColor }}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
