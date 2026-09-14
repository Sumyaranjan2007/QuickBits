'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, updateOrderStatusInSupabase } from '../lib/supabase';

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
  alertDuration: number;
  setAlertDuration: (seconds: number) => void;
  repeatReminder: boolean;
  setRepeatReminder: (repeat: boolean) => void;
  isAudioUnlocked: boolean;
  unlockAudio: () => Promise<void>;
  pendingAlertOrders: PendingAlertOrder[];
  isAlertModalOpen: boolean;
  isPlayingAlert: boolean;
  remainingAlertSeconds: number;
  dismissAlertModal: () => void;
  acceptOrderFromAlert: (orderId: string) => Promise<void>;
  rejectOrderFromAlert: (orderId: string, reason?: string) => Promise<void>;
  testSound: () => void;
  stopSound: () => void;
  requestBrowserNotificationPermission: () => Promise<NotificationPermission>;
  notificationPermission: NotificationPermission | 'default';
}

const OrderSoundAlertContext = createContext<OrderSoundAlertContextType | undefined>(undefined);

// Web Audio API Sound Engine managing the 15-second attention-grabbing alert loop
class OrderAudioEngine {
  private ctx: AudioContext | null = null;
  private loopTimer: NodeJS.Timeout | null = null;
  private stopTimeout: NodeJS.Timeout | null = null;
  private countdownTimer: NodeJS.Timeout | null = null;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single harmonic food-order chime
  public playSingleChime(volume = 0.8, isGentleReminder = false) {
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
    gain.connect(ctx.destination);

    if (!isGentleReminder) {
      // 3-tone bright restaurant bell (D5 -> G5 -> C6)
      const tones = [
        { f1: 587.33, f2: 880.0, start: 0.0, dur: 0.3 },
        { f1: 783.99, f2: 1174.66, start: 0.15, dur: 0.35 },
        { f1: 1046.5, f2: 1567.98, start: 0.3, dur: 0.7 },
      ];

      tones.forEach(t => {
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(t.f1, now + t.start);
        g1.gain.setValueAtTime(0.001, now + t.start);
        g1.gain.exponentialRampToValueAtTime(0.7, now + t.start + 0.015);
        g1.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc1.connect(g1);
        g1.connect(gain);
        osc1.start(now + t.start);
        osc1.stop(now + t.start + t.dur + 0.05);

        // Harmonic overtone
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(t.f2, now + t.start);
        g2.gain.setValueAtTime(0.001, now + t.start);
        g2.gain.exponentialRampToValueAtTime(0.35, now + t.start + 0.015);
        g2.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc2.connect(g2);
        g2.connect(gain);
        osc2.start(now + t.start);
        osc2.stop(now + t.start + t.dur + 0.05);
      });
    } else {
      // Gentle 2-tone reminder
      const tones = [
        { f1: 880.0, f2: 1320.0, start: 0.0, dur: 0.25 },
        { f1: 1174.66, f2: 1760.0, start: 0.15, dur: 0.45 },
      ];
      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.f1, now + t.start);
        g.gain.setValueAtTime(0.001, now + t.start);
        g.gain.exponentialRampToValueAtTime(0.4, now + t.start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
        osc.connect(g);
        g.connect(gain);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur + 0.05);
      });
    }
  }

  // Start the 15-second (or configured duration) continuous rhythmic alert
  public startContinuousAlert(
    durationSeconds = 15,
    volume = 0.8,
    onTick?: (remaining: number) => void,
    onFinish?: () => void
  ) {
    this.stop(); // Stop any previous playback

    let remaining = Math.max(15, durationSeconds);
    if (onTick) onTick(remaining);

    // Play first chime immediately
    this.playSingleChime(volume, false);

    // Repeat chime rhythmically every 1.35 seconds
    this.loopTimer = setInterval(() => {
      this.playSingleChime(volume, false);
    }, 1350);

    // Countdown timer for UI
    this.countdownTimer = setInterval(() => {
      remaining -= 1;
      if (onTick) onTick(remaining);
      if (remaining <= 0) {
        if (this.countdownTimer) clearInterval(this.countdownTimer);
      }
    }, 1000);

    // Auto-stop after full duration (minimum 15 seconds)
    this.stopTimeout = setTimeout(() => {
      this.stop();
      if (onFinish) onFinish();
    }, Math.max(15, durationSeconds) * 1000);
  }

  // Immediately stop all audio output
  public stop() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}

const audioEngine = new OrderAudioEngine();

export function OrderSoundAlertProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [alertDuration, setAlertDurationState] = useState<number>(15); // Minimum 15s
  const [repeatReminder, setRepeatReminderState] = useState<boolean>(true);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [pendingAlertOrders, setPendingAlertOrders] = useState<PendingAlertOrder[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isPlayingAlert, setIsPlayingAlert] = useState<boolean>(false);
  const [remainingAlertSeconds, setRemainingAlertSeconds] = useState<number>(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'default'>('default');

  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadCompletedRef = useRef<boolean>(false);
  const repeatReminderTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem('qb_restaurant_sound_enabled');
      if (savedSound !== null) setSoundEnabledState(savedSound === 'true');

      const savedVol = localStorage.getItem('qb_restaurant_sound_volume');
      if (savedVol !== null) setVolumeState(parseFloat(savedVol));

      const savedDur = localStorage.getItem('qb_restaurant_alert_duration');
      if (savedDur !== null) setAlertDurationState(Math.max(15, parseInt(savedDur, 10)));

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
    if (!enabled) audioEngine.stop();
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

  const setAlertDuration = (seconds: number) => {
    const valid = Math.max(15, seconds); // Minimum 15s rule enforced
    setAlertDurationState(valid);
    try {
      localStorage.setItem('qb_restaurant_alert_duration', String(valid));
    } catch {}
  };

  const setRepeatReminder = (repeat: boolean) => {
    setRepeatReminderState(repeat);
    try {
      localStorage.setItem('qb_restaurant_repeat_reminder', String(repeat));
    } catch {}
  };

  // Stop audio immediately
  const stopSound = useCallback(() => {
    audioEngine.stop();
    setIsPlayingAlert(false);
    setRemainingAlertSeconds(0);
  }, []);

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
      audioEngine.playSingleChime(volume, false);
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

  // Test sound function (Plays 15-second sound pattern)
  const testSound = useCallback(() => {
    if (isPlayingAlert) {
      stopSound();
      return;
    }
    if (!soundEnabled) return;

    setIsPlayingAlert(true);
    audioEngine.startContinuousAlert(
      alertDuration,
      volume,
      remaining => setRemainingAlertSeconds(remaining),
      () => {
        setIsPlayingAlert(false);
        setRemainingAlertSeconds(0);
      }
    );
  }, [soundEnabled, volume, alertDuration, isPlayingAlert, stopSound]);

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

    // Play 15-SECOND CONTINUOUS SOUND ALERT ONCE for the batch
    if (soundEnabled) {
      setIsPlayingAlert(true);
      audioEngine.startContinuousAlert(
        alertDuration,
        volume,
        remaining => setRemainingAlertSeconds(remaining),
        () => {
          setIsPlayingAlert(false);
          setRemainingAlertSeconds(0);
        }
      );
    }

    // Trigger Desktop / Background Notification if tab is hidden
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if (document.hidden) {
        const title = newOrders.length === 1
          ? `🔔 New QuickBites Order #${newOrders[0].id}`
          : `🔔 ${newOrders.length} New QuickBites Orders!`;
        const body = newOrders.length === 1
          ? `₹${newOrders[0].total} · ${newOrders[0].itemsCount} Items · ${newOrders[0].paymentMethod}`
          : `Total ${newOrders.length} orders pending acceptance. Tap to confirm!`;

        try {
          const n = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'quickbites-new-order',
            requireInteraction: true,
          });
          n.onclick = () => {
            window.focus();
            router.push('/restaurant/orders');
          };
        } catch {}
      }
    }
  }, [soundEnabled, volume, alertDuration, router]);

  // Initialize Seen Orders from Supabase so no audio triggers on page refresh/reconnect
  useEffect(() => {
    const initSeenOrders = async () => {
      try {
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id');

        if (existingOrders) {
          existingOrders.forEach((o) => {
            if (o.id) seenOrderIdsRef.current.add(String(o.id));
          });
        }
      } catch (err) {
        console.warn('Initial order alert sync notice:', err);
      } finally {
        initialLoadCompletedRef.current = true;
      }
    };
    initSeenOrders();

    // Subscribe to Supabase Realtime for genuinely new PENDING orders
    const channel = supabase
      .channel('sound-alert-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as any;
          if (!newOrder || !newOrder.id) return;

          const orderId = String(newOrder.id);
          const isPending = newOrder.status === 'PENDING' || newOrder.status === 'NEW';

          if (isPending && !seenOrderIdsRef.current.has(orderId)) {
            seenOrderIdsRef.current.add(orderId);

            const alertItem: PendingAlertOrder = {
              id: orderId,
              customer: newOrder.customer_name || 'Customer',
              itemsCount: 1,
              items: [],
              total: Number(newOrder.total) || 0,
              paymentMethod: newOrder.payment_method || 'UPI',
              createdAt: newOrder.created_at || new Date().toISOString(),
              restaurantId: newOrder.restaurant_id || 'sharief-bhai',
              restaurantName: 'Restaurant Kitchen',
            };

            triggerNewOrderAlert([alertItem]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerNewOrderAlert]);

  // Repeating Reminder Chime Loop (every 30s while PENDING orders remain after initial alert)
  useEffect(() => {
    if (repeatReminderTimerRef.current) {
      clearInterval(repeatReminderTimerRef.current);
      repeatReminderTimerRef.current = null;
    }

    // Only start 30s reminders if there are pending orders and the initial 15s alert is not currently active
    if (pendingAlertOrders.length > 0 && soundEnabled && repeatReminder && !isPlayingAlert) {
      repeatReminderTimerRef.current = setInterval(() => {
        audioEngine.playSingleChime(volume, true);
      }, 30000);
    }

    return () => {
      if (repeatReminderTimerRef.current) {
        clearInterval(repeatReminderTimerRef.current);
        repeatReminderTimerRef.current = null;
      }
    };
  }, [pendingAlertOrders.length, soundEnabled, repeatReminder, isPlayingAlert, volume]);

  const dismissAlertModal = () => {
    stopSound();
    setIsAlertModalOpen(false);
  };

  const acceptOrderFromAlert = async (orderId: string) => {
    try {
      stopSound(); // STOP SOUND IMMEDIATELY ON ACCEPT

      // Update Supabase backend
      try {
        await updateOrderStatusInSupabase(orderId, 'CONFIRMED');
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
        if (next.length === 0) {
          setIsAlertModalOpen(false);
          if (repeatReminderTimerRef.current) {
            clearInterval(repeatReminderTimerRef.current);
            repeatReminderTimerRef.current = null;
          }
        }
        return next;
      });

      window.dispatchEvent(new CustomEvent('qb:order_status_updated', { detail: { orderId, status: 'CONFIRMED' } }));
    } catch (err) {
      console.error('Failed to accept order from alert', err);
    }
  };

  const rejectOrderFromAlert = async (orderId: string, reason = 'Kitchen too busy') => {
    try {
      stopSound(); // STOP SOUND IMMEDIATELY ON REJECT

      try {
        await updateOrderStatusInSupabase(orderId, 'CANCELLED', reason);
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
        if (next.length === 0) {
          setIsAlertModalOpen(false);
          if (repeatReminderTimerRef.current) {
            clearInterval(repeatReminderTimerRef.current);
            repeatReminderTimerRef.current = null;
          }
        }
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
        alertDuration,
        setAlertDuration,
        repeatReminder,
        setRepeatReminder,
        isAudioUnlocked,
        unlockAudio,
        pendingAlertOrders,
        isAlertModalOpen,
        isPlayingAlert,
        remainingAlertSeconds,
        dismissAlertModal,
        acceptOrderFromAlert,
        rejectOrderFromAlert,
        testSound,
        stopSound,
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
