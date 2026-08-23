'use client';
import React, { useState, useEffect } from 'react';
import { adminApi } from '@quickbite/api-client';

export default function AdminDelivery() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDeliveryPartners()
      .then(r => { const d = r.data as any; setPartners(d.items || d || []); })
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Partners</h1>
          <p className="page-subtitle">{partners.length} partners registered</p>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Partner</th><th>Vehicle</th><th>Rating</th><th>Deliveries</th><th>Status</th><th>Online</th></tr>
          </thead>
          <tbody>
            {partners.map((p: any) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.user?.profile?.firstName || p.user?.email?.split('@')[0] || '—'} {p.user?.profile?.lastName || ''}</div>
                  <div className="text-sm text-muted">{p.user?.phone || '—'}</div>
                </td>
                <td>
                  <span className="badge badge-neutral">{p.vehicleType || '—'}</span>
                  <div className="text-sm text-muted" style={{ marginTop: 4 }}>{p.vehicleNumber || '—'}</div>
                </td>
                <td>
                  <div className="rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{p.rating || '—'}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>{p.totalDeliveries || 0}</td>
                <td><span className={`badge ${p.approvalStatus === 'APPROVED' ? 'badge-success' : p.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-error'}`}>{p.approvalStatus}</span></td>
                <td>
                  <span className={`status-dot ${p.isOnline ? 'online' : 'offline'}`}></span>
                  {p.isOnline ? 'Online' : 'Offline'}
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🛵</div><div className="empty-state-title">No delivery partners yet</div></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
