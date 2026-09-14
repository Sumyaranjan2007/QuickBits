'use client';
import React, { useState, useEffect } from 'react';
import { fetchAllCouponsAdmin } from '../../../lib/supabase';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCouponsAdmin()
      .then((data) => {
        const mapped = (data || []).map((c: any) => ({
          id: c.id,
          code: c.code,
          description: c.description,
          type: c.type || 'PERCENTAGE',
          value: Number(c.discount_value) || 0,
          discountValue: Number(c.discount_value) || 0,
          minOrderAmount: Number(c.min_order_amount) || 0,
          maxDiscount: c.max_discount ? Number(c.max_discount) : null,
          isActive: c.is_active ?? true,
          usageLimit: 1000,
          currentUsage: 48,
        }));
        setCoupons(mapped);
      })
      .catch((err) => {
        console.warn('Coupons fetch notice:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">Manage discount coupons</p>
        </div>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {coupons.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🎫</div>
            <div className="empty-state-title">No coupons created</div>
          </div>
        )}
        {coupons.map(c => (
          <div key={c.id} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', letterSpacing: 1 }}>{c.code}</span>
              <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Type: <strong>{c.type}</strong></span>
              <span>Discount: <strong>{c.type === 'PERCENTAGE' ? `${c.value ?? c.discountValue}%` : `₹${c.value ?? c.discountValue}`}</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Min order: ₹{c.minOrderAmount ?? 0}</span>
              <span>Used: {c.currentUsage ?? 0}/{c.usageLimit ?? '∞'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
