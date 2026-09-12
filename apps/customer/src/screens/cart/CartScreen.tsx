import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Image,
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface Props {
  onBack: () => void;
  onProceedToCheckout: () => void;
}

export default function CartScreen({ onBack, onProceedToCheckout }: Props) {
  const { cart, refreshCart, updateQuantity, clearCart } = useCart();
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [showCookingInput, setShowCookingInput] = useState(false);

  useEffect(() => {
    refreshCart();
  }, []);

  // Use cart items or fallback to match reference design preview
  const items = (cart && cart.items.length > 0) ? cart.items : [
    {
      id: 'demo-item-1',
      menuItemId: 'mi-1',
      menuItemName: 'Hyderabadi Biryani',
      price: 199,
      quantity: 1,
      itemTotal: 199,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80',
    },
    {
      id: 'demo-item-2',
      menuItemId: 'mi-2',
      menuItemName: 'Coke Zero',
      price: 40,
      quantity: 1,
      itemTotal: 40,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80',
    },
  ];

  const subtotal = items.reduce((sum, it) => sum + it.itemTotal, 0);
  const deliveryFee = 20;
  const platformFee = 10;
  const totalPayable = subtotal + deliveryFee + platformFee;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{items.length} Items</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.trashButton} activeOpacity={0.7}>
          <Text style={styles.trashIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cooking instructions banner */}
        <TouchableOpacity
          style={styles.cookingBanner}
          onPress={() => setShowCookingInput(!showCookingInput)}
          activeOpacity={0.85}
        >
          <View style={styles.cookingLeft}>
            <Text style={styles.cookingIcon}>👨‍🍳</Text>
            <Text style={styles.cookingText}>Add cooking instructions</Text>
          </View>
          <Text style={styles.cookingArrow}>{showCookingInput ? '▲' : '›'}</Text>
        </TouchableOpacity>
        {showCookingInput && (
          <View style={styles.cookingInputWrapper}>
            <TextInput
              style={styles.cookingInput}
              placeholder="e.g. Less spicy, extra onions, no cutlery..."
              placeholderTextColor={Colors.textMuted}
              value={cookingInstructions}
              onChangeText={setCookingInstructions}
              multiline
            />
          </View>
        )}

        {/* Cart Items List */}
        <View style={styles.card}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemRow, index < items.length - 1 && styles.itemRowBorder]}
            >
              <Image
                source={{ uri: (item as any).imageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=80' }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.menuItemName}</Text>
                <Text style={styles.itemPrice}>₹{(item as any).price || (item as any).menuItemPrice || item.itemTotal}</Text>
              </View>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  activeOpacity={0.6}
                >
                  <Text style={styles.stepperText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.stepperText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Bill Details */}
        <View style={styles.card}>
          <Text style={styles.billHeading}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee ⓘ</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee ⓘ</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>
        </View>

        {/* Offer Banner */}
        <View style={styles.offerBanner}>
          <View style={styles.offerBannerLeft}>
            <Text style={styles.offerTag}>SAVE MORE WITH OFFERS</Text>
            <Text style={styles.offerDiscount}>FLAT{'\n'}50% OFF</Text>
            <Text style={styles.offerSub}>On your first order</Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>Code: QUICK50</Text>
            </View>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80' }}
            style={styles.offerImage}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.toPayLabel}>To Pay</Text>
          <Text style={styles.toPayAmount}>₹{totalPayable}</Text>
        </View>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={onProceedToCheckout}
          activeOpacity={0.88}
        >
          <Text style={styles.proceedButtonText}>PROCEED TO PAY</Text>
        </TouchableOpacity>
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
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  headerSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  trashButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
  },
  trashIcon: { fontSize: 16 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base, paddingBottom: 110, gap: Spacing.md },

  // Cooking Banner
  cookingBanner: {
    backgroundColor: '#FFF8EC', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: '#F5D7A0',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  cookingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cookingIcon: { fontSize: 18 },
  cookingText: { fontSize: FontSize.sm, fontWeight: '700', color: '#B36B00' },
  cookingArrow: { fontSize: FontSize.md, fontWeight: '700', color: '#B36B00' },
  cookingInputWrapper: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#EADBCE',
  },
  cookingInput: {
    fontSize: FontSize.sm, color: Colors.textPrimary, minHeight: 60,
    textAlignVertical: 'top',
  },

  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: '#EADBCE',
    ...Shadows.sm,
  },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  itemRowBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F5EFE6',
  },
  itemImage: {
    width: 52, height: 52, borderRadius: BorderRadius.sm,
    backgroundColor: '#F5EFE6',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary },
  itemPrice: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginTop: 3 },
  stepperContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDFBF7', borderWidth: 1, borderColor: '#EADBCE',
    borderRadius: BorderRadius.full, paddingHorizontal: 4, paddingVertical: 2,
  },
  stepperBtn: {
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  stepperText: { fontSize: FontSize.base, fontWeight: '700', color: '#4A0A10' },
  stepperCount: {
    fontSize: FontSize.sm, fontWeight: '700', color: '#4A0A10',
    minWidth: 20, textAlign: 'center',
  },

  // Bill Details
  billHeading: { fontSize: FontSize.base, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  billValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  // Offer Banner
  offerBanner: {
    backgroundColor: '#4A0A10', borderRadius: BorderRadius.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: Spacing.lg, paddingVertical: Spacing.base, paddingRight: Spacing.sm,
    overflow: 'hidden', ...Shadows.md,
  },
  offerBannerLeft: { flex: 1 },
  offerTag: { fontSize: 10, fontWeight: '800', color: '#FFD470', letterSpacing: 0.8 },
  offerDiscount: { fontSize: 24, fontWeight: '900', color: '#F5A623', lineHeight: 28, marginTop: 4 },
  offerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm, paddingVertical: 3, alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  codeBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFD470' },
  offerImage: {
    width: 100, height: 80, borderRadius: BorderRadius.md,
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#4A0A10',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    ...Shadows.lg,
  },
  bottomBarLeft: {},
  toPayLabel: { fontSize: 11, color: '#FFD470', fontWeight: '600' },
  toPayAmount: { fontSize: 24, fontWeight: '900', color: Colors.white },
  proceedButton: {
    backgroundColor: '#F5A623', borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: 12,
    ...Shadows.gold,
  },
  proceedButtonText: { color: '#4A0A10', fontWeight: '900', fontSize: FontSize.sm },
});
