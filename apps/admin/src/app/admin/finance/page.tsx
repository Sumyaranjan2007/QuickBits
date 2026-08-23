'use client';
import React, { useState } from 'react';

interface Settlement {
  id: string;
  restaurant: string;
  grossSales: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  status: 'PAID' | 'PENDING';
  period: string;
}

const SETTLEMENTS: Settlement[] = [
  { id: 'SET-101', restaurant: 'Burger & Co.', grossSales: 18450, commissionRate: 20, commissionAmount: 3690, netPayout: 14760, status: 'PENDING', period: '15 Aug - 22 Aug' },
  { id: 'SET-102', restaurant: 'Spice Symphony', grossSales: 24200, commissionRate: 22, commissionAmount: 5324, netPayout: 18876, status: 'PAID', period: '08 Aug - 15 Aug' },
  { id: 'SET-103', restaurant: 'Pizzeria Bella', grossSales: 12800, commissionRate: 18, commissionAmount: 2304, netPayout: 10496, status: 'PAID', period: '08 Aug - 15 Aug' },
];

export default function AdminFinancePage() {
  const [settlements, setSettlements] = useState<Settlement[]>(SETTLEMENTS);
  const [activeTab, setActiveTab] = useState<'settlements' | 'driver_payouts' | 'refunds'>('settlements');

  const handleSettle = (id: string) => {
    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'PAID' } : s));
    alert(`Settlement #${id} approved and processed to merchant bank account.`);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">💰 Financial Control & Settlement Ledger</h1>
          <p className="page-subtitle">Commission calculations, merchant settlements, driver earnings, and refunds</p>
        </div>
      </div>

      {/* ─── Financial Metric Cards ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">₹55,450</div>
          <div className="stat-label">Gross Sales Volume (GMV)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-value">₹11,318</div>
          <div className="stat-label">Platform Commission Retained</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">₹44,132</div>
          <div className="stat-label">Net Merchant Payouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛵</div>
          <div className="stat-value">₹5,820</div>
          <div className="stat-label">Driver Earnings & Tips</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">₹0</div>
          <div className="stat-label">Refund Disputed Volume</div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24 }}>
        <button
          className={`filter-pill ${activeTab === 'settlements' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlements')}
        >
          🍽️ Restaurant Settlements ({settlements.length})
        </button>
        <button
          className={`filter-pill ${activeTab === 'driver_payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('driver_payouts')}
        >
          🛵 Delivery Fleet Payouts (4)
        </button>
        <button
          className={`filter-pill ${activeTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setActiveTab('refunds')}
        >
          🔄 Refund Requests (0)
        </button>
      </div>

      {/* ─── Restaurant Settlements Table ─── */}
      {activeTab === 'settlements' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Merchant Settlement Batches</span>
            <span className="badge badge-primary">Automated Ledger</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Restaurant</th>
                <th>Period</th>
                <th>Gross Sales</th>
                <th>Commission</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{s.id}</td>
                  <td style={{ fontWeight: 700 }}>{s.restaurant}</td>
                  <td className="text-sm text-muted">{s.period}</td>
                  <td style={{ fontWeight: 700 }}>₹{s.grossSales.toLocaleString()}</td>
                  <td style={{ color: '#00B894', fontWeight: 800 }}>{s.commissionRate}% (₹{s.commissionAmount.toLocaleString()})</td>
                  <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{s.netPayout.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${s.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status === 'PENDING' ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSettle(s.id)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6 }}
                      >
                        ✓ Release Payout
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#00B894', fontWeight: 800 }}>✓ Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Driver Payouts Table ─── */}
      {activeTab === 'driver_payouts' && (
        <div className="table-container">
          <div className="table-header">
            <span className="table-title">Delivery Partner Earnings &amp; Incentives</span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Vehicle</th>
                <th>Trips</th>
                <th>Distance Pay</th>
                <th>Tips</th>
                <th>Total Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Amit Verma', vehicle: 'KA-01-EQ-9876', trips: 42, pay: 1680, tips: 240, total: 1920, status: 'PAID' },
                { name: 'Suresh Kumar', vehicle: 'KA-05-AB-1234', trips: 36, pay: 1440, tips: 180, total: 1620, status: 'PAID' },
                { name: 'Ravi Teja', vehicle: 'KA-03-EV-4412', trips: 28, pay: 1120, tips: 160, total: 1280, status: 'PENDING' },
                { name: 'Mohammed Ali', vehicle: 'KA-04-TR-8821', trips: 22, pay: 880, tips: 120, total: 1000, status: 'PAID' },
              ].map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 800 }}>{p.name}</td>
                  <td className="text-sm">{p.vehicle}</td>
                  <td style={{ fontWeight: 700 }}>{p.trips} trips</td>
                  <td>₹{p.pay}</td>
                  <td style={{ color: '#00B894', fontWeight: 700 }}>+ ₹{p.tips}</td>
                  <td style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{p.total}</td>
                  <td>
                    <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Refunds Empty State ─── */}
      {activeTab === 'refunds' && (
        <div className="table-container">
          <div className="empty-state" style={{ padding: 60 }}>
            <div className="empty-state-icon">🛡️</div>
            <div className="empty-state-title">No pending refund requests</div>
            <div className="empty-state-text">All customer transactions are verified and settled with 100% compliance.</div>
          </div>
        </div>
      )}
    </div>
  );
}
