'use client';
import React, { useState } from 'react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  messages: { sender: string; text: string; ts: string }[];
}

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'TKT-1201', subject: 'Settlement delayed for last week', category: 'PAYMENTS',
    status: 'IN_PROGRESS', priority: 'HIGH', createdAt: '21 Aug 2026',
    messages: [
      { sender: 'Restaurant', text: 'My settlement for Aug 8-15 has not been credited to my bank account yet. Expected on Aug 18.', ts: '21 Aug, 14:00' },
      { sender: 'Support', text: 'We\'ve escalated this to our finance team. Please allow 24 more hours for resolution. Ticket reference: FNCE-8821.', ts: '21 Aug, 16:30' },
    ],
  },
  {
    id: 'TKT-1189', subject: 'Customer reported missing item', category: 'ORDERS',
    status: 'RESOLVED', priority: 'MEDIUM', createdAt: '19 Aug 2026',
    messages: [
      { sender: 'Restaurant', text: 'Customer order QB-741290 claims garlic bread was missing. We did include it in the packaging.', ts: '19 Aug, 20:00' },
      { sender: 'Support', text: 'Reviewed CCTV and photos from our delivery partner. Confirmed item was included. Customer refund declined. Case closed.', ts: '20 Aug, 11:00' },
    ],
  },
];

const CATEGORIES = ['ORDERS', 'PAYMENTS', 'SETTLEMENTS', 'MENU', 'DELIVERY', 'CUSTOMER_ISSUE', 'TECHNICAL', 'ACCOUNT', 'OTHER'];
const FAQS = [
  { q: 'How are settlement amounts calculated?', a: 'Settlement = Gross Sales - Platform Commission (20%) - GST (5%) - Any coupon discounts funded by QuickBite. Refunds and adjustments are applied separately.' },
  { q: 'When will I receive my weekly payout?', a: 'Payouts are processed every Monday for the previous week (Mon-Sun). Bank transfer takes 1-2 business days. You can track this in Finance > Settlements.' },
  { q: 'How do I temporarily pause orders?', a: 'Use the restaurant status toggle at the top of your sidebar. Select "Pause 30 min" or "Close Today". Orders will not be accepted during the pause period.' },
  { q: 'A customer claims their order was wrong. What do I do?', a: 'Navigate to the specific order, then click "Report Issue". Our team will review the complaint and decide on refund eligibility based on evidence.' },
  { q: 'How do I update my bank account for payouts?', a: 'Bank account changes require identity verification. Contact support via a ticket with category "Account" and our KYC team will guide you through the process.' },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(DEMO_TICKETS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', category: 'ORDERS', description: '', priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.subject || !form.description) { alert('Subject and description are required'); return; }
    setCreating(true);
    await new Promise(r => setTimeout(r, 600));
    const newTicket: Ticket = {
      id: `TKT-${1200 + tickets.length + 1}`,
      subject: form.subject,
      category: form.category,
      status: 'OPEN',
      priority: form.priority,
      createdAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      messages: [{ sender: 'Restaurant', text: form.description, ts: new Date().toLocaleTimeString() }],
    };
    setTickets(prev => [newTicket, ...prev]);
    setShowCreateModal(false);
    setForm({ subject: '', category: 'ORDERS', description: '', priority: 'MEDIUM' });
    setCreating(false);
    alert(`Support ticket ${newTicket.id} created. Our team will respond within 4 hours.`);
  };

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      messages: [...t.messages, { sender: 'Restaurant', text: replyText, ts: new Date().toLocaleTimeString() }],
    } : t));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, { sender: 'Restaurant', text: replyText, ts: new Date().toLocaleTimeString() }],
      } : null);
    }
    setReplyText('');
  };

  const statusColors: Record<string, string> = {
    OPEN: 'badge-warning',
    IN_PROGRESS: 'badge-info',
    RESOLVED: 'badge-success',
    CLOSED: 'badge-neutral',
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🎧 Support Center</h1>
          <p className="page-subtitle">{tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} open tickets · Avg response time: 4 hours</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ borderRadius: 10 }}>
          + New Support Ticket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ─── Tickets List ─── */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>📋 My Tickets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                style={{
                  background: '#fff', borderRadius: 14, padding: 16, border: `2px solid ${selectedTicket?.id === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: '0.2s', boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--primary)' }}>{t.id}</span>
                  <span className={`badge ${statusColors[t.status]}`} style={{ fontSize: 10 }}>{t.status.replace('_', ' ')}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.subject}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-neutral" style={{ fontSize: 9 }}>{t.category}</span>
                  <span className={`badge ${t.priority === 'HIGH' ? 'badge-error' : t.priority === 'MEDIUM' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: 9 }}>{t.priority}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{t.createdAt}</span>
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">🎧</div>
                <div className="empty-state-title">No support tickets</div>
                <div className="empty-state-text">Need help? Create a new support ticket.</div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Panel: Thread or FAQs ─── */}
        <div>
          {selectedTicket ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', height: 'fit-content' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{selectedTicket.subject}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className={`badge ${statusColors[selectedTicket.status]}`} style={{ fontSize: 10 }}>{selectedTicket.status}</span>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>{selectedTicket.category}</span>
                  <button onClick={() => setSelectedTicket(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
                </div>
              </div>

              <div style={{ padding: '16px 18px', maxHeight: 300, overflowY: 'auto' }}>
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 12, color: m.sender === 'Support' ? '#0984E3' : 'var(--primary)' }}>
                        {m.sender === 'Support' ? '🎧 QuickBite Support' : '🍽️ Your Restaurant'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.ts}</span>
                    </div>
                    <div style={{
                      background: m.sender === 'Support' ? '#EAF5FF' : 'var(--surface-hover)',
                      borderRadius: 10, padding: '10px 14px', fontSize: 13, lineHeight: 1.5,
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'RESOLVED' && (
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
                  <textarea
                    className="input"
                    style={{ height: 70, resize: 'none', marginBottom: 8 }}
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => handleReply(selectedTicket.id)} disabled={!replyText.trim()}>
                    📤 Send Reply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>❓ Frequently Asked Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{faq.q}</span>
                      <span style={{ fontSize: 16, color: 'var(--primary)' }}>{openFaq === i ? '▲' : '▼'}</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Ticket Modal ─── */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-sheet" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>🎧 New Support Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Subject *</label>
                <input className="input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of your issue" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High — Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Detailed Description *</label>
                <textarea className="input" style={{ height: 100, resize: 'none' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Please provide as much detail as possible including order IDs, dates, amounts..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : '📤 Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
