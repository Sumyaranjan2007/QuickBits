'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';

const DEMO_ORDERS = [
  {
    id: 'QB-982144',
    status: 'OUT_FOR_DELIVERY',
    total: 512,
    subtotal: 448,
    deliveryFee: 30,
    platformFee: 5,
    taxes: 29,
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    restaurant: { id: 'sharief-bhai', name: 'Sharief Bhai Biryani', address: '100 Feet Road, Indiranagar' },
    deliveryAddress: { name: 'Home', desc: 'Indiranagar, Bengaluru 560038' },
    items: [
      { id: '1', name: 'Hyderabadi Dum Biryani', price: 289, quantity: 1, foodType: 'NON_VEG' },
      { id: '2', name: 'Peri Peri Loaded Fries', price: 159, quantity: 1, foodType: 'VEG' },
    ],
    driver: {
      name: 'Amit Verma',
      phone: '+91 98765 43210',
      rating: 4.9,
      vehicle: 'Hero Electric (KA 03 HK 2910)',
    },
  },
  {
    id: 'QB-741290',
    status: 'DELIVERED',
    total: 648,
    subtotal: 598,
    deliveryFee: 20,
    platformFee: 5,
    taxes: 25,
    paymentMethod: 'Cash on Delivery (COD)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    restaurant: { id: 'behrouz-biryani', name: 'Behrouz Biryani', address: 'Koramangala 5th Block' },
    deliveryAddress: { name: 'Home', desc: 'Indiranagar, Bengaluru 560038' },
    items: [
      { id: '3', name: 'Royal Paneer Biryani', price: 349, quantity: 1, foodType: 'VEG' },
      { id: '4', name: 'Tandoori Paneer Tikka', price: 299, quantity: 1, foodType: 'VEG' },
    ],
  },
  {
    id: 'QB-310842',
    status: 'DELIVERED',
    total: 449,
    subtotal: 399,
    deliveryFee: 25,
    platformFee: 5,
    taxes: 20,
    paymentMethod: 'Credit Card',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    restaurant: { id: 'tuscany-woodfire', name: 'Tuscany Woodfire Pizzeria', address: 'Lavelle Road' },
    deliveryAddress: { name: 'Work', desc: 'Prestige Tech Park, Outer Ring Road' },
    items: [
      { id: '5', name: 'Woodfired Margherita Pizza', price: 449, quantity: 1, foodType: 'VEG' },
    ],
  },
];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  // Load orders from localStorage and merge with API
  useEffect(() => {
    const loadAllOrders = () => {
      let localOrders: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('qb_customer_orders');
          if (stored) {
            localOrders = JSON.parse(stored);
          }
        } catch (e) {
          console.error(e);
        }
      }

      ordersApi.getMyOrders()
        .then(r => {
          const d = r.data as any;
          const apiList = d.items || d || [];
          // Deduplicate by ID
          const combined = [...localOrders, ...apiList, ...DEMO_ORDERS];
          const seen = new Set();
          const unique = combined.filter(o => {
            if (!o?.id || seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
          });
          setOrders(unique);
        })
        .catch(() => {
          const combined = [...localOrders, ...DEMO_ORDERS];
          const seen = new Set();
          const unique = combined.filter(o => {
            if (!o?.id || seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
          });
          setOrders(unique);
        })
        .finally(() => setLoading(false));
    };

    loadAllOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'PENDING':
        return { label: '📝 Order Placed', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'PREPARING':
        return { label: '🍳 Preparing Food', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'READY':
        return { label: '🛵 Driver Assigned', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' };
      case 'OUT_FOR_DELIVERY':
        return { label: '🚀 On the Way', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
      case 'DELIVERED':
        return { label: '✓ Delivered', bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
      case 'CANCELLED':
        return { label: '✕ Cancelled', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' };
      default:
        return { label: status, bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
    }
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
        imageUrl: it.imageUrl,
        restaurantId: order.restaurant?.id || 'rest-1',
        restaurantName: order.restaurant?.name || 'QuickBite Restaurant',
      });
    });
    router.push('/customer/checkout');
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'active') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (activeTab === 'past') return o.status === 'DELIVERED' || o.status === 'CANCELLED';
    return true;
  });

  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

  return (
    <div className="customer-orders-container" style={{ padding: '4px 0 24px' }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: '0 0 2px 0' }}>
          📦 Your Orders
        </h1>
        <p style={{ fontSize: 12, color: '#8C7B72', margin: 0 }}>
          Live order tracking, digital invoices, and easy 1-click reordering
        </p>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          type="button"
          className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{
            fontSize: 12,
            padding: '5px 12px',
            borderRadius: 16,
            background: activeTab === 'all' ? '#4A0A10' : '#FFFFFF',
            color: activeTab === 'all' ? '#FFFFFF' : '#4B5563',
            border: `1px solid ${activeTab === 'all' ? '#4A0A10' : '#EADBCE'}`,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          All ({orders.length})
        </button>
        <button
          type="button"
          className={`filter-pill ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
          style={{
            fontSize: 12,
            padding: '5px 12px',
            borderRadius: 16,
            background: activeTab === 'active' ? '#4A0A10' : '#FFFFFF',
            color: activeTab === 'active' ? '#FFFFFF' : '#4B5563',
            border: `1px solid ${activeTab === 'active' ? '#4A0A10' : '#EADBCE'}`,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🚀 Active ({activeOrdersCount})
        </button>
        <button
          type="button"
          className={`filter-pill ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
          style={{
            fontSize: 12,
            padding: '5px 12px',
            borderRadius: 16,
            background: activeTab === 'past' ? '#4A0A10' : '#FFFFFF',
            color: activeTab === 'past' ? '#FFFFFF' : '#4B5563',
            border: `1px solid ${activeTab === 'past' ? '#4A0A10' : '#EADBCE'}`,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Past Orders ({orders.length - activeOrdersCount})
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 16px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #EADBCE' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#4A0A10', marginBottom: 4 }}>No orders found</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>You haven&apos;t placed any orders in this category yet.</div>
          <Link
            href="/customer"
            style={{
              display: 'inline-block',
              background: '#4A0A10',
              color: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Browse Restaurants 🍕
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredOrders.map(order => {
            const isLive = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: isLive ? '1.5px solid #0E9F6E' : '1px solid #EADBCE',
                  padding: 14,
                  boxShadow: isLive ? '0 4px 14px rgba(14, 159, 110, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Top Row: Restaurant & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F3F4F6', paddingBottom: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>
                        {order.restaurant?.name || 'QuickBite Partner'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      #{order.id} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        display: 'inline-block',
                      }}
                    >
                      {badge.label}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#4A0A10', marginTop: 3 }}>
                      ₹{order.total}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {(order.items || []).map((it: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`food-symbol-square ${it.foodType === 'VEG' ? 'veg-symbol' : 'nonveg-symbol'} mini`}>
                          <span className={it.foodType === 'VEG' ? 'food-symbol-circle mini' : 'food-symbol-triangle mini'} />
                        </span>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{it.quantity}x {it.name || it.menuItem?.name || 'Item'}</span>
                      </div>
                      <span style={{ color: '#6B7280', fontWeight: 700 }}>₹{it.price * (it.quantity || 1)}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(order)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#4A0A10',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      📄 Bill Details
                    </button>
                    <Link
                      href={`/customer/help?orderId=${order.id}`}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#EA580C',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      🎧 Need Help?
                    </Link>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {isLive ? (
                      <Link
                        href={`/customer/order/${order.id}`}
                        id={`track-order-btn-${order.id}`}
                        style={{
                          background: '#0E9F6E',
                          color: '#FFFFFF',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(14, 159, 110, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>🚀</span> Track Order
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        style={{
                          background: '#4A0A10',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(74, 10, 16, 0.2)',
                        }}
                      >
                        ⚡ Reorder
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
        <div
          className="modal-backdrop"
          onClick={() => setInvoiceOrder(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="modal-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: 430,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10', margin: 0 }}>🧾 Bill Details &amp; Receipt</h3>
                <span style={{ fontSize: 11, color: '#6B7280' }}>Order #{invoiceOrder.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#F9FAFB', padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 12, lineHeight: 1.4 }}>
              <div><strong>Restaurant:</strong> {invoiceOrder.restaurant?.name || 'QuickBite Partner'}</div>
              <div><strong>Deliver to:</strong> {invoiceOrder.deliveryAddress?.desc || invoiceOrder.deliveryAddress?.fullAddress || 'Selected Address'}</div>
              <div><strong>Payment Method:</strong> {invoiceOrder.paymentMethod || 'Online'}</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              {(invoiceOrder.items || []).map((it: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                  <span>{it.quantity}x {it.name}</span>
                  <span>₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderTop: '1px solid #E5E7EB', marginTop: 8 }}>
                <span>Item Subtotal</span>
                <span>₹{invoiceOrder.subtotal || invoiceOrder.total - 50}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                <span>Delivery &amp; Taxes</span>
                <span>₹{invoiceOrder.deliveryFee ? invoiceOrder.deliveryFee + (invoiceOrder.taxes || 0) : 50}</span>
              </div>
              {invoiceOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#0E9F6E' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{invoiceOrder.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 15, fontWeight: 900, borderTop: '1.5px solid #1A1A1A', marginTop: 8, color: '#4A0A10' }}>
                <span>Total Paid</span>
                <span>₹{invoiceOrder.total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert('Invoice downloaded successfully.');
                setInvoiceOrder(null);
              }}
              style={{
                width: '100%',
                background: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 0',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              📥 Download PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
