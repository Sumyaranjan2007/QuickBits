'use client';
import React, { useState } from 'react';

const FAQS = [
  {
    q: 'How do I track my active order?',
    a: 'Go to the "Orders" page from the top navigation bar and click "Track Live Order" on your active order card to view real-time driver GPS location, current stage, and delivery ETA.',
  },
  {
    q: 'When will my refund be credited?',
    a: 'Refunds for cancelled orders or payment failures are processed instantly to your QuickBite Wallet or within 3-5 business days to your original bank/UPI account.',
  },
  {
    q: 'How does QuickBite Gold Membership work?',
    a: 'QuickBite Gold members enjoy unlimited FREE delivery on orders above ₹199, up to 20% extra discounts, and priority delivery dispatch on all participating restaurants.',
  },
  {
    q: 'Can I cancel my order after placing it?',
    a: 'You can cancel your order before the restaurant starts preparing your food by visiting the Live Tracking page and tapping "Cancel Order".',
  },
  {
    q: 'What if an item is missing or damaged in my order?',
    a: 'You can report an issue directly from the Order Details page or start a quick chat with our support team below for an instant replacement or refund.',
  },
];

export default function CustomerHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'bot', text: '👋 Hi Rahul! I am QuickBite AI Assistant. How can I assist you with your orders or account today?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'user', text }];
    setChatMessages(newMsgs);
    setInputMsg('');

    // Automated response
    setTimeout(() => {
      let reply = "Thanks for reaching out! Our support team is looking into this. Your issue ticket #QB-8921 has been registered.";
      if (text.toLowerCase().includes('refund')) {
        reply = "💳 Regarding your refund: All processed refunds reflect in your QuickBite Wallet immediately, or within 3-5 days in your bank account.";
      } else if (text.toLowerCase().includes('track') || text.toLowerCase().includes('order') || text.toLowerCase().includes('where')) {
        reply = "🛵 You can view live GPS tracking for Amit Verma on your Orders page under 'Active Deliveries'.";
      } else if (text.toLowerCase().includes('cancel')) {
        reply = "⚠️ Orders can be cancelled before food preparation starts directly from the live tracking screen.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* ─── Hero Header ─── */}
      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #0984E3 0%, #74B9FF 100%)', boxShadow: '0 10px 25px rgba(9, 132, 227, 0.25)' }}>
        <div>
          <span className="promo-badge" style={{ background: '#FFD93D', color: '#1A1A2E' }}>💬 24/7 Help Desk</span>
          <h1 className="promo-title">How can we help you today?</h1>
          <p className="promo-desc">
            Find quick answers to common questions or chat with our live support assistant.
          </p>
        </div>
        <div style={{ fontSize: 72 }}>🎧</div>
      </div>

      {/* ─── Quick Issue Topic Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        {[
          { icon: '📦', title: 'Order Status', prompt: 'Where is my active order?' },
          { icon: '💳', title: 'Refund Status', prompt: 'Check refund status for my last order' },
          { icon: '🏷️', title: 'Coupon Help', prompt: 'Coupon code is not applying' },
          { icon: '👑', title: 'Gold Club', prompt: 'How to claim Gold free delivery?' },
        ].map((topic, i) => (
          <div
            key={i}
            onClick={() => handleSendMessage(topic.prompt)}
            style={{
              background: '#fff', padding: 20, borderRadius: 16, border: '1px solid var(--border)',
              cursor: 'pointer', textAlign: 'center', transition: '0.2s', boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{topic.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{topic.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 4 }}>Ask support →</div>
          </div>
        ))}
      </div>

      {/* ─── Live Chat Simulator Box ─── */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--border)', padding: 24, marginBottom: 40, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>QuickBite AI Support Assistant</div>
            <div style={{ fontSize: 11, color: '#00B894', fontWeight: 700 }}>● Online 24/7 • Instant replies</div>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ minHeight: 180, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0', marginBottom: 16 }}>
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--surface-hover)',
                color: msg.sender === 'user' ? '#fff' : 'var(--text)',
                padding: '10px 16px', borderRadius: 14, maxWidth: '80%', fontSize: 13, lineHeight: 1.4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="input"
            placeholder="Type your message or issue..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="btn btn-primary" onClick={() => handleSendMessage()} style={{ borderRadius: 10, padding: '0 20px' }}>
            Send
          </button>
        </div>
      </div>

      {/* ─── Frequently Asked Questions Accordion ─── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Frequently Asked Questions</h2>
          <p className="page-subtitle">Quick answers to common questions</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQS.map((faq, i) => (
          <div
            key={i}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            style={{
              background: '#fff', borderRadius: 14, border: '1px solid var(--border)',
              padding: '16px 20px', cursor: 'pointer', transition: '0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{faq.q}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{openFaq === i ? '▲' : '▼'}</span>
            </div>
            {openFaq === i && (
              <p style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 10, lineHeight: 1.5, borderTop: '1px solid #FAF7F5', paddingTop: 10 }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
