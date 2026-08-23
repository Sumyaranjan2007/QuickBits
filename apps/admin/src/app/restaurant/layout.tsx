'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { icon: '📊', label: 'Dashboard', href: '/restaurant' },
      { icon: '📦', label: 'Live Orders', href: '/restaurant/orders' },
      { icon: '🍳', label: 'Kitchen (KDS)', href: '/restaurant/kitchen' },
    ],
  },
  {
    label: 'Menu',
    items: [
      { icon: '📜', label: 'Menu Items', href: '/restaurant/menu' },
      { icon: '🗂️', label: 'Categories', href: '/restaurant/menu/categories' },
      { icon: '➕', label: 'Add-ons', href: '/restaurant/menu/addons' },
    ],
  },
  {
    label: 'Restaurant',
    items: [
      { icon: '🏪', label: 'Profile', href: '/restaurant/profile' },
      { icon: '🕐', label: 'Hours & Holidays', href: '/restaurant/hours' },
      { icon: '🎁', label: 'Offers & Coupons', href: '/restaurant/offers' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: '📈', label: 'Analytics', href: '/restaurant/analytics' },
      { icon: '⭐', label: 'Reviews', href: '/restaurant/reviews' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: '💰', label: 'Settlements', href: '/restaurant/finance' },
    ],
  },
  {
    label: 'Team',
    items: [
      { icon: '👥', label: 'Staff', href: '/restaurant/staff' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { icon: '🤖', label: 'AI Assistant', href: '/restaurant/assistant' },
      { icon: '🎧', label: 'Support', href: '/restaurant/support' },
    ],
  },
];

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [restaurantStatus, setRestaurantStatus] = useState<'OPEN' | 'PAUSED' | 'CLOSED'>('OPEN');

  const statusColors: Record<string, string> = {
    OPEN: '#00B894',
    PAUSED: '#FDCB6E',
    CLOSED: '#E17055',
  };

  return (
    <div className="app-layout" data-theme="restaurant">
      <aside className="sidebar" style={{ width: isOpen ? 240 : 64, transition: 'width 0.25s', overflow: 'hidden' }}>
        {/* Brand */}
        <div className="sidebar-brand" style={{ justifyContent: isOpen ? 'space-between' : 'center' }}>
          {isOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sidebar-brand-icon">🍽️</span>
              <span style={{ fontSize: 16, fontWeight: 900 }}>QuickBite</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            title="Toggle sidebar"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Restaurant Status Toggle */}
        {isOpen && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Restaurant Status
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['OPEN', 'PAUSED', 'CLOSED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setRestaurantStatus(s)}
                  style={{
                    flex: 1, padding: '5px 2px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 9, fontWeight: 800, letterSpacing: 0.3,
                    background: restaurantStatus === s ? statusColors[s] : 'rgba(255,255,255,0.08)',
                    color: restaurantStatus === s ? '#fff' : 'rgba(255,255,255,0.45)',
                    transition: '0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {isOpen && (
                <div style={{ padding: '14px 20px 4px', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                  {group.label}
                </div>
              )}
              {group.items.map(n => {
                const active = pathname === n.href || (n.href !== '/restaurant' && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                    title={!isOpen ? n.label : undefined}
                    style={{ justifyContent: isOpen ? 'flex-start' : 'center', gap: isOpen ? 10 : 0 }}
                  >
                    <span className="sidebar-link-icon" style={{ minWidth: 22 }}>{n.icon}</span>
                    {isOpen && <span style={{ fontSize: 13.5 }}>{n.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {isOpen && (
            <div className="sidebar-user">
              <div className="sidebar-avatar" style={{ background: '#00B894', minWidth: 36 }}>
                {(user?.profile?.firstName?.[0] || user?.email?.[0] || 'R').toUpperCase()}
              </div>
              <div>
                <div className="sidebar-user-name">{user?.profile?.firstName || user?.email?.split('@')[0] || 'Owner'}</div>
                <div className="sidebar-user-role" style={{ color: '#55EFC4' }}>Restaurant Owner</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {isOpen && (
              <Link
                href="/"
                className="btn btn-sm"
                style={{ width: '100%', color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, textAlign: 'center', textDecoration: 'none' }}
              >
                🏠 Portal Hub
              </Link>
            )}
            <button
              className="btn btn-sm"
              style={{ width: '100%', color: '#FAB1A0', background: 'rgba(214, 48, 49, 0.2)', border: '1px solid rgba(214, 48, 49, 0.3)', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
              onClick={logout}
            >
              {isOpen ? '🚪 Sign Out' : '🚪'}
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}
