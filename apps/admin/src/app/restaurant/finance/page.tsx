'use client';
import React, { useState } from 'react';

const SETTLEMENTS_HISTORY = [
  {
    id: 'SET-99214',
    date: '2026-09-12',
    amount: 14250,
    grossSales: 15500,
    commission: 1100,
    taxes: 250,
    packaging: 100,
    status: 'PROCESSED',
    txId: 'HDFC-N9821441829',
    payoutBank: 'HDFC Bank (•••• 4821)',
  },
  {
    id: 'SET-99213',
    date: '2026-09-11',
    amount: 12890,
    grossSales: 14000,
    commission: 980,
    taxes: 230,
    packaging: 100,
    status: 'PROCESSED',
    txId: 'HDFC-N9811432910',
    payoutBank: 'HDFC Bank (•••• 4821)',
  },
  {
    id: 'SET-99212',
    date: '2026-09-10',
    amount: 16400,
    grossSales: 17800,
    commission: 1250,
    taxes: 280,
    packaging: 130,
    status: 'PROCESSED',
    txId: 'HDFC-N9791448201',
    payoutBank: 'HDFC Bank (•••• 4821)',
  },
  {
    id: 'SET-99215',
    date: '2026-09-13 (Today)',
    amount: 12450,
    grossSales: 13500,
    commission: 950,
    taxes: 200,
    packaging: 100,
    status: 'PENDING',
    txId: 'Processing Payout Cycle...',
    payoutBank: 'HDFC Bank (•••• 4821)',
  },
];

export default function RestaurantFinancePage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SETTLEMENTS' | 'BANK'>('OVERVIEW');
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [bankDetailsModal, setBankDetailsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [bankInfo, setBankInfo] = useState({
    accountHolder: 'QuickBite Food Ventures LLP',
    bankName: 'HDFC Bank Ltd.',
    accountNumber: '50200048219482',
    ifscCode: 'HDFC0001248',
    branch: 'Indiranagar Branch, Bengaluru',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const maskedAccount = `•••• •••• •••• ${bankInfo.accountNumber.slice(-4)}`;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            💰 Earnings & Financial Hub
          </h1>
          <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
            Daily revenue, commission statements, bank settlements, and payouts
          </p>
        </div>

        <button
          onClick={() => {
            const csv = 'Date,Gross Sales,Commission,Net Payout\n2026-09-12,15500,1100,14250';
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quickbite-settlement-statement.csv';
            a.click();
            showToast('Statement downloaded!');
          }}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            background: '#FAF6EF',
            border: '1px solid #EAE0D0',
            color: '#4A0A10',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          📥 Download Statement
        </button>
      </div>

      {/* ─── Subtabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #EAE0D0', paddingBottom: 10 }}>
        {[
          { key: 'OVERVIEW', label: 'Earnings Overview' },
          { key: 'SETTLEMENTS', label: 'Settlements & Payouts' },
          { key: 'BANK', label: 'Bank Details' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === t.key ? '#4A0A10' : 'transparent',
              color: activeTab === t.key ? '#FFFFFF' : '#6F6F6F',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: OVERVIEW ─── */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top 3 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>TODAY'S EARNINGS</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#4A0A10', marginTop: 6 }}>
                ₹12,450
              </div>
              <div style={{ fontSize: 12, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
                Ready for next bank payout cycle
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>THIS WEEK</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#171717', marginTop: 6 }}>
                ₹78,500
              </div>
              <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 4 }}>
                142 orders fulfilled
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={statLabelStyle}>THIS MONTH</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#171717', marginTop: 6 }}>
                ₹3,25,000
              </div>
              <div style={{ fontSize: 12, color: '#20A464', fontWeight: 700, marginTop: 4 }}>
                ↑ 18.5% growth vs last month
              </div>
            </div>
          </div>

          {/* Financial Breakdown & Net Payout */}
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
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
              Monthly Revenue Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF6EF', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: '#171717' }}>Gross Food Sales</span>
                <span style={{ fontWeight: 800, color: '#171717' }}>₹3,50,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FFF5F5', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: '#D64545' }}>Platform Commission (7.1%)</span>
                <span style={{ fontWeight: 800, color: '#D64545' }}>-₹25,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FFF5F5', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: '#D64545' }}>GST / Taxes Deducted</span>
                <span style={{ fontWeight: 800, color: '#D64545' }}>-₹5,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#E8F8F0', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, color: '#20A464' }}>Packaging Charges Collected</span>
                <span style={{ fontWeight: 800, color: '#20A464' }}>+₹3,000</span>
              </div>

              {/* NET PAYOUT (Prominent) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  borderRadius: 14,
                  marginTop: 6,
                  boxShadow: '0 4px 16px rgba(74, 10, 16, 0.25)',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#FFB21A', letterSpacing: 0.5 }}>
                    FINAL ESTIMATED EARNINGS
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>NET PAYOUT</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#FFB21A' }}>
                  ₹3,23,000
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SETTLEMENTS ─── */}
      {activeTab === 'SETTLEMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #EAE0D0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#171717', margin: 0 }}>
                Recent Payout Settlements
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {SETTLEMENTS_HISTORY.map(s => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #F0E8DC',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#171717' }}>
                      Settlement #{s.id}
                    </div>
                    <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 2 }}>
                      Date: {s.date} · {s.txId}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10' }}>
                        ₹{s.amount.toLocaleString()}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: s.status === 'PROCESSED' ? '#E8F8F0' : '#FFF7E6',
                          color: s.status === 'PROCESSED' ? '#20A464' : '#C77700',
                        }}
                      >
                        {s.status}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSettlement(s)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: '#FAF6EF',
                        border: '1px solid #EAE0D0',
                        color: '#4A0A10',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      VIEW DETAILS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: BANK DETAILS ─── */}
      {activeTab === 'BANK' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            maxWidth: 580,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
              Registered Bank Account
            </h3>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#20A464', background: '#E8F8F0', padding: '4px 8px', borderRadius: 6 }}>
              ✓ Verified for Direct Payouts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#FAF6EF', padding: '16px', borderRadius: 12, border: '1px solid #EAE0D0' }}>
            <div>
              <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>ACCOUNT HOLDER</span>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>{bankInfo.accountHolder}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>BANK NAME & BRANCH</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#171717' }}>{bankInfo.bankName} · {bankInfo.branch}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>ACCOUNT NUMBER</span>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#4A0A10', letterSpacing: 1 }}>{maskedAccount}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#6F6F6F', fontWeight: 700 }}>IFSC CODE</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#171717' }}>{bankInfo.ifscCode}</div>
            </div>
          </div>

          <button
            onClick={() => setBankDetailsModal(true)}
            style={{
              padding: '12px',
              borderRadius: 10,
              background: '#4A0A10',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            UPDATE BANK DETAILS
          </button>
        </div>
      )}

      {/* ─── Settlement Detail Modal ─── */}
      {selectedSettlement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedSettlement(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                Settlement Details
              </h3>
              <button
                onClick={() => setSelectedSettlement(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F6F6F' }}>Settlement ID</span>
                <strong>{selectedSettlement.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F6F6F' }}>Date</span>
                <strong>{selectedSettlement.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F6F6F' }}>Transaction Ref</span>
                <strong style={{ fontSize: 12 }}>{selectedSettlement.txId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6F6F6F' }}>Credited To</span>
                <strong>{selectedSettlement.payoutBank}</strong>
              </div>
              <div style={{ borderTop: '1px solid #EAE0D0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#4A0A10' }}>
                <span>Net Credited</span>
                <span>₹{selectedSettlement.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Update Bank Details Modal ─── */}
      {bankDetailsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setBankDetailsModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 460,
              width: '100%',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 14px' }}>
              Update Payout Account
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Account Number</label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={e => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', marginTop: 4 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>IFSC Code</label>
                <input
                  type="text"
                  value={bankInfo.ifscCode}
                  onChange={e => setBankInfo({ ...bankInfo, ifscCode: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', marginTop: 4 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setBankDetailsModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setBankDetailsModal(false);
                    showToast('Bank details submitted for verification!');
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#4A0A10', color: '#FFFFFF', fontWeight: 800 }}
                >
                  Save & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 16,
  padding: '20px',
  border: '1px solid #EAE0D0',
  boxShadow: '0 2px 8px rgba(74, 10, 16, 0.03)',
  display: 'flex',
  flexDirection: 'column',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: '#6F6F6F',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
};
