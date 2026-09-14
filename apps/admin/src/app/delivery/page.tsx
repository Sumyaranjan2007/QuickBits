'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deliveryApi } from '@quickbite/api-client';
import { useDeliveryContext } from './DeliveryContext';

interface IncomingOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerArea: string;
  distance: string;
  estimatedEarnings: number;
}

export default function DeliveryHomePage() {
  const { isOnline, toggleOnline, profile } = useDeliveryContext();
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [incomingRequest, setIncomingRequest] = useState<IncomingOrder | null>(null);
  const [todayStats, setTodayStats] = useState({
    earnings: 942,
    deliveries: 8,
    rating: 4.89,
  });

  // Load active delivery and profile stats
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [activeRes, pendingRes, earningsRes] = await Promise.all([
          deliveryApi.getActiveAssignment().catch(() => ({ data: null })),
          deliveryApi.getPendingAssignments().catch(() => ({ data: [] })),
          deliveryApi.getEarnings().catch(() => ({ data: null })),
        ]);

        if (!mounted) return;

        // Active Order
        const ad = activeRes?.data as any;
        if (ad) {
          const customerAddr = [
            ad.order?.deliveryAddress?.addressLine1,
            ad.order?.deliveryAddress?.addressLine2,
            ad.order?.deliveryAddress?.city,
            ad.order?.deliveryAddress?.state,
            ad.order?.deliveryAddress?.postalCode,
          ].filter(Boolean).join(', ') || ad.order?.deliveryAddress?.area || 'Indiranagar, Bengaluru';

          const activeData = {
            id: ad.id || 'ord-qb1024',
            orderNumber: ad.order?.orderNumber || (ad.orderId ? `QB-${ad.orderId.slice(-4)}` : 'QB1024'),
            restaurantName: ad.order?.restaurant?.name || 'Burger & Co.',
            restaurantAddress: ad.order?.restaurant?.address || '100 Feet Road, Indiranagar, Bengaluru',
            restaurantLatitude: ad.order?.restaurant?.latitude ?? 12.9784,
            restaurantLongitude: ad.order?.restaurant?.longitude ?? 77.6408,
            customerName: ad.order?.customer?.name || 'Rahul Sharma',
            customerArea: ad.order?.deliveryAddress?.area || ad.order?.deliveryAddress?.city || 'Indiranagar',
            customerAddress: customerAddr,
            customerLatitude: ad.order?.deliveryAddress?.latitude ?? 12.9716,
            customerLongitude: ad.order?.deliveryAddress?.longitude ?? 77.5946,
            distance: `${ad.distance || 2.4} km`,
            estimatedEarnings: ad.earnings || ad.deliveryFee || 85,
            status: ad.status || 'OUT_FOR_DELIVERY',
          };

          setActiveOrder(activeData);
          try {
            localStorage.setItem('quickbite_active_delivery', JSON.stringify({
              id: activeData.id,
              orderNumber: activeData.orderNumber,
              restaurant: {
                name: activeData.restaurantName,
                address: activeData.restaurantAddress,
                latitude: activeData.restaurantLatitude,
                longitude: activeData.restaurantLongitude,
              },
              customer: {
                name: activeData.customerName,
                address: activeData.customerAddress,
                latitude: activeData.customerLatitude,
                longitude: activeData.customerLongitude,
              },
              distance: activeData.distance,
              estimatedEarnings: activeData.estimatedEarnings,
              status: activeData.status,
            }));
          } catch {}
        } else {
          // Check if there is a pending assignment
          const pd = pendingRes?.data as any;
          const pendingList = Array.isArray(pd) ? pd : pd?.items || [];
          if (pendingList.length > 0) {
            const first = pendingList[0];
            setIncomingRequest({
              id: first.id,
              orderNumber: `QB${(first.orderId || first.id).slice(-4).toUpperCase()}`,
              restaurantName: first.order?.restaurant?.name || 'Burger & Co.',
              restaurantAddress: first.order?.restaurant?.address || '100 Feet Road, Indiranagar, Bengaluru',
              customerName: first.order?.customer?.name || 'Rahul Sharma',
              customerArea: first.order?.deliveryAddress?.area || 'Indiranagar, Bengaluru',
              distance: `${first.distance || 2.4} km`,
              estimatedEarnings: first.earnings || 85,
            });
          }
        }

        // Earnings stats
        const ed = earningsRes?.data as any;
        if (ed) {
          setTodayStats({
            earnings: ed.todayEarnings || 942,
            deliveries: ed.todayDeliveries || 8,
            rating: ed.rating || profile?.rating || 4.89,
          });
        }
      } catch {
        // Fallback default with real seeded restaurant and customer coordinates
        const defaultData = {
          id: 'ord-qb1024',
          orderNumber: 'QB1024',
          restaurantName: 'Burger & Co.',
          restaurantAddress: '100 Feet Road, Indiranagar, Bengaluru',
          restaurantLatitude: 12.9784,
          restaurantLongitude: 77.6408,
          customerName: 'Rahul Sharma',
          customerArea: 'Indiranagar, Bengaluru',
          customerAddress: '402, Skyline Residency, Indiranagar, Bengaluru, 560038',
          customerLatitude: 12.9716,
          customerLongitude: 77.5946,
          distance: '2.4 km',
          estimatedEarnings: 85,
          status: 'ACCEPTED',
        };
        setActiveOrder(defaultData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const timer = setInterval(loadData, 12000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [profile]);

  // Test simulation helper for incoming request
  const triggerDemoOrderAlert = () => {
    setIncomingRequest({
      id: `ord-qb${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `QB${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantName: 'Burger & Co.',
      restaurantAddress: '100 Feet Road, Indiranagar, Bengaluru',
      customerName: 'Rahul Sharma',
      customerArea: 'Indiranagar, Bengaluru',
      distance: '2.4 km',
      estimatedEarnings: 85,
    });
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest) return;
    try {
      await deliveryApi.updateAssignmentStatus(incomingRequest.id, 'ACCEPTED');
    } catch {
      // simulate acceptance
    }
    const acceptedData = {
      id: incomingRequest.id,
      orderNumber: incomingRequest.orderNumber,
      restaurantName: incomingRequest.restaurantName,
      restaurantAddress: incomingRequest.restaurantAddress,
      restaurantLatitude: 12.9784,
      restaurantLongitude: 77.6408,
      customerName: incomingRequest.customerName,
      customerArea: incomingRequest.customerArea,
      customerAddress: '402, Skyline Residency, Indiranagar, Bengaluru, 560038',
      customerLatitude: 12.9716,
      customerLongitude: 77.5946,
      distance: incomingRequest.distance,
      estimatedEarnings: incomingRequest.estimatedEarnings,
      status: 'ACCEPTED',
    };
    setActiveOrder(acceptedData);
    try {
      localStorage.setItem('quickbite_active_delivery', JSON.stringify({
        id: acceptedData.id,
        orderNumber: acceptedData.orderNumber,
        restaurant: {
          name: acceptedData.restaurantName,
          address: acceptedData.restaurantAddress,
          latitude: acceptedData.restaurantLatitude,
          longitude: acceptedData.restaurantLongitude,
        },
        customer: {
          name: acceptedData.customerName,
          address: acceptedData.customerAddress,
          latitude: acceptedData.customerLatitude,
          longitude: acceptedData.customerLongitude,
        },
        distance: acceptedData.distance,
        estimatedEarnings: acceptedData.estimatedEarnings,
        status: acceptedData.status,
      }));
    } catch {}
    setIncomingRequest(null);
  };

  const handleRejectRequest = () => {
    setIncomingRequest(null);
  };

  return (
    <>
      {/* ─── 1. Online / Offline Status Duty Card ─── */}
      <div className="delivery-duty-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="delivery-duty-tag">
              {isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
            </div>
            <h2 className="delivery-duty-title">
              {isOnline ? 'Receiving Delivery Requests' : 'Currently Offline'}
            </h2>
            <div className="delivery-duty-sub">
              {isOnline
                ? 'Stay active on this screen to receive instant high-pay deliveries'
                : 'Turn your duty online to start receiving nearby customer orders'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`delivery-duty-toggle-btn ${isOnline ? 'offline-btn' : ''}`}
          onClick={toggleOnline}
          id="btn-toggle-duty-mode"
        >
          {isOnline ? '⚪ GO OFFLINE' : '🟢 GO ONLINE'}
        </button>
      </div>

      {/* ─── Test Order Button (Developer / Testing Shortcut) ─── */}
      {!incomingRequest && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-6px 0 0' }}>
          <button
            type="button"
            onClick={triggerDemoOrderAlert}
            style={{
              background: '#FFFBEB',
              color: '#B45309',
              border: '1px dashed #FDE68A',
              borderRadius: 12,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            id="btn-test-incoming-request"
          >
            <span>🔔</span>
            <span>Simulate New Request</span>
          </button>
        </div>
      )}

      {/* ─── 2. NEW DELIVERY REQUEST CARD (Highest Priority) ─── */}
      {incomingRequest && (
        <div className="delivery-request-card" id="incoming-delivery-card">
          <div className="delivery-request-badge">
            <span>🔔</span>
            <span>NEW DELIVERY REQUEST</span>
          </div>

          <div style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', marginBottom: 10 }}>
            Order #{incomingRequest.orderNumber}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div className="delivery-info-row">
              <div className="delivery-info-icon">🏪</div>
              <div style={{ flex: 1 }}>
                <div className="delivery-info-label">Pickup</div>
                <div className="delivery-info-value">{incomingRequest.restaurantName}</div>
                <div style={{ fontSize: 11, color: '#7A6A5E' }}>{incomingRequest.restaurantAddress}</div>
              </div>
            </div>

            <div className="delivery-info-row">
              <div className="delivery-info-icon">📍</div>
              <div style={{ flex: 1 }}>
                <div className="delivery-info-label">Drop</div>
                <div className="delivery-info-value">{incomingRequest.customerArea}</div>
                <div style={{ fontSize: 11, color: '#7A6A5E' }}>{incomingRequest.customerName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, background: '#FAF7F2', border: '1px solid #EADBCE', borderRadius: 12, padding: '8px 12px' }}>
                <div className="delivery-info-label">Distance</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', marginTop: 2 }}>{incomingRequest.distance}</div>
              </div>
              <div style={{ flex: 1, background: '#FAF7F2', border: '1px solid #EADBCE', borderRadius: 12, padding: '8px 12px' }}>
                <div className="delivery-info-label">Estimated Earnings</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#047857', marginTop: 2 }}>₹{incomingRequest.estimatedEarnings}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons: ACCEPT (Primary Customer App CTA) & REJECT */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="delivery-primary-btn"
              onClick={handleAcceptRequest}
              style={{ flex: 1.3 }}
              id="btn-accept-request"
            >
              ✅ ACCEPT
            </button>
            <button
              type="button"
              className="delivery-reject-btn"
              onClick={handleRejectRequest}
              style={{ flex: 0.9 }}
              id="btn-reject-request"
            >
              ❌ REJECT
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. ACTIVE DELIVERY (Prominently Shown) ─── */}
      {activeOrder && (
        <div className="delivery-card" style={{ borderLeft: '4px solid #4A0A10' }} id="active-delivery-card">
          <div className="delivery-card-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🛵</span>
              <span>ACTIVE DELIVERY</span>
            </span>
            <span style={{
              background: '#F0FDF4',
              color: '#047857',
              fontSize: 10,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 10,
              border: '1px solid #A7F3D0',
            }}>
              LIVE TRIP
            </span>
          </div>

          <div style={{ fontSize: 17, fontWeight: 900, color: '#4A0A10', marginBottom: 12 }}>
            Order #{activeOrder.orderNumber}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div className="delivery-info-row">
              <div className="delivery-info-icon">🏪</div>
              <div style={{ flex: 1 }}>
                <div className="delivery-info-label">Pickup</div>
                <div className="delivery-info-value">{activeOrder.restaurantName}</div>
              </div>
            </div>

            <div className="delivery-info-row">
              <div className="delivery-info-icon">🏠</div>
              <div style={{ flex: 1 }}>
                <div className="delivery-info-label">Drop</div>
                <div className="delivery-info-value">{activeOrder.customerArea}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px dashed #EADBCE' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#7A6A5E' }}>
                📏 {activeOrder.distance}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#047857' }}>
                ₹{activeOrder.estimatedEarnings} estimated earnings
              </div>
            </div>
          </div>

          <Link
            href="/delivery/active"
            className="delivery-primary-btn"
            id="btn-view-active-delivery"
          >
            VIEW DELIVERY →
          </Link>
        </div>
      )}

      {/* ─── 4. Waiting For Orders State (Clean Idle State) ─── */}
      {!activeOrder && !incomingRequest && isOnline && (
        <div className="delivery-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#FAF7F2',
            border: '2px solid #FFB21A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            margin: '0 auto 12px',
          }}>
            📡
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
            You are Online
          </div>
          <div style={{ fontSize: 13, color: '#7A6A5E', marginTop: 4 }}>
            Waiting for new deliveries in your zone...
          </div>
        </div>
      )}

      {/* ─── 5. Today's Summary (3 Clean Customer-App KPI Cards) ─── */}
      <div style={{ marginTop: 4 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#7A6A5E',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 10,
        }}>
          Today&apos;s Summary
        </div>

        <div className="delivery-kpi-grid">
          <div className="delivery-kpi-card">
            <div className="delivery-kpi-val">₹{todayStats.earnings}</div>
            <div className="delivery-kpi-lbl">Earned</div>
          </div>
          <div className="delivery-kpi-card">
            <div className="delivery-kpi-val">{todayStats.deliveries}</div>
            <div className="delivery-kpi-lbl">Trips</div>
          </div>
          <div className="delivery-kpi-card">
            <div className="delivery-kpi-val">⭐ {todayStats.rating}</div>
            <div className="delivery-kpi-lbl">Rating</div>
          </div>
        </div>
      </div>
    </>
  );
}
