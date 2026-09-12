'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from '../LocationContext';
import Link from 'next/link';

export default function CustomerProfilePage() {
  const { user, logout } = useAuth();
  const {
    savedLocations,
    selectedLocation,
    selectLocation,
    addCustomAddress,
    removeAddress,
  } = useLocation();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wallet' | 'gold' | 'referral' | 'help'>('profile');
  
  // Profile form state with localStorage sync
  const [firstName, setFirstName] = useState('Rahul');
  const [lastName, setLastName] = useState('Sharma');
  const [phone, setPhone] = useState('+91 99999 99992');
  const [email, setEmail] = useState('customer@quickbite.com');
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(500);
  const [addAmount, setAddAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 'tx-1', title: 'Wallet Recharge', amount: '+₹500', date: 'Today, 2:30 PM', type: 'credit' },
    { id: 'tx-2', title: 'Paid for Order #QB-982144', amount: '-₹512', date: 'Yesterday', type: 'debit' },
    { id: 'tx-3', title: 'Cashback Received', amount: '+₹50', date: '3 days ago', type: 'credit' },
  ]);

  // New Address form state
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('qb_customer_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.firstName) setFirstName(parsed.firstName);
          if (parsed.lastName) setLastName(parsed.lastName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
        } else if (user) {
          if (user.profile?.firstName) setFirstName(user.profile.firstName);
          if (user.profile?.lastName) setLastName(user.profile.lastName);
          if (user.email) setEmail(user.email);
        }

        const storedWallet = localStorage.getItem('qb_customer_wallet');
        if (storedWallet) {
          setWalletBalance(Number(storedWallet));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        const profileData = { firstName, lastName, phone, email };
        localStorage.setItem('qb_customer_profile', JSON.stringify(profileData));
        setIsSavedToast(true);
        setTimeout(() => setIsSavedToast(false), 2500);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddMoney = (amtToAdd?: number) => {
    const amt = amtToAdd || parseFloat(addAmount);
    if (!amt || amt <= 0) return;
    const newBal = walletBalance + amt;
    setWalletBalance(newBal);
    setTransactions([
      { id: `tx-${Date.now()}`, title: 'Wallet Top-Up', amount: `+₹${amt}`, date: 'Just now', type: 'credit' },
      ...transactions,
    ]);
    setAddAmount('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('qb_customer_wallet', String(newBal));
    }
    alert(`₹${amt} successfully added to QuickBite Wallet!`);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    const added = addCustomAddress(newAddrText.trim(), newAddrLabel);
    selectLocation(added);
    setNewAddrText('');
    setShowAddAddressForm(false);
    alert('New address saved successfully!');
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('QUICK99');
    alert('Referral code "QUICK99" copied to clipboard! Share it with friends to earn ₹100.');
  };

  return (
    <div className="customer-profile-container" style={{ padding: '4px 0 30px' }}>
      {/* ─── Profile Hero Banner ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4A0A10 0%, #70101B 100%)',
          borderRadius: 20,
          padding: '20px 16px',
          color: '#FFFFFF',
          marginBottom: 16,
          boxShadow: '0 4px 16px rgba(74, 10, 16, 0.25)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#FFFFFF',
                color: '#4A0A10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 900,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {firstName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>
                  {firstName} {lastName}
                </h2>
                <span style={{ background: '#D4890E', color: '#FFFFFF', fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                  👑 GOLD
                </span>
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
                {phone} • {email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              borderRadius: 12,
              padding: '6px 12px',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ─── Profile Navigation Tabs ─── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16 }}>
        {[
          { id: 'profile', label: '👤 Personal' },
          { id: 'addresses', label: '📍 Addresses' },
          { id: 'wallet', label: '👛 Wallet' },
          { id: 'gold', label: '👑 Gold' },
          { id: 'referral', label: '🎁 Refer' },
          { id: 'help', label: '🎧 Help & Refunds' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 16,
              background: activeTab === tab.id ? '#4A0A10' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
              border: `1px solid ${activeTab === tab.id ? '#4A0A10' : '#EADBCE'}`,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 1. Personal Info Tab ─── */}
      {activeTab === 'profile' && (
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #EADBCE', padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10', margin: '0 0 14px 0' }}>
            Personal Details
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                background: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '12px 0',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                marginTop: 6,
                boxShadow: '0 2px 8px rgba(74, 10, 16, 0.2)',
              }}
            >
              Save Profile Changes
            </button>

            {isSavedToast && (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
                ✓ Profile saved successfully!
              </div>
            )}
          </form>
        </div>
      )}

      {/* ─── 2. Saved Addresses Tab ─── */}
      {activeTab === 'addresses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
              Saved Addresses ({savedLocations.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddAddressForm(!showAddAddressForm)}
              style={{
                background: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {showAddAddressForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {/* Add Address Form Accordion */}
          {showAddAddressForm && (
            <form onSubmit={handleAddNewAddress} style={{ background: '#FFFFFF', borderRadius: 14, border: '1.5px solid #4A0A10', padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#4A0A10', marginBottom: 8 }}>
                Add New Delivery Location
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {(['Home', 'Work', 'Other'] as const).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewAddrLabel(tag)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      border: `1px solid ${newAddrLabel === tag ? '#4A0A10' : '#D1D5DB'}`,
                      background: newAddrLabel === tag ? '#4A0A10' : '#FFFFFF',
                      color: newAddrLabel === tag ? '#FFFFFF' : '#374151',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {tag === 'Home' ? '🏠 Home' : tag === 'Work' ? '💼 Work' : '📍 Other'}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="House / Flat No., Street, Landmark, Area, Bengaluru"
                value={newAddrText}
                onChange={e => setNewAddrText(e.target.value)}
                style={{ width: '100%', borderRadius: 8, border: '1px solid #D1D5DB', padding: 8, fontSize: 12, marginBottom: 10, minHeight: 60, outline: 'none' }}
                required
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#0E9F6E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 0',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Save &amp; Select Address
              </button>
            </form>
          )}

          {/* Addresses List */}
          {savedLocations.map(addr => {
            const isSelected = selectedLocation?.id === addr.id;

            return (
              <div
                key={addr.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: isSelected ? '1.5px solid #0E9F6E' : '1px solid #EADBCE',
                  padding: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{addr.tag === 'Home' ? '🏠' : addr.tag === 'Work' ? '💼' : '📍'}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{addr.name}</span>
                    {isSelected && (
                      <span style={{ background: '#ECFDF5', color: '#0E9F6E', border: '1px solid #A7F3D0', fontSize: 9.5, fontWeight: 800, padding: '1px 6px', borderRadius: 6 }}>
                        Active
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAddress(addr.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>

                <div style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.3, marginBottom: 8 }}>
                  {addr.desc || addr.fullAddress}
                </div>

                {!isSelected && (
                  <button
                    type="button"
                    onClick={() => selectLocation(addr)}
                    style={{
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    Set as Active Delivery Address
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 3. QuickBite Wallet Tab ─── */}
      {activeTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
              borderRadius: 16,
              padding: 16,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              QuickBite Wallet Balance
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, margin: '4px 0 10px 0' }}>
              ₹{walletBalance.toFixed(2)}
            </div>

            {/* Quick Top-Up Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[100, 200, 500].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddMoney(amt)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#FFFFFF',
                    borderRadius: 12,
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Recharge Card */}
          <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #EADBCE', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 8 }}>
              Top Up Wallet
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder="Enter amount (e.g. ₹500)"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => handleAddMoney()}
                style={{
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Add Money
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #EADBCE', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 10 }}>
              Recent Transactions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: 6, fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>{tx.title}</div>
                    <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>{tx.date}</div>
                  </div>
                  <div style={{ fontWeight: 900, color: tx.type === 'credit' ? '#0E9F6E' : '#E11D48', fontSize: 13 }}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. Gold Membership Tab ─── */}
      {activeTab === 'gold' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
              borderRadius: 16,
              padding: 16,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.9 }}>
                  👑 VIP MEMBERSHIP
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, margin: '2px 0 0 0' }}>QuickBite Gold</h3>
              </div>
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 8 }}>
                ACTIVE
              </span>
            </div>
            <p style={{ fontSize: 11.5, opacity: 0.9, margin: '8px 0 0 0' }}>
              Valid until 31 Dec 2026 • Saved ₹1,420 so far!
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #EADBCE', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 10 }}>
              Your Active Gold Benefits
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '⚡', title: 'Unlimited Free Delivery', desc: 'On all restaurant orders above ₹199 within 7 km' },
                { icon: '👑', title: 'Up to 30% Extra OFF', desc: 'Exclusive member discounts on top rated restaurants' },
                { icon: '🚀', title: 'VIP Priority Cooking & Delivery', desc: 'Jump queue during peak rush hours' },
                { icon: '💬', title: 'Dedicated 24/7 Support', desc: 'Direct access to priority customer assistance' },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, background: '#FEF3C7', borderRadius: 8, padding: 4 }}>{b.icon}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1F2937' }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. Refer & Earn Tab ─── */}
      {activeTab === 'referral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #4A0A10 0%, #831843 100%)',
              borderRadius: 16,
              padding: 18,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 4 }}>🎁</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 4px 0' }}>Invite Friends &amp; Earn ₹100</h3>
            <p style={{ fontSize: 12, opacity: 0.9, margin: 0 }}>
              Your friend gets ₹100 off on their 1st order, and you get ₹100 in your QuickBite Wallet!
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #EADBCE', padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
              Your Unique Referral Code
            </div>
            <div
              style={{
                display: 'inline-block',
                background: '#FFF7ED',
                border: '2px dashed #FB923C',
                padding: '8px 24px',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 2,
                color: '#EA580C',
                marginBottom: 12,
              }}
            >
              QUICK99
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleCopyReferral}
                style={{
                  flex: 1,
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                📋 Copy Code
              </button>
              <a
                href="https://api.whatsapp.com/send?text=Hey!%20Use%20my%20code%20QUICK99%20to%20get%20%E2%82%B9100%20OFF%20your%20first%20food%20order%20on%20QuickBite!"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '10px 0',
                  fontSize: 12,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. Help & Refunds Tab ─── */}
      {activeTab === 'help' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Main Resolution Hub Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EADBCE',
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                ⚡
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                  Refund & Issue Resolution
                </h3>
                <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0 }}>
                  Instant wallet refunds, order queries & 24x7 support
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#F9FAFB',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 14,
                border: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#4B5563' }}>Current QuickBite Wallet:</span>
                <span style={{ fontWeight: 900, color: '#0E9F6E', fontSize: 14 }}>₹{walletBalance}</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                💡 Refunds credited to wallet include an extra <strong>5% instant bonus</strong> and can be used on any future order!
              </div>
            </div>

            <Link
              href="/customer/help"
              style={{
                display: 'block',
                background: '#4A0A10',
                color: '#FFFFFF',
                borderRadius: 12,
                padding: '12px 0',
                fontSize: 13,
                fontWeight: 900,
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(74, 10, 16, 0.2)',
              }}
            >
              Open Help & Instant Refund Center ⚡
            </Link>
          </div>

          {/* Direct Support Channels */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EADBCE',
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 900, color: '#1F2937', marginBottom: 12 }}>
              Quick Contact Support
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a
                href="tel:18004192483"
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 12,
                  padding: '12px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>📞</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#065F46' }}>Call 24x7</span>
                <span style={{ fontSize: 10, color: '#047857' }}>1800-419-BITE</span>
              </a>

              <Link
                href="/customer/help?tab=chat"
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 12,
                  padding: '12px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF' }}>Live Chat</span>
                <span style={{ fontSize: 10, color: '#2563EB' }}>Instant reply</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
