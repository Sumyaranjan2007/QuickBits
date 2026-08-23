'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { restaurantsApi } from '@quickbite/api-client';
import { useCart } from '../CartContext';

const TRENDING_SEARCHES = [
  'Biryani', 'Smash Burger', 'Woodfired Pizza', 'Peri Peri Fries',
  'Paneer Tikka', 'Pepperoni', 'Garlic Bread', 'Pasta'
];

export default function CustomerSearchPage() {
  const { addItem } = useCart();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'dishes' | 'restaurants'>('all');
  const [isVegOnly, setIsVegOnly] = useState(false);

  useEffect(() => {
    // Load all restaurants and dishes for search indexing
    restaurantsApi.list()
      .then(async r => {
        const d = r.data as any;
        const list = d.items || d || [];
        setRestaurants(list);

        const allDishes: any[] = [];
        for (const rest of list) {
          try {
            const resDetail = await restaurantsApi.getById(rest.id);
            const rData = resDetail.data as any;
            const categories = rData?.menuCategories || rData?.categories || [];
            for (const cat of categories) {
              const items = cat?.items || cat?.menuItems || [];
              for (const it of items) {
                allDishes.push({
                  ...it,
                  categoryName: cat.name,
                  restaurantId: rest.id,
                  restaurantName: rest.name,
                  restaurantRating: rest.rating,
                });
              }
            }
          } catch {}
        }
        setDishes(allDishes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const matchingRestaurants = restaurants.filter(r => {
    if (!cleanQuery) return true;
    return r.name?.toLowerCase().includes(cleanQuery) ||
      r.cuisineType?.toLowerCase().includes(cleanQuery) ||
      r.address?.toLowerCase().includes(cleanQuery);
  });

  const matchingDishes = dishes.filter(d => {
    if (isVegOnly && d.foodType !== 'VEG') return false;
    if (!cleanQuery) return true;
    return d.name?.toLowerCase().includes(cleanQuery) ||
      d.description?.toLowerCase().includes(cleanQuery) ||
      d.categoryName?.toLowerCase().includes(cleanQuery) ||
      d.restaurantName?.toLowerCase().includes(cleanQuery);
  });

  return (
    <div>
      {/* ─── Search Input ─── */}
      <div style={{ maxWidth: 720, margin: '0 auto 28px auto' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20 }}>🔍</span>
          <input
            type="text"
            className="input"
            placeholder="Search for restaurants, dishes, cuisines..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              paddingLeft: 48, paddingRight: 40, height: 54,
              fontSize: 16, borderRadius: 28, border: '2px solid var(--border)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)', background: '#fff'
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Trending Searches Tags */}
        {!query && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              🔥 Trending Searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRENDING_SEARCHES.map((tag, i) => (
                <button
                  key={i}
                  className="filter-pill"
                  style={{ fontSize: 12, padding: '6px 14px', background: '#fff' }}
                  onClick={() => setQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Tabs & Filters ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
            onClick={() => setActiveTab('all')}
          >
            All Results ({matchingDishes.length + matchingRestaurants.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'dishes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
            onClick={() => setActiveTab('dishes')}
          >
            Dishes ({matchingDishes.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'restaurants' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 20 }}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants ({matchingRestaurants.length})
          </button>
        </div>

        {/* Veg Only Switch */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={isVegOnly}
            onChange={e => setIsVegOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#00B894' }}
          />
          <span>Pure Veg Only 🥬</span>
        </label>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* ─── Dishes Section ─── */}
          {(activeTab === 'all' || activeTab === 'dishes') && matchingDishes.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                🍔 Food Items ({matchingDishes.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {matchingDishes.map(dish => (
                  <div key={dish.id} className="dish-card" style={{ borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div className="dish-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`food-badge ${dish.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 9 }}>
                          {dish.foodType === 'VEG' ? '● Veg' : '▲ Non-Veg'}
                        </span>
                        <Link href={`/customer/restaurant/${dish.restaurantId}`} style={{ fontSize: 11, color: 'var(--text-sec)', fontWeight: 600 }}>
                          {dish.restaurantName} →
                        </Link>
                      </div>
                      <div className="dish-name">{dish.name}</div>
                      <div className="dish-price">₹{dish.price}</div>
                      <div className="dish-desc">{dish.description}</div>
                    </div>

                    <div className="dish-img-box">
                      <img
                        className="dish-img"
                        src={dish.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                        alt={dish.name}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'; }}
                      />
                      <div className="dish-add-btn-wrapper">
                        <button
                          className="dish-add-btn"
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

          {/* ─── Restaurants Section ─── */}
          {(activeTab === 'all' || activeTab === 'restaurants') && matchingRestaurants.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
                🍽️ Restaurants ({matchingRestaurants.length})
              </h3>
              <div className="cards-grid">
                {matchingRestaurants.map(r => (
                  <Link key={r.id} href={`/customer/restaurant/${r.id}`}>
                    <div className="card">
                      <img
                        className="card-img"
                        src={r.coverImageUrl || r.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                        alt={r.name}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'; }}
                      />
                      <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="card-title">{r.name}</div>
                          <div className="rating">
                            <span className="rating-star">⭐</span>
                            <span className="rating-value">{r.rating || '4.6'}</span>
                          </div>
                        </div>
                        <div className="card-text">{r.cuisineType}</div>
                        <div className="card-meta">
                          <span className="card-meta-item">🕐 {r.avgDeliveryTime || 25} mins</span>
                          <span className="card-meta-item">💰 Min ₹{r.minOrderAmount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchingDishes.length === 0 && matchingRestaurants.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No results found for &quot;{query}&quot;</div>
              <div className="empty-state-text">Check your spelling or try searching for general food items like Biryani, Burger, Pizza.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
