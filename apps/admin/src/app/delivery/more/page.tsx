'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useDeliveryContext } from '../DeliveryContext';

export default function DeliveryMorePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useDeliveryContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/customer');
  };

  const menuSections = [
    {
      title: 'PARTNER MANAGEMENT',
      items: [
        { icon: '👤', label: 'Profile & Documents', desc: 'Driving license, RC & vehicle verification', href: '/delivery/profile' },
        { icon: '⭐', label: 'Performance & Rating', desc: 'Customer ratings, completion rate & badges', href: '/delivery/performance' },
        { icon: '🦺', label: 'Safety & SOS', desc: 'Emergency contacts, live safety toolkit & insurance', href: '/delivery/safety' },
      ],
    },
    {
      title: 'GROWTH & REWARDS',
      items: [
        { icon: '🎁', label: 'Incentives & Bonus', desc: 'Peak hour targets & weekly streak rewards', href: '/delivery/incentives' },
        { icon: '🏦', label: 'Payouts & Bank Details', desc: 'Bank account info & settlement schedule', href: '/delivery/payouts' },
        { icon: '🗺️', label: 'Demand Heatmap', desc: 'Live hotspot map for high order volume', href: '/delivery/map' },
      ],
    },
    {
      title: 'SUPPORT & TOOLS',
      items: [
        { icon: '🤖', label: 'AI Partner Assistant', desc: '24/7 intelligent route & order helper', href: '/delivery/assistant' },
        { icon: '🎧', label: 'Help & Support', desc: 'Call helpline, FAQs & dispute assistance', href: '/delivery/support' },
      ],
    },
  ];

  return (
    <>
      {/* ─── Screen Header ─── */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
          Partner Menu
        </h1>
        <p style={{ fontSize: 11, color: '#7A6A5E', margin: '2px 0 0' }}>
          Account settings, safety & secondary tools
        </p>
      </div>

      {/* ─── Partner Profile Summary Card ─── */}
      <div className="delivery-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: '#4A0A10',
          color: '#FFB21A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 900,
          flexShrink: 0,
        }}>
          {profile?.firstName?.[0] || user?.firstName?.[0] || 'A'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A' }}>
            {profile?.firstName || user?.firstName || 'Amit'} {profile?.lastName || user?.lastName || 'Verma'}
          </div>
          <div style={{ fontSize: 12, color: '#7A6A5E', marginTop: 2 }}>
            🛵 {profile?.vehicleType || 'Motorcycle'} • {profile?.vehicleNumber || 'KA-01-EQ-9876'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              background: '#FFFBEB',
              color: '#B45309',
              border: '1px solid #FDE68A',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 6,
            }}>
              ⭐ {profile?.rating || '4.89'} Rating
            </span>
            <span style={{
              background: '#F0FDF4',
              color: '#047857',
              border: '1px solid #A7F3D0',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 6,
            }}>
              ✓ Verified Partner
            </span>
          </div>
        </div>
      </div>

      {/* ─── Menu Sections ─── */}
      {menuSections.map((sec) => (
        <div key={sec.title}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#7A6A5E',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 8,
            paddingLeft: 4,
          }}>
            {sec.title}
          </div>

          <div className="delivery-card" style={{ padding: '4px 12px' }}>
            {sec.items.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 4px',
                  textDecoration: 'none',
                  borderBottom: idx < sec.items.length - 1 ? '1px solid #FAF7F2' : 'none',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#FAF7F2',
                  border: '1px solid #EADBCE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#7A6A5E', marginTop: 1 }}>
                    {item.desc}
                  </div>
                </div>

                <span style={{ color: '#9E8F84', fontSize: 16 }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* ─── App Preferences (Settings) ─── */}
      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#7A6A5E',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 8,
          paddingLeft: 4,
        }}>
          APP PREFERENCES
        </div>

        <div className="delivery-card" style={{ padding: '6px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FAF7F2' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>🔊 Order Sound Alerts</div>
              <div style={{ fontSize: 11, color: '#7A6A5E' }}>15-second loud audio ring on new order</div>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={e => setSoundAlerts(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#4A0A10', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>🎯 High-Accuracy GPS</div>
              <div style={{ fontSize: 11, color: '#7A6A5E' }}>Continuous background location updates</div>
            </div>
            <input
              type="checkbox"
              checked={highAccuracyGps}
              onChange={e => setHighAccuracyGps(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#4A0A10', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* ─── Logout Button ─── */}
      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          className="delivery-reject-btn"
          onClick={() => setShowLogoutModal(true)}
          id="btn-delivery-logout"
        >
          🚪 LOG OUT OF PARTNER PORTAL
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#9E8F84', marginTop: 12 }}>
          QuickBite Partner Ecosystem v2.0 • Unified Localhost:3001
        </div>
      </div>

      {/* ─── Logout Confirmation Modal ─── */}
      {showLogoutModal && (
        <div className="delivery-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="delivery-modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🚪</div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                Log Out of QuickBite?
              </h3>
              <p style={{ fontSize: 12, color: '#7A6A5E', margin: '6px 0 20px' }}>
                You will be set to offline and will not receive order requests until you sign in again.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="delivery-reject-btn"
                  onClick={handleLogout}
                  style={{ flex: 1 }}
                >
                  YES, LOG OUT
                </button>
                <button
                  type="button"
                  className="delivery-secondary-btn"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1 }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
