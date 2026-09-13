'use client';
import React, { useState, useEffect } from 'react';
import { deliveryApi } from '@quickbite/api-client';

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  bankName: string;
  accountEnding: string;
  status: 'PROCESSED' | 'PROCESSING';
}

const DEFAULT_PAYOUTS: PayoutRecord[] = [
  { id: 'po-101', date: '08 Sep 2026', amount: 5840, bankName: 'HDFC Bank', accountEnding: '9876', status: 'PROCESSED' },
  { id: 'po-102', date: '01 Sep 2026', amount: 6120, bankName: 'HDFC Bank', accountEnding: '9876', status: 'PROCESSED' },
  { id: 'po-103', date: '25 Aug 2026', amount: 4950, bankName: 'HDFC Bank', accountEnding: '9876', status: 'PROCESSED' },
  { id: 'po-104', date: '18 Aug 2026', amount: 5380, bankName: 'HDFC Bank', accountEnding: '9876', status: 'PROCESSED' },
];

export default function DeliveryEarningsPage() {
  const [earnings, setEarnings] = useState({
    todayEarnings: 942,
    thisWeek: 5840,
    thisMonth: 21450,
    deliveryEarnings: 720,
    incentives: 120,
    tips: 80,
    adjustments: 22,
  });

  const [payouts] = useState<PayoutRecord[]>(DEFAULT_PAYOUTS);

  useEffect(() => {
    deliveryApi.getEarnings()
      .then(res => {
        const d = res.data as any;
        if (d) {
          setEarnings(prev => ({
            ...prev,
            todayEarnings: d.todayEarnings || prev.todayEarnings,
            thisWeek: d.weekEarnings || prev.thisWeek,
            thisMonth: d.monthEarnings || prev.thisMonth,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ─── Screen Header ─── */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
          Earnings & Wallet
        </h1>
        <p style={{ fontSize: 11, color: '#7A6A5E', margin: '2px 0 0' }}>
          Transparent daily payouts & settlement ledger
        </p>
      </div>

      {/* ─── 1. TODAY'S EARNINGS HERO CARD (Customer App Styling) ─── */}
      <div className="delivery-duty-card">
        <div className="delivery-duty-tag">
          TODAY&apos;S TOTAL
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: '#FFB21A', letterSpacing: -0.5 }}>
          ₹{earnings.todayEarnings.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250, 247, 242, 0.85)', marginTop: 4 }}>
          Earnings will be automatically deposited in your weekly settlement
        </div>
      </div>

      {/* ─── 2. THIS WEEK & THIS MONTH CARDS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="delivery-card">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#7A6A5E', textTransform: 'uppercase' }}>
            This Week
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#4A0A10', marginTop: 4 }}>
            ₹{earnings.thisWeek.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#047857', fontWeight: 700, marginTop: 2 }}>
            ↑ 14% vs last week
          </div>
        </div>

        <div className="delivery-card">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#7A6A5E', textTransform: 'uppercase' }}>
            This Month
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#4A0A10', marginTop: 4 }}>
            ₹{earnings.thisMonth.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11, color: '#7A6A5E', fontWeight: 600, marginTop: 2 }}>
            Total 247 deliveries
          </div>
        </div>
      </div>

      {/* ─── 3. EARNINGS BREAKDOWN ─── */}
      <div className="delivery-card">
        <div className="delivery-card-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>📊</span>
            <span>TODAY&apos;S BREAKDOWN</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px dashed #EADBCE', paddingBottom: 8 }}>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>🛵 Delivery Earnings</span>
            <span style={{ fontWeight: 800, color: '#1A1A1A' }}>₹{earnings.deliveryEarnings}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px dashed #EADBCE', paddingBottom: 8 }}>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>🎁 Incentives & Peak Surge</span>
            <span style={{ fontWeight: 800, color: '#047857' }}>+₹{earnings.incentives}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderBottom: '1px dashed #EADBCE', paddingBottom: 8 }}>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>💖 Customer Tips</span>
            <span style={{ fontWeight: 800, color: '#047857' }}>+₹{earnings.tips}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, paddingBottom: 2 }}>
            <span style={{ color: '#1A1A1A', fontWeight: 600 }}>⚖️ Adjustments / Tolls</span>
            <span style={{ fontWeight: 800, color: '#1A1A1A' }}>+₹{earnings.adjustments}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #EADBCE' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#4A0A10' }}>Total Daily Earnings</span>
          <span style={{ fontSize: 17, fontWeight: 900, color: '#4A0A10' }}>₹{earnings.todayEarnings}</span>
        </div>
      </div>

      {/* ─── 4. PAYOUT HISTORY ─── */}
      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          color: '#7A6A5E',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 10,
        }}>
          PAYOUT HISTORY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payouts.map(p => (
            <div key={p.id} className="delivery-card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
                    {p.bankName} •••• {p.accountEnding}
                  </div>
                  <div style={{ fontSize: 11, color: '#7A6A5E', marginTop: 2 }}>
                    Settled on {p.date}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#047857' }}>
                    ₹{p.amount.toLocaleString('en-IN')}
                  </div>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    background: '#F0FDF4',
                    color: '#047857',
                    border: '1px solid #A7F3D0',
                    padding: '2px 6px',
                    borderRadius: 6,
                    display: 'inline-block',
                    marginTop: 2,
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
