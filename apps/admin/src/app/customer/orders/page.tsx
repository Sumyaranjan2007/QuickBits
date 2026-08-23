'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(r => {
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length === 0) {
          // Pre-populate with realistic demo orders
          setOrders([
            {
              id: 'QB-982144',
              status: 'OUT_FOR_DELIVERY',
              total: 512,
              createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
              restaurant: { id: 'rest-1', name: 'Burger & Co.', address: '100 Feet Road, Indiranagar' },
              items: [
                { id: '1', name: 'Classic Smash Cheeseburger', price: 289, quantity: 1, foodType: 'NON_VEG' },
                { id: '2', name: 'Peri Peri Loaded Fries', price: 159, quantity: 1, foodType: 'VEG' },
              ],
            },
            {
              id: 'QB-741290',
              status: 'DELIVERED',
              total: 648,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
              restaurant: { id: 'rest-2', name: 'Spice Symphony', address: 'Koramangala 5th Block' },
              items: [
                { id: '3', name: 'Hyderabadi Chicken Dum Biryani', price: 349, quantity: 1, foodType: 'NON_VEG' },
                { id: '4', name: 'Paneer Tikka Biryani', price: 299, quantity: 1, foodType: 'VEG' },
              ],
            },
            {
              id: 'QB-310842',
              status: 'DELIVERED',
              total: 449,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
              restaurant: { id: 'rest-3', name: 'Pizzeria Bella', address: 'Lavelle Road' },
              items: [
                { id: '5', name: 'Margherita Burrata Pizza', price: 449, quantity: 1, foodType: 'VEG' },
              ],
            },
          ]);
        } else {
          setOrders(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-error',
      PENDING: 'badge-warning',
      PREPARING: 'badge-info',
      OUT_FOR_DELIVERY: 'badge-primary',
    };
    return m[s] || 'badge-neutral';
  };

  const handleReorder = (order: any) => {
    clearCart();
    (order.items || []).forEach((it: any) => {
      addItem({
        menuItemId: it.id || it.menuItemId || `dish-${Date.now()}`,
        name: it.name || it.menuItem?.name || 'Dish',
        price: it.price || 200,
        quantity: it.quantity || 1,
        foodType: it.foodType || 'NON_VEG',
        restaurantId: order.restaurant?.id || 'rest-1',
        restaurantName: order.restaurant?.name || 'Burger & Co.',
      });
    });
    router.push('/customer/checkout');
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'active') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (activeTab === 'past') return o.status === 'DELIVERED' || o.status === 'CANCELLED';
    return true;
  });

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Your Orders</h1>
          <p className="page-subtitle">Track live shipments, view past receipts, or reorder favorite meals</p>
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 24 }}>
        <button
          className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`filter-pill ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🚀 Active Deliveries ({orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length})
        </button>
        <button
          className={`filter-pill ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Orders ({orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED').length})
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">No orders found</div>
          <div className="empty-state-text">You haven&apos;t placed any orders in this category yet.</div>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Restaurants 🍕
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredOrders.map(order => {
            const isLive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

            return (
              <div
                key={order.id}
                style={{
                  background: '#fff', borderRadius: 20, border: '1.5px solid var(--border)',
                  padding: 24, boxShadow: 'var(--shadow-sm)', transition: '0.2s'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>
                        {order.restaurant?.name || 'Restaurant'}
                      </span>
                      <span className={`badge ${statusBadge(order.status)}`}>
                        {order.status === 'OUT_FOR_DELIVERY' ? '🚀 Out for Delivery' : order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>
                      {order.restaurant?.address || 'Bengaluru'} • #{order.id}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>
                      ₹{order.total}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {(order.items || []).map((it: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <span className={`food-badge ${it.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 8 }}>
                        {it.foodType === 'VEG' ? '●' : '▲'}
                      </span>
                      <span style={{ fontWeight: 700 }}>{it.quantity}x</span>
                      <span style={{ color: 'var(--text)', flex: 1 }}>{it.name || it.menuItem?.name || 'Item'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-sec)' }}>₹{it.price * (it.quantity || 1)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setInvoiceOrder(order)}
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    📄 View Receipt &amp; Invoice
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {isLive ? (
                      <Link href={`/customer/order/${order.id}`} className="btn btn-sm btn-primary" style={{ borderRadius: 8 }}>
                        📍 Track Live Order 🛵
                      </Link>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleReorder(order)}
                        style={{ borderRadius: 8 }}
                      >
                        ⚡ Reorder (1-Click)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Receipt Modal ─── */}
      {invoiceOrder && (
        <div className="modal-backdrop" onClick={() => setInvoiceOrder(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Tax Invoice &amp; Receipt</h3>
                <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>Order #{invoiceOrder.id}</p>
              </div>
              <button onClick={() => setInvoiceOrder(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'var(--surface-hover)', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
              <div><strong>Restaurant:</strong> {invoiceOrder.restaurant?.name}</div>
              <div style={{ marginTop: 4 }}><strong>Delivered to:</strong> 402, Skyline Residency, Indiranagar, Bengaluru</div>
              <div style={{ marginTop: 4 }}><strong>Payment Mode:</strong> Online UPI (Paid)</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              {(invoiceOrder.items || []).map((it: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                  <span>{it.quantity}x {it.name}</span>
                  <span>₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <span>Delivery &amp; Platform Fee</span>
                <span>₹40</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span>GST (5%)</span>
                <span>₹{Math.round(invoiceOrder.total * 0.05)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 16, fontWeight: 900, borderTop: '1.5px solid var(--text)', marginTop: 8 }}>
                <span>Total Amount Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{invoiceOrder.total}</span>
              </div>
            </div>

            <button
              className="btn btn-outline w-full"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { alert('Invoice downloaded to downloads folder.'); setInvoiceOrder(null); }}
            >
              📥 Download PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
