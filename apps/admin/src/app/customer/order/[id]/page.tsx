'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersApi, reviewsApi } from '@quickbite/api-client';

const STAGES = [
  { key: 'PENDING', title: 'Order Placed', desc: 'Sent to restaurant', icon: '📝' },
  { key: 'PREPARING', title: 'Preparing Food', desc: 'Chef is cooking your meal', icon: '🍳' },
  { key: 'READY', title: 'Driver Assigned', desc: 'Amit Verma reached restaurant', icon: '🛵' },
  { key: 'OUT_FOR_DELIVERY', title: 'On the Way', desc: 'Driver is en route to you', icon: '🚀' },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Enjoy your hot meal!', icon: '🎉' },
];

export default function CustomerOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [currentStageIndex, setCurrentStageIndex] = useState(1);
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [driverPosition, setDriverPosition] = useState(15); // percentage along route
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewed, setIsReviewed] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Try fetching actual order from backend
    if (orderId && !orderId.startsWith('QB-')) {
      ordersApi.getById(orderId)
        .then(r => setOrderData(r.data))
        .catch(() => {});
    }
  }, [orderId]);

  // Handle stage simulation
  const handleSimulateNextStage = () => {
    if (currentStageIndex < STAGES.length - 1) {
      const nextStage = currentStageIndex + 1;
      setCurrentStageIndex(nextStage);
      setEtaMinutes(Math.max(0, 24 - nextStage * 6));
      setDriverPosition(Math.min(90, 15 + nextStage * 22));

      if (nextStage === STAGES.length - 1) {
        // Delivered! Open review modal after 1s
        setTimeout(() => setIsReviewModalOpen(true), 1200);
      }
    }
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
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* ─── Header Status Card ─── */}
      <div style={{ background: '#fff', borderRadius: 24, border: '1.5px solid var(--border)', padding: 28, marginBottom: 24, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-primary" style={{ fontSize: 12 }}>Live Tracking</span>
              <span style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 600 }}>Order #{orderId.slice(0, 10)}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 6, color: 'var(--text)' }}>
              {currentStage.title} {currentStage.icon}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-sec)', marginTop: 2 }}>
              {currentStage.desc}
            </p>
          </div>

          <div style={{ background: 'var(--primary-light)', padding: '12px 20px', borderRadius: 16, textAlign: 'center', border: '1.5px solid #FFD5C2' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Estimated Arrival</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1 }}>
              {currentStageIndex === STAGES.length - 1 ? 'Delivered' : `~${etaMinutes} mins`}
            </div>
          </div>
        </div>

        {/* ─── Interactive Stepper ─── */}
        <div className="stepper-container">
          <div className="stepper-line">
            <div className="stepper-line-active" style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }} />
          </div>

          {STAGES.map((st, i) => (
            <div
              key={st.key}
              className={`stepper-step ${i < currentStageIndex ? 'completed' : i === currentStageIndex ? 'active' : ''}`}
            >
              <div className="stepper-circle">
                {i < currentStageIndex ? '✓' : st.icon}
              </div>
              <div className="stepper-title">{st.title}</div>
            </div>
          ))}
        </div>

        {/* Demo Stage Advance Tool */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSimulateNextStage}
            disabled={currentStageIndex === STAGES.length - 1}
            style={{ borderRadius: 20, padding: '8px 20px', gap: 6 }}
          >
            <span>⚡ Demo: Advance to Next Stage</span>
            <span>({currentStageIndex + 1}/{STAGES.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Simulated Live Map ─── */}
      <div className="simulated-map" style={{ marginBottom: 24 }}>
        <div className="map-road" />
        <div className="map-pin-restaurant" title="Restaurant">🍽️</div>
        <div className="map-pin-driver" style={{ left: `${driverPosition}%` }} title="Amit Verma (Delivery Partner)">🛵</div>
        <div className="map-pin-home" title="Delivery Address">🏠</div>

        <div style={{ position: 'absolute', bottom: 12, left: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#1A1A2E' }}>
          📍 Live Driver GPS: {driverPosition < 40 ? 'At Restaurant' : driverPosition < 80 ? 'En route on 100 Feet Rd' : 'Arrived at gate'}
        </div>
      </div>

      {/* ─── Delivery Partner & OTP Card ─── */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {/* Delivery Partner */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#0984E3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
            🛵
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Amit Verma</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>⭐ 4.85 • Motorcycle (KA-01-EQ-9876)</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-sm btn-outline" onClick={() => alert('Calling Amit Verma (+91 99999 99994)...')} style={{ padding: '3px 10px', fontSize: 11, borderRadius: 6 }}>
                📞 Call Driver
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => alert('Driver Chat: "I have picked up your food and will reach in ~15 mins!"')} style={{ padding: '3px 10px', fontSize: 11, borderRadius: 6 }}>
                💬 Chat
              </button>
            </div>
          </div>
        </div>

        {/* Delivery OTP & Verification */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Delivery Verification OTP
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', letterSpacing: 4, marginTop: 2 }}>
            4829
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>
            Share this 4-digit OTP with Amit when food arrives
          </div>
        </div>
      </div>

      {/* ─── Actions Strip ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 32 }}>
        <Link href="/customer/orders" className="btn btn-outline" style={{ borderRadius: 10 }}>
          ← View All Orders
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentStageIndex === STAGES.length - 1 && !isReviewed && (
            <button className="btn btn-primary" onClick={() => setIsReviewModalOpen(true)} style={{ borderRadius: 10 }}>
              ⭐ Rate Your Order
            </button>
          )}
          <button className="btn btn-outline" onClick={() => router.push('/customer/help')} style={{ borderRadius: 10 }}>
            💬 Need Help?
          </button>
        </div>
      </div>

      {/* ─── Rating & Review Modal ─── */}
      {isReviewModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>How was your food?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-sec)' }}>Rate your experience with Burger &amp; Co. and Amit Verma</p>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  style={{ background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', transform: s <= rating ? 'scale(1.15)' : 'scale(1)', transition: '0.1s' }}
                >
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              className="input"
              rows={3}
              placeholder="What did you love? (e.g. Delicious hot smash burger, crisp fries, superfast delivery!)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              style={{ marginBottom: 20 }}
            />

            <button
              className="btn btn-primary w-full"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
              onClick={handleSubmitReview}
            >
              Submit Feedback ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
