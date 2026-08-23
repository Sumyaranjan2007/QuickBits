'use client';
import React, { useState } from 'react';

const WEEK_DATA = [
  { day: 'Mon', orders: 22, revenue: 11440 },
  { day: 'Tue', orders: 31, revenue: 16120 },
  { day: 'Wed', orders: 18, revenue: 9360 },
  { day: 'Thu', orders: 40, revenue: 20800 },
  { day: 'Fri', orders: 55, revenue: 28600 },
  { day: 'Sat', orders: 72, revenue: 37440 },
  { day: 'Sun', orders: 64, revenue: 33280 },
];

const HOUR_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  label: h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`,
  orders: h >= 12 && h <= 14 ? Math.floor(Math.random() * 15 + 10) :
          h >= 19 && h <= 22 ? Math.floor(Math.random() * 20 + 12) :
          h >= 11 && h < 12 ? Math.floor(Math.random() * 8 + 5) :
          h >= 8 && h < 11 ? Math.floor(Math.random() * 5 + 2) : 0,
}));

const TOP_DISHES = [
  { name: 'Classic Smash Cheeseburger', orders: 128, revenue: 36992, rating: 4.9, trend: 'up' },
  { name: 'Hyderabadi Chicken Biryani', orders: 98, revenue: 34202, rating: 4.8, trend: 'up' },
  { name: 'Margherita Burrata Pizza', orders: 76, revenue: 34124, rating: 4.7, trend: 'stable' },
  { name: 'Paneer Tikka Burger', orders: 64, revenue: 15936, rating: 4.6, trend: 'down' },
  { name: 'Peri Peri Loaded Fries', orders: 52, revenue: 8268, rating: 4.5, trend: 'up' },
];

const maxBar = Math.max(...WEEK_DATA.map(d => d.revenue));
const maxHour = Math.max(...HOUR_DATA.map(d => d.orders));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7DAYS');
  const [metric, setMetric] = useState<'orders' | 'revenue'>('revenue');

  const totalRevenue = WEEK_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = WEEK_DATA.reduce((s, d) => s + d.orders, 0);
  const aov = Math.round(totalRevenue / totalOrders);
  const commissionPaid = Math.round(totalRevenue * 0.20);
  const netPayout = totalRevenue - commissionPaid;

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">📈 Sales Analytics</h1>
          <p className="page-subtitle">Business intelligence and performance metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['TODAY', '7DAYS', '30DAYS', 'THIS_MONTH'].map(p => (
            <button key={p} className={`filter-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)} style={{ fontSize: 12 }}>
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ─── KPI Summary ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '💰', label: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '↑ +18%', up: true },
          { icon: '📦', label: 'Total Orders', value: String(totalOrders), change: '↑ +22%', up: true },
          { icon: '💵', label: 'Avg Order Value', value: `₹${aov}`, change: '↑ ₹34', up: true },
          { icon: '🤝', label: 'Commission Paid', value: `₹${commissionPaid.toLocaleString()}`, change: '20% of GMV', up: false },
          { icon: '🏦', label: 'Net Payout', value: `₹${netPayout.toLocaleString()}`, change: 'After commission', up: true },
          { icon: '✅', label: 'Acceptance Rate', value: '94%', change: '↑ +2%', up: true },
          { icon: '⏱️', label: 'Avg Prep Time', value: '22 min', change: '↓ 3 min faster', up: true },
          { icon: '🔴', label: 'Cancellation Rate', value: '3.2%', change: '↓ Low', up: true },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{k.icon}</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{k.value}</div>
            <div className="stat-label">{k.label}</div>
            <div className={`stat-change ${k.up ? 'up' : 'down'}`}>{k.change}</div>
          </div>
        ))}
      </div>

      {/* ─── Revenue Chart ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Revenue — Last 7 Days</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`filter-pill ${metric === 'revenue' ? 'active' : ''}`} style={{ fontSize: 11 }} onClick={() => setMetric('revenue')}>Revenue</button>
              <button className={`filter-pill ${metric === 'orders' ? 'active' : ''}`} style={{ fontSize: 11 }} onClick={() => setMetric('orders')}>Orders</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130 }}>
            {WEEK_DATA.map(d => {
              const val = metric === 'revenue' ? d.revenue : d.orders;
              const max = metric === 'revenue' ? maxBar : Math.max(...WEEK_DATA.map(x => x.orders));
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-sec)' }}>
                    {metric === 'revenue' ? `₹${Math.round(val / 1000)}k` : val}
                  </div>
                  <div style={{
                    width: '100%', background: 'var(--primary)', borderRadius: '5px 5px 0 0',
                    height: `${Math.round((val / max) * 110)}px`, transition: '0.3s',
                    opacity: d.day === 'Sat' ? 1 : 0.65,
                  }} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Hourly Heatmap ─── */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20 }}>⏰ Peak Hours Heatmap</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {HOUR_DATA.map(h => {
              const intensity = maxHour > 0 ? h.orders / maxHour : 0;
              return (
                <div
                  key={h.hour}
                  title={`${h.label}: ${h.orders} orders`}
                  style={{
                    width: 36, height: 36, borderRadius: 6, cursor: 'pointer',
                    background: intensity > 0 ? `rgba(0,184,148,${0.15 + intensity * 0.85})` : '#F5F5F5',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    transition: '0.2s',
                  }}
                >
                  <div style={{ fontSize: 8, color: intensity > 0.5 ? '#fff' : '#888', fontWeight: 700 }}>{h.label}</div>
                  {h.orders > 0 && <div style={{ fontSize: 8, fontWeight: 900, color: intensity > 0.5 ? '#fff' : 'var(--primary)' }}>{h.orders}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>🍽️ Peak: 12pm–2pm, 7pm–10pm</span>
          </div>
        </div>
      </div>

      {/* ─── Top Dishes Performance ─── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">🍕 Menu Item Performance</span>
          <span className="badge badge-primary">Last 7 Days</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Dish Name</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Rating</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {TOP_DISHES.map((d, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 16 }}>{i + 1}</td>
                <td style={{ fontWeight: 700 }}>{d.name}</td>
                <td style={{ fontWeight: 700 }}>{d.orders}</td>
                <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{d.revenue.toLocaleString()}</td>
                <td>
                  <span style={{ color: '#FDCB6E' }}>★</span>
                  <span style={{ fontWeight: 800 }}> {d.rating}</span>
                </td>
                <td>
                  <span className={`badge ${d.trend === 'up' ? 'badge-success' : d.trend === 'down' ? 'badge-error' : 'badge-neutral'}`}>
                    {d.trend === 'up' ? '↑ BESTSELLER' : d.trend === 'down' ? '↓ SLOW MOVER' : '→ STABLE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
