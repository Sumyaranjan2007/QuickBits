'use client';
import React from 'react';

export default function DeliveryPerformancePage() {
  const stats = {
    rating: 4.89,
    totalRatings: 342,
    acceptanceRate: 96,
    completionRate: 99.2,
    onTimeRate: 97.5,
    averageDeliveryTime: '21 mins',
    totalDeliveries: 418,
    perfectDeliveries: 398,
    topRank: 'Top 5% Partner in Bengaluru',
  };

  const ratingDistribution = [
    { stars: 5, count: 298, percent: 87 },
    { stars: 4, count: 32, percent: 9 },
    { stars: 3, count: 8, percent: 3 },
    { stars: 2, count: 3, percent: 1 },
    { stars: 1, count: 1, percent: 0 },
  ];

  const badges = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Average delivery under 22 minutes' },
    { icon: '⭐', title: 'Customer Favorite', desc: 'Over 250 5-star customer ratings' },
    { icon: '🛡️', title: 'Safe Handler', desc: 'Zero food spills or damages reported' },
    { icon: '🌧️', title: 'All-Weather Hero', desc: 'Delivered 30+ orders during heavy rain' },
  ];

  const recentFeedback = [
    { text: 'Food was piping hot and arrived 10 mins early! Super polite partner.', author: 'Ananya D.', date: 'Today, 20:20', stars: 5 },
    { text: 'Great attitude, followed gate instructions perfectly.', author: 'Sanjay H.', date: 'Today, 18:45', stars: 5 },
    { text: 'Careful with drinks, nothing spilled.', author: 'Rohan V.', date: 'Today, 14:20', stars: 5 },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>⭐ Performance & Partner Rating</h1>
        <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
          Your service metrics, customer reviews, efficiency badges, and fleet tier status
        </p>
      </div>

      {/* ─── Hero Scorecard ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0984E3 0%, #00CEC9 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 10px 30px rgba(9, 132, 227, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '4px solid #fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 22,
          }}>
            <span>4.89</span>
            <span style={{ fontSize: 11, color: '#FDCB6E' }}>★★★★★</span>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
              SUPER HERO TIER PARTNER
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 2 }}>
              {stats.topRank}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
              Based on {stats.totalRatings} verified customer reviews • High order priority enabled
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 18px', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.9 }}>TOTAL ORDERS DELIVERED</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>{stats.totalDeliveries}</div>
          <div style={{ fontSize: 11, color: '#55EFC4', fontWeight: 700 }}>99.2% Completion</div>
        </div>
      </div>

      {/* ─── 4 Core Performance Metrics ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Acceptance Rate', value: `${stats.acceptanceRate}%`, sub: 'Target: >90%', icon: '📥', status: 'EXCELLENT', color: '#00B894' },
          { label: 'Trip Completion Rate', value: `${stats.completionRate}%`, sub: 'Target: >98%', icon: '✅', status: 'OUTSTANDING', color: '#00B894' },
          { label: 'On-Time Delivery Rate', value: `${stats.onTimeRate}%`, sub: 'Target: >95%', icon: '⏱️', status: 'ON TRACK', color: '#0984E3' },
          { label: 'Average Trip Duration', value: stats.averageDeliveryTime, sub: 'City Avg: 27 mins', icon: '⚡', status: '6m FASTER', color: '#6C5CE7' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '18px', border: '1px solid #E2ECF5', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: item.color, background: `${item.color}15`, padding: '2px 6px', borderRadius: 4 }}>
                {item.status}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0C2340', marginTop: 10 }}>{item.value}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', marginTop: 2 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: '#636E72', marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Two-Column: Rating Breakdown & Badges ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Rating Breakdown Bar */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
            📊 Star Rating Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ratingDistribution.map((r) => (
              <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ width: 45, fontWeight: 700, color: '#0C2340' }}>{r.stars} Star</span>
                <div style={{ flex: 1, height: 8, background: '#E2ECF5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.percent}%`, background: r.stars >= 4 ? '#00B894' : r.stars === 3 ? '#FDCB6E' : '#E17055', borderRadius: 4 }} />
                </div>
                <span style={{ width: 50, textAlign: 'right', fontWeight: 800, color: '#636E72', fontSize: 12 }}>
                  {r.count} ({r.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Earned Badges */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
            🏆 Badges & Achievements
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {badges.map((b, idx) => (
              <div key={idx} style={{ background: '#F8FAFD', padding: '12px', borderRadius: 12, border: '1px solid #E2ECF5', textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{b.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#0C2340', marginTop: 4 }}>{b.title}</div>
                <div style={{ fontSize: 10, color: '#636E72', marginTop: 2 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Customer Feedback ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
          💬 Recent Customer Comments
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentFeedback.map((f, idx) => (
            <div key={idx} style={{ padding: '12px 14px', background: '#F8FAFD', borderRadius: 12, border: '1px solid #E2ECF5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#0C2340' }}>{f.author}</span>
                <span style={{ fontSize: 12, color: '#FDCB6E' }}>★★★★★</span>
              </div>
              <p style={{ fontSize: 13, color: '#4A6FA5', lineHeight: 1.4 }}>"{f.text}"</p>
              <div style={{ fontSize: 11, color: '#636E72', marginTop: 4 }}>{f.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
