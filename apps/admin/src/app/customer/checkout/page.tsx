'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, couponsApi, addressesApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';
import { useAuth } from '../../../context/AuthContext';

const SAVED_ADDRESSES = [
  { id: 'addr-1', label: 'Home', address: '402, Skyline Residency, 100 Feet Road, Indiranagar, Bengaluru, 560038', isDefault: true },
  { id: 'addr-2', label: 'Work', address: 'Prestige Tech Park, Outer Ring Road, Bengaluru, 560103', isDefault: false },
  { id: 'addr-3', label: 'Other', address: '12th Cross, Lavelle Road, Bengaluru, 560001', isDefault: false },
];

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items, restaurantId, restaurantName, subtotal, deliveryFee,
    platformFee, taxes, tip, setTip, appliedCoupon, applyCoupon,
    removeCoupon, total, totalSavings, updateQuantity, clearCart
  } = useCart();

  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0].id);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // New Address Modal
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [addressesList, setAddressesList] = useState(SAVED_ADDRESSES);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/customer');
    }
  }, [items, router]);

  const handleToggleInstruction = (ins: string) => {
    if (selectedInstructions.includes(ins)) {
      setSelectedInstructions(selectedInstructions.filter(i => i !== ins));
    } else {
      setSelectedInstructions([...selectedInstructions, ins]);
    }
  };

  const handleApplyCouponCode = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponError('');

    try {
      if (code === 'WELCOME50') {
        const discount = Math.min(Math.round((subtotal * 50) / 100), 100);
        applyCoupon({ code: 'WELCOME50', type: 'PERCENTAGE', value: 50, discountAmount: discount });
        setCouponInput('');
      } else if (code === 'FLAT100') {
        if (subtotal < 399) {
          setCouponError('Minimum order of ₹399 required for FLAT100');
          return;
        }
        applyCoupon({ code: 'FLAT100', type: 'FIXED', value: 100, discountAmount: 100 });
        setCouponInput('');
      } else {
        // Call backend validation
        const res = await couponsApi.validate(code, subtotal);
        const data = res.data as any;
        applyCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
          discountAmount: data.discountAmount || 50,
        });
        setCouponInput('');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Invalid coupon code or minimum order not met');
    }
  };

  const handleAddNewAddress = () => {
    if (!newAddressLine.trim()) return;
    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      address: newAddressLine,
      isDefault: false,
    };
    setAddressesList([...addressesList, newAddr]);
    setSelectedAddress(newAddr.id);
    setNewAddressLine('');
    setIsNewAddressModalOpen(false);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      // 1. Prepare order payload
      const payload = {
        deliveryAddressId: selectedAddress,
        paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
        couponId: appliedCoupon?.code,
        specialInstructions: [
          ...selectedInstructions,
          deliveryNote,
        ].filter(Boolean).join(', '),
      };

      // 2. Call backend order placement
      let orderId = `QB-${Date.now().toString().slice(-6)}`;
      try {
        const res = await ordersApi.create(payload);
        const d = res.data as any;
        if (d?.id) orderId = d.id;
      } catch (err) {
        console.warn('Backend order placement fallback:', err);
      }

      // 3. Clear cart and redirect to live tracking!
      clearCart();
      router.push(`/customer/order/${orderId}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🛒 Checkout & Place Order</h1>
          <p className="page-subtitle">Ordering from <strong>{restaurantName}</strong></p>
        </div>
      </div>

      <div className="checkout-layout-grid">
        {/* ─── Left Column: Delivery & Payment Details ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 1. Order Type (Delivery / Pickup) */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>1. Order Type</h3>
            <div className="order-type-grid">
              <button
                className={`btn ${orderType === 'DELIVERY' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '12px', justifyContent: 'center', borderRadius: 12 }}
                onClick={() => setOrderType('DELIVERY')}
              >
                🛵 Home Delivery (25 mins)
              </button>
              <button
                className={`btn ${orderType === 'PICKUP' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '12px', justifyContent: 'center', borderRadius: 12 }}
                onClick={() => setOrderType('PICKUP')}
              >
                🛍️ Self Pickup (15 mins)
              </button>
            </div>
          </div>

          {/* 2. Delivery Address */}
          {orderType === 'DELIVERY' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>2. Delivery Address</h3>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setIsNewAddressModalOpen(true)}
                  style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8 }}
                >
                  + Add New Address
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {addressesList.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
                      cursor: 'pointer', background: selectedAddress === addr.id ? 'var(--primary-light)' : '#fff',
                      borderColor: selectedAddress === addr.id ? 'var(--primary)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', gap: 12, transition: '0.2s'
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '💼' : '📍'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{addr.label}</span>
                        {addr.isDefault && <span className="badge badge-primary" style={{ fontSize: 9 }}>Default</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{addr.address}</div>
                    </div>
                    {selectedAddress === addr.id && <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Delivery Instructions */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>3. Delivery Instructions</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {[
                '🚪 Leave at door',
                '🔕 Do not ring bell',
                '📵 Avoid calling',
                '🛡️ Leave with security',
                '🌿 Eco-friendly (No plastic cutlery)',
              ].map((ins, i) => (
                <button
                  key={i}
                  className={`filter-pill ${selectedInstructions.includes(ins) ? 'active' : ''}`}
                  onClick={() => handleToggleInstruction(ins)}
                  style={{ fontSize: 12 }}
                >
                  {ins}
                </button>
              ))}
            </div>

            <input
              type="text"
              className="input"
              placeholder="Additional delivery note (e.g. Landmark next to green gate)..."
              value={deliveryNote}
              onChange={e => setDeliveryNote(e.target.value)}
            />
          </div>

          {/* 4. Payment Method */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>4. Payment Method</h3>
            <div className="payment-method-grid">
              {[
                { id: 'UPI', label: 'Instant UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
                { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
                { id: 'WALLET', label: 'QuickBite Wallet', desc: 'Balance: ₹500 available', icon: '👛' },
                { id: 'COD', label: 'Cash on Delivery', desc: 'Pay at your doorstep', icon: '💵' },
              ].map(pay => (
                <div
                  key={pay.id}
                  onClick={() => setPaymentMethod(pay.id)}
                  style={{
                    padding: '14px', borderRadius: 12, border: '1.5px solid var(--border)',
                    cursor: 'pointer', background: paymentMethod === pay.id ? 'var(--primary-light)' : '#fff',
                    borderColor: paymentMethod === pay.id ? 'var(--primary)' : 'var(--border)',
                    transition: '0.2s', display: 'flex', gap: 10, alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{pay.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{pay.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>{pay.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Right Column: Order Summary & Bill ─── */}
        <div className="checkout-summary-card">
          <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 16 }}>Order Summary</h3>

          {/* Items List */}
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
            {items.map(it => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #FAF7F5' }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`food-badge ${it.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 8 }}>
                      {it.foodType === 'VEG' ? '●' : '▲'}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{it.name}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13, marginTop: 2 }}>
                    ₹{(it.price + (it.addons || []).reduce((s, a) => s + a.price, 0)) * it.quantity}
                  </div>
                </div>

                <div className="dish-counter">
                  <button className="dish-counter-btn" onClick={() => updateQuantity(it.id, -1)}>−</button>
                  <span style={{ fontSize: 12 }}>{it.quantity}</span>
                  <button className="dish-counter-btn" onClick={() => updateQuantity(it.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Coupon Box */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="input"
                placeholder="Enter Coupon Code"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                style={{ textTransform: 'uppercase', height: 42, fontSize: 13 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleApplyCouponCode()}
                style={{ padding: '0 16px', borderRadius: 8 }}
              >
                Apply
              </button>
            </div>
            {couponError && <div style={{ color: '#E17055', fontSize: 11, marginTop: 4 }}>{couponError}</div>}

            {/* Quick coupon chips */}
            {!appliedCoupon && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span
                  onClick={() => handleApplyCouponCode('WELCOME50')}
                  style={{ fontSize: 11, fontWeight: 700, color: '#FF6B35', background: '#FFF5F0', padding: '3px 8px', borderRadius: 6, cursor: 'pointer', border: '1px solid #FFD5C2' }}
                >
                  WELCOME50 (50% OFF)
                </span>
                <span
                  onClick={() => handleApplyCouponCode('FLAT100')}
                  style={{ fontSize: 11, fontWeight: 700, color: '#FF6B35', background: '#FFF5F0', padding: '3px 8px', borderRadius: 6, cursor: 'pointer', border: '1px solid #FFD5C2' }}
                >
                  FLAT100 (₹100 OFF)
                </span>
              </div>
            )}

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#E6FAF2', padding: '8px 12px', borderRadius: 8, marginTop: 8, fontSize: 12, fontWeight: 700, color: '#00B894' }}>
                <span>✓ Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#E17055', fontSize: 12, cursor: 'pointer', fontWeight: 800 }}>Remove</button>
              </div>
            )}
          </div>

          {/* Delivery Partner Tip */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sec)', marginBottom: 6 }}>
              Say Thanks with a Tip (Optional) 🚴
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 20, 30, 50].map(amt => (
                <button
                  key={amt}
                  className={`btn btn-sm ${tip === amt ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: 12, borderRadius: 8 }}
                  onClick={() => setTip(amt)}
                >
                  {amt === 0 ? 'No Tip' : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Bill Breakdown */}
          <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#00B894' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Taxes (5% GST)</span>
              <span>₹{taxes}</span>
            </div>
            {tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Delivery Tip</span>
                <span>₹{tip}</span>
              </div>
            )}
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#00B894', fontWeight: 700 }}>
                <span>Coupon Savings ({appliedCoupon.code})</span>
                <span>− ₹{appliedCoupon.discountAmount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 17, fontWeight: 900, color: 'var(--text)' }}>
              <span>Total to Pay</span>
              <span style={{ color: 'var(--primary)' }}>₹{total}</span>
            </div>
            {totalSavings > 0 && (
              <div style={{ color: '#00B894', fontSize: 12, fontWeight: 700, textAlign: 'right', marginTop: 4 }}>
                🎉 You saved ₹{totalSavings} on this order!
              </div>
            )}
          </div>

          {/* Place Order CTA Button */}
          <button
            className="btn btn-primary w-full"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12 }}
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing Order...' : `Pay ₹${total} & Place Order →`}
          </button>
        </div>
      </div>

      {/* ─── Add Address Modal ─── */}
      {isNewAddressModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewAddressModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Add New Address</h3>
              <button onClick={() => setIsNewAddressModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Address Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Home', 'Work', 'Other'].map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ${newLabel === type ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setNewLabel(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Full Address</label>
              <textarea
                className="input"
                rows={3}
                placeholder="House/Flat No., Building Name, Street, Area, Pincode"
                value={newAddressLine}
                onChange={e => setNewAddressLine(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              onClick={handleAddNewAddress}
            >
              Save Address & Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
