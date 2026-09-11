'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { deliveryApi } from '@quickbite/api-client';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'OPERATIONS',
    items: [
      { icon: '⚡', label: 'Dashboard', href: '/delivery' },
      { icon: '🛵', label: 'Active Delivery', href: '/delivery/active' },
      { icon: '📦', label: 'Order History', href: '/delivery/orders' },
      { icon: '🗺️', label: 'Demand Heatmap', href: '/delivery/map' },
    ],
  },
  {
    title: 'EARNINGS & FINANCE',
    items: [
      { icon: '💰', label: 'Earnings Summary', href: '/delivery/earnings' },
      { icon: '🎁', label: 'Incentives & Bonus', href: '/delivery/incentives', badge: 'Active' },
      { icon: '🏦', label: 'Payouts & Wallet', href: '/delivery/payouts' },
    ],
  },
  {
    title: 'GROWTH & SUPPORT',
    items: [
      { icon: '⭐', label: 'Performance & Rating', href: '/delivery/performance' },
      { icon: '🦺', label: 'Safety & SOS', href: '/delivery/safety' },
      { icon: '🤖', label: 'AI Partner Assistant', href: '/delivery/assistant' },
      { icon: '🎧', label: 'Help & Support', href: '/delivery/support' },
      { icon: '👤', label: 'Profile & Documents', href: '/delivery/profile' },
    ],
  },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'delivery');
    deliveryApi.getProfile()
      .then(r => {
        const d = r.data as any;
        setProfile(d);
        setIsOnline(d?.isOnline ?? true);
      })
      .catch(() => {
        setIsOnline(true);
      });
  }, []);

  const handleToggleOnline = async () => {
    setLoadingStatus(true);
    const nextState = !isOnline;
    try {
      await deliveryApi.toggleOnline(nextState);
      setIsOnline(nextState);
    } catch {
      setIsOnline(nextState);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="app-layout" data-theme="delivery">
      {/* ─── Mobile Top Header ─── */}
      <div className="mobile-top-bar">
        <button
          className="mobile-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Navigation Menu"
        >
          ☰
        </button>
        <div className="mobile-brand">
          <span className="mobile-brand-icon">🛵</span>
          <span>Delivery Fleet</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleToggleOnline}
            disabled={loadingStatus}
            style={{
              background: isOnline ? '#00B894' : '#636E72',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {loadingStatus ? '...' : isOnline ? 'Online' : 'Offline'}
          </button>
          <Link href="/" className="btn btn-sm btn-outline" style={{ borderRadius: 8, fontSize: 11, padding: '4px 8px' }}>
            🏠
          </Link>
        </div>
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ─── Sidebar ─── */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`} style={{
        background: '#0C2340',
        color: '#fff',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        width: collapsed ? 72 : 260,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Brand */}
        <div style={{
          padding: collapsed ? '16px 12px' : '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0984E3, #74B9FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0
            }}>🛵</span>
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: -0.3, color: '#fff' }}>QuickBite</div>
                <div style={{ fontSize: 10, color: '#74B9FF', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Delivery Fleet</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hide-mobile"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: 6,
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '6px 8px',
                fontSize: 12,
              }}
            >
              {collapsed ? '▶' : '◀'}
            </button>
            <button
              className="show-mobile"
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', padding: 2 }}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Duty Status Switch */}
        {!collapsed && (
          <div style={{
            margin: '12px 14px',
            padding: '12px 14px',
            background: isOnline ? 'rgba(0, 184, 148, 0.12)' : 'rgba(225, 112, 85, 0.12)',
            borderRadius: 12,
            border: `1px solid ${isOnline ? 'rgba(0, 184, 148, 0.3)' : 'rgba(225, 112, 85, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isOnline ? '#00B894' : '#E17055',
                boxShadow: isOnline ? '0 0 10px #00B894' : 'none',
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: isOnline ? '#55EFC4' : '#FAB1A0' }}>
                  {isOnline ? 'ON DUTY' : 'OFF DUTY'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                  {isOnline ? 'Receiving orders' : 'Not available'}
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleOnline}
              disabled={loadingStatus}
              style={{
                background: isOnline ? '#00B894' : '#636E72',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              {loadingStatus ? '...' : isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        )}

        {/* Nav list */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: 1,
                  padding: '6px 12px',
                  textTransform: 'uppercase'
                }}>
                  {group.title}
                </div>
              )}
              {group.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/delivery' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 10,
                      marginBottom: 2,
                      textDecoration: 'none',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                      background: isActive ? 'linear-gradient(90deg, rgba(9,132,227,0.3) 0%, rgba(9,132,227,0.1) 100%)' : 'transparent',
                      borderLeft: isActive ? '3px solid #0984E3' : '3px solid transparent',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        background: '#00B894',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                      }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer with User info */}
        <div style={{
          padding: collapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 15,
                color: '#fff'
              }}>
                {(user?.profile?.firstName?.[0] || 'D').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : 'Ramesh Kumar'}
                </div>
                <div style={{ fontSize: 11, color: '#74B9FF', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⭐ 4.89</span>
                  <span>•</span>
                  <span>Hero Fleet</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#0984E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
              }}>
                {(user?.profile?.firstName?.[0] || 'D').toUpperCase()}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <Link
                href="/delivery/profile"
                style={{
                  flex: 1,
                  padding: '6px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.85)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                {collapsed ? '⚙️' : 'Profile'}
              </Link>
              {!collapsed && (
                <Link
                  href="/"
                  style={{
                    flex: 1,
                    padding: '6px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  🏠 Hub
                </Link>
              )}
            </div>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '8px 10px',
                background: 'rgba(225,112,85,0.2)',
                color: '#FAB1A0',
                border: '1px solid rgba(225,112,85,0.3)',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              title="Logout"
            >
              <span>🚪</span>
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className="main-content" style={{ background: '#F4F8FC', minHeight: '100vh', padding: '24px' }}>
        {children}
      </main>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {[
            { key: 'home', label: 'Home', icon: '🛵', href: '/delivery' },
            { key: 'active', label: 'Active', icon: '⚡', href: '/delivery/active' },
            { key: 'earnings', label: 'Earnings', icon: '💰', href: '/delivery/earnings' },
            { key: 'history', label: 'History', icon: '📦', href: '/delivery/orders' },
            { key: 'profile', label: 'Profile', icon: '👤', href: '/delivery/profile' },
          ].map(item => {
            const isActive = item.href === '/delivery' ? pathname === '/delivery' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
