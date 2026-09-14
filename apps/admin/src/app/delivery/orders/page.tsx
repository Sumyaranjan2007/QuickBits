'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface DeliveryHistoryItem {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantArea: string;
  customerName: string;
  customerArea: string;
  date: string;
  status: 'COMPLETED' | 'CANCELLED';
  earnings: number;
  distance: string;
  itemsSummary: string;
}

const DEFAULT_ORDERS: DeliveryHistoryItem[] = [
  {
    id: 'ord-101',
    orderNumber: 'QB-881290',
    restaurantName: 'Truffles Burgers & Shakes',
    restaurantArea: 'St. Marks Road',
    customerName: 'Sanjay Hegde',
    customerArea: 'Richmond Town',
    date: '14 Sep, 18:40',
    status: 'COMPLETED',
    earnings: 78,
    distance: '2.8 km',
    itemsSummary: '2× All-American Cheese Burger, 1× Peri Peri Fries',
  },
  {
    id: 'ord-102',
    orderNumber: 'QB-879012',
    restaurantName: 'Corner House Ice Creams',
    restaurantArea: 'Residency Rd',
    customerName: 'Pooja Varma',
    customerArea: 'Ulsoor',
    date: '14 Sep, 16:15',
    status: 'COMPLETED',
    earnings: 62,
    distance: '2.1 km',
    itemsSummary: '1× Death By Chocolate, 1× Vanilla Tub',
  },
  {
    id: 'ord-103',
    orderNumber: 'QB-864119',
    restaurantName: 'Meghana Foods',
    restaurantArea: 'Koramangala 5th Block',
    customerName: 'Dev Malhotra',
    customerArea: 'HSR Layout Sector 1',
    date: '13 Sep, 21:10',
    status: 'COMPLETED',
    earnings: 112,
    distance: '4.6 km',
    itemsSummary: '1× Meghana Special Chicken Biryani, 1× Paneer 65',
  },
  {
    id: 'ord-104',
    orderNumber: 'QB-851900',
    restaurantName: 'Leon Grill Burgers',
    restaurantArea: 'Indiranagar',
    customerName: 'Vikram Joshi',
    customerArea: 'HAL 2nd Stage',
    date: '13 Sep, 19:25',
    status: 'CANCELLED',
    earnings: 0,
    distance: '1.8 km',
    itemsSummary: 'Customer cancelled before pickup',
  },
  {
    id: 'ord-105',
    orderNumber: 'QB-849102',
    restaurantName: 'Chai Point',
    restaurantArea: 'Embassy Golf Links',
    customerName: 'Meera Nair',
    customerArea: 'Domlur Inner Ring Rd',
    date: '13 Sep, 15:40',
    status: 'COMPLETED',
    earnings: 54,
    distance: '1.9 km',
    itemsSummary: '1× Ginger Tea Flask (500ml), 2× Samosa',
  },
];

export default function DeliveryOrdersHistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [orders, setOrders] = useState<DeliveryHistoryItem[]>(DEFAULT_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryHistoryItem | null>(null);

  useEffect(() => {
    const loadDeliveryHistory = async () => {
      try {
        const { data: assignments } = await supabase
          .from('delivery_assignments')
          .select('*, orders(id, restaurant_id, delivery_address_text, customer_name, total, order_items(name, quantity))')
          .in('status', ['DELIVERED', 'COMPLETED', 'CANCELLED'])
          .order('assigned_at', { ascending: false })
          .limit(20);

        if (assignments && assignments.length > 0) {
          const mapped: DeliveryHistoryItem[] = assignments.map((item: any) => ({
            id: item.id,
            orderNumber: item.orders?.id || `QB-${item.id.slice(-6).toUpperCase()}`,
            restaurantName: item.orders?.restaurant_id || 'Partner Restaurant',
            restaurantArea: 'Bengaluru',
            customerName: item.orders?.customer_name || 'Customer',
            customerArea: item.orders?.delivery_address_text?.split(',')[0] || 'Delivery Address',
            date: new Date(item.delivered_at || item.assigned_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: item.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
            earnings: 35,
            distance: '3.1 km',
            itemsSummary:
              item.orders?.order_items?.map((it: any) => `${it.quantity}× ${it.name}`).join(', ') || 'Delivered order',
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn('Delivery history notice:', err);
      }
    };
    loadDeliveryHistory();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <>
      {/* ─── Screen Title & Stats ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            Delivery History
          </h1>
          <p style={{ fontSize: 11, color: '#7A6A5E', margin: '2px 0 0' }}>
            Past trips & completed delivery log
          </p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#4A0A10' }}>
          {filteredOrders.length} Trips
        </span>
      </div>

      {/* ─── Filter Pills (Matches Customer App Categories) ─── */}
      <div className="delivery-filter-pills" style={{ margin: '4px 0 2px' }}>
        <button
          type="button"
          className={`delivery-filter-pill ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Trips
        </button>
        <button
          type="button"
          className={`delivery-filter-pill ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          ✓ Completed
        </button>
        <button
          type="button"
          className={`delivery-filter-pill ${filter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setFilter('CANCELLED')}
        >
          ✕ Cancelled
        </button>
      </div>

      {/* ─── Order Cards List (Customer App Styling) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map(ord => (
          <div
            key={ord.id}
            className="delivery-card"
            onClick={() => setSelectedOrder(ord)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10' }}>
                  {ord.orderNumber}
                </span>
                <div style={{ fontSize: 11, color: '#7A6A5E', marginTop: 1 }}>
                  {ord.date}
                </div>
              </div>

              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 8,
                border: '1px solid',
                color: ord.status === 'COMPLETED' ? '#047857' : '#B91C1C',
                background: ord.status === 'COMPLETED' ? '#F0FDF4' : '#FEF2F2',
                borderColor: ord.status === 'COMPLETED' ? '#A7F3D0' : '#FECACA',
              }}>
                {ord.status}
              </span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>
              🏪 {ord.restaurantName}
            </div>

            <div style={{ fontSize: 12, color: '#7A6A5E', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span>📍 Drop:</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{ord.customerArea}</span>
              <span>•</span>
              <span>{ord.distance}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 10,
              borderTop: '1px dashed #EADBCE',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7A6A5E' }}>
                Earnings
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: 900,
                color: ord.status === 'COMPLETED' ? '#047857' : '#9CA3AF',
              }}>
                {ord.status === 'COMPLETED' ? `₹${ord.earnings}` : '₹0'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Order Detail Modal Sheet ─── */}
      {selectedOrder && (
        <div className="delivery-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="delivery-modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                  Order Details
                </h3>
                <span style={{ fontSize: 12, color: '#7A6A5E' }}>
                  {selectedOrder.orderNumber} • {selectedOrder.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#7A6A5E' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #EADBCE', borderRadius: 16, padding: '16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#7A6A5E', textTransform: 'uppercase' }}>Pickup Location</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginTop: 2 }}>{selectedOrder.restaurantName}</div>
                <div style={{ fontSize: 12, color: '#7A6A5E' }}>{selectedOrder.restaurantArea}</div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#7A6A5E', textTransform: 'uppercase' }}>Drop Location</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginTop: 2 }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: 12, color: '#7A6A5E' }}>{selectedOrder.customerArea}</div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#7A6A5E', textTransform: 'uppercase' }}>Order Items</div>
                <div style={{ fontSize: 13, color: '#1A1A1A', marginTop: 2 }}>{selectedOrder.itemsSummary}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #EADBCE' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7A6A5E' }}>Trip Distance</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>{selectedOrder.distance}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7A6A5E' }}>Trip Earnings</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#047857' }}>₹{selectedOrder.earnings}</span>
              </div>
            </div>

            <button
              type="button"
              className="delivery-primary-btn"
              onClick={() => setSelectedOrder(null)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}
