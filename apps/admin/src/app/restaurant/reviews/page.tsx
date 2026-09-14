'use client';
import React, { useState, useEffect } from 'react';
import { fetchRestaurantReviews } from '../../../lib/supabase';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  orderedItems: string[];
  reply?: string;
  replyDate?: string;
}

const DEMO_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Rahul Sharma',
    rating: 5,
    comment: 'The Hyderabadi Dum Biryani was exceptionally flavorful and arrived piping hot! Best delivery packaging I have seen in Bengaluru.',
    date: 'Today, 01:15 PM',
    orderedItems: ['2 × Chicken Dum Biryani', '1 × Coke'],
    reply: 'Thank you so much Rahul! We prepare each handi fresh on order. Looking forward to serving you again soon! — Team QuickBite',
    replyDate: 'Today, 01:45 PM',
  },
  {
    id: 'rev-2',
    customerName: 'Priya Patel',
    rating: 5,
    comment: 'Paneer Butter Masala was very rich and creamy. Loved the soft butter naans.',
    date: 'Yesterday, 08:30 PM',
    orderedItems: ['1 × Paneer Butter Masala', '3 × Butter Naan'],
  },
  {
    id: 'rev-3',
    customerName: 'Vikram Mehta',
    rating: 4,
    comment: 'Burger was super juicy and tasty. Peri peri fries could be slightly crispier but overall great experience.',
    date: '10 Sep 2026',
    orderedItems: ['1 × Classic Smash Burger', '1 × Peri Peri Fries'],
  },
  {
    id: 'rev-4',
    customerName: 'Sneha Reddy',
    rating: 3,
    comment: 'Food was delicious but delivery took around 40 minutes during the rain.',
    date: '08 Sep 2026',
    orderedItems: ['1 × Veg Supreme Pizza'],
  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, count: 980, percentage: 78 },
  { stars: 4, count: 180, percentage: 14 },
  { stars: 3, count: 52, percentage: 4 },
  { stars: 2, count: 24, percentage: 2 },
  { stars: 1, count: 12, percentage: 1 },
];

export default function RestaurantReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const supaReviews = await fetchRestaurantReviews('sharief-bhai');
        if (supaReviews && supaReviews.length > 0) {
          const mapped: Review[] = supaReviews.map((r: any) => ({
            id: r.id,
            customerName: r.profiles?.full_name || 'Verified Customer',
            rating: r.rating || 5,
            comment: r.comment || '',
            date: new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
            orderedItems: ['Chicken Dum Biryani', 'Raita'],
          }));
          setReviews([...mapped, ...DEMO_REVIEWS]);
        }
      } catch (e) {
        console.warn('Supabase reviews load notice:', e);
      }
    };
    loadReviews();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              reply: replyText.trim(),
              replyDate: 'Just now',
            }
          : r
      )
    );
    setReplyingId(null);
    setReplyText('');
    showToast('Reply published successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#4A0A10',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(74, 10, 16, 0.25)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 100,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
          ⭐ Customer Reviews & Reputation
        </h1>
        <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
          Monitor verified customer ratings and engage with diner feedback
        </p>
      </div>

      {/* ─── Rating Overview & Distribution ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #EAE0D0',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              background: '#4A0A10',
              color: '#FFB21A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(74, 10, 16, 0.2)',
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>4.6</span>
            <span style={{ fontSize: 14 }}>★★★★★</span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#171717' }}>1,248 Reviews</div>
            <div style={{ fontSize: 13, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
              94% positive customer sentiment
            </div>
          </div>
        </div>

        {/* 5-Star Distribution Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {RATING_DISTRIBUTION.map(d => (
            <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{ width: 32, fontWeight: 700, color: '#171717' }}>{d.stars} ★</span>
              <div style={{ flex: 1, height: 8, background: '#FAF6EF', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${d.percentage}%`,
                    height: '100%',
                    background: d.stars >= 4 ? '#20A464' : d.stars === 3 ? '#F5A623' : '#D64545',
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ width: 36, color: '#6F6F6F', textAlign: 'right' }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Recent Reviews Feed ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
          Recent Customer Reviews
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map(review => (
            <div
              key={review.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #EAE0D0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Customer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: '#FAF0EB',
                      color: '#4A0A10',
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {review.customerName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#171717' }}>
                      {review.customerName}
                    </div>
                    <div style={{ fontSize: 11, color: '#6F6F6F' }}>{review.date}</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFF8EB',
                    border: '1px solid #FDDCA5',
                    color: '#B57400',
                    fontWeight: 900,
                    fontSize: 13,
                    padding: '4px 10px',
                    borderRadius: 8,
                  }}
                >
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>

              {/* Items Tag */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {review.orderedItems.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: '#FAF6EF',
                      padding: '3px 8px',
                      borderRadius: 6,
                      color: '#6F6F6F',
                    }}
                  >
                    🍲 {item}
                  </span>
                ))}
              </div>

              {/* Comment */}
              <div style={{ fontSize: 14, color: '#171717', lineHeight: 1.5 }}>
                &ldquo;{review.comment}&rdquo;
              </div>

              {/* Restaurant Response (if exists) */}
              {review.reply && (
                <div
                  style={{
                    background: '#FAF0EB',
                    borderRadius: 12,
                    padding: '12px 14px',
                    borderLeft: '4px solid #4A0A10',
                    marginTop: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#4A0A10', marginBottom: 4 }}>
                    <span>OFFICIAL RESTAURANT RESPONSE</span>
                    <span style={{ color: '#888' }}>{review.replyDate}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4A0A10', lineHeight: 1.4 }}>
                    {review.reply}
                  </div>
                </div>
              )}

              {/* In-line Reply Box / Trigger */}
              {!review.reply && (
                <div>
                  {replyingId === review.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      <textarea
                        rows={2}
                        placeholder="Write a polite response to this review..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: '1px solid #EAE0D0',
                          fontSize: 13,
                          background: '#FAF6EF',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #EAE0D0',
                            background: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(review.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#4A0A10',
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText('');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: '1px solid #EAE0D0',
                        background: '#FAF6EF',
                        color: '#4A0A10',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        width: 'fit-content',
                      }}
                    >
                      💬 REPLY
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
