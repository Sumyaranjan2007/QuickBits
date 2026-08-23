'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { restaurantsApi, ordersApi } from '@quickbite/api-client';

const DEMO_ORDERS = [
  { id: 'QB-982144', status: 'PENDING', items: [{ name: 'Classic Smash Cheeseburger', qty: 1, addons: ['Extra Cheese'] }, { name: 'Peri Peri Fries', qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), priority: 'NORMAL' },
  { id: 'QB-741290', status: 'ACCEPTED', items: [{ name: 'Hyderabadi Chicken Dum Biryani', qty: 1 }, { name: 'Paneer Tikka Biryani', qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(), priority: 'NORMAL' },
  { id: 'QB-310842', status: 'PREPARING', items: [{ name: 'Margherita Burrata Pizza', qty: 1, instructions: 'Extra spicy' }], createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), priority: 'HIGH' },
  { id: 'QB-518293', status: 'READY', items: [{ name: 'Crispy Paneer Truffle Burger', qty: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), priority: 'NORMAL' },
];

const KDS_COLUMNS = [
  { key: 'PENDING', label: '🆕 New', color: '#E17055', bg: '#FFF4F2' },
  { key: 'ACCEPTED', label: '✓ Accepted', color: '#F39C12', bg: '#FFF8E8' },
  { key: 'PREPARING', label: '🍳 Preparing', color: '#0984E3', bg: '#EAF5FF' },
  { key: 'READY', label: '✅ Ready', color: '#00B894', bg: '#E8FFF8' },
];

function KDSTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)), 1000);
    return () => clearInterval(t);
  }, [createdAt]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isAtRisk = mins >= 20 && mins < 30;
  const isDelayed = mins >= 30;
  const color = isDelayed ? '#E17055' : isAtRisk ? '#F39C12' : '#00B894';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color, padding: '2px 6px', borderRadius: 4, background: color + '18' }}>
        {isDelayed ? '⚠ DELAYED' : isAtRisk ? '⚡ AT RISK' : '✓ ON TIME'}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newFlash, setNewFlash] = useState(false);
  const prevCount = useRef(0);

  const fetchOrders = useCallback(async (restId: string) => {
    try {
      const r = await ordersApi.getRestaurantOrders(restId);
      const d = r.data as any;
      const list = d.items || d || [];
      const merged = list.length > 0 ? list : DEMO_ORDERS;
      const newPending = merged.filter((o: any) => o.status === 'PENDING').length;
      if (newPending > prevCount.current && prevCount.current !== 0) {
        setNewFlash(true);
        setTimeout(() => setNewFlash(false), 1500);
      }
      prevCount.current = newPending;
      setOrders(merged);
    } catch {
      setOrders(DEMO_ORDERS);
    }
  }, []);

  useEffect(() => {
    restaurantsApi.list()
      .then(async r => {
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          setRestaurantId(list[0].id);
          await fetchOrders(list[0].id);
        } else {
          setOrders(DEMO_ORDERS);
        }
      })
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false));
  }, [fetchOrders]);

  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => fetchOrders(restaurantId), 6000);
    return () => clearInterval(interval);
  }, [restaurantId, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try { await ordersApi.updateStatus(orderId, newStatus); } catch {}
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div style={{ background: newFlash ? '#FFF0E0' : 'transparent', transition: '0.3s' }}>
      {/* ─── KDS Header ─── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">🍳 Kitchen Display System</h1>
          <p className="page-subtitle">Real-time order pipeline · Auto-refreshes every 6 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#E8FFF8', border: '1px solid #00B894' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00B894' }}>KITCHEN LIVE</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={toggleFullscreen}
            style={{ borderRadius: 8 }}
          >
            {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* ─── KDS Kanban Board ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minHeight: 600 }}>
        {KDS_COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key);
          return (
            <div key={col.key} style={{
              background: col.bg, borderRadius: 16, border: `2px solid ${col.color}30`,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
              {/* Column Header */}
              <div style={{
                padding: '14px 16px', background: col.color, color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{col.label}</span>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 900,
                }}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                {colOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', color: col.color, opacity: 0.5, padding: 30, fontSize: 13, fontWeight: 600 }}>
                    No orders
                  </div>
                ) : (
                  colOrders.map(order => (
                    <div key={order.id} style={{
                      background: '#fff', borderRadius: 12, padding: 16,
                      border: `1px solid ${col.color}30`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${col.color}25` }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: col.color }}>#{order.id?.slice(-6)}</div>
                          {order.priority === 'HIGH' && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#E17055', background: '#FFF0EE', padding: '1px 6px', borderRadius: 4 }}>⚡ PRIORITY</span>
                          )}
                        </div>
                        <KDSTimer createdAt={order.createdAt} />
                      </div>

                      {/* Items */}
                      <div style={{ marginBottom: 14 }}>
                        {(order.items || []).map((item: any, i: number) => (
                          <div key={i} style={{ padding: '6px 0', borderBottom: i < order.items.length - 1 ? '1px dashed #EEE' : 'none' }}>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>
                              <span style={{ color: col.color }}>{item.qty || item.quantity || 1}×</span> {item.name}
                            </div>
                            {item.addons?.length > 0 && (
                              <div style={{ fontSize: 11, color: '#636E8A', marginLeft: 20 }}>+ {item.addons.join(', ')}</div>
                            )}
                            {item.instructions && (
                              <div style={{ fontSize: 11, color: '#856404', background: '#FFF8E8', borderRadius: 4, padding: '3px 6px', marginTop: 3, marginLeft: 20 }}>
                                📝 {item.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* KDS Action Buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {order.status === 'PENDING' && (
                          <button
                            style={{ flex: 1, padding: '10px', background: col.color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                            onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                          >
                            ✓ Accept
                          </button>
                        )}
                        {order.status === 'ACCEPTED' && (
                          <button
                            style={{ flex: 1, padding: '10px', background: col.color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                          >
                            🍳 Start Cooking
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            style={{ flex: 1, padding: '10px', background: col.color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                          >
                            ✅ Mark Ready
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button
                            style={{ flex: 1, padding: '10px', background: '#00B894', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                            onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          >
                            🚀 Complete
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          style={{ padding: '10px 12px', background: '#F5F5F5', color: '#636E8A', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                          title="Print ticket"
                        >
                          🖨️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
