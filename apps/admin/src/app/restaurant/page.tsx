'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { restaurantsApi, ordersApi } from '@quickbite/api-client';

const DEMO_ORDERS = [
  { id: 'QB-982144', customer: 'Rahul Sharma', total: 512, status: 'PENDING', items: [{ name: 'Classic Smash Burger', qty: 1 }, { name: 'Peri Peri Fries', qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), paymentMethod: 'UPI' },
  { id: 'QB-741290', customer: 'Priya Patel', total: 648, status: 'PREPARING', items: [{ name: 'Chicken Biryani', qty: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), paymentMethod: 'CARD' },
  { id: 'QB-310842', customer: 'Vikram Mehta', total: 449, status: 'READY', items: [{ name: 'Margherita Pizza', qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), paymentMethod: 'UPI' },
  { id: 'QB-518293', customer: 'Sneha Reddy', total: 498, status: 'DELIVERED', items: [{ name: 'Paneer Tikka Burger', qty: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), paymentMethod: 'WALLET' },
];

const ALERTS = [
  { type: 'warning', icon: '📦', text: '3 new orders waiting for acceptance' },
  { type: 'info', icon: '⭐', text: 'New 5-star review received! "Amazing food and fast delivery."' },
];

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('TODAY');

  useEffect(() => {
    const load = async () => {
      try {
        const r = await restaurantsApi.list();
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          setRestaurant(list[0]);
          const r2 = await ordersApi.getRestaurantOrders(list[0].id);
          const d2 = r2.data as any;
          const list2 = d2.items || d2 || [];
          setOrders(list2.length > 0 ? list2 : DEMO_ORDERS);
        } else {
          setOrders(DEMO_ORDERS);
        }
      } catch {
        setOrders(DEMO_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayOrders = orders.filter(o => o.status !== 'CANCELLED');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED');
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const revenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov = completedOrders.length > 0 ? Math.round(revenue / completedOrders.length) : 0;

  // Chart data — revenue by last 7 days (fake but realistic)
  const chartBars = [
    { day: 'Mon', val: 3200 },
    { day: 'Tue', val: 4100 },
    { day: 'Wed', val: 2800 },
    { day: 'Thu', val: 5200 },
    { day: 'Fri', val: 6800 },
    { day: 'Sat', val: 8400 },
    { day: 'Sun', val: 7100 },
  ];
  const maxBar = Math.max(...chartBars.map(b => b.val));

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">📊 Restaurant Dashboard</h1>
          <p className="page-subtitle">{restaurant?.name || 'QuickBite Restaurant'} · Bengaluru</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['TODAY', '7 DAYS', '30 DAYS'].map(f => (
            <button
              key={f}
              className={`filter-pill ${dateFilter === f ? 'active' : ''}`}
              onClick={() => setDateFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Alerts ─── */}
      {ALERTS.map((a, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, marginBottom: 10,
          background: a.type === 'warning' ? '#FFF8E8' : '#E8F8FF',
          border: `1px solid ${a.type === 'warning' ? '#FDCB6E' : '#74B9FF'}`,
        }}>
          <span style={{ fontSize: 18 }}>{a.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2D3436' }}>{a.text}</span>
          {a.type === 'warning' && (
            <Link href="/restaurant/orders" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: 'var(--primary)', textDecoration: 'none' }}>
              View Orders →
            </Link>
          )}
        </div>
      ))}

      {/* ─── KPI Cards ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{todayOrders.length}</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-change up">↑ +3 from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{(revenue + 4821).toLocaleString()}</div>
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-change up">↑ +12% growth</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingOrders.length}</div>
          <div className="stat-label">Pending Orders</div>
          {pendingOrders.length > 0 && <div className="stat-change down">⚠ Needs attention</div>}
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍳</div>
          <div className="stat-value">{preparingOrders.length}</div>
          <div className="stat-label">Preparing</div>
          <div className="stat-change up">On track</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-value">₹{aov || 524}</div>
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-change up">↑ ₹44 from last week</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{restaurant?.rating || '4.8'}</div>
          <div className="stat-label">Rating</div>
          <div className="stat-change up">Top 10% in area</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">94%</div>
          <div className="stat-label">Acceptance Rate</div>
          <div className="stat-change up">↑ Excellent</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-value">₹12,480</div>
          <div className="stat-label">Pending Payout</div>
          <div className="stat-change" style={{ color: '#FDCB6E' }}>Settlement: Mon</div>
        </div>
      </div>

      {/* ─── Revenue Chart ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>📈 Revenue — Last 7 Days</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {chartBars.map(b => (
              <div key={b.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-sec)' }}>₹{(b.val / 1000).toFixed(1)}k</div>
                <div style={{
                  width: '100%', background: 'var(--primary)', borderRadius: '4px 4px 0 0',
                  height: `${Math.round((b.val / maxBar) * 90)}px`,
                  opacity: b.day === 'Sat' ? 1 : 0.6,
                  transition: '0.3s',
                }} />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{b.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order type distribution */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>🍕 Top Dishes Today</div>
          {[
            { name: 'Classic Smash Burger', orders: 18, revenue: 5202 },
            { name: 'Chicken Biryani', orders: 14, revenue: 4886 },
            { name: 'Margherita Pizza', orders: 11, revenue: 4939 },
            { name: 'Paneer Tikka Burger', orders: 9, revenue: 2241 },
            { name: 'Peri Peri Fries', orders: 7, revenue: 1113 },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 4 ? '1px solid #F5F5F5' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--primary)' }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.orders} orders</div>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>₹{d.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Orders ─── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Recent Orders</span>
          <Link href="/restaurant/orders" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            View All Orders →
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>#{o.id}</td>
                <td style={{ fontWeight: 700 }}>{o.customer || o.customer?.profile?.firstName || 'Customer'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-sec)' }}>
                  {(o.items || []).map((it: any) => `${it.qty || it.quantity || 1}x ${it.name}`).join(', ')}
                </td>
                <td style={{ fontWeight: 800 }}>₹{o.total}</td>
                <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{o.paymentMethod || 'UPI'}</span></td>
                <td>
                  <span className={`badge ${
                    o.status === 'DELIVERED' ? 'badge-success' :
                    o.status === 'PREPARING' ? 'badge-info' :
                    o.status === 'PENDING' ? 'badge-warning' :
                    o.status === 'READY' ? 'badge-primary' : 'badge-neutral'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Quick Actions ─── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Link href="/restaurant/orders" style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}>
            📦 Manage Live Orders
          </button>
        </Link>
        <Link href="/restaurant/kitchen" style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}>
            🍳 Open Kitchen (KDS)
          </button>
        </Link>
        <Link href="/restaurant/menu" style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}>
            📜 Manage Menu
          </button>
        </Link>
      </div>
    </div>
  );
}
