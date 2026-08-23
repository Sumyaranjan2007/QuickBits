'use client';
import React, { useState } from 'react';
import Link from 'next/link';

type DeliveryStage =
  | 'ASSIGNED'
  | 'ARRIVED_RESTAURANT'
  | 'PICKED_UP'
  | 'ARRIVED_CUSTOMER'
  | 'DELIVERED';

const STAGES: { key: DeliveryStage; label: string; action: string; desc: string }[] = [
  { key: 'ASSIGNED', label: '1. Navigate to Restaurant', action: 'I Have Arrived at Restaurant', desc: 'Reach the pickup location and head to the merchant counter.' },
  { key: 'ARRIVED_RESTAURANT', label: '2. Verify & Pick Up', action: 'Verify Pickup & Start Trip', desc: 'Confirm order items with merchant and enter pickup OTP.' },
  { key: 'PICKED_UP', label: '3. Out for Delivery', action: 'I Have Reached Customer Address', desc: 'Follow navigation to deliver hot and fresh food to customer.' },
  { key: 'ARRIVED_CUSTOMER', label: '4. Deliver & Verify OTP', action: 'Confirm Delivery', desc: 'Collect payment (if COD) and enter customer verification OTP.' },
  { key: 'DELIVERED', label: '5. Completed', action: 'Trip Completed 🎉', desc: 'Order successfully delivered to customer!' },
];

export default function ActiveDeliveryPage() {
  const [stage, setStage] = useState<DeliveryStage>('ASSIGNED');
  const [pickupOtp, setPickupOtp] = useState('');
  const [customerOtp, setCustomerOtp] = useState('');
  const [codCollected, setCodCollected] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [completedSummary, setCompletedSummary] = useState(false);

  // Demo active delivery data
  const order = {
    id: 'ord-982144',
    orderNumber: 'QB-982144',
    placedAt: '19:42 PM',
    restaurant: {
      name: 'Biryani Blues & Charcoal Grill',
      address: 'Shop 14, 100 Feet Rd, Near Sony Signal, Indiranagar',
      phone: '+91 98450 12345',
      contactPerson: 'Chef Anand',
    },
    customer: {
      name: 'Ananya Deshmukh',
      address: 'Flat 402, 4th Floor, Sunshine Heights, 12th Main, Domlur',
      landmark: 'Opposite Domlur Club',
      phone: '+91 98765 11223',
    },
    items: [
      { name: 'Hyderabadi Chicken Dum Biryani', qty: 2, price: 598 },
      { name: 'Mirchi Ka Salan (Extra)', qty: 1, price: 40 },
      { name: 'Gulab Jamun (2 pcs)', qty: 1, price: 60 },
    ],
    isCod: true,
    totalAmount: 698,
    partnerEarnings: {
      base: 45,
      distance: 24,
      surge: 15,
      tip: 20,
      total: 104,
    },
    pickupCode: '8821',
    deliveryOtpExpected: '4912',
    instructions: 'Ring doorbell twice. Please do not call if delivering before 9 PM.',
  };

  const currentStepIndex = STAGES.findIndex((s) => s.key === stage);

  const handleNextStage = () => {
    if (stage === 'ASSIGNED') {
      setStage('ARRIVED_RESTAURANT');
    } else if (stage === 'ARRIVED_RESTAURANT') {
      if (pickupOtp !== order.pickupCode && pickupOtp !== '1234') {
        alert(`Please enter valid Pickup OTP (Hint: ${order.pickupCode})`);
        return;
      }
      setStage('PICKED_UP');
    } else if (stage === 'PICKED_UP') {
      setStage('ARRIVED_CUSTOMER');
    } else if (stage === 'ARRIVED_CUSTOMER') {
      if (order.isCod && !codCollected) {
        alert('Please confirm COD cash collection of ₹' + order.totalAmount);
        return;
      }
      if (customerOtp !== order.deliveryOtpExpected && customerOtp !== '1234') {
        alert(`Please enter valid Customer OTP (Hint: ${order.deliveryOtpExpected})`);
        return;
      }
      setStage('DELIVERED');
      setCompletedSummary(true);
    }
  };

  const handleReportIssue = () => {
    if (!selectedIssue) {
      alert('Please select an issue type');
      return;
    }
    alert(`Issue reported: "${selectedIssue}". Support team notified.`);
    setShowIssueModal(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🛵 Live Delivery Trip</h1>
            <span style={{
              background: '#0984E3',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6
            }}>
              {order.orderNumber}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Estimated Earning: <strong style={{ color: '#00B894' }}>₹{order.partnerEarnings.total}</strong> • Placed {order.placedAt}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowIssueModal(true)}
            style={{
              background: '#FFF5F0',
              color: '#E17055',
              border: '1px solid #FAB1A0',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ⚠️ Report Issue
          </button>

          <Link
            href="/delivery/safety"
            style={{
              background: '#FF7675',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            🚨 SOS
          </Link>
        </div>
      </div>

      {/* ─── Stage Stepper Bar ─── */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '16px 20px',
        border: '1px solid #E2ECF5',
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Progress bar background line */}
          <div style={{
            position: 'absolute',
            top: 14,
            left: 20,
            right: 20,
            height: 3,
            background: '#E2ECF5',
            zIndex: 1,
          }}>
            <div style={{
              height: '100%',
              width: `${(currentStepIndex / (STAGES.length - 1)) * 100}%`,
              background: '#00B894',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: isCompleted ? '#00B894' : isCurrent ? '#0984E3' : '#fff',
                  border: `3px solid ${isCompleted ? '#00B894' : isCurrent ? '#0984E3' : '#E2ECF5'}`,
                  color: isCompleted || isCurrent ? '#fff' : '#A0A8C0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 12,
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 800 : 600,
                  color: isCurrent ? '#0984E3' : '#636E72',
                  marginTop: 6,
                  textAlign: 'center',
                  display: 'none', // Shown on desktop
                }}>
                  {s.label.split('. ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Map Navigation Simulation Canvas ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2A3A, #0C2340)',
        borderRadius: 20,
        padding: '24px',
        color: '#fff',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(12,35,64,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#74B9FF', letterSpacing: 1, textTransform: 'uppercase' }}>
              {stage === 'ASSIGNED' || stage === 'ARRIVED_RESTAURANT' ? 'CURRENT DESTINATION: RESTAURANT' : 'CURRENT DESTINATION: CUSTOMER'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>
              {stage === 'ASSIGNED' || stage === 'ARRIVED_RESTAURANT' ? order.restaurant.name : order.customer.name}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, maxWidth: 500 }}>
              {stage === 'ASSIGNED' || stage === 'ARRIVED_RESTAURANT' ? order.restaurant.address : order.customer.address}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(stage === 'ASSIGNED' ? order.restaurant.address : order.customer.address)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#0984E3',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>🧭</span> Open Google Maps
            </a>

            <a
              href={`tel:${stage === 'ASSIGNED' ? order.restaurant.phone : order.customer.phone}`}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>📞</span> Call
            </a>
          </div>
        </div>

        {/* Live Route Tracker Graphic */}
        <div style={{
          margin: '20px 0 10px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#74B9FF', fontWeight: 700 }}>DISTANCE REMAINING</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
              {stage === 'ASSIGNED' ? '1.2 km' : stage === 'ARRIVED_RESTAURANT' ? '0.0 km (At Venue)' : stage === 'PICKED_UP' ? '2.4 km' : '0.0 km (Arrived)'}
            </div>
          </div>

          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <div style={{ fontSize: 11, color: '#74B9FF', fontWeight: 700 }}>ESTIMATED ETA</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#55EFC4', marginTop: 2 }}>
              {stage === 'ASSIGNED' ? '4 mins' : stage === 'ARRIVED_RESTAURANT' ? 'Ready' : stage === 'PICKED_UP' ? '9 mins' : 'Ready'}
            </div>
          </div>

          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />

          <div>
            <div style={{ fontSize: 11, color: '#74B9FF', fontWeight: 700 }}>PAYMENT TYPE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: order.isCod ? '#FAB1A0' : '#55EFC4', marginTop: 2 }}>
              {order.isCod ? `₹${order.totalAmount} COD` : 'PAID ONLINE'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Current Stage Action Card ─── */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '24px',
        border: '2px solid #0984E3',
        marginBottom: 24,
        boxShadow: '0 6px 20px rgba(9,132,227,0.08)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340', marginBottom: 4 }}>
          {STAGES[currentStepIndex].label}
        </div>
        <p style={{ fontSize: 13, color: '#4A6FA5', marginBottom: 18 }}>
          {STAGES[currentStepIndex].desc}
        </p>

        {/* Stage 2 Input: Pickup OTP */}
        {stage === 'ARRIVED_RESTAURANT' && (
          <div style={{ background: '#F8FAFD', padding: '16px', borderRadius: 14, border: '1px solid #E2ECF5', marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: '#0C2340', display: 'block', marginBottom: 6 }}>
              🔑 Ask Merchant for 4-Digit Pickup OTP:
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                maxLength={4}
                value={pickupOtp}
                onChange={(e) => setPickupOtp(e.target.value)}
                placeholder="e.g. 8821"
                style={{
                  width: 140,
                  fontSize: 22,
                  fontWeight: 900,
                  textAlign: 'center',
                  letterSpacing: 4,
                  padding: '10px',
                  borderRadius: 10,
                  border: '2px solid #0984E3',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: '#636E72' }}>Demo OTP: <strong>{order.pickupCode}</strong></span>
            </div>
          </div>
        )}

        {/* Stage 4 Input: Customer Delivery OTP & COD */}
        {stage === 'ARRIVED_CUSTOMER' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
            {order.isCod && (
              <div style={{
                background: codCollected ? '#E8FFF8' : '#FFF5F0',
                padding: '16px',
                borderRadius: 14,
                border: `2px solid ${codCollected ? '#00B894' : '#E17055'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: codCollected ? '#00B894' : '#E17055' }}>
                    💵 CASH ON DELIVERY
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>
                    Collect ₹{order.totalAmount}
                  </div>
                </div>

                <button
                  onClick={() => setCodCollected(!codCollected)}
                  style={{
                    background: codCollected ? '#00B894' : '#E17055',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 18px',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {codCollected ? '✓ Cash Collected' : 'Mark Cash Collected'}
                </button>
              </div>
            )}

            <div style={{ background: '#F8FAFD', padding: '16px', borderRadius: 14, border: '1px solid #E2ECF5' }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#0C2340', display: 'block', marginBottom: 6 }}>
                🔑 Ask Customer for 4-Digit Delivery Confirmation OTP:
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={4}
                  value={customerOtp}
                  onChange={(e) => setCustomerOtp(e.target.value)}
                  placeholder="e.g. 4912"
                  style={{
                    width: 140,
                    fontSize: 22,
                    fontWeight: 900,
                    textAlign: 'center',
                    letterSpacing: 4,
                    padding: '10px',
                    borderRadius: 10,
                    border: '2px solid #00B894',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: '#636E72' }}>Demo OTP: <strong>{order.deliveryOtpExpected}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Master Next Stage CTA Button */}
        {stage !== 'DELIVERED' ? (
          <button
            onClick={handleNextStage}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(9, 132, 227, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            {STAGES[currentStepIndex].action} ➔
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 44 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#00B894', marginTop: 6 }}>
              Delivery Successfully Completed!
            </div>
            <div style={{ fontSize: 14, color: '#4A6FA5', marginTop: 4 }}>
              ₹{order.partnerEarnings.total} has been credited to your wallet balance.
            </div>

            <Link
              href="/delivery"
              style={{
                display: 'inline-block',
                marginTop: 16,
                background: '#0984E3',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Back to Dashboard & Ready for Next Order
            </Link>
          </div>
        )}
      </div>

      {/* ─── Order Summary & Items Checklist ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid #E2ECF5', marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340', marginBottom: 12 }}>
          📋 Order Item Checklist ({order.items.length} items)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F8FAFD', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F4FD', color: '#0984E3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                  {item.qty}x
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0C2340' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#636E72' }}>₹{item.price}</span>
            </div>
          ))}
        </div>

        {order.instructions && (
          <div style={{ marginTop: 14, background: '#FFF9E6', padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#856404', border: '1px solid #FFEAA7' }}>
            💬 <strong>Customer Delivery Instructions:</strong> {order.instructions}
          </div>
        )}
      </div>

      {/* ─── Issue Report Modal ─── */}
      {showIssueModal && (
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
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, padding: '24px' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0C2340', marginBottom: 12 }}>
              ⚠️ Report Problem with Delivery
            </h3>
            <p style={{ fontSize: 13, color: '#4A6FA5', marginBottom: 16 }}>
              Select the issue you are experiencing with this active order:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                'Restaurant is closed / not responding',
                'Order is taking unusually long to prepare (>20m)',
                'Customer phone is switched off / unreachable',
                'Wrong or incomplete customer address',
                'Vehicle breakdown / accident',
                'Order damaged during transit',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedIssue(reason)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${selectedIssue === reason ? '#E17055' : '#E2ECF5'}`,
                    background: selectedIssue === reason ? '#FFF5F0' : '#F8FAFD',
                    color: selectedIssue === reason ? '#E17055' : '#0C2340',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Additional notes for support team..."
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              style={{
                width: '100%',
                height: 70,
                borderRadius: 10,
                border: '1px solid #E2ECF5',
                padding: '10px',
                fontSize: 12,
                marginBottom: 16,
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: '1px solid #E2ECF5',
                  background: '#fff',
                  color: '#636E72',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#E17055',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
