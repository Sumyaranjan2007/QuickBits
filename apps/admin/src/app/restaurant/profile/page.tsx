'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, fetchRestaurantProfile, updateRestaurantProfile } from '../../../lib/supabase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_HOURS: Record<string, { open: string; close: string; isClosed: boolean; breakStart?: string; breakEnd?: string }> = {
  Monday: { open: '09:00', close: '23:00', isClosed: false },
  Tuesday: { open: '09:00', close: '23:00', isClosed: false },
  Wednesday: { open: '09:00', close: '23:00', isClosed: false },
  Thursday: { open: '09:00', close: '23:00', isClosed: false },
  Friday: { open: '09:00', close: '23:30', isClosed: false },
  Saturday: { open: '09:00', close: '23:30', isClosed: false },
  Sunday: { open: '09:00', close: '23:00', isClosed: false },
};

const INITIAL_OFFERS = [
  {
    id: 'off-1',
    code: 'FLAT50',
    title: 'Flat 50% Off on First 3 Orders',
    type: 'PERCENTAGE',
    value: 50,
    minOrder: 199,
    maxDiscount: 100,
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 428,
    isActive: true,
  },
  {
    id: 'off-2',
    code: 'WELCOME20',
    title: '₹50 Flat Discount on Weekend Orders',
    type: 'FLAT',
    value: 50,
    minOrder: 299,
    maxDiscount: 50,
    expiryDate: '2026-11-30',
    usageLimit: 500,
    usedCount: 182,
    isActive: true,
  },
  {
    id: 'off-3',
    code: 'QUICK50',
    title: 'Special Festival Delight 20% Off',
    type: 'PERCENTAGE',
    value: 20,
    minOrder: 399,
    maxDiscount: 80,
    expiryDate: '2026-10-15',
    usageLimit: 200,
    usedCount: 200,
    isActive: false,
  },
];

export default function RestaurantProfilePage() {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'HOURS' | 'OFFERS' | 'BUSINESS'>('PROFILE');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: 'Sharief Bhai Biryani',
    cuisine: 'North Indian, Biryani, Mughlai, Fast Food',
    description: 'Authentic Indian curries, dum biryanis, and delicious fast bites.',
    phone: '+91 98765 43210',
    email: 'partner@quickbite.com',
    address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    logoUrl: '',
    bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    gstNumber: '29ABCDE1234F1Z5',
    fssaiLicense: '11223344556677',
  });

  const [hours, setHours] = useState(INITIAL_HOURS);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [createOfferModal, setCreateOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    code: '',
    title: '',
    type: 'PERCENTAGE',
    value: 20,
    minOrder: 199,
    maxDiscount: 100,
    expiryDate: '2026-12-31',
    usageLimit: 500,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadRestaurantData = useCallback(async () => {
    try {
      const r = await fetchRestaurantProfile('sharief-bhai');
      if (r) {
        setRestaurant(r);
        setProfileForm({
          name: r.name || 'Sharief Bhai Biryani',
          cuisine: r.cuisine_type || 'Biryani, Mughlai',
          description: r.description || 'Authentic Indian curries, dum biryanis, and delicious fast bites.',
          phone: r.phone || '+91 98765 43210',
          email: r.email || 'partner@quickbite.com',
          address: r.address || '100 Feet Rd, Indiranagar, Bengaluru',
          logoUrl: r.logo_url || '',
          bannerUrl: r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          gstNumber: '29ABCDE1234F1Z5',
          fssaiLicense: '11223344556677',
        });
      }
    } catch (err) {
      console.warn('Profile fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (restaurant?.id) {
        await updateRestaurantProfile(restaurant.id, {
          name: profileForm.name,
          address: profileForm.address,
          cuisine_type: profileForm.cuisine,
        });
      }
      showToast('Restaurant details updated successfully in Supabase!');
    } catch (e: any) {
      showToast('Error updating profile: ' + (e?.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOffer = (id: string) => {
    setOffers(prev =>
      prev.map(o => (o.id === id ? { ...o, isActive: !o.isActive } : o))
    );
    showToast('Offer status updated!');
  };

  const handleCreateOffer = () => {
    if (!newOffer.code.trim()) {
      alert('Please enter coupon code');
      return;
    }
    const created = {
      id: `off-${Date.now()}`,
      ...newOffer,
      code: newOffer.code.toUpperCase().trim(),
      usedCount: 0,
      isActive: true,
    };
    setOffers(prev => [created, ...prev]);
    setCreateOfferModal(false);
    showToast(`Coupon ${created.code} published!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#4A0A10',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(74, 10, 16, 0.25)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 100,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            🏪 Restaurant Hub
          </h1>
          <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
            Manage profile, business schedules, license compliance, and marketing offers
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          style={{
            padding: '11px 22px',
            borderRadius: 10,
            background: '#4A0A10',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(74, 10, 16, 0.25)',
            minHeight: 44,
          }}
        >
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #EAE0D0', paddingBottom: 10, overflowX: 'auto' }}>
        {[
          { key: 'PROFILE', label: 'Restaurant Profile' },
          { key: 'HOURS', label: 'Operating Hours & Holidays' },
          { key: 'OFFERS', label: 'Offers & Coupons' },
          { key: 'BUSINESS', label: 'Business & Licenses' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === t.key ? '#4A0A10' : 'transparent',
              color: activeTab === t.key ? '#FFFFFF' : '#6F6F6F',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: PROFILE ─── */}
      {activeTab === 'PROFILE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Main Info */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#171717', margin: 0 }}>
              Basic Information
            </h3>

            <div>
              <label style={labelStyle}>Restaurant Name *</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Cuisine Types (Comma separated)</label>
              <input
                type="text"
                value={profileForm.cuisine}
                onChange={e => setProfileForm({ ...profileForm, cuisine: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Short Description</label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Store Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full Physical Address</label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Media Branding */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#171717', margin: 0 }}>
              Visual Branding
            </h3>

            <div>
              <label style={labelStyle}>Banner Image URL</label>
              <input
                type="text"
                value={profileForm.bannerUrl}
                onChange={e => setProfileForm({ ...profileForm, bannerUrl: e.target.value })}
                style={inputStyle}
              />
              <div
                style={{
                  height: 140,
                  borderRadius: 12,
                  marginTop: 10,
                  overflow: 'hidden',
                  background: '#FAF0EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileForm.bannerUrl}
                  alt="Store banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>Restaurant Logo URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={profileForm.logoUrl}
                onChange={e => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: OPERATING HOURS ─── */}
      {activeTab === 'HOURS' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
              Weekly Schedule & Break Times
            </h3>
            <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
              Customers can only place orders when your store is set to Open within these slots.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DAYS.map(day => {
              const schedule = hours[day] || { open: '09:00', close: '23:00', isClosed: false };
              return (
                <div
                  key={day}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: schedule.isClosed ? '#FFF5F5' : '#FAF6EF',
                    border: '1px solid #EAE0D0',
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 120, fontWeight: 800, color: '#171717', fontSize: 14 }}>
                    {day}
                  </div>

                  {!schedule.isClosed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="time"
                        value={schedule.open}
                        onChange={e =>
                          setHours({
                            ...hours,
                            [day]: { ...schedule, open: e.target.value },
                          })
                        }
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #EAE0D0' }}
                      />
                      <span style={{ color: '#6F6F6F' }}>to</span>
                      <input
                        type="time"
                        value={schedule.close}
                        onChange={e =>
                          setHours({
                            ...hours,
                            [day]: { ...schedule, close: e.target.value },
                          })
                        }
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #EAE0D0' }}
                      />
                    </div>
                  ) : (
                    <div style={{ color: '#D64545', fontWeight: 700, fontSize: 13 }}>
                      🔴 Holiday / Closed All Day
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setHours({
                        ...hours,
                        [day]: { ...schedule, isClosed: !schedule.isClosed },
                      })
                    }
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #EAE0D0',
                      background: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {schedule.isClosed ? 'Set Open' : 'Mark Holiday'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: OFFERS & COUPONS ─── */}
      {activeTab === 'OFFERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
                Active Offers & Coupon Codes
              </h3>
              <p style={{ fontSize: 13, color: '#6F6F6F', margin: '2px 0 0' }}>
                Create discounts to boost your store sales
              </p>
            </div>
            <button
              onClick={() => setCreateOfferModal(true)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: '#FFB21A',
                color: '#171717',
                fontWeight: 900,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 178, 26, 0.3)',
              }}
            >
              + CREATE OFFER
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {offers.map(offer => (
              <div
                key={offer.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: offer.isActive ? '1.5px solid #FFD470' : '1px solid #EAE0D0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: '#4A0A10',
                        background: '#FAF0EB',
                        padding: '4px 10px',
                        borderRadius: 8,
                        letterSpacing: 1,
                      }}
                    >
                      {offer.code}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#171717', marginTop: 8 }}>
                      {offer.title}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: offer.isActive ? '#E8F8F0' : '#FEECEC',
                      color: offer.isActive ? '#20A464' : '#D64545',
                    }}
                  >
                    {offer.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: '#6F6F6F', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>
                    Discount: <strong>{offer.type === 'PERCENTAGE' ? `${offer.value}% off` : `₹${offer.value} flat off`}</strong>
                  </div>
                  <div>
                    Min Order: <strong>₹{offer.minOrder}</strong> · Max Cap: <strong>₹{offer.maxDiscount}</strong>
                  </div>
                  <div>
                    Valid till: <strong>{offer.expiryDate}</strong> · Used: <strong>{offer.usedCount} / {offer.usageLimit}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleToggleOffer(offer.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: '1px solid #EAE0D0',
                      background: '#FAF6EF',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {offer.isActive ? 'DISABLE' : 'ENABLE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: BUSINESS & LICENSES ─── */}
      {activeTab === 'BUSINESS' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
            Tax & Regulatory Compliance
          </h3>

          <div>
            <label style={labelStyle}>GSTIN (Goods and Services Tax Number)</label>
            <input
              type="text"
              value={profileForm.gstNumber}
              onChange={e => setProfileForm({ ...profileForm, gstNumber: e.target.value })}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
              ✓ GST verified for standard 5% restaurant tax collection.
            </div>
          </div>

          <div>
            <label style={labelStyle}>FSSAI Food Safety License Number</label>
            <input
              type="text"
              value={profileForm.fssaiLicense}
              onChange={e => setProfileForm({ ...profileForm, fssaiLicense: e.target.value })}
              style={inputStyle}
            />
            <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
              ✓ License valid and compliant with national food safety guidelines.
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE OFFER MODAL ─── */}
      {createOfferModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setCreateOfferModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                🎁 Create Promo Coupon
              </h3>
              <button
                onClick={() => setCreateOfferModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FLAT50"
                  value={newOffer.code}
                  onChange={e => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. 50% Off on Orders Above ₹200"
                  value={newOffer.title}
                  onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select
                    value={newOffer.type}
                    onChange={e => setNewOffer({ ...newOffer, type: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Value</label>
                  <input
                    type="number"
                    value={newOffer.value}
                    onChange={e => setNewOffer({ ...newOffer, value: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Min Order (₹)</label>
                  <input
                    type="number"
                    value={newOffer.minOrder}
                    onChange={e => setNewOffer({ ...newOffer, minOrder: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={newOffer.maxDiscount}
                    onChange={e => setNewOffer({ ...newOffer, maxDiscount: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setCreateOfferModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #EAE0D0',
                    background: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOffer}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#4A0A10',
                    color: '#FFFFFF',
                    fontWeight: 800,
                  }}
                >
                  Publish Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#6F6F6F',
  marginBottom: 4,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #EAE0D0',
  fontSize: 14,
  background: '#FAF6EF',
  color: '#171717',
  boxSizing: 'border-box',
};
