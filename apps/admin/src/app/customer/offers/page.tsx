'use client';
import React, { useState, useEffect } from 'react';
import { couponsApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';

const REFERENCE_OFFERS = [
  {
    id: 'off-1',
    code: 'QUICK50',
    tag: 'FIRST ORDER OFFER',
    title: 'FLAT 50% OFF',
    desc: 'On your first order above ₹199',
    type: 'PERCENTAGE',
    value: 50,
    maxDiscount: 100,
    theme: 'maroon',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
  },
  {
    id: 'off-2',
    code: 'FREEDL',
    tag: 'DELIVERY SPECIAL',
    title: 'FREE DELIVERY',
    desc: 'On all orders above ₹199',
    type: 'FIXED',
    value: 20,
    theme: 'gold',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&q=80',
  },
  {
    id: 'off-3',
    code: 'TRY100',
    tag: 'POPULAR CHOICE',
    title: 'FLAT ₹100 OFF',
    desc: 'On all orders above ₹299',
    type: 'FIXED',
    value: 100,
    theme: 'maroon',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80',
  },
  {
    id: 'off-4',
    code: 'BIRYANI10',
    tag: 'REST SPECIAL',
    title: '10% OFF ON BIRYANI',
    desc: 'At The Biryani House & top outlets',
    type: 'PERCENTAGE',
    value: 10,
    maxDiscount: 75,
    theme: 'cream',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
  },
];

export default function CustomerOffersPage() {
  const router = useRouter();
  const { applyCoupon, subtotal, setIsCartDrawerOpen } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (c: any) => {
    let discount = 0;
    if (c.type === 'PERCENTAGE') {
      discount = Math.min(Math.round(((subtotal || 200) * c.value) / 100), c.maxDiscount || 100);
    } else {
      discount = c.value;
    }

    applyCoupon({
      code: c.code,
      type: c.type,
      value: c.value,
      discountAmount: discount,
    });
    alert(`Coupon ${c.code} applied successfully!`);
    setIsCartDrawerOpen(true);
  };

  return (
    <div className="offers-mobile-screen">
      {/* ─── Top Header ─── */}
      <div className="offers-screen-header">
        <h1 className="offers-screen-title">Offers &amp; Deals 🔥</h1>
        <p className="offers-screen-sub">Exclusive discounts on your favourite cravings</p>
      </div>

      {/* ─── Reference Offer Banners List ─── */}
      <div className="offers-cards-list">
        {REFERENCE_OFFERS.map(offer => (
          <div
            key={offer.id}
            className={`promo-card promo-${offer.theme === 'gold' ? 'free-delivery' : offer.theme === 'cream' ? 'flat-100' : 'first-order'}`}
          >
            <div className="promo-card-left">
              <span className="promo-subtag">{offer.tag}</span>
              <div className="promo-big-headline">{offer.title}</div>
              <span className="promo-desc-line">{offer.desc}</span>

              <div className="offers-action-row">
                <button
                  type="button"
                  className="promo-coupon-pill"
                  onClick={() => handleCopy(offer.code)}
                >
                  {copiedCode === offer.code ? '✓ Copied' : `Code: ${offer.code}`}
                </button>
                <button
                  type="button"
                  className="apply-offer-action-btn"
                  onClick={() => handleApply(offer)}
                >
                  APPLY →
                </button>
              </div>
            </div>
            <div className="promo-card-right">
              <img src={offer.image} alt={offer.title} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Quickbits Trust Card ─── */}
      <div className="quickbits-brand-card" style={{ marginTop: 24 }}>
        <div className="brand-logo-row">
          <span className="brand-bolt">⚡</span>
          <span className="brand-name">Quickbits</span>
        </div>
        <div className="brand-tagline">&ldquo;Bites that reach you quick!&rdquo;</div>

        <div className="brand-trust-badges">
          <div className="trust-badge-item">
            <span>🛡️</span>
            <span>100% Safe Payments</span>
          </div>
          <div className="trust-badge-item">
            <span>📦</span>
            <span>Hygienic Packaging</span>
          </div>
          <div className="trust-badge-item">
            <span>🏷️</span>
            <span>No Minimum Order</span>
          </div>
          <div className="trust-badge-item">
            <span>🔄</span>
            <span>Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
