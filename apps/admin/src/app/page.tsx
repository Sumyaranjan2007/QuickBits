'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface RoleCard {
  role: string;
  title: string;
  badge: string;
  icon: string;
  desc: string;
  href: string;
  email: string;
  color: string;
  gradient: string;
  features: string[];
}

const ROLES: RoleCard[] = [
  {
    role: 'CUSTOMER',
    title: 'Customer Food App',
    badge: 'Food Discovery & Ordering',
    icon: '🍔',
    desc: 'Browse restaurants, explore cuisines, customize dishes, add to cart, and track live order status with real-time ETA.',
    href: '/customer',
    email: 'customer@quickbite.com',
    color: '#FF6B35',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
    features: ['Food & Cuisine Discovery', 'Live Order Tracking', 'Interactive Cart & Offers', 'Reviews & Ratings'],
  },
  {
    role: 'RESTAURANT',
    title: 'Restaurant Partner',
    badge: 'Merchant Operations & KDS',
    icon: '🍽️',
    desc: 'Manage live orders, Kitchen Display System (KDS) board, full menu CRUD, pricing, operational hours, analytics, and AI assistant.',
    href: '/restaurant',
    email: 'owner@quickbite.com',
    color: '#00B894',
    gradient: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
    features: ['Live Order Management', 'Kitchen KDS Kanban Board', 'Menu & Add-on Editor', 'Sales Analytics & AI Copilot'],
  },
  {
    role: 'DELIVERY',
    title: 'Delivery Fleet',
    badge: 'Partner App & Navigation',
    icon: '🛵',
    desc: 'On/Off duty toggle, 6-stage delivery workflow with OTP verification, earnings ledger, demand heatmap, incentives, and 24x7 SOS.',
    href: '/delivery',
    email: 'driver@quickbite.com',
    color: '#0984E3',
    gradient: 'linear-gradient(135deg, #0984E3 0%, #74B9FF 100%)',
    features: ['Online / Offline Duty Toggle', '6-Stage Trip Navigation', 'Demand Surge Heatmap', 'Earnings, Tips & SOS Safety'],
  },
  {
    role: 'ADMIN',
    title: 'Admin Operations',
    badge: 'Platform Control & Finance',
    icon: '👑',
    desc: 'Enterprise platform control: live dispatch map, GMV financial settlements, restaurant approvals, fraud audit, and fleet monitoring.',
    href: '/admin',
    email: 'admin@quickbite.com',
    color: '#6C5CE7',
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    features: ['Marketplace Executive Dashboard', 'Live Fleet Map & Dispatch', 'Financial Settlements & Payouts', 'Risk & Audit Engine'],
  },
];

export default function HomePage() {
  const router = useRouter();
  const { login, logout, user, token } = useAuth();
  const [loggingIn, setLoggingIn] = React.useState<string | null>(null);

  const handleQuickLogin = async (role: RoleCard) => {
    setLoggingIn(role.email);
    try {
      if (login) {
        await login(role.email, 'Password@123');
      }
      router.push(role.href);
    } catch {
      router.push(role.href);
    } finally {
      setLoggingIn(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0C2340 0%, #1A1A2E 100%)',
      color: '#fff',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* ─── Top Session & Logout Navigation Bar ─── */}
      <div style={{
        width: '100%',
        maxWidth: 1200,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: 32,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🍔</span>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>QuickBite Central</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 20 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#55EFC4' }} />
                <span>Logged in as: <strong>{user.email || user.name || 'User'}</strong></span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, background: '#6C5CE7', color: '#fff' }}>
                  {user.role || 'ACTIVE'}
                </span>
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'linear-gradient(135deg, #E17055 0%, #D63031 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(214, 48, 49, 0.3)'
                }}
              >
                🚪 Log Out
              </button>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              👤 Guest Session • Choose a portal below or use 1-Click Login
            </div>
          )}
        </div>
      </div>

      {/* ─── Top Brand Header ─── */}
      <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', padding: '8px 20px', borderRadius: 30, marginBottom: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#55EFC4', boxShadow: '0 0 10px #55EFC4' }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: '#E8F4FD' }}>
            Multi-Sided Food Delivery Platform Ecosystem
          </span>
        </div>

        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1, margin: '8px 0', background: 'linear-gradient(135deg, #fff 0%, #74B9FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to QuickBite
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
          Select any of the 4 independent portals below to experience the complete end-to-end food ordering, merchant preparation, driver delivery, and admin operations.
        </p>
      </div>

      {/* ─── 4 Portal Roles Grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        maxWidth: 1200,
        width: '100%',
        marginBottom: 40
      }}>
        {ROLES.map((r) => (
          <div
            key={r.role}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: r.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  boxShadow: `0 8px 20px ${r.color}40`
                }}>
                  {r.icon}
                </div>

                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)',
                  color: r.color,
                  border: `1px solid ${r.color}50`,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase'
                }}>
                  {r.badge}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                {r.title}
              </h2>

              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 18 }}>
                {r.desc}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {r.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ color: r.color, fontWeight: 900 }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href={r.href}
                style={{
                  background: r.gradient,
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '13px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: `0 4px 15px ${r.color}30`,
                  transition: 'opacity 0.2s ease'
                }}
              >
                Launch {r.title} ➔
              </Link>

              <button
                onClick={() => handleQuickLogin(r)}
                disabled={loggingIn === r.email}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '10px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {loggingIn === r.email ? 'Signing In...' : `⚡ 1-Click Login (${r.email.split('@')[0]})`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Bottom Status Info Footer ─── */}
      <div style={{
        maxWidth: 1200,
        width: '100%',
        padding: '20px 28px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>WEB APP STATUS</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#55EFC4', marginTop: 2 }}>🟢 Port 3001 Online</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>BACKEND REST API</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#74B9FF', marginTop: 2 }}>🟢 Port 3000 Connected</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>DATABASE ENGINE</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FDCB6E', marginTop: 2 }}>🟢 SQLite Seeded</div>
          </div>
        </div>

        <a
          href="http://localhost:3000/api/docs"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#74B9FF',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>📖</span> Open Swagger API Docs ➔
        </a>
      </div>
    </div>
  );
}
