import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ordersApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  PENDING: { label: 'Order Placed', emoji: '📝', color: Colors.warning },
  CONFIRMED: { label: 'Confirmed', emoji: '✅', color: Colors.info },
  PREPARING: { label: 'Being Prepared', emoji: '👨‍🍳', color: Colors.primary },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', emoji: '📦', color: Colors.info },
  ASSIGNED: { label: 'Driver Assigned', emoji: '🛵', color: Colors.info },
  PICKED_UP: { label: 'Picked Up', emoji: '🏃', color: Colors.primaryLight },
  OUT_FOR_DELIVERY: { label: 'On the Way', emoji: '🚀', color: Colors.primary },
  DELIVERED: { label: 'Delivered', emoji: '🎉', color: Colors.success },
  CANCELLED: { label: 'Cancelled', emoji: '❌', color: Colors.error },
};

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

interface Props {
  orderId: string;
  onBack: () => void;
}

export default function OrderTrackingScreen({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await ordersApi.getById(orderId);
      setOrder(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found</Text></View>;

  const currentStatus = order.status as string;
  const statusInfo = STATUS_MAP[currentStatus] || { label: currentStatus, emoji: '📋', color: Colors.textSecondary };
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Hero */}
        <View style={[styles.statusHero, { backgroundColor: statusInfo.color + '15' }]}>
          <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          <Text style={styles.orderId}>Order #{orderId.slice(0, 8)}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {STATUS_ORDER.map((status, i) => {
            const info = STATUS_MAP[status];
            const isActive = i <= currentIdx && !isCancelled;
            const isCurrent = status === currentStatus;
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, isActive && styles.dotActive, isCurrent && styles.dotCurrent]} />
                  {i < STATUS_ORDER.length - 1 && (
                    <View style={[styles.line, isActive && styles.lineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>
                    {info.emoji} {info.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {(order.items || []).map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderItemQty}>{item.quantity}×</Text>
              <Text style={styles.orderItemName}>{item.menuItemName}</Text>
              <Text style={styles.orderItemPrice}>₹{item.itemTotal}</Text>
            </View>
          ))}
          <View style={[styles.orderItem, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
  },
  backArrow: { fontSize: FontSize.xxl, color: Colors.textPrimary },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: Spacing.xl },
  statusHero: {
    borderRadius: BorderRadius.lg, padding: Spacing.xxl,
    alignItems: 'center', marginBottom: Spacing.xl,
  },
  statusEmoji: { fontSize: 48 },
  statusLabel: { fontSize: FontSize.xl, fontWeight: '800', marginTop: Spacing.sm },
  orderId: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  timeline: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.xl },
  timelineItem: { flexDirection: 'row', minHeight: 48 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: Spacing.base },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.border, marginTop: 4,
  },
  dotActive: { backgroundColor: Colors.success },
  dotCurrent: { backgroundColor: Colors.primary, width: 16, height: 16, borderRadius: 8, marginTop: 2 },
  line: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2 },
  lineActive: { backgroundColor: Colors.success },
  timelineContent: { flex: 1, paddingBottom: Spacing.base },
  timelineLabel: { fontSize: FontSize.md, color: Colors.textMuted },
  timelineLabelActive: { color: Colors.textPrimary, fontWeight: '600' },
  section: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  orderItemQty: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary, width: 30 },
  orderItemName: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  orderItemPrice: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
});
