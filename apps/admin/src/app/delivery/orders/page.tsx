'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantArea: string;
  customerName: string;
  customerArea: string;
  deliveredAt: string;
  distance: string;
  duration: string;
  earnings: {
    base: number;
    distance: number;
    surge: number;
    tip: number;
    total: number;
  };
  status: 'DELIVERED' | 'ACTIVE' | 'CANCELLED';
  paymentMode: 'COD' | 'PAID_ONLINE';
  ratingGiven?: number;
}

const DEMO_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'QB-982144',
    restaurantName: 'Biryani Blues & Charcoal Grill',
    restaurantArea: 'Indiranagar',
    customerName: 'Ananya Deshmukh',
    customerArea: 'Domlur, Bangalore',
    deliveredAt: 'Today, 20:15 PM',
    distance: '3.4 km',
    duration: '18 mins',
    earnings: { base: 45, distance: 24, surge: 15, tip: 20, total: 104 },
    status: 'ACTIVE',
    paymentMode: 'COD',
  },
  {
    id: 'ord-102',
    orderNumber: 'QB-881290',
    restaurantName: 'Truffles Burgers & Shakes',
    restaurantArea: 'St. Marks Road',
    customerName: 'Sanjay Hegde',
    customerArea: 'Richmond Town',
    deliveredAt: 'Today, 18:40 PM',
    distance: '2.8 km',
    duration: '14 mins',
    earnings: { base: 40, distance: 18, surge: 10, tip: 30, total: 98 },
    status: 'DELIVERED',
    paymentMode: 'PAID_ONLINE',
    ratingGiven: 5,
  },
  {
    id: 'ord-103',
    orderNumber: 'QB-773192',
    restaurantName: 'Meghana Foods',
    restaurantArea: 'Koramangala 5th Block',
    customerName: 'Rohan Varma',
    customerArea: 'HSR Layout Sector 2',
    deliveredAt: 'Today, 14:15 PM',
    distance: '4.6 km',
    duration: '26 mins',
    earnings: { base: 50, distance: 32, surge: 25, tip: 0, total: 107 },
    status: 'DELIVERED',
    paymentMode: 'PAID_ONLINE',
    ratingGiven: 5,
  },
  {
    id: 'ord-104',
    orderNumber: 'QB-654901',
    restaurantName: 'Leon Grill',
    restaurantArea: 'Frazer Town',
    customerName: 'Farhan Ali',
    customerArea: 'Cox Town',
    deliveredAt: 'Today, 13:02 PM',
    distance: '1.9 km',
    duration: '12 mins',
    earnings: { base: 35, distance: 12, surge: 0, tip: 10, total: 57 },
    status: 'DELIVERED',
    paymentMode: 'PAID_ONLINE',
    ratingGiven: 4,
  },
  {
    id: 'ord-105',
    orderNumber: 'QB-542198',
    restaurantName: 'Corner House Ice Cream',
    restaurantArea: 'Indiranagar',
    customerName: 'Pooja Nair',
    customerArea: 'HAL 2nd Stage',
    deliveredAt: 'Yesterday, 21:30 PM',
    distance: '2.2 km',
    duration: '15 mins',
    earnings: { base: 35, distance: 15, surge: 20, tip: 15, total: 85 },
    status: 'DELIVERED',
    paymentMode: 'PAID_ONLINE',
    ratingGiven: 5,
  },
  {
    id: 'ord-106',
    orderNumber: 'QB-431980',
    restaurantName: 'Imperio Restaurant',
    restaurantArea: 'Shivajinagar',
    customerName: 'Vikram Sethi',
    customerArea: 'Ulsoor',
    deliveredAt: 'Yesterday, 19:10 PM',
    distance: '3.1 km',
    duration: '22 mins',
    earnings: { base: 40, distance: 20, surge: 0, tip: 0, total: 60 },
    status: 'DELIVERED',
    paymentMode: 'COD',
    ratingGiven: 4,
  },
  {
    id: 'ord-107',
    orderNumber: 'QB-329811',
    restaurantName: 'A2B - Adyar Ananda Bhavan',
    restaurantArea: 'MG Road',
    customerName: 'Swathi Rao',
    customerArea: 'Victoria Layout',
    deliveredAt: '20 Aug, 12:45 PM',
    distance: '2.5 km',
    duration: '—',
    earnings: { base: 20, distance: 0, surge: 0, tip: 0, total: 20 },
    status: 'CANCELLED',
    paymentMode: 'PAID_ONLINE',
  },
];

export default function DeliveryOrdersPage() {
  const [tab, setTab] = useState<'ALL' | 'DELIVERED' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

  const filteredOrders = DEMO_ORDERS.filter((o) => {
    const matchesTab = tab === 'ALL' || o.status === tab;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalDelivered = DEMO_ORDERS.filter((o) => o.status === 'DELIVERED').length;
  const totalEarnings = DEMO_ORDERS.reduce((acc, o) => acc + o.earnings.total, 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>📦 Delivery History</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Track completed trips, active assignments, and individual trip earnings
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: dateFilter === d ? '#0984E3' : '#fff',
                color: dateFilter === d ? '#fff' : '#636E72',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              {d === 'WEEK' ? 'This Week' : d === 'MONTH' ? 'This Month' : d}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Summary Quick Stats ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>COMPLETED TRIPS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0C2340', marginTop: 4 }}>{totalDelivered} Orders</div>
          <div style={{ fontSize: 11, color: '#00B894', marginTop: 2 }}>100% On-time completion</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>TOTAL TRIP EARNINGS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#00B894', marginTop: 4 }}>₹{totalEarnings}</div>
          <div style={{ fontSize: 11, color: '#4A6FA5', marginTop: 2 }}>Includes ₹85 customer tips</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>AVG DISTANCE PER TRIP</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0C2340', marginTop: 4 }}>2.9 km</div>
          <div style={{ fontSize: 11, color: '#636E72', marginTop: 2 }}>Total: 20.3 km travelled</div>
        </div>
      </div>

      {/* ─── Tabs & Search Bar ─── */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '14px 18px', border: '1px solid #E2ECF5', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                background: tab === t ? '#E8F4FD' : 'transparent',
                color: tab === t ? '#0984E3' : '#636E72',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by order ID, restaurant or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #E2ECF5',
            fontSize: 13,
            width: '100%',
            maxWidth: 320,
            outline: 'none',
          }}
        />
      </div>

      {/* ─── Orders List ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map((ord) => (
          <div
            key={ord.id}
            onClick={() => setSelectedOrder(ord)}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '18px 20px',
              border: `1.5px solid ${ord.status === 'ACTIVE' ? '#0984E3' : '#E2ECF5'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              flexWrap: 'wrap',
              gap: 12,
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: ord.status === 'ACTIVE' ? '#E8F4FD' : ord.status === 'DELIVERED' ? '#E8FFF8' : '#FFF5F0',
                color: ord.status === 'ACTIVE' ? '#0984E3' : ord.status === 'DELIVERED' ? '#00B894' : '#E17055',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}>
                {ord.status === 'ACTIVE' ? '🛵' : ord.status === 'DELIVERED' ? '✓' : '✕'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 15, color: '#0C2340' }}>{ord.orderNumber}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: ord.status === 'ACTIVE' ? '#0984E3' : ord.status === 'DELIVERED' ? '#00B894' : '#E17055',
                    color: '#fff'
                  }}>
                    {ord.status}
                  </span>
                  <span style={{ fontSize: 11, color: '#636E72' }}>• {ord.deliveredAt}</span>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#4A6FA5', marginTop: 4 }}>
                  🍽️ {ord.restaurantName} ({ord.restaurantArea}) ➔ 🏠 {ord.customerName} ({ord.customerArea})
                </div>

                <div style={{ fontSize: 12, color: '#636E72', marginTop: 3 }}>
                  Trip: {ord.distance} • {ord.duration} • {ord.paymentMode === 'COD' ? '💵 COD' : '💳 Online Paid'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#00B894' }}>
                  +₹{ord.earnings.total}
                </div>
                <div style={{ fontSize: 11, color: '#636E72' }}>
                  {ord.earnings.tip > 0 ? `Incl. ₹${ord.earnings.tip} tip` : 'Base + Surge'}
                </div>
              </div>

              <span style={{ fontSize: 18, color: '#A0A8C0' }}>➔</span>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div style={{ background: '#fff', padding: 40, borderRadius: 16, textAlign: 'center', border: '1px solid #E2ECF5' }}>
            <div style={{ fontSize: 32 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0C2340', marginTop: 8 }}>No deliveries found</div>
            <div style={{ fontSize: 13, color: '#636E72', marginTop: 4 }}>Try adjusting your filters or search keyword</div>
          </div>
        )}
      </div>

      {/* ─── Detailed Trip Receipt Modal ─── */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,35,64,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0984E3' }}>TRIP BREAKDOWN</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340' }}>{selectedOrder.orderNumber}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#636E72' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#F8FAFD', padding: 16, borderRadius: 14, border: '1px solid #E2ECF5', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#4A6FA5', fontWeight: 700 }}>EARNINGS BREAKDOWN</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, color: '#0C2340' }}>
                <span>Base Delivery Fee</span>
                <span>₹{selectedOrder.earnings.base}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4, color: '#0C2340' }}>
                <span>Distance Pay ({selectedOrder.distance})</span>
                <span>₹{selectedOrder.earnings.distance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4, color: '#0C2340' }}>
                <span>Surge / Peak Bonus</span>
                <span>₹{selectedOrder.earnings.surge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4, color: '#00B894', fontWeight: 700 }}>
                <span>Customer Tip</span>
                <span>₹{selectedOrder.earnings.tip}</span>
              </div>

              <div style={{ height: 1, background: '#E2ECF5', margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#0C2340' }}>
                <span>Total Trip Payout</span>
                <span style={{ color: '#00B894' }}>₹{selectedOrder.earnings.total}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#636E72', marginBottom: 20 }}>
              <div>📍 <strong>Pickup:</strong> {selectedOrder.restaurantName}, {selectedOrder.restaurantArea}</div>
              <div>🏠 <strong>Drop:</strong> {selectedOrder.customerName}, {selectedOrder.customerArea}</div>
              <div>⏱️ <strong>Completed:</strong> {selectedOrder.deliveredAt} ({selectedOrder.duration})</div>
              {selectedOrder.ratingGiven && (
                <div>⭐ <strong>Customer Rating:</strong> {selectedOrder.ratingGiven} / 5 Stars</div>
              )}
            </div>

            {selectedOrder.status === 'ACTIVE' ? (
              <Link
                href="/delivery/active"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#0984E3',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 10,
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                Go to Active Trip Navigation ➔
              </Link>
            ) : (
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  width: '100%',
                  background: '#0C2340',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 10,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Close Receipt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
