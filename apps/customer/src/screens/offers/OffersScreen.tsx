import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { couponsApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  isActive: boolean;
}

const PROMO_BANNERS = [
  {
    title: 'FIRST ORDER OFFER',
    discount: 'FLAT\n50% OFF',
    sub: 'On your first order',
    code: 'QUICK50',
    emoji: '🎉',
  },
  {
    title: 'FREE DELIVERY',
    discount: 'FREE\nDELIVERY',
    sub: 'On orders above ₹199',
    code: 'FREEDL',
    emoji: '🚀',
  },
  {
    title: 'FLAT DISCOUNT',
    discount: 'FLAT\n₹100 OFF',
    sub: 'On orders above ₹299',
    code: 'TRY100',
    emoji: '💰',
  },
];

export default function OffersScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await couponsApi.getActive();
      const data = res.data as any;
      setCoupons(data.items || data || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Deals</Text>
        <Text style={styles.headerSubtitle}>Grab the best deals before they expire!</Text>
      </View>

      {/* Promo Banners */}
      <View style={styles.bannersSection}>
        {PROMO_BANNERS.map((promo, i) => (
          <View key={i} style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{promo.title}</Text>
              <Text style={styles.bannerDiscount}>{promo.discount}</Text>
              <Text style={styles.bannerSub}>{promo.sub}</Text>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>Code: {promo.code}</Text>
              </View>
            </View>
            <View style={styles.bannerImageArea}>
              <Text style={styles.bannerEmoji}>{promo.emoji}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Active Coupons */}
      <View style={styles.couponsSection}>
        <Text style={styles.couponsTitle}>Available Coupons</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ paddingVertical: 20 }} />
        ) : coupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyText}>No active coupons right now</Text>
            <Text style={styles.emptySubtext}>Check back later for new deals!</Text>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <View style={styles.couponLeft}>
                <View style={styles.couponIconBg}>
                  <Text style={styles.couponIcon}>🎫</Text>
                </View>
              </View>
              <View style={styles.couponInfo}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponDesc} numberOfLines={2}>{coupon.description}</Text>
                <Text style={styles.couponMeta}>
                  Min order: ₹{coupon.minOrderAmount} • Up to ₹{coupon.maxDiscountAmount} off
                </Text>
              </View>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>COPY</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* How it works */}
      <View style={styles.howSection}>
        <Text style={styles.howTitle}>How to use a coupon</Text>
        {[
          { step: '1', text: 'Add items to your cart from any restaurant' },
          { step: '2', text: 'Go to cart and enter your coupon code' },
          { step: '3', text: 'Hit APPLY and enjoy your discount!' },
        ].map((item) => (
          <View key={item.step} style={styles.howItem}>
            <View style={styles.howStepCircle}>
              <Text style={styles.howStepText}>{item.step}</Text>
            </View>
            <Text style={styles.howItemText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl + 20 },

  // Header
  header: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },

  // Banners
  bannersSection: { padding: Spacing.lg, gap: Spacing.md },
  banner: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    flexDirection: 'row', overflow: 'hidden',
    paddingLeft: Spacing.lg, paddingVertical: Spacing.lg,
    ...Shadows.lg,
  },
  bannerContent: { flex: 1, justifyContent: 'center' },
  bannerTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.accentLight, letterSpacing: 1 },
  bannerDiscount: {
    fontSize: 28, fontWeight: '900', color: Colors.accent,
    lineHeight: 32, marginTop: Spacing.xs,
  },
  bannerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: Spacing.xs },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm, paddingVertical: 3, alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  codeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.accentLight },
  bannerImageArea: { width: 80, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 40 },

  // Coupons
  couponsSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  couponsTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  couponCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
    borderLeftWidth: 4, borderLeftColor: Colors.accent,
  },
  couponLeft: {},
  couponIconBg: {
    width: 44, height: 44, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentBg, justifyContent: 'center', alignItems: 'center',
  },
  couponIcon: { fontSize: 22 },
  couponInfo: { flex: 1 },
  couponCode: { fontSize: FontSize.base, fontWeight: '800', color: Colors.primary },
  couponDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  couponMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  copyButton: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  copyButtonText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary },

  // Empty
  emptyContainer: { paddingVertical: 30, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },

  // How section
  howSection: {
    backgroundColor: Colors.white, marginHorizontal: Spacing.lg, marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg, padding: Spacing.xl,
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  howTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.base },
  howItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  howStepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  howStepText: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.white },
  howItemText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 20 },
});
