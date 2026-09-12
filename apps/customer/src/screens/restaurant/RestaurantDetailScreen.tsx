import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, StatusBar, Alert,
} from 'react-native';
import { restaurantsApi } from '@quickbite/api-client';
import { useCart } from '../../contexts/CartContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Props {
  restaurantId: string;
  onBack: () => void;
  onGoToCart: () => void;
}

const DEFAULT_CATEGORIES: MenuCategory[] = [
  {
    id: 'cat-rec',
    name: 'Recommended',
    items: [
      {
        id: 'item-1',
        name: 'Hyderabadi Biryani',
        description: 'Aromatic basmati rice cooked with spices & served with raita',
        price: 199,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
        isAvailable: true,
      },
      {
        id: 'item-2',
        name: 'Chicken 65',
        description: 'Spicy & crispy chicken with curry leaves',
        price: 149,
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=300&q=80',
        isAvailable: true,
      },
      {
        id: 'item-3',
        name: 'Raita',
        description: 'Cooling yogurt with boondi and spices',
        price: 49,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80',
        isAvailable: true,
      },
    ],
  },
  {
    id: 'cat-biryani',
    name: "Biryani's",
    items: [
      {
        id: 'item-4',
        name: 'Dum Chicken Biryani',
        description: 'Slow-cooked marinated chicken in layers of saffron rice',
        price: 249,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
        isAvailable: true,
      },
      {
        id: 'item-5',
        name: 'Mutton Royal Biryani',
        description: 'Tender lamb chunks prepared in traditional Awadhi style',
        price: 349,
        imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&q=80',
        isAvailable: true,
      },
    ],
  },
  {
    id: 'cat-combos',
    name: 'Combos',
    items: [
      {
        id: 'item-6',
        name: 'Biryani Feast for 2',
        description: '2 Chicken Biryanis + 1 Chicken 65 + 2 Cokes + Raita',
        price: 499,
        imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80',
        isAvailable: true,
      },
    ],
  },
  {
    id: 'cat-more',
    name: 'More',
    items: [
      {
        id: 'item-7',
        name: 'Gulab Jamun (2 pcs)',
        description: 'Warm melt-in-mouth cottage cheese dumplings in rose syrup',
        price: 59,
        imageUrl: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=300&q=80',
        isAvailable: true,
      },
    ],
  },
];

const OFFERS = [
  { label: '10% OFF', sub: 'Use TRY10' },
  { label: 'Flat ₹125 OFF', sub: 'Above ₹299' },
  { label: 'Free Delivery', sub: 'Above ₹199' },
];

export default function RestaurantDetailScreen({ restaurantId, onBack, onGoToCart }: Props) {
  const [restaurantName, setRestaurantName] = useState('The Biryani House');
  const [rating, setRating] = useState(4.6);
  const [categories, setCategories] = useState<MenuCategory[]>(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [isFavorite, setIsFavorite] = useState(false);
  const { cart, addItem } = useCart();
  const [addedCount, setAddedCount] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await restaurantsApi.getById(restaurantId);
        const data = res.data as any;
        if (data) {
          if (data.name) setRestaurantName(data.name);
          if (data.rating) setRating(data.rating);
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
            setActiveTab(data.categories[0].name);
          }
        }
      } catch {
        // use default reference data
      }
    })();
  }, [restaurantId]);

  const handleAdd = async (item: MenuItem) => {
    try {
      setAddedCount(prev => prev + 1);
      await addItem({ restaurantId, menuItemId: item.id, quantity: 1 });
    } catch {
      // local optimistic update for demo
      setAddedCount(prev => prev + 1);
    }
  };

  const currentCategory = categories.find(c => c.name === activeTab) || categories[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=85' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />

        {/* Top Floating Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.iconCircle} activeOpacity={0.8}>
            <Text style={styles.topIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.topRight}>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.iconCircle} activeOpacity={0.8}>
              <Text style={styles.topIcon}>{isFavorite ? '❤️' : '♡'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8}>
              <Text style={styles.topIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 20-30 MIN badge on bottom right of image */}
        <View style={styles.timeTag}>
          <Text style={styles.timeTagText}>20–30 MIN</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Overlapping Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.restaurantTitle}>{restaurantName}</Text>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.cuisineText}>Biryani, North Indian, Mughlai</Text>
          <Text style={styles.deliveryText}>₹200 for one  •  Free delivery above ₹199</Text>

          {/* Coupon Offer Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersScroll} contentContainerStyle={styles.offersContainer}>
            {OFFERS.map((o, idx) => (
              <View key={idx} style={styles.offerPill}>
                <Text style={styles.offerPillTitle}>{o.label}</Text>
                <Text style={styles.offerPillSub}>{o.sub}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsList}>
            {categories.map((cat) => {
              const isActive = activeTab === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(cat.name)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {cat.name}
                  </Text>
                  {isActive && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          {currentCategory.items.map((item) => (
            <View key={item.id} style={styles.menuItemCard}>
              <Image
                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80' }}
                style={styles.dishImage}
              />
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.dishDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.dishPrice}>₹{item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.addPillBtn}
                onPress={() => handleAdd(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.addPillText}>ADD +</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={onGoToCart}
        activeOpacity={0.92}
      >
        <View style={styles.cartLeft}>
          <Text style={styles.cartEmoji}>🛒</Text>
          <Text style={styles.cartInfoText}>
            {cart && cart.itemCount > 0 ? `${cart.itemCount} Item • ₹${cart.total}` : `${addedCount} Item • ₹249`}
          </Text>
        </View>
        <Text style={styles.viewCartText}>View Cart →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  heroContainer: {
    height: 240, width: '100%', position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  topBar: {
    position: 'absolute', top: 44, left: Spacing.base, right: Spacing.base,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    zIndex: 10,
  },
  topRight: { flexDirection: 'row', gap: Spacing.sm },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  topIcon: { fontSize: 18, color: '#1A1A1A', fontWeight: '700' },
  timeTag: {
    position: 'absolute', bottom: 16, right: Spacing.base,
    backgroundColor: '#F5A623', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    ...Shadows.sm,
  },
  timeTagText: { fontSize: FontSize.xs, fontWeight: '900', color: '#4A0A10' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Info Card
  infoCard: {
    backgroundColor: Colors.white,
    marginTop: -16, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    ...Shadows.sm,
  },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  ratingPill: {
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  ratingText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.white },
  cuisineText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  deliveryText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },

  // Offers
  offersScroll: { marginTop: Spacing.md },
  offersContainer: { gap: Spacing.sm },
  offerPill: {
    backgroundColor: '#FFFDF9', borderRadius: BorderRadius.sm,
    borderWidth: 1, borderColor: '#F2E8DB',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    alignItems: 'center', minWidth: 96,
  },
  offerPillTitle: { fontSize: 11, fontWeight: '800', color: '#4A0A10' },
  offerPillSub: { fontSize: 9, color: Colors.textMuted, marginTop: 1 },

  // Tabs
  tabsContainer: {
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F0E6D8',
    marginTop: Spacing.sm,
  },
  tabsList: { paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  tabBtn: { paddingVertical: Spacing.md, position: 'relative' },
  tabBtnActive: {},
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#4A0A10', fontWeight: '800' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5,
    backgroundColor: '#4A0A10', borderRadius: 1.5,
  },

  // Menu list
  menuList: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md,
  },
  menuItemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: '#F0E6DA',
    gap: Spacing.md, ...Shadows.sm,
  },
  dishImage: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#FAF7F2',
  },
  dishInfo: { flex: 1 },
  dishName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  dishDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2, lineHeight: 15 },
  dishPrice: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  addPillBtn: {
    backgroundColor: '#F5A623', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    ...Shadows.gold,
  },
  addPillText: { fontSize: FontSize.xs, fontWeight: '900', color: '#4A0A10' },

  // Floating Cart
  floatingCart: {
    position: 'absolute', bottom: 16, left: Spacing.base, right: Spacing.base,
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cartEmoji: { fontSize: 18 },
  cartInfoText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.white },
  viewCartText: { fontSize: FontSize.sm, fontWeight: '800', color: '#FFD470' },
});
