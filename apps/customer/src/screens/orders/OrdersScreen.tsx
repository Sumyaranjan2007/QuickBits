import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import { ordersApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface Props {
  onViewOrder: (orderId: string) => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  DELIVERED: { color: Colors.success, bg: Colors.successBg, label: 'Delivered', icon: '✅' },
  CANCELLED: { color: Colors.error, bg: Colors.errorBg, label: 'Cancelled', icon: '❌' },
  PENDING: { color: Colors.warning, bg: Colors.warningBg, label: 'Pending', icon: '⏳' },
  CONFIRMED: { color: Colors.info, bg: Colors.infoBg, label: 'Confirmed', icon: '✔️' },
  PREPARING: { color: Colors.primary, bg: Colors.primaryBg, label: 'Preparing', icon: '👨‍🍳' },
  OUT_FOR_DELIVERY: { color: Colors.accentDark, bg: Colors.accentBg, label: 'On the Way', icon: '🚀' },
};

export default function OrdersScreen({ onViewOrder }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await ordersApi.getMyOrders({ limit: 50 });
      const data = res.data as any;
      setOrders(data.items || data || []);
    } catch { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <View style={styles.center}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your food journey</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your delicious orders will appear here</Text>
          </View>
        }
        renderItem={({ item }) => {
          const config = STATUS_CONFIG[item.status] || {
            color: Colors.textSecondary, bg: Colors.cream, label: item.status, icon: '📋'
          };
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onViewOrder(item.id)}
              activeOpacity={0.8}
            >
              {/* Top Row */}
              <View style={styles.cardTop}>
                <View style={styles.cardTopLeft}>
                  <View style={styles.restaurantIcon}>
                    <Text style={{ fontSize: 18 }}>🍽️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardRestaurant} numberOfLines={1}>
                      {item.restaurant?.name || 'Restaurant'}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {config.icon} {config.label}
                  </Text>
                </View>
              </View>

              {/* Items */}
              <Text style={styles.cardItems} numberOfLines={2}>
                {(item.items || []).map((i: any) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
              </Text>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.cardTotal}>₹{item.total}</Text>
                <TouchableOpacity style={styles.reorderBtn}>
                  <Text style={styles.reorderText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

  // Header
  header: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },

  // List
  list: { padding: Spacing.lg, gap: Spacing.md },

  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm, marginRight: Spacing.sm },
  restaurantIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  cardRestaurant: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  cardDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  statusBadge: {
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  cardItems: {
    fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  cardTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  reorderBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs,
  },
  reorderText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },

  // Empty
  emptyContainer: { paddingTop: 80, alignItems: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.base },
  emptyText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
});
