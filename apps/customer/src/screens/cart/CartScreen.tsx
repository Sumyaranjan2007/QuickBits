import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { ordersApi, addressesApi } from '@quickbite/api-client';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface Props {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export default function CartScreen({ onBack, onOrderPlaced }: Props) {
  const { cart, isLoading, refreshCart, updateQuantity, removeItem, clearCart } = useCart();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    refreshCart();
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressesApi.list();
      const list = (res.data as any[]) || [];
      setAddresses(list);
      const defaultAddr = list.find((a: any) => a.isDefault) || list[0];
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch { /* ignore */ }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please add a delivery address');
      return;
    }
    try {
      setPlacing(true);
      const res = await ordersApi.create({
        deliveryAddressId: selectedAddress,
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      const order = res.data as any;
      await clearCart();
      onOrderPlaced(order.id);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!cart || cart.itemCount === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add items from a restaurant</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>🍽️ {cart.restaurantName}</Text>
        </View>

        {/* Items */}
        {cart.items.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.menuItemName}</Text>
              <Text style={styles.itemPrice}>₹{item.itemTotal}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                <Text style={styles.qtyButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.noAddress}>No addresses saved. Please add one.</Text>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addressCard, selectedAddress === addr.id && styles.addressCardSelected]}
                onPress={() => setSelectedAddress(addr.id)}
              >
                <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
                <Text style={styles.addressText}>{addr.addressLine1}, {addr.city}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>₹{cart.subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹{cart.deliveryFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax & Charges</Text>
            <Text style={styles.billValue}>₹{(cart.tax + cart.platformFee).toFixed(2)}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{cart.total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeButton, placing && styles.placeButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.8}
        >
          {placing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.placeButtonText}>Place Order — ₹{cart.total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.base },
  emptyText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  backBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, ...Shadows.sm,
  },
  backArrow: { fontSize: FontSize.xxl, color: Colors.textPrimary },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  clearText: { fontSize: FontSize.md, color: Colors.error, fontWeight: '600' },
  scroll: { flex: 1 },
  restaurantInfo: { backgroundColor: Colors.white, padding: Spacing.xl, marginBottom: Spacing.sm },
  restaurantName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  cartItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  itemPrice: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyButton: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  qtyButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  qtyText: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },
  section: { backgroundColor: Colors.white, padding: Spacing.xl, marginTop: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  noAddress: { fontSize: FontSize.md, color: Colors.textMuted },
  addressCard: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    padding: Spacing.base, marginBottom: Spacing.sm,
  },
  addressCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  addressLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  addressText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  billValue: { fontSize: FontSize.md, color: Colors.textPrimary },
  billTotal: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  footer: { backgroundColor: Colors.white, padding: Spacing.xl, ...Shadows.lg },
  placeButton: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.md,
  },
  placeButtonDisabled: { opacity: 0.7 },
  placeButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
