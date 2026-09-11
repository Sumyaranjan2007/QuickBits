'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deliveryApi } from '@quickbite/api-client';

interface IncomingOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerArea: string;
  itemsCount: number;
  pickupDistance: string;
  dropDistance: string;
  totalDistance: string;
  estimatedTime: string;
  estimatedEarnings: number;
  paymentType: 'COD' | 'PAID_ONLINE';
  amountToCollect?: number;
  specialInstructions?: string;
  expiresInSeconds: number;
}

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [incomingRequest, setIncomingRequest] = useState<IncomingOrder | null>(null);
  const [countdown, setCountdown] = useState(30);

  // Load profile and active orders
  useEffect(() => {
    const loadData = async () => {
      try {
        const profRes = await deliveryApi.getProfile();
        const p = profRes.data as any;
        setProfile(p);
        setIsOnline(p?.isOnline ?? true);

        const activeRes = await deliveryApi.getActiveAssignment();
        if (activeRes?.data) {
          setActiveOrder(activeRes.data);
        } else {
          // Demo active order for presentation if needed
          setActiveOrder({
            id: 'ord-8891',
            orderNumber: 'QB-88914',
            restaurant: {
              name: 'Biryani Blues & Grill',
              address: 'Shop 14, 100 Feet Rd, Indiranagar',
              phone: '+91 98450 12345',
            },
            customer: {
              name: 'Ananya Deshmukh',
              address: 'Flat 402, Sunshine Heights, Domlur',
              phone: '+91 98765 11223',
            },
            status: 'OUT_FOR_DELIVERY',
            step: 4, // 1: Assigned, 2: Arrived Rest, 3: Picked Up, 4: Out for Delivery, 5: Arrived Customer
            totalAmount: 649,
            estimatedEarnings: 74,
            distance: '3.4 km',
            timeEst: '14 mins',
            isCod: false,
          });
        }
      } catch {
        // Fallback default profile
        setProfile({
          firstName: 'Ramesh',
          rating: 4.89,
          totalDeliveries: 418,
          vehicleType: 'Electric Scooter',
          vehicleNumber: 'KA-01-EQ-9876',
          approvalStatus: 'APPROVED',
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Countdown timer for incoming request popup
  useEffect(() => {
    if (!incomingRequest) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIncomingRequest(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingRequest]);

  const handleToggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await deliveryApi.toggleOnline(next);
    } catch {}
  };

  const triggerDemoOrderAlert = () => {
    setCountdown(30);
    setIncomingRequest({
      id: `ord-demo-${Date.now()}`,
      orderNumber: `QB-${Math.floor(100000 + Math.random() * 900000)}`,
      restaurantName: 'Truffles Burgers & Shakes',
      restaurantAddress: 'St. Marks Road, Central Bengaluru',
      customerName: 'Kavita Sundaram',
      customerArea: 'MG Road, Richmond Town',
      itemsCount: 3,
      pickupDistance: '1.2 km',
      dropDistance: '2.8 km',
      totalDistance: '4.0 km',
      estimatedTime: '22 mins',
      estimatedEarnings: 82,
      paymentType: 'PAID_ONLINE',
      specialInstructions: 'Please ring bell twice and leave near doorstep.',
      expiresInSeconds: 30,
    });
  };

  const handleAcceptOrder = () => {
    if (!incomingRequest) return;
    setActiveOrder({
      id: incomingRequest.id,
      orderNumber: incomingRequest.orderNumber,
      restaurant: {
        name: incomingRequest.restaurantName,
        address: incomingRequest.restaurantAddress,
        phone: '+91 99000 88776',
      },
      customer: {
        name: incomingRequest.customerName,
        address: incomingRequest.customerArea,
        phone: '+91 98888 77665',
      },
      status: 'ASSIGNED',
      step: 1,
      totalAmount: 520,
      estimatedEarnings: incomingRequest.estimatedEarnings,
      distance: incomingRequest.totalDistance,
      timeEst: incomingRequest.estimatedTime,
      isCod: incomingRequest.paymentType === 'COD',
    });
    setIncomingRequest(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderColor: '#0984E3', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ─── Top Header & Mode Banner ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0C2340', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🛵</span> Partner Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Welcome back, {profile?.firstName || 'Partner'}! You are operating in <strong>Indiranagar Zone</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={triggerDemoOrderAlert}
            style={{
              background: '#E8F4FD',
              color: '#0984E3',
              border: '1.5px dashed #0984E3',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🔔 Test Incoming Request
          </button>

          <Link
            href="/delivery/safety"
            style={{
              background: '#FF7675',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🚨</span> SOS Help
          </Link>
        </div>
      </div>

      {/* ─── Master Duty Card ─── */}
      <div style={{
        background: isOnline ? 'linear-gradient(135deg, #0984E3 0%, #00CEC9 100%)' : 'linear-gradient(135deg, #2D3436 0%, #636E72 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(9, 132, 227, 0.2)',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isOnline ? '#55EFC4' : '#FF7675',
              boxShadow: isOnline ? '0 0 12px #55EFC4' : 'none'
            }} />
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
              {isOnline ? 'LIVE & READY FOR ORDERS' : 'OFFLINE / OFF DUTY'}
            </span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            {isOnline ? "You're Online" : "You're Currently Offline"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {isOnline
              ? 'GPS Tracking Active • High demand in Indiranagar & Koramangala (1.3x Bonus)'
              : 'Go online to start receiving high-paying order assignments'}
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          style={{
            background: isOnline ? '#fff' : '#0984E3',
            color: isOnline ? '#0984E3' : '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '14px 28px',
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isOnline ? 'Go Offline' : '⚡ GO ONLINE NOW'}
        </button>
      </div>

      {/* ─── Active Delivery Banner (If any) ─── */}
      {activeOrder && (
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: '20px 24px',
          border: '2px solid #0984E3',
          boxShadow: '0 8px 24px rgba(9,132,227,0.12)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: '#E8F4FD',
                color: '#0984E3',
                fontSize: 12,
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: 8
              }}>
                ACTIVE ORDER {activeOrder.orderNumber}
              </span>
              <span style={{
                background: '#E8FFF8',
                color: '#00B894',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 6
              }}>
                ₹{activeOrder.estimatedEarnings} Earning
              </span>
            </div>

            <Link
              href="/delivery/active"
              style={{
                background: '#0984E3',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Open Live Navigation ➔
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div style={{ padding: '12px 14px', background: '#F8FAFD', borderRadius: 12, border: '1px solid #E2ECF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>📍 RESTAURANT PICKUP</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340', marginTop: 2 }}>{activeOrder.restaurant.name}</div>
              <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>{activeOrder.restaurant.address}</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#F8FAFD', borderRadius: 12, border: '1px solid #E2ECF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>🏠 CUSTOMER DROP</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340', marginTop: 2 }}>{activeOrder.customer.name}</div>
              <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>{activeOrder.customer.address}</div>
            </div>

            <div style={{ padding: '12px 14px', background: '#F8FAFD', borderRadius: 12, border: '1px solid #E2ECF5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>⏱️ TRIP METRICS</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340', marginTop: 2 }}>{activeOrder.distance} • ~{activeOrder.timeEst}</div>
              <div style={{ fontSize: 12, color: '#00B894', fontWeight: 700, marginTop: 2 }}>
                {activeOrder.isCod ? '⚠️ Collect ₹' + activeOrder.totalAmount + ' COD' : '✅ Paid Online (No Cash)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Today's Live Performance KPIs ─── */}
      <div className="delivery-stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Earnings", value: '₹942', icon: '💰', change: '+24% vs yesterday', isPositive: true },
          { label: 'Orders Completed', value: '14', icon: '📦', change: 'Target: 18 for ₹200 bonus', isPositive: true },
          { label: 'Online Hours', value: '5h 40m', icon: '⏱️', change: 'Break taken: 25m', isPositive: true },
          { label: 'Distance Covered', value: '38.4 km', icon: '🛣️', change: 'Fuel efficiency: 94%', isPositive: true },
          { label: 'Customer Tips', value: '₹120', icon: '❤️', change: '6 generous tips', isPositive: true },
          { label: 'Customer Rating', value: '4.92 ★', icon: '⭐', change: 'Top 5% Partner in City', isPositive: true },
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '16px 18px',
            border: '1px solid #E4EDF5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{kpi.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#00B894', background: '#E8FFF8', padding: '2px 6px', borderRadius: 4 }}>
                LIVE
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0C2340', marginTop: 8 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4A6FA5', marginTop: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 10, color: '#636E72', marginTop: 4 }}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* ─── Two-Column Section: Incentives + Peak Hours ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Daily Incentive Tracker */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid #E4EDF5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎯</span> Daily Incentive Goal
            </div>
            <Link href="/delivery/incentives" style={{ fontSize: 12, fontWeight: 700, color: '#0984E3', textDecoration: 'none' }}>
              View All ➔
            </Link>
          </div>

          <div style={{ background: '#F8FAFD', padding: 14, borderRadius: 12, border: '1px solid #E2ECF5', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#0C2340' }}>
              <span>Tier 2: 18 Orders Goal</span>
              <span style={{ color: '#00B894' }}>₹250 Bonus</span>
            </div>
            <div style={{ height: 8, background: '#E2ECF5', borderRadius: 4, margin: '8px 0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '77%', background: 'linear-gradient(90deg, #0984E3, #00CEC9)', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#636E72' }}>
              <span>14 / 18 completed</span>
              <span>4 more deliveries needed</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#4A6FA5', background: '#FFF9E6', padding: '10px 12px', borderRadius: 10, border: '1px solid #FFEAA7' }}>
            <span>🔥</span>
            <span><strong>Weekend Streak:</strong> Complete 5 more orders before 11 PM to unlock the ₹400 mega bonus!</span>
          </div>
        </div>

        {/* High Demand Peak Hours */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid #E4EDF5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚡</span> Peak Surge Schedule
            </div>
            <Link href="/delivery/map" style={{ fontSize: 12, fontWeight: 700, color: '#0984E3', textDecoration: 'none' }}>
              Heatmap ➔
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { time: '12:30 PM - 03:00 PM', name: 'Lunch Surge', surge: '+₹25 / order', status: 'COMPLETED' },
              { time: '07:00 PM - 11:30 PM', name: 'Dinner Rush', surge: '+₹40 / order', status: 'ACTIVE_NOW' },
              { time: '11:30 PM - 03:00 AM', name: 'Late Night Surge', surge: '+₹50 / order', status: 'UPCOMING' },
            ].map((slot, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 10,
                background: slot.status === 'ACTIVE_NOW' ? '#E8FFF8' : '#F8FAFD',
                border: slot.status === 'ACTIVE_NOW' ? '1.5px solid #00B894' : '1px solid #E2ECF5'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0C2340' }}>{slot.name}</div>
                  <div style={{ fontSize: 11, color: '#636E72' }}>{slot.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: slot.status === 'ACTIVE_NOW' ? '#00B894' : '#0984E3' }}>
                    {slot.surge}
                  </div>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: slot.status === 'ACTIVE_NOW' ? '#00B894' : '#dfe6e9',
                    color: slot.status === 'ACTIVE_NOW' ? '#fff' : '#636e72',
                  }}>
                    {slot.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── INCOMING ORDER REQUEST MODAL (Priority Fullscreen Overlay) ─── */}
      {incomingRequest && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12, 35, 64, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            width: '100%',
            maxWidth: 480,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Modal Header with Timer */}
            <div style={{
              background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
              padding: '18px 24px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
                  ⚡ NEW DELIVERY REQUEST
                </div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{incomingRequest.orderNumber}</div>
              </div>

              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
              }}>
                {countdown}s
              </div>
            </div>

            {/* Estimated Earnings Card */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2ECF5', background: '#F8FAFD', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#4A6FA5', fontWeight: 700 }}>ESTIMATED EARNING</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#00B894', margin: '4px 0' }}>
                ₹{incomingRequest.estimatedEarnings}
              </div>
              <div style={{ fontSize: 12, color: '#636E72' }}>
                {incomingRequest.totalDistance} total trip • ~{incomingRequest.estimatedTime}
              </div>
            </div>

            {/* Pickup & Drop Details */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 18 }}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0984E3' }}>PICKUP ({incomingRequest.pickupDistance})</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340' }}>{incomingRequest.restaurantName}</div>
                  <div style={{ fontSize: 12, color: '#636E72' }}>{incomingRequest.restaurantAddress}</div>
                </div>
              </div>

              <div style={{ height: 1, background: '#E2ECF5', marginLeft: 30 }} />

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 18 }}>🏠</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#00B894' }}>DROP ({incomingRequest.dropDistance})</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340' }}>{incomingRequest.customerName}</div>
                  <div style={{ fontSize: 12, color: '#636E72' }}>{incomingRequest.customerArea}</div>
                </div>
              </div>

              {incomingRequest.specialInstructions && (
                <div style={{ background: '#FFF9E6', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#856404', border: '1px solid #FFEAA7' }}>
                  💬 <strong>Note:</strong> {incomingRequest.specialInstructions}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '16px 24px', background: '#F8FAFD', display: 'flex', gap: 12 }}>
              <button
                onClick={() => setIncomingRequest(null)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #E2ECF5',
                  background: '#fff',
                  color: '#636E72',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Decline
              </button>

              <button
                onClick={handleAcceptOrder}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #00B894, #00CEC9)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)'
                }}
              >
                ACCEPT ORDER ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
