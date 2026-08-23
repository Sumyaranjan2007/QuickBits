'use client';
import React, { useState } from 'react';

interface PayoutRecord {
  id: string;
  transferId: string;
  amount: number;
  date: string;
  bankAccount: string;
  status: 'TRANSFERRED' | 'PROCESSING' | 'FAILED';
  period: string;
}

const PAYOUT_HISTORY: PayoutRecord[] = [
  { id: 'pay-101', transferId: 'UTR9821049281', amount: 6240, date: '18 Aug 2026, 06:30 AM', bankAccount: 'HDFC Bank •••• 4912', status: 'TRANSFERRED', period: '11 Aug - 17 Aug' },
  { id: 'pay-102', transferId: 'UTR8719204918', amount: 5890, date: '11 Aug 2026, 06:15 AM', bankAccount: 'HDFC Bank •••• 4912', status: 'TRANSFERRED', period: '04 Aug - 10 Aug' },
  { id: 'pay-103', transferId: 'UTR7619283019', amount: 6720, date: '04 Aug 2026, 07:00 AM', bankAccount: 'HDFC Bank •••• 4912', status: 'TRANSFERRED', period: '28 Jul - 03 Aug' },
  { id: 'pay-104', transferId: 'UTR6519201948', amount: 5410, date: '28 Jul 2026, 06:45 AM', bankAccount: 'HDFC Bank •••• 4912', status: 'TRANSFERRED', period: '21 Jul - 27 Jul' },
];

export default function DeliveryPayoutsPage() {
  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'COD_RECONCILIATION'>('PAYOUTS');
  const [withdrawing, setWithdrawing] = useState(false);

  // Cash on Delivery (COD) balance metrics
  const codCollectedTotal = 1396;
  const codDeposited = 1000;
  const codPendingToSettle = codCollectedTotal - codDeposited; // 396
  const walletEarningsBalance = 2480;

  const handleInstantWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      alert('Instant payout request of ₹2,000 sent to HDFC Bank (•••• 4912). UTR will be generated shortly.');
      setWithdrawing(false);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🏦 Bank Payouts & COD Ledger</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Manage weekly automatic bank settlements, instant payouts, and Cash on Delivery reconciliation
          </p>
        </div>

        <button
          onClick={handleInstantWithdraw}
          disabled={withdrawing}
          style={{
            background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(9, 132, 227, 0.25)',
          }}
        >
          {withdrawing ? 'Processing...' : '⚡ Request Instant Payout'}
        </button>
      </div>

      {/* ─── Balances Summary Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Weekly Settlement Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0984E3, #74B9FF)',
          borderRadius: 18,
          padding: '22px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(9, 132, 227, 0.15)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
            NEXT SCHEDULED PAYOUT
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4 }}>
            ₹{walletEarningsBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            📅 Transfer Date: <strong>Monday, 25 Aug 2026</strong>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            🏦 To: HDFC Bank (A/C •••• 4912)
          </div>
        </div>

        {/* COD Cash in Hand Card */}
        <div style={{
          background: codPendingToSettle > 0 ? '#FFF5F0' : '#E8FFF8',
          borderRadius: 18,
          padding: '22px',
          border: `2px solid ${codPendingToSettle > 0 ? '#E17055' : '#00B894'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: codPendingToSettle > 0 ? '#E17055' : '#00B894' }}>
            💵 COD CASH COLLECTED IN HAND
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#0C2340', marginTop: 4 }}>
            ₹{codPendingToSettle}
          </div>
          <div style={{ fontSize: 12, color: '#636E72', marginTop: 4 }}>
            Limit: ₹2,000 max • Will be adjusted against next payout
          </div>
          <div style={{ fontSize: 12, color: codPendingToSettle > 0 ? '#E17055' : '#00B894', fontWeight: 700, marginTop: 2 }}>
            {codPendingToSettle > 0 ? '⚠️ Pending adjustment against earnings' : '✓ All COD settled'}
          </div>
        </div>

        {/* Total Lifetime Payouts Card */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5', textTransform: 'uppercase' }}>
            TOTAL EARNINGS TRANSFERRED
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#00B894', marginTop: 4 }}>
            ₹24,260
          </div>
          <div style={{ fontSize: 12, color: '#636E72', marginTop: 4 }}>
            4 successful weekly payouts in August
          </div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('PAYOUTS')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'PAYOUTS' ? '#0C2340' : '#fff',
            color: activeTab === 'PAYOUTS' ? '#fff' : '#636E72',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          📜 Bank Payout History
        </button>

        <button
          onClick={() => setActiveTab('COD_RECONCILIATION')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'COD_RECONCILIATION' ? '#0C2340' : '#fff',
            color: activeTab === 'COD_RECONCILIATION' ? '#fff' : '#636E72',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          💵 Cash on Delivery (COD) Ledger
        </button>
      </div>

      {/* ─── Tab 1: Payout History Table ─── */}
      {activeTab === 'PAYOUTS' && (
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
            Direct Bank Deposits
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PAYOUT_HISTORY.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#F8FAFD',
                borderRadius: 12,
                border: '1px solid #E2ECF5',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8FFF8', color: '#00B894', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>
                    🏦
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340' }}>
                      ₹{item.amount.toLocaleString()} Payout ({item.period})
                    </div>
                    <div style={{ fontSize: 11, color: '#636E72', marginTop: 2 }}>
                      {item.bankAccount} • Ref: {item.transferId}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#00B894',
                    color: '#fff',
                    textTransform: 'uppercase'
                  }}>
                    {item.status}
                  </span>
                  <div style={{ fontSize: 11, color: '#636E72', marginTop: 4 }}>
                    {item.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tab 2: COD Reconciliation ─── */}
      {activeTab === 'COD_RECONCILIATION' && (
        <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
            Cash On Delivery (COD) Orders & Deposits
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { order: 'QB-982144', customer: 'Ananya Deshmukh', amount: 698, date: 'Today, 20:15 PM', status: 'PENDING_ADJUSTMENT' },
              { order: 'QB-431980', customer: 'Vikram Sethi', amount: 698, date: 'Yesterday, 19:10 PM', status: 'ADJUSTED' },
              { order: 'DEPOSIT-1102', customer: 'UPI Deposit to Platform', amount: -1000, date: '21 Aug, 14:00 PM', status: 'DEPOSITED' },
            ].map((entry, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#F8FAFD',
                borderRadius: 12,
                border: '1px solid #E2ECF5'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0C2340' }}>
                    {entry.order} — {entry.customer}
                  </div>
                  <div style={{ fontSize: 11, color: '#636E72' }}>{entry.date}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: entry.amount > 0 ? '#E17055' : '#00B894' }}>
                    {entry.amount > 0 ? `+₹${entry.amount} Cash In Hand` : `-₹${Math.abs(entry.amount)} Deposited`}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#4A6FA5' }}>
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
