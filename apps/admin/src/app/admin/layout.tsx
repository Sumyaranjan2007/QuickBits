'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface NavGroup {
  group: string;
  items: { icon: string; label: string; href: string; badge?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'MAIN OPERATIONS',
    items: [
      { icon: '📊', label: 'Executive Dashboard', href: '/admin' },
      { icon: '⚡', label: 'Live Operations', href: '/admin/operations', badge: 'LIVE' },
      { icon: '🗺️', label: 'Fleet Map Radar', href: '/admin/live-map' },
    ],
  },
  {
    group: 'MARKETPLACE',
    items: [
      { icon: '🍽️', label: 'Restaurants', href: '/admin/restaurants' },
      { icon: '🏷️', label: 'Menu Price Requests', href: '/admin/price-requests', badge: 'NEW' },
      { icon: '👥', label: 'Customers', href: '/admin/customers' },
      { icon: '🛵', label: 'Delivery Partners', href: '/admin/delivery' },
      { icon: '📦', label: 'Orders & Dispatch', href: '/admin/orders' },
    ],
  },
  {
    group: 'FINANCE & GROWTH',
    items: [
      { icon: '💰', label: 'Financial Analytics', href: '/admin/finance' },
      { icon: '🎫', label: 'Coupons & Offers', href: '/admin/coupons' },
    ],
  },
  {
    group: 'GOVERNANCE & SYSTEM',
    items: [
      { icon: '🛡️', label: 'Risk & Fraud Shield', href: '/admin/risk' },
      { icon: '⚙️', label: 'Platform Engine Settings', href: '/admin/settings' },
      { icon: '📜', label: 'Security & Audit Logs', href: '/admin/audit' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout" data-theme="admin">
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
          <span className="mobile-brand-icon">👑</span>
          <span>QuickBite Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" className="btn btn-sm btn-outline" style={{ borderRadius: 8, fontSize: 11, padding: '4px 8px' }}>
            🏠 Hub
          </Link>
          <button
            onClick={logout}
            className="btn btn-sm"
            style={{ borderRadius: 8, fontSize: 11, padding: '4px 8px', background: '#FFEAA7', color: '#D63031', border: 'none' }}
          >
            🚪
          </button>
        </div>
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ─── Enterprise Sidebar ─── */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} style={{ width: 270, background: '#1A1A2E', overflowY: 'auto' }}>
        {/* Brand */}
        <div className="sidebar-brand" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 30 }}>🍔</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>QuickBite</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#A29BFE', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3 }}>
                Control Center
              </div>
            </div>
          </div>
          <button
            className="show-mobile"
            onClick={() => setMobileOpen(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', padding: 4 }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="sidebar-nav" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {NAV_GROUPS.map((grp, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, padding: '0 12px 6px 12px' }}>
                {grp.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {grp.items.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      style={{
                        padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span style={{ background: '#00B894', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Admin User */}
        <div className="sidebar-footer" style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
              👑
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email?.split('@')[0] || 'SuperAdmin'}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#00B894', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="status-dot online" style={{ width: 6, height: 6 }} /> SUPER_ADMIN
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm w-full"
            style={{ width: '100%', marginTop: 12, color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 6, fontSize: 12 }}
            onClick={logout}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className="main-content" style={{ marginLeft: 270, padding: '28px 36px', minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Top Operational Bar (Desktop) */}
        <div className="hide-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#fff', padding: '12px 24px', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              ⚡ Platform Network Status:
            </span>
            <span className="badge badge-success" style={{ fontSize: 11, padding: '4px 10px', gap: 6 }}>
              <span className="status-dot online" style={{ width: 6, height: 6, margin: 0 }} /> Operational • All Services Green
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600 }}>
              Bangalore Zone 1 • SQLite Production Active
            </span>
            <Link href="/" className="btn btn-sm btn-outline" style={{ borderRadius: 8, fontSize: 12 }}>
              🏠 Portal Hub
            </Link>
            <Link href="/customer" target="_blank" className="btn btn-sm btn-outline" style={{ borderRadius: 8, fontSize: 12 }}>
              Open Customer App ↗
            </Link>
            <button
              onClick={logout}
              className="btn btn-sm"
              style={{
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                background: '#FFEAA7',
                color: '#D63031',
                border: '1px solid #FAB1A0',
                cursor: 'pointer'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {children}
      </main>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
            { key: 'operations', label: 'Operations', icon: '⚡', href: '/admin/operations' },
            { key: 'orders', label: 'Orders', icon: '📦', href: '/admin/orders' },
            { key: 'analytics', label: 'Analytics', icon: '💰', href: '/admin/finance' },
            { key: 'profile', label: 'Profile', icon: '⚙️', href: '/admin/settings' },
          ].map(item => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
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
