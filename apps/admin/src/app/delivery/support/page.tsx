'use client';
import React, { useState } from 'react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  lastReply: string;
  messages: { sender: 'PARTNER' | 'SUPPORT'; text: string; time: string }[];
}

const DEMO_TICKETS: SupportTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'TKT-99120',
    category: 'PAYOUTS & SETTLEMENTS',
    subject: 'COD Cash Adjustment query for order QB-431980',
    status: 'RESOLVED',
    createdAt: 'Yesterday, 19:40',
    lastReply: 'Support Agent: Verified adjustment of ₹698 against weekly balance.',
    messages: [
      { sender: 'PARTNER', text: 'I collected ₹698 COD yesterday. Please confirm if it will be deducted from Monday payout or if I need to deposit via UPI.', time: 'Yesterday, 19:40' },
      { sender: 'SUPPORT', text: 'Hello Ramesh, COD cash collections under ₹2,000 are automatically adjusted against your weekly earnings payout on Monday. No manual UPI transfer is needed.', time: 'Yesterday, 20:05' },
    ],
  },
  {
    id: 't-2',
    ticketNumber: 'TKT-88419',
    category: 'DOCUMENTS & KYC',
    subject: 'Vehicle Insurance Renewal Upload',
    status: 'IN_PROGRESS',
    createdAt: '20 Aug, 11:20',
    lastReply: 'KYC Team: Document verification in progress (within 24 hours).',
    messages: [
      { sender: 'PARTNER', text: 'I have uploaded my renewed vehicle insurance policy document for Ather 450X.', time: '20 Aug, 11:20' },
      { sender: 'SUPPORT', text: 'Thank you for submitting the policy. Our compliance team is verifying the policy number with the insurer.', time: '20 Aug, 12:00' },
    ],
  },
];

const FAQS = [
  { q: 'When do I receive my weekly earnings payout?', a: 'All completed trip earnings, incentives, and tips are calculated every Sunday night and automatically transferred to your registered bank account every Monday by 10:00 AM.' },
  { q: 'How does Cash on Delivery (COD) cash handling work?', a: 'When you collect cash from a customer, keep the cash. The exact collected amount is simply deducted from your upcoming weekly bank transfer.' },
  { q: 'What should I do if a restaurant takes more than 15 minutes to prepare food?', a: 'Tap "Report Issue > Delay at Restaurant" on your active trip screen. You will automatically receive a ₹15 waiting compensation fee for every 10 minutes of delay.' },
  { q: 'What happens if a customer is unavailable to receive the order?', a: 'Call the customer twice through the app. Start the 5-minute waiting timer. If still unreachable, tap "Customer Unavailable" to initiate return/disposal and receive full trip pay.' },
  { q: 'How do I claim accidental insurance coverage in case of a road mishap?', a: 'Immediately press the SOS button in the Safety tab or call 1800-889-1099. QuickBite provides comprehensive ₹5,00,000 medical and hospital cashless coverage.' },
];

export default function DeliverySupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(DEMO_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const [newTicketForm, setNewTicketForm] = useState({
    category: 'TRIP_PAYOUTS',
    subject: '',
    description: '',
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject || !newTicketForm.description) {
      alert('Please fill all required fields');
      return;
    }
    const created: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      category: newTicketForm.category.replace('_', ' '),
      subject: newTicketForm.subject,
      status: 'OPEN',
      createdAt: 'Just Now',
      lastReply: 'Waiting for support agent assignment...',
      messages: [{ sender: 'PARTNER', text: newTicketForm.description, time: 'Just Now' }],
    };
    setTickets([created, ...tickets]);
    setShowNewTicketModal(false);
    setNewTicketForm({ category: 'TRIP_PAYOUTS', subject: '', description: '' });
    alert(`Support ticket ${created.ticketNumber} created. An agent will respond within 15 minutes.`);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    const updated = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        { sender: 'PARTNER' as const, text: replyText, time: 'Just Now' },
      ],
    };
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyText('');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🎧 Help & Partner Support</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            24x7 Dedicated delivery partner helpline, active ticket tracking, and fleet FAQs
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          style={{
            background: '#0984E3',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(9, 132, 227, 0.2)',
          }}
        >
          + Raise Support Ticket
        </button>
      </div>

      {/* ─── Helplines ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { title: '24x7 Partner Hotline', num: '1800-889-1099', desc: 'Avg wait time: < 30 secs', icon: '📞' },
          { title: 'WhatsApp Helpbot', num: '+91 98450 11990', desc: 'Instant automated answers', icon: '💬' },
          { title: 'Fleet Manager Indiranagar', num: '+91 99000 88210', desc: 'Zone Supervisor Anand', icon: '👤' },
        ].map((h, i) => (
          <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: 14, border: '1px solid #E2ECF5', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{h.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>{h.title}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#0C2340', marginTop: 2 }}>{h.num}</div>
              <div style={{ fontSize: 10, color: '#636E72', marginTop: 2 }}>{h.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Two-Column: My Tickets & FAQs ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Support Tickets Column */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
            📋 Your Support Tickets ({tickets.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  border: `1.5px solid ${selectedTicket?.id === t.id ? '#0984E3' : '#E2ECF5'}`,
                  background: selectedTicket?.id === t.id ? '#F0F7FF' : '#F8FAFD',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: '#0984E3' }}>{t.ticketNumber}</span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: t.status === 'RESOLVED' ? '#E8FFF8' : t.status === 'IN_PROGRESS' ? '#FFF9E6' : '#E8F4FD',
                    color: t.status === 'RESOLVED' ? '#00B894' : t.status === 'IN_PROGRESS' ? '#856404' : '#0984E3'
                  }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340' }}>{t.subject}</div>
                <div style={{ fontSize: 11, color: '#636E72', marginTop: 4 }}>{t.lastReply}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion Column */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
            ❓ Partner Frequently Asked Questions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} style={{ borderRadius: 10, border: '1px solid #E2ECF5', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: isOpen ? '#F8FAFD' : '#fff',
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: 800,
                      fontSize: 13,
                      color: '#0C2340',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: 14, color: '#0984E3' }}>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '12px 14px', background: '#F8FAFD', borderTop: '1px solid #E2ECF5', fontSize: 12, color: '#4A6FA5', lineHeight: 1.5 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Ticket Thread View Modal ─── */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,35,64,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #E2ECF5', paddingBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0984E3' }}>{selectedTicket.ticketNumber} • {selectedTicket.category}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0C2340', marginTop: 2 }}>{selectedTicket.subject}</div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#636E72' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
              {selectedTicket.messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.sender === 'PARTNER' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'PARTNER' ? '#E8F4FD' : '#F8FAFD',
                  border: `1px solid ${m.sender === 'PARTNER' ? '#0984E3' : '#E2ECF5'}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#0C2340'
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: m.sender === 'PARTNER' ? '#0984E3' : '#00B894', marginBottom: 2 }}>
                    {m.sender === 'PARTNER' ? 'You (Partner)' : 'QuickBite Support Officer'}
                  </div>
                  <div>{m.text}</div>
                  <div style={{ fontSize: 9, color: '#636E72', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #E2ECF5', paddingTop: 12, display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Type your message reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                style={{ background: '#0984E3', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 800, cursor: 'pointer' }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Raise New Ticket Modal ─── */}
      {showNewTicketModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,35,64,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <form onSubmit={handleCreateTicket} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340' }}>🎧 Raise Support Ticket</div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#636E72' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
                >
                  <option value="TRIP_PAYOUTS">Trip Earnings & Bank Payouts</option>
                  <option value="COD_DISCREPANCY">Cash on Delivery (COD) Discrepancy</option>
                  <option value="DOCUMENTS_KYC">Document Verification / Expiry</option>
                  <option value="VEHICLE_CHANGE">Change Registered Vehicle</option>
                  <option value="APP_TECH_ISSUE">App GPS / Technical Problem</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Subject / Order Number</label>
                <input
                  type="text"
                  placeholder="e.g. Incentive calculation missing for yesterday"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  placeholder="Explain your query in detail..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  style={{ width: '100%', height: 80, padding: '10px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 12, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2ECF5', background: '#fff', color: '#636E72', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#0984E3', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
