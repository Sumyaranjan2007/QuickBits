'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, fetchRestaurantMenuFromSupabase, requestMenuItemPriceChange } from '../../../lib/supabase';

interface AddonOption {
  id: string;
  name: string;
  price: number;
}

interface AddonGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: AddonOption[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  foodType: 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN';
  dietaryTags?: string[];
  spiceLevel?: number;
  prepTimeMinutes?: number;
  isAvailable: boolean;
  isBestseller?: boolean;
  categoryId: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface PriceChangeRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  menuItemId: string;
  menuItemName: string;
  currentPrice: number;
  requestedPrice: number;
  priceDiff?: number;
  priceDiffPercent?: number;
  reason: string;
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const DEMO_MENU: MenuCategory[] = [
  {
    id: 'cat-main',
    name: 'Main Course',
    items: [
      {
        id: 'item-1',
        name: 'Hyderabadi Chicken Dum Biryani',
        description: 'Fragrant basmati rice cooked with succulent chicken pieces, rich spices, and saffron.',
        price: 249,
        discountPrice: 229,
        foodType: 'NON_VEG',
        prepTimeMinutes: 20,
        isAvailable: true,
        isBestseller: true,
        spiceLevel: 2,
        categoryId: 'cat-main',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
      },
      {
        id: 'item-2',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes simmered in rich creamy tomato and cashew nut gravy.',
        price: 220,
        discountPrice: 199,
        foodType: 'VEG',
        prepTimeMinutes: 15,
        isAvailable: true,
        isBestseller: true,
        spiceLevel: 1,
        categoryId: 'cat-main',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
      },
    ],
  },
  {
    id: 'cat-starters',
    name: 'Starters',
    items: [
      {
        id: 'item-3',
        name: 'Crispy Peri Peri Fries',
        description: 'Golden potato fries tossed in zesty African peri peri spice blend.',
        price: 139,
        foodType: 'VEG',
        prepTimeMinutes: 10,
        isAvailable: true,
        spiceLevel: 2,
        categoryId: 'cat-starters',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300',
      },
      {
        id: 'item-4',
        name: 'Chicken Tikka Kebab',
        description: 'Tender boneless chicken marinated in yogurt and tandoori spices, char-grilled.',
        price: 260,
        foodType: 'NON_VEG',
        prepTimeMinutes: 18,
        isAvailable: false,
        spiceLevel: 3,
        categoryId: 'cat-starters',
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300',
      },
    ],
  },
  {
    id: 'cat-combos',
    name: 'Combos',
    items: [
      {
        id: 'item-5',
        name: 'Biryani Feast Combo for 2',
        description: '2 Chicken Dum Biryani + 2 Thums Up + 1 Gulab Jamun (2 pcs).',
        price: 549,
        discountPrice: 499,
        foodType: 'NON_VEG',
        prepTimeMinutes: 25,
        isAvailable: true,
        isBestseller: true,
        categoryId: 'cat-combos',
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300',
      },
    ],
  },
  {
    id: 'cat-bev',
    name: 'Beverages',
    items: [
      {
        id: 'item-6',
        name: 'Sweet Mango Lassi',
        description: 'Fresh chilled yogurt churned with Alphonso mango pulp and cardamom.',
        price: 89,
        foodType: 'VEG',
        prepTimeMinutes: 5,
        isAvailable: true,
        categoryId: 'cat-bev',
        imageUrl: 'https://images.unsplash.com/photo-1571006682832-ce0f5f73d328?w=300',
      },
      {
        id: 'item-7',
        name: 'Cold Diet Coke Can (300ml)',
        description: 'Chilled carbonated soft drink.',
        price: 50,
        foodType: 'VEGAN',
        prepTimeMinutes: 2,
        isAvailable: true,
        categoryId: 'cat-bev',
      },
    ],
  },
];

const INITIAL_ADDON_GROUPS: AddonGroup[] = [
  {
    id: 'ag-1',
    name: 'Choice of Extra Dips & Cheese',
    minSelect: 0,
    maxSelect: 3,
    isRequired: false,
    options: [
      { id: 'opt-1', name: 'Extra Melted Cheese', price: 40 },
      { id: 'opt-2', name: 'Peri Peri Dip', price: 25 },
      { id: 'opt-3', name: 'Garlic Mayo Sauce', price: 20 },
    ],
  },
  {
    id: 'ag-2',
    name: 'Add a Chilled Beverage',
    minSelect: 0,
    maxSelect: 1,
    isRequired: false,
    options: [
      { id: 'opt-4', name: 'Large Coke (500ml)', price: 60 },
      { id: 'opt-5', name: 'Fresh Lime Soda', price: 50 },
    ],
  },
];

const INITIAL_PRICE_REQUESTS: PriceChangeRequest[] = [
  {
    id: 'pr-101',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro',
    menuItemId: 'item-1',
    menuItemName: 'Hyderabadi Chicken Dum Biryani',
    currentPrice: 249,
    requestedPrice: 279,
    priceDiff: 30,
    priceDiffPercent: 12,
    reason: 'Raw chicken and basmati rice procurement costs increased by 15%',
    note: 'Supplier price revision for Q3',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'pr-100',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro',
    menuItemId: 'item-2',
    menuItemName: 'Paneer Butter Masala',
    currentPrice: 200,
    requestedPrice: 220,
    priceDiff: 20,
    priceDiffPercent: 10,
    reason: 'Dairy and butter market rate revision',
    status: 'APPROVED',
    approvedBy: 'Admin (admin@quickbite.com)',
    approvedAt: '2026-09-12 11:30 AM',
    createdAt: '2026-09-11 09:00 AM',
    updatedAt: '2026-09-12 11:30 AM',
  },
  {
    id: 'pr-99',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro',
    menuItemId: 'item-3',
    menuItemName: 'Crispy Peri Peri Fries',
    currentPrice: 120,
    requestedPrice: 160,
    priceDiff: 40,
    priceDiffPercent: 33,
    reason: 'Portion size increase',
    adminReason: 'Price increase exceeds 25% cap without verified portion resize approval.',
    status: 'REJECTED',
    createdAt: '2026-09-10 02:15 PM',
    updatedAt: '2026-09-10 04:30 PM',
  },
];

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<MenuCategory[]>(DEMO_MENU);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>(INITIAL_ADDON_GROUPS);
  const [priceRequests, setPriceRequests] = useState<PriceChangeRequest[]>(INITIAL_PRICE_REQUESTS);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'CATEGORIES' | 'ADDONS' | 'PRICE_REQUESTS'>('ITEMS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [editItemModal, setEditItemModal] = useState<Partial<MenuItem> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Price Request Modal
  const [priceRequestModal, setPriceRequestModal] = useState<{
    item: MenuItem;
    requestedPrice: number;
    reason: string;
    note: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadMenu = useCallback(async () => {
    // 1. First try loading from Supabase
    try {
      const { data: supaRests } = await supabase.from('restaurants').select('*').limit(1);
      if (supaRests && supaRests.length > 0) {
        const currentRest = supaRests[0];
        setRestaurant(currentRest);

        const { categories: supaCats, items: supaItems } = await fetchRestaurantMenuFromSupabase(currentRest.id);
        if (supaCats && supaCats.length > 0) {
          setCategories(
            supaCats.map((c: any) => ({
              id: c.id,
              name: c.name,
              items: (supaItems || [])
                .filter((it: any) => it.category_id === c.id)
                .map((it: any) => ({
                  id: it.id,
                  name: it.name,
                  description: it.description || '',
                  price: Number(it.price) || 199,
                  discountPrice: it.discount_price ? Number(it.discount_price) : undefined,
                  foodType: it.food_type || 'NON_VEG',
                  isAvailable: it.is_available !== false,
                  isBestseller: !!it.is_bestseller,
                  imageUrl: it.image_url,
                  categoryId: c.id,
                  prepTimeMinutes: 20,
                  spiceLevel: 1,
                })),
            }))
          );
        }

        // Fetch price requests from Supabase
        const { data: supaReqs } = await supabase
          .from('restaurant_price_change_requests')
          .select('*')
          .eq('restaurant_id', currentRest.id)
          .order('created_at', { ascending: false });

        if (supaReqs && supaReqs.length > 0) {
          setPriceRequests(
            supaReqs.map((pr: any) => ({
              id: pr.id,
              restaurantId: pr.restaurant_id,
              restaurantName: currentRest.name,
              menuItemId: pr.menu_item_id,
              menuItemName: pr.menu_item_id,
              currentPrice: Number(pr.old_price),
              requestedPrice: Number(pr.requested_price),
              priceDiff: Number(pr.requested_price) - Number(pr.old_price),
              priceDiffPercent: Math.round(((Number(pr.requested_price) - Number(pr.old_price)) / (Number(pr.old_price) || 1)) * 100),
              reason: pr.reason,
              status: pr.status,
              createdAt: pr.created_at,
              updatedAt: pr.created_at,
            }))
          );
        }

        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase restaurant menu error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Toggle Item Availability
  const handleToggleAvailability = async (item: MenuItem) => {
    const updatedStatus = !item.isAvailable;
    // Update in Supabase
    try {
      await supabase
        .from('menu_items')
        .update({ is_available: updatedStatus })
        .eq('id', item.id);
    } catch (e) {
      console.warn('Supabase toggle availability error:', e);
    }
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.map(it => (it.id === item.id ? { ...it, isAvailable: updatedStatus } : it)),
      }))
    );
    showToast(`"${item.name}" marked ${updatedStatus ? 'Available' : 'Out of Stock'}`);
  };

  // Save Item (Create or Update non-price fields)
  const handleSaveItem = async () => {
    if (!editItemModal?.name) {
      alert('Please fill in Item Name');
      return;
    }

    const categoryId = editItemModal.categoryId || categories[0]?.id || 'cat-main';

    if (isNewItem) {
      if (!editItemModal?.price) {
        alert('Please fill in initial Item Price');
        return;
      }
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name: editItemModal.name,
        description: editItemModal.description || '',
        price: Number(editItemModal.price),
        discountPrice: editItemModal.discountPrice ? Number(editItemModal.discountPrice) : undefined,
        prepTimeMinutes: editItemModal.prepTimeMinutes ? Number(editItemModal.prepTimeMinutes) : 15,
        foodType: editItemModal.foodType || 'VEG',
        spiceLevel: editItemModal.spiceLevel || 0,
        isAvailable: editItemModal.isAvailable !== false,
        imageUrl: editItemModal.imageUrl,
        categoryId,
      };

      setCategories(prev =>
        prev.map(cat => (cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat))
      );
      showToast(`Added "${newItem.name}" to menu!`);
    } else {
      // STRICT: Update non-price attributes only
      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          items: cat.items.map(it =>
            it.id === editItemModal.id
              ? ({
                  ...it,
                  name: editItemModal.name,
                  description: editItemModal.description,
                  discountPrice: editItemModal.discountPrice,
                  prepTimeMinutes: editItemModal.prepTimeMinutes,
                  foodType: editItemModal.foodType,
                  spiceLevel: editItemModal.spiceLevel,
                  imageUrl: editItemModal.imageUrl,
                  categoryId: editItemModal.categoryId,
                } as MenuItem)
              : it
          ),
        }))
      );
      showToast(`Updated "${editItemModal.name}" details! (Price remains admin-controlled)`);
    }

    setEditItemModal(null);
  };

  // Submit Price Change Request
  const handleSubmitPriceRequest = async () => {
    if (!priceRequestModal) return;
    const { item, requestedPrice, reason, note } = priceRequestModal;

    if (!requestedPrice || requestedPrice <= 0) {
      alert('Please enter a valid new price.');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason for the price change.');
      return;
    }

    // Check if duplicate pending request
    const hasPending = priceRequests.some(
      r => r.menuItemId === item.id && r.status === 'PENDING'
    );
    if (hasPending) {
      alert('A price change request is already pending approval for this item.');
      return;
    }

    const priceDiff = requestedPrice - item.price;
    const priceDiffPercent = Math.round((priceDiff / item.price) * 100);

    const newReq: PriceChangeRequest = {
      id: `pr-${Date.now()}`,
      restaurantId: restaurant?.id || 'rest-1',
      restaurantName: restaurant?.name || 'QuickBite Bistro',
      menuItemId: item.id,
      menuItemName: item.name,
      currentPrice: item.price,
      requestedPrice,
      priceDiff,
      priceDiffPercent,
      reason: reason.trim(),
      note: note.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (restaurant?.id) {
      try {
        await requestMenuItemPriceChange({
          restaurantId: restaurant.id,
          menuItemId: item.id,
          oldPrice: item.price,
          requestedPrice,
          reason: reason.trim(),
        });
      } catch (e) {
        console.warn('Supabase price request insert error:', e);
      }
    }

    setPriceRequests(prev => [newReq, ...prev]);
    setPriceRequestModal(null);
    setEditItemModal(null);
    showToast('REQUEST SENT TO SUPABASE! Status: PENDING ADMIN APPROVAL');
  };

  // Add Category Handler
  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      items: [],
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setAddCategoryModal(false);
    showToast(`Category "${newCat.name}" created!`);
  };

  // Filter items
  const allItems = categories.flatMap(c => c.items);
  const filteredItems = allItems.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getPendingRequestForItem = (itemId: string) => {
    return priceRequests.find(r => r.menuItemId === itemId && r.status === 'PENDING');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#4A0A10',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(74, 10, 16, 0.25)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 100,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Action Buttons ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            🍔 Menu Management
          </h1>
          <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
            Configure dishes, categories, dietary details, and request price changes
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setAddCategoryModal(true)}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: '#FFFFFF',
              border: '1px solid #EAE0D0',
              color: '#171717',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            + CATEGORY
          </button>
          <button
            onClick={() => {
              setIsNewItem(true);
              setEditItemModal({
                name: '',
                description: '',
                price: 199,
                foodType: 'VEG',
                prepTimeMinutes: 15,
                isAvailable: true,
                categoryId: categories[0]?.id || 'cat-main',
              });
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              background: '#FFB21A',
              border: 'none',
              color: '#171717',
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(255, 178, 26, 0.3)',
              minHeight: 44,
            }}
          >
            + ADD ITEM
          </button>
        </div>
      </div>

      {/* ─── Sub Navigation Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #EAE0D0', paddingBottom: 10, overflowX: 'auto' }}>
        {[
          { key: 'ITEMS', label: 'Menu Items' },
          { key: 'PRICE_REQUESTS', label: `Price Change Requests (${priceRequests.filter(r => r.status === 'PENDING').length} Pending)` },
          { key: 'CATEGORIES', label: 'Categories' },
          { key: 'ADDONS', label: 'Customizations & Add-ons' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === t.key ? '#4A0A10' : 'transparent',
              color: activeTab === t.key ? '#FFFFFF' : '#6F6F6F',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: MENU ITEMS ─── */}
      {activeTab === 'ITEMS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Price Governance Info Alert */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 10,
              background: '#FFF8EB',
              border: '1px solid #FDDCA5',
              fontSize: 12,
              color: '#9C6200',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span>
                <strong>Menu Price Control Policy:</strong> Live prices are verified and protected by Platform Administration. To update pricing, click <strong>Edit Item → Request Price Change</strong>.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('PRICE_REQUESTS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4A0A10',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textDecoration: 'underline',
              }}
            >
              View Requests History →
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              <button
                onClick={() => setSelectedCategory('ALL')}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: selectedCategory === 'ALL' ? '1px solid #4A0A10' : '1px solid #EAE0D0',
                  background: selectedCategory === 'ALL' ? '#4A0A10' : '#FFFFFF',
                  color: selectedCategory === 'ALL' ? '#FFFFFF' : '#171717',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                All ({allItems.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    border: selectedCategory === cat.id ? '1px solid #4A0A10' : '1px solid #EAE0D0',
                    background: selectedCategory === cat.id ? '#4A0A10' : '#FFFFFF',
                    color: selectedCategory === cat.id ? '#FFFFFF' : '#171717',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name} ({cat.items.length})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
              <input
                type="text"
                placeholder="Search dish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid #EAE0D0',
                  fontSize: 13,
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 9, fontSize: 13, color: '#999' }}>🔍</span>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
            {filteredItems.map(item => {
              const pendingReq = getPendingRequestForItem(item.id);

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #EAE0D0',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Food Image / Placeholder */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        background: '#FAF0EB',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        '🍲'
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            border: `1.5px solid ${item.foodType === 'NON_VEG' ? '#D64545' : '#20A464'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: item.foodType === 'NON_VEG' ? '#D64545' : '#20A464',
                            }}
                          />
                        </span>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#171717',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      <div style={{ fontSize: 12, color: '#6F6F6F', margin: '4px 0', lineHeight: 1.3 }}>
                        {item.description ? `${item.description.slice(0, 50)}...` : 'Delicious freshly prepared dish.'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10' }}>
                          ₹{item.price}
                        </span>
                        {item.discountPrice && (
                          <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#999' }}>
                            ₹{item.discountPrice}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#6F6F6F' }}>⏱️ {item.prepTimeMinutes || 15} min</span>
                      </div>

                      {/* Pending Price Request Badge */}
                      {pendingReq && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 6,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#FFF7E6',
                            border: '1px solid #FDDCA5',
                            fontSize: 10,
                            fontWeight: 800,
                            color: '#C77700',
                          }}
                        >
                          ⏳ Price change requested: ₹{pendingReq.requestedPrice} (Pending Admin Approval)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Availability Toggle & Edit Button */}
                  <div
                    style={{
                      borderTop: '1px solid #EAE0D0',
                      paddingTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* Availability Switch */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 10px',
                        borderRadius: 20,
                        border: item.isAvailable ? '1px solid #BBE9D1' : '1px solid #F9BABA',
                        background: item.isAvailable ? '#E8F8F0' : '#FFF5F5',
                        color: item.isAvailable ? '#20A464' : '#D64545',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{item.isAvailable ? '🟢 Available' : '🔴 Out of Stock'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setIsNewItem(false);
                        setEditItemModal(item);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid #EAE0D0',
                        background: '#FAF6EF',
                        color: '#4A0A10',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ EDIT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRICE CHANGE REQUESTS TRACKER ─── */}
      {activeTab === 'PRICE_REQUESTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
                Menu Price Change Requests
              </h3>
              <p style={{ fontSize: 13, color: '#6F6F6F', margin: '2px 0 0' }}>
                Track the approval status of your requested price adjustments
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {priceRequests.map(req => {
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: isPending ? '1.5px solid #FFD470' : '1px solid #EAE0D0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#171717' }}>
                        {req.menuItemName}
                      </div>
                      <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 2 }}>
                        Submitted on {new Date(req.createdAt).toLocaleDateString()} at{' '}
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: isPending ? '#FFF7E6' : isApproved ? '#E8F8F0' : '#FEECEC',
                        color: isPending ? '#C77700' : isApproved ? '#20A464' : '#D64545',
                      }}
                    >
                      {isPending
                        ? '🟡 PENDING ADMIN APPROVAL'
                        : isApproved
                        ? '🟢 APPROVED'
                        : '🔴 REJECTED'}
                    </span>
                  </div>

                  {/* Price Comparison */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FAF6EF', padding: '12px 16px', borderRadius: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>CURRENT LIVE PRICE</span>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>₹{req.currentPrice}</div>
                    </div>
                    <span style={{ fontSize: 20, color: '#4A0A10' }}>→</span>
                    <div>
                      <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>REQUESTED NEW PRICE</span>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>₹{req.requestedPrice}</div>
                    </div>
                    {req.priceDiff !== undefined && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: req.priceDiff > 0 ? '#FAF0EB' : '#E8F8F0',
                          color: req.priceDiff > 0 ? '#4A0A10' : '#20A464',
                        }}
                      >
                        {req.priceDiff > 0 ? `+₹${req.priceDiff}` : `-₹${Math.abs(req.priceDiff)}`} ({req.priceDiffPercent}%)
                      </span>
                    )}
                  </div>

                  {/* Restaurant Reason */}
                  <div>
                    <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>REASON FOR CHANGE:</span>
                    <div style={{ fontSize: 13, color: '#171717', marginTop: 2 }}>{req.reason}</div>
                    {req.note && (
                      <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 2, fontStyle: 'italic' }}>
                        Note: {req.note}
                      </div>
                    )}
                  </div>

                  {/* Status Outcome Details */}
                  {isApproved && (
                    <div style={{ background: '#E8F8F0', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#1F7A4D', fontWeight: 700 }}>
                      ✓ Request Approved by {req.approvedBy || 'Admin'}. Live menu price is now updated to ₹{req.requestedPrice}.
                    </div>
                  )}

                  {isRejected && (
                    <div style={{ background: '#FFF5F5', border: '1px solid #F9BABA', padding: '10px 14px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#D64545' }}>REQUEST REJECTED BY ADMIN</div>
                      <div style={{ fontSize: 13, color: '#7D1F1F', marginTop: 2 }}>
                        Reason: {req.adminReason || 'Does not meet margin revision guidelines.'}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                        Live price remains ₹{req.currentPrice}. You may submit a new request if needed.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: CATEGORIES ─── */}
      {activeTab === 'CATEGORIES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #EAE0D0',
                  padding: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: '#6F6F6F' }}>{cat.items.length} items configured</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab('ITEMS');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#FAF0EB',
                    color: '#4A0A10',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  View Dishes →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ADD-ONS & CUSTOMIZATIONS ─── */}
      {activeTab === 'ADDONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {addonGroups.map(group => (
              <div
                key={group.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #EAE0D0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#171717' }}>{group.name}</div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: group.isRequired ? '#FFF7E6' : '#FAF6EF',
                      color: group.isRequired ? '#C77700' : '#6F6F6F',
                    }}
                  >
                    {group.isRequired ? 'REQUIRED' : 'OPTIONAL'} · Max {group.maxSelect}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {group.options.map(opt => (
                    <div
                      key={opt.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#FAF6EF',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <span>{opt.name}</span>
                      <span style={{ fontWeight: 800, color: '#4A0A10' }}>+₹{opt.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT MENU ITEM MODAL ─── */}
      {editItemModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setEditItemModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 540,
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                {isNewItem ? '➕ Add Menu Item' : '✏️ Edit Menu Item'}
              </h2>
              <button
                onClick={() => setEditItemModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Dum Biryani"
                  value={editItemModal.name || ''}
                  onChange={e => setEditItemModal(prev => ({ ...prev, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell customers what makes this dish special..."
                  value={editItemModal.description || ''}
                  onChange={e => setEditItemModal(prev => ({ ...prev, description: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Category & Food Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={editItemModal.categoryId || categories[0]?.id}
                    onChange={e => setEditItemModal(prev => ({ ...prev, categoryId: e.target.value }))}
                    style={inputStyle}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Food Type</label>
                  <select
                    value={editItemModal.foodType || 'VEG'}
                    onChange={e => setEditItemModal(prev => ({ ...prev, foodType: e.target.value as any }))}
                    style={inputStyle}
                  >
                    <option value="VEG">🟢 Vegetarian</option>
                    <option value="NON_VEG">🔴 Non-Vegetarian</option>
                    <option value="EGG">🟡 Contains Egg</option>
                    <option value="VEGAN">🌱 Vegan</option>
                  </select>
                </div>
              </div>

              {/* ─── STRICT PRICE GOVERNANCE SECTION ─── */}
              {isNewItem ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Initial Base Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="249"
                      value={editItemModal.price || ''}
                      onChange={e => setEditItemModal(prev => ({ ...prev, price: Number(e.target.value) }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Discount Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="229"
                      value={editItemModal.discountPrice || ''}
                      onChange={e =>
                        setEditItemModal(prev => ({
                          ...prev,
                          discountPrice: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              ) : (
                /* READ-ONLY LIVE PRICE FOR EXISTING ITEMS */
                <div
                  style={{
                    background: '#FAF6EF',
                    padding: '16px',
                    borderRadius: 12,
                    border: '1px solid #EAE0D0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#6F6F6F', textTransform: 'uppercase' }}>
                        LIVE MENU PRICE (ADMIN CONTROLLED)
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10' }}>
                          ₹{editItemModal.price}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#EAE0D0',
                            color: '#4A0A10',
                          }}
                        >
                          🔒 READ-ONLY
                        </span>
                      </div>
                    </div>

                    {/* Request Price Change Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetItem = allItems.find(i => i.id === editItemModal.id) || (editItemModal as MenuItem);
                        setPriceRequestModal({
                          item: targetItem,
                          requestedPrice: targetItem.price ? targetItem.price + 20 : 250,
                          reason: '',
                          note: '',
                        });
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: '#FFB21A',
                        border: 'none',
                        color: '#171717',
                        fontWeight: 900,
                        fontSize: 12,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(255, 178, 26, 0.3)',
                      }}
                    >
                      📝 REQUEST PRICE CHANGE
                    </button>
                  </div>

                  <div style={{ fontSize: 11, color: '#6F6F6F', lineHeight: 1.4 }}>
                    ⚠️ In accordance with QuickBite platform policy, restaurant owners cannot directly alter live prices. Price change requests are reviewed by platform administration.
                  </div>
                </div>
              )}

              {/* Prep Time & Spice Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Preparation Time (mins)</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={editItemModal.prepTimeMinutes || 15}
                    onChange={e =>
                      setEditItemModal(prev => ({ ...prev, prepTimeMinutes: Number(e.target.value) }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Spice Level</label>
                  <select
                    value={editItemModal.spiceLevel || 0}
                    onChange={e =>
                      setEditItemModal(prev => ({ ...prev, spiceLevel: Number(e.target.value) }))
                    }
                    style={inputStyle}
                  >
                    <option value={0}>Mild / No Spice</option>
                    <option value={1}>🌶️ Medium</option>
                    <option value={2}>🌶️🌶️ Spicy</option>
                    <option value={3}>🌶️🌶️🌶️ Extra Hot</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={labelStyle}>Food Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editItemModal.imageUrl || ''}
                  onChange={e => setEditItemModal(prev => ({ ...prev, imageUrl: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setEditItemModal(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #EAE0D0',
                    background: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveItem}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#4A0A10',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  SAVE DETAILS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRICE CHANGE REQUEST MODAL ─── */}
      {priceRequestModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setPriceRequestModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                  📝 Request Menu Price Change
                </h3>
                <div style={{ fontSize: 13, color: '#6F6F6F', marginTop: 2 }}>
                  {priceRequestModal.item.name}
                </div>
              </div>
              <button
                onClick={() => setPriceRequestModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Price Diff Snapshot */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FAF6EF',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #EAE0D0',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>CURRENT LIVE PRICE</span>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#171717' }}>
                    ₹{priceRequestModal.item.price}
                  </div>
                </div>
                <span style={{ fontSize: 20, color: '#4A0A10' }}>→</span>
                <div>
                  <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>REQUESTED PRICE</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10' }}>
                    ₹{priceRequestModal.requestedPrice}
                  </div>
                </div>
              </div>

              {/* Requested New Price Input */}
              <div>
                <label style={labelStyle}>Requested New Price (₹) *</label>
                <input
                  type="number"
                  value={priceRequestModal.requestedPrice || ''}
                  onChange={e =>
                    setPriceRequestModal({
                      ...priceRequestModal,
                      requestedPrice: Number(e.target.value),
                    })
                  }
                  style={inputStyle}
                />
              </div>

              {/* Reason */}
              <div>
                <label style={labelStyle}>Reason for Price Change *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Raw ingredient cost increase, menu revamp, seasonal ingredient inflation..."
                  value={priceRequestModal.reason}
                  onChange={e =>
                    setPriceRequestModal({
                      ...priceRequestModal,
                      reason: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Optional Supporting Note */}
              <div>
                <label style={labelStyle}>Supporting Note / Invoice Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier invoice reference #INV-2026-Q3"
                  value={priceRequestModal.note}
                  onChange={e =>
                    setPriceRequestModal({
                      ...priceRequestModal,
                      note: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>

              <div style={{ background: '#FFF8EB', padding: '10px 12px', borderRadius: 8, fontSize: 11, color: '#9C6200' }}>
                ℹ️ Once submitted, your request will be reviewed by the QuickBite Admin team. The new price will become live for customers only upon Admin approval.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => setPriceRequestModal(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #EAE0D0',
                    background: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPriceRequest}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#4A0A10',
                    color: '#FFFFFF',
                    fontWeight: 800,
                  }}
                >
                  SUBMIT PRICE CHANGE REQUEST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD CATEGORY MODAL ─── */}
      {addCategoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setAddCategoryModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 400,
              width: '100%',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 12px' }}>
              Create New Category
            </h3>
            <input
              type="text"
              placeholder="e.g. Traditional Breads / Tandoori"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setAddCategoryModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #EAE0D0',
                  background: '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  fontWeight: 800,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: '#6F6F6F',
  marginBottom: 4,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #EAE0D0',
  fontSize: 14,
  background: '#FAF6EF',
  color: '#171717',
  boxSizing: 'border-box',
};
