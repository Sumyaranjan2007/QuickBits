'use client';
import React, { useState } from 'react';

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState(20);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(35);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(299);
  const [platformFee, setPlatformFee] = useState(5);
  const [surgeMultiplier, setSurgeMultiplier] = useState('1.0');
  const [taxRate, setTaxRate] = useState(5);
  const [maxDeliveryRadius, setMaxDeliveryRadius] = useState(12);

  const handleSaveSettings = () => {
    alert('Platform pricing rules, commissions, and delivery engine parameters successfully updated!');
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">⚙️ Platform Pricing Engine &amp; Rules</h1>
          <p className="page-subtitle">Configure commissions, delivery fee calculations, surge multipliers, and taxes</p>
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings} style={{ borderRadius: 10 }}>
          💾 Save Platform Settings
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ─── 1. Marketplace Commission Engine ─── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 14 }}>1. Merchant Commission Rules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Default Base Commission (%)</label>
              <input
                type="number"
                className="input"
                value={commissionRate}
                onChange={e => setCommissionRate(Number(e.target.value))}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Applied to newly onboarded restaurants</span>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>GST Tax Rate on Orders (%)</label>
              <input
                type="number"
                className="input"
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Standard Indian Restaurant GST is 5%</span>
            </div>
          </div>
        </div>

        {/* ─── 2. Delivery Pricing Engine ─── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 14 }}>2. Delivery Pricing &amp; Surge Engine</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Base Delivery Fee (₹)</label>
              <input
                type="number"
                className="input"
                value={baseDeliveryFee}
                onChange={e => setBaseDeliveryFee(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Free Delivery Order Threshold (₹)</label>
              <input
                type="number"
                className="input"
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Platform Service Fee (₹)</label>
              <input
                type="number"
                className="input"
                value={platformFee}
                onChange={e => setPlatformFee(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Surge Demand Multiplier</label>
              <select
                className="input"
                value={surgeMultiplier}
                onChange={e => setSurgeMultiplier(e.target.value)}
              >
                <option value="1.0">1.0x (Normal Traffic)</option>
                <option value="1.25">1.25x (Moderate Demand)</option>
                <option value="1.5">1.5x (Peak Rush / Rain Surge)</option>
                <option value="2.0">2.0x (High Surge Emergency)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── 3. Zone & Serviceability Limits ─── */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 14 }}>3. Geofence &amp; Operational Radii</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Maximum Delivery Radius (KM)</label>
              <input
                type="number"
                className="input"
                value={maxDeliveryRadius}
                onChange={e => setMaxDeliveryRadius(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Active City / Geo Zone</label>
              <input
                type="text"
                className="input"
                defaultValue="Bengaluru Urban (Zone 1)"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
