'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

import { DeliveryContext } from './DeliveryContext';
import { fetchDeliveryPartnerProfile, updateDeliveryPartnerStatus } from '../../lib/supabase';

// ─── Bottom Navigation Items (Exact 5 Sections Requested) ───────────────────
const DELIVERY_NAV_ITEMS = [
  {
    key: 'home',
    href: '/delivery',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'deliveries',
    href: '/delivery/active',
    label: 'Deliveries',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'history',
    href: '/delivery/orders',
    label: 'History',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: 'earnings',
    href: '/delivery/earnings',
    label: 'Earnings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: 'more',
    href: '/delivery/more',
    label: 'More',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
];

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'delivery');
    fetchDeliveryPartnerProfile()
      .then((d: any) => {
        if (d) {
          setProfile(d);
          if (d?.status) {
            setIsOnline(d.status === 'ONLINE');
          }
        }
      })
      .catch(() => {
        setIsOnline(true);
      });
  }, []);

  const handleToggleOnline = async () => {
    setLoadingStatus(true);
    const nextState = !isOnline;
    try {
      if (profile?.id) {
        await updateDeliveryPartnerStatus(profile.id, nextState ? 'ONLINE' : 'OFFLINE');
      }
      setIsOnline(nextState);
    } catch {
      setIsOnline(nextState);
    } finally {
      setLoadingStatus(false);
    }
  };

  const isNavActive = (href: string) => {
    if (href === '/delivery') return pathname === '/delivery';
    return pathname.startsWith(href);
  };

  return (
    <DeliveryContext.Provider
      value={{
        isOnline,
        toggleOnline: handleToggleOnline,
        profile,
        loadingStatus,
      }}
    >
      <div className="delivery-app-viewport" data-theme="delivery">
        <div className="delivery-phone-frame">
          {/* ─── Mobile Header (Matches Customer App) ─── */}
          <header className="delivery-mobile-header">
            <div className="delivery-header-left">
              <div className="delivery-brand-circle">
                <span>🛵</span>
              </div>
              <div>
                <div className="delivery-brand-title">QuickBite</div>
                <div className="delivery-brand-subtitle">Delivery Partner</div>
              </div>
            </div>

            {/* Online / Offline Status Toggle Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className={`delivery-status-pill ${isOnline ? 'online' : 'offline'}`}
                onClick={handleToggleOnline}
                disabled={loadingStatus}
                title={isOnline ? 'Click to Go Offline' : 'Click to Go Online'}
                id="delivery-status-pill-toggle"
              >
                <span className="delivery-status-dot" />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </button>

              {/* Quick SOS button */}
              <Link
                href="/delivery/safety"
                style={{
                  background: '#FEF2F2',
                  color: '#B91C1C',
                  border: '1px solid #FECACA',
                  borderRadius: 20,
                  padding: '5px 9px',
                  fontSize: 11,
                  fontWeight: 900,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
                title="Emergency Safety & SOS"
              >
                <span>🚨</span>
                <span>SOS</span>
              </Link>
            </div>
          </header>

          {/* ─── Main Screen Content ─── */}
          <main className="delivery-screen-content">
            {children}
          </main>

          {/* ─── Fixed Mobile Bottom Navigation (Customer App Style) ─── */}
          <nav className="delivery-bottom-nav">
            <div className="delivery-bottom-nav-inner">
              {DELIVERY_NAV_ITEMS.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`delivery-nav-tab ${active ? 'active' : ''}`}
                    id={`delivery-nav-tab-${item.key}`}
                  >
                    <div className="delivery-nav-tab-icon">{item.icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
                    {active && <span className="delivery-nav-active-dot" />}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </DeliveryContext.Provider>
  );
}
