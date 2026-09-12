import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  TextInput, StatusBar, Animated,
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface CheckoutScreenProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

const TIP_OPTIONS = [
  { label: '₹20', value: 20 },
  { label: '₹30', value: 30 },
  { label: '₹50', value: 50 },
  { label: 'Custom', value: -1 },
];

const ADDRESSES = [
  { id: 'addr-1', tag: 'WORK', address: 'Chord Road, Nagapura, Bengaluru 560086' },
  { id: 'addr-2', tag: 'HOME', address: 'maruti pg, Harohalli 562112' },
  { id: 'addr-3', tag: 'HOME', address: 'ttt, Harohalli 562112' },
];

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
  { id: 'card', label: 'Card (Razorpay)' },
];

export default function CheckoutScreen({ onBack, onOrderPlaced }: CheckoutScreenProps) {
  const { cart, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState('addr-1');
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const baseTotal = cart ? cart.total : 269;
  const discount = couponApplied ? 50 : 0;
  const tipAmount = selectedTip > 0 ? selectedTip : 0;
  const totalPayable = Math.max(0, baseTotal + tipAmount - discount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Coupon', 'Please enter a valid coupon code');
      return;
    }
    setCouponApplied(true);
    Alert.alert('Success!', `Coupon ${couponCode.toUpperCase()} applied! ₹50 OFF`);
  };

  const handlePay = async () => {
    setPlacing(true);
    setTimeout(async () => {
      setPlacing(false);
      await clearCart();
      onOrderPlaced('QB-ORD-' + Math.floor(100000 + Math.random() * 900000));
    }, 1000);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.cardAction}>+ Add new</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressList}>
            {ADDRESSES.map((addr) => {
              const isSelected = selectedAddress === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={styles.radioRow}
                  onPress={() => setSelectedAddress(addr.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.addressText}>
                    <Text style={styles.addressTag}>{addr.tag}</Text> – {addr.address}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.cardTitleWithIcon}>
            <Text style={styles.titleIcon}>🛍️</Text>
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>

          {cart && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <View key={item.id} style={styles.orderItemRow}>
                <Text style={styles.orderItemName}>{item.menuItemName} × {item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₹{item.itemTotal}</Text>
              </View>
            ))
          ) : (
            <View style={styles.orderItemRow}>
              <Text style={styles.orderItemName}>Hyderabadi Chicken Biryani × 1</Text>
              <Text style={styles.orderItemPrice}>₹249</Text>
            </View>
          )}
        </View>

        {/* Add Sweets & Desserts banner */}
        <TouchableOpacity style={styles.sweetsBanner} activeOpacity={0.85}>
          <View style={styles.sweetsLeft}>
            <Text style={styles.sweetsEmoji}>🍰</Text>
            <Text style={styles.sweetsText}>Add Sweets & Desserts 🍨</Text>
          </View>
          <Text style={styles.sweetsAction}>Tap to browse ›</Text>
        </TouchableOpacity>

        {/* Delivery Tip */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Tip – 100% goes to your partner</Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map((tip) => {
              const isSelected = selectedTip === tip.value;
              return (
                <TouchableOpacity
                  key={tip.value}
                  style={[styles.tipChip, isSelected && styles.tipChipSelected]}
                  onPress={() => setSelectedTip(isSelected ? 0 : tip.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tipChipText, isSelected && styles.tipChipTextSelected]}>
                    {tip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Coupon */}
        <View style={styles.card}>
          <View style={styles.cardTitleWithIcon}>
            <Text style={styles.titleIcon}>🏷️</Text>
            <Text style={styles.cardTitle}>Coupon</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              placeholderTextColor={Colors.textMuted}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon} activeOpacity={0.8}>
              <Text style={styles.applyBtnText}>{couponApplied ? 'APPLIED' : 'APPLY'}</Text>
            </TouchableOpacity>
          </View>
          {couponApplied && (
            <Text style={styles.discountBadge}>🎉 Saved ₹50 with code {couponCode.toUpperCase()}!</Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <View style={styles.cardTitleWithIcon}>
            <Text style={styles.titleIcon}>💳</Text>
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          <View style={styles.paymentList}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  style={styles.radioRow}
                  onPress={() => setPaymentMethod(pm.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.paymentText}>{pm.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Sticky Pay Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.payableLabel}>Total Payable</Text>
          <Text style={styles.payableAmount}>₹{totalPayable}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={handlePay}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={placing}
            activeOpacity={0.9}
          >
            <Text style={styles.proceedBtnText}>
              {placing ? 'PROCESSING...' : 'PROCEED TO PAY →'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 46, paddingBottom: Spacing.md,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F7F2EA', justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: 110, gap: Spacing.md },

  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, ...Shadows.sm, borderWidth: 1, borderColor: '#EADBCE',
  },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  cardAction: { fontSize: FontSize.sm, fontWeight: '700', color: '#D44040' },
  cardTitleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  titleIcon: { fontSize: 16 },

  addressList: { gap: Spacing.md, marginTop: Spacing.xs },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#CCC',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterSelected: { borderColor: Colors.accent },
  radioInner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  addressText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  addressTag: { fontWeight: '800', color: Colors.textPrimary },

  orderItemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  orderItemName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  orderItemPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },

  sweetsBanner: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: '#EADBCE', ...Shadows.sm,
  },
  sweetsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sweetsEmoji: { fontSize: 18 },
  sweetsText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  sweetsAction: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted },

  tipRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  tipChip: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm,
    backgroundColor: '#FAF7F2', alignItems: 'center',
    borderWidth: 1, borderColor: '#EADBCE',
  },
  tipChipSelected: { backgroundColor: '#FFF3D6', borderColor: Colors.accent },
  tipChipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  tipChipTextSelected: { color: '#B36B00' },

  couponRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  couponInput: {
    flex: 1, backgroundColor: '#FAF7F2', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSize.sm, color: Colors.textPrimary,
    borderWidth: 1, borderColor: '#EADBCE',
  },
  applyBtn: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center',
  },
  applyBtnText: { color: '#4A0A10', fontWeight: '800', fontSize: FontSize.xs },
  discountBadge: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700', marginTop: Spacing.xs },

  paymentList: { gap: Spacing.md, marginTop: Spacing.xs },
  paymentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#4A0A10',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  bottomBarLeft: {},
  payableLabel: { fontSize: 11, color: '#FFD470', fontWeight: '600' },
  payableAmount: { fontSize: 24, fontWeight: '900', color: Colors.white },
  proceedBtn: {
    backgroundColor: '#F5A623', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: 12,
    ...Shadows.gold,
  },
  proceedBtnText: { color: '#4A0A10', fontWeight: '900', fontSize: FontSize.sm },
});
