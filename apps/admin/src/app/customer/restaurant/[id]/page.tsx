'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { restaurantsApi } from '@quickbite/api-client';
import { useCart } from '../../CartContext';

const DEFAULT_MENU_CATEGORIES = [
  {
    id: 'recommended',
    name: 'Recommended',
    items: [
      {
        id: 'item-1',
        name: 'Hyderabadi Biryani',
        description: 'Aromatic basmati rice cooked with spices & served with raita',
        price: 199,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
      },
      {
        id: 'item-2',
        name: 'Chicken 65',
        description: 'Spicy & crispy chicken with curry leaves',
        price: 149,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=300&q=80',
      },
      {
        id: 'item-3',
        name: 'Raita',
        description: 'Cooling yogurt with boondi and spices',
        price: 49,
        foodType: 'VEG',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80',
      },
    ],
  },
  {
    id: 'biryanis',
    name: "Biryani's",
    items: [
      {
        id: 'item-4',
        name: 'Dum Chicken Biryani',
        description: 'Slow-cooked marinated chicken layered in fragrant saffron basmati rice',
        price: 249,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
      },
      {
        id: 'item-5',
        name: 'Paneer Royal Biryani',
        description: 'Charcoal grilled cottage cheese cooked with mint and aromatic spices',
        price: 219,
        foodType: 'VEG',
        imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&q=80',
      },
      {
        id: 'item-6',
        name: 'Mutton Royal Biryani',
        description: 'Tender lamb chunks prepared in traditional Awadhi style with saffron',
        price: 349,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&q=80',
      },
    ],
  },
  {
    id: 'combos',
    name: 'Combos',
    items: [
      {
        id: 'item-7',
        name: 'Biryani Feast for 2',
        description: '2 Chicken Biryanis + 1 Chicken 65 + 2 Cokes + Raita',
        price: 499,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80',
      },
      {
        id: 'item-8',
        name: 'Family Special Box',
        description: '3 Biryanis + 2 Starters + 3 Beverages + Gulab Jamun',
        price: 799,
        foodType: 'NON_VEG',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80',
      },
    ],
  },
  {
    id: 'more',
    name: 'More',
    items: [
      {
        id: 'item-9',
        name: 'Gulab Jamun (2 Pcs)',
        description: 'Soft warm cottage cheese dumplings soaked in rose sugar syrup',
        price: 69,
        foodType: 'VEG',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80',
      },
      {
        id: 'item-10',
        name: 'Coke Zero (300ml)',
        description: 'Chilled refreshing zero calorie beverage can',
        price: 40,
        foodType: 'VEG',
        imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80',
      },
    ],
  },
];

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, updateQuantity, items, itemCount, total, setIsCartDrawerOpen } = useCart();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('recommended');
  const [isFavorite, setIsFavorite] = useState(false);
  const [categories, setCategories] = useState<any[]>(DEFAULT_MENU_CATEGORIES);

  useEffect(() => {
    if (params.id) {
      restaurantsApi.getById(params.id as string)
        .then(r => {
          const d = r.data as any;
          if (d) {
            setRestaurant({
              ...d,
              name: d.name || 'The Biryani House',
              rating: d.rating || 4.6,
              cuisineType: d.cuisineType || 'Biryani, North Indian, Mughlai',
              minOrderAmount: d.minOrderAmount || 200,
              avgDeliveryTime: d.avgDeliveryTime || 25,
              coverImageUrl: d.coverImageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
            });

            const apiCats = d?.menuCategories || d?.categories || [];
            if (apiCats.length > 0) {
              const mapped = apiCats.map((cat: any) => ({
                id: cat.id || cat.name?.toLowerCase(),
                name: cat.name,
                items: (cat.items || cat.menuItems || []).map((it: any) => ({
                  id: it.id,
                  name: it.name,
                  description: it.description || 'Prepared fresh with authentic chef spices',
                  price: it.price || 199,
                  foodType: it.foodType || 'NON_VEG',
                  imageUrl: it.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
                })),
              }));
              setCategories(mapped);
              setActiveCategory(mapped[0].id);
            }
          }
        })
        .catch(() => {
          // Fallback reference data
          setRestaurant({
            id: 'the-biryani-house',
            name: 'The Biryani House',
            rating: 4.6,
            cuisineType: 'Biryani, North Indian, Mughlai',
            minOrderAmount: 200,
            avgDeliveryTime: 25,
            coverImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const getItemCartQuantity = (dishId: string) => {
    const it = items.find(i => i.menuItemId === dishId || i.id === dishId);
    return it ? it.quantity : 0;
  };

  const handleAddToCart = (dish: any) => {
    addItem({
      menuItemId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      foodType: dish.foodType || 'NON_VEG',
      imageUrl: dish.imageUrl,
      restaurantId: restaurant?.id || 'rest-1',
      restaurantName: restaurant?.name || 'The Biryani House',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant?.name || 'Quickbits Food',
        text: `Order mouth-watering food from ${restaurant?.name || 'Quickbits'}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="customer-loading-screen">
        <div className="loading-spinner" />
        <p>Loading restaurant menu...</p>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];

  return (
    <div className="restaurant-detail-screen">
      {/* ─── 1. Top Bar Navigation (Back, Favorite, Share) ─── */}
      <div className="rest-top-nav-bar">
        <button
          type="button"
          className="rest-nav-circle-btn"
          onClick={() => router.push('/customer')}
          title="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="rest-top-nav-actions">
          <button
            type="button"
            className="rest-nav-circle-btn"
            onClick={() => setIsFavorite(!isFavorite)}
            title="Favorite"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? '#E74C3C' : 'none'} stroke={isFavorite ? '#E74C3C' : '#FFFFFF'} strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <button
            type="button"
            className="rest-nav-circle-btn"
            onClick={handleShare}
            title="Share"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── 2. Hero Cover Photo with Time Badge ─── */}
      <div className="rest-hero-cover-container">
        <img
          src={restaurant?.coverImageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80'}
          alt={restaurant?.name || 'Restaurant'}
          className="rest-hero-img"
        />
        <div className="rest-hero-time-badge">
          20–30 MIN
        </div>
      </div>

      {/* ─── 3. Restaurant Information & Offer Chips ─── */}
      <section className="rest-info-card-section">
        <div className="rest-info-header-row">
          <h1 className="rest-main-name">{restaurant?.name || 'The Biryani House'}</h1>
          <div className="rest-rating-pill">
            <span>★</span>
            <span>{restaurant?.rating?.toFixed(1) || '4.6'}</span>
          </div>
        </div>

        <p className="rest-cuisine-subtitle">
          {restaurant?.cuisineType || 'Biryani, North Indian, Mughlai'}
        </p>

        <p className="rest-pricing-delivery-line">
          ₹{restaurant?.minOrderAmount || 200} for one • Free delivery above ₹199
        </p>

        {/* Promotional Chips */}
        <div className="rest-promo-chips-scroll">
          <div className="promo-chip-item">
            <span className="chip-bold">10% OFF</span>
            <span className="chip-sub">Use TRY10</span>
          </div>
          <div className="promo-chip-item">
            <span className="chip-bold">Flat ₹125 OFF</span>
            <span className="chip-sub">Above ₹299</span>
          </div>
          <div className="promo-chip-item">
            <span className="chip-bold">Free Delivery</span>
            <span className="chip-sub">Above ₹199</span>
          </div>
        </div>
      </section>

      {/* ─── 4. Category Navigation Tabs ─── */}
      <section className="rest-category-tabs-section">
        <div className="category-tabs-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`category-nav-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
              {activeCategory === cat.id && <span className="category-nav-underline" />}
            </button>
          ))}
        </div>
      </section>

      {/* ─── 5. Food Items List ─── */}
      <section className="rest-food-items-list-section">
        <div className="food-items-column">
          {currentCategory?.items?.map((dish: any) => {
            const qty = getItemCartQuantity(dish.id);
            return (
              <div key={dish.id} className="food-item-row-card">
                {/* Food Image */}
                <div className="food-item-img-box">
                  <img
                    src={dish.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80'}
                    alt={dish.name}
                    className="food-item-img"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80';
                    }}
                  />
                </div>

                {/* Food Details */}
                <div className="food-item-details-col">
                  <h3 className="food-item-name">{dish.name}</h3>
                  <p className="food-item-desc">{dish.description}</p>
                  <div className="food-item-price">₹{dish.price}</div>
                </div>

                {/* Add Button or Stepper */}
                <div className="food-item-cta-col">
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="food-add-gold-btn"
                      onClick={() => handleAddToCart(dish)}
                    >
                      ADD +
                    </button>
                  ) : (
                    <div className="food-item-stepper">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => {
                          const it = items.find(i => i.menuItemId === dish.id || i.id === dish.id);
                          if (it) updateQuantity(it.id, -1);
                        }}
                      >
                        −
                      </button>
                      <span className="stepper-val">{qty}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => {
                          const it = items.find(i => i.menuItemId === dish.id || i.id === dish.id);
                          if (it) updateQuantity(it.id, 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
