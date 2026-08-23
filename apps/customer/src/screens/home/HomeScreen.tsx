import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import { restaurantsApi } from '@quickbite/api-client';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

const CUISINES = ['All', '🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🥘 Indian', '🍜 Chinese', '🥗 Salads', '🌮 Mexican'];

interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisineType: string[];
  rating: number;
  totalRatings: number;
  averageDeliveryTime: number;
  minimumOrder: number;
  imageUrl: string | null;
  isActive: boolean;
}

interface HomeScreenProps {
  onNavigateRestaurant: (id: string) => void;
}

export default function HomeScreen({ onNavigateRestaurant }: HomeScreenProps) {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const fetchRestaurants = useCallback(async () => {
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine.replace(/^[^ ]+ /, '');
      const res = await restaurantsApi.list(params as any);
      const data = res.data as any;
      setRestaurants(data.items || data || []);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCuisine]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const onRefresh = () => { setRefreshing(true); fetchRestaurants(); };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onNavigateRestaurant(item.id)}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardImageEmoji}>🍽️</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {(item.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cardCuisine} numberOfLines={1}>
          {Array.isArray(item.cuisineType) ? item.cuisineType.join(' • ') : item.cuisineType || 'Multi-Cuisine'}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>🕐 {item.averageDeliveryTime || 30} min</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>₹{item.minimumOrder || 0} min order</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.profile?.firstName || 'Foodie'} 👋
          </Text>
          <Text style={styles.headerSubtitle}>What would you like to eat?</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cuisines..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Cuisine Chips */}
      <FlatList
        horizontal
        data={CUISINES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cuisineChip, selectedCuisine === item && styles.cuisineChipActive]}
            onPress={() => setSelectedCuisine(item)}
          >
            <Text style={[styles.cuisineChipText, selectedCuisine === item && styles.cuisineChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Restaurants List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>Try a different search or cuisine</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
  searchContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.base, backgroundColor: Colors.white },
  searchInput: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  cuisineList: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: Spacing.sm },
  cuisineChip: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
  },
  cuisineChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cuisineChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  cuisineChipTextActive: { color: Colors.white },
  list: { padding: Spacing.xl, gap: Spacing.base },
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    overflow: 'hidden', ...Shadows.md,
  },
  cardImage: {
    height: 140, backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  cardImageEmoji: { fontSize: 48 },
  cardBody: { padding: Spacing.base },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  ratingBadge: {
    backgroundColor: Colors.success, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  ratingText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  cardCuisine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  metaDot: { marginHorizontal: Spacing.xs, color: Colors.textMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
});
