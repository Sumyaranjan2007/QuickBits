'use client';
import React, { useState, useEffect } from 'react';
import { adminApi } from '@quickbite/api-client';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getCustomers()
      .then(r => { const d = r.data as any; setCustomers(d.items || d || []); })
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th></tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--primary)' }}>
                      {(c.profile?.firstName || c.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {c.profile ? `${c.profile.firstName} ${c.profile.lastName || ''}` : c.email?.split('@')[0]}
                    </div>
                  </div>
                </td>
                <td className="text-sm">{c.email}</td>
                <td className="text-sm">{c.phone || '—'}</td>
                <td className="text-sm text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>{c.isActive ? 'Active' : 'Blocked'}</span></td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No customers yet</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
