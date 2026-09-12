import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import RestaurantDetailScreen from './src/screens/restaurant/RestaurantDetailScreen';
import CartScreen from './src/screens/cart/CartScreen';
import CheckoutScreen from './src/screens/cart/CheckoutScreen';
import OrderTrackingScreen from './src/screens/orders/OrderTrackingScreen';
import OrdersScreen from './src/screens/orders/OrdersScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SearchScreen from './src/screens/search/SearchScreen';
import OffersScreen from './src/screens/offers/OffersScreen';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'orders' }
  | { name: 'offers' }
  | { name: 'profile' }
  | { name: 'restaurant'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'orderTracking'; orderId: string };

type TabKey = 'home' | 'search' | 'orders' | 'offers' | 'profile';

const TAB_ITEMS: { key: TabKey; icon: string; activeIcon: string; label: string }[] = [
  { key: 'home', icon: '🏠', activeIcon: '🏠', label: 'Home' },
  { key: 'search', icon: '🔍', activeIcon: '🔍', label: 'Search' },
  { key: 'orders', icon: '📦', activeIcon: '📦', label: 'Orders' },
  { key: 'offers', icon: '🏷️', activeIcon: '🏷️', label: 'Offers' },
  { key: 'profile', icon: '👤', activeIcon: '👤', label: 'Profile' },
];

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [tab, setTab] = useState<TabKey>('home');

  if (isLoading) return null;

  if (!isAuthenticated) {
    return authScreen === 'login' ? (
      <LoginScreen onNavigateRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />
    );
  }

  // Stack screens (no bottom nav)
  if (screen.name === 'restaurant') {
    return (
      <RestaurantDetailScreen
        restaurantId={screen.id}
        onBack={() => setScreen({ name: 'home' })}
        onGoToCart={() => setScreen({ name: 'cart' })}
      />
    );
  }

  if (screen.name === 'cart') {
    return (
      <CartScreen
        onBack={() => setScreen({ name: 'home' })}
        onProceedToCheckout={() => setScreen({ name: 'checkout' })}
      />
    );
  }

  if (screen.name === 'checkout') {
    return (
      <CheckoutScreen
        onBack={() => setScreen({ name: 'cart' })}
        onOrderPlaced={(orderId) => setScreen({ name: 'orderTracking', orderId })}
      />
    );
  }

  if (screen.name === 'orderTracking') {
    return (
      <OrderTrackingScreen
        orderId={screen.orderId}
        onBack={() => { setTab('orders'); setScreen({ name: 'orders' }); }}
      />
    );
  }

  // Tab screens
  const renderTab = () => {
    switch (tab) {
      case 'search':
        return (
          <SearchScreen
            onNavigateRestaurant={(id) => setScreen({ name: 'restaurant', id })}
          />
        );
      case 'orders':
        return <OrdersScreen onViewOrder={(id) => setScreen({ name: 'orderTracking', orderId: id })} />;
      case 'offers':
        return <OffersScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateRestaurant={(id) => setScreen({ name: 'restaurant', id })}
            onGoToCart={() => setScreen({ name: 'cart' })}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderTab()}

      {/* === BOTTOM NAVIGATION BAR === */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {TAB_ITEMS.map((t) => {
            const isActive = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabItem}
                onPress={() => {
                  setTab(t.key);
                  setScreen({ name: t.key } as Screen);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconContainer, isActive && styles.tabIconContainerActive]}>
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                    {isActive ? t.activeIcon : t.icon}
                  </Text>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {t.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Bottom Navigation
  bottomNavContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    ...Shadows.lg,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, position: 'relative',
  },
  tabIconContainer: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 1,
  },
  tabIconContainerActive: {
    backgroundColor: Colors.primaryBg,
  },
  tabIcon: { fontSize: 20 },
  tabIconActive: { fontSize: 22 },
  tabLabel: {
    fontSize: 10, fontWeight: '500', color: Colors.textMuted,
    marginTop: 1,
  },
  tabLabelActive: {
    color: Colors.primary, fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute', top: 0, left: '30%', right: '30%',
    height: 3, borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
