import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, StatusBar,
} from 'react-native';
import { restaurantsApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

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

interface Props {
  onNavigateRestaurant?: (id: string) => void;
}

const POPULAR_SEARCHES = ['Biryani', 'Pizza', 'Burger', 'Chinese', 'Thali', 'North Indian', 'Rolls', 'Dosa'];

export default function SearchScreen({ onNavigateRestaurant }: Props) {
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRestaurants([]);
      setHasSearched(false);
      return;
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const res = await restaurantsApi.list({ search: query.trim() } as any);
      const data = res.data as any;
      setRestaurants(data.items || data || []);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { doSearch(search); }, 400);
    return () => clearTimeout(timer);
  }, [search, doSearch]);

  const handleQuickSearch = (term: string) => {
    setSearch(term);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <Text style={styles.headerSubtitle}>Find your favourite restaurants & food</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants, cuisines..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {!hasSearched ? (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <View style={styles.chipGrid}>
            {POPULAR_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.chip}
                onPress={() => handleQuickSearch(term)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Category Cards */}
          <Text style={[styles.popularTitle, { marginTop: Spacing.xl }]}>Browse by Category</Text>
          <View style={styles.categoryGrid}>
            {[
              { icon: '🍕', label: 'Pizza', color: '#FFF0E8' },
              { icon: '🍔', label: 'Burgers', color: '#FFF8E1' },
              { icon: '🍚', label: 'Biryani', color: '#FFF0F0' },
              { icon: '🥡', label: 'Chinese', color: '#F0FFF4' },
              { icon: '🍛', label: 'Indian', color: '#FFF5EB' },
              { icon: '🥗', label: 'Healthy', color: '#EAFAF1' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[styles.categoryCard, { backgroundColor: cat.color }]}
                onPress={() => handleQuickSearch(cat.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryCategoryEmoji}>{cat.icon}</Text>
                <Text style={styles.categoryCategoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => onNavigateRestaurant?.(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.resultImage}>
                <Text style={styles.resultEmoji}>🍽️</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.resultCuisine} numberOfLines={1}>
                  {Array.isArray(item.cuisineType) ? item.cuisineType.join(' • ') : item.cuisineType || 'Multi-Cuisine'}
                </Text>
                <View style={styles.resultMeta}>
                  <View style={styles.resultRating}>
                    <Text style={styles.resultRatingText}>★ {(item.rating || 0).toFixed(1)}</Text>
                  </View>
                  <Text style={styles.resultMetaText}>{item.averageDeliveryTime || 30} min</Text>
                  <Text style={styles.resultMetaDot}>•</Text>
                  <Text style={styles.resultMetaText}>₹{item.minimumOrder || 0} min</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxxl, paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cream, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.cardBorder,
  },
  searchIcon: { fontSize: 18, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, paddingVertical: Spacing.xs },
  clearBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center',
  },
  clearBtnText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  // Popular
  popularSection: { padding: Spacing.lg },
  popularTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
  },
  categoryCard: {
    width: '31%', borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center',
    ...Shadows.sm,
  },
  categoryCategoryEmoji: { fontSize: 32, marginBottom: Spacing.xs },
  categoryCategoryLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Results
  resultsList: { padding: Spacing.lg, gap: Spacing.sm },
  resultCard: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  resultImage: {
    width: 90, height: 90, backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center',
  },
  resultEmoji: { fontSize: 30 },
  resultInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  resultName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  resultCuisine: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: Spacing.xs },
  resultRating: {
    backgroundColor: Colors.success, borderRadius: BorderRadius.xs,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  resultRatingText: { fontSize: 9, fontWeight: '700', color: Colors.white },
  resultMetaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  resultMetaDot: { color: Colors.textMuted, fontSize: FontSize.xs },

  // Empty
  emptyContainer: { paddingTop: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
});
