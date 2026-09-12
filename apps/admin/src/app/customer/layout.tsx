'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { CartProvider, useCart } from './CartContext';
import { LocationProvider, useLocation, CustomerAddress } from './LocationContext';

const MOBILE_NAV_ITEMS = [
  {
    key: 'home',
    href: '/customer',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'search',
    href: '/customer/search',
    label: 'Search',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'orders',
    href: '/customer/orders',
    label: 'Orders',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    key: 'offers',
    href: '/customer/offers',
    label: 'Offers',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
        <path d="M9 9l6 6" />
        <circle cx="9.5" cy="9.5" r=".5" fill="currentColor" />
        <circle cx="14.5" cy="14.5" r=".5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'profile',
    href: '/customer/profile',
    label: 'Profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function CustomerMobileHeader({
  selectedLocation,
  setIsLocationModalOpen,
  unreadCount,
  setIsNotificationOpen,
  isNotificationOpen,
  notifications,
  markAllNotificationsRead,
}: any) {
  return (
    <header className="customer-app-header">
      {/* Location Row & Notification Bell */}
      <div className="customer-location-row">
        <button
          type="button"
          className="location-pill-btn"
          onClick={() => setIsLocationModalOpen(true)}
          id="customer-location-pill"
        >
          <div className="location-pin-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#4A0A10">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
          </div>
          <div className="location-text-col">
            <div className="location-main-title">
              <span className="location-name-truncate">{selectedLocation?.name || 'Select Location'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4A0A10" strokeWidth="3" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <span className="location-sub-text">Delivering to you</span>
          </div>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="header-bell-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationOpen(!isNotificationOpen);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="bell-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <button type="button" onClick={markAllNotificationsRead} className="notif-mark-btn">Mark all read</button>
              </div>
              <div className="notif-list">
                {notifications.map((n: any) => (
                  <div key={n.id} className={`notif-item ${n.isRead ? 'read' : 'unread'}`}>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-body">{n.body}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const {
    items, itemCount, subtotal, deliveryFee, platformFee,
    taxes, total, updateQuantity, clearCart,
    isCartDrawerOpen, setIsCartDrawerOpen
  } = useCart();

  const {
    selectedLocation,
    savedLocations,
    isDetecting,
    detectionError,
    detectionSuccess,
    isLocationModalOpen,
    setIsLocationModalOpen,
    detectLocation,
    selectLocation,
    addCustomAddress,
    searchAddress,
    clearDetectionError,
  } = useLocation();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [showCookingInput, setShowCookingInput] = useState(false);

  // Search & manual location state inside modal
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddressText, setManualAddressText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: '🔥 HOT DEALS: 50% OFF Active!', body: 'Use coupon QUICK50 on orders above ₹199.', time: '5m ago', isRead: false },
    { id: '2', title: '🛵 Free Delivery Unlocked!', body: 'Free delivery on all Biryani orders today with code FREEDL.', time: '25m ago', isRead: false },
    { id: '3', title: '🍔 Gourmet Burger Fest', body: 'The Biryani House & Burger Bistro are now open.', time: '1h ago', isRead: false },
  ]);

  useEffect(() => {
    const handleClickOutside = () => setIsNotificationOpen(false);
    if (isNotificationOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNotificationOpen]);

  // Handle Real GPS button click
  const handleDetectGPS = async () => {
    const result = await detectLocation();
    if (result) {
      setTimeout(() => {
        setIsLocationModalOpen(false);
      }, 700);
    }
  };

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchAddress(searchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddressText.trim()) return;
    addCustomAddress(manualAddressText.trim(), 'Other');
    setManualAddressText('');
    setShowManualInput(false);
    setIsLocationModalOpen(false);
  };

  const markAllNotificationsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const isNavActive = (href: string) => {
    if (href === '/customer') return pathname === '/customer';
    return pathname.startsWith(href);
  };

  // Hide top header on restaurant detail / checkout / order tracking if they have their own mobile headers
  const isDedicatedHeaderPage = pathname.includes('/customer/restaurant/') || pathname === '/customer/checkout' || pathname.includes('/customer/order/');

  return (
    <div className="customer-app-viewport" data-theme="customer">
      <div className="customer-phone-frame">
        {/* Mobile Header */}
        {!isDedicatedHeaderPage && (
          <CustomerMobileHeader
            selectedLocation={selectedLocation}
            setIsLocationModalOpen={setIsLocationModalOpen}
            unreadCount={unreadCount}
            setIsNotificationOpen={setIsNotificationOpen}
            isNotificationOpen={isNotificationOpen}
            notifications={notifications}
            markAllNotificationsRead={markAllNotificationsRead}
          />
        )}

        {/* Main Screen Content */}
        <main className="customer-screen-content">
          {children}
        </main>

        {/* Floating Cart Pill Bar (Visible across pages when items exist) */}
        {itemCount > 0 && pathname !== '/customer/checkout' && (
          <div className="customer-floating-cart-bar">
            <button
              type="button"
              className="cart-pill-inner"
              onClick={() => setIsCartDrawerOpen(true)}
            >
              <div className="cart-pill-left">
                <span className="cart-pill-icon">🛒</span>
                <span className="cart-pill-summary">
                  {itemCount} {itemCount === 1 ? 'Item' : 'Items'} • ₹{total}
                </span>
              </div>
              <div className="cart-pill-right">
                <span>View Cart</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Fixed Mobile Bottom Navigation */}
        <nav className="customer-bottom-nav">
          <div className="customer-bottom-nav-inner">
            {MOBILE_NAV_ITEMS.map(item => {
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-tab ${active ? 'active' : ''}`}
                >
                  <div className="nav-tab-icon">{item.icon}</div>
                  <span className="nav-tab-label">{item.label}</span>
                  {active && <span className="nav-active-dot" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ─── Location Selector Modal / Sheet ─── */}
      {isLocationModalOpen && (
        <div className="customer-modal-backdrop" onClick={() => setIsLocationModalOpen(false)}>
          <div className="customer-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <div>
                <h3 className="modal-title">Select Delivery Location</h3>
                <p className="modal-sub">Choose address or detect current location</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsLocationModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Real GPS Detection Button */}
            <button
              type="button"
              className={`detect-gps-btn ${isDetecting ? 'loading' : ''} ${detectionSuccess ? 'success' : ''}`}
              onClick={handleDetectGPS}
              disabled={isDetecting}
              id="btn-detect-gps-location"
            >
              {isDetecting ? (
                <>
                  <span className="gps-spinner" />
                  <span>Detecting your location...</span>
                </>
              ) : detectionSuccess ? (
                <>
                  <span className="gps-success-check">✓</span>
                  <span>Location detected</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '16px' }}>🎯</span>
                  <span>Detect Current GPS Location</span>
                </>
              )}
            </button>

            {/* Error Message UI */}
            {detectionError && (
              <div className="location-error-card">
                <div className="location-error-header">
                  <span className="location-error-icon">⚠️</span>
                  <div className="location-error-titles">
                    <span className="location-error-title">{detectionError.title}</span>
                    <span className="location-error-msg">{detectionError.message}</span>
                  </div>
                </div>
                <div className="location-error-actions">
                  <button
                    type="button"
                    className="location-retry-btn"
                    onClick={handleDetectGPS}
                  >
                    🔄 Try Again
                  </button>
                  <button
                    type="button"
                    className="location-manual-btn"
                    onClick={() => {
                      clearDetectionError();
                      setShowManualInput(true);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                  >
                    ✏️ Enter Address Manually
                  </button>
                </div>
              </div>
            )}

            {/* Search Location Bar */}
            <div className="modal-location-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6A5E" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search area, landmark or street..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="modal-location-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="modal-search-clear"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearching && (
              <div className="location-searching-indicator">
                <span className="gps-spinner-dark" /> Searching locations...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="search-results-list">
                <div className="sheet-section-title">Search Results</div>
                {searchResults.map((loc) => (
                  <div
                    key={loc.id}
                    className="saved-addr-item search-result-item"
                    onClick={() => {
                      selectLocation(loc);
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsLocationModalOpen(false);
                    }}
                  >
                    <span className="addr-icon">📍</span>
                    <div className="addr-info">
                      <div className="addr-title-row">
                        <span className="addr-title">{loc.name}</span>
                      </div>
                      <div className="addr-desc">{loc.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Address Input Accordion / Toggle */}
            {showManualInput && (
              <form onSubmit={handleManualAdd} className="manual-address-form">
                <textarea
                  placeholder="Type your complete flat / house no., street, locality, city..."
                  value={manualAddressText}
                  onChange={e => setManualAddressText(e.target.value)}
                  rows={2}
                  className="manual-address-textarea"
                  autoFocus
                />
                <div className="manual-form-actions">
                  <button
                    type="submit"
                    className="save-manual-addr-btn"
                    disabled={!manualAddressText.trim()}
                  >
                    Use this Address
                  </button>
                  <button
                    type="button"
                    className="cancel-manual-btn"
                    onClick={() => setShowManualInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Saved Delivery Addresses Header & Manual Add button */}
            <div className="saved-addr-header-row">
              <span className="sheet-section-title">Saved Delivery Addresses</span>
              {!showManualInput && (
                <button
                  type="button"
                  className="add-custom-addr-link"
                  onClick={() => setShowManualInput(true)}
                >
                  + Add New
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            <div className="saved-addr-list">
              {savedLocations.map((loc) => {
                const isSelected = selectedLocation?.name === loc.name || selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    className={`saved-addr-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      selectLocation(loc);
                      setIsLocationModalOpen(false);
                    }}
                  >
                    <span className="addr-icon">
                      {loc.tag === 'GPS' ? '🎯' : loc.tag === 'Home' ? '🏠' : loc.tag === 'Work' ? '💼' : '📍'}
                    </span>
                    <div className="addr-info">
                      <div className="addr-title-row">
                        <span className="addr-title">{loc.name}</span>
                        <span className={`addr-tag ${loc.tag === 'GPS' ? 'tag-gps' : ''}`}>{loc.tag}</span>
                      </div>
                      <div className="addr-desc">{loc.desc}</div>
                    </div>
                    {isSelected && (
                      <span className="addr-check">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Reference-Matched Cart Drawer (Screen 3) ─── */}
      {isCartDrawerOpen && (
        <div className="customer-modal-backdrop" onClick={() => setIsCartDrawerOpen(false)}>
          <div className="customer-modal-sheet cart-drawer-sheet" onClick={e => e.stopPropagation()}>
            {/* Header: ← My Cart | 2 Items | 🗑️ */}
            <div className="cart-sheet-header">
              <div className="cart-header-left">
                <button type="button" className="cart-back-btn" onClick={() => setIsCartDrawerOpen(false)}>
                  ←
                </button>
                <div>
                  <h3 className="cart-title">My Cart</h3>
                  <span className="cart-count-sub">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                </div>
              </div>
              <button
                type="button"
                className="cart-trash-btn"
                title="Clear Cart"
                onClick={clearCart}
              >
                🗑️
              </button>
            </div>

            {items.length === 0 ? (
              <div className="empty-cart-view">
                <span style={{ fontSize: 52 }}>🛒</span>
                <h4>Your cart is empty</h4>
                <p>Add mouth-watering dishes to satisfy your cravings!</p>
                <button
                  type="button"
                  className="start-ordering-btn"
                  onClick={() => setIsCartDrawerOpen(false)}
                >
                  Browse Menu 🍔
                </button>
              </div>
            ) : (
              <div className="cart-scroll-body">
                {/* Cooking Instructions Banner */}
                <div
                  className="cooking-banner-card"
                  onClick={() => setShowCookingInput(!showCookingInput)}
                >
                  <div className="cooking-banner-left">
                    <span className="chef-hat-icon">👨‍🍳</span>
                    <span className="cooking-banner-text">Add cooking instructions</span>
                  </div>
                  <span className="cooking-banner-arrow">{showCookingInput ? '▲' : '›'}</span>
                </div>

                {showCookingInput && (
                  <div className="cooking-input-box">
                    <textarea
                      placeholder="e.g. Less spicy, extra raita, no onion..."
                      value={cookingInstructions}
                      onChange={e => setCookingInstructions(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                {/* Cart Items List */}
                <div className="cart-items-card">
                  {items.map((it, idx) => (
                    <div key={it.id} className={`cart-dish-row ${idx < items.length - 1 ? 'border-b' : ''}`}>
                      <img
                        src={it.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80'}
                        alt={it.name}
                        className="cart-dish-thumb"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80';
                        }}
                      />
                      <div className="cart-dish-info">
                        <div className="cart-dish-name">{it.name}</div>
                        <div className="cart-dish-price">₹{it.price}</div>
                      </div>
                      <div className="cart-stepper">
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => updateQuantity(it.id, -1)}
                        >
                          −
                        </button>
                        <span className="cart-stepper-val">{it.quantity}</span>
                        <button
                          type="button"
                          className="cart-stepper-btn"
                          onClick={() => updateQuantity(it.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Details */}
                <div className="bill-details-card">
                  <div className="bill-heading">Bill Details</div>
                  <div className="bill-row">
                    <span className="bill-label">Item Total</span>
                    <span className="bill-val">₹{subtotal}</span>
                  </div>
                  <div className="bill-row">
                    <span className="bill-label">Delivery Fee ⓘ</span>
                    <span className="bill-val">₹{deliveryFee}</span>
                  </div>
                  <div className="bill-row">
                    <span className="bill-label">Platform Fee ⓘ</span>
                    <span className="bill-val">₹{platformFee}</span>
                  </div>
                  <div className="bill-row">
                    <span className="bill-label">Taxes (GST)</span>
                    <span className="bill-val">₹{taxes}</span>
                  </div>
                </div>

                {/* Sticky Bottom Bar inside Cart */}
                <div className="cart-to-pay-container">
                  <div className="to-pay-info">
                    <span className="to-pay-label">To Pay</span>
                    <span className="to-pay-amount">₹{total}</span>
                  </div>
                  <button
                    type="button"
                    className="proceed-pay-btn"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      router.push('/customer/checkout');
                    }}
                  >
                    PROCEED TO PAY →
                  </button>
                </div>

                {/* Cart Offer Banner (Screen 3 Bottom) */}
                <div className="cart-offer-promo-card">
                  <div className="cart-offer-left">
                    <span className="offer-tagline">SAVE MORE WITH OFFERS</span>
                    <div className="offer-big-title">FLAT<br />50% OFF</div>
                    <span className="offer-sub-title">On your first order</span>
                    <div className="offer-code-badge">Code: QUICK50</div>
                  </div>
                  <div className="cart-offer-img-box">
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80"
                      alt="Special Offer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <CartProvider>
        <CustomerLayoutContent>{children}</CustomerLayoutContent>
      </CartProvider>
    </LocationProvider>
  );
}
