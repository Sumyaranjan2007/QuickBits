import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { restaurantsApi } from '@quickbite/api-client';
import { useCart } from '../../contexts/CartContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  foodType: string;
  imageUrl: string | null;
  isAvailable: boolean;
  addons: { id: string; name: string; price: number }[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface RestaurantDetail {
  id: string;
  name: string;
  address: string;
  cuisineType: string[];
  rating: number;
  totalRatings: number;
  averageDeliveryTime: number;
  minimumOrder: number;
  openingHours: string;
  closingHours: string;
  categories: MenuCategory[];
}

interface Props {
  restaurantId: string;
  onBack: () => void;
  onGoToCart: () => void;
}

export default function RestaurantDetailScreen({ restaurantId, onBack, onGoToCart }: Props) {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { cart, addItem } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const res = await restaurantsApi.getById(restaurantId);
        setRestaurant(res.data as RestaurantDetail);
      } catch {
        Alert.alert('Error', 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const handleAddItem = async (item: MenuItem) => {
    try {
      await addItem({ restaurantId, menuItemId: item.id, quantity: 1 });
      Alert.alert('Added!', `${item.name} added to cart`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add item');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!restaurant) {
    return <View style={styles.center}><Text>Restaurant not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>🍽️</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>
            {Array.isArray(restaurant.cuisineType) ? restaurant.cuisineType.join(' • ') : restaurant.cuisineType}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>⭐ {(restaurant.rating || 0).toFixed(1)} ({restaurant.totalRatings})</Text>
            </View>
            <Text style={styles.metaItem}>🕐 {restaurant.averageDeliveryTime || 30} min</Text>
            <Text style={styles.metaItem}>₹{restaurant.minimumOrder} min</Text>
          </View>
          <Text style={styles.hours}>
            Open: {restaurant.openingHours} - {restaurant.closingHours}
          </Text>
        </View>

        {/* Menu */}
        {(restaurant.categories || []).map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {(category.items || []).map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.foodTypeIndicator, { backgroundColor: item.foodType === 'VEG' ? Colors.veg : Colors.nonVeg }]} />
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                    <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addButton, !item.isAvailable && styles.addButtonDisabled]}
                  onPress={() => handleAddItem(item)}
                  disabled={!item.isAvailable}
                >
                  <Text style={styles.addButtonText}>
                    {item.isAvailable ? 'ADD +' : 'N/A'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Cart Bar */}
      {cart && cart.itemCount > 0 && cart.restaurantId === restaurantId && (
        <TouchableOpacity style={styles.cartBar} onPress={onGoToCart} activeOpacity={0.9}>
          <Text style={styles.cartBarText}>
            {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} | ₹{cart.total}
          </Text>
          <Text style={styles.cartBarAction}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingTop: 48, paddingHorizontal: Spacing.base,
  },
  backButton: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    alignSelf: 'flex-start', ...Shadows.md,
  },
  backText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  banner: {
    height: 200, backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  bannerEmoji: { fontSize: 64 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  infoSection: { backgroundColor: Colors.white, padding: Spacing.xl },
  name: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  cuisine: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  metaBadge: {
    backgroundColor: Colors.success, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  metaBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  metaItem: { fontSize: FontSize.sm, color: Colors.textSecondary },
  hours: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },
  categorySection: { marginTop: Spacing.base },
  categoryTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: { flexDirection: 'row', flex: 1, marginRight: Spacing.base },
  foodTypeIndicator: { width: 12, height: 12, borderRadius: 2, marginTop: 4, marginRight: Spacing.sm },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  menuItemDesc: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  menuItemPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  addButton: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs,
  },
  addButtonDisabled: { borderColor: Colors.textMuted, opacity: 0.5 },
  addButtonText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.primary, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    ...Shadows.lg,
  },
  cartBarText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
  cartBarAction: { fontSize: FontSize.base, fontWeight: '700', color: Colors.white },
});
