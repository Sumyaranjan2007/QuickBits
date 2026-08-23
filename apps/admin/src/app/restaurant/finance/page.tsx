'use client';
import React, { useState } from 'react';

const SETTLEMENTS = [
  { id: 'SET-2208', period: '15 Aug – 22 Aug 2026', orders: 48, gross: 24960, commission: 4992, taxes: 1248, discounts: 1200, refunds: 0, net: 17520, status: 'PENDING', dueDate: '25 Aug 2026' },
  { id: 'SET-2207', period: '08 Aug – 15 Aug 2026', orders: 52, gross: 27040, commission: 5408, taxes: 1352, discounts: 800, refunds: 300, net: 19180, status: 'PAID', paidDate: '18 Aug 2026' },
  { id: 'SET-2206', period: '01 Aug – 08 Aug 2026', orders: 44, gross: 22880, commission: 4576, taxes: 1144, discounts: 600, refunds: 0, net: 16560, status: 'PAID', paidDate: '11 Aug 2026' },
];

const LEDGER = [
  { date: '22 Aug 09:14', type: 'ORDER_CREDIT', orderId: 'QB-982144', description: 'Order credit: Rahul Sharma', amount: 512, credit: true },
  { date: '22 Aug 09:14', type: 'COMMISSION', orderId: 'QB-982144', description: 'Platform commission (20%)', amount: -102, credit: false },
  { date: '22 Aug 09:14', type: 'TAX', orderId: 'QB-982144', description: 'GST (5%)', amount: -26, credit: false },
  { date: '22 Aug 08:41', type: 'ORDER_CREDIT', orderId: 'QB-741290', description: 'Order credit: Priya Patel', amount: 648, credit: true },
  { date: '22 Aug 08:41', type: 'COMMISSION', orderId: 'QB-741290', description: 'Platform commission (20%)', amount: -130, credit: false },
  { date: '18 Aug 14:00', type: 'PAYOUT', orderId: 'SET-2207', description: 'Weekly settlement payout', amount: 19180, credit: true },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'settlements' | 'ledger'>('settlements');

  const pendingSettlement = SETTLEMENTS.find(s => s.status === 'PENDING');

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">💰 Financial Settlements & Ledger</h1>
          <p className="page-subtitle">Payouts, transaction history, and financial reporting</p>
        </div>
      </div>

      {/* ─── Pending Payout Banner ─── */}
      {pendingSettlement && (
        <div style={{ background: 'linear-gradient(135deg, #00B894, #55EFC4)', borderRadius: 16, padding: '18px 24px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600 }}>Next Settlement Due: {pendingSettlement.dueDate}</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>₹{pendingSettlement.net.toLocaleString()}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>For period: {pendingSettlement.period} · {pendingSettlement.orders} orders</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42, marginBottom: 4 }}>💳</div>
            <button
              style={{ background: '#fff', color: '#00B894', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
              onClick={() => window.print()}
            >
              📥 Download Statement
            </button>
          </div>
        </div>
      )}

      {/* ─── KPI Cards ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹74,880</div>
          <div className="stat-label">Gross Revenue (30d)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-value">₹14,976</div>
          <div className="stat-label">Commission Paid (20%)</div>
          <div className="stat-change down">Platform fee</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-value">₹53,260</div>
          <div className="stat-label">Net Payouts Received</div>
          <div className="stat-change up">↑ To your bank</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">₹17,520</div>
          <div className="stat-label">Pending Settlement</div>
          <div className="stat-change" style={{ color: '#FDCB6E' }}>Due: Mon 25 Aug</div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
        {[{ key: 'settlements', label: '📑 Settlement Batches' }, { key: 'ledger', label: '📒 Transaction Ledger' }].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === t.key ? 'var(--primary)' : 'transparent'}`, marginBottom: -2, transition: '0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Settlements Table ─── */}
      {activeTab === 'settlements' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Period</th>
                <th>Orders</th>
                <th>Gross Sales</th>
                <th>Commission</th>
                <th>Discounts</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SETTLEMENTS.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 900, color: 'var(--primary)' }}>{s.id}</td>
                  <td style={{ fontSize: 12 }}>{s.period}</td>
                  <td style={{ fontWeight: 700 }}>{s.orders}</td>
                  <td style={{ fontWeight: 700 }}>₹{s.gross.toLocaleString()}</td>
                  <td style={{ color: '#E17055', fontWeight: 700 }}>-₹{s.commission.toLocaleString()}</td>
                  <td style={{ color: '#E17055' }}>-₹{s.discounts}</td>
                  <td style={{ fontWeight: 900, color: '#00B894', fontSize: 15 }}>₹{s.net.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => window.print()} style={{ fontSize: 11 }}>
                      📥 Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Ledger ─── */}
      {activeTab === 'ledger' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Transaction Ledger</span>
            <span className="badge badge-neutral" style={{ fontSize: 11 }}>Append-Only · Immutable</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER.map((entry, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12, color: 'var(--text-sec)' }}>{entry.date}</td>
                  <td>
                    <span className={`badge ${
                      entry.type === 'ORDER_CREDIT' || entry.type === 'PAYOUT' ? 'badge-success' :
                      entry.type === 'COMMISSION' ? 'badge-error' :
                      entry.type === 'TAX' ? 'badge-warning' : 'badge-neutral'
                    }`} style={{ fontSize: 10 }}>
                      {entry.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>{entry.orderId}</td>
                  <td style={{ fontSize: 13 }}>{entry.description}</td>
                  <td style={{ fontWeight: 900, fontSize: 15, color: entry.credit ? '#00B894' : '#E17055' }}>
                    {entry.credit ? '+' : ''}₹{Math.abs(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
