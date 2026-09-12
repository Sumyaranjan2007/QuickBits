'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restaurantsApi } from '@quickbite/api-client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';

const FOOD_CATEGORIES = [
  {
    id: 'biryani',
    name: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80',
  },
  {
    id: 'burgers',
    name: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
  },
  {
    id: 'chinese',
    name: 'Chinese',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&q=80',
  },
  {
    id: 'thalis',
    name: 'Thalis',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&q=80',
  },
  {
    id: 'more',
    name: 'More',
    isMore: true,
  },
];

const DEFAULT_POPULAR_RESTAURANTS = [
  {
    id: 'the-biryani-house',
    name: 'The Biryani House',
    cuisineType: 'Biryani, North Indian',
    rating: 4.6,
    avgDeliveryTime: 20,
    minOrderAmount: 200,
    discountBadge: '10% OFF',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  },
  {
    id: 'pizza-corner',
    name: 'Pizza Corner',
    cuisineType: 'Pizza, Fast Food',
    rating: 4.4,
    avgDeliveryTime: 25,
    minOrderAmount: 150,
    discountBadge: '15% OFF',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },
  {
    id: 'burger-bistro',
    name: 'Burger Bistro',
    cuisineType: 'Burgers, American',
    rating: 4.5,
    avgDeliveryTime: 18,
    minOrderAmount: 180,
    discountBadge: '20% OFF',
    coverImageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
  },
];

export default function CustomerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();

  const [restaurants, setRestaurants] = useState<any[]>(DEFAULT_POPULAR_RESTAURANTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    restaurantsApi.list()
      .then(r => {
        const d = r.data as any;
        const list = d.items || d || [];
        if (Array.isArray(list) && list.length > 0) {
          // Merge with reference presentation properties
          setRestaurants(list.map((item, idx) => ({
            ...item,
            rating: item.rating || (4.3 + (idx % 4) * 0.1),
            avgDeliveryTime: item.avgDeliveryTime || (20 + (idx % 3) * 5),
            minOrderAmount: item.minOrderAmount || (150 + idx * 25),
            discountBadge: idx === 0 ? '10% OFF' : idx === 1 ? '15% OFF' : '20% OFF',
            coverImageUrl: item.coverImageUrl || DEFAULT_POPULAR_RESTAURANTS[idx % DEFAULT_POPULAR_RESTAURANTS.length].coverImageUrl,
          })));
        }
      })
      .catch(() => {
        // Fallback to reference mock list
        setRestaurants(DEFAULT_POPULAR_RESTAURANTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    if (!selectedCategory || selectedCategory === 'more') return true;
    const cat = selectedCategory.toLowerCase();
    return (
      r.cuisineType?.toLowerCase().includes(cat) ||
      r.name?.toLowerCase().includes(cat)
    );
  });

  return (
    <div className="customer-home-screen">
      {/* ─── 1. Hero Cravings Headline ─── */}
      <section className="hero-cravings-section">
        <h1 className="hero-cravings-title">
          WHAT&apos;S YOUR<br />
          <span>CRAVING?</span>
        </h1>
        <p className="hero-cravings-sub">We&apos;ve got it.</p>
      </section>

      {/* ─── 2. Search Bar & Filter ─── */}
      <section className="search-bar-section">
        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <div className="search-bar-pill">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search for biryani, pizza, burgers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="filter-square-btn"
            onClick={() => router.push('/customer/search')}
            title="Filters"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
        </form>
      </section>

      {/* ─── 3. Food Category Strip (Circular Items) ─── */}
      <section className="food-categories-section">
        <div className="category-scroll-row">
          {FOOD_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`category-item-col ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              >
                <div className="category-circle-box">
                  {cat.isMore ? (
                    <div className="category-more-dots">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="category-circle-img"
                    />
                  )}
                </div>
                <span className="category-label">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 4. Promotional Banner (HOT DEALS 🔥) ─── */}
      <section className="hot-deals-banner-section">
        <div className="hot-deals-banner-card">
          <div className="hot-deals-left">
            <span className="deals-tag">HOT DEALS 🔥</span>
            <div className="deals-discount-text">
              UP TO<br />
              <strong>50% OFF</strong>
            </div>
            <span className="deals-subtext">On top restaurants</span>
            <button
              type="button"
              className="deals-cta-btn"
              onClick={() => router.push('/customer/offers')}
            >
              ORDER NOW →
            </button>
          </div>
          <div className="hot-deals-right">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80"
              alt="Hot Deals Food"
              className="hot-deals-img"
            />
          </div>
        </div>
      </section>

      {/* ─── 5. Popular Restaurants Horizontal Carousel ─── */}
      <section className="popular-restaurants-section">
        <div className="section-header-row">
          <h2 className="section-title">Popular Restaurants</h2>
          <Link href="/customer/search" className="section-see-all-link">
            See all
          </Link>
        </div>

        <div className="restaurants-scroll-row">
          {filteredRestaurants.map(rest => {
            const isFav = favorites.has(rest.id);
            return (
              <Link
                key={rest.id}
                href={`/customer/restaurant/${rest.id}`}
                className="rest-card-link"
              >
                <div className="rest-card">
                  {/* Restaurant Image Container */}
                  <div className="rest-card-img-wrapper">
                    <img
                      src={rest.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'}
                      alt={rest.name}
                      className="rest-card-img"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
                      }}
                    />
                    {/* Delivery Time Badge */}
                    <div className="rest-time-badge">
                      <span className="time-val">{rest.avgDeliveryTime || 20}</span>
                      <span className="time-unit">MIN</span>
                    </div>
                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      className="rest-heart-btn"
                      onClick={(e) => toggleFavorite(e, rest.id)}
                      title="Favorite"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? '#E74C3C' : 'none'} stroke={isFav ? '#E74C3C' : '#FFFFFF'} strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Restaurant Card Details */}
                  <div className="rest-card-info">
                    <div className="rest-name-rating-row">
                      <h3 className="rest-name">{rest.name}</h3>
                      <div className="rest-rating-badge">
                        <span>★</span>
                        <span>{rest.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    <div className="rest-cuisine-text">{rest.cuisineType || 'Biryani, North Indian'}</div>
                    <div className="rest-price-text">₹{rest.minOrderAmount || 200} for one</div>
                    {rest.discountBadge && (
                      <div className="rest-offer-chip">{rest.discountBadge}</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Reusable Promotional Banners (Bottom Row of Reference) ─── */}
      <section className="promo-banners-showcase">
        {/* Banner 1: FIRST ORDER OFFER */}
        <div className="promo-card promo-first-order" onClick={() => router.push('/customer/offers')}>
          <div className="promo-card-left">
            <span className="promo-subtag">FIRST ORDER OFFER</span>
            <div className="promo-big-headline">FLAT<br />50% OFF</div>
            <span className="promo-desc-line">On your first order</span>
            <div className="promo-coupon-pill">Code: QUICK50</div>
          </div>
          <div className="promo-card-right">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80"
              alt="Burger Offer"
            />
          </div>
        </div>

        {/* Banner 2: FREE DELIVERY */}
        <div className="promo-card promo-free-delivery" onClick={() => router.push('/customer/offers')}>
          <div className="promo-card-left">
            <span className="promo-yellow-title">FREE DELIVERY</span>
            <span className="promo-desc-line-dark">On orders above ₹199</span>
            <div className="promo-coupon-pill-gold">Code: FREEDL</div>
          </div>
          <div className="promo-card-right">
            <img
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&q=80"
              alt="Free Delivery Rider"
            />
          </div>
        </div>

        {/* Banner 3: FLAT ₹100 OFF */}
        <div className="promo-card promo-flat-100" onClick={() => router.push('/customer/offers')}>
          <div className="promo-card-left">
            <span className="promo-yellow-title">FLAT ₹100 OFF</span>
            <span className="promo-desc-line">On orders above ₹299</span>
            <div className="promo-coupon-pill">Code: TRY100</div>
          </div>
          <div className="promo-card-right">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80"
              alt="Pizza Offer"
            />
          </div>
        </div>

        {/* Brand Card: Quickbits — Bites that reach you quick! */}
        <div className="quickbits-brand-card">
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
      </section>
    </div>
  );
}
