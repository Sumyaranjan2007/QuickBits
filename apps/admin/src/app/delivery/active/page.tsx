'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deliveryApi } from '@quickbite/api-client';

import { buildGoogleMapsUrl, LocationTarget, NavigationResult, NavigationModalState } from './navigation';

type DeliveryStep = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { step: 1, key: 'ACCEPTED', label: 'ACCEPTED', desc: 'Order accepted • Proceed to restaurant' },
  { step: 2, key: 'ARRIVED_RESTAURANT', label: 'RESTAURANT', desc: 'Arrived at pickup location' },
  { step: 3, key: 'PICKED_UP', label: 'PICKED UP', desc: 'Order verified & collected' },
  { step: 4, key: 'ON_THE_WAY', label: 'ON THE WAY', desc: 'En route to customer location' },
  { step: 5, key: 'DELIVERED', label: 'DELIVERED', desc: 'Successfully handed over' },
];

export default function ActiveDeliveryPage() {
  const [currentStep, setCurrentStep] = useState<DeliveryStep>(1);
  const [updating, setUpdating] = useState(false);
  const [completedModal, setCompletedModal] = useState(false);
  const [partnerCoords, setPartnerCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [navModal, setNavModal] = useState<NavigationModalState | null>(null);

  // Active delivery details with real location fields
  const [order, setOrder] = useState({
    id: 'ord-qb1024',
    orderNumber: 'QB1024',
    restaurant: {
      name: 'Burger & Co.',
      address: '100 Feet Road, Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      phone: '+918012345678',
    },
    customer: {
      name: 'Rahul Sharma',
      address: '402, Skyline Residency, Indiranagar, Bengaluru, 560038',
      latitude: 12.9716,
      longitude: 77.5946,
      phone: '+919999999992',
    },
    items: [
      { name: 'Classic Smash Cheeseburger', qty: 2, price: 578 },
      { name: 'Peri Peri Loaded Fries', qty: 1, price: 149 },
    ],
    paymentMethod: 'PAID_ONLINE', // or 'CASH_ON_DELIVERY'
    totalAmount: 727,
    estimatedEarnings: 85,
    distance: '2.4 km',
  });

  // Track driver location for real-time origin in navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setPartnerCoords(coords);
          deliveryApi.updateLocation(coords.latitude, coords.longitude).catch(() => {});
        },
        () => {
          // If permission denied or unavailable, Google Maps will automatically use device's current location
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Hydrate from localStorage or sync with real backend active assignment
  useEffect(() => {
    // 1. Check localStorage for any recently accepted order
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('quickbite_active_delivery');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.restaurant && parsed.customer) {
            setOrder(prev => ({
              ...prev,
              ...parsed,
              restaurant: { ...prev.restaurant, ...parsed.restaurant },
              customer: { ...prev.customer, ...parsed.customer },
            }));
            if (parsed.status) {
              const stepMap: Record<string, DeliveryStep> = {
                ASSIGNED: 1,
                ACCEPTED: 1,
                ARRIVED_AT_RESTAURANT: 2,
                PICKED_UP: 3,
                ON_THE_WAY: 4,
                OUT_FOR_DELIVERY: 4,
                ARRIVED_AT_CUSTOMER: 4,
                DELIVERED: 5,
              };
              if (stepMap[parsed.status]) setCurrentStep(stepMap[parsed.status]);
            }
          }
        }
      } catch {}
    }

    // 2. Sync from backend API
    deliveryApi.getActiveAssignment()
      .then(res => {
        const ad = res.data as any;
        if (ad && ad.order) {
          const stepMap: Record<string, DeliveryStep> = {
            ASSIGNED: 1,
            ACCEPTED: 1,
            ARRIVED_AT_RESTAURANT: 2,
            PICKED_UP: 3,
            ON_THE_WAY: 4,
            OUT_FOR_DELIVERY: 4,
            ARRIVED_AT_CUSTOMER: 4,
            DELIVERED: 5,
          };
          if (stepMap[ad.status]) {
            setCurrentStep(stepMap[ad.status]);
          }

          const o = ad.order;
          const r = o.restaurant || {};
          const dAddr = o.deliveryAddress || {};
          const c = o.customer || {};

          // Assemble real address string
          const customerAddressStr = [
            dAddr.addressLine1,
            dAddr.addressLine2,
            dAddr.city,
            dAddr.state,
            dAddr.postalCode,
          ].filter(Boolean).join(', ');

          const customerNameStr = c.firstName && c.lastName
            ? `${c.firstName} ${c.lastName}`
            : c.name || (c.profile ? `${c.profile.firstName} ${c.profile.lastName}` : order.customer.name);

          const syncedOrder = {
            id: ad.id,
            orderNumber: o.orderNumber || (ad.orderId ? `QB-${ad.orderId.slice(-4)}` : order.orderNumber),
            restaurant: {
              name: r.name || order.restaurant.name,
              address: r.address || order.restaurant.address,
              latitude: typeof r.latitude === 'number' ? r.latitude : order.restaurant.latitude,
              longitude: typeof r.longitude === 'number' ? r.longitude : order.restaurant.longitude,
              phone: r.phone || order.restaurant.phone,
            },
            customer: {
              name: customerNameStr,
              address: customerAddressStr || order.customer.address,
              latitude: typeof dAddr.latitude === 'number' ? dAddr.latitude : order.customer.latitude,
              longitude: typeof dAddr.longitude === 'number' ? dAddr.longitude : order.customer.longitude,
              phone: c.phone || order.customer.phone,
            },
            items: o.items?.length
              ? o.items.map((item: any) => ({
                  name: item.menuItem?.name || item.name || 'Food Item',
                  qty: item.quantity || 1,
                  price: Number(item.price) || 0,
                }))
              : order.items,
            paymentMethod: o.paymentMethod || order.paymentMethod,
            totalAmount: Number(o.total) || order.totalAmount,
            estimatedEarnings: Number(ad.earnings) || Number(ad.deliveryFee) || order.estimatedEarnings,
            distance: ad.distance ? `${ad.distance} km` : order.distance,
          };

          setOrder(syncedOrder);
          try {
            localStorage.setItem('quickbite_active_delivery', JSON.stringify({ ...syncedOrder, status: ad.status }));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Pre-calculate real navigation URLs
  const restaurantNav = buildGoogleMapsUrl(
    {
      name: order.restaurant.name,
      address: order.restaurant.address,
      latitude: order.restaurant.latitude,
      longitude: order.restaurant.longitude,
    },
    partnerCoords
  );

  const customerNav = buildGoogleMapsUrl(
    {
      name: order.customer.name,
      address: order.customer.address,
      latitude: order.customer.latitude,
      longitude: order.customer.longitude,
    },
    partnerCoords
  );

  /**
   * Action handler for NAVIGATE buttons.
   * Directly opens Google Maps on Android / Mobile browser.
   * If location is missing, shows informative error without opening broken map.
   */
  const handleNavigate = (targetType: 'RESTAURANT' | 'CUSTOMER', e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const nav = targetType === 'RESTAURANT' ? restaurantNav : customerNav;
    const destName = targetType === 'RESTAURANT' ? order.restaurant.name : order.customer.name;

    if (!nav.success || !nav.url) {
      setNavModal({
        isOpen: true,
        type: 'UNAVAILABLE',
        title: nav.errorTitle || 'Location unavailable',
        message: nav.errorMessage || 'This delivery does not have a valid destination.',
      });
      return;
    }

    const mapsUrl = nav.url;

    // Launch Google Maps. On Android, this intent directly opens the Google Maps app if installed.
    try {
      const opened = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        // Direct navigation fallback in case popups are blocked in standalone PWA/webview
        window.location.href = mapsUrl;
      }
    } catch {
      setNavModal({
        isOpen: true,
        type: 'FALLBACK',
        title: 'Unable to open Google Maps',
        message: `Could not launch Google Maps directly for ${destName}. Tap below to view directions in your browser.`,
        fallbackUrl: mapsUrl,
      });
    }
  };

  // Step Action Handlers
  const handleNextStep = async () => {
    setUpdating(true);
    try {
      if (currentStep === 1) {
        await deliveryApi.updateAssignmentStatus(order.id, 'ARRIVED_AT_RESTAURANT').catch(() => {});
        setCurrentStep(2);
      } else if (currentStep === 2) {
        await deliveryApi.updateAssignmentStatus(order.id, 'PICKED_UP').catch(() => {});
        setCurrentStep(3);
      } else if (currentStep === 3) {
        await deliveryApi.updateAssignmentStatus(order.id, 'ON_THE_WAY').catch(() => {});
        setCurrentStep(4);
      } else if (currentStep === 4) {
        await deliveryApi.updateAssignmentStatus(order.id, 'DELIVERED').catch(() => {});
        setCurrentStep(5);
        setCompletedModal(true);
        try {
          localStorage.removeItem('quickbite_active_delivery');
        } catch {}
      }
    } finally {
      setUpdating(false);
    }
  };

  // Determines current active stop in delivery flow
  const isPickupActive = currentStep < 3;
  const isDropoffActive = currentStep >= 3 && currentStep < 5;

  return (
    <>
      {/* ─── Screen Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            Active Delivery
          </h1>
          <p style={{ fontSize: 11, color: '#7A6A5E', margin: '2px 0 0' }}>
            Live order execution & navigation
          </p>
        </div>
        <span style={{
          background: '#FFFBEB',
          color: '#B45309',
          border: '1px solid #FDE68A',
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 800,
        }}>
          Order #{order.orderNumber}
        </span>
      </div>

      {/* ─── 1. RESTAURANT INFORMATION (PICKUP) ─── */}
      <div
        className="delivery-card"
        style={{
          border: isPickupActive ? '2px solid #4A0A10' : '1px solid #EADBCE',
          position: 'relative',
        }}
      >
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>🏪</span>
            <span>RESTAURANT PICKUP</span>
          </span>
          {currentStep >= 3 ? (
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>✓ COLLECTED</span>
          ) : currentStep === 2 ? (
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 800, background: '#F0FDF4', padding: '2px 8px', borderRadius: 8 }}>
              ✓ AT RESTAURANT
            </span>
          ) : (
            <span style={{ fontSize: 10, color: '#FFFFFF', background: '#4A0A10', fontWeight: 800, padding: '2px 8px', borderRadius: 8 }}>
              NEXT STOP
            </span>
          )}
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
          {order.restaurant.name}
        </div>
        <div style={{ fontSize: 12, color: '#7A6A5E', marginTop: 3, lineHeight: 1.4 }}>
          {order.restaurant.address}
        </div>

        {order.restaurant.latitude && order.restaurant.longitude && (
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span>
            <span>GPS Coords: {order.restaurant.latitude.toFixed(4)}, {order.restaurant.longitude.toFixed(4)}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <a
            href={`tel:${order.restaurant.phone}`}
            className="delivery-secondary-btn"
            style={{ flex: 1 }}
          >
            <span>📞</span>
            <span>CALL RESTAURANT</span>
          </a>
          <a
            href={restaurantNav.url || '#'}
            onClick={(e) => handleNavigate('RESTAURANT', e)}
            target="_blank"
            rel="noopener noreferrer"
            className="delivery-secondary-btn"
            style={{
              flex: 1,
              background: isPickupActive ? '#4A0A10' : '#FFFFFF',
              color: isPickupActive ? '#FFFFFF' : '#4A0A10',
              borderColor: '#4A0A10',
              fontWeight: 800,
            }}
            id="btn-navigate-restaurant"
            title="Navigate to Restaurant on Google Maps"
          >
            <span>🧭</span>
            <span>NAVIGATE</span>
          </a>
        </div>
      </div>

      {/* ─── 2. ORDER DETAILS ─── */}
      <div className="delivery-card">
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>📋</span>
            <span>ORDER DETAILS</span>
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: order.paymentMethod === 'CASH_ON_DELIVERY' ? '#B45309' : '#047857',
            background: order.paymentMethod === 'CASH_ON_DELIVERY' ? '#FFFBEB' : '#F0FDF4',
            padding: '3px 8px',
            borderRadius: 8,
            border: `1px solid ${order.paymentMethod === 'CASH_ON_DELIVERY' ? '#FDE68A' : '#A7F3D0'}`,
          }}>
            {order.paymentMethod === 'CASH_ON_DELIVERY' ? '⚠️ COLLECT CASH' : '✅ PAID ONLINE'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: idx < order.items.length - 1 ? '1px dashed #EADBCE' : 'none', paddingBottom: idx < order.items.length - 1 ? 8 : 0 }}>
              <div style={{ fontWeight: 700, color: '#1A1A1A' }}>
                <span style={{ color: '#4A0A10', fontWeight: 900, marginRight: 8 }}>{item.qty}×</span>
                <span>{item.name}</span>
              </div>
              <div style={{ fontWeight: 800, color: '#7A6A5E' }}>
                ₹{item.price}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #EADBCE' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#7A6A5E' }}>
            Estimated Earnings
          </span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#047857' }}>
            ₹{order.estimatedEarnings}
          </span>
        </div>
      </div>

      {/* ─── 3. CUSTOMER INFORMATION (DROP-OFF) ─── */}
      <div
        className="delivery-card"
        style={{
          border: isDropoffActive ? '2px solid #4A0A10' : '1px solid #EADBCE',
          position: 'relative',
        }}
      >
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>🏠</span>
            <span>CUSTOMER DROP</span>
          </span>
          {currentStep === 5 ? (
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>✓ DELIVERED</span>
          ) : isDropoffActive ? (
            <span style={{ fontSize: 10, color: '#FFFFFF', background: '#4A0A10', fontWeight: 800, padding: '2px 8px', borderRadius: 8 }}>
              NEXT STOP
            </span>
          ) : null}
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
          {order.customer.name}
        </div>
        <div style={{ fontSize: 12, color: '#7A6A5E', marginTop: 3, lineHeight: 1.4 }}>
          {order.customer.address}
        </div>

        {order.customer.latitude && order.customer.longitude && (
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📍</span>
            <span>GPS Coords: {order.customer.latitude.toFixed(4)}, {order.customer.longitude.toFixed(4)}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <a
            href={`tel:${order.customer.phone}`}
            className="delivery-secondary-btn"
            style={{ flex: 1 }}
          >
            <span>📞</span>
            <span>CALL CUSTOMER</span>
          </a>
          <a
            href={customerNav.url || '#'}
            onClick={(e) => handleNavigate('CUSTOMER', e)}
            target="_blank"
            rel="noopener noreferrer"
            className="delivery-secondary-btn"
            style={{
              flex: 1,
              background: isDropoffActive ? '#4A0A10' : '#FFFFFF',
              color: isDropoffActive ? '#FFFFFF' : '#4A0A10',
              borderColor: '#4A0A10',
              fontWeight: 800,
            }}
            id="btn-navigate-customer"
            title="Navigate to Customer on Google Maps"
          >
            <span>🧭</span>
            <span>NAVIGATE</span>
          </a>
        </div>
      </div>

      {/* ─── 4. DELIVERY PROGRESS TIMELINE ─── */}
      <div className="delivery-card">
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>🚚</span>
            <span>DELIVERY PROGRESS</span>
          </span>
          <span style={{ fontSize: 12, color: '#4A0A10', fontWeight: 800 }}>
            Step {currentStep} of 5
          </span>
        </div>

        <div className="delivery-stepper">
          {STEPS.map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="delivery-step-item">
                <div className="delivery-step-left">
                  <div className={`delivery-step-circle ${isDone ? 'completed' : isCurrent ? 'active' : ''}`}>
                    {isDone ? '✓' : s.step}
                  </div>
                  {s.step < 5 && (
                    <div className={`delivery-step-line ${isDone ? 'completed' : ''}`} />
                  )}
                </div>
                <div className="delivery-step-right">
                  <div className={`delivery-step-title ${isCurrent ? 'active' : ''}`}>
                    {s.label}
                  </div>
                  <div className="delivery-step-desc">
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. ACTIVE STEP NAVIGATION & COMPLETION ACTIONS ─── */}
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Step 1: Nav to Restaurant + Mark Arrived */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="delivery-primary-btn"
              onClick={(e) => handleNavigate('RESTAURANT', e)}
              style={{
                background: '#4A0A10',
                padding: '16px 20px',
                fontSize: 15,
                letterSpacing: 0.3,
              }}
              id="btn-primary-navigate-restaurant"
            >
              <span>🧭</span>
              <span>NAVIGATE TO RESTAURANT</span>
            </button>

            <button
              type="button"
              className="delivery-secondary-btn"
              onClick={handleNextStep}
              disabled={updating}
              style={{
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 800,
                width: '100%',
              }}
              id="btn-arrived-restaurant"
            >
              {updating ? 'Updating Status...' : '📍 REACHED RESTAURANT'}
            </button>
          </div>
        )}

        {/* Step 2: Arrived at restaurant -> Confirm pickup */}
        {currentStep === 2 && (
          <button
            type="button"
            className="delivery-primary-btn"
            onClick={handleNextStep}
            disabled={updating}
            style={{
              padding: '16px 20px',
              fontSize: 15,
              letterSpacing: 0.3,
            }}
            id="btn-confirm-pickup"
          >
            {updating ? 'Updating Status...' : '📦 CONFIRM ORDER PICKUP'}
          </button>
        )}

        {/* Step 3: Picked up -> Navigate to customer */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="delivery-primary-btn"
              onClick={(e) => {
                handleNavigate('CUSTOMER', e);
                // Also automatically transition to ON_THE_WAY if driver is starting trip
                handleNextStep();
              }}
              style={{
                background: '#4A0A10',
                padding: '16px 20px',
                fontSize: 15,
                letterSpacing: 0.3,
              }}
              id="btn-primary-navigate-customer"
            >
              <span>🧭</span>
              <span>NAVIGATE TO CUSTOMER</span>
            </button>

            <button
              type="button"
              className="delivery-secondary-btn"
              onClick={handleNextStep}
              disabled={updating}
              style={{
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 800,
                width: '100%',
              }}
              id="btn-start-delivery"
            >
              {updating ? 'Updating Status...' : '🛵 ON THE WAY TO CUSTOMER'}
            </button>
          </div>
        )}

        {/* Step 4: En route to customer -> Complete delivery */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="delivery-secondary-btn"
              onClick={(e) => handleNavigate('CUSTOMER', e)}
              style={{
                padding: '14px 20px',
                fontSize: 14,
                fontWeight: 800,
                width: '100%',
                borderColor: '#4A0A10',
                color: '#4A0A10',
              }}
              id="btn-reopen-customer-nav"
            >
              <span>🧭</span>
              <span>RE-OPEN GOOGLE MAPS NAVIGATION</span>
            </button>

            <button
              type="button"
              className="delivery-primary-btn"
              onClick={handleNextStep}
              disabled={updating}
              style={{
                padding: '16px 20px',
                fontSize: 15,
                letterSpacing: 0.3,
                background: '#047857',
              }}
              id="btn-complete-delivery"
            >
              {updating ? 'Completing Trip...' : '✅ COMPLETE DELIVERY'}
            </button>
          </div>
        )}

        {/* Step 5: Delivered */}
        {currentStep === 5 && (
          <Link
            href="/delivery"
            className="delivery-primary-btn"
            style={{
              padding: '16px 20px',
              fontSize: 15,
              background: '#047857',
            }}
          >
            🎉 TRIP COMPLETED — BACK TO HOME
          </Link>
        )}
      </div>

      {/* ─── Navigation Error / Fallback Modal ─── */}
      {navModal?.isOpen && (
        <div className="delivery-modal-backdrop" onClick={() => setNavModal(null)}>
          <div className="delivery-modal-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>
              {navModal.type === 'UNAVAILABLE' ? '⚠️' : '🗺️'}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 8px' }}>
              {navModal.title}
            </h3>
            <p style={{ fontSize: 13, color: '#7A6A5E', lineHeight: 1.5, margin: '0 0 20px' }}>
              {navModal.message}
            </p>

            {navModal.fallbackUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={navModal.fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="delivery-primary-btn"
                  onClick={() => setNavModal(null)}
                >
                  🌐 OPEN IN BROWSER
                </a>
                <button
                  type="button"
                  className="delivery-secondary-btn"
                  onClick={() => setNavModal(null)}
                >
                  DISMISS
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="delivery-primary-btn"
                onClick={() => setNavModal(null)}
              >
                GOT IT
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Trip Completed Modal ─── */}
      {completedModal && (
        <div className="delivery-modal-backdrop" onClick={() => setCompletedModal(false)}>
          <div className="delivery-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                Order Delivered!
              </h3>
              <p style={{ fontSize: 13, color: '#7A6A5E', margin: '6px 0 16px' }}>
                Great work! You earned ₹{order.estimatedEarnings} for this trip.
              </p>

              <div style={{ background: '#FFFFFF', border: '1px solid #EADBCE', borderRadius: 16, padding: '16px', marginBottom: 20, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: '#7A6A5E' }}>Base Fare</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>₹50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: '#7A6A5E' }}>Distance Incentive ({order.distance})</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>₹25</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: '#7A6A5E' }}>Customer Tip</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#047857' }}>₹10</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: 8, borderTop: '1px solid #EADBCE' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>Total Payout</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>₹{order.estimatedEarnings}</span>
                </div>
              </div>

              <Link
                href="/delivery"
                className="delivery-primary-btn"
                onClick={() => setCompletedModal(false)}
              >
                RETURN TO DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
