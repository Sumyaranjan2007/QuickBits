import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, FlatList, StatusBar, Switch, ScrollView, TextInput,
} from 'react-native';
import { authApi, deliveryApi, configureApiClient } from '@quickbite/api-client';

const C = {
  primary: '#6C5CE7', primaryLight: '#A29BFE', primaryBg: '#F0EEFF',
  success: '#00B894', warning: '#FDCB6E', error: '#E17055', info: '#74B9FF',
  white: '#FFF', bg: '#F8F9FA', border: '#E9ECEF',
  text: '#1A1A2E', textSec: '#6C757D', textMuted: '#ADB5BD',
};

let _token: string | null = null;

const DELIVERY_STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
  ACCEPTED: { next: 'ARRIVED_AT_RESTAURANT', label: '📍 Arrived at Restaurant' },
  ARRIVED_AT_RESTAURANT: { next: 'PICKED_UP', label: '📦 Picked Up' },
  PICKED_UP: { next: 'ARRIVED_AT_CUSTOMER', label: '🏠 Arrived at Customer' },
  ARRIVED_AT_CUSTOMER: { next: 'DELIVERED', label: '✅ Delivered' },
};

// ─── Login ───────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await onLogin(email, password); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: '800', color: C.primary, textAlign: 'center' }}>🛵 QuickBite</Text>
      <Text style={{ fontSize: 16, color: C.textSec, textAlign: 'center', marginBottom: 40 }}>Delivery Partner</Text>
      <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={[s.input, { marginTop: 12 }]} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={[s.btn, { marginTop: 20 }]} onPress={handle} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Home / Dashboard ────────────────────────────────────
function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    try {
      const [profileRes, activeRes, pendingRes] = await Promise.all([
        deliveryApi.getProfile(),
        deliveryApi.getActiveAssignment().catch(() => ({ data: null })),
        deliveryApi.getPendingAssignments().catch(() => ({ data: [] })),
      ]);
      const profile = profileRes.data as any;
      setIsOnline(profile?.isOnline || false);
      setActiveDelivery((activeRes.data as any) || null);
      const pd = pendingRes.data as any;
      setPendingAssignments(pd?.items || pd || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const toggleOnline = async (val: boolean) => {
    setToggling(true);
    try {
      await deliveryApi.toggleOnline(val);
      setIsOnline(val);
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setToggling(false); }
  };

  const acceptDelivery = async (id: string) => {
    try {
      await deliveryApi.updateAssignmentStatus(id, 'ACCEPTED');
      load();
      Alert.alert('Accepted!', 'Navigate to the restaurant');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const updateDeliveryStatus = async (id: string, status: string) => {
    try {
      await deliveryApi.updateAssignmentStatus(id, status);
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* Online Toggle */}
      <View style={[s.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>
            {isOnline ? 'You are receiving orders' : 'Go online to receive orders'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          disabled={toggling}
          trackColor={{ false: C.border, true: C.primaryLight }}
          thumbColor={isOnline ? C.primary : C.textMuted}
        />
      </View>

      {/* Active Delivery */}
      {activeDelivery && (
        <View style={[s.card, { marginTop: 12, borderLeftWidth: 4, borderLeftColor: C.primary }]}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: C.primary, marginBottom: 8 }}>🚀 Active Delivery</Text>
          <Text style={{ fontWeight: '600', color: C.text }}>Order #{(activeDelivery.orderId || activeDelivery.id || '').slice(0, 8)}</Text>
          <Text style={{ color: C.textSec, marginTop: 4, fontSize: 13 }}>Status: {activeDelivery.status}</Text>
          {DELIVERY_STATUS_ACTIONS[activeDelivery.status] && (
            <TouchableOpacity
              style={[s.btn, { marginTop: 12 }]}
              onPress={() => updateDeliveryStatus(activeDelivery.id, DELIVERY_STATUS_ACTIONS[activeDelivery.status].next)}
            >
              <Text style={s.btnText}>{DELIVERY_STATUS_ACTIONS[activeDelivery.status].label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Pending Assignments */}
      {isOnline && !activeDelivery && pendingAssignments.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 8 }}>📬 New Delivery Requests</Text>
          {pendingAssignments.map((a: any) => (
            <View key={a.id} style={[s.card, { marginBottom: 8 }]}>
              <Text style={{ fontWeight: '600', color: C.text }}>Order #{(a.orderId || '').slice(0, 8)}</Text>
              <Text style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>Distance: {a.distance || '~3'} km</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={() => acceptDelivery(a.id)}>
                  <Text style={s.btnText}>✅ Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btn, { flex: 1, backgroundColor: C.error }]}
                  onPress={() => updateDeliveryStatus(a.id, 'REJECTED')}
                >
                  <Text style={s.btnText}>❌ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Idle State */}
      {isOnline && !activeDelivery && pendingAssignments.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={{ fontSize: 48 }}>🛵</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: C.text, marginTop: 12 }}>Waiting for orders...</Text>
          <Text style={{ fontSize: 14, color: C.textSec, marginTop: 4 }}>Stay online to receive deliveries</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Earnings ────────────────────────────────────────────
function EarningsScreen() {
  const [earnings, setEarnings] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      deliveryApi.getEarnings().catch(() => ({ data: null })),
      deliveryApi.getHistory().catch(() => ({ data: [] })),
    ]).then(([e, h]) => {
      setEarnings(e.data);
      const hd = h.data as any;
      setHistory(hd?.items || hd || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 100 }} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={[s.card, { alignItems: 'center' }]}>
        <Text style={{ fontSize: 14, color: C.textSec }}>Total Earnings</Text>
        <Text style={{ fontSize: 36, fontWeight: '800', color: C.primary, marginTop: 4 }}>
          ₹{earnings?.totalEarnings || 0}
        </Text>
        <Text style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>
          {earnings?.totalDeliveries || 0} deliveries completed
        </Text>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, marginTop: 20, marginBottom: 8 }}>Recent Deliveries</Text>
      {history.length === 0 ? (
        <Text style={{ textAlign: 'center', color: C.textMuted, marginTop: 20 }}>No deliveries yet</Text>
      ) : (
        history.map((d: any) => (
          <View key={d.id} style={[s.card, { marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600', color: C.text }}>#{(d.orderId || d.id || '').slice(0, 8)}</Text>
              <Text style={{ fontWeight: '700', color: C.success }}>₹{d.earnings || d.deliveryFee || 0}</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
              {new Date(d.completedAt || d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── App Root ────────────────────────────────────────────
export default function DeliveryApp() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'home' | 'earnings'>('home');

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>
          {tab === 'home' ? '🛵 Deliveries' : '💰 Earnings'}
        </Text>
      </View>
      {tab === 'home' ? <HomeScreen /> : <EarningsScreen />}
      <View style={s.tabBar}>
        {([
          { key: 'home' as const, icon: '🛵', label: 'Deliveries' },
          { key: 'earnings' as const, icon: '💰', label: 'Earnings' },
        ]).map(t => (
          <TouchableOpacity key={t.key} style={s.tab} onPress={() => setTab(t.key)}>
            <Text style={{ fontSize: 22 }}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && { color: C.primary, fontWeight: '700' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.white, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  card: { backgroundColor: C.white, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  btn: { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: C.text, backgroundColor: C.bg },
  tabBar: { flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabLabel: { fontSize: 11, color: C.textSec, marginTop: 2, fontWeight: '600' },
});
