'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface OperationOrder {
  id: string;
  customer: string;
  restaurant: string;
  driver?: string;
  items: string;
  total: number;
  timeAgo: string;
  isDelayed?: boolean;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY';
}

const INITIAL_OPERATIONS_ORDERS: OperationOrder[] = [
  { id: 'QB-982144', customer: 'Rahul Sharma', restaurant: 'Burger & Co.', driver: 'Amit Verma (KA-01-EQ-9876)', items: '1x Classic Smash, 1x Peri Peri Fries', total: 512, timeAgo: '12m ago', status: 'OUT_FOR_DELIVERY' },
  { id: 'QB-518293', customer: 'Priya Patel', restaurant: 'Spice Symphony', driver: 'Suresh Kumar (KA-05-AB-1234)', items: '2x Hyderabadi Chicken Biryani', total: 698, timeAgo: '18m ago', status: 'READY' },
  { id: 'QB-410928', customer: 'Arjun Das', restaurant: 'Pizzeria Bella', driver: 'Unassigned', items: '1x Margherita Burrata Pizza', total: 449, timeAgo: '6m ago', status: 'PREPARING' },
  { id: 'QB-190283', customer: 'Sneha Reddy', restaurant: 'Burger & Co.', driver: 'Unassigned', items: '2x Crispy Paneer Burgers', total: 498, timeAgo: '2m ago', status: 'PENDING' },
];

export default function AdminOperationsPage() {
  const [orders, setOrders] = useState<OperationOrder[]>(INITIAL_OPERATIONS_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OperationOrder | null>(null);

  const handleAdvanceStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (o.status === 'PENDING') return { ...o, status: 'PREPARING' };
        if (o.status === 'PREPARING') return { ...o, status: 'READY', driver: 'Amit Verma (KA-01-EQ-9876)' };
        if (o.status === 'READY') return { ...o, status: 'OUT_FOR_DELIVERY' };
      }
      return o;
    }));
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to cancel and refund order #${orderId}?`)) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
      alert(`Order #${orderId} cancelled and 100% refund credited to customer wallet.`);
    }
  };

  const handleReassignDriver = (orderId: string) => {
    const newDriver = prompt('Enter new Delivery Partner Name or Vehicle ID:', 'Ramesh Babu (KA-03-XY-9999)');
    if (newDriver) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driver: newDriver } : o));
      alert(`Delivery partner reassigned to ${newDriver} for order #${orderId}`);
    }
  };

  const columns = [
    { title: '📝 New Orders', status: 'PENDING', badge: 'badge-warning' },
    { title: '🍳 Preparing', status: 'PREPARING', badge: 'badge-info' },
    { title: '🛵 Driver Assigned', status: 'READY', badge: 'badge-primary' },
    { title: '🚀 Out for Delivery', status: 'OUT_FOR_DELIVERY', badge: 'badge-success' },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">⚡ Live Operations & Dispatch Center</h1>
          <p className="page-subtitle">Real-time order fulfillment pipeline & fleet dispatch</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: 12 }}>
            ● Auto-Refresh: 5s Live
          </span>
        </div>
      </div>

      {/* ─── Operational Kanban Pipeline Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {columns.map(col => {
          const colOrders = orders.filter(o => o.status === col.status);

          return (
            <div key={col.status} style={{ background: '#F8F7FF', borderRadius: 16, border: '1.5px solid var(--border)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>{col.title}</h3>
                <span className={`badge ${col.badge}`} style={{ fontSize: 11 }}>{colOrders.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {colOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      background: '#fff', borderRadius: 12, border: '1px solid var(--border)',
                      padding: 14, boxShadow: 'var(--shadow-sm)', transition: '0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>#{order.id}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.timeAgo}</span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{order.customer}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>🍽️ {order.restaurant}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📦 {order.items}</div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0984E3', marginTop: 6, background: '#E8F4FD', padding: '4px 8px', borderRadius: 6 }}>
                      🛵 {order.driver || 'Searching rider...'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 900, fontSize: 13 }}>₹{order.total}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {order.status !== 'OUT_FOR_DELIVERY' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAdvanceStatus(order.id)}
                            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6 }}
                            title="Advance Stage"
                          >
                            Next →
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleReassignDriver(order.id)}
                          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6 }}
                          title="Reassign Driver"
                        >
                          🛵 Reassign
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleCancelOrder(order.id)}
                          style={{ fontSize: 10, padding: '3px 6px', color: '#E17055' }}
                          title="Cancel Order"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
                    No orders in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
