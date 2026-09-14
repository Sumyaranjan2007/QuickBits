'use client';
import React, { useState, useEffect } from 'react';
import { supabase, fetchAllRestaurantsAdmin, toggleRestaurantActiveAdmin } from '../../../lib/supabase';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [editingCommissionRest, setEditingCommissionRest] = useState<any>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(20);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const supaRests = await fetchAllRestaurantsAdmin();
        if (supaRests && supaRests.length > 0) {
          const mapped = supaRests.map((r: any) => ({
            id: r.id,
            name: r.name,
            address: r.address || r.locality || 'Bengaluru',
            phone: '+91 98765 43210',
            cuisineType: r.cuisine_type || 'Multi-Cuisine',
            rating: Number(r.rating) || 4.5,
            ratingCount: r.rating_count || '100+',
            commissionRate: 18,
            approvalStatus: r.is_active ? 'APPROVED' : 'PENDING',
            owner: {
              profile: { firstName: r.name.split(' ')[0], lastName: 'Partner' },
              email: `partner@${r.id}.com`,
            },
          }));
          setRestaurants(mapped);
        }
      } catch (e) {
        console.warn('Supabase admin restaurants error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const handleUpdateApproval = async (id: string, status: string) => {
    try {
      await toggleRestaurantActiveAdmin(id, status === 'APPROVED');
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, approvalStatus: status } : r));
      alert(`Restaurant status updated to ${status}`);
    } catch (err: any) {
      alert(err?.message || 'Error updating restaurant approval');
    }
  };

  const handleSaveCommission = async () => {
    if (!editingCommissionRest) return;
    setRestaurants(prev => prev.map(r => r.id === editingCommissionRest.id ? { ...r, commissionRate: newCommissionRate } : r));
    const targetName = editingCommissionRest.name;
    setEditingCommissionRest(null);
    alert(`Commission rate set to ${newCommissionRate}% for ${targetName}`);
  };

  const filtered = restaurants.filter(r => {
    if (activeFilter === 'APPROVED') return r.approvalStatus === 'APPROVED';
    if (activeFilter === 'PENDING') return r.approvalStatus === 'PENDING';
    if (activeFilter === 'SUSPENDED') return r.approvalStatus === 'SUSPENDED';
    return true;
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🍽️ Restaurant Merchant Management</h1>
          <p className="page-subtitle">{restaurants.length} registered merchant partners in marketplace</p>
        </div>
      </div>

      {/* ─── Status Filter Pills ─── */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24 }}>
        {['ALL', 'APPROVED', 'PENDING', 'SUSPENDED'].map(f => (
          <button
            key={f}
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f === 'ALL' ? `All (${restaurants.length})` : f}
          </button>
        ))}
      </div>

      {/* ─── Restaurants Table ─── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Owner &amp; Contact</th>
              <th>Cuisine &amp; Rating</th>
              <th>Commission Rate</th>
              <th>Approval Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{r.name}</div>
                  <div className="text-sm text-muted">{r.address || 'Bengaluru'}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.owner?.profile?.firstName || r.owner?.email?.split('@')[0] || 'Vikram Singhania'}</div>
                  <div className="text-sm text-muted">{r.phone || r.owner?.email || 'owner@quickbite.com'}</div>
                </td>
                <td>
                  <div>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{r.cuisineType || 'Burgers'}</span>
                  </div>
                  <div className="rating" style={{ marginTop: 4 }}>
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{r.rating || '4.8'}</span>
                    <span className="rating-count">({r.totalRatings || 120})</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 900, color: '#00B894', fontSize: 15 }}>{r.commissionRate || 20}%</span>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setEditingCommissionRest(r);
                        setNewCommissionRate(r.commissionRate || 20);
                      }}
                      style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4 }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    r.approvalStatus === 'APPROVED' ? 'badge-success' :
                    r.approvalStatus === 'PENDING' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {r.approvalStatus}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.approvalStatus !== 'APPROVED' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateApproval(r.id, 'APPROVED')}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6 }}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {r.approvalStatus !== 'SUSPENDED' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUpdateApproval(r.id, 'SUSPENDED')}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6 }}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🍽️</div>
                    <div className="empty-state-title">No restaurants in this category</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Commission Edit Modal ─── */}
      {editingCommissionRest && (
        <div className="modal-backdrop" onClick={() => setEditingCommissionRest(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Adjust Commission Rate</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>{editingCommissionRest.name}</p>
              </div>
              <button onClick={() => setEditingCommissionRest(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>
                Platform Commission Percentage (%)
              </label>
              <input
                type="number"
                className="input"
                value={newCommissionRate}
                onChange={e => setNewCommissionRate(Number(e.target.value))}
                min={0}
                max={50}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Typical food marketplace commission: 15% - 25%</span>
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={handleSaveCommission}
            >
              Update Commission Rate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
