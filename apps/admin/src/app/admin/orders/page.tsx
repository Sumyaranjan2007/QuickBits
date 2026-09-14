'use client';
import React, { useState, useEffect } from 'react';
import { supabase, updateOrderStatusInSupabase, subscribeToRestaurantOrders } from '../../../lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectOrder, setInspectOrder] = useState<any>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data: supaOrders } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (supaOrders && supaOrders.length > 0) {
          const mapped = supaOrders.map((o: any) => ({
            id: o.id,
            customerName: o.customer_name || 'QuickBite Customer',
            customerEmail: 'customer@quickbite.com',
            customerPhone: o.customer_phone || '+91 99999 99999',
            restaurantName: o.restaurant_id === 'sharief-bhai' ? 'Sharief Bhai Biryani' : (o.restaurant_id === 'burger-co' ? 'Burger & Co.' : o.restaurant_id),
            driverName: o.driver_name || 'Amit Verma (KA-01-EQ-9876)',
            total: Number(o.total) || 0,
            status: o.status,
            paymentMethod: o.payment_method || 'UPI',
            deliveryAddress: o.delivery_address_text || 'Indiranagar, Bengaluru',
            items: (o.order_items || []).map((it: any) => ({
              name: it.name,
              price: Number(it.price) || 0,
              quantity: it.quantity || 1,
            })),
            createdAt: o.created_at || new Date().toISOString(),
          }));
          setOrders(mapped);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Supabase admin orders error:', e);
      }

      // Pre-populate with realistic demo orders
      setOrders([
        { id: 'QB-982144', customerName: 'Rahul Sharma', customerEmail: 'customer@quickbite.com', customerPhone: '+91 99999 99992', restaurantName: 'Burger & Co.', driverName: 'Amit Verma (KA-01-EQ-9876)', total: 512, status: 'OUT_FOR_DELIVERY', paymentMethod: 'UPI', deliveryAddress: '402, Skyline Residency, Indiranagar, Bengaluru', items: [{ name: 'Classic Smash Cheeseburger', price: 289, quantity: 1 }, { name: 'Peri Peri Loaded Fries', price: 159, quantity: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
        { id: 'QB-741290', customerName: 'Priya Patel', customerEmail: 'priya.p@example.com', customerPhone: '+91 99999 88881', restaurantName: 'Spice Symphony', driverName: 'Suresh Kumar (KA-05-AB-1234)', total: 648, status: 'DELIVERED', paymentMethod: 'CARD', deliveryAddress: 'Prestige Tech Park, Outer Ring Road, Bengaluru', items: [{ name: 'Hyderabadi Chicken Dum Biryani', price: 349, quantity: 1 }, { name: 'Paneer Tikka Biryani', price: 299, quantity: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: 'QB-310842', customerName: 'Vikram Mehta', customerEmail: 'vikram.m@example.com', customerPhone: '+91 99999 77773', restaurantName: 'Pizzeria Bella', driverName: 'Mohammed Ali (KA-04-TR-8821)', total: 449, status: 'DELIVERED', paymentMethod: 'UPI', deliveryAddress: '12th Cross, Lavelle Road, Bengaluru', items: [{ name: 'Margherita Burrata Pizza', price: 449, quantity: 1 }], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        { id: 'QB-518293', customerName: 'Sneha Reddy', customerEmail: 'sneha.r@example.com', customerPhone: '+91 99999 66664', restaurantName: 'Burger & Co.', driverName: 'Unassigned', total: 498, status: 'PREPARING', paymentMethod: 'WALLET', deliveryAddress: '27th Main Road, HSR Layout, Bengaluru', items: [{ name: 'Crispy Paneer Truffle Burger', price: 249, quantity: 2 }], createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
      ]);
      setLoading(false);
    };

    loadOrders();

    // Subscribe to realtime order updates across all restaurants
    const unsubscribe = subscribeToRestaurantOrders('', (event: any, newOrder: any) => {
      if (event === 'INSERT' && newOrder) {
        setOrders(prev => [
          {
            id: newOrder.id,
            customerName: newOrder.customer_name || 'Customer',
            customerEmail: 'customer@quickbite.com',
            customerPhone: newOrder.customer_phone || '+91 99999 99999',
            restaurantName: newOrder.restaurant_id || 'QuickBite Partner',
            driverName: 'Assigned Soon',
            total: Number(newOrder.total) || 0,
            status: newOrder.status || 'PENDING',
            paymentMethod: newOrder.payment_method || 'UPI',
            deliveryAddress: newOrder.delivery_address_text || 'Bengaluru',
            items: [],
            createdAt: newOrder.created_at || new Date().toISOString(),
          },
          ...prev,
        ]);
      } else if (event === 'UPDATE' && newOrder) {
        setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: newOrder.status } : o));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatusInSupabase(id, newStatus, `Admin set status to ${newStatus}`);
    } catch (e) {
      console.warn('Supabase order status update error:', e);
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (inspectOrder && inspectOrder.id === id) {
      setInspectOrder({ ...inspectOrder, status: newStatus });
    }
    alert(`Order #${id} status updated to ${newStatus}`);
  };

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-error',
      PENDING: 'badge-warning',
      PREPARING: 'badge-info',
      OUT_FOR_DELIVERY: 'badge-primary',
      READY: 'badge-info',
    };
    return m[s] || 'badge-neutral';
  };

  const filtered = orders.filter(o => {
    if (activeFilter !== 'ALL' && o.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customerName || o.customer?.profile?.firstName || '').toLowerCase().includes(q) ||
        (o.restaurantName || o.restaurant?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">📦 Order Dispatch &amp; Lifecycle Management</h1>
          <p className="page-subtitle">Inspect, update lifecycle stages, reassign couriers, or handle cancellations</p>
        </div>
      </div>

      {/* ─── Search & Filters ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['ALL', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(st => (
            <button
              key={st}
              className={`filter-pill ${activeFilter === st ? 'active' : ''}`}
              onClick={() => setActiveFilter(st)}
              style={{ fontSize: 12 }}
            >
              {st === 'ALL' ? `All (${orders.length})` : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="input"
          placeholder="Search by Order ID, Customer, Restaurant..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: 320, height: 40, fontSize: 13 }}
        />
      </div>

      {/* ─── Orders Table ─── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Delivery Partner</th>
              <th>Total (GMV)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>#{order.id}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{order.customerName || order.customer?.profile?.firstName || 'Rahul Sharma'}</div>
                  <div className="text-sm text-muted">{order.customerPhone || order.customerEmail || 'customer@quickbite.com'}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{order.restaurantName || order.restaurant?.name || 'Burger & Co.'}</td>
                <td className="text-sm">
                  {order.driverName || '🛵 Unassigned'}
                </td>
                <td style={{ fontWeight: 900, color: 'var(--text)' }}>₹{order.total}</td>
                <td>
                  <span className={`badge ${statusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setInspectOrder(order)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6 }}
                  >
                    🔍 Inspect
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <div className="empty-state-title">No orders match filter</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Order Inspection Modal ─── */}
      {inspectOrder && (
        <div className="modal-backdrop" onClick={() => setInspectOrder(null)}>
          <div className="modal-sheet" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Order Details #{inspectOrder.id}</h3>
                <span className={`badge ${statusBadge(inspectOrder.status)}`} style={{ marginTop: 4 }}>
                  {inspectOrder.status}
                </span>
              </div>
              <button onClick={() => setInspectOrder(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, marginBottom: 20 }}>
              <div style={{ background: 'var(--surface-hover)', padding: 14, borderRadius: 10 }}>
                <div><strong>Customer:</strong> {inspectOrder.customerName} ({inspectOrder.customerPhone || inspectOrder.customerEmail})</div>
                <div style={{ marginTop: 4 }}><strong>Address:</strong> {inspectOrder.deliveryAddress}</div>
                <div style={{ marginTop: 4 }}><strong>Restaurant:</strong> {inspectOrder.restaurantName}</div>
                <div style={{ marginTop: 4 }}><strong>Courier:</strong> {inspectOrder.driverName || 'Searching rider...'}</div>
                <div style={{ marginTop: 4 }}><strong>Payment:</strong> {inspectOrder.paymentMethod || 'UPI (Online)'}</div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: 6 }}>Ordered Items:</strong>
                {(inspectOrder.items || []).map((it: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #FAF7F5' }}>
                    <span>{it.quantity}x {it.name}</span>
                    <span style={{ fontWeight: 700 }}>₹{it.price * it.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1.5px solid var(--border)', fontSize: 15, fontWeight: 900 }}>
                  <span>Total (GMV)</span>
                  <span style={{ color: 'var(--primary)' }}>₹{inspectOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Stage Transition Buttons */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sec)', marginBottom: 8, textTransform: 'uppercase' }}>
                Operational State Controls:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {inspectOrder.status !== 'PREPARING' && (
                  <button className="btn btn-sm btn-outline" onClick={() => handleUpdateOrderStatus(inspectOrder.id, 'PREPARING')}>
                    Mark Preparing 🍳
                  </button>
                )}
                {inspectOrder.status !== 'OUT_FOR_DELIVERY' && (
                  <button className="btn btn-sm btn-outline" onClick={() => handleUpdateOrderStatus(inspectOrder.id, 'OUT_FOR_DELIVERY')}>
                    Mark Out for Delivery 🚀
                  </button>
                )}
                {inspectOrder.status !== 'DELIVERED' && (
                  <button className="btn btn-sm btn-success" onClick={() => handleUpdateOrderStatus(inspectOrder.id, 'DELIVERED')}>
                    Mark Delivered 🎉
                  </button>
                )}
                {inspectOrder.status !== 'CANCELLED' && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleUpdateOrderStatus(inspectOrder.id, 'CANCELLED')}>
                    Cancel &amp; Refund ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
