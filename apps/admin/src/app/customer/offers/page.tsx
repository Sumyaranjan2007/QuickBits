'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';

interface OfferItem {
  id: string;
  code: string;
  category: 'coupons' | 'bank' | 'delivery' | 'gold';
  tag: string;
  tagColor?: string;
  title: string;
  subTitle: string;
  desc: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxDiscount?: number;
  minOrder: number;
  expiry: string;
  terms: string[];
  bankLogo?: string;
  restaurantId?: string;
  restaurantName?: string;
}

const ALL_OFFERS: OfferItem[] = [
  {
    id: 'off-quick50',
    code: 'QUICK50',
    category: 'coupons',
    tag: 'WELCOME OFFER',
    tagColor: '#B45309',
    title: '50% OFF',
    subTitle: 'Up to ₹100 on first order',
    desc: 'Valid on all food orders above ₹199',
    type: 'PERCENTAGE',
    value: 50,
    maxDiscount: 100,
    minOrder: 199,
    expiry: 'Valid till 30 Sep 2026',
    terms: [
      'Offer valid only on your first QuickBite order',
      'Maximum discount capped at ₹100',
      'Minimum cart value of ₹199 required',
      'Applicable on all payment methods',
    ],
  },
  {
    id: 'off-freedl',
    code: 'FREEDL',
    category: 'delivery',
    tag: 'ZERO DELIVERY',
    tagColor: '#047857',
    title: 'FREE DELIVERY',
    subTitle: 'Save ₹30 on delivery fees',
    desc: 'No delivery charges on orders above ₹199',
    type: 'FIXED',
    value: 30,
    minOrder: 199,
    expiry: 'Valid for next 14 days',
    terms: [
      'Valid on restaurants within 7 km distance',
      'Minimum order amount of ₹199 required',
      'Can be combined with select restaurant discounts',
    ],
  },
  {
    id: 'off-try100',
    code: 'TRY100',
    category: 'coupons',
    tag: 'BIG SAVINGS',
    tagColor: '#4A0A10',
    title: 'FLAT ₹100 OFF',
    subTitle: 'Instant discount on ₹299+',
    desc: 'Enjoy flat ₹100 off on gourmet meals',
    type: 'FIXED',
    value: 100,
    minOrder: 299,
    expiry: 'Valid till 31 Oct 2026',
    terms: [
      'Minimum order value of ₹299 before taxes',
      'Applicable on all restaurants across the city',
      'Valid twice per customer per month',
    ],
  },
  {
    id: 'off-hdfc15',
    code: 'HDFC150',
    category: 'bank',
    tag: 'HDFC BANK',
    tagColor: '#1D4ED8',
    title: '15% INSTANT OFF',
    subTitle: 'Up to ₹150 with HDFC Credit Cards',
    desc: 'Pay using HDFC Bank Credit or Debit cards',
    type: 'PERCENTAGE',
    value: 15,
    maxDiscount: 150,
    minOrder: 499,
    expiry: 'Valid every Friday to Sunday',
    terms: [
      'Valid on HDFC Bank Credit & Debit cards',
      'Minimum transaction value ₹499',
      'Maximum discount ₹150 per transaction',
      'Offer valid once per card per week',
    ],
    bankLogo: '💳',
  },
  {
    id: 'off-icici120',
    code: 'ICICI120',
    category: 'bank',
    tag: 'ICICI BANK',
    tagColor: '#C2410C',
    title: 'FLAT ₹120 OFF',
    subTitle: 'On ICICI Netbanking & iMobile',
    desc: 'Valid on orders of ₹449 and above',
    type: 'FIXED',
    value: 120,
    minOrder: 449,
    expiry: 'Valid till 15 Oct 2026',
    terms: [
      'Applicable on ICICI Internet Banking & Cards',
      'Minimum cart value ₹449',
      'Instant discount applied at checkout',
    ],
    bankLogo: '🏦',
  },
  {
    id: 'off-gold30',
    code: 'GOLD30',
    category: 'gold',
    tag: 'GOLD EXCLUSIVE 👑',
    tagColor: '#D4890E',
    title: 'EXTRA 30% OFF',
    subTitle: 'Up to ₹150 for Gold VIP Members',
    desc: 'Exclusive member perk on top dining partners',
    type: 'PERCENTAGE',
    value: 30,
    maxDiscount: 150,
    minOrder: 249,
    expiry: 'Unlimited for Gold members',
    terms: [
      'Exclusive to active QuickBite Gold members',
      'Valid on select Gold partner restaurants',
      'Includes VIP priority delivery dispatch',
    ],
  },
  {
    id: 'off-biryani20',
    code: 'BIRYANI20',
    category: 'coupons',
    tag: 'RESTAURANT DEAL',
    tagColor: '#9333EA',
    title: '20% OFF AT SHARIEF BHAI',
    subTitle: 'On all Authentic Dum Biryanis',
    desc: 'Special partnership discount on Biryanis & Kebabs',
    type: 'PERCENTAGE',
    value: 20,
    maxDiscount: 120,
    minOrder: 299,
    expiry: 'Valid today only',
    terms: [
      'Valid only at Sharief Bhai Biryani outlets',
      'Applicable on all Biryanis, Kebabs, and Desserts',
      'Minimum order ₹299',
    ],
    restaurantId: 'sharief-bhai',
    restaurantName: 'Sharief Bhai Biryani',
  },
];

const OFFER_TABS = [
  { id: 'all', label: '🔥 All Offers' },
  { id: 'coupons', label: '🏷️ Food Coupons' },
  { id: 'bank', label: '🏦 Bank Deals' },
  { id: 'delivery', label: '⚡ Free Delivery' },
  { id: 'gold', label: '👑 Gold Exclusive' },
];

export default function CustomerOffersPage() {
  const router = useRouter();
  const { applyCoupon, appliedCoupon, removeCoupon, subtotal, setIsCartDrawerOpen } = useCart();

  const [activeTab, setActiveTab] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyOffer = (offer: OfferItem) => {
    let discount = 0;
    const currentSubtotal = subtotal > 0 ? subtotal : 300;

    if (offer.type === 'PERCENTAGE') {
      discount = Math.min(Math.round((currentSubtotal * offer.value) / 100), offer.maxDiscount || 100);
    } else {
      discount = offer.value;
    }

    applyCoupon({
      code: offer.code,
      type: offer.type,
      value: offer.value,
      discountAmount: discount,
    });

    showToast(`✓ Coupon "${offer.code}" applied! You save ₹${discount}`);
  };

  const toggleTerms = (id: string) => {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredOffers = ALL_OFFERS.filter(offer => {
    if (activeTab !== 'all' && offer.category !== activeTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        offer.code.toLowerCase().includes(q) ||
        offer.title.toLowerCase().includes(q) ||
        offer.desc.toLowerCase().includes(q) ||
        offer.tag.toLowerCase().includes(q) ||
        (offer.restaurantName && offer.restaurantName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="customer-offers-container" style={{ padding: '4px 0 30px' }}>
      {/* ─── Floating Toast Feedback ─── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4A0A10',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 24,
            fontSize: 12.5,
            fontWeight: 800,
            boxShadow: '0 6px 20px rgba(74, 10, 16, 0.35)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header Section ─── */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#4A0A10', margin: '0 0 4px 0' }}>
          Offers &amp; Deals 🔥
        </h1>
        <p style={{ fontSize: 12, color: '#8C7B72', margin: 0 }}>
          Exclusive coupons, instant bank cashbacks &amp; restaurant deals
        </p>
      </div>

      {/* ─── Search Coupons Input ─── */}
      <div style={{ marginBottom: 14, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.6 }}>🔍</span>
        <input
          type="text"
          placeholder="Search offers by code, bank, or restaurant..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 42,
            paddingRight: 36,
            height: 44,
            fontSize: 13,
            borderRadius: 14,
            border: '1px solid #EADBCE',
            background: '#FFFFFF',
            color: '#1F2937',
            outline: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        />
        {searchFilter && (
          <button
            type="button"
            onClick={() => setSearchFilter('')}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: 14,
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ─── Category Filter Tabs ─── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16 }}>
        {OFFER_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: 11.5,
                padding: '6px 12px',
                borderRadius: 16,
                background: isActive ? '#4A0A10' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                border: `1px solid ${isActive ? '#4A0A10' : '#EADBCE'}`,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Active Applied Coupon Notice ─── */}
      {appliedCoupon && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1.5px solid #0E9F6E',
            borderRadius: 14,
            padding: '10px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(14, 159, 110, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#065F46' }}>
                Coupon &quot;{appliedCoupon.code}&quot; Active
              </div>
              <div style={{ fontSize: 11, color: '#047857' }}>
                Saving ₹{appliedCoupon.discountAmount} on your order
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              removeCoupon();
              showToast('Coupon removed from cart');
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EF4444',
              color: '#EF4444',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* ─── Offer Cards List ─── */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', background: '#FFFFFF', borderRadius: 16, border: '1px solid #EADBCE' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏷️</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#4A0A10', marginBottom: 4 }}>No offers found</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Try changing your search filter or selecting another tab.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredOffers.map(offer => {
            const isApplied = appliedCoupon?.code === offer.code;
            const isTermsOpen = expandedTerms.has(offer.id);

            return (
              <div
                key={offer.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: isApplied ? '1.5px solid #0E9F6E' : '1px solid #EADBCE',
                  boxShadow: isApplied ? '0 4px 14px rgba(14, 159, 110, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Main Card Body */}
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          letterSpacing: 0.5,
                          color: offer.tagColor || '#4A0A10',
                          background: `${offer.tagColor || '#4A0A10'}15`,
                          padding: '2px 8px',
                          borderRadius: 6,
                          display: 'inline-block',
                          marginBottom: 4,
                        }}
                      >
                        {offer.tag}
                      </span>
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: '#1A1A1A', margin: '2px 0 0 0' }}>
                        {offer.title}
                      </h3>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#4A0A10', marginTop: 1 }}>
                        {offer.subTitle}
                      </div>
                    </div>

                    {/* Bank / Category Icon */}
                    {offer.bankLogo && (
                      <span style={{ fontSize: 24 }}>{offer.bankLogo}</span>
                    )}
                  </div>

                  <p style={{ fontSize: 11.5, color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.35 }}>
                    {offer.desc}
                  </p>

                  {/* Coupon Code Pill & Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F9FAFB',
                      borderRadius: 12,
                      padding: '8px 10px',
                      border: '1px dashed #D1D5DB',
                      gap: 8,
                    }}
                  >
                    {/* Code Chip */}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      title="Click to copy coupon code"
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #4A0A10',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: 1,
                        color: '#4A0A10',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{copiedCode === offer.code ? '✓ COPIED' : offer.code}</span>
                      <span style={{ fontSize: 10, opacity: 0.6 }}>📋</span>
                    </button>

                    {/* Action Button: APPLY / RESTAURANT LINK */}
                    {offer.restaurantId ? (
                      <Link
                        href={`/customer/restaurant/${offer.restaurantId}`}
                        style={{
                          background: '#4A0A10',
                          color: '#FFFFFF',
                          borderRadius: 8,
                          padding: '6px 14px',
                          fontSize: 11.5,
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(74, 10, 16, 0.2)',
                          display: 'inline-block',
                        }}
                      >
                        ORDER NOW →
                      </Link>
                    ) : isApplied ? (
                      <span
                        style={{
                          background: '#ECFDF5',
                          color: '#047857',
                          border: '1px solid #A7F3D0',
                          borderRadius: 8,
                          padding: '5px 12px',
                          fontSize: 11.5,
                          fontWeight: 900,
                        }}
                      >
                        ✓ APPLIED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyOffer(offer)}
                        style={{
                          background: '#4A0A10',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 16px',
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(74, 10, 16, 0.2)',
                        }}
                      >
                        APPLY →
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer: Expiry & T&C Accordion */}
                <div
                  style={{
                    background: '#FDFCFB',
                    borderTop: '1px solid #F3F4F6',
                    padding: '8px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5 }}>
                    <span style={{ color: '#9CA3AF' }}>⏱️ {offer.expiry}</span>
                    <button
                      type="button"
                      onClick={() => toggleTerms(offer.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4A0A10',
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {isTermsOpen ? '▲ Hide Terms' : '▼ View Terms (T&C)'}
                    </button>
                  </div>

                  {/* Expanded Terms List */}
                  {isTermsOpen && (
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>
                      {offer.terms.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── QuickBits Assurance & Trust Card ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4A0A10 0%, #70101B 100%)',
          borderRadius: 20,
          padding: 16,
          color: '#FFFFFF',
          marginTop: 24,
          boxShadow: '0 4px 14px rgba(74, 10, 16, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5 }}>QuickBits Assurance</span>
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.9, marginBottom: 12 }}>
          &ldquo;Fresh, hot meals with 100% coupon transparency&rdquo;
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: '🛡️', title: '100% Secure Checkout' },
            { icon: '📦', title: 'Tamper-Proof Packaging' },
            { icon: '🏷️', title: 'Direct Instant Discounts' },
            { icon: '⚡', title: 'Lightning Fast Dispatch' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 8px', fontSize: 10.5, fontWeight: 700 }}>
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
