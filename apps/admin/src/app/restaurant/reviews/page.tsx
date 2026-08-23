'use client';
import React, { useState, useEffect } from 'react';
import { restaurantsApi, reviewsApi } from '@quickbite/api-client';

const DEMO_REVIEWS = [
  { id: 'r1', customerName: 'Rahul Sharma', rating: 5, foodRating: 5, comment: 'Amazing burgers! The smash burger was perfectly crispy and juicy. Delivery was super fast too. Will definitely order again!', orderedItems: 'Classic Smash Burger, Peri Peri Fries', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), reply: null },
  { id: 'r2', customerName: 'Priya Patel', rating: 4, foodRating: 4, comment: 'Really good biryani, very authentic. Packaging was great. Could have been a bit warmer on arrival.', orderedItems: 'Chicken Dum Biryani', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), reply: 'Thank you Priya! We use insulated packaging. We\'ll note your feedback.' },
  { id: 'r3', customerName: 'Vikram Mehta', rating: 5, foodRating: 5, comment: 'Best pizza in Bengaluru! The burrata is fresh and delicious. 10/10 would recommend.', orderedItems: 'Margherita Burrata Pizza', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), reply: null },
  { id: 'r4', customerName: 'Sneha Reddy', rating: 3, foodRating: 3, comment: 'Food was decent but took longer than expected. Would prefer if the preparation was faster.', orderedItems: 'Paneer Tikka Burger', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), reply: null },
  { id: 'r5', customerName: 'Arjun Nair', rating: 5, foodRating: 5, comment: 'Absolutely loved it! Perfect for family orders. The garlic bread was phenomenal.', orderedItems: 'BBQ Chicken Pizza, Garlic Bread', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), reply: 'Thank you Arjun! Really appreciate your kind words. Come back soon!' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: 14, color: s <= rating ? '#FDCB6E' : '#DDD' }}>★</span>
      ))}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(DEMO_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await restaurantsApi.list();
        const d = r.data as any;
        const list = d.items || d || [];
        if (list.length > 0) {
          const r2 = await reviewsApi.getByRestaurant(list[0].id);
          const d2 = r2.data as any;
          const list2 = d2.items || d2 || [];
          if (list2.length > 0) {
            setReviews(list2.map((rv: any) => ({
              ...rv,
              customerName: rv.customer?.profile?.firstName || 'Customer',
              orderedItems: 'Order items',
            })));
            return;
          }
        }
        setReviews(DEMO_REVIEWS);
      } catch {
        setReviews(DEMO_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r));
    setReplyModal(null);
    setReplyText('');
  };

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    rating: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100),
  }));
  const filtered = filterRating > 0 ? reviews.filter(r => r.rating === filterRating) : reviews;

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">⭐ Customer Reviews</h1>
          <p className="page-subtitle">{reviews.length} total reviews · {avgRating.toFixed(1)} average rating</p>
        </div>
      </div>

      {/* ─── Rating Overview ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 24 }}>
        {/* Score Card */}
        <div style={{ background: 'linear-gradient(135deg, #FDCB6E, #F39C12)', borderRadius: 20, padding: 28, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} style={{ fontSize: 22, color: s <= Math.round(avgRating) ? '#fff' : 'rgba(255,255,255,0.4)' }}>★</span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, opacity: 0.9 }}>{reviews.length} reviews</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>🏆 Top 10% in your area!</div>
        </div>

        {/* Distribution */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, marginBottom: 16 }}>Rating Distribution</div>
          {ratingDist.map(d => (
            <div key={d.rating} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <button
                onClick={() => setFilterRating(filterRating === d.rating ? 0 : d.rating)}
                style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', width: 70 }}
              >
                <span style={{ color: '#FDCB6E', fontSize: 14 }}>★</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{d.rating}</span>
              </button>
              <div style={{ flex: 1, height: 8, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#FDCB6E', borderRadius: 4, width: `${d.pct}%`, transition: '0.4s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', width: 50, textAlign: 'right' }}>{d.count} ({d.pct}%)</span>
            </div>
          ))}
          {filterRating > 0 && (
            <button onClick={() => setFilterRating(0)} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, marginTop: 4 }}>
              ✕ Clear filter
            </button>
          )}
        </div>
      </div>

      {/* ─── Reviews List ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(review => (
          <div key={review.id} style={{
            background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 20,
            boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${review.rating >= 4 ? '#00B894' : review.rating === 3 ? '#FDCB6E' : '#E17055'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>
                  {review.customerName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{review.customerName}</div>
                  <Stars rating={review.rating} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(review.createdAt)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📦 {review.orderedItems}</div>
              </div>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-sec)', margin: '8px 0' }}>
              "{review.comment}"
            </p>

            {review.reply && (
              <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '10px 14px', marginTop: 10, borderLeft: '3px solid var(--primary)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 3 }}>🍽️ Restaurant Reply:</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{review.reply}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {!review.reply && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setReplyModal(review); setReplyText(''); }}
                  style={{ fontSize: 12, borderRadius: 8 }}
                >
                  💬 Reply to Review
                </button>
              )}
              <button className="btn btn-outline btn-sm" style={{ fontSize: 12, borderRadius: 8 }}>
                🚩 Flag Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Reply Modal ─── */}
      {replyModal && (
        <div className="modal-backdrop" onClick={() => setReplyModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>💬 Reply to {replyModal.customerName}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 12 }}>"{replyModal.comment}"</p>
            <textarea
              className="input"
              style={{ height: 100, resize: 'none' }}
              placeholder="Write a professional, friendly response..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReplyModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleReply(replyModal.id)}>Post Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
