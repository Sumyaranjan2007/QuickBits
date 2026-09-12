import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { ordersApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  PENDING: { label: 'Order Placed', emoji: '📝', color: Colors.warning },
  CONFIRMED: { label: 'Confirmed', emoji: '✅', color: Colors.info },
  PREPARING: { label: 'Being Prepared', emoji: '👨‍🍳', color: Colors.primary },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', emoji: '📦', color: Colors.info },
  ASSIGNED: { label: 'Driver Assigned', emoji: '🛵', color: Colors.info },
  PICKED_UP: { label: 'Picked Up', emoji: '🏃', color: Colors.primaryLight },
  OUT_FOR_DELIVERY: { label: 'On the Way', emoji: '🚀', color: Colors.accentDark },
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

  if (loading) return (
    <View style={styles.center}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
  if (!order) return (
    <View style={styles.center}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Text style={styles.notFoundText}>Order not found</Text>
      <TouchableOpacity style={styles.backBtnEmpty} onPress={onBack}>
        <Text style={styles.backBtnEmptyText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const currentStatus = order.status as string;
  const statusInfo = STATUS_MAP[currentStatus] || { label: currentStatus, emoji: '📋', color: Colors.textSecondary };
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status Hero */}
        <View style={styles.statusHero}>
          <View style={[styles.statusIconCircle, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
          </View>
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
                  <View style={[
                    styles.dot,
                    isActive && styles.dotActive,
                    isCurrent && styles.dotCurrent,
                  ]} />
                  {i < STATUS_ORDER.length - 1 && (
                    <View style={[styles.line, isActive && styles.lineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    isActive && styles.timelineLabelActive,
                    isCurrent && styles.timelineLabelCurrent,
                  ]}>
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
              <View style={styles.orderItemQtyBadge}>
                <Text style={styles.orderItemQty}>{item.quantity}×</Text>
              </View>
              <Text style={styles.orderItemName}>{item.menuItemName}</Text>
              <Text style={styles.orderItemPrice}>₹{item.itemTotal}</Text>
            </View>
          ))}
          <View style={[styles.orderItem, styles.totalRow]}>
            <View style={{ width: 28 }} />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary, marginBottom: Spacing.base },
  backBtnEmpty: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  backBtnEmptyText: { color: Colors.white, fontWeight: '700' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.cream, justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: FontSize.xl, color: Colors.textPrimary, fontWeight: '600' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: Spacing.lg },

  // Status Hero
  statusHero: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xxl, alignItems: 'center',
    marginBottom: Spacing.lg, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  statusIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  statusEmoji: { fontSize: 36 },
  statusLabel: { fontSize: FontSize.xl, fontWeight: '800' },
  orderId: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xs },

  // Timeline
  timeline: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.lg,
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
  },
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
  timelineLabelCurrent: { color: Colors.primary, fontWeight: '700' },

  // Section
  section: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  orderItemQtyBadge: {
    width: 28, height: 22, borderRadius: BorderRadius.xs,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.sm,
  },
  orderItemQty: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  orderItemName: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  orderItemPrice: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1.5, borderTopColor: Colors.border,
    marginTop: Spacing.sm, paddingTop: Spacing.md,
  },
  totalLabel: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
});
