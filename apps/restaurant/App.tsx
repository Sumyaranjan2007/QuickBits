import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { authApi, ordersApi, restaurantsApi, configureApiClient } from '@quickbite/api-client';

const Colors = {
  primary: '#FF6B35', primaryDark: '#E55A2B', primaryBg: '#FFF5F0',
  success: '#00B894', warning: '#FDCB6E', error: '#E17055', info: '#74B9FF',
  white: '#FFFFFF', background: '#F8F9FA', border: '#E9ECEF', borderLight: '#F1F3F5',
  textPrimary: '#1A1A2E', textSecondary: '#6C757D', textMuted: '#ADB5BD',
};

let _token: string | null = null;

const STATUS_ACTIONS: Record<string, { next: string; label: string; color: string }> = {
  PENDING: { next: 'CONFIRMED', label: '✅ Accept', color: Colors.success },
  CONFIRMED: { next: 'PREPARING', label: '👨‍🍳 Start Preparing', color: Colors.primary },
  PREPARING: { next: 'READY_FOR_PICKUP', label: '📦 Mark Ready', color: Colors.info },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.warning, CONFIRMED: Colors.info, PREPARING: Colors.primary,
  READY_FOR_PICKUP: Colors.success, DELIVERED: Colors.success, CANCELLED: Colors.error,
};

// ─── Login Screen ────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, pass: string) => void }) {
  const [email, setEmail] = useState('restaurant@quickbite.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try { await onLogin(email, password); }
    catch (e: any) { Alert.alert('Login Failed', e.message); }
    finally { setLoading(false); }
  };

  const { TextInput } = require('react-native');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.primary, textAlign: 'center', marginBottom: 8 }}>🍽️ QuickBite</Text>
      <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40 }}>Restaurant Partner</Text>
      <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={[s.input, { marginTop: 12 }]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={[s.btn, { marginTop: 20 }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Dashboard ───────────────────────────────────────────
function DashboardScreen({ restaurantId, onViewOrder }: { restaurantId: string; onViewOrder: (id: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await ordersApi.getRestaurantOrders({ status: 'PENDING' });
      const d = res.data as any;
      setOrders(d.items || d || []);
    } catch { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>📊 Dashboard</Text>
        <Text style={s.headerSub}>{orders.length} pending orders</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={<Text style={s.emptyText}>🎉 No pending orders</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => onViewOrder(item.id)} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.textPrimary }}>Order #{item.id.slice(0, 8)}</Text>
                <View style={{ backgroundColor: (STATUS_COLORS[item.status] || Colors.textSecondary) + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: STATUS_COLORS[item.status] || Colors.textSecondary }}>{item.status}</Text>
                </View>
              </View>
              <Text style={{ color: Colors.textSecondary, marginTop: 4, fontSize: 13 }}>
                {(item.items || []).map((i: any) => `${i.quantity}× ${i.menuItemName}`).join(', ')}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 16 }}>₹{item.total}</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Tap to manage →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// ─── Order Detail ────────────────────────────────────────
function OrderDetailScreen({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    ordersApi.getById(orderId).then(r => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: string) => {
    try {
      setUpdating(true);
      await ordersApi.updateStatus(orderId, status);
      const res = await ordersApi.getById(orderId);
      setOrder(res.data);
      Alert.alert('Updated!', `Order status: ${status}`);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setUpdating(false); }
  };

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />;
  if (!order) return <Text style={{ textAlign: 'center', marginTop: 100 }}>Order not found</Text>;

  const action = STATUS_ACTIONS[order.status];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack}><Text style={{ fontSize: 24, color: Colors.textPrimary }}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Order #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={{ padding: 16 }}>
        <View style={[s.card, { marginBottom: 12 }]}>
          <Text style={s.sectionTitle}>Status</Text>
          <View style={{ backgroundColor: (STATUS_COLORS[order.status] || Colors.textSecondary) + '20', borderRadius: 8, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', fontSize: 18, color: STATUS_COLORS[order.status] || Colors.textSecondary }}>{order.status}</Text>
          </View>
        </View>
        <View style={[s.card, { marginBottom: 12 }]}>
          <Text style={s.sectionTitle}>Items</Text>
          {(order.items || []).map((item: any) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ fontSize: 14, color: Colors.textPrimary }}>{item.quantity}× {item.menuItemName}</Text>
              <Text style={{ fontWeight: '600', color: Colors.textPrimary }}>₹{item.itemTotal}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 8, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', fontSize: 16 }}>Total</Text>
            <Text style={{ fontWeight: '700', fontSize: 16, color: Colors.primary }}>₹{order.total}</Text>
          </View>
        </View>
        {action && (
          <TouchableOpacity
            style={[s.btn, { backgroundColor: action.color }, updating && { opacity: 0.7 }]}
            onPress={() => updateStatus(action.next)}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{action.label}</Text>}
          </TouchableOpacity>
        )}
        {order.status === 'PENDING' && (
          <TouchableOpacity style={[s.btn, { backgroundColor: Colors.error, marginTop: 8 }]} onPress={() => updateStatus('CANCELLED')}>
            <Text style={s.btnText}>❌ Reject Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── All Orders ──────────────────────────────────────────
function AllOrdersScreen({ onViewOrder }: { onViewOrder: (id: string) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getRestaurantOrders().then(r => {
      const d = r.data as any;
      setOrders(d.items || d || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={s.header}><Text style={s.headerTitle}>📋 All Orders</Text></View>
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={s.emptyText}>No orders yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => onViewOrder(item.id)} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>#{item.id.slice(0, 8)}</Text>
              <Text style={{ fontWeight: '700', color: STATUS_COLORS[item.status] || Colors.textSecondary, fontSize: 12 }}>{item.status}</Text>
            </View>
            <Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {(item.items || []).slice(0, 2).map((i: any) => i.menuItemName).join(', ')}
            </Text>
            <Text style={{ fontWeight: '700', color: Colors.primary, marginTop: 6 }}>₹{item.total}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── App Root ────────────────────────────────────────────
type Screen = { name: 'dashboard' } | { name: 'allOrders' } | { name: 'orderDetail'; id: string };

export default function RestaurantApp() {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'dashboard' });
  const [tab, setTab] = useState<'dashboard' | 'orders'>('dashboard');

  useEffect(() => {
    configureApiClient({ baseUrl: 'http://10.0.2.2:3000/api/v1', getToken: async () => _token });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const d = res.data as any;
    _token = d.accessToken;
    setUser(d.user);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const goToOrder = (id: string) => setScreen({ name: 'orderDetail', id });

  if (screen.name === 'orderDetail') {
    return <SafeAreaView style={{ flex: 1 }}><OrderDetailScreen orderId={screen.id} onBack={() => setScreen({ name: tab === 'orders' ? 'allOrders' : 'dashboard' })} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" />
      {tab === 'dashboard'
        ? <DashboardScreen restaurantId={user.id} onViewOrder={goToOrder} />
        : <AllOrdersScreen onViewOrder={goToOrder} />}
      {/* Tab Bar */}
      <View style={s.tabBar}>
        {([
          { key: 'dashboard', icon: '📊', label: 'Dashboard' },
          { key: 'orders', icon: '📋', label: 'Orders' },
        ] as const).map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => { setTab(t.key); setScreen({ name: t.key === 'dashboard' ? 'dashboard' : 'allOrders' }); }}>
            <Text style={{ fontSize: 22 }}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && { color: Colors.primary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: Colors.white, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: Colors.textPrimary, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabActive: {},
  tabLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  emptyText: { textAlign: 'center', fontSize: 18, color: Colors.textMuted, marginTop: 80 },
});
