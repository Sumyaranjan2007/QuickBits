'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, couponsApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';
import { useLocation } from '../LocationContext';
import { useAuth } from '../../../context/AuthContext';

const DESSERT_ADDONS = [
  { id: 'd-1', name: 'Gulab Jamun (2 pcs)', price: 69, icon: '🍡' },
  { id: 'd-2', name: 'Rasmalai (2 pcs)', price: 89, icon: '🍮' },
  { id: 'd-3', name: 'Chocolate Lava Cake', price: 99, icon: '🍰' },
];

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items, restaurantId, restaurantName, subtotal, deliveryFee,
    platformFee, taxes, tip, setTip, appliedCoupon, applyCoupon,
    removeCoupon, total, updateQuantity, clearCart, addItem
  } = useCart();

  const {
    selectedLocation,
    savedLocations,
    selectLocation,
    addCustomAddress,
  } = useLocation();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [selectedTip, setSelectedTip] = useState<number | 'custom'>(0);
  const [customTipInput, setCustomTipInput] = useState('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrType, setNewAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [showDesserts, setShowDesserts] = useState(false);
  const [isBillExpanded, setIsBillExpanded] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/customer');
    }
  }, [items, router]);

  const handleSelectTip = (amount: number | 'custom') => {
    setSelectedTip(amount);
    if (typeof amount === 'number') {
      setTip(amount);
    } else {
      setTip(Number(customTipInput) || 0);
    }
  };

  const handleCustomTipChange = (val: string) => {
    setCustomTipInput(val);
    setTip(Number(val) || 0);
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponError('');
    setCouponSuccess('');

    try {
      if (code === 'QUICK50' || code === 'WELCOME50') {
        const discount = Math.min(Math.round((subtotal * 50) / 100), 100);
        applyCoupon({ code, type: 'PERCENTAGE', value: 50, discountAmount: discount });
        setCouponSuccess(`Coupon ${code} applied! Saved ₹${discount}`);
        setCouponCode('');
      } else if (code === 'FREEDL') {
        applyCoupon({ code: 'FREEDL', type: 'FIXED', value: deliveryFee, discountAmount: deliveryFee });
        setCouponSuccess('Free delivery applied!');
        setCouponCode('');
      } else if (code === 'TRY100') {
        if (subtotal < 299) {
          setCouponError('Minimum order of ₹299 required for TRY100');
          return;
        }
        applyCoupon({ code: 'TRY100', type: 'FIXED', value: 100, discountAmount: 100 });
        setCouponSuccess('₹100 discount applied!');
        setCouponCode('');
      } else {
        const res = await couponsApi.validate(code, subtotal);
        const data = res.data as any;
        applyCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
          discountAmount: data.discountAmount || 50,
        });
        setCouponSuccess(`Coupon ${code} applied!`);
        setCouponCode('');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Invalid coupon code or criteria not met');
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    const added = addCustomAddress(newAddrText.trim(), newAddrType);
    selectLocation(added);
    setNewAddrText('');
    setShowAddAddressModal(false);
  };

  const handleAddDessert = (d: any) => {
    addItem({
      menuItemId: d.id,
      name: d.name,
      price: d.price,
      quantity: 1,
      foodType: 'VEG',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80',
      restaurantId: restaurantId || 'rest-1',
      restaurantName: restaurantName || 'The Biryani House',
    });
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderId = `QB-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newOrder = {
        id: orderId,
        status: 'PREPARING',
        total,
        subtotal,
        deliveryFee,
        platformFee,
        taxes,
        tip,
        discountAmount: appliedCoupon?.discountAmount || 0,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : paymentMethod === 'UPI' ? 'UPI' : 'Credit / Debit Card',
        createdAt: new Date().toISOString(),
        estimatedDeliveryTime: '20-25 mins',
        restaurant: {
          id: restaurantId || 'rest-1',
          name: restaurantName || 'Burger & Co.',
          address: '100 Feet Road, Indiranagar',
        },
        deliveryAddress: selectedLocation || {
          id: 'addr-default',
          name: 'Delivery Location',
          desc: 'Indiranagar, Bengaluru 560038',
          fullAddress: 'Indiranagar, Bengaluru 560038',
        },
        items: items.map(it => ({
          id: it.menuItemId || `dish-${Date.now()}`,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          foodType: it.foodType || 'NON_VEG',
          imageUrl: it.imageUrl,
        })),
        driver: {
          name: 'Amit Verma',
          phone: '+91 98765 43210',
          rating: 4.9,
          vehicle: 'Hero Electric (KA 03 HK 2910)',
        },
      };

      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('qb_customer_orders');
          const list = stored ? JSON.parse(stored) : [];
          const updated = [newOrder, ...list.filter((o: any) => o.id !== orderId)];
          localStorage.setItem('qb_customer_orders', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save order to localStorage', e);
        }
      }

      try {
        await ordersApi.create({
          deliveryAddressId: selectedLocation?.id || 'addr-default',
          paymentMethod: paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'RAZORPAY',
          couponId: appliedCoupon?.code,
        });
      } catch {}

      clearCart();
      router.push(`/customer/order/${orderId}?status=placed&total=${total}`);
    } catch (err: any) {
      alert('Could not place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-mobile-screen">
      {/* ─── 1. Header (← Checkout) ─── */}
      <div className="checkout-top-header">
        <button
          type="button"
          className="checkout-back-arrow-btn"
          onClick={() => router.push('/customer')}
        >
          ←
        </button>
        <h1 className="checkout-header-title">Checkout</h1>
      </div>

      <div className="checkout-content-scroll">
        {/* ─── 2. Delivery Address Card ─── */}
        <div className="checkout-card">
          <div className="card-header-row">
            <h2 className="card-title-text">Delivery Address</h2>
            <button
              type="button"
              className="card-action-text-btn"
              onClick={() => setShowAddAddressModal(true)}
            >
              + Add new
            </button>
          </div>

          <div className="address-radio-list">
            {savedLocations.map(addr => {
              const isSelected = selectedLocation?.id === addr.id || selectedLocation?.name === addr.name;
              return (
                <label
                  key={addr.id}
                  className={`address-radio-label ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectLocation(addr)}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={isSelected}
                    onChange={() => selectLocation(addr)}
                    className="custom-radio-input"
                  />
                  <div className="address-radio-text">
                    <strong>{addr.tag.toUpperCase()}</strong> — {addr.desc || addr.fullAddress || addr.name}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* ─── 3. Order Items Section ─── */}
        <div className="checkout-card">
          <div className="card-section-title">
            <span className="card-section-icon">🥡</span>
            <span>Order Items</span>
          </div>

          <div className="order-items-summary-list">
            {items.map(it => (
              <div key={it.id} className="order-item-summary-row">
                <span className="item-name-qty">
                  {it.name} × {it.quantity}
                </span>
                <span className="item-price-val">₹{it.price * it.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 4. Add Sweets & Desserts Banner ─── */}
        <div className="checkout-card sweets-desserts-card">
          <div
            className="sweets-header-row"
            onClick={() => setShowDesserts(!showDesserts)}
          >
            <div className="sweets-title-left">
              <span className="sweets-cake-icon">🍰</span>
              <span className="sweets-label">Add Sweets &amp; Desserts</span>
            </div>
            <span className="sweets-tap-link">
              Tap to browse {showDesserts ? '▲' : '›'}
            </span>
          </div>

          {showDesserts && (
            <div className="desserts-quick-grid">
              {DESSERT_ADDONS.map(d => (
                <div key={d.id} className="dessert-grid-item">
                  <span className="dessert-icon">{d.icon}</span>
                  <div className="dessert-info">
                    <div className="dessert-name">{d.name}</div>
                    <div className="dessert-price">₹{d.price}</div>
                  </div>
                  <button
                    type="button"
                    className="dessert-add-btn"
                    onClick={() => handleAddDessert(d)}
                  >
                    + ADD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 5. Coupons & Offers ─── */}
        <div className="checkout-card">
          <div className="card-section-title">
            <span className="card-section-icon">🏷️</span>
            <span>Offers &amp; Coupons</span>
          </div>

          {appliedCoupon ? (
            <div className="applied-coupon-banner">
              <div className="applied-coupon-info">
                <span className="applied-coupon-code">✓ {appliedCoupon.code}</span>
                <span className="applied-coupon-desc">You saved ₹{appliedCoupon.discountAmount}!</span>
              </div>
              <button
                type="button"
                className="remove-coupon-btn"
                onClick={removeCoupon}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="coupon-input-group">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. QUICK50)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                className="coupon-text-input"
              />
              <button
                type="button"
                className="apply-coupon-btn"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
              >
                APPLY
              </button>
            </div>
          )}

          {couponError && <p className="coupon-status-msg error">{couponError}</p>}
          {couponSuccess && <p className="coupon-status-msg success">{couponSuccess}</p>}
        </div>

        {/* ─── 6. Delivery Partner Tip ─── */}
        <div className="checkout-card">
          <div className="card-section-title">
            <span className="card-section-icon">🛵</span>
            <span>Tip your delivery partner</span>
          </div>
          <p className="tip-subtext">Thank your delivery partner for bringing your food safely.</p>

          <div className="tip-chips-row">
            {[0, 20, 30, 50].map(amt => (
              <button
                key={amt}
                type="button"
                className={`tip-chip-btn ${selectedTip === amt ? 'active' : ''}`}
                onClick={() => handleSelectTip(amt)}
              >
                {amt === 0 ? 'No tip' : `₹${amt}`}
              </button>
            ))}
            <button
              type="button"
              className={`tip-chip-btn ${selectedTip === 'custom' ? 'active' : ''}`}
              onClick={() => handleSelectTip('custom')}
            >
              Custom
            </button>
          </div>

          {selectedTip === 'custom' && (
            <div className="custom-tip-box">
              <span>₹</span>
              <input
                type="number"
                placeholder="Enter tip amount"
                value={customTipInput}
                onChange={e => handleCustomTipChange(e.target.value)}
                min="0"
              />
            </div>
          )}
        </div>

        {/* ─── 7. Payment Options ─── */}
        <div className="checkout-card">
          <div className="card-section-title">
            <span className="card-section-icon">💳</span>
            <span>Payment Method</span>
          </div>

          <div className="payment-radio-group">
            <label className={`payment-option-label ${paymentMethod === 'COD' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <div className="payment-option-details">
                <span className="payment-opt-title">Cash on Delivery (COD)</span>
                <span className="payment-opt-desc">Pay with cash upon delivery</span>
              </div>
              <span className="payment-opt-icon">💵</span>
            </label>

            <label className={`payment-option-label ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'UPI'}
                onChange={() => setPaymentMethod('UPI')}
              />
              <div className="payment-option-details">
                <span className="payment-opt-title">UPI (GPay / PhonePe / Paytm)</span>
                <span className="payment-opt-desc">Instant payment via any UPI app</span>
              </div>
              <span className="payment-opt-icon">⚡</span>
            </label>

            <label className={`payment-option-label ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
              />
              <div className="payment-option-details">
                <span className="payment-opt-title">Credit / Debit Card</span>
                <span className="payment-opt-desc">Visa, Mastercard, RuPay</span>
              </div>
              <span className="payment-opt-icon">💳</span>
            </label>
          </div>
        </div>

        {/* ─── 8. Bill Details Summary (Collapsible) ─── */}
        <div className="checkout-card bill-summary-card">
          <div
            className="bill-card-toggle-header"
            onClick={() => setIsBillExpanded(!isBillExpanded)}
          >
            <div className="card-section-title" style={{ margin: 0 }}>
              <span className="card-section-icon">🧾</span>
              <span>Bill Details</span>
            </div>
            <button
              type="button"
              className="bill-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsBillExpanded(!isBillExpanded);
              }}
            >
              {isBillExpanded ? 'Hide bill details ▴' : 'View bill details ▾'}
            </button>
          </div>

          {/* Smooth Expanded Breakdown (Hidden by default) */}
          {isBillExpanded && (
            <div className="bill-breakdown-expanded">
              <div className="bill-line-row">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-line-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="free-badge">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="bill-line-row">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="bill-line-row">
                <span>GST &amp; Restaurant Taxes</span>
                <span>₹{taxes}</span>
              </div>
              {tip > 0 && (
                <div className="bill-line-row">
                  <span>Delivery Tip</span>
                  <span>₹{tip}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="bill-line-row discount-row">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="bill-divider" />
            </div>
          )}

          {/* Always Visible Summary Row */}
          <div className="bill-total-row">
            <span>To Pay</span>
            <span className="bill-total-amount">₹{total}</span>
          </div>
        </div>
      </div>

      {/* ─── Sticky Bottom Bar ─── */}
      <div className="checkout-sticky-footer">
        <div className="footer-payable-info">
          <span className="payable-label">Total Payable</span>
          <span className="payable-amount">₹{total}</span>
        </div>
        <button
          type="button"
          className="checkout-proceed-btn"
          disabled={isPlacingOrder}
          onClick={handlePlaceOrder}
        >
          {isPlacingOrder ? 'PLACING ORDER...' : 'PROCEED TO PAY →'}
        </button>
      </div>

      {/* ─── Add Address Modal ─── */}
      {showAddAddressModal && (
        <div className="customer-modal-backdrop" onClick={() => setShowAddAddressModal(false)}>
          <div className="customer-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <h3 className="modal-title">Add Delivery Address</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowAddAddressModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddNewAddress} className="add-addr-form">
              <div className="addr-type-pills">
                {(['Home', 'Work', 'Other'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`addr-type-pill ${newAddrType === t ? 'active' : ''}`}
                    onClick={() => setNewAddrType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Complete address (House no, Street, Landmark, Pincode)..."
                value={newAddrText}
                onChange={e => setNewAddrText(e.target.value)}
                rows={3}
                required
                className="addr-textarea"
              />

              <button type="submit" className="save-addr-submit-btn">
                Save &amp; Deliver Here
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
