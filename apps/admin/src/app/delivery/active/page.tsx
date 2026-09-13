'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deliveryApi } from '@quickbite/api-client';

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

  // Active delivery details
  const [order, setOrder] = useState({
    id: 'ord-qb1024',
    orderNumber: 'QB1024',
    restaurant: {
      name: 'Spice Garden Bistro',
      address: 'Shop 14, 100 Feet Rd, Indiranagar, Bengaluru',
      phone: '+91 98450 12345',
    },
    customer: {
      name: 'Aarav Sharma',
      address: 'Flat 402, Sunshine Heights, 12th Main, Domlur',
      phone: '+91 98765 11223',
    },
    items: [
      { name: 'Paneer Tikka Roll', qty: 2, price: 340 },
      { name: 'Hyderabadi Veg Biryani', qty: 1, price: 280 },
      { name: 'Gulab Jamun (2 pcs)', qty: 1, price: 80 },
    ],
    paymentMethod: 'PAID_ONLINE', // or 'CASH_ON_DELIVERY'
    totalAmount: 700,
    estimatedEarnings: 85,
    distance: '3.2 km',
  });

  // Try to sync with real API active assignment if available
  useEffect(() => {
    deliveryApi.getActiveAssignment()
      .then(res => {
        const ad = res.data as any;
        if (ad) {
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
          if (ad.order) {
            setOrder(prev => ({
              ...prev,
              id: ad.id,
              orderNumber: ad.order?.orderNumber || (ad.orderId ? `QB-${ad.orderId.slice(-4)}` : prev.orderNumber),
              restaurant: {
                name: ad.order?.restaurant?.name || prev.restaurant.name,
                address: ad.order?.restaurant?.address || prev.restaurant.address,
                phone: ad.order?.restaurant?.phone || prev.restaurant.phone,
              },
              customer: {
                name: ad.order?.customer?.name || prev.customer.name,
                address: ad.order?.deliveryAddress?.addressLine1 || ad.order?.deliveryAddress?.area || prev.customer.address,
                phone: ad.order?.customer?.phone || prev.customer.phone,
              },
              paymentMethod: ad.order?.paymentMethod || prev.paymentMethod,
              totalAmount: ad.order?.total || prev.totalAmount,
              estimatedEarnings: ad.earnings || prev.estimatedEarnings,
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

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
        await deliveryApi.updateAssignmentStatus(order.id, 'OUT_FOR_DELIVERY').catch(() => {});
        setCurrentStep(4);
      } else if (currentStep === 4) {
        await deliveryApi.updateAssignmentStatus(order.id, 'DELIVERED').catch(() => {});
        setCurrentStep(5);
        setCompletedModal(true);
      }
    } finally {
      setUpdating(false);
    }
  };

  // Label & Action for the NEXT prominent button
  const getNextActionConfig = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Heading to Restaurant',
          actionText: '📍 MARK ARRIVED AT RESTAURANT',
        };
      case 2:
        return {
          title: 'At Restaurant — Collect Order',
          actionText: '📦 MARK PICKED UP',
        };
      case 3:
        return {
          title: 'Order Picked Up',
          actionText: '🛵 START DELIVERY TO CUSTOMER',
        };
      case 4:
        return {
          title: 'At Customer Location',
          actionText: '✅ MARK DELIVERED',
        };
      case 5:
        return {
          title: 'Delivery Completed! 🎉',
          actionText: 'RETURN TO HOME',
        };
    }
  };

  const nextAction = getNextActionConfig();

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

      {/* ─── 1. RESTAURANT INFORMATION ─── */}
      <div className="delivery-card">
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>🏪</span>
            <span>RESTAURANT PICKUP</span>
          </span>
          {currentStep >= 3 && (
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>✓ COLLECTED</span>
          )}
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
          {order.restaurant.name}
        </div>
        <div style={{ fontSize: 12, color: '#7A6A5E', marginTop: 3 }}>
          {order.restaurant.address}
        </div>

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
            href={`https://maps.google.com/?q=${encodeURIComponent(order.restaurant.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="delivery-secondary-btn"
            style={{ flex: 1 }}
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

      {/* ─── 3. CUSTOMER INFORMATION ─── */}
      <div className="delivery-card">
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>🏠</span>
            <span>CUSTOMER DROP</span>
          </span>
          {currentStep === 5 && (
            <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>✓ DELIVERED</span>
          )}
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>
          {order.customer.name}
        </div>
        <div style={{ fontSize: 12, color: '#7A6A5E', marginTop: 3 }}>
          {order.customer.address}
        </div>

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
            href={`https://maps.google.com/?q=${encodeURIComponent(order.customer.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="delivery-secondary-btn"
            style={{ flex: 1 }}
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
            <span>⏱️</span>
            <span>DELIVERY PROGRESS</span>
          </span>
          <span style={{ fontSize: 11, color: '#4A0A10', fontWeight: 800 }}>
            STEP {currentStep} OF 5
          </span>
        </div>

        <div className="delivery-stepper">
          {STEPS.map((s, idx) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.key} className="delivery-step-item">
                <div className="delivery-step-dot-col">
                  <div className={`delivery-step-dot ${isDone ? 'done' : isCurrent ? 'current' : ''}`}>
                    {isDone ? '✓' : s.step}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`delivery-step-line ${isDone ? 'done' : ''}`} />
                  )}
                </div>
                <div className="delivery-step-text-col">
                  <div className={`delivery-step-label ${isCurrent ? 'current' : ''}`}>
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

      {/* ─── 5. PROMINENT NEXT IMPORTANT ACTION BUTTON ─── */}
      <div style={{
        position: 'sticky',
        bottom: 80,
        zIndex: 35,
        margin: '0 -4px',
        padding: '10px 4px',
        background: 'linear-gradient(to top, rgba(250,247,242,1) 85%, rgba(250,247,242,0) 100%)',
      }}>
        {currentStep < 5 ? (
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
            id="btn-next-delivery-step"
          >
            {updating ? 'Updating Status...' : nextAction.actionText}
          </button>
        ) : (
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

      {/* ─── Trip Completed Modal ─── */}
      {completedModal && (
        <div className="delivery-modal-backdrop" onClick={() => setCompletedModal(false)}>
          <div className="delivery-modal-sheet" onClick={e => e.stopPropagation()}>
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
