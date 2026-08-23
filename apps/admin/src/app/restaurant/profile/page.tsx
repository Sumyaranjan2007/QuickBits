'use client';
import React, { useState, useEffect } from 'react';
import { restaurantsApi } from '@quickbite/api-client';

const CUISINE_OPTIONS = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Mughlai', 'Thai', 'Mexican', 'Fast Food', 'Bakery', 'Desserts', 'Beverages'];
const FOOD_TYPE_OPTIONS = ['VEG', 'NON_VEG', 'BOTH'];

export default function RestaurantProfilePage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'business'>('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await restaurantsApi.list();
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          const r2 = await restaurantsApi.getById(list[0].id);
          const rest = r2.data as any;
          setRestaurant(rest);
          setForm({
            name: rest.name || '',
            description: rest.description || 'A premium dining experience delivering authentic flavors right to your doorstep.',
            phone: rest.phone || '+91 98765 43210',
            email: rest.email || 'owner@quickbite.com',
            address: rest.address || '123, 5th Main, Indiranagar, Bengaluru – 560038',
            city: rest.city || 'Bengaluru',
            pinCode: rest.pinCode || '560038',
            cuisineType: rest.cuisineType || 'North Indian',
            foodType: rest.foodType || 'BOTH',
            estimatedPrepTime: rest.estimatedPrepTime || 25,
            deliveryRadius: rest.deliveryRadius || 8,
            minOrderAmount: rest.minOrderAmount || 149,
            logoUrl: rest.logoUrl || '',
            coverImageUrl: rest.coverImageUrl || '',
            gstin: rest.gstin || 'GSTIN: 29ABCDE1234F1Z5',
          });
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);


  const handleSave = async () => {
    setSaving(true);
    try {
      if (restaurant) {
        await restaurantsApi.update(restaurant.id, form);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err?.message || 'Failed to save profile');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🏪 Restaurant Profile</h1>
          <p className="page-subtitle">Manage your restaurant's public-facing information and business details</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saveSuccess && (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00B894' }}>✓ Saved successfully!</span>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: 10 }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
        {[{ key: 'basic', label: '📋 Basic Info' }, { key: 'location', label: '📍 Location & Hours' }, { key: 'business', label: '💼 Business Details' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === t.key ? 'var(--primary)' : 'transparent'}`, marginBottom: -2, transition: '0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Basic Info ─── */}
      {activeTab === 'basic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Images */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Restaurant Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Logo URL', key: 'logoUrl', placeholder: 'https://your-logo-url.com/logo.png', preview: form.logoUrl },
                { label: 'Cover Photo URL', key: 'coverImageUrl', placeholder: 'https://your-cover-url.com/cover.jpg', preview: form.coverImageUrl },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  {f.preview && (
                    <img src={f.preview} alt={f.label} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      onError={(e: any) => e.target.style.display = 'none'} />
                  )}
                  <input className="input" value={form[f.key] || ''} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>

          {/* Basic Details */}
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Restaurant Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Restaurant Name</label>
                <input className="input" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea className="input" style={{ height: 80, resize: 'none' }} value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Cuisine Type</label>
                <select className="input" value={form.cuisineType} onChange={e => setForm((p: any) => ({ ...p, cuisineType: e.target.value }))}>
                  {CUISINE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Food Type</label>
                <select className="input" value={form.foodType} onChange={e => setForm((p: any) => ({ ...p, foodType: e.target.value }))}>
                  {FOOD_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Location Tab ─── */}
      {activeTab === 'location' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Location & Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Full Address</label>
                <textarea className="input" style={{ height: 70, resize: 'none' }} value={form.address} onChange={e => setForm((p: any) => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>City</label>
                <input className="input" value={form.city} onChange={e => setForm((p: any) => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>PIN Code</label>
                <input className="input" value={form.pinCode} onChange={e => setForm((p: any) => ({ ...p, pinCode: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Delivery Radius (KM)</label>
                <input className="input" type="number" value={form.deliveryRadius} onChange={e => setForm((p: any) => ({ ...p, deliveryRadius: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Min Order Amount (₹)</label>
                <input className="input" type="number" value={form.minOrderAmount} onChange={e => setForm((p: any) => ({ ...p, minOrderAmount: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Avg Prep Time (minutes)</label>
                <input className="input" type="number" value={form.estimatedPrepTime} onChange={e => setForm((p: any) => ({ ...p, estimatedPrepTime: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Business Tab ─── */}
      {activeTab === 'business' && (
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', padding: 24 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Business & Tax Details</h3>
          <div style={{ background: '#FFF8E8', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#856404', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>🔒</span>
            <span>Changes to bank details and sensitive documents require admin re-verification. Contact support to update.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>GSTIN Number</label>
              <input className="input" value={form.gstin} onChange={e => setForm((p: any) => ({ ...p, gstin: e.target.value }))} placeholder="29ABCDE1234F1Z5" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>FSSAI License</label>
              <input className="input" value="10022021001234" disabled placeholder="FSSAI License Number" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Bank Account</label>
              <input className="input" value="XXXX XXXX 4521" disabled />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>IFSC Code</label>
              <input className="input" value="HDFC0001234" disabled />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Commission Rate</label>
              <input className="input" value="20% (Platform standard)" disabled />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>GST Rate on Orders</label>
              <input className="input" value="5% (Restaurant category)" disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
