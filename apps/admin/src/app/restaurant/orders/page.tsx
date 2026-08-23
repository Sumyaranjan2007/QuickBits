'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { restaurantsApi, ordersApi } from '@quickbite/api-client';

const DEMO_ORDERS = [
  { id: 'QB-982144', customer: 'Rahul Sharma', customerPhone: '+91 99999 99992', total: 512, status: 'PENDING', type: 'DELIVERY', paymentMethod: 'UPI', paymentStatus: 'PAID', specialInstructions: 'No onions please', items: [{ name: 'Classic Smash Cheeseburger', price: 289, qty: 1, addons: ['Extra Cheese +₹30'] }, { name: 'Peri Peri Loaded Fries', price: 159, qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  { id: 'QB-741290', customer: 'Priya Patel', customerPhone: '+91 99999 88881', total: 648, status: 'PENDING', type: 'DELIVERY', paymentMethod: 'CARD', paymentStatus: 'PAID', specialInstructions: '', items: [{ name: 'Hyderabadi Chicken Dum Biryani', price: 349, qty: 1 }, { name: 'Paneer Tikka Biryani', price: 299, qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
  { id: 'QB-310842', customer: 'Vikram Mehta', customerPhone: '+91 99999 77773', total: 449, status: 'PREPARING', type: 'PICKUP', paymentMethod: 'UPI', paymentStatus: 'PAID', specialInstructions: 'Extra spicy', items: [{ name: 'Margherita Burrata Pizza', price: 449, qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
  { id: 'QB-518293', customer: 'Sneha Reddy', customerPhone: '+91 99999 66664', total: 498, status: 'READY', type: 'DELIVERY', paymentMethod: 'WALLET', paymentStatus: 'PAID', specialInstructions: '', items: [{ name: 'Crispy Paneer Truffle Burger', price: 249, qty: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
  { id: 'QB-881023', customer: 'Arjun Nair', customerPhone: '+91 99999 55556', total: 780, status: 'DELIVERED', type: 'DELIVERY', paymentMethod: 'UPI', paymentStatus: 'PAID', specialInstructions: '', items: [{ name: 'BBQ Chicken Pizza', price: 520, qty: 1 }, { name: 'Garlic Bread', price: 120, qty: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: 'QB-662011', customer: 'Rohan Singh', customerPhone: '+91 99999 44445', total: 320, status: 'CANCELLED', type: 'DELIVERY', paymentMethod: 'COD', paymentStatus: 'PENDING', specialInstructions: '', items: [{ name: 'Veg Supreme Burger', price: 199, qty: 1 }, { name: 'Cola', price: 79, qty: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString() },
];

const REJECTION_REASONS = [
  'Restaurant too busy',
  'Item unavailable',
  'Kitchen issue',
  'Closing soon',
  'Technical problem',
  'Other',
];

const TABS = ['ALL', 'PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function OrderTimer({ createdAt, status }: { createdAt: string; status: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isAtRisk = mins >= 20 && mins < 30;
  const isDelayed = mins >= 30;
  const color = isDelayed ? '#E17055' : isAtRisk ? '#FDCB6E' : '#00B894';
  const label = isDelayed ? 'DELAYED' : isAtRisk ? 'AT RISK' : 'ON TIME';

  if (!['PENDING', 'PREPARING', 'READY'].includes(status)) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, background: color + '20', color }}>{label}</span>
    </div>
  );
}

export default function RestaurantOrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [inspectOrder, setInspectOrder] = useState<any>(null);
  const prevPendingCount = useRef(0);

  const fetchOrders = useCallback(async (restId: string) => {
    try {
      const r = await ordersApi.getRestaurantOrders(restId);
      const d = r.data as any;
      const list = d.items || d || [];
      const merged = list.length > 0 ? list : DEMO_ORDERS;
      const newPending = merged.filter((o: any) => o.status === 'PENDING').length;
      if (newPending > prevPendingCount.current && prevPendingCount.current !== 0) {
        // Flash the page title to alert
        document.title = `🔔 NEW ORDER! — QuickBite Restaurant`;
        setTimeout(() => { document.title = 'QuickBite Restaurant'; }, 3000);
      }
      prevPendingCount.current = newPending;
      setOrders(merged);
    } catch {
      setOrders(DEMO_ORDERS);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await restaurantsApi.list();
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          setRestaurantId(list[0].id);
          await fetchOrders(list[0].id);
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
  }, [fetchOrders]);

  // Poll every 8 seconds
  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => fetchOrders(restaurantId), 8000);
    return () => clearInterval(interval);
  }, [restaurantId, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
    } catch {}
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (inspectOrder?.id === orderId) setInspectOrder((prev: any) => ({ ...prev, status: newStatus }));
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await ordersApi.updateStatus(rejectModal.id, 'CANCELLED');
    } catch {}
    setOrders(prev => prev.map(o => o.id === rejectModal.id ? { ...o, status: 'CANCELLED', rejectReason } : o));
    setRejectModal(null);
    setRejectReason('');
  };

  const filtered = orders.filter(o => activeTab === 'ALL' || o.status === activeTab);
  const tabCounts: Record<string, number> = {};
  TABS.forEach(t => { tabCounts[t] = t === 'ALL' ? orders.length : orders.filter(o => o.status === t).length; });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">📦 Live Order Management</h1>
          <p className="page-subtitle">Real-time orders · Auto-refreshes every 8 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '2px solid var(--border)', marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontWeight: 700, fontSize: 13, transition: '0.2s',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
              marginBottom: -2,
            }}
          >
            {tab} {tabCounts[tab] > 0 && (
              <span style={{
                marginLeft: 4, padding: '1px 6px', borderRadius: 10, fontSize: 11, fontWeight: 800,
                background: tab === 'PENDING' && tabCounts[tab] > 0 ? '#E17055' : 'var(--border)',
                color: tab === 'PENDING' && tabCounts[tab] > 0 ? '#fff' : 'var(--text-sec)',
              }}>
                {tabCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Order Cards Grid ─── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No orders in this category</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(order => (
            <div key={order.id} style={{
              background: '#fff', borderRadius: 16, border: `2px solid ${order.status === 'PENDING' ? '#FDCB6E' : 'var(--border)'}`,
              boxShadow: order.status === 'PENDING' ? '0 0 0 3px #FDCB6E30' : 'var(--shadow-sm)',
              overflow: 'hidden', transition: '0.2s',
            }}>
              {/* Card Header */}
              <div style={{ padding: '12px 16px', background: order.status === 'PENDING' ? '#FFFBF0' : 'var(--surface-hover)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--primary)' }}>#{order.id}</span>
                  <span className={`badge ${order.type === 'PICKUP' ? 'badge-info' : 'badge-primary'}`} style={{ fontSize: 9 }}>
                    {order.type === 'PICKUP' ? '🏃 PICKUP' : '🛵 DELIVERY'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <OrderTimer createdAt={order.createdAt} status={order.status} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(order.createdAt)}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text)' }}>₹{order.total}</div>
                    <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: 'var(--surface-hover)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                  {(order.items || []).map((item: any, i: number) => (
                    <div key={i} style={{ fontSize: 13, padding: '3px 0', display: 'flex', justifyContent: 'space-between', borderBottom: i < order.items.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{item.qty || item.quantity || 1}x </span>
                        {item.name}
                        {item.addons?.length > 0 && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 14 }}>{item.addons.join(', ')}</div>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-sec)' }}>₹{item.price}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div style={{ background: '#FFF8E8', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#856404' }}>
                    📝 {order.specialInstructions}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {order.status === 'PENDING' && (<>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 800 }}
                      onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10, fontSize: 14 }}
                      onClick={() => setRejectModal(order)}
                    >
                      ✕ Reject
                    </button>
                  </>)}
                  {(order.status === 'ACCEPTED') && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10 }}
                      onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                    >
                      🍳 Mark Preparing
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10 }}
                      onClick={() => handleStatusUpdate(order.id, 'READY')}
                    >
                      ✅ Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', borderRadius: 10 }}
                      onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    >
                      🚀 Mark Delivered
                    </button>
                  )}
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setInspectOrder(order)}
                    style={{ padding: '10px 12px', borderRadius: 10 }}
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Rejection Modal ─── */}
      {rejectModal && (
        <div className="modal-backdrop" onClick={() => setRejectModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 900, marginBottom: 6 }}>Reject Order #{rejectModal.id}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 16 }}>Please select a reason for rejection. This will be logged.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {REJECTION_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRejectReason(r)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, border: `2px solid ${rejectReason === r ? '#E17055' : 'var(--border)'}`,
                    background: rejectReason === r ? '#FFF0EE' : '#fff', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left', transition: '0.15s',
                  }}
                >
                  {rejectReason === r ? '● ' : '○ '}{r}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                disabled={!rejectReason}
                onClick={handleReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Order Inspector Modal ─── */}
      {inspectOrder && (
        <div className="modal-backdrop" onClick={() => setInspectOrder(null)}>
          <div className="modal-sheet" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 900 }}>Order #{inspectOrder.id}</h3>
              <button onClick={() => setInspectOrder(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`badge ${inspectOrder.status === 'DELIVERED' ? 'badge-success' : inspectOrder.status === 'PENDING' ? 'badge-warning' : 'badge-info'}`}>
                  {inspectOrder.status}
                </span>
                <span className="badge badge-neutral">{inspectOrder.paymentMethod}</span>
                <span className={`badge ${inspectOrder.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                  {inspectOrder.paymentStatus}
                </span>
              </div>
              <div><strong>Customer:</strong> {inspectOrder.customer} · {inspectOrder.customerPhone}</div>
              {inspectOrder.specialInstructions && <div style={{ background: '#FFF8E8', padding: 10, borderRadius: 8 }}><strong>Instructions:</strong> {inspectOrder.specialInstructions}</div>}
              <div>
                <strong>Items Ordered:</strong>
                {(inspectOrder.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span>{item.qty || 1}x {item.name}</span>
                    <span style={{ fontWeight: 700 }}>₹{item.price}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 900, fontSize: 15 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{inspectOrder.total}</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Print Receipt</button>
              {inspectOrder.status === 'PENDING' && <button className="btn btn-primary btn-sm" onClick={() => { handleStatusUpdate(inspectOrder.id, 'ACCEPTED'); setInspectOrder(null); }}>✓ Accept Order</button>}
              {inspectOrder.status === 'PREPARING' && <button className="btn btn-primary btn-sm" onClick={() => { handleStatusUpdate(inspectOrder.id, 'READY'); setInspectOrder(null); }}>✅ Mark Ready</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
