'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, reviewsApi } from '@quickbite/api-client';

const STAGES = [
  { key: 'PENDING', title: 'Order Placed', desc: 'Order received by restaurant', icon: '📝' },
  { key: 'PREPARING', title: 'Preparing Food', desc: 'Chef is preparing your meal', icon: '🍳' },
  { key: 'READY', title: 'Driver Assigned', desc: 'Amit Verma reached restaurant', icon: '🛵' },
  { key: 'OUT_FOR_DELIVERY', title: 'On the Way', desc: 'Driver is en route to you', icon: '🚀' },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Enjoy your delicious meal!', icon: '🎉' },
];

const QUICK_REPLIES = [
  'Where are you right now? 📍',
  'Please do not ring the doorbell 🤫',
  'Leave at the security / main gate 🚪',
  'Call me when you reach 📞',
  'I am waiting outside 🏠',
];

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = (params?.id as string) || 'QB-982144';

  const [currentStageIndex, setCurrentStageIndex] = useState(1);
  const [etaMinutes, setEtaMinutes] = useState(22);
  const [driverPosition, setDriverPosition] = useState(25); // percentage along route
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);
  const [order, setOrder] = useState<any>(null);

  // Live Driver Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isDriverTyping, setIsDriverTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'driver' | 'user'; text: string; time: string }>>([
    {
      id: 'm-1',
      sender: 'driver',
      text: 'Namaste! 🙏 I am Amit Verma, your delivery partner. I have picked up your order and I am heading towards your location.',
      time: 'Just now',
    },
    {
      id: 'm-2',
      sender: 'driver',
      text: 'Your food is packed safely in an insulated bag. Let me know if you have any delivery instructions!',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [isChatOpen, chatMessages, isDriverTyping]);

  useEffect(() => {
    let matchedOrder: any = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('qb_customer_orders');
        if (stored) {
          const list = JSON.parse(stored);
          matchedOrder = list.find((o: any) => o.id === orderId);
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (matchedOrder) {
      setOrder(matchedOrder);
      if (matchedOrder.status === 'DELIVERED') {
        setCurrentStageIndex(4);
        setEtaMinutes(0);
        setDriverPosition(95);
      } else if (matchedOrder.status === 'OUT_FOR_DELIVERY') {
        setCurrentStageIndex(3);
        setEtaMinutes(12);
        setDriverPosition(60);
      } else if (matchedOrder.status === 'READY') {
        setCurrentStageIndex(2);
        setEtaMinutes(18);
        setDriverPosition(35);
      } else if (matchedOrder.status === 'PREPARING') {
        setCurrentStageIndex(1);
        setEtaMinutes(24);
        setDriverPosition(15);
      }
    } else {
      // Fetch from API or use rich default
      ordersApi.getById(orderId)
        .then(r => {
          const d = r.data as any;
          if (d) setOrder(d);
        })
        .catch(() => {
          setOrder({
            id: orderId,
            status: 'PREPARING',
            total: searchParams.get('total') ? Number(searchParams.get('total')) : 489,
            createdAt: new Date().toISOString(),
            restaurant: {
              name: 'Sharief Bhai Biryani',
              address: '100 Feet Road, Indiranagar',
            },
            deliveryAddress: {
              name: 'Home',
              desc: 'Indiranagar, Bengaluru 560038',
            },
            items: [
              { name: 'Hyderabadi Chicken Dum Biryani', price: 299, quantity: 1, foodType: 'NON_VEG' },
              { name: 'Peri Peri Crispy Fries', price: 139, quantity: 1, foodType: 'VEG' },
            ],
            driver: {
              name: 'Amit Verma',
              phone: '+91 98765 43210',
              rating: 4.9,
              vehicle: 'Hero Electric (KA 03 HK 2910)',
            },
          });
        });
    }
  }, [orderId, searchParams]);

  const handleSimulateNextStage = () => {
    if (currentStageIndex < STAGES.length - 1) {
      const nextStage = currentStageIndex + 1;
      setCurrentStageIndex(nextStage);
      setEtaMinutes(Math.max(0, 24 - nextStage * 6));
      setDriverPosition(Math.min(92, 15 + nextStage * 20));

      // Update in localStorage
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('qb_customer_orders');
          if (stored) {
            const list = JSON.parse(stored);
            const updated = list.map((o: any) => {
              if (o.id === orderId) {
                return { ...o, status: STAGES[nextStage].key };
              }
              return o;
            });
            localStorage.setItem('qb_customer_orders', JSON.stringify(updated));
          }
        } catch {}
      }

      if (nextStage === STAGES.length - 1) {
        setTimeout(() => setIsReviewModalOpen(true), 1200);
      }
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : chatInput).trim();
    if (!text) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsDriverTyping(true);

    setTimeout(() => {
      let driverReplyText = "Got it! Thanks for letting me know, I'm on my way 👍";
      const lower = text.toLowerCase();
      if (lower.includes('where') || lower.includes('location') || lower.includes('reach') || lower.includes('eta') || lower.includes('long') || lower.includes('time')) {
        driverReplyText = `I am around 1.2 km away on Outer Ring Road, navigating normal traffic. Will reach in ~${etaMinutes} mins! 🛵`;
      } else if (lower.includes('ring') || lower.includes('bell') || lower.includes('doorbell') || lower.includes('noise')) {
        driverReplyText = 'Understood! I will NOT ring the bell. I will place the order gently and notify you.';
      } else if (lower.includes('gate') || lower.includes('door') || lower.includes('security') || lower.includes('outside') || lower.includes('leave')) {
        driverReplyText = 'Sure thing! I will hand it over to the security guard / leave it right by your door.';
      } else if (lower.includes('call') || lower.includes('phone')) {
        driverReplyText = 'Yes, I will give you a quick call right when I pull up to your building!';
      } else if (lower.includes('hot') || lower.includes('spill') || lower.includes('careful')) {
        driverReplyText = 'Don’t worry at all! Your food is safely placed in a thermal insulated box.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'driver',
          text: driverReplyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsDriverTyping(false);
    }, 1200);
  };

  const handleSubmitReview = async () => {
    try {
      if (orderId && !orderId.startsWith('QB-')) {
        await reviewsApi.create({
          orderId,
          restaurantRating: rating,
          foodRating: rating,
          deliveryRating: rating,
          comment: reviewComment,
        });
      }
    } catch {}
    setIsReviewed(true);
    setIsReviewModalOpen(false);
    alert('Thank you for rating your experience! ⭐');
  };

  const currentStage = STAGES[currentStageIndex];

  return (
    <div className="customer-tracking-screen" style={{ padding: '4px 0 30px' }}>
      {/* ─── Top Bar: ← Back & Live Badge ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => router.push('/customer/orders')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #EADBCE',
            borderRadius: 12,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 800,
            color: '#4A0A10',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Orders
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href={`/customer/help?orderId=${orderId}`}
            style={{
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              borderRadius: 12,
              padding: '6px 10px',
              fontSize: 11.5,
              fontWeight: 800,
              color: '#EA580C',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🎧 Help & Refund
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ECFDF5', padding: '6px 10px', borderRadius: 12, border: '1px solid #A7F3D0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E9F6E', display: 'inline-block', boxShadow: '0 0 0 3px rgba(14, 159, 110, 0.2)' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0E9F6E' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ─── Status Hero Card ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #EADBCE',
          padding: 16,
          boxShadow: '0 4px 14px rgba(74, 10, 16, 0.05)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8C7B72', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Order #{orderId}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: '2px 0' }}>
              {currentStage.title} {currentStage.icon}
            </h2>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
              {currentStage.desc}
            </p>
          </div>

          <div
            style={{
              background: '#FFF7ED',
              border: '1.5px solid #FFEDD5',
              padding: '6px 12px',
              borderRadius: 14,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 9.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Estimated Arrival
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#EA580C', lineHeight: 1.1, marginTop: 1 }}>
              {currentStageIndex === STAGES.length - 1 ? 'Delivered' : `~${etaMinutes} mins`}
            </div>
          </div>
        </div>

        {/* ─── Animated Multi-Stage Stepper ─── */}
        <div style={{ position: 'relative', margin: '20px 0 14px' }}>
          {/* Progress Track Line */}
          <div style={{ position: 'absolute', top: 14, left: 10, right: 10, height: 3, background: '#E5E7EB', zIndex: 1 }}>
            <div
              style={{
                height: '100%',
                background: '#0E9F6E',
                width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {STAGES.map((st, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;

              return (
                <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 54 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isCompleted ? '#0E9F6E' : isCurrent ? '#4A0A10' : '#FFFFFF',
                      color: isCompleted || isCurrent ? '#FFFFFF' : '#9CA3AF',
                      border: isCompleted ? '2px solid #0E9F6E' : isCurrent ? '2px solid #4A0A10' : '2px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                      boxShadow: isCurrent ? '0 0 0 3px rgba(74, 10, 16, 0.15)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCompleted ? '✓' : st.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#4A0A10' : isCompleted ? '#0E9F6E' : '#9CA3AF',
                      textAlign: 'center',
                      marginTop: 4,
                      lineHeight: 1.1,
                    }}
                  >
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Advance Stage Button */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button
            type="button"
            onClick={handleSimulateNextStage}
            disabled={currentStageIndex === STAGES.length - 1}
            id="simulate-stage-btn"
            style={{
              background: currentStageIndex === STAGES.length - 1 ? '#E5E7EB' : '#4A0A10',
              color: currentStageIndex === STAGES.length - 1 ? '#9CA3AF' : '#FFFFFF',
              border: 'none',
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 800,
              cursor: currentStageIndex === STAGES.length - 1 ? 'default' : 'pointer',
              boxShadow: currentStageIndex === STAGES.length - 1 ? 'none' : '0 2px 8px rgba(74, 10, 16, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⚡ Simulate Next Delivery Stage</span>
            <span>({currentStageIndex + 1}/{STAGES.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Simulated Live Map ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #EADBCE',
          padding: 14,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🗺️</span> Live Delivery Route
        </div>

        <div
          style={{
            position: 'relative',
            height: 120,
            background: '#F3F4F6',
            borderRadius: 14,
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
          }}
        >
          {/* Map Grid Background pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              opacity: 0.6,
            }}
          />

          {/* Road Path Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 30,
              right: 30,
              height: 6,
              background: '#D1D5DB',
              borderRadius: 3,
              transform: 'translateY(-50%)',
            }}
          >
            {/* Active Driver Trail */}
            <div
              style={{
                height: '100%',
                background: '#0E9F6E',
                width: `${driverPosition}%`,
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Restaurant Marker */}
          <div
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#FFFFFF',
              border: '2px solid #4A0A10',
              borderRadius: 8,
              padding: 4,
              fontSize: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
            title={order?.restaurant?.name || 'Restaurant'}
          >
            🍽️
          </div>

          {/* Live Driver Moving Pin */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${driverPosition}% - 14px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#0E9F6E',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(14, 159, 110, 0.4)',
              transition: 'left 0.4s ease',
              zIndex: 5,
            }}
            title="Amit Verma (Delivery Partner)"
          >
            🛵
          </div>

          {/* Home / Customer Marker */}
          <div
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#FFFFFF',
              border: '2px solid #0E9F6E',
              borderRadius: 8,
              padding: 4,
              fontSize: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
            title="Your Location"
          >
            🏠
          </div>

          {/* Live GPS Status Pill */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 12,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(4px)',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              color: '#1F2937',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            📍 GPS: {driverPosition < 30 ? 'At Restaurant' : driverPosition < 80 ? 'On Outer Ring Rd (1.2 km away)' : 'Arriving at your gate'}
          </div>
        </div>
      </div>

      {/* ─── Delivery Partner & OTP ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #EADBCE',
          padding: 14,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#4A0A10',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              🛵
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
                {order?.driver?.name || 'Amit Verma'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                ★ {order?.driver?.rating || '4.9'} • {order?.driver?.vehicle || 'Hero Electric (KA 03 HK 2910)'}
              </div>
            </div>
          </div>

          {/* Action Call & Chat buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href="tel:+919876543210"
              style={{
                background: '#ECFDF5',
                color: '#0E9F6E',
                border: '1px solid #A7F3D0',
                borderRadius: 10,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              📞 Call
            </a>
            <button
              type="button"
              id="open-driver-chat-btn"
              onClick={() => setIsChatOpen(true)}
              style={{
                background: '#4A0A10',
                color: '#FFFFFF',
                border: '1px solid #4A0A10',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(74, 10, 16, 0.2)',
              }}
            >
              💬 Chat
            </button>
          </div>
        </div>

        {/* Delivery OTP */}
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px dashed #D1D5DB',
          }}
        >
          <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600 }}>Delivery Confirmation OTP:</span>
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: 2, color: '#4A0A10' }}>4821</span>
        </div>
      </div>

      {/* ─── Order Items & Delivery Address Details ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #EADBCE',
          padding: 14,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 10 }}>
          🍽️ Order Summary
        </div>

        <div style={{ fontSize: 12, color: '#4B5563', marginBottom: 10, lineHeight: 1.4 }}>
          <div><strong>Restaurant:</strong> {order?.restaurant?.name || 'QuickBite Partner'}</div>
          <div><strong>Deliver to:</strong> {order?.deliveryAddress?.desc || order?.deliveryAddress?.fullAddress || 'Indiranagar, Bengaluru'}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #F3F4F6', paddingTop: 8 }}>
          {(order?.items || []).map((it: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#374151' }}>{it.quantity}x {it.name}</span>
              <span style={{ fontWeight: 700, color: '#1A1A1A' }}>₹{it.price * (it.quantity || 1)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#4A0A10', borderTop: '1px solid #E5E7EB', paddingTop: 8, marginTop: 4 }}>
            <span>Total Paid</span>
            <span>₹{order?.total || 489}</span>
          </div>
        </div>
      </div>

      {/* ─── Live Driver Chat Modal / Bottom Drawer ─── */}
      {isChatOpen && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '12px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsChatOpen(false);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 420,
              height: '85vh',
              maxHeight: 620,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            {/* Chat Top Header */}
            <div
              style={{
                background: '#4A0A10',
                color: '#FFFFFF',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#FFF7ED',
                      color: '#4A0A10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    🛵
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #4A0A10',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {order?.driver?.name || 'Amit Verma'}
                    <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 10 }}>
                      Rider
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#FCD34D' }}>
                    ★ {order?.driver?.rating || '4.9'} • Online & En Route
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <a
                  href="tel:+919876543210"
                  style={{
                    background: '#0E9F6E',
                    color: '#FFFFFF',
                    borderRadius: 10,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  📞 Call
                </a>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    color: '#FFFFFF',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Ride Status Notice Banner */}
            <div
              style={{
                background: '#FFFBEB',
                borderBottom: '1px solid #FEF3C7',
                padding: '6px 12px',
                fontSize: 11,
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>📍 ETA: ~{etaMinutes} mins • {order?.driver?.vehicle || 'Hero Electric'}</span>
              <span style={{ fontWeight: 800, color: '#D97706' }}>OTP: 4821</span>
            </div>

            {/* Messages Feed Area */}
            <div
              style={{
                flex: 1,
                padding: '14px',
                overflowY: 'auto',
                background: '#F9FAFB',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        background: isUser ? '#4A0A10' : '#FFFFFF',
                        color: isUser ? '#FFFFFF' : '#1F2937',
                        borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        padding: '10px 14px',
                        fontSize: 13,
                        lineHeight: 1.4,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid #E5E7EB',
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: 9.5, color: '#9CA3AF', marginTop: 3, padding: '0 4px' }}>
                      {msg.time} {isUser && '✓✓'}
                    </span>
                  </div>
                );
              })}

              {/* Live Driver Typing Indicator */}
              {isDriverTyping && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    alignSelf: 'flex-start',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px 16px 16px 2px',
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#6B7280',
                  }}
                >
                  <span style={{ display: 'inline-flex', gap: 3 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4A0A10', animation: 'bounce 1s infinite 0.1s' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4A0A10', animation: 'bounce 1s infinite 0.2s' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4A0A10', animation: 'bounce 1s infinite 0.3s' }} />
                  </span>
                  <span>Amit is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div
              style={{
                background: '#FFFFFF',
                borderTop: '1px solid #E5E7EB',
                padding: '8px 12px 4px',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
              }}
            >
              {QUICK_REPLIES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: 16,
                    padding: '5px 10px',
                    fontSize: 11,
                    color: '#374151',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontWeight: 600,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '10px 12px',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Type instructions for Amit..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  background: '#F9FAFB',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '9px 14px',
                  fontSize: 13,
                  outline: 'none',
                  color: '#111827',
                }}
              />
              <button
                type="button"
                id="send-chat-msg-btn"
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim()}
                style={{
                  background: chatInput.trim() ? '#4A0A10' : '#E5E7EB',
                  color: chatInput.trim() ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: chatInput.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s',
                }}
              >
                Send 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {isReviewModalOpen && !isReviewed && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 380,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 4px 0' }}>
              Order Delivered!
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 14px 0' }}>
              How was your experience with {order?.restaurant?.name || 'this order'}?
            </p>

            {/* Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 26,
                    color: star <= rating ? '#F59E0B' : '#D1D5DB',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              placeholder="Tell us what you liked (food quality, delivery speed)..."
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #D1D5DB',
                padding: 10,
                fontSize: 12,
                marginBottom: 14,
                outline: 'none',
                minHeight: 60,
              }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                style={{
                  flex: 1,
                  background: '#F3F4F6',
                  color: '#4B5563',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 0',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                style={{
                  flex: 1,
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '9px 0',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
