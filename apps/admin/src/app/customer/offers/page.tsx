'use client';
import React, { useState, useEffect } from 'react';
import { couponsApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';

export default function CustomerOffersPage() {
  const router = useRouter();
  const { applyCoupon, subtotal } = useCart();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    couponsApi.getActive()
      .then(r => {
        const d = r.data as any;
        setCoupons(d.items || d || []);
      })
      .catch(() => {
        // Fallback demo coupons if active query returns empty
        setCoupons([
          { id: '1', code: 'WELCOME50', type: 'PERCENTAGE', value: 50, maxDiscount: 100, minOrderAmount: 199, description: '50% discount up to ₹100 on your first order' },
          { id: '2', code: 'FLAT100', type: 'FIXED', value: 100, minOrderAmount: 399, description: 'Flat ₹100 off on all orders above ₹399' },
          { id: '3', code: 'FREEDEL', type: 'FIXED', value: 35, minOrderAmount: 249, description: 'Free delivery on all artisanal gourmet restaurants' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

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
    router.push('/customer');
  };

  return (
    <div>
      {/* ─── Hero Promo ─── */}
      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)', boxShadow: '0 10px 25px rgba(108, 92, 231, 0.25)' }}>
        <div>
          <span className="promo-badge" style={{ background: '#FD79A8', color: '#fff' }}>🏷️ Deals of the Day</span>
          <h1 className="promo-title">Save Big on Every Bite!</h1>
          <p className="promo-desc">
            Explore exclusive restaurant discounts, bank offers, and promo vouchers crafted for you.
          </p>
        </div>
        <div style={{ fontSize: 80 }}>🎁</div>
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">Available Coupon Codes</h2>
          <p className="page-subtitle">Tap &quot;Apply Coupon&quot; to add savings to your cart</p>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 40 }}>
          {coupons.map(c => (
            <div
              key={c.id}
              style={{
                background: '#fff', borderRadius: 16, border: '1.5px dashed #FF6B35',
                padding: 24, position: 'relative', boxShadow: 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', letterSpacing: 1.5, background: 'var(--primary-light)', padding: '4px 12px', borderRadius: 8 }}>
                    {c.code}
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleCopy(c.code)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6 }}
                  >
                    {copiedCode === c.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  {c.type === 'PERCENTAGE' ? `${c.value}% OFF up to ₹${c.maxDiscount || 100}` : `FLAT ₹${c.value} OFF`}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.4 }}>
                  {c.description || `Get ${c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`} discount on orders above ₹${c.minOrderAmount || 0}`}
                </p>

                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Min Order: ₹{c.minOrderAmount || 0} • Valid till end of month
                </div>
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #F0E6E0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleApply(c)}
                  style={{ borderRadius: 8, padding: '6px 16px', fontSize: 12 }}
                >
                  Apply to Cart →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Bank & Payment Offers ─── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">💳 Bank & Wallet Offers</h2>
          <p className="page-subtitle">Instant cashback and rewards at checkout</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>📱</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Google Pay / PhonePe UPI</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>Get up to ₹50 scratch card reward on orders &gt; ₹199</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>🏦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>HDFC Bank Credit Cards</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>10% Instant Discount up to ₹150 on weekends</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>👛</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>QuickBite Wallet Credits</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>Get 5% guaranteed cashback in your wallet on every order</div>
          </div>
        </div>
      </div>
    </div>
  );
}
