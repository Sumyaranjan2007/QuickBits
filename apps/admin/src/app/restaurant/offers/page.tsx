'use client';
import React, { useState } from 'react';

interface Offer {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BOGO';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
}

const DEMO_OFFERS: Offer[] = [
  { id: 'o1', code: 'WELCOME50', type: 'PERCENTAGE', value: 50, minOrder: 200, maxDiscount: 100, usageLimit: 500, usedCount: 312, startDate: '2026-08-01', endDate: '2026-08-31', isActive: true, description: 'Welcome offer for new customers' },
  { id: 'o2', code: 'FLAT100', type: 'FLAT', value: 100, minOrder: 399, maxDiscount: 100, usageLimit: 200, usedCount: 89, startDate: '2026-08-15', endDate: '2026-08-30', isActive: true, description: 'Flat ₹100 off weekends' },
  { id: 'o3', code: 'FREEDEL', type: 'FLAT', value: 0, minOrder: 299, maxDiscount: 50, usageLimit: 1000, usedCount: 450, startDate: '2026-08-01', endDate: '2026-09-30', isActive: false, description: 'Free delivery above ₹299' },
];

const EMPTY_FORM = { code: '', type: 'PERCENTAGE' as const, value: 0, minOrder: 0, maxDiscount: 0, usageLimit: 100, startDate: '', endDate: '', description: '' };

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(DEMO_OFFERS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'offers' | 'coupons'>('offers');

  const generateCode = () => {
    const codes = ['SAVE', 'DEAL', 'BITE', 'FEAST', 'HAPPY'];
    const prefix = codes[Math.floor(Math.random() * codes.length)];
    const num = Math.floor(Math.random() * 90 + 10);
    setForm(p => ({ ...p, code: `${prefix}${num}` }));
  };

  const handleCreate = async () => {
    if (!form.code || !form.startDate || !form.endDate) { alert('Code, start date and end date are required'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const newOffer: Offer = {
      id: `o-${Date.now()}`,
      ...form,
      usedCount: 0,
      isActive: true,
    };
    setOffers(prev => [newOffer, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const toggleOffer = (id: string) => setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
  const deleteOffer = (id: string) => { if (confirm('Delete this offer?')) setOffers(prev => prev.filter(o => o.id !== id)); };

  const activeOffers = offers.filter(o => o.isActive);
  const totalDiscount = offers.reduce((s, o) => s + (o.usedCount * (o.type === 'PERCENTAGE' ? Math.min(o.maxDiscount, 100) : o.value)), 0);

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">🎁 Offers & Coupons</h1>
          <p className="page-subtitle">{activeOffers.length} active promotions · ₹{totalDiscount.toLocaleString()} total discount given</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ borderRadius: 10 }}>
          + Create Offer
        </button>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{activeOffers.length}</div>
          <div className="stat-label">Active Offers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔢</div>
          <div className="stat-value">{offers.reduce((s, o) => s + o.usedCount, 0)}</div>
          <div className="stat-label">Total Redemptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-value">₹{totalDiscount.toLocaleString()}</div>
          <div className="stat-label">Total Discount Given</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">+23%</div>
          <div className="stat-label">Order Lift from Offers</div>
          <div className="stat-change up">↑ Excellent ROI</div>
        </div>
      </div>

      {/* ─── Offers Table ─── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">All Promotions</span>
          <span className="badge badge-primary">{offers.length} total</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: 0.5, fontFamily: 'monospace', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 6 }}>
                      {o.code}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{o.description}</div>
                </td>
                <td style={{ fontWeight: 900, color: 'var(--primary)' }}>
                  {o.type === 'PERCENTAGE' ? `${o.value}% off` : o.type === 'FLAT' ? `₹${o.value} off` : 'Buy 1 Get 1'}
                  {o.maxDiscount > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Max ₹{o.maxDiscount}</div>}
                </td>
                <td style={{ fontWeight: 700 }}>₹{o.minOrder}</td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{o.usedCount} / {o.usageLimit}</div>
                  <div style={{ height: 4, background: '#EEE', borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 2, width: `${Math.min(100, (o.usedCount / o.usageLimit) * 100)}%` }} />
                  </div>
                </td>
                <td className="text-sm">
                  <div>{o.startDate} →</div>
                  <div>{o.endDate}</div>
                </td>
                <td>
                  <span className={`badge ${o.isActive ? 'badge-success' : 'badge-neutral'}`}>{o.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={`btn btn-sm ${o.isActive ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleOffer(o.id)} style={{ fontSize: 11 }}>
                      {o.isActive ? '⏸ Pause' : '▶ Activate'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteOffer(o.id)} style={{ fontSize: 11 }}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Create Offer Modal ─── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>🎁 Create Offer / Coupon</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Coupon Code *</label>
                  <input className="input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 800 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={generateCode} style={{ height: 42, borderRadius: 8 }}>🎲 Generate</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Discount Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="BOGO">Buy 1 Get 1</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
                    {form.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Flat Amount (₹)'}
                  </label>
                  <input className="input" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Min Order Amount (₹)</label>
                  <input className="input" type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Max Discount Cap (₹)</label>
                  <input className="input" type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Start Date *</label>
                  <input type="date" className="input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>End Date *</label>
                  <input type="date" className="input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Total Usage Limit</label>
                  <input className="input" type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Description</label>
                <input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Weekend special discount" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : '🎁 Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
