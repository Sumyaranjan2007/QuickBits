'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { restaurantsApi } from '@quickbite/api-client';
import { useCart } from '../../CartContext';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, updateQuantity, items, itemCount, total, setIsCartDrawerOpen } = useCart();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Customization Modal State
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (params.id) {
      restaurantsApi.getById(params.id as string)
        .then(r => {
          const d = r.data as any;
          setRestaurant(d);
          const categories = d?.menuCategories || d?.categories || [];
          if (categories.length > 0) setActiveCategory(categories[0].id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!restaurant) return (
    <div className="empty-state">
      <div className="empty-state-icon">😞</div>
      <div className="empty-state-title">Restaurant Not Found</div>
      <button className="btn btn-primary" onClick={() => router.push('/customer')} style={{ marginTop: 16 }}>
        Back to Restaurants
      </button>
    </div>
  );

  const categories = restaurant.menuCategories || restaurant.categories || [];

  // Helper to find item quantity in cart
  const getItemQuantity = (menuItemId: string) => {
    return items
      .filter(it => it.menuItemId === menuItemId)
      .reduce((sum, it) => sum + it.quantity, 0);
  };

  const handleOpenCustomization = (dish: any) => {
    // If dish has addons, open modal
    const addons = dish.addons || [];
    if (addons.length > 0) {
      setCustomizingItem(dish);
      setSelectedAddons([]);
      setSpecialInstructions('');
    } else {
      // Direct add
      addItem({
        menuItemId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        foodType: dish.foodType || 'NON_VEG',
        imageUrl: dish.imageUrl,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
      });
    }
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    addItem({
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      price: customizingItem.price,
      quantity: 1,
      foodType: customizingItem.foodType || 'NON_VEG',
      imageUrl: customizingItem.imageUrl,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      addons: selectedAddons,
      specialInstructions,
    });
    setCustomizingItem(null);
  };

  return (
    <div>
      {/* ─── 1. Restaurant Header Hero Card ─── */}
      <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 28, boxShadow: 'var(--shadow-sm)' }}>
        {/* Cover Photo */}
        <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
          <img
            src={restaurant.coverImageUrl || restaurant.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000'}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)' }} />

          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.2 }}>{restaurant.name}</h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 }}>
                  {restaurant.cuisineType || 'Burgers, Fast Food'} • {restaurant.address}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.95)', color: '#1A1A2E', borderRadius: 12, padding: '8px 14px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#00B894', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span>⭐</span> {restaurant.rating || '4.8'}
                </div>
                <div style={{ fontSize: 10, color: '#636E8A', fontWeight: 700 }}>{restaurant.totalRatings || 240}+ reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Strip */}
        <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: 20, borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)', fontSize: 13, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🕐</span>
            <span><strong>{restaurant.avgDeliveryTime || 25} mins</strong> Delivery Time</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍</span>
            <span><strong>2.4 km</strong> from Indiranagar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💰</span>
            <span><strong>₹{restaurant.minOrderAmount ? restaurant.minOrderAmount * 2 : 350}</strong> for two</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🚚</span>
            <span>Delivery: <strong>₹{restaurant.deliveryFee || 35}</strong> (FREE above ₹299)</span>
          </div>
        </div>

        {/* Offers Ribbon */}
        <div style={{ padding: '12px 24px', background: '#FFF9F6', display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>
            <span>🏷️</span> 50% OFF up to ₹100 | Use WELCOME50
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>
            <span>🏷️</span> Flat ₹100 OFF on orders &gt; ₹399 | Use FLAT100
          </div>
        </div>
      </div>

      {/* ─── 2. Search & Veg Toggle ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Menu Search Input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            type="text"
            className="input"
            placeholder={`Search menu in ${restaurant.name}...`}
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            style={{ paddingLeft: 40, height: 44, borderRadius: 22, background: '#fff' }}
          />
        </div>

        {/* Veg Only Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, background: '#fff', padding: '10px 18px', borderRadius: 22, border: '1.5px solid var(--border)' }}>
          <input
            type="checkbox"
            checked={isVegOnly}
            onChange={e => setIsVegOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#00B894' }}
          />
          <span>Veg Only 🥬</span>
        </label>
      </div>

      {/* ─── 3. Menu Categories & Dishes ─── */}
      {categories.length > 0 ? (
        categories.map((cat: any) => {
          const filteredItems = (cat.items || cat.menuItems || []).filter((it: any) => {
            if (isVegOnly && it.foodType !== 'VEG') return false;
            if (menuSearch && !it.name.toLowerCase().includes(menuSearch.toLowerCase()) && !it.description?.toLowerCase().includes(menuSearch.toLowerCase())) {
              return false;
            }
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.id} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{cat.name}</h2>
                <span className="badge badge-neutral" style={{ fontSize: 11 }}>{filteredItems.length}</span>
              </div>
              {cat.description && <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 12 }}>{cat.description}</p>}

              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {filteredItems.map((dish: any) => {
                  const qty = getItemQuantity(dish.id);
                  const hasAddons = (dish.addons || []).length > 0;

                  return (
                    <div key={dish.id} className="dish-card">
                      <div className="dish-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`food-badge ${dish.foodType === 'VEG' ? 'veg' : 'nonveg'}`} style={{ fontSize: 9 }}>
                            {dish.foodType === 'VEG' ? '● Veg' : '▲ Non-Veg'}
                          </span>
                          {hasAddons && (
                            <span style={{ fontSize: 10, color: '#FF6B35', fontWeight: 800 }}>• Customizable</span>
                          )}
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
                          {qty > 0 && !hasAddons ? (
                            <div className="dish-counter">
                              <button className="dish-counter-btn" onClick={() => updateQuantity(dish.id, -1)}>−</button>
                              <span>{qty}</span>
                              <button className="dish-counter-btn" onClick={() => updateQuantity(dish.id, 1)}>+</button>
                            </div>
                          ) : (
                            <button
                              className="dish-add-btn"
                              onClick={() => handleOpenCustomization(dish)}
                            >
                              + ADD {hasAddons && <span style={{ fontSize: 10 }}>+</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-title">No menu items listed</div>
        </div>
      )}

      {/* ─── 4. Customization Dialog Modal ─── */}
      {customizingItem && (
        <div className="modal-backdrop" onClick={() => setCustomizingItem(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900 }}>Customize &quot;{customizingItem.name}&quot;</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>Base price: ₹{customizingItem.price}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Addons selection */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                Select Add-ons (Optional)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(customizingItem.addons || []).map((addon: any) => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
                        } else {
                          setSelectedAddons([...selectedAddons, addon]);
                        }
                      }}
                      style={{
                        padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--border)',
                        cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : '#fff',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {isSelected ? '☑' : '☐'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{addon.name}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>+ ₹{addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                Cooking Instructions (Optional)
              </div>
              <input
                type="text"
                className="input"
                placeholder="e.g. Less spicy, extra napkins, no onions..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              />
            </div>

            {/* Confirm Button */}
            <button
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
              onClick={handleConfirmCustomization}
            >
              Add Item to Cart • ₹{customizingItem.price + selectedAddons.reduce((s, a) => s + a.price, 0)}
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. Floating Bottom Cart Bar ─── */}
      {itemCount > 0 && (
        <div className="floating-cart-bar" onClick={() => setIsCartDrawerOpen(true)}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} ADDED</span>
            <div style={{ fontSize: 12, opacity: 0.9 }}>From {restaurant.name}</div>
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
