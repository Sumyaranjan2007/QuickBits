'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { CartProvider, useCart } from './CartContext';
import { notificationsApi } from '@quickbite/api-client';

const SAVED_LOCATIONS = [
  { name: 'Indiranagar, Bengaluru', tag: 'Home', desc: '100 Feet Road, Indiranagar, Bengaluru, 560038' },
  { name: 'Koramangala 5th Block', tag: 'Work', desc: 'Prestige Tech Park, Outer Ring Road, 560103' },
  { name: 'Lavelle Road, Bengaluru', tag: 'Other', desc: 'UB City, Vittal Mallya Road, 560001' },
  { name: 'HSR Layout Sector 4', tag: 'Other', desc: '27th Main Road, HSR Layout, 560102' },
];

function CustomerNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { items, itemCount, subtotal, deliveryFee, platformFee, taxes, appliedCoupon, total, updateQuantity, isCartDrawerOpen, setIsCartDrawerOpen } = useCart();

  const [selectedLocation, setSelectedLocation] = useState(SAVED_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: '🎉 50% OFF First Order!', body: 'Use coupon code WELCOME50 at checkout.', time: '10m ago', isRead: false },
    { id: '2', title: '🍔 Gourmet Smash Burgers', body: 'Burger & Co is now open with free delivery.', time: '1h ago', isRead: false },
  ]);

  // Handle GPS detection
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSelectedLocation({ name: 'Current Location (GPS)', tag: 'GPS', desc: 'Indiranagar, Bengaluru (12.9716° N, 77.5946° E)' });
          setIsLocationModalOpen(false);
        },
        () => {
          alert('GPS location permission denied. Using Indiranagar, Bengaluru.');
          setIsLocationModalOpen(false);
        }
      );
    }
  };

  const markAllNotificationsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <>
      <header className="top-navbar" style={{ height: 72, background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #F0E6E0', position: 'sticky', top: 0, zIndex: 60 }}>
        {/* Brand & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/customer" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: 32 }}>🍔</span>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35', letterSpacing: '-0.5px' }}>QuickBite</span>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#8B7355', letterSpacing: 1, textTransform: 'uppercase' }}>Superfast Food</span>
            </div>
          </Link>

          {/* Location Selector */}
          <button
            className="location-btn"
            onClick={() => setIsLocationModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span>📍</span>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <span className="location-tag">{selectedLocation.tag}</span>
              <div className="location-text">{selectedLocation.name}</div>
            </div>
            <span style={{ fontSize: 10, color: '#8B7355' }}>▼</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="top-navbar-links" style={{ display: 'flex', gap: 4 }}>
          <Link href="/customer" className={`top-navbar-link ${pathname === '/customer' ? 'active' : ''}`}>
            🏠 Home
          </Link>
          <Link href="/customer/search" className={`top-navbar-link ${pathname === '/customer/search' ? 'active' : ''}`}>
            🔍 Search
          </Link>
          <Link href="/customer/offers" className={`top-navbar-link ${pathname === '/customer/offers' ? 'active' : ''}`}>
            🏷️ Offers <span className="badge badge-error" style={{ fontSize: 9, padding: '2px 6px', marginLeft: 2 }}>NEW</span>
          </Link>
          <Link href="/customer/orders" className={`top-navbar-link ${pathname === '/customer/orders' ? 'active' : ''}`}>
            📦 Orders
          </Link>
          <Link href="/customer/help" className={`top-navbar-link ${pathname === '/customer/help' ? 'active' : ''}`}>
            💬 Help
          </Link>
        </div>

        {/* Right Actions: Notifications, Cart, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline btn-icon"
              style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', background: '#FFF5F0', border: '1.5px solid #FFD5C2' }}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#E17055', color: '#fff', fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div style={{ position: 'absolute', top: 52, right: 0, width: 320, background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #F0E6E0', zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0E6E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Notifications</span>
                  <button onClick={markAllNotificationsRead} style={{ background: 'none', border: 'none', color: '#FF6B35', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Mark all read</button>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F9F6F4', background: n.isRead ? '#fff' : '#FFF9F6' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#8B7355', marginTop: 2 }}>{n.body}</div>
                      <div style={{ fontSize: 10, color: '#BEA48A', marginTop: 4 }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            className="btn btn-primary"
            style={{ borderRadius: 24, padding: '10px 18px', gap: 8 }}
            onClick={() => setIsCartDrawerOpen(true)}
          >
            <span>🛒</span>
            <span>Cart</span>
            {itemCount > 0 && (
              <span style={{ background: '#fff', color: '#FF6B35', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline"
              style={{ borderRadius: 24, padding: '8px 14px', gap: 8, background: '#fff' }}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FF6B35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                {(user?.profile?.firstName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {user?.profile?.firstName || user?.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: 10, color: '#8B7355' }}>▼</span>
            </button>

            {isProfileMenuOpen && (
              <div style={{ position: 'absolute', top: 50, right: 0, width: 240, background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #F0E6E0', zIndex: 100, overflow: 'hidden', padding: '8px 0' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #F0E6E0' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{user?.profile?.firstName} {user?.profile?.lastName}</div>
                  <div style={{ fontSize: 11, color: '#8B7355' }}>{user?.email}</div>
                  <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF5F0', color: '#FF6B35', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 800 }}>
                    👑 QuickBite Gold Member
                  </div>
                </div>
                <Link href="/customer/profile" onClick={() => setIsProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#2D1B0E' }}>
                  👤 My Profile & Addresses
                </Link>
                <Link href="/customer/orders" onClick={() => setIsProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#2D1B0E' }}>
                  📦 Order History
                </Link>
                <Link href="/customer/offers" onClick={() => setIsProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#2D1B0E' }}>
                  🏷️ Coupons & Vouchers
                </Link>
                <Link href="/customer/help" onClick={() => setIsProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#2D1B0E' }}>
                  💬 Help & Support
                </Link>
                <div style={{ borderTop: '1px solid #F0E6E0', marginTop: 4, paddingTop: 4 }}>
                  <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#E17055', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLocationModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Select Delivery Location</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>Choose address or detect current location</p>
              </div>
              <button onClick={() => setIsLocationModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* GPS Button */}
            <button
              className="btn btn-primary w-full"
              style={{ width: '100%', marginBottom: 20, justifyContent: 'center', padding: '14px', gap: 10 }}
              onClick={handleDetectLocation}
            >
              <span>🎯</span>
              <span>Detect Current GPS Location</span>
            </button>

            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Saved Delivery Addresses
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SAVED_LOCATIONS.map((loc, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedLocation(loc); setIsLocationModalOpen(false); }}
                  style={{
                    padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
                    cursor: 'pointer', background: selectedLocation.name === loc.name ? 'var(--primary-light)' : '#fff',
                    borderColor: selectedLocation.name === loc.name ? 'var(--primary)' : 'var(--border)',
                    transition: '0.2s', display: 'flex', alignItems: 'center', gap: 12
                  }}
                >
                  <span style={{ fontSize: 24 }}>{loc.tag === 'Home' ? '🏠' : loc.tag === 'Work' ? '💼' : '📍'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{loc.name}</span>
                      <span className="badge badge-neutral" style={{ fontSize: 10 }}>{loc.tag}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{loc.desc}</div>
                  </div>
                  {selectedLocation.name === loc.name && <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartDrawerOpen && (
        <div className="modal-backdrop" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="modal-sheet" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Your Food Cart</h3>
                <p style={{ fontSize: 12, color: 'var(--text-sec)' }}>{itemCount} {itemCount === 1 ? 'item' : 'items'} in order</p>
              </div>
              <button onClick={() => setIsCartDrawerOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 10px' }}>
                <div style={{ fontSize: 48 }}>🛒</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 12 }}>Your cart is empty</div>
                <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 4 }}>Add mouth-watering dishes to start your order!</div>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  {items.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #FAF7F5' }}>
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`food-badge ${it.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 9 }}>
                            {it.foodType === 'VEG' ? '●' : '▲'}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{it.name}</span>
                        </div>
                        {it.addons && it.addons.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>
                            + {it.addons.map(a => `${a.name} (₹${a.price})`).join(', ')}
                          </div>
                        )}
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14, marginTop: 4 }}>
                          ₹{(it.price + (it.addons || []).reduce((s, a) => s + a.price, 0)) * it.quantity}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="dish-counter">
                        <button className="dish-counter-btn" onClick={() => updateQuantity(it.id, -1)}>−</button>
                        <span>{it.quantity}</span>
                        <button className="dish-counter-btn" onClick={() => updateQuantity(it.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free Delivery Bar */}
                <div style={{ background: '#FFF5F0', padding: '10px 14px', borderRadius: 10, marginBottom: 16, border: '1px solid #FFD5C2' }}>
                  {subtotal >= 299 ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00B894' }}>🎉 You unlocked FREE Delivery!</span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#8B7355' }}>
                      Add <strong>₹{299 - subtotal}</strong> more for <strong>FREE Delivery</strong>!
                    </span>
                  )}
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
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#00B894', fontWeight: 700 }}>
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>− ₹{appliedCoupon.discountAmount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>
                    <span>To Pay</span>
                    <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  className="btn btn-primary w-full"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    router.push('/customer/checkout');
                  }}
                >
                  Proceed to Checkout (₹{total}) →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="top-layout" data-theme="customer">
        <CustomerNavbar />
        <main className="main-content" style={{ marginLeft: 0, maxWidth: 1240, margin: '0 auto', width: '100%', padding: '24px 20px 80px 20px' }}>
          {children}
        </main>
      </div>
    </CartProvider>
  );
}
