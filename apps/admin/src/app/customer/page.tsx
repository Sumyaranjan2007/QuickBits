'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restaurantsApi } from '@quickbite/api-client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from './CartContext';

const FOOD_CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: '🍽️' },
  { id: 'biryani', name: 'Biryani', icon: '🍚' },
  { id: 'pizza', name: 'Pizzas', icon: '🍕' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'north-indian', name: 'North Indian', icon: '🍛' },
  { id: 'fast-food', name: 'Fast Food', icon: '🍟' },
  { id: 'italian', name: 'Italian', icon: '🍝' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'drinks', name: 'Beverages', icon: '🥤' },
];

export default function CustomerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem, itemCount, total, setIsCartDrawerOpen } = useCart();

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [popularDishes, setPopularDishes] = useState<any[]>([]);

  useEffect(() => {
    restaurantsApi.list()
      .then(async r => {
        const d = r.data as any;
        const list = d.items || d || [];
        setRestaurants(list);

        // Fetch menu items from each restaurant to populate popular dishes
        const allDishes: any[] = [];
        for (const rest of list.slice(0, 3)) {
          try {
            const restDetail = await restaurantsApi.getById(rest.id);
            const rData = restDetail.data as any;
            const categories = rData?.menuCategories || rData?.categories || [];
            for (const cat of categories) {
              const items = cat?.items || cat?.menuItems || [];
              for (const it of items) {
                allDishes.push({
                  ...it,
                  restaurantId: rest.id,
                  restaurantName: rest.name,
                });
              }
            }
          } catch {}
        }
        setPopularDishes(allDishes.slice(0, 6));
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort Logic
  const filteredRestaurants = restaurants.filter(r => {
    if (selectedCategory !== 'all') {
      const matchCat = r.cuisineType?.toLowerCase().includes(selectedCategory.replace('-', ' '));
      if (!matchCat) return false;
    }
    if (activeFilter === 'fast') return (r.avgDeliveryTime || 30) <= 25;
    if (activeFilter === 'top_rated') return (r.rating || 0) >= 4.5;
    if (activeFilter === 'offers') return true;
    if (activeFilter === 'veg') return r.cuisineType?.toLowerCase().includes('veg');
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'delivery_time') return (a.avgDeliveryTime || 30) - (b.avgDeliveryTime || 30);
    if (sortBy === 'cost_asc') return (a.minOrderAmount || 0) - (b.minOrderAmount || 0);
    return 0;
  });

  return (
    <div>
      {/* ─── 1. Promotional Hero Banner ─── */}
      <div className="promo-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="promo-badge">🎉 Special Promotion</span>
          <h1 className="promo-title">Craving Delicious Food,<br />Delivered Superfast?</h1>
          <p className="promo-desc">
            Enjoy <strong>50% OFF</strong> up to ₹100 on your first order. Use code <strong style={{ textDecoration: 'underline' }}>WELCOME50</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              className="btn"
              style={{ background: '#fff', color: '#FF6B35', fontWeight: 800, padding: '10px 20px', borderRadius: 20 }}
              onClick={() => router.push('/customer/offers')}
            >
              View All Offers 🏷️
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 20 }}
              onClick={() => {
                const el = document.getElementById('all-restaurants');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Order Now 🚀
            </button>
          </div>
        </div>

        <div className="promo-banner-emoji">
          🍕
        </div>
      </div>

      {/* ─── 2. Food Category Strip ─── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>What&apos;s on your mind?</h2>
          <span style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 }}>Explore top dishes</span>
        </div>

        <div className="category-strip">
          {FOOD_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
            >
              <div className="category-icon-box">
                {cat.icon}
              </div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. Quick Filter Bar ─── */}
      <div className="filter-bar">
        <button
          className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-pill ${activeFilter === 'fast' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'fast' ? 'all' : 'fast')}
        >
          ⚡ Fast Delivery (&lt; 25 mins)
        </button>
        <button
          className={`filter-pill ${activeFilter === 'top_rated' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'top_rated' ? 'all' : 'top_rated')}
        >
          ⭐ Rating 4.5+
        </button>
        <button
          className={`filter-pill ${activeFilter === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'offers' ? 'all' : 'offers')}
        >
          🏷️ Great Offers
        </button>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="filter-pill"
          style={{ paddingRight: 24, outline: 'none', background: '#fff' }}
        >
          <option value="rating">Sort by: Rating (High to Low)</option>
          <option value="delivery_time">Sort by: Delivery Time</option>
          <option value="cost_asc">Sort by: Min Order</option>
        </select>
      </div>

      {/* ─── 4. Popular Dishes to Order Now (Direct Add to Cart) ─── */}
      {popularDishes.length > 0 && selectedCategory === 'all' && activeFilter === 'all' && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>🔥 Popular Dishes Near You</h2>
              <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>Top ordered items right now</p>
            </div>
          </div>

          <div className="popular-dishes-grid">
            {popularDishes.map(dish => (
              <div
                key={dish.id}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid var(--border)',
                  padding: 16, display: 'flex', gap: 12, alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)', transition: '0.2s'
                }}
              >
                <img
                  src={dish.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                  alt={dish.name}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                  onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className={`food-badge ${dish.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 9 }}>
                    {dish.foodType === 'VEG' ? '● Veg' : '▲ Non-Veg'}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {dish.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{dish.restaurantName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--primary)' }}>₹{dish.price}</span>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ padding: '4px 12px', fontSize: 12, borderRadius: 6 }}
                      onClick={() => addItem({
                        menuItemId: dish.id,
                        name: dish.name,
                        price: dish.price,
                        quantity: 1,
                        foodType: dish.foodType || 'NON_VEG',
                        imageUrl: dish.imageUrl,
                        restaurantId: dish.restaurantId,
                        restaurantName: dish.restaurantName,
                      })}
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. All Restaurants Grid ─── */}
      <div id="all-restaurants" style={{ marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>
              🍽️ Restaurants to Explore ({filteredRestaurants.length})
            </h2>
            <p className="page-subtitle">Handpicked dining destinations delivering to you</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="cards-grid">
            {filteredRestaurants.map(r => (
              <Link key={r.id} href={`/customer/restaurant/${r.id}`}>
                <div className="card" style={{ cursor: 'pointer', position: 'relative' }}>
                  {/* Top discount ribbon */}
                  <div style={{ position: 'relative' }}>
                    <img
                      className="card-img"
                      src={r.coverImageUrl || r.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                      alt={r.name}
                      onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'; }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 10, left: 10,
                      background: 'rgba(26, 26, 46, 0.85)', backdropFilter: 'blur(4px)',
                      color: '#FFD93D', fontSize: 11, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span>🏷️ 50% OFF UPTO ₹100</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="card-title" style={{ fontSize: 18, marginBottom: 2 }}>{r.name}</div>
                      <div className="rating">
                        <span className="rating-star">⭐</span>
                        <span className="rating-value">{r.rating || '4.6'}</span>
                        <span className="rating-count">({r.totalRatings || 120})</span>
                      </div>
                    </div>

                    <div className="card-text" style={{ fontWeight: 500, color: 'var(--text-sec)' }}>
                      {r.cuisineType || 'Burgers, Fast Food'}
                    </div>

                    <div className="card-meta" style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      <span className="card-meta-item">🕐 <strong>{r.avgDeliveryTime || 25} mins</strong></span>
                      <span className="card-meta-item">📍 <strong>2.4 km</strong></span>
                      <span className="card-meta-item">💰 ₹{r.minOrderAmount ? r.minOrderAmount * 2 : 350} for two</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {filteredRestaurants.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">No restaurants match your filters</div>
                <div className="empty-state-text">Try removing filters or selecting &quot;All Cuisines&quot; to see available options.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 6. Floating Bottom Cart Bar ─── */}
      {itemCount > 0 && (
        <div className="floating-cart-bar" onClick={() => setIsCartDrawerOpen(true)}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} ADDED</span>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Extra ₹50 OFF applied</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>₹{total}</span>
            <span style={{ background: '#fff', color: '#FF6B35', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13 }}>
              View Cart →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
