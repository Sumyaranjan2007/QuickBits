'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchRestaurantProfile } from '../../lib/supabase';
import { OrderSoundAlertProvider } from '../../context/OrderSoundAlertContext';
import { NewOrderAlertModal, AudioUnlockBanner, PendingOrderWaitingBanner } from '../../components/NewOrderAlertModal';

const MAIN_NAV = [
  { icon: '🏠', label: 'Dashboard', href: '/restaurant' },
  { icon: '📦', label: 'Orders', href: '/restaurant/orders' },
  { icon: '🍔', label: 'Menu', href: '/restaurant/menu' },
  { icon: '🏪', label: 'Restaurant', href: '/restaurant/profile' },
  { icon: '💰', label: 'Earnings', href: '/restaurant/finance' },
  { icon: '⭐', label: 'Reviews', href: '/restaurant/reviews' },
];

// ─── Clean 5-Item Mobile Bottom Navigation (Equal Width, SVG Icons, Short Labels) ───
const RESTAURANT_BOTTOM_NAV = [
  {
    key: 'home',
    label: 'Home',
    href: '/restaurant',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    href: '/restaurant/orders',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    key: 'menu',
    label: 'Menu',
    href: '/restaurant/menu',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11h18M5 11V7a7 7 0 0 1 14 0v4M4 15h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    key: 'earnings',
    label: 'Earnings',
    href: '/restaurant/finance',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l8.5 8" />
        <path d="M6 13h3a4.5 4.5 0 0 0 0-9" />
      </svg>
    ),
  },
];

const SECONDARY_NAV = [
  { icon: '⚙️', label: 'Settings', href: '/restaurant/settings' },
  { icon: '🎧', label: 'Help & Support', href: '/restaurant/support' },
];

const MORE_NAV = [
  { icon: '🏪', label: 'Restaurant Profile', href: '/restaurant/profile' },
  { icon: '🎁', label: 'Offers & Coupons', href: '/restaurant/offers' },
  { icon: '⭐', label: 'Customer Reviews', href: '/restaurant/reviews' },
  { icon: '📈', label: 'Sales Analytics', href: '/restaurant/analytics' },
  { icon: '🍳', label: 'Kitchen Display (KDS)', href: '/restaurant/kitchen' },
  { icon: '👥', label: 'Staff Management', href: '/restaurant/staff' },
  { icon: '🤖', label: 'AI Business Tools', href: '/restaurant/assistant' },
  { icon: '⚙️', label: 'Settings', href: '/restaurant/settings' },
  { icon: '🎧', label: 'Help & Support', href: '/restaurant/support' },
];

const NOTIFICATIONS = [
  { id: 'n1', type: 'order', title: 'New Order Received', desc: 'Order #QB-1024 (₹549) needs confirmation', time: '2m ago', unread: true },
  { id: 'n2', type: 'rider', title: 'Delivery Partner Assigned', desc: 'Rider Ramesh K. is heading to restaurant', time: '10m ago', unread: true },
  { id: 'n3', type: 'review', title: 'New 5-Star Review', desc: 'Rahul S.: "Best Biryani in town!"', time: '1h ago', unread: false },
  { id: 'n4', type: 'settlement', title: 'Daily Payout Processed', desc: '₹14,250 transferred to HDFC bank account', time: '4h ago', unread: false },
];

function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: { icon: string; label: string; href: string };
  isActive: boolean;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={item.href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 12,
          padding: collapsed ? '10px 0' : '10px 14px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? '#FFFFFF' : '#171717',
          background: isActive ? '#4A0A10' : hovered ? '#F5EFE6' : 'transparent',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
          boxShadow: isActive ? '0 3px 10px rgba(74, 10, 16, 0.25)' : 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: 18,
            width: 24,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {item.icon}
        </span>
        {!collapsed && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
        )}
      </Link>

      {/* Tooltip on Desktop when Collapsed */}
      {collapsed && hovered && (
        <div
          style={{
            position: 'absolute',
            left: 'calc(100% + 14px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#1E1E1E',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
          <div
            style={{
              position: 'absolute',
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: 'transparent #1E1E1E transparent transparent',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [restaurantStatus, setRestaurantStatus] = useState<'OPEN' | 'PAUSED' | 'CLOSED'>('OPEN');
  const [pauseDuration, setPauseDuration] = useState<string | null>(null);
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState<number | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quickbites_restaurant_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('quickbites_restaurant_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Fetch restaurant details from Supabase
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await fetchRestaurantProfile('sharief-bhai');
        if (data) {
          setRestaurant(data);
          if (data.is_active === false) setRestaurantStatus('CLOSED');
        }
      } catch (err) {
        console.warn('Restaurant layout profile notice:', err);
      }
    };
    loadRestaurant();
  }, []);

  // Handle Pause Countdown Timer
  useEffect(() => {
    if (restaurantStatus !== 'PAUSED' || !pauseTimeRemaining) return;
    const timer = setInterval(() => {
      setPauseTimeRemaining(prev => {
        if (prev && prev > 1) return prev - 1;
        setRestaurantStatus('OPEN');
        setPauseDuration(null);
        return null;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [restaurantStatus, pauseTimeRemaining]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: 'OPEN' | 'PAUSED' | 'CLOSED', durationMins?: number) => {
    setRestaurantStatus(status);
    setStatusDropdownOpen(false);
    if (status === 'PAUSED' && durationMins) {
      setPauseDuration(`${durationMins}m`);
      setPauseTimeRemaining(durationMins * 60);
    } else if (status === 'PAUSED' && !durationMins) {
      setPauseDuration('Manual');
      setPauseTimeRemaining(null);
    } else {
      setPauseDuration(null);
      setPauseTimeRemaining(null);
    }
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStatusBadgeStyle = () => {
    if (restaurantStatus === 'OPEN') return { bg: '#E8F8F0', color: '#20A464', border: '#BBE9D1', text: '🟢 OPEN' };
    if (restaurantStatus === 'PAUSED') return { bg: '#FFF7E6', color: '#F5A623', border: '#FDDCA5', text: `⏸️ PAUSED${pauseTimeRemaining ? ` (${formatTimer(pauseTimeRemaining)})` : ''}` };
    return { bg: '#FEECEC', color: '#D64545', border: '#F9BABA', text: '🔴 CLOSED' };
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <OrderSoundAlertProvider>
      <div className="app-layout" data-theme="restaurant" style={{ background: '#FAF6EF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Floating Sound Alerts, Waiting Order Banner and Autoplay Unlock Banner */}
        <AudioUnlockBanner />
        <PendingOrderWaitingBanner />
        <NewOrderAlertModal />

        {/* ─── Desktop Collapsible Sidebar (240px expanded / 72px collapsed) ─── */}
      <aside
        className="sidebar hide-mobile"
        style={{
          width: sidebarCollapsed ? 72 : 240,
          background: '#FFFFFF',
          borderRight: '1px solid #EAE0D0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'visible',
        }}
      >
        {/* Brand Header & 3-Dot Toggle Button */}
        <div
          style={{
            padding: sidebarCollapsed ? '20px 8px 16px' : '20px 16px 16px',
            borderBottom: '1px solid #EAE0D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            transition: 'padding 250ms ease',
            height: 68,
            boxSizing: 'border-box',
          }}
        >
          {!sidebarCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: 10,
                    background: '#4A0A10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    color: '#FFB21A',
                    boxShadow: '0 2px 8px rgba(74, 10, 16, 0.2)',
                  }}
                >
                  🍽️
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10', letterSpacing: -0.3, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                    QUICKBITES
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6F6F6F', marginTop: 2, whiteSpace: 'nowrap' }}>
                    Restaurant Partner
                  </div>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                id="restaurant-sidebar-collapse-btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #EAE0D0',
                  background: '#FAF6EF',
                  color: '#4A0A10',
                  fontSize: 18,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  marginLeft: 6,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4A0A10'; (e.currentTarget as HTMLElement).style.color = '#FFB21A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; (e.currentTarget as HTMLElement).style.color = '#4A0A10'; }}
              >
                ⋮
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <button
                onClick={toggleSidebar}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                id="restaurant-sidebar-expand-btn"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid #EAE0D0',
                  background: '#FAF6EF',
                  color: '#4A0A10',
                  fontSize: 20,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4A0A10'; (e.currentTarget as HTMLElement).style.color = '#FFB21A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; (e.currentTarget as HTMLElement).style.color = '#4A0A10'; }}
              >
                ⋮
              </button>
            </div>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: sidebarCollapsed ? '16px 8px' : '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'padding 250ms ease',
          }}
        >
          {MAIN_NAV.map(item => {
            const isActive = item.href === '/restaurant'
              ? pathname === '/restaurant'
              : pathname.startsWith(item.href);
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            );
          })}

          <div
            style={{
              height: 1,
              background: '#EAE0D0',
              margin: sidebarCollapsed ? '10px 4px' : '12px 6px',
              transition: 'margin 250ms ease',
            }}
          />

          {/* Secondary Nav */}
          {SECONDARY_NAV.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div
          style={{
            padding: sidebarCollapsed ? '12px 8px' : '16px',
            borderTop: '1px solid #EAE0D0',
            background: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: sidebarCollapsed ? 'center' : 'stretch',
            transition: 'padding 250ms ease',
          }}
        >
          {/* Profile Section */}
          <div
            style={{ position: 'relative', width: sidebarCollapsed ? 'auto' : '100%' }}
            onMouseEnter={() => setProfileHovered(true)}
            onMouseLeave={() => setProfileHovered(false)}
          >
            <Link
              href="/restaurant/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                color: 'inherit',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '4px' : '0',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: '50%',
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {(restaurant?.name?.[0] || user?.profile?.firstName?.[0] || 'R').toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {restaurant?.name || 'QuickBite Bistro'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6F6F6F' }}>Partner ID: #REST-842</div>
                </div>
              )}
            </Link>

            {/* Profile Tooltip on Collapsed */}
            {sidebarCollapsed && profileHovered && (
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(100% + 14px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1E1E1E',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                {restaurant?.name || 'Restaurant Profile'}
                <div
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: '5px',
                    borderStyle: 'solid',
                    borderColor: 'transparent #1E1E1E transparent transparent',
                  }}
                />
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div
            style={{ position: 'relative', width: sidebarCollapsed ? 'auto' : '100%' }}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
          >
            <button
              onClick={logout}
              title={sidebarCollapsed ? 'Logout' : undefined}
              aria-label="Logout"
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '8px' : '9px 12px',
                borderRadius: 8,
                border: '1px solid #F3D2D2',
                background: '#FFF5F5',
                color: '#D64545',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE8E8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF5F5'; }}
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              {!sidebarCollapsed && <span>Logout</span>}
            </button>

            {/* Logout Tooltip on Collapsed */}
            {sidebarCollapsed && logoutHovered && (
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(100% + 14px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1E1E1E',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                }}
              >
                Logout
                <div
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: '5px',
                    borderStyle: 'solid',
                    borderColor: 'transparent #1E1E1E transparent transparent',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content Container ─── */}
      <div
        className="main-layout-wrapper"
        style={{
          marginLeft: sidebarCollapsed ? 72 : 240,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: '#FAF6EF',
          transition: 'margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ─── Top Header Bar (Desktop & Mobile) ─── */}
        <header
          className="restaurant-top-header"
          style={{
            height: 68,
            background: '#FFFFFF',
            borderBottom: '1px solid #EAE0D0',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* Left: Brand / Restaurant Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div className="show-mobile" style={{ display: 'none', flexShrink: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#4A0A10',
                  color: '#FFB21A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                🍽️
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="restaurant-header-title" style={{ fontSize: 16, fontWeight: 800, color: '#4A0A10', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant?.name || 'QuickBite Partner'}</span>
                <span className="hide-mobile" style={{ fontSize: 12, fontWeight: 500, color: '#6F6F6F' }}>· Bengaluru Store</span>
              </div>
            </div>
          </div>

          {/* Right: Status Dropdown, Notification Bell & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Interactive Status Pill */}
            <div style={{ position: 'relative' }} ref={statusMenuRef}>
              <button
                className="restaurant-status-btn"
                onClick={() => setStatusDropdownOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: `1px solid ${badgeStyle.border}`,
                  background: badgeStyle.bg,
                  color: badgeStyle.color,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minHeight: 34,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{badgeStyle.text}</span>
                <span style={{ fontSize: 9 }}>▼</span>
              </button>

              {/* Status Dropdown Menu */}
              {statusDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 260,
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #EAE0D0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    padding: '8px',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '8px 12px 6px', fontSize: 11, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Set Restaurant Status
                  </div>

                  {/* OPEN */}
                  <button
                    onClick={() => handleStatusChange('OPEN')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: restaurantStatus === 'OPEN' ? '#E8F8F0' : 'transparent',
                      color: '#20A464',
                      fontWeight: 700,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>🟢 Open & Accepting Orders</span>
                    {restaurantStatus === 'OPEN' && <span>✓</span>}
                  </button>

                  {/* PAUSED Options */}
                  <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid #F0E8DC' }}>
                    <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#F5A623' }}>
                      ⏸️ Pause Orders (Rush Hour)
                    </div>
                    {[
                      { label: 'Pause for 15 minutes', mins: 15 },
                      { label: 'Pause for 30 minutes', mins: 30 },
                      { label: 'Pause for 1 hour', mins: 60 },
                      { label: 'Pause until manually reopened', mins: 0 },
                    ].map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => handleStatusChange('PAUSED', opt.mins || undefined)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 24px',
                          borderRadius: 6,
                          border: 'none',
                          background: 'transparent',
                          color: '#171717',
                          fontSize: 12,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FFF7E6')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        ⏱️ {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* CLOSED */}
                  <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid #F0E8DC' }}>
                    <button
                      onClick={() => handleStatusChange('CLOSED')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: restaurantStatus === 'CLOSED' ? '#FEECEC' : 'transparent',
                        color: '#D64545',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>🔴 Close Restaurant</span>
                      {restaurantStatus === 'CLOSED' && <span>✓</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                aria-label="Notifications"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid #EAE0D0',
                  background: '#FFFFFF',
                  color: '#171717',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      background: '#D64545',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {notifOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 320,
                    maxWidth: '90vw',
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #EAE0D0',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.14)',
                    padding: '16px',
                    zIndex: 60,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>Notifications</div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotifsRead}
                        style={{ background: 'none', border: 'none', color: '#4A0A10', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          background: n.unread ? '#FAF0EB' : '#F8F8F8',
                          border: `1px solid ${n.unread ? '#F0D4CB' : '#EFEFEF'}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#171717' }}>{n.title}</span>
                          <span style={{ fontSize: 10, color: '#888' }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{n.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <Link
              href="/restaurant/profile"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#4A0A10',
                color: '#FFB21A',
                fontWeight: 800,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(74, 10, 16, 0.2)',
              }}
            >
              {(restaurant?.name?.[0] || 'R').toUpperCase()}
            </Link>
          </div>
        </header>

        {/* ─── Page Content Area ─── */}
        <main
          className="restaurant-main-content"
          style={{ flex: 1, padding: '24px', maxWidth: 1400, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}
        >
          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation (Visible on < 768px, exactly 5 equal-width items) ─── */}
      <nav
        className="restaurant-mobile-bottom-bar show-mobile"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: 66,
          background: '#FFFFFF',
          borderTop: '1px solid #EAE0D0',
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 auto',
            maxWidth: 480,
          }}
        >
          {RESTAURANT_BOTTOM_NAV.map(item => {
            const isActive = item.href === '/restaurant'
              ? pathname === '/restaurant'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#4A0A10' : '#6F6F6F',
                  padding: '4px 0',
                  boxSizing: 'border-box',
                  gap: 3,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#4A0A10' : '#6F6F6F',
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 800 : 600,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: isActive ? '#4A0A10' : '#6F6F6F',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Drawer Button (Exact 5th Navigation Item) */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            aria-label="More Menu"
            style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: '#6F6F6F',
              padding: '4px 0',
              boxSizing: 'border-box',
              gap: 3,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6F6F6F',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#6F6F6F',
              }}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile More Drawer Modal (Clean List with Chevrons) ─── */}
      {moreDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setMoreDrawerOpen(false)}
        >
          <div
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '20px 16px 36px',
              maxHeight: '82vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>QuickBite Partner</div>
                <div style={{ fontSize: 12, color: '#6F6F6F' }}>More Options & Settings</div>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                aria-label="Close"
                style={{ background: '#F0E8DC', border: 'none', width: 32, height: 32, borderRadius: 16, fontSize: 14, cursor: 'pointer', color: '#171717' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { icon: '🏪', label: 'Restaurant Profile', desc: 'Operating hours, banner, cuisine', href: '/restaurant/profile' },
                { icon: '⚙️', label: 'Settings', desc: 'Staff roles, notifications, sound', href: '/restaurant/settings' },
                { icon: '🎧', label: 'Help & Support', desc: '24/7 partner support & guides', href: '/restaurant/support' },
                { icon: '⭐', label: 'Customer Reviews', desc: 'Ratings & reply to reviews', href: '/restaurant/reviews' },
                { icon: '📈', label: 'Sales Analytics', desc: 'Revenue breakdown & metrics', href: '/restaurant/analytics' },
                { icon: '🍳', label: 'Kitchen Display (KDS)', desc: 'Full-screen kitchen order view', href: '/restaurant/kitchen' },
                { icon: '🎁', label: 'Offers & Coupons', desc: 'Discounts & promotions', href: '/restaurant/offers' },
                { icon: '👥', label: 'Staff Management', desc: 'Manage branch team access', href: '/restaurant/staff' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#FAF6EF',
                    border: '1px solid #EAE0D0',
                    color: '#171717',
                    textDecoration: 'none',
                    minHeight: 48,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#171717' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#6F6F6F' }}>{item.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#9E8E81', fontWeight: 800 }}>›</span>
                </Link>
              ))}
            </div>

            <button
              onClick={() => { setMoreDrawerOpen(false); logout(); }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                background: '#FEECEC',
                border: '1px solid #F9BABA',
                color: '#D64545',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>🚪</span>
              <span>Sign Out of Restaurant Partner</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Responsive Media Queries ─── */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
          .main-layout-wrapper {
            margin-left: 0 !important;
          }
          .restaurant-top-header {
            height: 60px !important;
            padding: 0 14px !important;
          }
          .restaurant-header-title {
            max-width: 140px !important;
            font-size: 14px !important;
          }
          .restaurant-main-content {
            padding: 14px 14px 96px !important;
          }
          .restaurant-status-btn {
            padding: 5px 10px !important;
            font-size: 11px !important;
            min-height: 32px !important;
          }
        }
      `}</style>
    </div>
  </OrderSoundAlertProvider>
);
}
