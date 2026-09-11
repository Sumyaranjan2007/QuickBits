'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wallet' | 'gold' | 'referral'>('profile');
  const [walletBalance, setWalletBalance] = useState(500);
  const [addAmount, setAddAmount] = useState('');

  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: '402, Skyline Residency, 100 Feet Road, Indiranagar, Bengaluru, 560038', isDefault: true },
    { id: '2', label: 'Work', address: 'Prestige Tech Park, Outer Ring Road, Bengaluru, 560103', isDefault: false },
    { id: '3', label: 'Other', address: '12th Cross, Lavelle Road, Bengaluru, 560001', isDefault: false },
  ]);

  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');

  const handleAddAddress = () => {
    if (!newAddrText.trim()) return;
    setAddresses([...addresses, { id: `addr-${Date.now()}`, label: newAddrLabel, address: newAddrText, isDefault: false }]);
    setNewAddrText('');
    alert('Address saved successfully!');
  };

  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (!amt || amt <= 0) return;
    setWalletBalance(prev => prev + amt);
    setAddAmount('');
    alert(`₹${amt} added to QuickBite Wallet!`);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* ─── Profile Header Card ─── */}
      <div style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)', borderRadius: 24, padding: 32, color: '#fff', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, boxShadow: '0 10px 25px rgba(255, 107, 53, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {(user?.profile?.firstName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>
                {user?.profile?.firstName || 'Rahul'} {user?.profile?.lastName || 'Sharma'}
              </h1>
              <span style={{ background: '#FFD93D', color: '#1A1A2E', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 8 }}>
                👑 GOLD
              </span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              📧 {user?.email || 'customer@quickbite.com'} • 📱 +91 99999 99992
            </div>
          </div>
        </div>

        <button className="btn" onClick={logout} style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: 20 }}>
          🚪 Sign Out
        </button>
      </div>

      {/* ─── Hub Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 28, scrollbarWidth: 'none' }}>
        {[
          { id: 'profile', label: '👤 Personal Info' },
          { id: 'addresses', label: '📍 Saved Addresses' },
          { id: 'wallet', label: '👛 Wallet & Credits' },
          { id: 'gold', label: '👑 Gold Membership' },
          { id: 'referral', label: '🎁 Refer & Earn' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ fontSize: 13 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 1. Personal Info ─── */}
      {activeTab === 'profile' && (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Personal Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>First Name</label>
              <input className="input" defaultValue={user?.profile?.firstName || 'Rahul'} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Last Name</label>
              <input className="input" defaultValue={user?.profile?.lastName || 'Sharma'} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input className="input" defaultValue={user?.email || 'customer@quickbite.com'} disabled />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input className="input" defaultValue="+91 99999 99992" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 24, borderRadius: 10 }} onClick={() => alert('Profile details updated!')}>
            Save Changes
          </button>
        </div>
      )}

      {/* ─── 2. Saved Addresses ─── */}
      {activeTab === 'addresses' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16, marginBottom: 28 }}>
            {addresses.map(a => (
              <div key={a.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid var(--border)', padding: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{a.label === 'Home' ? '🏠' : a.label === 'Work' ? '💼' : '📍'}</span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{a.label}</span>
                  {a.isDefault && <span className="badge badge-primary" style={{ fontSize: 9 }}>Default</span>}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.4 }}>{a.address}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => alert('Set as default')}>Set Default</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setAddresses(addresses.filter(x => x.id !== a.id))} style={{ color: '#E17055' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Address Card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Add New Delivery Address</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['Home', 'Work', 'Other'].map(l => (
                <button key={l} className={`btn btn-sm ${newAddrLabel === l ? 'btn-primary' : 'btn-outline'}`} onClick={() => setNewAddrLabel(l)}>
                  {l}
                </button>
              ))}
            </div>
            <textarea
              className="input"
              rows={2}
              placeholder="Flat/House No., Building, Street Name, Area, Pincode"
              value={newAddrText}
              onChange={e => setNewAddrText(e.target.value)}
              style={{ marginBottom: 14 }}
            />
            <button className="btn btn-primary" onClick={handleAddAddress} style={{ borderRadius: 10 }}>
              + Save Address
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. Wallet ─── */}
      {activeTab === 'wallet' && (
        <div>
          <div className="earnings-card" style={{ marginBottom: 24 }}>
            <div className="earnings-label">QuickBite Wallet Balance</div>
            <div className="earnings-value">₹{walletBalance}</div>
            <div className="earnings-sub">Use wallet credits for 1-click zero-fee checkout</div>
          </div>

          {/* Add Money Card */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Add Funds to Wallet</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                className="input"
                placeholder="Enter amount (e.g. ₹500)"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                style={{ maxWidth: 260 }}
              />
              <button className="btn btn-primary" onClick={handleAddMoney} style={{ borderRadius: 10 }}>
                + Add Money
              </button>
            </div>
          </div>

          {/* Wallet Transaction Ledger */}
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Wallet Transactions</span>
            </div>
            <table>
              <thead>
                <tr><th>Description</th><th>Date</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎁 Welcome Bonus Cashback</td>
                  <td className="text-sm text-muted">Today</td>
                  <td style={{ color: '#00B894', fontWeight: 800 }}>+ ₹200</td>
                  <td><span className="badge badge-success">Credited</span></td>
                </tr>
                <tr>
                  <td>⚡ Fast Delivery Guarantee Refund</td>
                  <td className="text-sm text-muted">2 days ago</td>
                  <td style={{ color: '#00B894', fontWeight: 800 }}>+ ₹300</td>
                  <td><span className="badge badge-success">Credited</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 4. Gold Club ─── */}
      {activeTab === 'gold' && (
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 44 }}>👑</div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A2E' }}>QuickBite Gold VIP Club</h2>
              <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>Active Membership — Valid until 31 Dec 2026</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 24 }}>
            <div style={{ background: '#FFF9F6', padding: 20, borderRadius: 16, border: '1.5px solid #FFD5C2' }}>
              <div style={{ fontSize: 32 }}>🚚</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>FREE Delivery Everywhere</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>No delivery fee on all orders above ₹199 from any restaurant.</div>
            </div>
            <div style={{ background: '#FFF9F6', padding: 20, borderRadius: 16, border: '1.5px solid #FFD5C2' }}>
              <div style={{ fontSize: 32 }}>🏷️</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>Extra 20% OFF</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>Get up to 20% additional discount on partner gourmet spots.</div>
            </div>
            <div style={{ background: '#FFF9F6', padding: 20, borderRadius: 16, border: '1.5px solid #FFD5C2' }}>
              <div style={{ fontSize: 32 }}>⚡</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>VIP Priority Dispatch</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>Your order is assigned to top-rated 5-star delivery riders first.</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. Refer & Earn ─── */}
      {activeTab === 'referral' && (
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎁</div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>Invite Friends, Get ₹100!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-sec)', maxWidth: 440, margin: '8px auto 24px auto' }}>
            Share your exclusive referral code with friends. When they place their first order, you both get ₹100 in your QuickBite Wallet!
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--primary-light)', padding: '12px 24px', borderRadius: 16, border: '1.5px dashed var(--primary)', marginBottom: 20 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', letterSpacing: 2 }}>RAHUL100</span>
            <button className="btn btn-sm btn-primary" onClick={() => { navigator.clipboard.writeText('RAHUL100'); alert('Referral code copied!'); }}>
              Copy Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
