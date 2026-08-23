import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { ordersApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface Props {
  onViewOrder: (orderId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: Colors.success,
  CANCELLED: Colors.error,
  PENDING: Colors.warning,
  CONFIRMED: Colors.info,
  PREPARING: Colors.primary,
  OUT_FOR_DELIVERY: Colors.primaryLight,
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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status] || Colors.textSecondary;
          return (
            <TouchableOpacity style={styles.card} onPress={() => onViewOrder(item.id)} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <Text style={styles.restaurantName}>{item.restaurant?.name || 'Restaurant'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.itemSummary}>
                {(item.items || []).map((i: any) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.totalText}>₹{item.total}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  header: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  list: { padding: Spacing.xl, gap: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.base, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restaurantName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  statusBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  itemSummary: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  totalText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  dateText: { fontSize: FontSize.xs, color: Colors.textMuted },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.base },
});
