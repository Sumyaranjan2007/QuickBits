'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function RestaurantAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─── Header ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/restaurant"
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: '#FAF6EF',
              border: '1px solid #EAE0D0',
              color: '#4A0A10',
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </Link>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
              📈 Detailed Sales & Performance Analytics
            </h1>
            <p style={{ fontSize: 12, color: '#6F6F6F', margin: '2px 0 0' }}>
              Historical trends, peak hour distribution, and dish popularity
            </p>
          </div>
        </div>

        {/* Time Filter Pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['7D', '30D', '90D'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: timeRange === t ? '1px solid #4A0A10' : '1px solid #EAE0D0',
                background: timeRange === t ? '#4A0A10' : '#FFFFFF',
                color: timeRange === t ? '#FFFFFF' : '#171717',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {t === '7D' ? 'Last 7 Days' : t === '30D' ? 'Last 30 Days' : 'Last 3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Core KPI Cards Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <div style={kpiBoxStyle}>
          <div style={kpiLabelStyle}>TOTAL REVENUE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', marginTop: 4 }}>₹78,500</div>
          <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>↑ 14.2% vs previous period</div>
        </div>

        <div style={kpiBoxStyle}>
          <div style={kpiLabelStyle}>TOTAL ORDERS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#171717', marginTop: 4 }}>168</div>
          <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>↑ 8% growth</div>
        </div>

        <div style={kpiBoxStyle}>
          <div style={kpiLabelStyle}>AVG ORDER VALUE (AOV)</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#171717', marginTop: 4 }}>₹467</div>
          <div style={{ fontSize: 11, color: '#6F6F6F', marginTop: 4 }}>Healthy cart size</div>
        </div>

        <div style={kpiBoxStyle}>
          <div style={kpiLabelStyle}>CANCELLATION RATE</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#20A464', marginTop: 4 }}>1.2%</div>
          <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>Well below 3% threshold</div>
        </div>

        <div style={kpiBoxStyle}>
          <div style={kpiLabelStyle}>AVG PREP TIME</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#171717', marginTop: 4 }}>13.4 min</div>
          <div style={{ fontSize: 11, color: '#20A464', fontWeight: 700, marginTop: 4 }}>⚡ Fast Kitchen Badge</div>
        </div>
      </div>

      {/* ─── Revenue Trend & Peak Hours ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Revenue Trend Chart */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#171717', margin: 0 }}>
              Daily Revenue Growth
            </h3>
            <span style={{ fontSize: 12, color: '#6F6F6F' }}>Daily sales volume (₹)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingTop: 20, borderBottom: '1px solid #EAE0D0' }}>
            {[
              { day: 'Mon', val: 8400, orders: 18 },
              { day: 'Tue', val: 9200, orders: 20 },
              { day: 'Wed', val: 7800, orders: 16 },
              { day: 'Thu', val: 11400, orders: 24 },
              { day: 'Fri', val: 14800, orders: 32 },
              { day: 'Sat', val: 18200, orders: 38 },
              { day: 'Sun', val: 15600, orders: 33 },
            ].map(b => (
              <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4A0A10' }}>₹{(b.val / 1000).toFixed(1)}k</div>
                <div
                  style={{
                    width: '50%',
                    maxWidth: 28,
                    height: `${(b.val / 18200) * 110}px`,
                    background: b.day === 'Sat' ? '#4A0A10' : '#FFB21A',
                    borderRadius: '6px 6px 0 0',
                  }}
                />
                <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Breakdown */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 900, color: '#171717', margin: 0 }}>
            Peak Demand Hours
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { slot: 'Lunch Rush (12:30 PM - 02:30 PM)', percentage: 42, color: '#4A0A10', orders: '71 orders' },
              { slot: 'Dinner Rush (07:30 PM - 10:30 PM)', percentage: 48, color: '#FFB21A', orders: '80 orders' },
              { slot: 'Evening Snacks (04:30 PM - 06:30 PM)', percentage: 10, color: '#BBE9D1', orders: '17 orders' },
            ].map(slot => (
              <div key={slot.slot} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                  <span style={{ color: '#171717' }}>{slot.slot}</span>
                  <span style={{ color: '#6F6F6F' }}>{slot.orders} ({slot.percentage}%)</span>
                </div>
                <div style={{ height: 8, background: '#FAF6EF', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${slot.percentage}%`, height: '100%', background: slot.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Best-selling vs Low-performing Dishes ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Top Sellers */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#20A464', margin: 0 }}>
              Best-Selling Menu Items
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Hyderabadi Chicken Dum Biryani', count: 86, revenue: '₹21,414' },
              { name: 'Paneer Butter Masala', count: 48, revenue: '₹10,560' },
              { name: 'Classic Smash Cheeseburger', count: 35, revenue: '₹8,750' },
              { name: 'Butter Naan (Per Pc)', count: 124, revenue: '₹7,440' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FAF6EF', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: '#171717' }}>
                  #{i + 1} {item.name}
                </span>
                <span style={{ fontWeight: 800, color: '#4A0A10' }}>
                  {item.count} sold · {item.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low-performing Items */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📉</span>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#F5A623', margin: 0 }}>
              Low-Performing / Opportunities
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Veg Clear Soup', count: 3, note: 'Low orders · Consider recipe tweak' },
              { name: 'Fish Tikka Gravy', count: 4, note: 'High prep time · Review availability' },
              { name: 'Pineapple Raita', count: 6, note: 'Bundle with Biryani combos' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FFFDF8', border: '1px solid #FDF0D5', borderRadius: 8, fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#171717' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#6F6F6F' }}>{item.note}</div>
                </div>
                <span style={{ fontWeight: 800, color: '#C77700' }}>{item.count} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const kpiBoxStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 14,
  padding: '16px 18px',
  border: '1px solid #EAE0D0',
  boxShadow: '0 2px 6px rgba(74, 10, 16, 0.02)',
  display: 'flex',
  flexDirection: 'column',
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: '#6F6F6F',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};
