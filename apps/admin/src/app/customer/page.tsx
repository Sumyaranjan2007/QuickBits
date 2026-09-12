'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restaurantsApi } from '@quickbite/api-client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';

const FILTER_TABS = [
  { id: 'all', label: 'All', icon: '🔥' },
  { id: 'offers', label: 'Offers', icon: '🏷️' },
  { id: 'gourmet', label: 'Gourmet', icon: '👑' },
  { id: 'pure-veg', label: 'Pure Veg', icon: '🌱' },
  { id: 'fast', label: 'Fast Delivery', icon: '⚡' },
  { id: 'rating', label: 'Rating 4.0+', icon: '⭐' },
];

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

const REFERENCE_RESTAURANTS = [
  {
    id: 'sharief-bhai',
    name: 'Sharief Bhai Biryani',
    tag: 'Best in Biryani',
    rating: 4.0,
    ratingCount: '3.4K+',
    locality: 'Electronic City, 2.9 km',
    cuisineType: 'Biryani, Shawarma',
    priceForTwo: 600,
    avgDeliveryTime: '30-35',
    discountBadge: '50% OFF',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  },
  {
    id: 'behrouz-biryani',
    name: 'Behrouz Biryani',
    tag: 'Best in Mughlai',
    rating: 4.1,
    ratingCount: '4.1K+',
    locality: 'Vidyanagar, 2.5 km',
    cuisineType: 'Biryani, North Indian',
    priceForTwo: 500,
    avgDeliveryTime: '25-30',
    discountBadge: 'Items at ₹189',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
  },
  {
    id: 'the-biryani-life',
    name: 'The Biryani Life',
    tag: 'Special Biryani',
    rating: 4.1,
    ratingCount: '2.2K+',
    locality: 'Vidyanagar, 2.5 km',
    cuisineType: 'Biryani, Mughlai',
    priceForTwo: 250,
    avgDeliveryTime: '20-25',
    discountBadge: 'Items at ₹189',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80',
  },
  {
    id: 'big-bowl',
    name: 'Big Bowl',
    tag: 'Comfort Bowls',
    rating: 4.4,
    ratingCount: '1.3K+',
    locality: 'Iggalur, 2.9 km',
    cuisineType: 'North Indian, Chinese',
    priceForTwo: 350,
    avgDeliveryTime: '30-35',
    discountBadge: 'Buy 1 get 1',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
  },
  {
    id: 'kfc',
    name: 'KFC',
    tag: 'Best in Rolls',
    rating: 4.1,
    ratingCount: '1.0K+',
    locality: 'Chandapura, 2.3 km',
    cuisineType: 'Burgers, Fast Food, Rolls',
    priceForTwo: 400,
    avgDeliveryTime: '25-30',
    discountBadge: '50% OFF + 10% extra off',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800&q=80',
  },
  {
    id: 'chinese-wok',
    name: 'Chinese Wok',
    tag: 'Wok Specialties',
    rating: 4.3,
    ratingCount: '1.8K+',
    locality: 'Iggalur, 2.9 km',
    cuisineType: 'Chinese, Asian',
    priceForTwo: 250,
    avgDeliveryTime: '30-35',
    discountBadge: 'Buy 1 get 1',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  },
  {
    id: 'thalaiva-biryani',
    name: 'Thalaiva Biryani',
    tag: 'Authentic South Indian',
    rating: 4.1,
    ratingCount: '500+',
    locality: 'Vidyanagar, 2.5 km',
    cuisineType: 'Biryani, Mughlai',
    priceForTwo: 400,
    avgDeliveryTime: '25-30',
    discountBadge: 'Items at ₹189',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80',
  },
  {
    id: 'itminaan-matka',
    name: 'Itminaan Matka Biryani - Slow Cooked',
    tag: 'Claypot Specialty',
    rating: 4.2,
    ratingCount: '850+',
    locality: 'Electronic City, 3.1 km',
    cuisineType: 'Biryani, North Indian',
    priceForTwo: 550,
    avgDeliveryTime: '35-45',
    discountBadge: 'Buy 1 get 1',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  },
  {
    id: 'pizza-corner',
    name: 'Pizza Corner',
    tag: 'Best in Italian',
    rating: 4.4,
    ratingCount: '2.1K+',
    locality: 'Koramangala, 1.8 km',
    cuisineType: 'Pizza, Fast Food',
    priceForTwo: 350,
    avgDeliveryTime: '20-25',
    discountBadge: '40% OFF',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  },
  {
    id: 'burger-bistro',
    name: 'Burger Bistro',
    tag: 'Gourmet Burgers',
    rating: 4.5,
    ratingCount: '3.8K+',
    locality: 'Indiranagar, 2.1 km',
    cuisineType: 'Burgers, American',
    priceForTwo: 300,
    avgDeliveryTime: '15-20',
    discountBadge: '30% OFF',
    freeDelivery: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  },
];

const NEWLY_FEATURED = [
  {
    id: 'papa-johns',
    name: 'Papa Johns',
    offerText: 'FLAT DEAL ₹125 OFF',
    subText: 'ABOVE ₹249',
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  },
  {
    id: 'the-cheesecake-co',
    name: 'The Cheesecake Co.',
    offerText: '60% OFF',
    subText: 'UPTO ₹150',
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80',
  },
  {
    id: 'zingry',
    name: 'Zingry Fried Chicken',
    offerText: 'SAVE BIG 30% OFF',
    subText: 'UPTO ₹100',
    freeDelivery: true,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
  },
];

export default function CustomerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();

  const [restaurants, setRestaurants] = useState<any[]>(REFERENCE_RESTAURANTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    restaurantsApi.list()
      .then(r => {
        const d = r.data as any;
        const list = d.items || d || [];
        if (Array.isArray(list) && list.length > 0) {
          const merged = list.map((item, idx) => ({
            id: item.id,
            name: item.name,
            tag: idx % 2 === 0 ? 'Best in Biryani' : 'Popular Choice',
            rating: item.rating || (4.1 + (idx % 4) * 0.1),
            ratingCount: `${(2 + idx * 0.7).toFixed(1)}K+`,
            locality: item.address || 'Koramangala, 2.1 km',
            cuisineType: item.cuisineType || (idx % 2 === 0 ? 'Biryani, North Indian' : 'Pizza, Fast Food'),
            priceForTwo: item.minOrderAmount ? item.minOrderAmount * 2 : 400,
            avgDeliveryTime: `${item.avgDeliveryTime || 25}-${(item.avgDeliveryTime || 25) + 5}`,
            discountBadge: idx === 0 ? '50% OFF' : idx === 1 ? 'Items at ₹189' : 'Buy 1 get 1',
            freeDelivery: true,
            coverImageUrl: item.coverImageUrl || REFERENCE_RESTAURANTS[idx % REFERENCE_RESTAURANTS.length].coverImageUrl,
          }));
          setRestaurants(merged);
        }
      })
      .catch(() => {
        setRestaurants(REFERENCE_RESTAURANTS);
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
    if (activeTab === 'offers' && !r.discountBadge) return false;
    if (activeTab === 'gourmet' && (r.rating < 4.4 && r.priceForTwo < 450)) return false;
    if (activeTab === 'fast' && parseInt(r.avgDeliveryTime?.split('-')[0] || '30') > 25) return false;
    if (activeTab === 'rating' && r.rating < 4.2) return false;

    if (selectedCategory && selectedCategory !== 'more') {
      const cat = selectedCategory.toLowerCase();
      if (!r.cuisineType?.toLowerCase().includes(cat) && !r.name?.toLowerCase().includes(cat)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="customer-home-screen">
      {/* ─── 1. Hero Cravings Headline (User Reference Top) ─── */}
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

      {/* ─── 3. Food Category Circular Strip ─── */}
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

      {/* ─── 4. HOT DEALS 🔥 Promotional Banner ─── */}
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

      {/* ─── 5. Sub-Tabs Filter Row ─── */}
      <section className="feed-filter-bar">
        <div className="feed-filter-scroll-row">
          {FILTER_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`feed-filter-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="feed-tab-icon">{tab.icon}</span>
                <span className="feed-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 6. Vertical Restaurant Feed (Replaces Bottom Ads) ─── */}
      <section className="restaurant-vertical-feed-section">
        <div className="section-header-row" style={{ padding: '0 2px 8px' }}>
          <h2 className="section-title">Popular Restaurants</h2>
          <Link href="/customer/search" className="section-see-all-link">
            See all
          </Link>
        </div>

        <div className="rest-feed-list">
          {filteredRestaurants.slice(0, 3).map((rest) => {
            const isFav = favorites.has(rest.id);
            return (
              <Link
                key={rest.id}
                href={`/customer/restaurant/${rest.id}`}
                className="rest-feed-card-link"
              >
                <div className="rest-feed-card">
                  {/* Hero Cover Image Container with Badges */}
                  <div className="rest-feed-img-box">
                    <img
                      src={rest.coverImageUrl}
                      alt={rest.name}
                      className="rest-feed-img"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80';
                      }}
                    />

                    {/* Carousel Dots Indicator */}
                    <div className="rest-feed-dots">
                      <span className="active" />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      className="rest-feed-fav-btn"
                      onClick={(e) => toggleFavorite(e, rest.id)}
                      title="Favorite"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#FF385C' : 'none'} stroke={isFav ? '#FF385C' : '#FFFFFF'} strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Overlaid Bottom Discount & Delivery Badges */}
                    <div className="rest-feed-overlay-bottom">
                      {rest.discountBadge && (
                        <div className="rest-feed-offer-badge">
                          <span>🔥</span>
                          <span>{rest.discountBadge}</span>
                        </div>
                      )}
                      <div className="rest-feed-time-badge">
                        <span className="rest-feed-time-text">{rest.avgDeliveryTime} MINS</span>
                        {rest.freeDelivery && (
                          <span className="rest-feed-free-dl">FREE DELIVERY</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info Details */}
                  <div className="rest-feed-body">
                    {rest.tag && (
                      <div className="rest-feed-tag">
                        <span>👑</span>
                        <span>{rest.tag}</span>
                      </div>
                    )}
                    <div className="rest-feed-name-row">
                      <h3 className="rest-feed-name">{rest.name}</h3>
                    </div>

                    <div className="rest-feed-rating-row">
                      <div className="rest-feed-rating-pill">
                        <span>★</span>
                        <span>{rest.rating?.toFixed(1) || '4.0'}</span>
                      </div>
                      <span className="rest-feed-rating-count">({rest.ratingCount || '1.0K+'})</span>
                      <span className="rest-feed-dot-sep">•</span>
                      <span className="rest-feed-locality">{rest.locality}</span>
                    </div>

                    <div className="rest-feed-cuisine-row">
                      <span>{rest.cuisineType}</span>
                      <span className="rest-feed-dot-sep">•</span>
                      <span>₹{rest.priceForTwo || 400} for two</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* ─── Newly Featured for You (Carousel in feed) ─── */}
          <div className="newly-featured-container">
            <h4 className="newly-featured-heading">Newly featured for you</h4>
            <div className="featured-horizontal-scroll">
              {NEWLY_FEATURED.map(feat => (
                <div key={feat.id} className="featured-brand-card" onClick={() => router.push('/customer/search')}>
                  <div className="featured-card-img-wrapper">
                    <img src={feat.image} alt={feat.name} className="featured-card-img" />
                    <div className="featured-one-badge">
                      <span>⚡ Free Delivery</span>
                    </div>
                    <div className="featured-discount-overlay">
                      <div className="featured-offer-title">{feat.offerText}</div>
                      <div className="featured-offer-sub">{feat.subText}</div>
                    </div>
                  </div>
                  <div className="featured-card-name">{feat.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining Restaurant Cards in Feed */}
          {filteredRestaurants.slice(3).map((rest) => {
            const isFav = favorites.has(rest.id);
            return (
              <Link
                key={rest.id}
                href={`/customer/restaurant/${rest.id}`}
                className="rest-feed-card-link"
              >
                <div className="rest-feed-card">
                  <div className="rest-feed-img-box">
                    <img
                      src={rest.coverImageUrl}
                      alt={rest.name}
                      className="rest-feed-img"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80';
                      }}
                    />

                    <div className="rest-feed-dots">
                      <span className="active" />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <button
                      type="button"
                      className="rest-feed-fav-btn"
                      onClick={(e) => toggleFavorite(e, rest.id)}
                      title="Favorite"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#FF385C' : 'none'} stroke={isFav ? '#FF385C' : '#FFFFFF'} strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <div className="rest-feed-overlay-bottom">
                      {rest.discountBadge && (
                        <div className="rest-feed-offer-badge">
                          <span>🔥</span>
                          <span>{rest.discountBadge}</span>
                        </div>
                      )}
                      <div className="rest-feed-time-badge">
                        <span className="rest-feed-time-text">{rest.avgDeliveryTime} MINS</span>
                        {rest.freeDelivery && (
                          <span className="rest-feed-free-dl">FREE DELIVERY</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rest-feed-body">
                    {rest.tag && (
                      <div className="rest-feed-tag">
                        <span>👑</span>
                        <span>{rest.tag}</span>
                      </div>
                    )}
                    <div className="rest-feed-name-row">
                      <h3 className="rest-feed-name">{rest.name}</h3>
                    </div>

                    <div className="rest-feed-rating-row">
                      <div className="rest-feed-rating-pill">
                        <span>★</span>
                        <span>{rest.rating?.toFixed(1) || '4.0'}</span>
                      </div>
                      <span className="rest-feed-rating-count">({rest.ratingCount || '1.0K+'})</span>
                      <span className="rest-feed-dot-sep">•</span>
                      <span className="rest-feed-locality">{rest.locality}</span>
                    </div>

                    <div className="rest-feed-cuisine-row">
                      <span>{rest.cuisineType}</span>
                      <span className="rest-feed-dot-sep">•</span>
                      <span>₹{rest.priceForTwo || 400} for two</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 7. Floating Search Pill Button ─── */}
      <button
        type="button"
        className="feed-floating-search-btn"
        onClick={() => router.push('/customer/search')}
      >
        <span>🔍</span>
        <span>Search</span>
      </button>
    </div>
  );
}
