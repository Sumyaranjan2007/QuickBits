'use client';
import React, { useState } from 'react';

const SUPPORT_CATEGORIES = [
  { key: 'ORDER', label: 'Order Issues', icon: '📦', desc: 'Cancellations, item disputes, customer refunds' },
  { key: 'PAYMENT', label: 'Payment Issues', icon: '💳', desc: 'UPI failures, gateway sync, customer payment errors' },
  { key: 'DELIVERY', label: 'Delivery Issues', icon: '🛵', desc: 'Rider delayed, wrong delivery location, pickup disputes' },
  { key: 'SETTLEMENT', label: 'Settlement Issues', icon: '💰', desc: 'Bank payout delays, commission calculations, tax invoice' },
  { key: 'ACCOUNT', label: 'Account Issues', icon: '⚙️', desc: 'Login troubles, branch transfer, staff access' },
];

const FAQS = [
  {
    q: 'How do daily payouts work?',
    a: 'Settlements for completed orders are processed daily by 6:00 AM directly into your verified bank account after standard commission and tax deductions.',
  },
  {
    q: 'What should I do if a delivery partner does not arrive on time?',
    a: 'If food is marked Ready and the rider has not arrived within 10 minutes, our automated dispatch algorithm automatically reassigns the order to the nearest active rider.',
  },
  {
    q: 'How do I temporarily pause orders during a heavy rush?',
    a: 'Click the Status pill in the top header or the Pause button on your dashboard to pause orders for 15, 30, or 60 minutes.',
  },
  {
    q: 'What are the required packing standards for hot gravy items?',
    a: 'Use tamper-evident spill-proof containers with securely taped lids and QuickBite branded delivery bags to ensure temperature retention.',
  },
];

const GUIDELINES = [
  { title: 'Packing & Hygiene Standards', desc: 'Always double-seal hot curries and attach thermal stickers to beverages.' },
  { title: 'Average Prep Time Target', desc: 'Maintain an average food preparation time under 15 minutes to earn the Fast Prep Badge.' },
  { title: 'Cancellation Policy', desc: 'Order rejections without valid inventory reasons increase merchant cancellation rates and affect store ranking.' },
];

export default function RestaurantSupportPage() {
  const [ticketModal, setTicketModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState('ORDER');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTicket = () => {
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      alert('Please provide a subject and details for your ticket');
      return;
    }
    setTicketModal(false);
    setTicketSubject('');
    setTicketDetails('');
    showToast('Support ticket #TKT-88412 created! Priority team will respond within 15 mins.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
            🎧 Partner Help & Support Desk
          </h1>
          <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
            24/7 dedicated merchant assistance and operational guides
          </p>
        </div>

        <button
          onClick={() => setTicketModal(true)}
          style={{
            padding: '11px 20px',
            borderRadius: 10,
            background: '#FFB21A',
            color: '#171717',
            fontWeight: 900,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 178, 26, 0.3)',
            minHeight: 44,
          }}
        >
          + CREATE SUPPORT TICKET
        </button>
      </div>

      {/* ─── Support Categories ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {SUPPORT_CATEGORIES.map(cat => (
          <div
            key={cat.key}
            onClick={() => {
              setSelectedCat(cat.key);
              setTicketModal(true);
            }}
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #EAE0D0',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              cursor: 'pointer',
              transition: 'transform 0.15s',
            }}
          >
            <div style={{ fontSize: 28 }}>{cat.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>{cat.label}</div>
            <div style={{ fontSize: 12, color: '#6F6F6F', lineHeight: 1.3 }}>{cat.desc}</div>
          </div>
        ))}
      </div>

      {/* ─── Grid: Guidelines & FAQs ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Guidelines */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
            📖 Merchant Guidelines & Packing Standards
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GUIDELINES.map((g, i) => (
              <div key={i} style={{ background: '#FAF6EF', padding: '12px 14px', borderRadius: 10, border: '1px solid #EAE0D0' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#4A0A10' }}>{g.title}</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
            ❓ Frequently Asked Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #F0E8DC', paddingBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#171717' }}>{faq.q}</div>
                <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 4, lineHeight: 1.4 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Create Ticket Modal ─── */}
      {ticketModal && (
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
          onClick={() => setTicketModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 480,
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 16px' }}>
              Create Partner Support Ticket
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Category</label>
                <select
                  value={selectedCat}
                  onChange={e => setSelectedCat(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', marginTop: 4 }}
                >
                  {SUPPORT_CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Subject *</label>
                <input
                  type="text"
                  placeholder="e.g. Order #QB1024 rider dispute"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Description & Details *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue with order ID, date, or specific amount..."
                  value={ticketDetails}
                  onChange={e => setTicketDetails(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', marginTop: 4, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setTicketModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#4A0A10', color: '#FFFFFF', fontWeight: 800 }}
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
