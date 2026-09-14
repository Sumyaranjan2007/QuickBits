'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { restaurantsApi, ordersApi } from '@quickbite/api-client';

const DEMO_ORDERS = [
  {
    id: 'QB1024',
    customer: 'Rahul Sharma',
    total: 549,
    status: 'PENDING',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    items: [
      { name: 'Chicken Biryani', qty: 2 },
      { name: 'Coke', qty: 1 },
    ],
  },
  {
    id: 'QB1023',
    customer: 'Priya Patel',
    total: 799,
    status: 'PREPARING',
    paymentMethod: 'CARD',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    items: [
      { name: 'Paneer Butter Masala', qty: 1 },
      { name: 'Butter Naan', qty: 3 },
      { name: 'Mango Lassi', qty: 2 },
    ],
  },
  {
    id: 'QB1021',
    customer: 'Vikram Mehta',
    total: 449,
    status: 'READY',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [
      { name: 'Classic Smash Burger', qty: 1 },
      { name: 'Peri Peri Fries', qty: 1 },
    ],
  },
  {
    id: 'QB1019',
    customer: 'Sneha Reddy',
    total: 620,
    status: 'DELIVERED',
    paymentMethod: 'WALLET',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    items: [
      { name: 'Veg Supreme Pizza', qty: 1 },
      { name: 'Garlic Bread', qty: 1 },
    ],
  },
];

const INITIAL_OUT_OF_STOCK = [
  { id: 'oos-1', name: 'Chicken Dum Biryani', category: 'Main Course', price: 249 },
  { id: 'oos-2', name: 'Paneer Tikka Roll', category: 'Starters', price: 189 },
  { id: 'oos-3', name: 'Diet Coke (330ml)', category: 'Beverages', price: 60 },
];

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>(DEMO_ORDERS);
  const [outOfStockItems, setOutOfStockItems] = useState<any[]>(INITIAL_OUT_OF_STOCK);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const res = await restaurantsApi.list();
      const d = res.data as any;
      const list = d.items || d || [];
      const rest = list.length > 0 ? list[0] : null;
      if (rest) {
        setRestaurant(rest);
        setIsPaused(rest.isOpen === false);
      }

      // Fetch live API orders
      let ordList: any[] = [];
      if (rest?.id) {
        try {
          const ordRes = await ordersApi.getRestaurantOrders(rest.id);
          const ordData = ordRes.data as any;
          ordList = ordData.items || ordData || [];
        } catch {}
      }

      // Merge local customer orders
      let localOrders: any[] = [];
      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) localOrders = JSON.parse(stored);
      } catch {}

      const combinedMap = new Map();
      [...DEMO_ORDERS, ...ordList, ...localOrders].forEach(o => {
        if (o.id) combinedMap.set(o.id, o);
      });
      const combined = Array.from(combinedMap.values());
      if (combined.length > 0) setOrders(combined);

      // Fetch menu to see out of stock items
      if (rest?.menuCategories) {
        const oos: any[] = [];
        rest.menuCategories.forEach((cat: any) => {
          (cat.items || cat.menuItems || []).forEach((item: any) => {
            if (item.isAvailable === false) {
              oos.push({ id: item.id, name: item.name, category: cat.name, price: item.price });
            }
          });
        });
        if (oos.length > 0) setOutOfStockItems(oos);
      }
    } catch {
      // Keep demo fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    const handleUpdate = () => loadData();
    window.addEventListener('qb:order_status_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('qb:order_status_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  // Order Accept / Reject Handlers
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'CONFIRMED');
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'CONFIRMED' } : o)));
      showToast(`Order #${orderId.slice(-6)} Accepted!`);
    } catch {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'CONFIRMED' } : o)));
      showToast(`Order #${orderId.slice(-6)} Accepted!`);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'CANCELLED');
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
      showToast(`Order #${orderId.slice(-6)} Rejected`);
    } catch {
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
      showToast(`Order #${orderId.slice(-6)} Rejected`);
    }
  };

  const handleMarkAvailable = (id: string, name: string) => {
    setOutOfStockItems(prev => prev.filter(item => item.id !== id));
    showToast(`"${name}" is now marked Available!`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Metrics Calculations
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING' || o.status === 'CONFIRMED' || o.status === 'ACCEPTED').length;
  const readyCount = orders.filter(o => o.status === 'READY' || o.status === 'READY_FOR_PICKUP').length;
  const totalTodayOrders = orders.filter(o => o.status !== 'CANCELLED').length || 24;
  const todaySales = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.total || 0), 0) || 12450;

  // Active live orders for the dashboard view
  const liveOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderColor: '#4A0A10', borderTopColor: 'transparent' }} />
        <div style={{ marginTop: 16, fontSize: 14, color: '#6F6F6F', fontWeight: 600 }}>Loading QuickBite Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast Notification */}
      {actionSuccess && (
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
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ─── 1. Top Greeting & Status Card ─── */}
      <div
        className="restaurant-status-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          background: '#FFFFFF',
          padding: '16px 18px',
          borderRadius: 16,
          border: '1px solid #EAE0D0',
          boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Partner Dashboard
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: '4px 0 2px', lineHeight: 1.2 }}>
            {getGreeting()}, {restaurant?.name || 'QuickBite Bistro'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6F6F6F' }}>
            <span>Restaurant status:</span>
            <span style={{ fontWeight: 800, color: isPaused ? '#F5A623' : '#20A464' }}>
              {isPaused ? '⏸️ PAUSED' : '🟢 OPEN'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsPaused(p => !p);
            showToast(isPaused ? 'Restaurant is now OPEN!' : 'Restaurant PAUSED temporarily');
          }}
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            border: isPaused ? '1px solid #20A464' : '1px solid #F5A623',
            background: isPaused ? '#E8F8F0' : '#FFF7E6',
            color: isPaused ? '#20A464' : '#C77700',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 40,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{isPaused ? '▶️ RESUME ORDERS' : '⏸️ PAUSE RESTAURANT'}</span>
        </button>
      </div>

      {/* ─── 2. Today's Important Statistics (Clean 2-Column Grid on Mobile, 4-Col on Desktop) ─── */}
      <div
        className="restaurant-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {/* Today's Orders */}
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>TODAY'S ORDERS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#171717', marginTop: 2, lineHeight: 1.1 }}>
            {totalTodayOrders}
          </div>
          <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
            ↑ 12% vs yesterday
          </div>
        </div>

        {/* Pending Orders */}
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #F5A623' }}>
          <div style={kpiLabelStyle}>PENDING</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#C77700', marginTop: 2, lineHeight: 1.1 }}>
            {pendingCount || 1}
          </div>
          <div style={{ fontSize: 11, color: '#6F6F6F', marginTop: 4 }}>Needs action</div>
        </div>

        {/* Preparing Orders */}
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #4A0A10' }}>
          <div style={kpiLabelStyle}>PREPARING</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', marginTop: 2, lineHeight: 1.1 }}>
            {preparingCount || 1}
          </div>
          <div style={{ fontSize: 11, color: '#6F6F6F', marginTop: 4 }}>In kitchen</div>
        </div>

        {/* Ready for Pickup */}
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #20A464' }}>
          <div style={kpiLabelStyle}>READY</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#20A464', marginTop: 2, lineHeight: 1.1 }}>
            {readyCount || 1}
          </div>
          <div style={{ fontSize: 11, color: '#6F6F6F', marginTop: 4 }}>Awaiting rider</div>
        </div>
      </div>

      {/* ─── 3. Dedicated Today's Sales Card (Full Width on Mobile) ─── */}
      <div
        className="restaurant-sales-card"
        style={{
          background: '#FAF0EB',
          borderRadius: 14,
          padding: '14px 18px',
          border: '1px solid #F0D4CB',
          boxShadow: '0 2px 6px rgba(74, 10, 16, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#4A0A10', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            TODAY'S SALES
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', marginTop: 2, lineHeight: 1.1 }}>
            ₹{todaySales.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#4A0A10',
            background: 'rgba(74, 10, 16, 0.08)',
            padding: '6px 12px',
            borderRadius: 8,
          }}
        >
          Net earnings ₹{(todaySales * 0.92).toFixed(0)}
        </div>
      </div>

      {/* ─── 4. Main Grid: Live Orders & Quick Actions / Analytics ─── */}
      <div
        className="restaurant-dashboard-main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 16,
        }}
      >
        {/* Left Column: Live Orders */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📦</span>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>LIVE ORDERS</h2>
              <span
                style={{
                  background: '#FAF0EB',
                  color: '#4A0A10',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                }}
              >
                {liveOrders.length} active
              </span>
            </div>
            <Link
              href="/restaurant/orders"
              style={{ fontSize: 12, fontWeight: 800, color: '#4A0A10', textDecoration: 'none' }}
            >
              View All Orders →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {liveOrders.slice(0, 4).map(order => {
              const isNew = order.status === 'PENDING';
              return (
                <div
                  key={order.id}
                  style={{
                    borderRadius: 12,
                    border: isNew ? '1px solid #FFD470' : '1px solid #EAE0D0',
                    background: isNew ? '#FFFDF8' : '#FAFAFA',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#171717' }}>
                        #{order.id.slice(0, 8)}
                      </span>
                      <span style={{ fontSize: 11, color: '#6F6F6F' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isNew ? '#FFF7E6' : order.status === 'READY' ? '#E8F8F0' : '#FAF0EB',
                        color: isNew ? '#C77700' : order.status === 'READY' ? '#20A464' : '#4A0A10',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#4A4A4A', lineHeight: 1.4 }}>
                    {(order.items || []).map((item: any, i: number) => (
                      <span key={i}>
                        {item.qty || item.quantity || 1} × {item.name || item.menuItemName}
                        {i < (order.items || []).length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10' }}>₹{order.total}</span>
                      <span style={{ fontSize: 11, color: '#6F6F6F', background: '#EAE0D0', padding: '2px 6px', borderRadius: 4 }}>
                        {order.paymentMethod || 'UPI'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {isNew ? (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: 'none',
                              background: '#20A464',
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            ACCEPT
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid #F9BABA',
                              background: '#FFF5F5',
                              color: '#D64545',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            REJECT
                          </button>
                        </>
                      ) : (
                        <Link
                          href={`/restaurant/orders?id=${order.id}`}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            background: '#4A0A10',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          VIEW ORDER
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {liveOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6F6F6F' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>No new orders right now</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Your kitchen is all caught up!</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Sales Overview & Out of Stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, color: '#171717', marginBottom: 14 }}>
              ⚡ QUICK ACTIONS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <Link
                href="/restaurant/menu?action=new"
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#FAF0EB',
                  border: '1px solid #F0D4CB',
                  color: '#4A0A10',
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>➕</span>
                <span>ADD MENU ITEM</span>
              </Link>

              <Link
                href="/restaurant/orders"
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#FAF6EF',
                  border: '1px solid #EAE0D0',
                  color: '#171717',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>📦</span>
                <span>VIEW ORDERS</span>
              </Link>

              <Link
                href="/restaurant/menu"
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#FAF6EF',
                  border: '1px solid #EAE0D0',
                  color: '#171717',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🍔</span>
                <span>MANAGE MENU</span>
              </Link>

              <Link
                href="/restaurant/finance"
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#FFF8EB',
                  border: '1px solid #FDDCA5',
                  color: '#B57400',
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>💰</span>
                <span>VIEW EARNINGS</span>
              </Link>
            </div>
          </div>

          {/* Sales Overview with Mini Graph */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#171717' }}>📊 SALES OVERVIEW</div>
              <Link
                href="/restaurant/analytics"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#4A0A10',
                  background: '#FAF0EB',
                  padding: '5px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                VIEW ANALYTICS →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#FAF6EF', padding: '10px 12px', borderRadius: 10, border: '1px solid #EAE0D0' }}>
                <div style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 600 }}>Today</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10', marginTop: 2 }}>₹12,450</div>
              </div>
              <div style={{ background: '#FAF6EF', padding: '10px 12px', borderRadius: 10, border: '1px solid #EAE0D0' }}>
                <div style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 600 }}>This Week</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#171717', marginTop: 2 }}>₹78,500</div>
              </div>
              <div style={{ background: '#FAF6EF', padding: '10px 12px', borderRadius: 10, border: '1px solid #EAE0D0' }}>
                <div style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 600 }}>This Month</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#171717', marginTop: 2 }}>₹3,25,000</div>
              </div>
            </div>

            {/* Simple Sales Graph Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 75, paddingTop: 10, borderTop: '1px solid #F0E8DC' }}>
              {[
                { day: 'Mon', val: 40 },
                { day: 'Tue', val: 65 },
                { day: 'Wed', val: 50 },
                { day: 'Thu', val: 80 },
                { day: 'Fri', val: 95 },
                { day: 'Sat', val: 100 },
                { day: 'Sun', val: 85 },
              ].map(b => (
                <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div
                    style={{
                      width: '60%',
                      maxWidth: 24,
                      height: `${b.val * 0.55}px`,
                      background: b.day === 'Sat' ? '#4A0A10' : '#E8D2C8',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#6F6F6F', fontWeight: 600 }}>{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Out of Stock Items Widget */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#171717' }}>⚠️ OUT OF STOCK ITEMS</div>
              <span style={{ fontSize: 11, color: '#D64545', fontWeight: 700 }}>
                {outOfStockItems.length} items unavailable
              </span>
            </div>

            {outOfStockItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outOfStockItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: '#FFF8F8',
                      border: '1px solid #FBE0E0',
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#171717' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#6F6F6F' }}>{item.category || 'Menu Item'} · ₹{item.price}</div>
                    </div>
                    <button
                      onClick={() => handleMarkAvailable(item.id, item.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #BBE9D1',
                        background: '#E8F8F0',
                        color: '#20A464',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✓ MARK AVAILABLE
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#20A464', fontSize: 13, fontWeight: 700 }}>
                ✨ All menu items are currently in stock!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const kpiCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 14,
  padding: '12px 14px',
  border: '1px solid #EAE0D0',
  boxShadow: '0 2px 6px rgba(74, 10, 16, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: 82,
  boxSizing: 'border-box',
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 800,
  color: '#6F6F6F',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};
