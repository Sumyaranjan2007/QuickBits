import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: '📍', label: 'My Addresses', onPress: () => {} },
    { icon: '💳', label: 'Payment Methods', onPress: () => {} },
    { icon: '🎫', label: 'Coupons & Offers', onPress: () => {} },
    { icon: '🔔', label: 'Notifications', onPress: () => {} },
    { icon: '⭐', label: 'Rate Us', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
    { icon: '📄', label: 'Terms & Conditions', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Profile Hero */}
      <View style={styles.profileHero}>
        <View style={styles.profileHeroInner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.profile?.firstName?.[0] || '?'}{user?.profile?.lastName?.[0] || ''}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.profile?.firstName} {user?.profile?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email || user?.phone || ''}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        {/* Curve */}
        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Favourites</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>⚡ Quickbites</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl + 20 },

  // Profile Hero
  profileHero: {
    backgroundColor: Colors.primary, position: 'relative',
    paddingTop: Spacing.xxxl + 12, paddingBottom: 36,
  },
  profileHeroInner: { alignItems: 'center', zIndex: 2 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.gold,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  email: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editButton: {
    marginTop: Spacing.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xs,
  },
  editButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white },
  curveContainer: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 28, overflow: 'hidden',
  },
  curve: {
    position: 'absolute', bottom: 0, left: -20, right: -20,
    height: 56, borderTopLeftRadius: 999, borderTopRightRadius: 999,
    backgroundColor: Colors.background,
  },

  // Stats
  statsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm, gap: Spacing.sm,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base, alignItems: 'center',
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  // Menu
  menu: {
    backgroundColor: Colors.white, marginTop: Spacing.base,
    marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg,
    ...Shadows.sm, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuIconContainer: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  menuArrow: { fontSize: FontSize.xxl, color: Colors.textMuted, fontWeight: '300' },

  // Logout
  logoutButton: {
    marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.error,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.error },

  // Footer
  footer: { alignItems: 'center', marginTop: Spacing.xl, paddingBottom: Spacing.base },
  footerBrand: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  version: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
