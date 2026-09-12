import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, ScrollView,
  StatusBar, Dimensions, Image,
} from 'react-native';
import { restaurantsApi } from '@quickbite/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'Biryani', label: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80' },
  { key: 'Pizza', label: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
  { key: 'Burgers', label: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
  { key: 'Chinese', label: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&q=80' },
  { key: 'Thalis', label: 'Thalis', image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&q=80' },
  { key: 'More', label: 'More', isMore: true },
];

const DEFAULT_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'The Biryani House',
    cuisine: 'Biryani, North Indian',
    rating: 4.6,
    time: 20,
    price: '₹200 for one',
    discount: '10% OFF',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  },
  {
    id: 'rest-2',
    name: 'Pizza Corner',
    cuisine: 'Pizza, Fast Food',
    rating: 4.4,
    time: 25,
    price: '₹150 for one',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },
  {
    id: 'rest-3',
    name: 'Burger Bistro',
    cuisine: 'Burgers, American',
    rating: 4.5,
    time: 18,
    price: '₹180 for one',
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
  },
];

interface HomeScreenProps {
  onNavigateRestaurant: (id: string) => void;
  onGoToCart?: () => void;
}

export default function HomeScreen({ onNavigateRestaurant, onGoToCart }: HomeScreenProps) {
  const { user } = useAuth();
  const { cart } = useCart();
  const [restaurants, setRestaurants] = useState<any[]>(DEFAULT_RESTAURANTS);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('Biryani');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await restaurantsApi.list({} as any);
      const data = res.data as any;
      const items = data.items || data;
      if (Array.isArray(items) && items.length > 0) {
        setRestaurants(items.map((item, idx) => ({
          id: item.id,
          name: item.name,
          cuisine: Array.isArray(item.cuisineType) ? item.cuisineType.join(', ') : (item.cuisineType || 'Multi-Cuisine'),
          rating: item.rating || 4.5,
          time: item.averageDeliveryTime || (20 + idx * 5),
          price: `₹${item.minimumOrder || 150} for one`,
          discount: `${10 + idx * 5}% OFF`,
          image: DEFAULT_RESTAURANTS[idx % DEFAULT_RESTAURANTS.length].image,
        })));
      }
    } catch {
      // maintain default reference data
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const CARD_WIDTH = SCREEN_WIDTH * 0.72;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A0A10']} tintColor="#4A0A10" />}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* === LOCATION HEADER === */}
        <View style={styles.locationHeader}>
          <View style={styles.locationLeft}>
            <Text style={styles.pinIcon}>📍</Text>
            <View>
              <View style={styles.addressRow}>
                <Text style={styles.addressTitle}>Koramangala, Bengaluru</Text>
                <Text style={styles.arrowDown}>⌵</Text>
              </View>
              <Text style={styles.addressSubtitle}>Delivering to you</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* === HERO CRAVING TITLE === */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLine1}>WHAT'S YOUR</Text>
          <Text style={styles.heroLine2}>CRAVING?</Text>
          <Text style={styles.heroLine3}>We've got it.</Text>
        </View>

        {/* === SEARCH BAR WITH FILTER BUTTON === */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for biryani, pizza, burgers..."
              placeholderTextColor="#9E9E9E"
              value={search}
              onChangeText={setSearch}
            />
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TouchableOpacity style={styles.filterSquareBtn} activeOpacity={0.85}>
            <Text style={styles.filterSlidersIcon}>🎛️</Text>
          </TouchableOpacity>
        </View>

        {/* === CATEGORY CIRCLES === */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCuisine === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryItem}
                onPress={() => setSelectedCuisine(cat.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryCircle, isSelected && styles.categoryCircleActive]}>
                  {cat.isMore ? (
                    <View style={styles.moreDotsContainer}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  ) : (
                    <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                  )}
                </View>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* === HOT DEALS BANNER === */}
        <TouchableOpacity
          style={styles.hotDealsBanner}
          activeOpacity={0.92}
          onPress={() => onNavigateRestaurant(restaurants[0]?.id || 'rest-1')}
        >
          <View style={styles.dealsContent}>
            <Text style={styles.dealsTag}>HOT DEALS 🔥</Text>
            <Text style={styles.dealsUpTo}>UP TO</Text>
            <Text style={styles.dealsDiscount}>50% OFF</Text>
            <Text style={styles.dealsSub}>On top restaurants</Text>
            <View style={styles.orderNowPill}>
              <Text style={styles.orderNowText}>ORDER NOW →</Text>
            </View>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' }}
            style={styles.dealsPizzaImage}
          />
        </TouchableOpacity>

        {/* === POPULAR RESTAURANTS === */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantsScroll}
        >
          {restaurants.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.restaurantCard, { width: CARD_WIDTH }]}
              activeOpacity={0.88}
              onPress={() => onNavigateRestaurant(item.id)}
            >
              {/* Image Container */}
              <View style={styles.cardImgWrapper}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                {/* 20 MIN badge */}
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeNumber}>{item.time}</Text>
                  <Text style={styles.timeBadgeLabel}>MIN</Text>
                </View>
                {/* Heart Button */}
                <TouchableOpacity
                  style={styles.cardHeartBtn}
                  onPress={() => toggleFavorite(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardHeartIcon}>
                    {favorites.has(item.id) ? '❤️' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.maroonRatingPill}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.cardCuisine} numberOfLines={1}>{item.cuisine}</Text>
                <View style={styles.cardBottomRow}>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                  <View style={styles.yellowOfferTag}>
                    <Text style={styles.yellowOfferText}>{item.discount}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* === MARKETING PROMO BANNERS ROW === */}
        <View style={styles.marketingSection}>
          {/* Banner 1: Flat 50% Off */}
          <View style={styles.smallPromoCard}>
            <View style={styles.smallPromoContent}>
              <Text style={styles.smallPromoOfferTag}>FIRST ORDER OFFER</Text>
              <Text style={styles.smallPromoDiscount}>FLAT{'\n'}50% OFF</Text>
              <Text style={styles.smallPromoSub}>On your first order</Text>
              <View style={styles.smallCodePill}>
                <Text style={styles.smallCodeText}>Code: QUICK50</Text>
              </View>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' }}
              style={styles.smallPromoImg}
            />
          </View>

          {/* Banner 2: Free Delivery */}
          <View style={[styles.smallPromoCard, { backgroundColor: '#FDF7E7', borderColor: '#F5D7A0' }]}>
            <View style={styles.smallPromoContent}>
              <Text style={[styles.smallPromoDiscount, { color: '#B36B00', fontSize: 18, lineHeight: 22 }]}>
                FREE DELIVERY
              </Text>
              <Text style={[styles.smallPromoSub, { color: '#6B5838' }]}>On orders above ₹199</Text>
              <View style={[styles.smallCodePill, { backgroundColor: '#F5A623' }]}>
                <Text style={[styles.smallCodeText, { color: '#4A0A10' }]}>Code: FREEDL</Text>
              </View>
            </View>
            <Text style={styles.scooterEmoji}>🛵💨</Text>
          </View>

          {/* Banner 3: Flat 100 Off */}
          <View style={styles.smallPromoCard}>
            <View style={styles.smallPromoContent}>
              <Text style={[styles.smallPromoDiscount, { color: '#F5A623', fontSize: 18, lineHeight: 22 }]}>
                FLAT ₹100 OFF
              </Text>
              <Text style={styles.smallPromoSub}>On orders above ₹299</Text>
              <View style={styles.smallCodePill}>
                <Text style={styles.smallCodeText}>Code: TRY100</Text>
              </View>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80' }}
              style={styles.smallPromoImg}
            />
          </View>
        </View>

        {/* === QUICKBITS BRAND TRUST FOOTER === */}
        <View style={styles.brandFooter}>
          <View style={styles.brandLogoRow}>
            <Text style={styles.brandLogoSpeed}>⚡</Text>
            <Text style={styles.brandLogoName}>Quickbits</Text>
          </View>
          <Text style={styles.brandTagline}>Bites that reach you quick!</Text>

          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadgeItem}>
              <Text style={styles.trustIcon}>🛡️</Text>
              <Text style={styles.trustLabel}>100% Safe{'\n'}Payments</Text>
            </View>
            <View style={styles.trustBadgeItem}>
              <Text style={styles.trustIcon}>🥡</Text>
              <Text style={styles.trustLabel}>Hygienic{'\n'}Packaging</Text>
            </View>
            <View style={styles.trustBadgeItem}>
              <Text style={styles.trustIcon}>📦</Text>
              <Text style={styles.trustLabel}>No Minimum{'\n'}Order</Text>
            </View>
            <View style={styles.trustBadgeItem}>
              <Text style={styles.trustIcon}>🔄</Text>
              <Text style={styles.trustLabel}>Easy{'\n'}Returns</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* === FLOATING CART BAR === */}
      {cart && cart.itemCount > 0 && onGoToCart && (
        <TouchableOpacity style={styles.floatingCart} onPress={onGoToCart} activeOpacity={0.92}>
          <View style={styles.floatingCartLeft}>
            <Text style={styles.floatingCartIcon}>🛒</Text>
            <Text style={styles.floatingCartText}>
              {cart.itemCount} Item{cart.itemCount > 1 ? 's' : ''} • ₹{cart.total}
            </Text>
          </View>
          <Text style={styles.floatingCartAction}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scrollView: { flex: 1 },

  // Location Header
  locationHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 46, paddingBottom: Spacing.sm,
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pinIcon: { fontSize: 22, color: '#D44040' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  arrowDown: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  addressSubtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  notificationBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EADBCE',
    ...Shadows.sm, position: 'relative',
  },
  bellIcon: { fontSize: 18 },
  badgeCount: {
    position: 'absolute', top: 3, right: 3,
    backgroundColor: '#D44040', borderRadius: 8,
    width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: Colors.white },

  // Hero Section
  heroSection: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  heroLine1: {
    fontSize: 28, fontWeight: '900', color: '#1A1A1A',
    letterSpacing: 0.5, lineHeight: 32,
  },
  heroLine2: {
    fontSize: 38, fontWeight: '900', color: '#4A0A10',
    letterSpacing: 0.8, lineHeight: 42,
  },
  heroLine3: {
    fontSize: 16, fontWeight: '700', fontStyle: 'italic',
    color: '#D4900E', marginTop: 2,
  },

  // Search & Filter
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, marginVertical: Spacing.base,
  },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#EADBCE', ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  searchIcon: { fontSize: 16, marginLeft: Spacing.xs },
  filterSquareBtn: {
    width: 46, height: 46, borderRadius: BorderRadius.sm,
    backgroundColor: '#4A0A10', justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  filterSlidersIcon: { fontSize: 18 },

  // Categories
  categoriesContainer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, gap: Spacing.base,
  },
  categoryItem: { alignItems: 'center', width: 56 },
  categoryCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: '#EADBCE',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    ...Shadows.sm,
  },
  categoryCircleActive: {
    borderColor: '#4A0A10', borderWidth: 2,
  },
  categoryImage: { width: '100%', height: '100%' },
  moreDotsContainer: {
    width: 24, height: 24, flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', alignContent: 'space-between',
  },
  dot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#4A0A10' },
  categoryLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textSecondary,
    marginTop: 6, textAlign: 'center',
  },
  categoryLabelActive: { color: '#4A0A10', fontWeight: '800' },

  // Hot Deals Banner
  hotDealsBanner: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.base, marginBottom: Spacing.base,
    backgroundColor: '#4A0A10', borderRadius: 20,
    flexDirection: 'row', overflow: 'hidden',
    paddingLeft: Spacing.lg, paddingVertical: Spacing.lg,
    alignItems: 'center', ...Shadows.lg,
  },
  dealsContent: { flex: 1 },
  dealsTag: { fontSize: 11, fontWeight: '800', color: '#FFD470', letterSpacing: 0.8 },
  dealsUpTo: { fontSize: 12, fontWeight: '800', color: Colors.white, marginTop: 4 },
  dealsDiscount: { fontSize: 32, fontWeight: '900', color: '#F5A623', lineHeight: 34 },
  dealsSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  orderNowPill: {
    backgroundColor: '#F5A623', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.base, paddingVertical: 7,
    alignSelf: 'flex-start', marginTop: Spacing.md,
    ...Shadows.gold,
  },
  orderNowText: { fontSize: 11, fontWeight: '900', color: '#4A0A10' },
  dealsPizzaImage: {
    width: 140, height: 140, borderRadius: 70,
    marginRight: -20,
  },

  // Popular Restaurants Section
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  seeAllText: { fontSize: 13, fontWeight: '700', color: '#D44040' },

  restaurantsScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  restaurantCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: '#EADBCE',
    ...Shadows.md,
  },
  cardImgWrapper: { height: 130, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  timeBadge: {
    position: 'absolute', top: Spacing.sm, left: Spacing.sm,
    backgroundColor: '#F5A623', borderRadius: BorderRadius.xs,
    paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center',
    ...Shadows.sm,
  },
  timeBadgeNumber: { fontSize: 12, fontWeight: '900', color: '#4A0A10', lineHeight: 13 },
  timeBadgeLabel: { fontSize: 8, fontWeight: '800', color: '#4A0A10' },
  cardHeartBtn: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  cardHeartIcon: { fontSize: 14, color: '#4A0A10' },

  cardBody: { padding: Spacing.md },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, flex: 1, marginRight: 6 },
  maroonRatingPill: {
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.xs,
    paddingHorizontal: 6, paddingVertical: 2,
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  ratingStar: { fontSize: 9, color: Colors.white },
  ratingNumber: { fontSize: 10, fontWeight: '800', color: Colors.white },
  cardCuisine: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cardPrice: { fontSize: 11, color: Colors.textMuted },
  yellowOfferTag: {
    backgroundColor: '#FFF3D6', borderRadius: BorderRadius.xs,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  yellowOfferText: { fontSize: 9, fontWeight: '800', color: '#B36B00' },

  // Marketing Banners
  marketingSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, gap: Spacing.md },
  smallPromoCard: {
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: Spacing.lg, paddingVertical: Spacing.base, paddingRight: Spacing.sm,
    overflow: 'hidden', borderWidth: 1, borderColor: '#3A0008',
    ...Shadows.md,
  },
  smallPromoContent: { flex: 1 },
  smallPromoOfferTag: { fontSize: 10, fontWeight: '800', color: '#FFD470', letterSpacing: 0.8 },
  smallPromoDiscount: { fontSize: 22, fontWeight: '900', color: '#F5A623', lineHeight: 26, marginTop: 2 },
  smallPromoSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  smallCodePill: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm, paddingVertical: 3, alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  smallCodeText: { fontSize: 10, fontWeight: '800', color: '#FFD470' },
  smallPromoImg: { width: 90, height: 75, borderRadius: BorderRadius.md },
  scooterEmoji: { fontSize: 44, marginRight: Spacing.base },

  // Brand Footer
  brandFooter: {
    backgroundColor: '#4A0A10', marginHorizontal: Spacing.lg, marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center',
    ...Shadows.lg,
  },
  brandLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandLogoSpeed: { fontSize: 22, color: '#F5A623' },
  brandLogoName: { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: 0.8 },
  brandTagline: { fontSize: 12, color: '#FFD470', marginTop: 2, fontWeight: '600' },
  trustBadgesRow: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
    marginTop: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
  },
  trustBadgeItem: { alignItems: 'center', flex: 1 },
  trustIcon: { fontSize: 18 },
  trustLabel: { fontSize: 9, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4, lineHeight: 12 },

  // Floating Cart
  floatingCart: {
    position: 'absolute', bottom: 12, left: Spacing.lg, right: Spacing.lg,
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  floatingCartIcon: { fontSize: 20 },
  floatingCartText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  floatingCartAction: { fontSize: 14, fontWeight: '800', color: '#FFD470' },
});
