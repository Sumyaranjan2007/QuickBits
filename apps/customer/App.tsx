import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import RestaurantDetailScreen from './src/screens/restaurant/RestaurantDetailScreen';
import CartScreen from './src/screens/cart/CartScreen';
import OrderTrackingScreen from './src/screens/orders/OrderTrackingScreen';
import OrdersScreen from './src/screens/orders/OrdersScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import { Colors } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'restaurant'; id: string }
  | { name: 'cart' }
  | { name: 'orderTracking'; orderId: string }
  | { name: 'orders' }
  | { name: 'profile' };

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [tab, setTab] = useState<'home' | 'orders' | 'profile'>('home');

  if (isLoading) return null;

  if (!isAuthenticated) {
    return authScreen === 'login' ? (
      <LoginScreen onNavigateRegister={() => setAuthScreen('register')} />
    ) : (
      <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />
    );
  }

  // Simple stack navigation
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

  // Tab-based screens
  const renderTab = () => {
    switch (tab) {
      case 'orders':
        return <OrdersScreen onViewOrder={(id) => setScreen({ name: 'orderTracking', orderId: id })} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateRestaurant={(id) => setScreen({ name: 'restaurant', id })}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTab()}
      {/* Bottom Tab Bar */}
      <SafeAreaView style={styles.tabBar}>
        {([
          { key: 'home' as const, icon: '🏠', label: 'Home' },
          { key: 'orders' as const, icon: '📦', label: 'Orders' },
          { key: 'profile' as const, icon: '👤', label: 'Profile' },
        ]).map((t) => (
          <SafeAreaView
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onTouchEnd={() => { setTab(t.key); setScreen({ name: t.key } as Screen); }}
          >
            <StatusBar barStyle="dark-content" />
            <SafeAreaView><StatusBar barStyle="dark-content" /></SafeAreaView>
            <SafeAreaView style={styles.tabIcon}>
              <StatusBar barStyle="dark-content" />
            </SafeAreaView>
          </SafeAreaView>
        ))}
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabItemActive: {},
  tabIcon: {},
});
