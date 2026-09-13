'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, restaurantsApi } from '@quickbite/api-client';

export interface PendingAlertOrder {
  id: string;
  customer?: string;
  itemsCount: number;
  items?: Array<{ name: string; qty?: number; quantity?: number; price?: number }>;
  total: number;
  paymentMethod: string;
  createdAt: string;
  restaurantId?: string;
  restaurantName?: string;
}

interface OrderSoundAlertContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (vol: number) => void;
  repeatReminder: boolean;
  setRepeatReminder: (repeat: boolean) => void;
  isAudioUnlocked: boolean;
  unlockAudio: () => Promise<void>;
  pendingAlertOrders: PendingAlertOrder[];
  isAlertModalOpen: boolean;
  dismissAlertModal: () => void;
  acceptOrderFromAlert: (orderId: string) => Promise<void>;
  rejectOrderFromAlert: (orderId: string, reason?: string) => Promise<void>;
  testSound: () => void;
  requestBrowserNotificationPermission: () => Promise<NotificationPermission>;
  notificationPermission: NotificationPermission | 'default';
}

const OrderSoundAlertContext = createContext<OrderSoundAlertContextType | undefined>(undefined);

// Web Audio API Synthesizer for high-fidelity order bell chimes
function playChime(volume = 0.8, isRepeat = false) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    masterGain.connect(ctx.destination);

    if (!isRepeat) {
      // 3-tone harmonic celebratory restaurant order bell chime
      const tones = [
        { freq1: 587.33, freq2: 880.0, start: 0.0, dur: 0.35 }, // D5 + A5
        { freq1: 783.99, freq2: 1174.66, start: 0.18, dur: 0.4 }, // G5 + D6
        { freq1: 1046.5, freq2: 1567.98, start: 0.36, dur: 0.8 }, // C6 + G6
      ];

      tones.forEach(t => {
        // Oscillator 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(t.freq1, now + t.start);
        gain1.gain.setValueAtTime(0.001, now + t.start);
        gain1.gain.exponentialRampToValueAtTime(0.6, now + t.start + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc1.start(now + t.start);
        osc1.stop(now + t.start + t.dur + 0.05);

        // Oscillator 2 (harmonics)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(t.freq2, now + t.start);
        gain2.gain.setValueAtTime(0.001, now + t.start);
        gain2.gain.exponentialRampToValueAtTime(0.3, now + t.start + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(now + t.start);
        osc2.stop(now + t.start + t.dur + 0.05);
      });
    } else {
      // Shorter 2-tone gentle repeat reminder
      const tones = [
        { freq1: 880.0, freq2: 1320.0, start: 0.0, dur: 0.3 },
        { freq1: 1174.66, freq2: 1760.0, start: 0.15, dur: 0.5 },
      ];

      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq1, now + t.start);
        gain.gain.setValueAtTime(0.001, now + t.start);
        gain.gain.exponentialRampToValueAtTime(0.4, now + t.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur + 0.05);
      });
    }
  } catch (err) {
    console.warn('Audio playback error', err);
  }
}

export function OrderSoundAlertProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [repeatReminder, setRepeatReminderState] = useState<boolean>(true);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [pendingAlertOrders, setPendingAlertOrders] = useState<PendingAlertOrder[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');

  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadCompletedRef = useRef<boolean>(false);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem('qb_restaurant_sound_enabled');
      if (savedSound !== null) setSoundEnabledState(savedSound === 'true');

      const savedVol = localStorage.getItem('qb_restaurant_sound_volume');
      if (savedVol !== null) setVolumeState(parseFloat(savedVol));

      const savedRepeat = localStorage.getItem('qb_restaurant_repeat_reminder');
      if (savedRepeat !== null) setRepeatReminderState(savedRepeat === 'true');

      const audioUnlocked = localStorage.getItem('qb_restaurant_audio_unlocked');
      if (audioUnlocked === 'true') setIsAudioUnlocked(true);

      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch {}
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('qb_restaurant_sound_enabled', String(enabled));
    } catch {}
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    try {
      localStorage.setItem('qb_restaurant_sound_volume', String(vol));
    } catch {}
  };

  const setRepeatReminder = (repeat: boolean) => {
    setRepeatReminderState(repeat);
    try {
      localStorage.setItem('qb_restaurant_repeat_reminder', String(repeat));
    } catch {}
  };

  // Unlock AudioContext via user interaction
  const unlockAudio = useCallback(async () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        await ctx.resume();
      }
      setIsAudioUnlocked(true);
      localStorage.setItem('qb_restaurant_audio_unlocked', 'true');
      playChime(volume, false);
    } catch (e) {
      console.warn('Failed to unlock audio context', e);
    }
  }, [volume]);

  // Request browser notification permissions
  const requestBrowserNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        return res;
      } catch {
        return 'default';
      }
    }
    return 'default';
  };

  // Test sound function
  const testSound = useCallback(() => {
    if (!soundEnabled) return;
    playChime(volume, false);
  }, [soundEnabled, volume]);

  // Trigger alert when genuine new PENDING orders arrive
  const triggerNewOrderAlert = useCallback((newOrders: PendingAlertOrder[]) => {
    if (!newOrders || newOrders.length === 0) return;

    // Add to pending alert queue
    setPendingAlertOrders(prev => {
      const existingIds = new Set(prev.map(o => o.id));
      const additions = newOrders.filter(o => !existingIds.has(o.id));
      return [...additions, ...prev];
    });

    setIsAlertModalOpen(true);

    // Play Sound ONCE for batch
    if (soundEnabled) {
      playChime(volume, false);
    }

    // Trigger Desktop / Background Notification if in background
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if (document.hidden) {
        const title = newOrders.length === 1
          ? `🔔 New Order #${newOrders[0].id}`
          : `🔔 ${newOrders.length} New QuickBites Orders!`;
        const body = newOrders.length === 1
          ? `₹${newOrders[0].total} · ${newOrders[0].itemsCount} Items · ${newOrders[0].paymentMethod}`
          : `Total ${newOrders.length} orders pending confirmation. Tap to accept!`;

        try {
          const n = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'quickbites-new-order',
          });
          n.onclick = () => {
            window.focus();
            router.push('/restaurant/orders');
          };
        } catch {}
      }
    }
  }, [soundEnabled, volume, router]);

  // Fetch restaurant ID
  useEffect(() => {
    const fetchRest = async () => {
      try {
        const res = await restaurantsApi.list();
        const d = res.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          setRestaurantId(list[0].id);
        }
      } catch {}
    };
    fetchRest();
  }, []);

  // Check for new orders (Real-time polling & local synchronization)
  const checkIncomingOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      // 1. Check API orders
      const res = await ordersApi.getRestaurantOrders(restaurantId);
      const d = res.data as any;
      const apiOrders: any[] = d.items || d || [];

      // 2. Check localStorage cross-app orders
      let localOrders: any[] = [];
      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) localOrders = JSON.parse(stored);
      } catch {}

      // Combine orders
      const allOrders = [...apiOrders, ...localOrders];

      // On Initial load, mark all existing orders as SEEN without playing alert
      if (!initialLoadCompletedRef.current) {
        allOrders.forEach(o => {
          if (o.id) seenOrderIdsRef.current.add(String(o.id));
        });
        initialLoadCompletedRef.current = true;
        return;
      }

      // Filter for genuinely new PENDING orders for this restaurant
      const freshPending: PendingAlertOrder[] = [];

      allOrders.forEach(o => {
        const id = String(o.id || '');
        const isThisRest = !o.restaurantId || o.restaurantId === restaurantId || o.restaurant?.id === restaurantId;
        const isPending = o.status === 'PENDING' || o.status === 'NEW';

        if (id && isThisRest && isPending && !seenOrderIdsRef.current.has(id)) {
          seenOrderIdsRef.current.add(id);
          freshPending.push({
            id,
            customer: o.customer?.name || o.customer || 'Customer',
            itemsCount: Array.isArray(o.items) ? o.items.length : (o.itemsCount || 1),
            items: o.items || [],
            total: o.total || 0,
            paymentMethod: o.paymentMethod || 'UPI',
            createdAt: o.createdAt || new Date().toISOString(),
            restaurantId: o.restaurantId || restaurantId,
            restaurantName: o.restaurantName || o.restaurant?.name || 'QuickBite Bistro',
          });
        }
      });

      if (freshPending.length > 0) {
        triggerNewOrderAlert(freshPending);
      }
    } catch {
      // Non-blocking fallback
    }
  }, [restaurantId, triggerNewOrderAlert]);

  // Set up periodic check (every 5 seconds)
  useEffect(() => {
    if (!restaurantId) return;
    checkIncomingOrders();
    const interval = setInterval(checkIncomingOrders, 5000);
    return () => clearInterval(interval);
  }, [restaurantId, checkIncomingOrders]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'qb_customer_orders' || e.key === 'qb_trigger_new_order') {
        checkIncomingOrders();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkIncomingOrders]);

  // Handle Repeat Reminder Chime Loop (every 20s while PENDING orders remain)
  useEffect(() => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }

    if (pendingAlertOrders.length > 0 && soundEnabled && repeatReminder && isAlertModalOpen) {
      repeatTimerRef.current = setInterval(() => {
        playChime(volume, true);
      }, 20000);
    }

    return () => {
      if (repeatTimerRef.current) {
        clearInterval(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }
    };
  }, [pendingAlertOrders.length, soundEnabled, repeatReminder, isAlertModalOpen, volume]);

  const dismissAlertModal = () => {
    setIsAlertModalOpen(false);
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  const acceptOrderFromAlert = async (orderId: string) => {
    try {
      // Update backend / local state
      try {
        await ordersApi.updateStatus(orderId, 'CONFIRMED');
      } catch {}

      // Update localStorage
      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((o: any) =>
            o.id === orderId ? { ...o, status: 'CONFIRMED' } : o
          );
          localStorage.setItem('qb_customer_orders', JSON.stringify(updated));
        }
      } catch {}

      // Remove from alert queue
      setPendingAlertOrders(prev => {
        const next = prev.filter(o => o.id !== orderId);
        if (next.length === 0) setIsAlertModalOpen(false);
        return next;
      });

      // Dispatch local event for page refresh
      window.dispatchEvent(new CustomEvent('qb:order_status_updated', { detail: { orderId, status: 'CONFIRMED' } }));
    } catch (err) {
      console.error('Failed to accept order from alert', err);
    }
  };

  const rejectOrderFromAlert = async (orderId: string, reason = 'Kitchen too busy') => {
    try {
      try {
        await ordersApi.updateStatus(orderId, 'CANCELLED');
      } catch {}

      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((o: any) =>
            o.id === orderId ? { ...o, status: 'CANCELLED', cancelReason: reason } : o
          );
          localStorage.setItem('qb_customer_orders', JSON.stringify(updated));
        }
      } catch {}

      setPendingAlertOrders(prev => {
        const next = prev.filter(o => o.id !== orderId);
        if (next.length === 0) setIsAlertModalOpen(false);
        return next;
      });

      window.dispatchEvent(new CustomEvent('qb:order_status_updated', { detail: { orderId, status: 'CANCELLED' } }));
    } catch (err) {
      console.error('Failed to reject order from alert', err);
    }
  };

  return (
    <OrderSoundAlertContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        volume,
        setVolume,
        repeatReminder,
        setRepeatReminder,
        isAudioUnlocked,
        unlockAudio,
        pendingAlertOrders,
        isAlertModalOpen,
        dismissAlertModal,
        acceptOrderFromAlert,
        rejectOrderFromAlert,
        testSound,
        requestBrowserNotificationPermission,
        notificationPermission,
      }}
    >
      {children}
    </OrderSoundAlertContext.Provider>
  );
}

export function useOrderSoundAlert() {
  const ctx = useContext(OrderSoundAlertContext);
  if (!ctx) {
    throw new Error('useOrderSoundAlert must be used within an OrderSoundAlertProvider');
  }
  return ctx;
}
