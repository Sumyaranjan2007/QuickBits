'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface LedgerItem {
  id: string;
  type: 'TRIP_PAYOUT' | 'INCENTIVE' | 'TIP' | 'SURGE_BONUS' | 'DEDUCTION' | 'PAYOUT_TRANSFER';
  title: string;
  orderNumber?: string;
  amount: number;
  date: string;
  status: 'SETTLED' | 'PENDING';
}

const WEEKLY_DATA = [
  { day: 'Mon', trips: 14, earnings: 920 },
  { day: 'Tue', trips: 16, earnings: 1040 },
  { day: 'Wed', trips: 12, earnings: 780 },
  { day: 'Thu', trips: 18, earnings: 1190 },
  { day: 'Fri', trips: 22, earnings: 1540 },
  { day: 'Sat', trips: 26, earnings: 1820 },
  { day: 'Sun (Today)', trips: 14, earnings: 942 },
];

const LEDGER_ITEMS: LedgerItem[] = [
  { id: 'tx-1', type: 'TRIP_PAYOUT', title: 'Trip Payout', orderNumber: 'QB-982144', amount: 104, date: 'Today, 20:15', status: 'SETTLED' },
  { id: 'tx-2', type: 'TIP', title: 'Customer Tip', orderNumber: 'QB-881290', amount: 30, date: 'Today, 18:40', status: 'SETTLED' },
  { id: 'tx-3', type: 'TRIP_PAYOUT', title: 'Trip Payout', orderNumber: 'QB-881290', amount: 68, date: 'Today, 18:40', status: 'SETTLED' },
  { id: 'tx-4', type: 'INCENTIVE', title: 'Lunch Surge Completion Bonus', amount: 150, date: 'Today, 15:00', status: 'SETTLED' },
  { id: 'tx-5', type: 'TRIP_PAYOUT', title: 'Trip Payout', orderNumber: 'QB-773192', amount: 107, date: 'Today, 14:15', status: 'SETTLED' },
  { id: 'tx-6', type: 'SURGE_BONUS', title: 'Rain Surge Multiplier', orderNumber: 'QB-542198', amount: 20, date: 'Yesterday, 21:30', status: 'SETTLED' },
  { id: 'tx-7', type: 'PAYOUT_TRANSFER', title: 'Weekly Bank Settlement Transfer', amount: -6240, date: '18 Aug, 06:00', status: 'SETTLED' },
];

export default function DeliveryEarningsPage() {
  const [period, setPeriod] = useState<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>('TODAY');

  const maxEarning = Math.max(...WEEKLY_DATA.map((w) => w.earnings));
  const totalWeekly = WEEKLY_DATA.reduce((acc, curr) => acc + curr.earnings, 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>💰 Earnings & Wallet</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Transparent daily earnings, surge bonuses, customer tips, and bank settlement ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/delivery/payouts"
            style={{
              background: '#0984E3',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🏦</span> Bank Payouts
          </Link>
        </div>
      </div>

      {/* ─── Period Switcher ─── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['TODAY', 'THIS_WEEK', 'THIS_MONTH'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: period === p ? '#0C2340' : '#fff',
              color: period === p ? '#fff' : '#636E72',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
          >
            {p === 'THIS_WEEK' ? 'This Week (7 Days)' : p === 'THIS_MONTH' ? 'This Month (August)' : "Today's Summary"}
          </button>
        ))}
      </div>

      {/* ─── Master Earnings Hero Card ─── */}
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
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
            {period === 'TODAY' ? "TODAY'S NET EARNINGS" : period === 'THIS_WEEK' ? 'TOTAL WEEKLY EARNINGS' : 'MONTHLY EARNINGS'}
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, marginTop: 4 }}>
            ₹{period === 'TODAY' ? '942' : period === 'THIS_WEEK' ? totalWeekly.toLocaleString() : '28,450'}
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            {period === 'TODAY' ? '14 Trips Completed • ₹67.2 avg / trip' : '122 Trips Completed • Payout due on Mon, 25 Aug'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '14px 20px', borderRadius: 14, backdropFilter: 'blur(4px)', textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>WALLET UNSETTLED BALANCE</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>₹{totalWeekly.toLocaleString()}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Auto-transfers every Monday</div>
        </div>
      </div>

      {/* ─── Detailed Earnings Breakdown (Formula) ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5', marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
          📊 Detailed Revenue Itemization ({period === 'TODAY' ? 'Today' : 'This Week'})
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Base Pay (Pick & Drop)', amount: period === 'TODAY' ? 490 : 3800, icon: '📦', color: '#0984E3' },
            { label: 'Distance Allowance Pay', amount: period === 'TODAY' ? 242 : 1940, icon: '🛣️', color: '#00B894' },
            { label: 'Peak Hour & Rain Surge', amount: period === 'TODAY' ? 90 : 850, icon: '⚡', color: '#E17055' },
            { label: 'Daily / Streak Incentives', amount: period === 'TODAY' ? 150 : 1100, icon: '🎯', color: '#6C5CE7' },
            { label: 'Direct Customer Tips', amount: period === 'TODAY' ? 120 : 542, icon: '❤️', color: '#FD79A8' },
            { label: 'COD Cash Collected', amount: period === 'TODAY' ? 698 : 4210, icon: '💵', color: '#E67E22' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#F8FAFD', padding: '14px', borderRadius: 12, border: '1px solid #E2ECF5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: item.color }}>₹{item.amount.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', marginTop: 8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 7-Day Performance Bar Chart ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340' }}>
            📅 Last 7 Days Daily Earnings Trend
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00B894', background: '#E8FFF8', padding: '4px 10px', borderRadius: 6 }}>
            Top Earning Day: Sat (₹1,820)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 160, padding: '10px 0' }}>
          {WEEKLY_DATA.map((item, idx) => {
            const heightPercent = (item.earnings / maxEarning) * 100;
            const isToday = idx === WEEKLY_DATA.length - 1;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: isToday ? '#0984E3' : '#636E72', marginBottom: 6 }}>
                  ₹{item.earnings}
                </div>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  background: isToday ? 'linear-gradient(180deg, #0984E3, #00CEC9)' : '#E2ECF5',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.3s ease'
                }} />
                <div style={{ fontSize: 11, fontWeight: isToday ? 900 : 600, color: isToday ? '#0984E3' : '#636E72', marginTop: 8 }}>
                  {item.day.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Transaction Ledger (Immutable Entries) ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340' }}>
            📒 Transaction Ledger
          </div>
          <span style={{ fontSize: 11, color: '#636E72' }}>Immutable financial ledger</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LEDGER_ITEMS.map((tx) => (
            <div key={tx.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              background: '#F8FAFD',
              borderRadius: 10,
              border: '1px solid #E2ECF5'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: tx.amount > 0 ? '#E8FFF8' : '#FFF5F0',
                  color: tx.amount > 0 ? '#00B894' : '#E17055',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 900
                }}>
                  {tx.amount > 0 ? '+' : '−'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0C2340' }}>
                    {tx.title} {tx.orderNumber && `(${tx.orderNumber})`}
                  </div>
                  <div style={{ fontSize: 11, color: '#636E72' }}>{tx.date} • {tx.status}</div>
                </div>
              </div>

              <div style={{
                fontSize: 16,
                fontWeight: 900,
                color: tx.amount > 0 ? '#00B894' : '#E17055'
              }}>
                {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
