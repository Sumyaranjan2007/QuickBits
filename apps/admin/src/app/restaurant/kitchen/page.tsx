'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { restaurantsApi, ordersApi } from '@quickbite/api-client';

const DEMO_KITCHEN_ORDERS = [
  {
    id: 'QB1024',
    customer: 'Rahul S.',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    prepTimeMins: 15,
    specialInstructions: 'Less spicy, extra mint chutney',
    items: [
      { name: 'Chicken Dum Biryani', qty: 2 },
      { name: 'Raita', qty: 1 },
      { name: 'Coke (330ml)', qty: 1 },
    ],
  },
  {
    id: 'QB1023',
    customer: 'Priya P.',
    status: 'PREPARING',
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    prepTimeMins: 20,
    specialInstructions: 'No garlic',
    items: [
      { name: 'Paneer Butter Masala', qty: 1 },
      { name: 'Butter Naan', qty: 3 },
      { name: 'Sweet Mango Lassi', qty: 2 },
    ],
  },
  {
    id: 'QB1020',
    customer: 'Amit K.',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    prepTimeMins: 15,
    specialInstructions: 'Pack gravy separately',
    items: [
      { name: 'Mutton Rogan Josh', qty: 1 },
      { name: 'Jeera Rice', qty: 2 },
    ],
  },
];

function KitchenOrderTimer({ createdAt, prepMins }: { createdAt: string; prepMins: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  let urgency = 'NORMAL';
  let badgeColor = '#20A464';
  let badgeBg = '#E8F8F0';

  if (mins >= prepMins + 5) {
    urgency = 'OVERDUE';
    badgeColor = '#D64545';
    badgeBg = '#FEECEC';
  } else if (mins >= prepMins) {
    urgency = 'URGENT';
    badgeColor = '#F5A623';
    badgeBg = '#FFF7E6';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: badgeColor, fontVariantNumeric: 'tabular-nums' }}>
        ⏱️ {timeStr}
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          padding: '4px 10px',
          borderRadius: 6,
          background: badgeBg,
          color: badgeColor,
          letterSpacing: 0.5,
        }}
      >
        {urgency}
      </span>
    </div>
  );
}

export default function KitchenViewPage() {
  const [orders, setOrders] = useState<any[]>(DEMO_KITCHEN_ORDERS);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadKitchenOrders = useCallback(async (restId: string) => {
    try {
      const res = await ordersApi.getRestaurantOrders(restId);
      const d = res.data as any;
      const list = d.items || d || [];
      const kitchenList = list.filter((o: any) => ['CONFIRMED', 'PREPARING', 'ACCEPTED'].includes(o.status));
      if (kitchenList.length > 0) {
        setOrders(kitchenList);
      }
    } catch {
      // Fallback to demo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await restaurantsApi.list();
        const d = res.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          setRestaurantId(list[0].id);
          await loadKitchenOrders(list[0].id);
        }
      } catch {
        setOrders(DEMO_KITCHEN_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadKitchenOrders]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
    } catch {}
    if (newStatus === 'READY') {
      setOrders(prev => prev.filter(o => o.id !== id));
    } else {
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: newStatus } : o)));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Header ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 16,
          border: '1px solid #EAE0D0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/restaurant/orders"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: '#FAF6EF',
              border: '1px solid #EAE0D0',
              color: '#4A0A10',
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Back to Orders
          </Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
              🍳 Kitchen Display System (KDS)
            </h1>
            <div style={{ fontSize: 12, color: '#6F6F6F' }}>
              {orders.length} tickets actively in preparation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: '#E8F8F0', color: '#20A464' }}>
            NORMAL (&lt; 15m)
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: '#FFF7E6', color: '#F5A623' }}>
            URGENT (15-20m)
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: '#FEECEC', color: '#D64545' }}>
            OVERDUE (&gt; 20m)
          </span>
        </div>
      </div>

      {/* ─── Kitchen Ticket Cards Grid ─── */}
      {orders.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {orders.map(order => {
            const isConfirmed = order.status === 'CONFIRMED' || order.status === 'ACCEPTED';
            const isPreparing = order.status === 'PREPARING';

            return (
              <div
                key={order.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: isPreparing ? '2px solid #4A0A10' : '1px solid #EAE0D0',
                  padding: '18px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {/* Header with ID & Timer */}
                <div style={{ borderBottom: '1px solid #EAE0D0', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#171717' }}>
                      #{order.id.slice(0, 8)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isPreparing ? '#FAF0EB' : '#FFF8EB',
                        color: isPreparing ? '#4A0A10' : '#B57400',
                      }}
                    >
                      {isPreparing ? '👨‍🍳 PREPARING' : '🔔 PREPARE NOW'}
                    </span>
                  </div>

                  <KitchenOrderTimer
                    createdAt={order.createdAt}
                    prepMins={order.prepTimeMins || 15}
                  />
                </div>

                {/* Items To Cook */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(order.items || []).map((item: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#FAF6EF',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#171717',
                      }}
                    >
                      <span>{item.name || item.menuItemName}</span>
                      <span
                        style={{
                          background: '#4A0A10',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        {item.qty || item.quantity || 1}×
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
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {order.specialInstructions}
                  </div>
                )}

                {/* Chef Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  {isConfirmed && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#4A0A10',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: 14,
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      ▶️ START
                    </button>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#FFB21A',
                      color: '#171717',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                      minHeight: 44,
                    }}
                  >
                    ✓ MARK READY
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍🍳</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#171717' }}>Kitchen is Clear!</div>
          <p style={{ fontSize: 13, color: '#6F6F6F', marginTop: 4 }}>
            No incoming orders pending preparation right now.
          </p>
        </div>
      )}
    </div>
  );
}
