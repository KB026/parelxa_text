export default function AdminVendors() {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Manage Vendors</h1>
        <div className="search-bar-large" style={{ margin: 0, width: '300px', background: 'var(--bg-card)' }}>
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search vendors by name..." style={{ fontSize: '14px', padding: '10px 0' }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Vendor Name</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Primary Category</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Listings</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Krutrim Labs', category: 'AI & LLMs', listings: 3, status: 'Approved', statusColor: '#34d399', statusBg: '#064e3b' },
              { id: 2, name: 'Sarvam AI tech', category: 'Customer Experience', listings: 1, status: 'Approved', statusColor: '#34d399', statusBg: '#064e3b' },
              { id: 3, name: 'DataMind Solutions', category: 'FinTech', listings: 0, status: 'Pending Review', statusColor: '#fbbf24', statusBg: '#713f12' },
              { id: 4, name: 'Shady AI Corp', category: 'Marketing & Sales', listings: 12, status: 'Suspended', statusColor: '#ef4444', statusBg: '#7f1d1d' },
            ].map(vendor => (
              <tr key={vendor.id}>
                <td style={{ padding: '16px 0', fontWeight: 600 }}>{vendor.name}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-dim)' }}>{vendor.category}</td>
                <td style={{ padding: '16px 0' }}>{vendor.listings}</td>
                <td style={{ padding: '16px 0' }}><span className="cat-pill" style={{ background: vendor.statusBg, color: vendor.statusColor }}>{vendor.status}</span></td>
                <td style={{ padding: '16px 0' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', marginRight: '12px' }}>Review</button>
                  {vendor.status === 'Suspended' ? (
                    <button style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer' }}>Reactivate</button>
                  ) : (
                    <button style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>Suspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
