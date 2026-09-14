/**
 * QuickBite Delivery Partner App — v2.0
 * Mobile-first redesign with 12 screens, bottom tab navigation,
 * and all existing API integrations preserved.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Switch,
  ScrollView,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { authApi, deliveryApi, configureApiClient } from '@quickbite/api-client';
import { registerRootComponent } from 'expo';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'deliveries' | 'history' | 'earnings' | 'more';
type SubScreen =
  | 'delivery-detail'
  | 'history-detail'
  | 'profile'
  | 'documents'
  | 'performance'
  | 'safety'
  | 'help'
  | 'settings';

interface StackEntry {
  screen: SubScreen;
  data?: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  // Brand
  primary: '#FF6B35',
  primaryDark: '#E55A25',
  primaryLight: '#FFE8DF',
  // Status colours
  online: '#00C853',
  onlineBg: '#E8F5E9',
  offline: '#9E9E9E',
  offlineBg: '#EEEEEE',
  success: '#00C853',
  successBg: '#E8F5E9',
  warning: '#FFB300',
  warningBg: '#FFF8E1',
  danger: '#F44336',
  dangerBg: '#FFEBEE',
  // Neutrals
  white: '#FFFFFF',
  bg: '#F4F4F7',
  card: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  // Text
  text: '#1A1A1A',
  textSec: '#757575',
  textMuted: '#BDBDBD',
  // Navigation
  tabActive: '#FF6B35',
  tabInactive: '#9E9E9E',
  // Dark (login)
  dark: '#1A1A2E',
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH TOKEN (module-level singleton)
// ─────────────────────────────────────────────────────────────────────────────

let _token: string | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'ACCEPTED',             label: 'Accepted',          desc: 'Head to the restaurant' },
  { key: 'ARRIVED_AT_RESTAURANT',label: 'At Restaurant',     desc: 'Collect the order' },
  { key: 'PICKED_UP',            label: 'Order Picked Up',   desc: 'Head to the customer' },
  { key: 'ARRIVED_AT_CUSTOMER',  label: 'At Customer',       desc: 'Hand over the order' },
  { key: 'DELIVERED',            label: 'Delivered',         desc: 'Order completed! 🎉' },
];

const NEXT_STATUS: Record<string, { next: string; btnLabel: string; navLabel?: string }> = {
  ACCEPTED: {
    next: 'ARRIVED_AT_RESTAURANT',
    btnLabel: '📍 Mark Arrived at Restaurant',
    navLabel: 'Navigate to Restaurant',
  },
  ARRIVED_AT_RESTAURANT: {
    next: 'PICKED_UP',
    btnLabel: '📦 Confirm Order Picked Up',
  },
  PICKED_UP: {
    next: 'ARRIVED_AT_CUSTOMER',
    btnLabel: '🏠 Mark Arrived at Customer',
    navLabel: 'Navigate to Customer',
  },
  ARRIVED_AT_CUSTOMER: {
    next: 'DELIVERED',
    btnLabel: '✅ Mark as Delivered',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (d: string | Date) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const fmtCurrency = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const shortId = (id?: string) => `QB${(id || '').slice(-6).toUpperCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({
  icon, label, value, bold,
}: { icon: string; label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <Text style={{ fontSize: 15, width: 22 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 0.6 }}>
          {label.toUpperCase()}
        </Text>
        <Text style={{
          fontSize: 14,
          color: bold ? C.text : C.textSec,
          fontWeight: bold ? '700' : '500',
          marginTop: 2,
        }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 14 }]}>
      <Text style={{ fontSize: 20, fontWeight: '900', color }}>{value}</Text>
      <Text style={{ fontSize: 11, color: C.textSec, marginTop: 3, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function DetailHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.detailHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={{ fontSize: 22, color: C.text, fontWeight: '300' }}>←</Text>
      </TouchableOpacity>
      <Text style={styles.detailHeaderTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function ScreenHeader({ title }: { title: string }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenHeaderTitle}>{title}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <View>
      {STATUS_STEPS.map((step, idx) => {
        const isDone    = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isAhead   = idx > currentIdx;
        return (
          <View key={step.key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Dot + line */}
            <View style={{ alignItems: 'center', width: 28 }}>
              <View style={[
                styles.tDot,
                isDone    && { backgroundColor: C.success, borderColor: C.success },
                isCurrent && { backgroundColor: C.primary, borderColor: C.primary, width: 20, height: 20, borderRadius: 10 },
                isAhead   && { backgroundColor: C.white,   borderColor: C.border },
              ]}>
                {isDone    && <Text style={{ fontSize: 7,  color: '#fff', fontWeight: '900' }}>✓</Text>}
                {isCurrent && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
              </View>
              {idx < STATUS_STEPS.length - 1 && (
                <View style={[styles.tLine, { backgroundColor: idx < currentIdx ? C.success : C.border }]} />
              )}
            </View>
            {/* Label */}
            <View style={{ flex: 1, paddingBottom: 18, paddingLeft: 10 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: isCurrent ? '800' : '500',
                color: isDone ? C.success : isCurrent ? C.text : C.textMuted,
              }}>
                {step.label}
              </Text>
              {isCurrent && (
                <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{step.desc}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW REQUEST CARD
// ─────────────────────────────────────────────────────────────────────────────

function NewRequestCard({
  request, onAccept, onReject,
}: { request: any; onAccept: () => void; onReject: () => void }) {
  return (
    <View style={[styles.card, { marginBottom: 16, borderWidth: 2, borderColor: C.primary }]}>
      {/* Badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Text style={{ fontSize: 20 }}>🔔</Text>
        <Text style={{ fontSize: 12, fontWeight: '800', color: C.primary, letterSpacing: 1 }}>
          NEW DELIVERY REQUEST
        </Text>
      </View>

      <Text style={[styles.cardTitle, { marginBottom: 14 }]}>
        Order #{shortId(request.orderId || request.id)}
      </Text>

      <View style={{ gap: 10, marginBottom: 18 }}>
        {request.order?.restaurant?.name && (
          <InfoRow icon="🏪" label="Pickup Restaurant" value={request.order.restaurant.name} />
        )}
        {request.order?.deliveryAddress && (
          <InfoRow
            icon="📍"
            label="Drop Location"
            value={
              request.order.deliveryAddress.area ||
              request.order.deliveryAddress.city ||
              'Customer Location'
            }
          />
        )}
        <InfoRow icon="📏" label="Distance" value={`${request.distance || '~3'} km`} />
        <InfoRow
          icon="💰"
          label="Estimated Earnings"
          value={fmtCurrency(request.earnings || request.deliveryFee || 0)}
          bold
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={onAccept} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>✅ Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dangerOutlineBtn, { flex: 1 }]} onPress={onReject} activeOpacity={0.85}>
          <Text style={styles.dangerOutlineBtnText}>❌ Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: LOGIN
// ─────────────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email,    setEmail]    = useState('driver@quickbite.com');
  const [password, setPassword] = useState('Password@123');
  const [loading,  setLoading]  = useState(false);

  const handle = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.dark} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={styles.loginLogoCircle}>
            <Text style={{ fontSize: 44 }}>🛵</Text>
          </View>
          <Text style={styles.loginTitle}>QuickBite</Text>
          <Text style={styles.loginSubtitle}>Delivery Partner</Text>
        </View>

        {/* Form card */}
        <View style={styles.loginCard}>
          <Text style={styles.loginFormTitle}>Welcome back</Text>
          <Text style={styles.loginFormSub}>Sign in to your partner account</Text>

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={C.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={handle}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Sign In →</Text>}
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 32, fontSize: 12 }}>
          QuickBite Delivery Fleet v2.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: HOME
// ─────────────────────────────────────────────────────────────────────────────

function HomeScreen({
  profile, isOnline, onToggleOnline, togglingOnline,
  activeDelivery, pendingRequests, todayStats,
  onAccept, onReject, onViewDelivery, loadingData,
}: any) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Partner header */}
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.homeGreetingLabel}>QUICKBITE FLEET</Text>
          <Text style={styles.homeName}>
            {profile?.firstName} {profile?.lastName || ''}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isOnline ? C.onlineBg : C.offlineBg },
        ]}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? C.online : C.offline }]} />
          <Text style={[styles.statusBadgeText, { color: isOnline ? C.online : C.offline }]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* ── Online / Offline toggle card ── */}
      <View style={[styles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
            </Text>
            <Text style={styles.cardSub}>
              {isOnline
                ? 'Receiving delivery requests'
                : 'Toggle to start receiving orders'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={onToggleOnline}
            disabled={togglingOnline}
            trackColor={{ false: C.border, true: '#A8E6C3' }}
            thumbColor={isOnline ? C.online : C.textMuted}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
        </View>
        {togglingOnline && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={{ fontSize: 12, color: C.textSec }}>Updating status…</Text>
          </View>
        )}
      </View>

      {/* ── PRIORITY: New delivery requests ── */}
      {isOnline && !activeDelivery && pendingRequests.length > 0 && (
        <View>
          {pendingRequests.map((req: any) => (
            <NewRequestCard
              key={req.id}
              request={req}
              onAccept={() => onAccept(req.id)}
              onReject={() => onReject(req.id)}
            />
          ))}
        </View>
      )}

      {/* ── Active delivery card ── */}
      {activeDelivery && (
        <TouchableOpacity
          style={[styles.card, { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: C.primary }]}
          onPress={onViewDelivery}
          activeOpacity={0.85}
        >
          <Text style={styles.sectionLabel}>ACTIVE DELIVERY</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
            <Text style={styles.cardTitle}>
              Order #{shortId(activeDelivery.orderId || activeDelivery.id)}
            </Text>
            <View style={[styles.pill, { backgroundColor: C.primaryLight }]}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: C.primary }}>
                {(activeDelivery.status || '').replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {activeDelivery.order?.restaurant?.name && (
            <Text style={[styles.cardSub, { marginTop: 8 }]}>
              🏪 {activeDelivery.order.restaurant.name}
            </Text>
          )}
          {activeDelivery.order?.deliveryAddress && (
            <Text style={styles.cardSub}>
              📍 {activeDelivery.order.deliveryAddress.addressLine1 || 'Customer Location'}
            </Text>
          )}
          {activeDelivery.distance && (
            <Text style={styles.cardSub}>📏 {activeDelivery.distance} km</Text>
          )}
          <View style={[styles.primaryBtn, { marginTop: 14 }]}>
            <Text style={styles.primaryBtnText}>View Delivery Details →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── Idle / Offline placeholder ── */}
      {!activeDelivery && pendingRequests.length === 0 && !loadingData && (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 40, marginBottom: 16 }]}>
          <Text style={{ fontSize: 54 }}>{isOnline ? '🛵' : '💤'}</Text>
          <Text style={[styles.cardTitle, { marginTop: 14, textAlign: 'center' }]}>
            {isOnline ? 'Waiting for orders…' : "You're Offline"}
          </Text>
          <Text style={[styles.cardSub, { textAlign: 'center', marginTop: 4 }]}>
            {isOnline
              ? 'New requests will appear here'
              : 'Toggle the switch above to go online'}
          </Text>
        </View>
      )}

      {/* ── Today's Summary (3 KPI cards only) ── */}
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatCard label="Earned"    value={fmtCurrency(todayStats.earnings)}        color={C.success} />
        <StatCard label="Trips"     value={String(todayStats.completed || 0)}        color={C.primary} />
        <StatCard label="Rating"    value={todayStats.rating ? `${todayStats.rating}★` : '—'} color={C.warning} />
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: DELIVERIES
// ─────────────────────────────────────────────────────────────────────────────

function DeliveriesScreen({
  isOnline, activeDelivery, pendingRequests, updatingStatus,
  onAccept, onReject, onUpdateStatus, onViewDetail,
}: any) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Empty state */}
      {!activeDelivery && pendingRequests.length === 0 && (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 52 }]}>
          <Text style={{ fontSize: 52 }}>📋</Text>
          <Text style={[styles.cardTitle, { marginTop: 14, textAlign: 'center' }]}>
            {isOnline ? 'No New Requests' : "You're Offline"}
          </Text>
          <Text style={[styles.cardSub, { textAlign: 'center', marginTop: 4 }]}>
            {isOnline
              ? 'New delivery requests will appear here'
              : 'Go online from the Home screen to receive deliveries'}
          </Text>
        </View>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>New Requests ({pendingRequests.length})</Text>
          {pendingRequests.map((req: any) => (
            <NewRequestCard
              key={req.id}
              request={req}
              onAccept={() => onAccept(req.id)}
              onReject={() => onReject(req.id)}
            />
          ))}
        </>
      )}

      {/* Active delivery */}
      {activeDelivery && (
        <>
          <Text style={styles.sectionTitle}>Active Delivery</Text>
          <View style={[styles.card, { marginBottom: 16 }]}>
            {/* Header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.cardTitle}>
                Order #{shortId(activeDelivery.orderId || activeDelivery.id)}
              </Text>
              <TouchableOpacity onPress={onViewDetail}>
                <Text style={{ color: C.primary, fontWeight: '700', fontSize: 14 }}>Details →</Text>
              </TouchableOpacity>
            </View>

            {/* Timeline */}
            <DeliveryTimeline status={activeDelivery.status} />

            {/* Action buttons */}
            {NEXT_STATUS[activeDelivery.status] && (
              <View style={{ marginTop: 16, gap: 10 }}>
                {NEXT_STATUS[activeDelivery.status].navLabel && (
                  <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.85}>
                    <Text style={styles.outlineBtnText}>
                      🗺️ {NEXT_STATUS[activeDelivery.status].navLabel}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.primaryBtn, updatingStatus && { opacity: 0.6 }]}
                  onPress={() => onUpdateStatus(
                    activeDelivery.id,
                    NEXT_STATUS[activeDelivery.status].next,
                  )}
                  disabled={updatingStatus}
                  activeOpacity={0.85}
                >
                  {updatingStatus
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>
                        {NEXT_STATUS[activeDelivery.status].btnLabel}
                      </Text>}
                </TouchableOpacity>
              </View>
            )}

            {activeDelivery.status === 'DELIVERED' && (
              <View style={[styles.card, {
                backgroundColor: C.successBg, marginTop: 16,
                alignItems: 'center', paddingVertical: 20,
              }]}>
                <Text style={{ fontSize: 32 }}>🎉</Text>
                <Text style={{ fontWeight: '800', color: C.success, fontSize: 16, marginTop: 6 }}>
                  Delivery Completed!
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE GOOGLE MAPS TURN-BY-TURN NAVIGATION (mode=l: Two-Wheeler)
// ─────────────────────────────────────────────────────────────────────────────

const launchGoogleMapsNavigation = async (target: {
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}) => {
  const isCoordValid =
    typeof target.latitude === 'number' &&
    typeof target.longitude === 'number' &&
    !isNaN(target.latitude) &&
    !isNaN(target.longitude) &&
    !(target.latitude === 0 && target.longitude === 0) &&
    target.latitude >= -90 &&
    target.latitude <= 90 &&
    target.longitude >= -180 &&
    target.longitude <= 180;

  const address = (target.address || '').trim();

  if (!isCoordValid && !address) {
    Alert.alert(
      'Location unavailable for this order.',
      'This delivery does not have valid destination coordinates or a delivery address.'
    );
    return;
  }

  const query = isCoordValid
    ? `${target.latitude},${target.longitude}`
    : encodeURIComponent(address);

  // Direct turn-by-turn navigation in Google Maps app with two-wheeler mode (mode=l)
  const navUrl = `google.navigation:q=${query}&mode=l`;
  const webFallback = `https://www.google.com/maps/search/?api=1&query=${query}`;

  // Direct dispatch: Launch native Google Maps navigation intent
  // This circumvents Android 11+ package visibility restrictions of canOpenURL
  try {
    await Linking.openURL(navUrl);
  } catch {
    // Only if the native intent fails (e.g. Google Maps app genuinely not installed), open browser fallback
    try {
      await Linking.openURL(webFallback);
    } catch {
      Alert.alert(
        'Unable to open navigation',
        'Could not open Google Maps app or browser navigation.'
      );
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: DELIVERY DETAIL
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryDetailScreen({
  delivery, onBack, onUpdateStatus, updatingStatus,
}: any) {
  if (!delivery) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <DetailHeader title="Delivery Details" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.cardSub}>No active delivery found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const order      = delivery.order || {};
  const restaurant = order.restaurant || {};
  const address    = order.deliveryAddress || {};
  const customer   = order.user || {};
  const items      = order.items || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title={`Order #${shortId(delivery.orderId || delivery.id)}`} onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ── Status card ── */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={styles.sectionLabel}>DELIVERY STATUS</Text>
          <DeliveryTimeline status={delivery.status} />
          {NEXT_STATUS[delivery.status] && (
            <View style={{ marginTop: 12, gap: 10 }}>
              {NEXT_STATUS[delivery.status].navLabel && (
                <TouchableOpacity
                  style={styles.outlineBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (delivery.status === 'ACCEPTED') {
                      launchGoogleMapsNavigation({
                        name: restaurant.name,
                        latitude: restaurant.latitude,
                        longitude: restaurant.longitude,
                        address: restaurant.address,
                      });
                    } else {
                      const customerAddr = [address.addressLine1, address.area, address.city].filter(Boolean).join(', ');
                      launchGoogleMapsNavigation({
                        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name,
                        latitude: address.latitude,
                        longitude: address.longitude,
                        address: customerAddr,
                      });
                    }
                  }}
                >
                  <Text style={styles.outlineBtnText}>
                    🧭 {NEXT_STATUS[delivery.status].navLabel}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, updatingStatus && { opacity: 0.6 }]}
                onPress={() => onUpdateStatus(delivery.id, NEXT_STATUS[delivery.status].next)}
                disabled={updatingStatus}
                activeOpacity={0.85}
              >
                {updatingStatus
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>
                      {NEXT_STATUS[delivery.status].btnLabel}
                    </Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Restaurant card ── */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={styles.sectionLabel}>📦 PICKUP — RESTAURANT</Text>
          <Text style={[styles.cardTitle, { marginTop: 6, marginBottom: 10 }]}>
            {restaurant.name || 'Restaurant'}
          </Text>
          <View style={{ gap: 8 }}>
            {restaurant.address && (
              <InfoRow icon="📍" label="Address" value={restaurant.address} />
            )}
            {restaurant.phone && (
              <InfoRow icon="📞" label="Phone" value={restaurant.phone} />
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => restaurant.phone && Linking.openURL(`tel:${restaurant.phone}`)}
            >
              <Text style={styles.outlineBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => launchGoogleMapsNavigation({
                name: restaurant.name,
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                address: restaurant.address,
              })}
            >
              <Text style={styles.outlineBtnText}>🧭 Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Customer card ── */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <Text style={styles.sectionLabel}>🏠 DROP — CUSTOMER</Text>
          <Text style={[styles.cardTitle, { marginTop: 6, marginBottom: 10 }]}>
            {customer.firstName || 'Customer'} {customer.lastName || ''}
          </Text>
          <View style={{ gap: 8 }}>
            <InfoRow
              icon="📍"
              label="Delivery Address"
              value={[
                address.addressLine1,
                address.area,
                address.city,
              ].filter(Boolean).join(', ') || 'Delivery Location'}
            />
            {customer.phone && (
              <InfoRow icon="📞" label="Phone" value={customer.phone} />
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => customer.phone && Linking.openURL(`tel:${customer.phone}`)}
            >
              <Text style={styles.outlineBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => {
                const customerAddr = [address.addressLine1, address.area, address.city].filter(Boolean).join(', ');
                launchGoogleMapsNavigation({
                  name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name,
                  latitude: address.latitude,
                  longitude: address.longitude,
                  address: customerAddr,
                });
              }}
            >
              <Text style={styles.outlineBtnText}>🧭 Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Order items ── */}
        {items.length > 0 && (
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={styles.sectionLabel}>🛍️ ORDER ITEMS</Text>
            {items.map((item: any, idx: number) => (
              <View
                key={String(idx)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                  borderBottomColor: C.borderLight,
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontWeight: '600', color: C.text, fontSize: 14 }}>
                    {item.menuItem?.name || item.name || 'Item'}
                  </Text>
                  {item.specialInstructions && (
                    <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                      Note: {item.specialInstructions}
                    </Text>
                  )}
                </View>
                <Text style={{ fontWeight: '600', color: C.textSec }}>×{item.quantity}</Text>
              </View>
            ))}
            {/* Total row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border }}>
              <Text style={{ fontWeight: '700', color: C.text, fontSize: 15 }}>Order Total</Text>
              <Text style={{ fontWeight: '900', color: C.primary, fontSize: 17 }}>
                {fmtCurrency(order.totalAmount || 0)}
              </Text>
            </View>
            <Text style={[styles.cardSub, { marginTop: 4 }]}>
              💳 {order.paymentMethod || 'ONLINE'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: HISTORY
// ─────────────────────────────────────────────────────────────────────────────

function HistoryScreen({
  history, onViewDetail,
}: { history: any[]; onViewDetail: (d: any) => void }) {
  const [tab, setTab] = useState<'completed' | 'cancelled'>('completed');

  const completed = history.filter(h =>
    h.status === 'DELIVERED' || h.status === 'COMPLETED',
  );
  const cancelled = history.filter(h =>
    h.status === 'CANCELLED' || h.status === 'REJECTED',
  );
  const items = tab === 'completed' ? completed : cancelled;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['completed', 'cancelled'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabPill, tab === t && styles.tabPillActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabPillText, tab === t && styles.tabPillTextActive]}>
              {t === 'completed'
                ? `Completed (${completed.length})`
                : `Cancelled (${cancelled.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 14 }}>📋</Text>
          <Text style={[styles.cardTitle, { textAlign: 'center' }]}>No deliveries yet</Text>
          <Text style={[styles.cardSub, { textAlign: 'center', marginTop: 4 }]}>
            {tab === 'completed'
              ? 'Your completed deliveries will appear here'
              : 'No cancelled deliveries'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCompleted = tab === 'completed';
            return (
              <TouchableOpacity
                style={[styles.card, { marginBottom: 12 }]}
                onPress={() => onViewDetail(item)}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.cardTitle}>
                      Order #{shortId(item.orderId || item.id)}
                    </Text>
                    {item.order?.restaurant?.name && (
                      <Text style={[styles.cardSub, { marginTop: 4 }]}>
                        🏪 {item.order.restaurant.name}
                      </Text>
                    )}
                    <Text style={styles.cardSub}>
                      🕐 {fmtDate(item.completedAt || item.createdAt)}
                      {'  '}
                      {fmtTime(item.completedAt || item.createdAt)}
                    </Text>
                    {item.distance && (
                      <Text style={styles.cardSub}>📏 {item.distance} km</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: isCompleted ? C.success : C.danger,
                    }}>
                      {isCompleted ? fmtCurrency(item.earnings || item.deliveryFee || 0) : '—'}
                    </Text>
                    <View style={[styles.pill, {
                      backgroundColor: isCompleted ? C.successBg : C.dangerBg,
                      marginTop: 6,
                    }]}>
                      <Text style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: isCompleted ? C.success : C.danger,
                      }}>
                        {isCompleted ? 'DELIVERED' : 'CANCELLED'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: EARNINGS
// ─────────────────────────────────────────────────────────────────────────────

function EarningsScreen({ earnings, history }: { earnings: any; history: any[] }) {
  const total      = earnings?.totalEarnings    || 0;
  const totalTrips = earnings?.totalDeliveries  || 0;

  const breakdown = [
    { label: 'Delivery Earnings', value: total,  positive: true },
    { label: 'Incentives',        value: 0 },
    { label: 'Tips',              value: 0 },
    { label: 'Adjustments',       value: 0 },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero earnings card */}
      <View style={[styles.card, {
        marginBottom: 16,
        backgroundColor: C.primary,
        borderRadius: 20,
        paddingVertical: 28,
      }]}>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 1 }}>
          TOTAL EARNINGS
        </Text>
        <Text style={{ fontSize: 46, fontWeight: '900', color: '#fff', marginTop: 4, letterSpacing: -1 }}>
          {fmtCurrency(total)}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          {totalTrips} deliveries completed
        </Text>
      </View>

      {/* Period cards */}
      <Text style={styles.sectionTitle}>Period Summary</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {(['TODAY', 'THIS WEEK', 'THIS MONTH'] as const).map(p => (
          <View key={p} style={[styles.card, { flex: 1, alignItems: 'center', paddingVertical: 14 }]}>
            <Text style={{ fontSize: 9, fontWeight: '800', color: C.textMuted, letterSpacing: 0.5 }}>{p}</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, marginTop: 4 }}>—</Text>
          </View>
        ))}
      </View>

      {/* Breakdown */}
      <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
      <View style={[styles.card, { marginBottom: 16 }]}>
        {breakdown.map((row, i) => (
          <View
            key={row.label}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 13,
              borderBottomWidth: i < breakdown.length - 1 ? 1 : 0,
              borderBottomColor: C.borderLight,
            }}
          >
            <Text style={{ fontSize: 14, color: C.textSec }}>{row.label}</Text>
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: row.value < 0 ? C.danger : row.value > 0 ? C.text : C.textMuted,
            }}>
              {row.value < 0 ? '-' : ''}{fmtCurrency(Math.abs(row.value))}
            </Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: C.text }}>Total</Text>
          <Text style={{ fontWeight: '900', fontSize: 18, color: C.primary }}>{fmtCurrency(total)}</Text>
        </View>
      </View>

      {/* Recent deliveries */}
      <Text style={styles.sectionTitle}>Recent Deliveries</Text>
      {history.length === 0 ? (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }]}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>💰</Text>
          <Text style={styles.cardSub}>No completed deliveries yet</Text>
        </View>
      ) : (
        history.slice(0, 10).map((d, i) => (
          <View
            key={String(i)}
            style={[styles.card, {
              marginBottom: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }]}
          >
            <View>
              <Text style={{ fontWeight: '600', color: C.text }}>
                Order #{shortId(d.orderId || d.id)}
              </Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                {fmtDate(d.completedAt || d.createdAt)}
              </Text>
            </View>
            <Text style={{ fontWeight: '800', fontSize: 16, color: C.success }}>
              {fmtCurrency(d.earnings || d.deliveryFee || 0)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: MORE (menu hub)
// ─────────────────────────────────────────────────────────────────────────────

function MoreScreen({
  profile, onNavigate, onLogout,
}: { profile: any; onNavigate: (s: SubScreen) => void; onLogout: () => void }) {
  const menuItems: { icon: string; label: string; sub: string; screen: SubScreen }[] = [
    { icon: '👤', label: 'Profile',               sub: 'View and edit your info',       screen: 'profile' },
    { icon: '📄', label: 'Documents',             sub: 'Licence, vehicle & insurance',  screen: 'documents' },
    { icon: '⭐', label: 'Performance & Rating',  sub: 'Your stats and ratings',        screen: 'performance' },
    { icon: '🆘', label: 'Safety & SOS',          sub: 'Emergency support',             screen: 'safety' },
    { icon: '🎧', label: 'Help & Support',        sub: 'FAQ, contact & issues',         screen: 'help' },
    { icon: '⚙️', label: 'Settings',              sub: 'App preferences',               screen: 'settings' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Partner summary */}
      <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 }]}>
        <View style={styles.avatarMd}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {profile?.firstName} {profile?.lastName || ''}
          </Text>
          {profile?.email && (
            <Text style={styles.cardSub}>{profile.email}</Text>
          )}
          {profile?.vehicleType && (
            <Text style={styles.cardSub}>🛵 {profile.vehicleType}</Text>
          )}
        </View>
      </View>

      {/* Menu items */}
      {menuItems.map(item => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.card, {
            flexDirection: 'row', alignItems: 'center',
            marginBottom: 8, paddingVertical: 16, gap: 14,
          }]}
          onPress={() => onNavigate(item.screen)}
          activeOpacity={0.85}
        >
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{item.label}</Text>
            <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.sub}</Text>
          </View>
          <Text style={{ fontSize: 20, color: C.textMuted }}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={[styles.card, {
          flexDirection: 'row', alignItems: 'center',
          marginTop: 8, paddingVertical: 16, gap: 14,
          borderWidth: 1, borderColor: C.dangerBg,
        }]}
        onPress={onLogout}
        activeOpacity={0.85}
      >
        <View style={[styles.iconCircle, { backgroundColor: C.dangerBg }]}>
          <Text style={{ fontSize: 22 }}>🚪</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.danger, flex: 1 }}>Logout</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 28 }}>
        QuickBite Delivery Partner v2.0
      </Text>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: PROFILE
// ─────────────────────────────────────────────────────────────────────────────

function ProfileScreen({ profile, onBack }: { profile: any; onBack: () => void }) {
  const fields: { label: string; value: string }[] = [
    { label: 'First Name',      value: profile?.firstName    || '—' },
    { label: 'Last Name',       value: profile?.lastName     || '—' },
    { label: 'Email',           value: profile?.email        || '—' },
    { label: 'Phone',           value: profile?.phone        || '—' },
    { label: 'Vehicle Type',    value: profile?.vehicleType  || '—' },
    { label: 'Vehicle Number',  value: profile?.vehicleNumber || '—' },
    { label: 'License Number',  value: profile?.licenseNumber || '—' },
    { label: 'Account Status',  value: profile?.approvalStatus || profile?.status || '—' },
    { label: 'Partner ID',      value: (profile?.id || '—').slice(0, 18) + '…' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="My Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={styles.avatarLg}>
            <Text style={{ fontSize: 52 }}>👤</Text>
          </View>
          <Text style={[styles.cardTitle, { marginTop: 14 }]}>
            {profile?.firstName} {profile?.lastName || ''}
          </Text>
          <View style={[styles.pill, {
            backgroundColor: profile?.isOnline ? C.onlineBg : C.offlineBg,
            marginTop: 8,
          }]}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: profile?.isOnline ? C.online : C.offline }}>
              {profile?.isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Profile fields */}
        <View style={styles.card}>
          {fields.map((field, idx) => (
            <View
              key={field.label}
              style={{
                paddingVertical: 13,
                borderBottomWidth: idx < fields.length - 1 ? 1 : 0,
                borderBottomColor: C.borderLight,
              }}
            >
              <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '700', letterSpacing: 0.6 }}>
                {field.label.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 15, color: C.text, marginTop: 4, fontWeight: '500' }}>
                {field.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

type DocStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED';

function DocumentsScreen({ onBack }: { onBack: () => void }) {
  const docs: { icon: string; name: string; status: DocStatus; note: string }[] = [
    { icon: '🪪', name: 'Driving Licence',      status: 'VERIFIED', note: 'Valid until Dec 2027' },
    { icon: '🚗', name: 'Vehicle Registration', status: 'VERIFIED', note: 'Valid until Mar 2026' },
    { icon: '🛡️', name: 'Vehicle Insurance',    status: 'PENDING',  note: 'Under review' },
    { icon: '🏦', name: 'Bank Account',          status: 'VERIFIED', note: 'Linked & verified' },
  ];
  const dotColor:  Record<DocStatus, string> = { VERIFIED: C.success, PENDING: C.warning, EXPIRED: C.danger };
  const dotBg:     Record<DocStatus, string> = { VERIFIED: C.successBg, PENDING: C.warningBg, EXPIRED: C.dangerBg };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="Documents" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={[styles.cardSub, { marginBottom: 18 }]}>
          Keep your documents current to maintain partner status.
        </Text>
        {docs.map(doc => (
          <View key={doc.name} style={[styles.card, {
            flexDirection: 'row', alignItems: 'center',
            marginBottom: 10, gap: 14,
          }]}>
            <View style={[styles.iconCircle, { backgroundColor: dotBg[doc.status] }]}>
              <Text style={{ fontSize: 22 }}>{doc.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{doc.name}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{doc.note}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: dotBg[doc.status] }]}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: dotColor[doc.status] }}>
                {doc.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────

function PerformanceScreen({ earnings, onBack }: { earnings: any; onBack: () => void }) {
  const stats = [
    { icon: '⭐', label: 'Customer Rating',      value: '—',                                     sub: 'Based on customer reviews', color: C.warning },
    { icon: '✅', label: 'Completed Deliveries', value: String(earnings?.totalDeliveries || 0),  sub: 'All time',                  color: C.success },
    { icon: '📊', label: 'Acceptance Rate',      value: '—%',                                    sub: 'Last 30 days',              color: C.primary },
    { icon: '❌', label: 'Cancellation Rate',    value: '—%',                                    sub: 'Last 30 days',              color: C.danger },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="Performance & Rating" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={[styles.cardSub, { marginBottom: 18 }]}>
          Your metrics are calculated from all completed deliveries.
        </Text>
        {stats.map(stat => (
          <View key={stat.label} style={[styles.card, {
            flexDirection: 'row', alignItems: 'center',
            marginBottom: 10, gap: 14,
          }]}>
            <View style={[styles.iconCircle, { backgroundColor: `${stat.color}22` }]}>
              <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: C.textSec, fontWeight: '600' }}>{stat.label}</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: stat.color, marginTop: 2 }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 11, color: C.textMuted }}>{stat.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: SAFETY & SOS
// ─────────────────────────────────────────────────────────────────────────────

function SafetySOSScreen({ onBack }: { onBack: () => void }) {
  const handleSOS = () => {
    Alert.alert(
      '🆘 SOS Alert',
      'This will notify emergency services and QuickBite support. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS',
          style: 'destructive',
          onPress: () =>
            Alert.alert('SOS Sent', 'Emergency services have been alerted. Stay safe!'),
        },
      ],
    );
  };

  const contacts = [
    { icon: '🚔', name: 'Police',           number: '100' },
    { icon: '🚑', name: 'Ambulance',        number: '108' },
    { icon: '🧑‍💼', name: 'QuickBite Support', number: '1800-QB-HELP' },
  ];

  const tips = [
    '🪖 Always wear your helmet while riding',
    '📱 Do not use your phone while driving',
    '🚦 Follow all traffic rules and signals',
    '⚡ If you feel unsafe, reject the delivery',
    '📍 Share your live location with a trusted contact',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="Safety & SOS" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* SOS Button */}
        <TouchableOpacity
          style={[styles.card, {
            backgroundColor: C.danger, alignItems: 'center',
            paddingVertical: 40, borderRadius: 20, marginBottom: 24,
          }]}
          onPress={handleSOS}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 60 }}>🆘</Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 12, letterSpacing: 1 }}>
            SOS EMERGENCY
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            Tap to alert emergency services
          </Text>
        </TouchableOpacity>

        {/* Emergency contacts */}
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {contacts.map(c => (
          <View key={c.name} style={[styles.card, {
            flexDirection: 'row', alignItems: 'center',
            marginBottom: 8, gap: 14,
          }]}>
            <Text style={{ fontSize: 28 }}>{c.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: C.text, fontSize: 15 }}>{c.name}</Text>
              <Text style={{ color: C.primary, fontWeight: '800', fontSize: 18, marginTop: 2 }}>
                {c.number}
              </Text>
            </View>
            <TouchableOpacity style={styles.callChip} activeOpacity={0.8}>
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13 }}>Call</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Safety tips */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Safety Tips</Text>
        {tips.map(tip => (
          <View key={tip} style={[styles.card, { marginBottom: 8 }]}>
            <Text style={{ fontSize: 14, color: C.textSec, lineHeight: 20 }}>{tip}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: HELP & SUPPORT
// ─────────────────────────────────────────────────────────────────────────────

function HelpSupportScreen({ onBack }: { onBack: () => void }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const contactOptions = [
    { icon: '💬', label: 'Chat with Support',    sub: 'Average response: 5 mins' },
    { icon: '📞', label: 'Call Support',         sub: '1800-QB-HELP · 24/7' },
    { icon: '📧', label: 'Email Support',        sub: 'partners@quickbite.in' },
    { icon: '🎫', label: 'Create Support Ticket', sub: 'Track your issue status' },
  ];

  const issueTypes = [
    { icon: '🚫', label: 'Delivery Issue' },
    { icon: '💳', label: 'Payment Issue' },
    { icon: '👤', label: 'Account Issue' },
    { icon: '🗺️', label: 'Navigation Issue' },
    { icon: '📦', label: 'Order Issue' },
  ];

  const faqs = [
    {
      q: 'How do I get more delivery requests?',
      a: 'Stay online during peak hours (12–2 PM and 7–10 PM) and keep your acceptance rate above 80%.',
    },
    {
      q: 'When do I get paid?',
      a: 'Payouts are processed every Monday. Last week\'s earnings are transferred to your bank account.',
    },
    {
      q: 'What if the restaurant is closed?',
      a: 'Contact support immediately. Do not reject the order without informing us first.',
    },
    {
      q: 'How do I report a customer issue?',
      a: 'Go to Help & Support → Create Support Ticket → select "Customer Issue".',
    },
    {
      q: 'My earnings are incorrect. What do I do?',
      a: 'Contact support with your order ID. We will investigate within 24 hours.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="Help & Support" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Contact options */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        {contactOptions.map(item => (
          <TouchableOpacity
            key={item.label}
            style={[styles.card, {
              flexDirection: 'row', alignItems: 'center',
              marginBottom: 8, gap: 14,
            }]}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: C.text, fontSize: 14 }}>{item.label}</Text>
              <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Text style={{ color: C.textMuted, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Issue types */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Report an Issue</Text>
        {issueTypes.map(item => (
          <TouchableOpacity
            key={item.label}
            style={[styles.card, {
              flexDirection: 'row', alignItems: 'center',
              marginBottom: 8, paddingVertical: 14, gap: 14,
            }]}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            <Text style={{ fontWeight: '600', color: C.text, flex: 1, fontSize: 14 }}>{item.label}</Text>
            <Text style={{ color: C.textMuted, fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, idx) => (
          <TouchableOpacity
            key={String(idx)}
            style={[styles.card, { marginBottom: 8 }]}
            onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontWeight: '600', color: C.text, flex: 1, paddingRight: 10, lineHeight: 20 }}>
                {faq.q}
              </Text>
              <Text style={{ color: C.primary, fontWeight: '700', fontSize: 20 }}>
                {expandedFaq === idx ? '−' : '+'}
              </Text>
            </View>
            {expandedFaq === idx && (
              <Text style={{ color: C.textSec, marginTop: 12, lineHeight: 22, fontSize: 14 }}>
                {faq.a}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN: SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <DetailHeader title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          {[
            {
              label: 'Push Notifications',
              sub: 'New order alerts',
              value: notifEnabled,
              onChange: setNotifEnabled,
            },
            {
              label: 'Sound Alerts',
              sub: 'Play sound for new orders',
              value: soundEnabled,
              onChange: setSoundEnabled,
            },
          ].map((row, idx, arr) => (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                borderBottomColor: C.borderLight,
              }}
            >
              <View>
                <Text style={{ fontWeight: '600', color: C.text }}>{row.label}</Text>
                <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{row.sub}</Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.onChange}
                trackColor={{ false: C.border, true: '#A8E6C3' }}
                thumbColor={row.value ? C.success : C.textMuted}
              />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>App Information</Text>
        <View style={styles.card}>
          {[
            { label: 'Language',     value: 'English' },
            { label: 'App Version',  value: '2.0.0' },
          ].map((item, idx, arr) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                borderBottomColor: C.borderLight,
              }}
            >
              <Text style={{ fontWeight: '500', color: C.text }}>{item.label}</Text>
              <Text style={{ color: C.textSec }}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION: BOTTOM TAB BAR
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'home',       icon: '🏠', label: 'Home' },
  { key: 'deliveries', icon: '🚴', label: 'Deliveries' },
  { key: 'history',    icon: '📋', label: 'History' },
  { key: 'earnings',   icon: '💰', label: 'Earnings' },
  { key: 'more',       icon: '☰',  label: 'More' },
];

function BottomTabBar({
  activeTab, onPress, pendingCount,
}: { activeTab: Tab; onPress: (t: Tab) => void; pendingCount: number }) {
  return (
    <View style={styles.bottomBar}>
      {TABS.map(t => {
        const isActive   = t.key === activeTab;
        const showBadge  = t.key === 'deliveries' && pendingCount > 0;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.bottomTab}
            onPress={() => onPress(t.key)}
            activeOpacity={0.7}
          >
            {/* Active top indicator */}
            {isActive && <View style={styles.tabIndicator} />}

            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22, textAlign: 'center' }}>{t.icon}</Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>
                    {pendingCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && { color: C.tabActive, fontWeight: '700' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────

export default function DeliveryApp() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<any>(null);

  // ── Navigation ──────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<Tab>('home');
  const [screenStack,  setScreenStack]  = useState<StackEntry[]>([]);

  // ── Data ────────────────────────────────────────────────────────────────
  const [profile,        setProfile]        = useState<any>(null);
  const [isOnline,       setIsOnline]        = useState(false);
  const [togglingOnline, setTogglingOnline]  = useState(false);
  const [activeDelivery, setActiveDelivery]  = useState<any>(null);
  const [pendingRequests,setPendingRequests] = useState<any[]>([]);
  const [earnings,       setEarnings]        = useState<any>(null);
  const [history,        setHistory]         = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus]  = useState(false);
  const [loadingData,    setLoadingData]     = useState(true);

  // ── Configure API client ────────────────────────────────────────────────
  useEffect(() => {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    const apiBase = win && win.location?.hostname
      ? `http://${win.location.hostname}:3000/api`
      : 'http://10.0.2.2:3000/api';

    configureApiClient({
      baseUrl: apiBase,
      getToken: async () => _token,
    });
  }, []);

  // ── Core data polling (10 s) ────────────────────────────────────────────
  const loadCoreData = useCallback(async () => {
    if (!user) return;
    try {
      const [profileRes, activeRes, pendingRes] = await Promise.all([
        deliveryApi.getProfile().catch(() => ({ data: null })),
        deliveryApi.getActiveAssignment().catch(() => ({ data: null })),
        deliveryApi.getPendingAssignments().catch(() => ({ data: [] })),
      ]);

      const raw = profileRes.data as any;
      if (raw) {
        const p = {
          ...raw,
          firstName: raw.user?.profile?.firstName || raw.firstName || user?.firstName || 'Delivery',
          lastName: raw.user?.profile?.lastName || raw.lastName || user?.lastName || 'Partner',
          phone: raw.user?.phone || raw.phone || user?.phone || '',
          email: raw.user?.email || raw.email || user?.email || '',
        };
        setProfile(p);
        setIsOnline(raw.isOnline ?? false);
      }

      const ad = activeRes.data as any;
      setActiveDelivery(ad || null);

      const pd = pendingRes.data as any;
      setpending(pd);
    } catch {
      // silently ignore network errors during polling
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  const setpending = (pd: any) => {
    const list = Array.isArray(pd)
      ? pd
      : pd?.items || [];
    setPendingRequests(list);
  };

  useEffect(() => {
    if (!user) return;
    loadCoreData();
    const t = setInterval(loadCoreData, 10_000);
    return () => clearInterval(t);
  }, [user, loadCoreData]);

  // ── Earnings + history (loaded once on login) ────────────────────────────
  const loadEarningsAndHistory = useCallback(async () => {
    if (!user) return;
    const [e, h] = await Promise.all([
      deliveryApi.getEarnings().catch(() => ({ data: null })),
      deliveryApi.getHistory().catch(() => ({ data: [] })),
    ]);
    setEarnings(e.data);
    const hd = h.data as any;
    setHistory(Array.isArray(hd) ? hd : hd?.items || []);
  }, [user]);

  useEffect(() => {
    loadEarningsAndHistory();
  }, [loadEarningsAndHistory]);

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const d   = res.data as any;
    _token    = d.tokens?.accessToken || d.accessToken;
    setUser(d.user);
  };

  // ── Online toggle ────────────────────────────────────────────────────────
  const handleToggleOnline = async (val: boolean) => {
    setTogglingOnline(true);
    try {
      await deliveryApi.toggleOnline(val);
      setIsOnline(val);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  // ── Accept delivery ──────────────────────────────────────────────────────
  const handleAccept = async (id: string) => {
    try {
      await deliveryApi.updateAssignmentStatus(id, 'ACCEPTED');
      await loadCoreData();
      Alert.alert('Accepted! 🎉', 'Head to the restaurant to collect the order.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not accept delivery');
    }
  };

  // ── Reject delivery ──────────────────────────────────────────────────────
  const handleReject = (id: string) => {
    Alert.alert('Reject Delivery?', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await deliveryApi.updateAssignmentStatus(id, 'REJECTED');
            await loadCoreData();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not reject delivery');
          }
        },
      },
    ]);
  };

  // ── Update delivery status ───────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      await deliveryApi.updateAssignmentStatus(id, status);
      await loadCoreData();
      if (status === 'DELIVERED') {
        await loadEarningsAndHistory();
        Alert.alert('Delivered! 🎉', 'Great work! The delivery is complete.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Navigation helpers ───────────────────────────────────────────────────
  const push = (screen: SubScreen, data?: any) => {
    setScreenStack(prev => [...prev, { screen, data }]);
  };

  const pop = () => {
    setScreenStack(prev => prev.slice(0, -1));
  };

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    setScreenStack([]); // clear stack on tab switch
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          _token = null;
          setUser(null);
          setProfile(null);
          setActiveDelivery(null);
          setPendingRequests([]);
          setEarnings(null);
          setHistory([]);
          setScreenStack([]);
          setActiveTab('home');
          setIsOnline(false);
        },
      },
    ]);
  };

  // ── Today stats (derived) ────────────────────────────────────────────────
  const todayStats = {
    earnings: earnings?.todayEarnings  || 0,
    completed: earnings?.todayDeliveries || 0,
    rating: earnings?.rating           || null,
  };

  // ── Render: unauthenticated ───────────────────────────────────────────────
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // ── Render: sub-screen stack ─────────────────────────────────────────────
  if (screenStack.length > 0) {
    const top = screenStack[screenStack.length - 1];

    switch (top.screen) {
      case 'delivery-detail':
        return (
          <DeliveryDetailScreen
            delivery={activeDelivery}
            onBack={pop}
            onUpdateStatus={handleUpdateStatus}
            updatingStatus={updatingStatus}
          />
        );

      case 'history-detail':
        return (
          <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <DetailHeader
              title={`Order #${shortId(top.data?.orderId || top.data?.id)}`}
              onBack={pop}
            />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View style={[styles.card, { gap: 14 }]}>
                <Text style={styles.sectionLabel}>ORDER DETAILS</Text>
                <InfoRow icon="🏪" label="Restaurant" value={top.data?.order?.restaurant?.name || '—'} />
                <InfoRow icon="📅" label="Date"       value={fmtDate(top.data?.completedAt || top.data?.createdAt)} />
                <InfoRow icon="⏰" label="Time"       value={fmtTime(top.data?.completedAt || top.data?.createdAt)} />
                <InfoRow icon="💰" label="Earnings"   value={fmtCurrency(top.data?.earnings || top.data?.deliveryFee || 0)} bold />
                <InfoRow icon="📊" label="Status"     value={top.data?.status || '—'} />
                {top.data?.distance && (
                  <InfoRow icon="📏" label="Distance" value={`${top.data.distance} km`} />
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        );

      case 'profile':
        return <ProfileScreen      profile={profile}  onBack={pop} />;
      case 'documents':
        return <DocumentsScreen                       onBack={pop} />;
      case 'performance':
        return <PerformanceScreen  earnings={earnings} onBack={pop} />;
      case 'safety':
        return <SafetySOSScreen                       onBack={pop} />;
      case 'help':
        return <HelpSupportScreen                     onBack={pop} />;
      case 'settings':
        return <SettingsScreen                        onBack={pop} />;

      default:
        pop();
        return null;
    }
  }

  // ── Render: main tabs ─────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <ScreenHeader title="QuickBite Fleet" />
            <HomeScreen
              profile={profile}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              togglingOnline={togglingOnline}
              activeDelivery={activeDelivery}
              pendingRequests={pendingRequests}
              todayStats={todayStats}
              onAccept={handleAccept}
              onReject={handleReject}
              onViewDelivery={() => push('delivery-detail')}
              loadingData={loadingData}
            />
          </>
        );
      case 'deliveries':
        return (
          <>
            <ScreenHeader title="Deliveries" />
            <DeliveriesScreen
              isOnline={isOnline}
              activeDelivery={activeDelivery}
              pendingRequests={pendingRequests}
              updatingStatus={updatingStatus}
              onAccept={handleAccept}
              onReject={handleReject}
              onUpdateStatus={handleUpdateStatus}
              onViewDetail={() => push('delivery-detail')}
            />
          </>
        );
      case 'history':
        return (
          <>
            <ScreenHeader title="History" />
            <HistoryScreen
              history={history}
              onViewDetail={(d: any) => push('history-detail', d)}
            />
          </>
        );
      case 'earnings':
        return (
          <>
            <ScreenHeader title="Earnings" />
            <EarningsScreen earnings={earnings} history={history} />
          </>
        );
      case 'more':
        return (
          <>
            <ScreenHeader title="More" />
            <MoreScreen
              profile={profile}
              onNavigate={(screen: SubScreen) => push(screen)}
              onLogout={handleLogout}
            />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>
      <BottomTabBar
        activeTab={activeTab}
        onPress={handleTabPress}
        pendingCount={pendingRequests.length}
      />
    </SafeAreaView>
  );
}

registerRootComponent(DeliveryApp);

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
  },
  cardSub: {
    fontSize: 13,
    color: C.textSec,
    marginTop: 2,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  dangerOutlineBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.danger,
    backgroundColor: C.dangerBg,
  },
  dangerOutlineBtnText: {
    color: C.danger,
    fontWeight: '800',
    fontSize: 16,
  },
  outlineBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  outlineBtnText: {
    color: C.text,
    fontWeight: '600',
    fontSize: 14,
  },
  callChip: {
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.text,
    backgroundColor: C.bg,
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  loginLogoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1,
  },
  loginCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  loginFormTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  loginFormSub: {
    fontSize: 14,
    color: C.textSec,
    marginBottom: 20,
  },

  // ── Home ──────────────────────────────────────────────────────────────────
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  homeGreetingLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.textMuted,
    letterSpacing: 1.5,
  },
  homeName: {
    fontSize: 22,
    fontWeight: '900',
    color: C.text,
    marginTop: 3,
  },

  // ── Status ────────────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.text,
    letterSpacing: 0.3,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.textMuted,
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  // ── Timeline ──────────────────────────────────────────────────────────────
  tDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    marginVertical: 2,
  },

  // ── History tabs ──────────────────────────────────────────────────────────
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  tabPillActive: {
    backgroundColor: C.primaryLight,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSec,
  },
  tabPillTextActive: {
    color: C.primary,
    fontWeight: '800',
  },

  // ── Bottom tab bar ────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 12,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    color: C.tabInactive,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: C.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  // ── Screen header ─────────────────────────────────────────────────────────
  screenHeader: {
    backgroundColor: C.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  screenHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -0.3,
  },

  // ── Detail header ─────────────────────────────────────────────────────────
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  detailHeaderTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Avatars & icon circles ────────────────────────────────────────────────
  avatarMd: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
