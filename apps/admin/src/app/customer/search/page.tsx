'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../CartContext';

const TRENDING_SEARCHES = [
  'Biryani',
  'Smash Burger',
  'Woodfired Pizza',
  'Peri Peri Fries',
  'Paneer Tikka',
  'Pepperoni',
  'Garlic Bread',
  'Pasta',
];

const SEED_RESTAURANTS = [
  {
    id: 'sharief-bhai',
    name: 'Sharief Bhai Biryani',
    foodType: 'NON_VEG',
    rating: 4.2,
    ratingCount: '3.4K+',
    address: 'Electronic City, Bangalore',
    cuisineType: 'Biryani, Mughlai, Kebabs',
    priceForTwo: 600,
    avgDeliveryTime: '25-30',
    coverImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
  },
  {
    id: 'behrouz-biryani',
    name: 'Behrouz Biryani',
    foodType: 'NON_VEG',
    rating: 4.3,
    ratingCount: '4.1K+',
    address: 'Vidyanagar, Bangalore',
    cuisineType: 'Biryani, North Indian, Royal Mughlai',
    priceForTwo: 550,
    avgDeliveryTime: '20-25',
    coverImageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  },
  {
    id: 'burger-haven',
    name: 'Burger Haven & Fries',
    foodType: 'BOTH',
    rating: 4.4,
    ratingCount: '2.8K+',
    address: 'Koramangala, Bangalore',
    cuisineType: 'Burgers, Fast Food, Fries, American',
    priceForTwo: 450,
    avgDeliveryTime: '20-25',
    coverImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  },
  {
    id: 'tuscany-woodfire',
    name: 'Tuscany Woodfire Pizzeria',
    foodType: 'BOTH',
    rating: 4.5,
    ratingCount: '1.9K+',
    address: 'Indiranagar, Bangalore',
    cuisineType: 'Woodfired Pizza, Italian, Pasta, Garlic Bread',
    priceForTwo: 650,
    avgDeliveryTime: '30-35',
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  },
  {
    id: 'punjab-grill',
    name: 'Punjab Grill Express',
    foodType: 'BOTH',
    rating: 4.3,
    ratingCount: '3.1K+',
    address: 'HSR Layout, Bangalore',
    cuisineType: 'North Indian, Tandoori, Paneer Tikka, Thalis',
    priceForTwo: 500,
    avgDeliveryTime: '25-30',
    coverImageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80',
  },
];

const SEED_DISHES = [
  {
    id: 'dish-biryani-1',
    name: 'Hyderabadi Dum Biryani',
    description: 'Slow-cooked fragrant basmati rice with succulent marinated meat and saffron spices.',
    price: 320,
    foodType: 'NON_VEG',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
    categoryName: 'Biryani',
    restaurantId: 'sharief-bhai',
    restaurantName: 'Sharief Bhai Biryani',
    restaurantRating: 4.2,
  },
  {
    id: 'dish-biryani-2',
    name: 'Royal Paneer Biryani',
    description: 'Rich basmati rice infused with layered cottage cheese cubes, brown onions, and mint.',
    price: 260,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&q=80',
    categoryName: 'Biryani',
    restaurantId: 'behrouz-biryani',
    restaurantName: 'Behrouz Biryani',
    restaurantRating: 4.3,
  },
  {
    id: 'dish-burger-1',
    name: 'Double Smash Burger',
    description: 'Two smashed patties grilled with melted cheddar, caramelized onions, and house sauce.',
    price: 249,
    foodType: 'NON_VEG',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
    categoryName: 'Burgers',
    restaurantId: 'burger-haven',
    restaurantName: 'Burger Haven & Fries',
    restaurantRating: 4.4,
  },
  {
    id: 'dish-burger-2',
    name: 'Crispy Veg Smash Burger',
    description: 'Crispy spiced potato-herb patty with crunchy lettuce, cheese slice, and tangy mayo.',
    price: 189,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80',
    categoryName: 'Burgers',
    restaurantId: 'burger-haven',
    restaurantName: 'Burger Haven & Fries',
    restaurantRating: 4.4,
  },
  {
    id: 'dish-pizza-1',
    name: 'Woodfired Margherita Pizza',
    description: 'Classic artisanal sourdough base, San Marzano tomato sauce, fresh mozzarella, basil.',
    price: 349,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80',
    categoryName: 'Woodfired Pizza',
    restaurantId: 'tuscany-woodfire',
    restaurantName: 'Tuscany Woodfire Pizzeria',
    restaurantRating: 4.5,
  },
  {
    id: 'dish-pizza-2',
    name: 'Spicy Pepperoni Pizza',
    description: 'Crispy wood-baked crust loaded with savory smoked pepperoni and double mozzarella.',
    price: 429,
    foodType: 'NON_VEG',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80',
    categoryName: 'Woodfired Pizza',
    restaurantId: 'tuscany-woodfire',
    restaurantName: 'Tuscany Woodfire Pizzeria',
    restaurantRating: 4.5,
  },
  {
    id: 'dish-fries-1',
    name: 'Peri Peri Crispy Fries',
    description: 'Golden fries tossed in fiery African peri-peri seasoning with garlic mayo dip.',
    price: 139,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80',
    categoryName: 'Fries',
    restaurantId: 'burger-haven',
    restaurantName: 'Burger Haven & Fries',
    restaurantRating: 4.4,
  },
  {
    id: 'dish-paneer-1',
    name: 'Tandoori Paneer Tikka',
    description: 'Succulent cottage cheese cubes marinated in spiced yogurt and grilled to perfection in tandoor.',
    price: 279,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80',
    categoryName: 'Starters',
    restaurantId: 'punjab-grill',
    restaurantName: 'Punjab Grill Express',
    restaurantRating: 4.3,
  },
  {
    id: 'dish-garlicbread-1',
    name: 'Cheesy Garlic Bread',
    description: 'Freshly baked French loaf toasted with herb butter, roasted garlic, and stretchy mozzarella.',
    price: 169,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1619881589146-5154ee0d828c?w=300&q=80',
    categoryName: 'Sides',
    restaurantId: 'tuscany-woodfire',
    restaurantName: 'Tuscany Woodfire Pizzeria',
    restaurantRating: 4.5,
  },
  {
    id: 'dish-pasta-1',
    name: 'Creamy Alfredo Penne Pasta',
    description: 'Al dente penne pasta smothered in a velvety parmesan cream sauce with roasted garlic and herbs.',
    price: 299,
    foodType: 'VEG',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281729?w=300&q=80',
    categoryName: 'Pasta',
    restaurantId: 'tuscany-woodfire',
    restaurantName: 'Tuscany Woodfire Pizzeria',
    restaurantRating: 4.5,
  },
];

function getSafeString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(v => (typeof v === 'string' ? v : v?.name || '')).filter(Boolean).join(', ');
  }
  if (typeof val === 'object' && val.name) return String(val.name);
  return String(val);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [restaurants, setRestaurants] = useState<any[]>(SEED_RESTAURANTS);
  const [dishes, setDishes] = useState<any[]>(SEED_DISHES);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'dishes' | 'restaurants'>('all');
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Sync state if URL search query changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    // Load live restaurants and dishes from Supabase directly
    const loadSearchData = async () => {
      try {
        const { data: supaRests } = await supabase
          .from('restaurants')
          .select('*')
          .eq('is_active', true);

        if (supaRests && supaRests.length > 0) {
          const mappedRests = supaRests.map((item: any, idx: number) => ({
            id: item.id,
            name: item.name,
            foodType: item.food_type || 'BOTH',
            rating: Number(item.rating) || 4.2,
            ratingCount: item.rating_count || '1.5K+',
            address: item.locality || item.address || 'Bengaluru',
            cuisineType: item.cuisine_type || 'Multi-Cuisine',
            priceForTwo: Number(item.price_for_two) || 400,
            avgDeliveryTime: `${item.avg_delivery_time || 25}-${(item.avg_delivery_time || 25) + 5}`,
            coverImageUrl: item.cover_image_url || SEED_RESTAURANTS[idx % SEED_RESTAURANTS.length].coverImageUrl,
          }));
          setRestaurants([...mappedRests, ...SEED_RESTAURANTS]);
        }

        const { data: supaItems } = await supabase
          .from('menu_items')
          .select('*, restaurants(name, rating)')
          .eq('is_available', true)
          .limit(40);

        if (supaItems && supaItems.length > 0) {
          const mappedDishes = supaItems.map((it: any) => ({
            id: it.id,
            name: it.name,
            description: it.description || '',
            price: Number(it.price) || 199,
            foodType: it.food_type || 'VEG',
            imageUrl: it.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
            categoryName: 'Specialties',
            restaurantId: it.restaurant_id,
            restaurantName: it.restaurants?.name || 'QuickBite Partner',
            restaurantRating: Number(it.restaurants?.rating) || 4.2,
          }));
          setDishes([...mappedDishes, ...SEED_DISHES]);
        }
      } catch (err) {
        console.warn('Supabase search load notice:', err);
      }
    };
    loadSearchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  const cleanQuery = query.trim().toLowerCase();

  const matchingRestaurants = restaurants.filter(r => {
    if (isVegOnly && r.foodType === 'NON_VEG') return false;
    if (!cleanQuery) return true;
    const rName = getSafeString(r.name).toLowerCase();
    const rCuisine = getSafeString(r.cuisineType).toLowerCase();
    const rAddress = getSafeString(r.address).toLowerCase();
    return rName.includes(cleanQuery) || rCuisine.includes(cleanQuery) || rAddress.includes(cleanQuery);
  });

  const matchingDishes = dishes.filter(d => {
    if (isVegOnly && d.foodType !== 'VEG') return false;
    if (!cleanQuery) return true;
    const dName = getSafeString(d.name).toLowerCase();
    const dDesc = getSafeString(d.description).toLowerCase();
    const dCat = getSafeString(d.categoryName).toLowerCase();
    const dRest = getSafeString(d.restaurantName).toLowerCase();
    return (
      dName.includes(cleanQuery) ||
      dDesc.includes(cleanQuery) ||
      dCat.includes(cleanQuery) ||
      dRest.includes(cleanQuery)
    );
  });

  return (
    <div className="customer-search-container" style={{ padding: '4px 0 20px' }}>
      {/* ─── Search Input Bar ─── */}
      <div style={{ maxWidth: 720, margin: '0 auto 16px auto' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            className="search-main-input"
            placeholder="Search for restaurants, dishes, cuisines..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 46,
              paddingRight: 40,
              height: 48,
              fontSize: 14,
              borderRadius: 24,
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              background: '#FFFFFF',
              color: '#1F2937',
              outline: 'none',
            }}
            autoFocus
            id="customer-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: 16,
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </form>

        {/* Trending Searches Tags */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#8C7B72', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🔥</span> TRENDING SEARCHES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TRENDING_SEARCHES.map((tag, i) => {
              const isSelected = cleanQuery === tag.toLowerCase();
              return (
                <button
                  key={i}
                  type="button"
                  id={`trending-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 13px',
                    borderRadius: 18,
                    background: isSelected ? '#4A0A10' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: `1px solid ${isSelected ? '#4A0A10' : '#E5E7EB'}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Tabs & Filters ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', maxWidth: '100%' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 16, fontSize: 11, padding: '4px 10px', height: 30 }}
            onClick={() => setActiveTab('all')}
          >
            All ({matchingDishes.length + matchingRestaurants.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'dishes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 16, fontSize: 11, padding: '4px 10px', height: 30 }}
            onClick={() => setActiveTab('dishes')}
          >
            Dishes ({matchingDishes.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'restaurants' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 16, fontSize: 11, padding: '4px 10px', height: 30 }}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants ({matchingRestaurants.length})
          </button>
        </div>

        {/* Veg Only Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#0E9F6E' }}>
          <input
            type="checkbox"
            checked={isVegOnly}
            onChange={e => setIsVegOnly(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#0E9F6E' }}
          />
          <span>Pure Veg 🌱</span>
        </label>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          {/* ─── Dishes Section ─── */}
          {(activeTab === 'all' || activeTab === 'dishes') && matchingDishes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#4A0A10', marginBottom: 10 }}>
                Dishes ({matchingDishes.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchingDishes.map(dish => (
                  <div
                    key={dish.id}
                    className="dish-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      borderRadius: 14,
                      padding: 12,
                      border: '1px solid #EADBCE',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span className={`food-symbol-square ${dish.foodType === 'VEG' ? 'veg-symbol' : 'nonveg-symbol'} mini`}>
                          <span className={dish.foodType === 'VEG' ? 'food-symbol-circle mini' : 'food-symbol-triangle mini'} />
                        </span>
                        <Link href={`/customer/restaurant/${dish.restaurantId}`} style={{ fontSize: 11, color: '#D4890E', fontWeight: 700 }}>
                          {dish.restaurantName} →
                        </Link>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>{dish.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#4A0A10', marginBottom: 4 }}>₹{dish.price}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dish.description}
                      </div>
                    </div>

                    <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'; }}
                      />
                      <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: '80%' }}>
                        <button
                          type="button"
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
                          style={{
                            width: '100%',
                            background: '#FFFFFF',
                            color: '#0E9F6E',
                            border: '1.5px solid #0E9F6E',
                            borderRadius: 6,
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '3px 0',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
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
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#4A0A10', marginBottom: 10 }}>
                Restaurants ({matchingRestaurants.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchingRestaurants.map(r => (
                  <Link key={r.id} href={`/customer/restaurant/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      background: '#FFFFFF',
                      borderRadius: 14,
                      padding: 10,
                      border: '1px solid #EADBCE',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      alignItems: 'center',
                    }}>
                      <img
                        src={r.coverImageUrl}
                        alt={r.name}
                        style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</h4>
                          <span style={{ background: '#0E9F6E', color: '#FFFFFF', padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                            ★ {r.rating}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.cuisineType}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                          ⏱️ {r.avgDeliveryTime} mins • ₹{r.priceForTwo || 400} for two
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchingDishes.length === 0 && matchingRestaurants.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#4A0A10', marginBottom: 4 }}>No results found for &quot;{query}&quot;</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Try tapping on one of the Trending Searches like Biryani, Woodfired Pizza, or Smash Burger.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CustomerSearchPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
