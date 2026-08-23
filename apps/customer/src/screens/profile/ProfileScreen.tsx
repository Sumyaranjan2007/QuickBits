import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
    { icon: '📄', label: 'Terms & Conditions', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.profile?.firstName?.[0] || '?'}{user?.profile?.lastName?.[0] || ''}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email || user?.phone || ''}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>QuickBite v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },
  profileCard: {
    backgroundColor: Colors.primary, paddingTop: Spacing.xxxl + 16, paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  email: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  menu: { backgroundColor: Colors.white, marginTop: Spacing.base, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.xl, ...Shadows.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.base },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  menuArrow: { fontSize: FontSize.xl, color: Colors.textMuted },
  logoutButton: {
    marginHorizontal: Spacing.xl, marginTop: Spacing.xl,
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.error,
  },
  logoutText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.error },
  version: { textAlign: 'center', marginTop: Spacing.xl, fontSize: FontSize.sm, color: Colors.textMuted },
});
