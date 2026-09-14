'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { subscribeToRestaurantOrders, updateOrderStatusInSupabase, fetchRestaurantOrdersFromSupabase, fetchRestaurantsFromSupabase } from '../../../lib/supabase';

const DEMO_ORDERS = [
  {
    id: 'QB1024',
    customer: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    total: 549,
    subtotal: 480,
    taxes: 24,
    packagingCharges: 45,
    status: 'PENDING',
    type: 'DELIVERY',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    specialInstructions: 'Please make it less spicy and send extra mint chutney.',
    deliveryPartner: { name: 'Rider Ramesh K.', phone: '+91 91234 56789', status: 'Assigned' },
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    items: [
      { id: 'i1', name: 'Chicken Dum Biryani', price: 220, qty: 2, addons: ['Extra Raita (+₹20)'] },
      { id: 'i2', name: 'Thums Up (300ml)', price: 40, qty: 1, addons: [] },
    ],
  },
  {
    id: 'QB1023',
    customer: 'Priya Patel',
    customerPhone: '+91 98111 22233',
    total: 799,
    subtotal: 710,
    taxes: 39,
    packagingCharges: 50,
    status: 'CONFIRMED',
    type: 'DELIVERY',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    specialInstructions: 'No garlic if possible.',
    deliveryPartner: { name: 'Searching nearby rider...', phone: '', status: 'Searching' },
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    items: [
      { id: 'i3', name: 'Paneer Butter Masala', price: 280, qty: 1, addons: ['Extra Butter (+₹20)'] },
      { id: 'i4', name: 'Butter Naan', price: 60, qty: 3, addons: [] },
      { id: 'i5', name: 'Sweet Mango Lassi', price: 120, qty: 2, addons: [] },
    ],
  },
  {
    id: 'QB1021',
    customer: 'Vikram Mehta',
    customerPhone: '+91 98222 33344',
    total: 449,
    subtotal: 390,
    taxes: 19,
    packagingCharges: 40,
    status: 'PREPARING',
    type: 'DELIVERY',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    specialInstructions: 'Extra napkins please',
    deliveryPartner: { name: 'Anil Verma', phone: '+91 99887 76655', status: 'Arriving in 5 mins' },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    items: [
      { id: 'i6', name: 'Classic Smash Burger', price: 250, qty: 1, addons: ['Extra Cheese (+₹30)'] },
      { id: 'i7', name: 'Peri Peri Loaded Fries', price: 140, qty: 1, addons: [] },
    ],
  },
  {
    id: 'QB1019',
    customer: 'Sneha Reddy',
    customerPhone: '+91 98333 44455',
    total: 620,
    subtotal: 550,
    taxes: 30,
    packagingCharges: 40,
    status: 'READY',
    type: 'DELIVERY',
    paymentMethod: 'WALLET',
    paymentStatus: 'PAID',
    specialInstructions: '',
    deliveryPartner: { name: 'Suresh Kumar', phone: '+91 97766 55443', status: 'At Restaurant' },
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    items: [
      { id: 'i8', name: 'Veg Supreme Pizza (Medium)', price: 450, qty: 1, addons: ['Cheese Burst (+₹60)'] },
      { id: 'i9', name: 'Stuffed Garlic Bread', price: 170, qty: 1, addons: [] },
    ],
  },
  {
    id: 'QB1015',
    customer: 'Arjun Nair',
    customerPhone: '+91 98444 55566',
    total: 380,
    subtotal: 330,
    taxes: 20,
    packagingCharges: 30,
    status: 'DELIVERED',
    type: 'DELIVERY',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    specialInstructions: '',
    deliveryPartner: { name: 'Suresh Kumar', phone: '+91 97766 55443', status: 'Delivered' },
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    items: [
      { id: 'i10', name: 'Chicken Shawarma Roll', price: 180, qty: 2, addons: [] },
      { id: 'i11', name: 'Diet Coke', price: 40, qty: 1, addons: [] },
    ],
  },
];

const REJECTION_REASONS = [
  'Item(s) out of stock',
  'Kitchen too busy / Rush hour',
  'Restaurant closing soon',
  'Technical issue / Equipment breakdown',
  'Special instructions cannot be fulfilled',
  'Other reasons',
];

const ORDER_TABS = [
  { key: 'NEW', label: 'NEW', statusFilter: ['PENDING'] },
  { key: 'CONFIRMED', label: 'CONFIRMED', statusFilter: ['CONFIRMED', 'ACCEPTED'] },
  { key: 'PREPARING', label: 'PREPARING', statusFilter: ['PREPARING'] },
  { key: 'READY', label: 'READY', statusFilter: ['READY', 'READY_FOR_PICKUP'] },
  { key: 'COMPLETED', label: 'COMPLETED', statusFilter: ['DELIVERED', 'PICKED_UP'] },
  { key: 'ALL', label: 'ALL', statusFilter: [] },
];

const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'ORDER PLACED' },
  { key: 'CONFIRMED', label: 'CONFIRMED' },
  { key: 'PREPARING', label: 'PREPARING' },
  { key: 'READY', label: 'READY' },
  { key: 'PICKED_UP', label: 'PICKED UP' },
  { key: 'DELIVERED', label: 'DELIVERED' },
];

export default function RestaurantOrdersPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>(DEMO_ORDERS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NEW');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<any>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState(REJECTION_REASONS[0]);
  const [customRejectNote, setCustomRejectNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const prevCount = useRef(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = useCallback(async (restId: string) => {
    try {
      let supaOrders: any[] = [];
      try {
        supaOrders = await fetchRestaurantOrdersFromSupabase(restId);
      } catch (err) {
        console.warn('fetchRestaurantOrdersFromSupabase error:', err);
      }

      let localOrders: any[] = [];
      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) localOrders = JSON.parse(stored);
      } catch {}

      const combinedMap = new Map();
      [...supaOrders, ...localOrders, ...DEMO_ORDERS].forEach(o => {
        if (o.id) combinedMap.set(o.id, o);
      });
      const combined = Array.from(combinedMap.values());

      if (combined.length > 0) {
        setOrders(combined);
        const newCount = combined.filter((o: any) => o.status === 'PENDING').length;
        if (newCount > prevCount.current && prevCount.current !== 0) {
          showToast(`🔔 ${newCount - prevCount.current} New Order(s) Received!`);
        }
        prevCount.current = newCount;
      }
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const list = await fetchRestaurantsFromSupabase();
        if (list.length > 0) {
          setRestaurantId(list[0].id);
          await fetchOrders(list[0].id);
        } else {
          await fetchOrders('sharief-bhai');
        }
      } catch {
        await fetchOrders('sharief-bhai');
      } finally {
        setLoading(false);
      }
    };
    init();

    const handleUpdate = () => {
      fetchOrders(restaurantId || 'sharief-bhai');
    };

    window.addEventListener('qb:order_status_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // ─── Realtime Orders Subscription (Supabase Realtime) ───
    const unsubscribe = subscribeToRestaurantOrders(restaurantId || '', (eventType, newOrder) => {
      if (eventType === 'INSERT') {
        // Play distinct audio notification chime
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          }
        } catch {}

        showToast(`🔔 New Order #${newOrder.id?.slice(-6) || 'New'} Received!`);
        fetchOrders(restaurantId || 'sharief-bhai');
      } else if (eventType === 'UPDATE') {
        fetchOrders(restaurantId || 'sharief-bhai');
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('qb:order_status_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchOrders, restaurantId]);

  // Status Updater (Syncs with Supabase PostgreSQL)
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusInSupabase(orderId, newStatus);
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
    }
    showToast(`Order status updated to ${newStatus}`);
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalOrder) return;
    const orderId = rejectModalOrder.id;
    try {
      await updateOrderStatusInSupabase(orderId, 'CANCELLED', selectedRejectReason);
    } catch (err) {
      console.warn('Supabase reject status update error:', err);
    }
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'CANCELLED', rejectionReason: selectedRejectReason } : o))
    );
    setRejectModalOrder(null);
    showToast(`Order #${orderId.slice(-6)} Rejected`);
  };

  // Filter Orders by Tab
  const currentTabConfig = ORDER_TABS.find(t => t.key === activeTab);
  const filteredOrders = orders.filter(o => {
    if (!currentTabConfig || currentTabConfig.statusFilter.length === 0) return true;
    return currentTabConfig.statusFilter.includes(o.status);
  });

  const getTabCount = (tabKey: string) => {
    const cfg = ORDER_TABS.find(t => t.key === tabKey);
    if (!cfg || cfg.statusFilter.length === 0) return orders.length;
    return orders.filter(o => cfg.statusFilter.includes(o.status)).length;
  };

  const getTimelineStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
      case 'READY_FOR_PICKUP':
        return 3;
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 0;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Page Header & Kitchen View Shortcut ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            📦 Live Order Management
          </h1>
          <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
            Real-time kitchen order tracking and dispatch
          </p>
        </div>

        {/* CTA: Kitchen View */}
        <Link
          href="/restaurant/kitchen"
          style={{
            padding: '11px 20px',
            borderRadius: 10,
            background: '#FFB21A',
            color: '#171717',
            fontWeight: 800,
            fontSize: 13,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 3px 10px rgba(255, 178, 26, 0.35)',
            minHeight: 44,
          }}
        >
          <span>🍳</span>
          <span>KITCHEN VIEW (KDS)</span>
        </Link>
      </div>

      {/* ─── Orders Tabs ─── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {ORDER_TABS.map(tab => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: isActive ? '1px solid #4A0A10' : '1px solid #EAE0D0',
                background: isActive ? '#4A0A10' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#171717',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 8px rgba(74, 10, 16, 0.15)' : 'none',
                minHeight: 44,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#FAF0EB',
                  color: isActive ? '#FFFFFF' : '#4A0A10',
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: 12,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Orders Grid / List ─── */}
      {filteredOrders.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 14 }}>
          {filteredOrders.map(order => {
            const isPending = order.status === 'PENDING';
            const isConfirmed = order.status === 'CONFIRMED' || order.status === 'ACCEPTED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY' || order.status === 'READY_FOR_PICKUP';

            return (
              <div
                key={order.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: isPending ? '1.5px solid #FFB21A' : '1px solid #EAE0D0',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'transform 0.15s ease',
                }}
              >
                {/* Header: ID, Time, Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#171717' }}>
                      #{order.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 2 }}>
                      Customer: <strong style={{ color: '#171717' }}>{order.customer || 'Guest User'}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isPending
                          ? '#FFF7E6'
                          : isReady
                          ? '#E8F8F0'
                          : order.status === 'CANCELLED'
                          ? '#FEECEC'
                          : '#FAF0EB',
                        color: isPending
                          ? '#C77700'
                          : isReady
                          ? '#20A464'
                          : order.status === 'CANCELLED'
                          ? '#D64545'
                          : '#4A0A10',
                      }}
                    >
                      {order.status}
                    </span>
                    <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div
                  style={{
                    background: '#FAF6EF',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #EAE0D0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#171717' }}>
                      <span>
                        <strong>{item.qty || item.quantity || 1} ×</strong> {item.name || item.menuItemName}
                      </span>
                      <span style={{ fontWeight: 700, color: '#6F6F6F' }}>
                        ₹{(item.price || item.itemTotal || 0) * (item.qty || item.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div
                    style={{
                      background: '#FFF8EB',
                      border: '1px solid #FDDCA5',
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#9C6200',
                    }}
                  >
                    <strong>Note:</strong> {order.specialInstructions}
                  </div>
                )}

                {/* Delivery & Payment Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#6F6F6F' }}>Delivery Partner: </span>
                    <strong style={{ color: '#171717' }}>
                      {order.deliveryPartner?.name || (isReady ? 'Assigned' : 'Searching...')}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, background: '#EAE0D0', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      {order.paymentMethod || 'UPI'}
                    </span>
                  </div>
                </div>

                {/* Total & Action Buttons */}
                <div
                  style={{
                    borderTop: '1px solid #EAE0D0',
                    paddingTop: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#6F6F6F', fontWeight: 600 }}>Order Total</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>₹{order.total}</span>
                  </div>

                  {/* Primary Stage Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPending && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'CONFIRMED')}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#20A464',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: 'pointer',
                            minHeight: 44,
                          }}
                        >
                          ✓ ACCEPT
                        </button>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #F9BABA',
                            background: '#FFF5F5',
                            color: '#D64545',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                            minHeight: 44,
                          }}
                        >
                          ✕ REJECT
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#4A0A10',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        👨‍🍳 START PREPARING
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => updateStatus(order.id, 'READY')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#FFB21A',
                          color: '#171717',
                          fontWeight: 900,
                          fontSize: 13,
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        📦 MARK READY
                      </button>
                    )}

                    {isReady && (
                      <div
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          background: '#E8F8F0',
                          color: '#20A464',
                          fontWeight: 800,
                          fontSize: 12,
                          textAlign: 'center',
                        }}
                      >
                        ✓ Food Ready · Awaiting Rider Pickup
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #EAE0D0',
                        background: '#FAF6EF',
                        color: '#171717',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      DETAILS →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#171717' }}>
            No orders found in {activeTab}
          </div>
          <p style={{ fontSize: 13, color: '#6F6F6F', maxWidth: 360, margin: '8px auto 0' }}>
            New incoming customer orders will appear here automatically in real time.
          </p>
        </div>
      )}

      {/* ─── Order Detail Slide-Over Modal ─── */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              width: 480,
              maxWidth: '95vw',
              background: '#FFFFFF',
              height: '100%',
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>
                  Order #{selectedOrder.id.slice(0, 8)}
                </div>
                <div style={{ fontSize: 12, color: '#6F6F6F' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: '#FAF6EF',
                  border: '1px solid #EAE0D0',
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  fontSize: 16,
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Timeline */}
            <div style={{ background: '#FAF6EF', borderRadius: 12, padding: '16px', border: '1px solid #EAE0D0' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#4A0A10', marginBottom: 12, textTransform: 'uppercase' }}>
                Order Lifecycle Timeline
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const currentIdx = getTimelineStepIndex(selectedOrder.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: isDone ? '#20A464' : '#EAE0D0',
                          color: '#FFFFFF',
                          fontSize: 11,
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: isDone ? 800 : 500, color: isDone ? '#171717' : '#999' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ borderBottom: '1px solid #EAE0D0', paddingBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase' }}>Customer</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#171717', marginTop: 4 }}>
                {selectedOrder.customer || 'Guest User'}
              </div>
              <div style={{ fontSize: 13, color: '#6F6F6F' }}>
                {selectedOrder.customerPhone || '+91 98765 43210'}
              </div>
            </div>

            {/* Items & Customizations */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase', marginBottom: 8 }}>
                Items Ordered
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(selectedOrder.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#171717' }}>
                        {item.qty || item.quantity || 1} × {item.name || item.menuItemName}
                      </div>
                      {(item.addons || []).map((a: string, j: number) => (
                        <div key={j} style={{ fontSize: 12, color: '#6F6F6F', paddingLeft: 8 }}>
                          + {a}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontWeight: 800, color: '#171717' }}>
                      ₹{(item.price || item.itemTotal || 0) * (item.qty || item.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Cooking Instructions */}
            {selectedOrder.specialInstructions && (
              <div style={{ background: '#FFF8EB', padding: '12px', borderRadius: 10, border: '1px solid #FDDCA5' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#9C6200' }}>SPECIAL INSTRUCTIONS:</div>
                <div style={{ fontSize: 13, color: '#5C3800', marginTop: 2 }}>{selectedOrder.specialInstructions}</div>
              </div>
            )}

            {/* Bill Breakdown */}
            <div style={{ borderTop: '1px solid #EAE0D0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal || selectedOrder.total - 60}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                <span>Taxes (GST 5%)</span>
                <span>₹{selectedOrder.taxes || 25}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6F6F6F' }}>
                <span>Packaging Charges</span>
                <span>₹{selectedOrder.packagingCharges || 35}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 900,
                  fontSize: 17,
                  color: '#4A0A10',
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: '1px solid #EAE0D0',
                }}
              >
                <span>Total Amount Paid ({selectedOrder.paymentMethod || 'UPI'})</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Delivery Driver Info */}
            <div style={{ background: '#FAF6EF', padding: '14px', borderRadius: 12, border: '1px solid #EAE0D0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase' }}>Delivery Partner</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#171717', marginTop: 2 }}>
                {selectedOrder.deliveryPartner?.name || 'Rider Assignment in Progress'}
              </div>
              {selectedOrder.deliveryPartner?.phone && (
                <div style={{ fontSize: 12, color: '#4A0A10', fontWeight: 700, marginTop: 4 }}>
                  📞 {selectedOrder.deliveryPartner.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Order Reason Modal ─── */}
      {rejectModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 440,
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: '#D64545', marginBottom: 8 }}>
              Reject Order #{rejectModalOrder.id.slice(0, 8)}?
            </div>
            <p style={{ fontSize: 13, color: '#6F6F6F', marginBottom: 16 }}>
              Please select a valid reason for rejecting this customer order.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {REJECTION_REASONS.map(r => (
                <label
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: selectedRejectReason === r ? '#FFF5F5' : '#FAFAFA',
                    border: `1px solid ${selectedRejectReason === r ? '#F9BABA' : '#EAE0D0'}`,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedRejectReason === r}
                    onChange={() => setSelectedRejectReason(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRejectModalOrder(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid #EAE0D0',
                  background: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#D64545',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  minHeight: 44,
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
