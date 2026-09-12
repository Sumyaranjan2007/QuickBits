'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface RefundRecord {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  destination: 'WALLET' | 'BANK';
  status: 'PROCESSED' | 'REVIEW' | 'REFUNDED';
  date: string;
  txId: string;
}

const FAQS = [
  {
    category: 'Refunds & Returns',
    q: 'How quickly will I receive my refund?',
    a: 'Instant QuickBite Wallet refunds are credited in under 10 seconds with a 5% bonus! Bank/UPI/Card refunds are typically credited within 2 to 4 business hours depending on your bank.',
  },
  {
    category: 'Refunds & Returns',
    q: 'What if an item is missing or spilled?',
    a: 'Simply select your order in the "Request Refund" tab above, choose "Missing Items" or "Spilled / Quality Issue", and submit. Our automated claim system will process your refund immediately.',
  },
  {
    category: 'Order & Delivery',
    q: 'Can I cancel my order if it is running late?',
    a: 'If your order is delayed by more than 30 minutes past the estimated ETA, you are eligible for a 100% full refund and an apology discount coupon.',
  },
  {
    category: 'Payments',
    q: 'Money was deducted from my bank but the order failed?',
    a: 'Don’t worry! Banking gateway failures are automatically auto-reversed by our payment engine. If not credited within 2 hours, tap "Claim Failed Payment Refund" above.',
  },
  {
    category: 'Gold Membership',
    q: 'How does QuickBite Gold delivery guarantee work?',
    a: 'Gold members get priority delivery. If your Gold order is late by even 10 minutes, you automatically get ₹100 QuickBite Cash credited to your wallet.',
  },
];

const ISSUE_TYPES = [
  { id: 'missing_items', label: 'Missing item(s) in order', icon: '🔍', defaultPct: 50 },
  { id: 'damaged_spill', label: 'Food spilled / bad packaging', icon: '🥣', defaultPct: 100 },
  { id: 'quality_taste', label: 'Food quality or taste issue', icon: '🍲', defaultPct: 80 },
  { id: 'late_delivery', label: 'Severe delivery delay (>30 min)', icon: '⏰', defaultPct: 100 },
  { id: 'wrong_order', label: 'Wrong food item delivered', icon: '❌', defaultPct: 100 },
  { id: 'payment_failed', label: 'Charged but order failed', icon: '💳', defaultPct: 100 },
];

export default function CustomerHelpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [activeTab, setActiveTab] = useState<'refunds' | 'chat' | 'faqs' | 'contact'>('refunds');

  // Orders available for refund
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedIssue, setSelectedIssue] = useState('damaged_spill');
  const [refundDest, setRefundDest] = useState<'WALLET' | 'BANK'>('WALLET');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundSuccessData, setRefundSuccessData] = useState<RefundRecord | null>(null);
  
  // Refund history stored in localStorage
  const [refundHistory, setRefundHistory] = useState<RefundRecord[]>([]);

  // Live Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      id: '1',
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to QuickBite 24x7 Customer Care. How can we assist you with your orders, deliveries, or refunds today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Load orders & existing refunds on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedOrders = localStorage.getItem('qb_customer_orders');
        let parsedOrders: any[] = [];
        if (storedOrders) {
          parsedOrders = JSON.parse(storedOrders);
        }
        
        // Add defaults if empty
        if (parsedOrders.length === 0) {
          parsedOrders = [
            {
              id: 'QB-982144',
              total: 512,
              status: 'OUT_FOR_DELIVERY',
              restaurant: { name: 'Sharief Bhai Biryani' },
              createdAt: new Date().toISOString(),
              items: [{ name: 'Hyderabadi Biryani', price: 299 }, { name: 'Peri Peri Fries', price: 139 }],
            },
            {
              id: 'QB-741290',
              total: 648,
              status: 'DELIVERED',
              restaurant: { name: 'Behrouz Biryani' },
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
              items: [{ name: 'Royal Paneer Biryani', price: 349 }, { name: 'Tandoori Tikka', price: 299 }],
            },
            {
              id: 'QB-310842',
              total: 449,
              status: 'DELIVERED',
              restaurant: { name: 'Tuscany Woodfire Pizzeria' },
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              items: [{ name: 'Woodfired Margherita Pizza', price: 449 }],
            },
          ];
        }
        setOrdersList(parsedOrders);
        if (!selectedOrderId && parsedOrders.length > 0) {
          setSelectedOrderId(parsedOrders[0].id);
        }

        const storedRefunds = localStorage.getItem('qb_customer_refunds');
        if (storedRefunds) {
          setRefundHistory(JSON.parse(storedRefunds));
        } else {
          const sampleRefund: RefundRecord = {
            id: 'RF-89210',
            orderId: 'QB-310842',
            amount: 449,
            reason: 'Severe delivery delay (>30 min)',
            destination: 'WALLET',
            status: 'REFUNDED',
            date: '3 days ago',
            txId: 'TXN_REF_9812490',
          };
          setRefundHistory([sampleRefund]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedOrderId]);

  const selectedOrder = ordersList.find((o) => o.id === selectedOrderId) || ordersList[0];
  const issueObj = ISSUE_TYPES.find((i) => i.id === selectedIssue) || ISSUE_TYPES[0];
  const refundAmount = selectedOrder ? Math.round((selectedOrder.total || 400) * (issueObj.defaultPct / 100)) : 250;

  // Handle Refund Submission
  const handleClaimRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newRefund: RefundRecord = {
        id: `RF-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: selectedOrder.id,
        amount: refundAmount,
        reason: issueObj.label,
        destination: refundDest,
        status: refundDest === 'WALLET' ? 'REFUNDED' : 'PROCESSED',
        date: 'Just now',
        txId: `TXN_${Date.now().toString().slice(-8)}`,
      };

      const updatedRefunds = [newRefund, ...refundHistory];
      setRefundHistory(updatedRefunds);
      setRefundSuccessData(newRefund);
      setIsSubmitting(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('qb_customer_refunds', JSON.stringify(updatedRefunds));

        // If refunded to wallet, credit the customer wallet immediately!
        if (refundDest === 'WALLET') {
          const currentBal = Number(localStorage.getItem('qb_customer_wallet') || '500');
          const bonusAmt = Math.round(refundAmount * 1.05); // 5% instant bonus
          const newBal = currentBal + bonusAmt;
          localStorage.setItem('qb_customer_wallet', String(newBal));
        }
      }
    }, 1200);
  };

  // Chatbot message handler
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = 'Thank you for reaching out! Our executive is reviewing your request. Support Ticket #TK-90214 has been logged.';
      const lower = text.toLowerCase();

      if (lower.includes('refund') || lower.includes('money') || lower.includes('return') || lower.includes('cancel')) {
        botReply = `💳 For instant refunds, please use the "⚡ Claim Refund" tab above. Wallet refunds are processed in under 10 seconds with zero deductions!`;
      } else if (lower.includes('track') || lower.includes('where') || lower.includes('driver') || lower.includes('order')) {
        botReply = `🛵 You can track your rider in real-time with live GPS map on the "Orders" page or by tapping "Track Live Order".`;
      } else if (lower.includes('spill') || lower.includes('cold') || lower.includes('bad') || lower.includes('missing')) {
        botReply = `We are very sorry for the inconvenience! 🙏 We have recorded your quality complaint. You are eligible for a 100% instant compensation refund under our Food Quality Guarantee.`;
      } else if (lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('phone')) {
        botReply = `📞 You can connect with our 24x7 priority care helpline at 1800-419-BITE (Toll Free) or tap "📞 Call Support" in the Contact tab!`;
      } else if (lower.includes('gold') || lower.includes('coupon') || lower.includes('discount')) {
        botReply = `👑 QuickBite Gold members enjoy free delivery on all orders above ₹199 and 10-minute on-time guarantee credits!`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="customer-help-container" style={{ padding: '4px 0 30px' }}>
      {/* ─── Top Header Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: '#FFFFFF',
            border: '1px solid #EADBCE',
            borderRadius: 12,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 800,
            color: '#4A0A10',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E9F6E', display: 'inline-block', boxShadow: '0 0 0 3px rgba(14, 159, 110, 0.2)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0E9F6E' }}>24x7 LIVE SUPPORT</span>
        </div>
      </div>

      {/* ─── Hero Banner Card ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4A0A10 0%, #70101B 100%)',
          borderRadius: 20,
          padding: '18px 16px',
          color: '#FFFFFF',
          marginBottom: 16,
          boxShadow: '0 4px 16px rgba(74, 10, 16, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                background: '#D4890E',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 8,
                letterSpacing: 0.5,
              }}
            >
              🎧 QUICKBITE RESOLUTION CENTER
            </span>
            <h1 style={{ fontSize: 19, fontWeight: 900, margin: '8px 0 4px 0', color: '#FFFFFF' }}>
              How can we help you?
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
              Claim instant refunds, resolve order issues, or chat live with our support team.
            </p>
          </div>
          <div style={{ fontSize: 42, flexShrink: 0 }}>🛡️</div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16 }}>
        {[
          { id: 'refunds', label: '⚡ Claim Refund & Issues' },
          { id: 'chat', label: '💬 Live Assistant' },
          { id: 'faqs', label: '❓ FAQs & Policies' },
          { id: 'contact', label: '📞 Direct Contact' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id as any);
              setRefundSuccessData(null);
            }}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 16,
              background: activeTab === tab.id ? '#4A0A10' : '#FFFFFF',
              color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
              border: `1px solid ${activeTab === tab.id ? '#4A0A10' : '#EADBCE'}`,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: REFUNDS & ORDER ISSUES ─── */}
      {activeTab === 'refunds' && (
        <div>
          {/* Refund Success Card */}
          {refundSuccessData ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                border: '2px solid #0E9F6E',
                padding: 18,
                marginBottom: 16,
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(14, 159, 110, 0.15)',
                animation: 'scaleUp 0.3s ease',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 6 }}>🎉</div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0E9F6E', margin: '0 0 4px 0' }}>
                Refund Approved & Processed!
              </h3>
              <p style={{ fontSize: 12, color: '#4B5563', margin: '0 0 14px 0' }}>
                Reference ID: <strong>{refundSuccessData.id}</strong> (Order #{refundSuccessData.orderId})
              </p>

              <div
                style={{
                  background: '#ECFDF5',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 14,
                  border: '1px solid #A7F3D0',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#065F46' }}>Refund Amount:</span>
                  <span style={{ fontWeight: 900, color: '#047857', fontSize: 15 }}>₹{refundSuccessData.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#065F46' }}>Credited Destination:</span>
                  <span style={{ fontWeight: 700, color: '#047857' }}>
                    {refundSuccessData.destination === 'WALLET' ? '👛 QuickBite Wallet (Instant + 5% Bonus)' : '🏦 Original Payment (UPI/Bank)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#047857' }}>
                  <span>Status:</span>
                  <span style={{ fontWeight: 800 }}>⚡ COMPLETED • 100% Transferred</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => router.push('/customer/profile')}
                  style={{
                    flex: 1,
                    background: '#4A0A10',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  View Wallet Balance 👛
                </button>
                <button
                  type="button"
                  onClick={() => setRefundSuccessData(null)}
                  style={{
                    flex: 1,
                    background: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 0',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                border: '1px solid #EADBCE',
                padding: 16,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚡</span> Request Instant Refund / Resolution
              </div>

              <form onSubmit={handleClaimRefund} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 1. Select Order */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                    1. SELECT YOUR ORDER
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1.5px solid #EADBCE',
                      fontSize: 13,
                      fontWeight: 600,
                      outline: 'none',
                      background: '#FFFDFB',
                    }}
                    required
                  >
                    {ordersList.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.id} • {o.restaurant?.name || 'Restaurant'} (₹{o.total})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Issue Type */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                    2. WHAT WENT WRONG?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                    {ISSUE_TYPES.map((it) => {
                      const isSelected = selectedIssue === it.id;
                      return (
                        <div
                          key={it.id}
                          onClick={() => setSelectedIssue(it.id)}
                          style={{
                            border: `1.5px solid ${isSelected ? '#4A0A10' : '#E5E7EB'}`,
                            background: isSelected ? '#FFF7ED' : '#FAFAFA',
                            borderRadius: 12,
                            padding: '10px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span style={{ fontSize: 20, marginBottom: 4 }}>{it.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: isSelected ? 800 : 600, color: isSelected ? '#4A0A10' : '#374151' }}>
                            {it.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Additional notes */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                    3. DETAILS (OPTIONAL)
                  </label>
                  <textarea
                    placeholder="Briefly describe what happened (e.g. Biryani container was leaking)..."
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: '1.5px solid #E5E7EB',
                      fontSize: 12,
                      outline: 'none',
                      minHeight: 50,
                      resize: 'none',
                    }}
                  />
                </div>

                {/* 4. Choose Refund Mode */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                    4. CHOOSE REFUND DESTINATION
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div
                      onClick={() => setRefundDest('WALLET')}
                      style={{
                        border: `1.5px solid ${refundDest === 'WALLET' ? '#0E9F6E' : '#E5E7EB'}`,
                        background: refundDest === 'WALLET' ? '#ECFDF5' : '#FAFAFA',
                        borderRadius: 12,
                        padding: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#065F46', display: 'flex', alignItems: 'center', gap: 4 }}>
                        👛 QuickBite Wallet
                      </div>
                      <div style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>
                        ⚡ Instant (10s) + 5% Bonus
                      </div>
                    </div>

                    <div
                      onClick={() => setRefundDest('BANK')}
                      style={{
                        border: `1.5px solid ${refundDest === 'BANK' ? '#4A0A10' : '#E5E7EB'}`,
                        background: refundDest === 'BANK' ? '#FFF7ED' : '#FAFAFA',
                        borderRadius: 12,
                        padding: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#4A0A10', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🏦 Original Source
                      </div>
                      <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
                        UPI / Bank (2-4 hrs)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary & Submit */}
                <div
                  style={{
                    background: '#F9FAFB',
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px dashed #D1D5DB',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4B5563' }}>Estimated Refund Value:</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#0E9F6E' }}>₹{refundAmount}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="claim-instant-refund-btn"
                  style={{
                    background: '#4A0A10',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px 0',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: isSubmitting ? 'default' : 'pointer',
                    boxShadow: '0 4px 12px rgba(74, 10, 16, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {isSubmitting ? 'Processing Refund Claim...' : '⚡ Submit & Claim Instant Refund'}
                </button>
              </form>
            </div>
          )}

          {/* Refund History List */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EADBCE',
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: '#1A1A1A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📋</span> Recent Refund History & Claims
            </div>

            {refundHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#9CA3AF', fontSize: 12 }}>
                No refund requests placed yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {refundHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #F3F4F6',
                      borderRadius: 14,
                      padding: 12,
                      background: '#FAFAFA',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1F2937' }}>
                        {item.reason}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                        Order #{item.orderId} • {item.date} • {item.destination === 'WALLET' ? 'Wallet Credit' : 'Bank Transfer'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#0E9F6E' }}>
                        +₹{item.amount}
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: '#ECFDF5',
                          color: '#047857',
                          border: '1px solid #A7F3D0',
                          display: 'inline-block',
                          marginTop: 2,
                        }}
                      >
                        ✓ {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: 24x7 LIVE ASSISTANT CHAT ─── */}
      {activeTab === 'chat' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #EADBCE',
            display: 'flex',
            flexDirection: 'column',
            height: '65vh',
            maxHeight: 520,
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: '#4A0A10',
              color: '#FFFFFF',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                🤖
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 900 }}>QuickBite AI Resolution Bot</div>
                <div style={{ fontSize: 10.5, color: '#10B981', fontWeight: 700 }}>● Online • Instant Resolution</div>
              </div>
            </div>
            <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: 8 }}>
              24x7 Help
            </span>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: 'auto',
              background: '#F9FAFB',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isUser ? '#4A0A10' : '#FFFFFF',
                      color: isUser ? '#FFFFFF' : '#1F2937',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      padding: '10px 14px',
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      border: isUser ? 'none' : '1px solid #E5E7EB',
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 9.5, color: '#9CA3AF', marginTop: 3, padding: '0 4px' }}>
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ fontSize: 11.5, color: '#6B7280', padding: '4px 10px', background: '#FFFFFF', borderRadius: 12, width: 'fit-content', border: '1px solid #E5E7EB' }}>
                AI Assistant is typing...
              </div>
            )}
          </div>

          {/* Quick Problem Suggestions */}
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '8px 12px 4px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              'I need a refund for my order 💳',
              'My food is spilled / damaged 🥣',
              'Where is my driver right now? 🛵',
              'Connect with human agent 📞',
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontSize: 11,
                  color: '#374151',
                  cursor: 'pointer',
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ background: '#FFFFFF', padding: '10px 12px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Describe your issue or order inquiry..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                background: '#F9FAFB',
                border: '1.5px solid #E5E7EB',
                borderRadius: 14,
                padding: '9px 14px',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              style={{
                background: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '9px 16px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 3: FAQS & POLICIES ─── */}
      {activeTab === 'faqs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #EADBCE',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, background: '#FFF7ED', color: '#EA580C', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1F2937' }}>{faq.q}</span>
                  </div>
                  <span style={{ color: '#4A0A10', fontWeight: 900, fontSize: 14 }}>{isOpen ? '▲' : '▼'}</span>
                </div>
                {isOpen && (
                  <div style={{ fontSize: 12, color: '#4B5563', marginTop: 10, borderTop: '1px solid #F3F4F6', paddingTop: 8, lineHeight: 1.45 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB 4: DIRECT CONTACT ─── */}
      {activeTab === 'contact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Toll Free Helpline */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '1px solid #EADBCE',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ECFDF5', color: '#0E9F6E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                📞
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#1F2937' }}>Toll-Free Customer Helpline</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>1800-419-BITE (Available 24x7)</div>
              </div>
            </div>
            <a
              href="tel:18004192483"
              style={{
                background: '#0E9F6E',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Call Now
            </a>
          </div>

          {/* WhatsApp Support */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '1px solid #EADBCE',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#1F2937' }}>WhatsApp Quick Support</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>+91 98765 43210 (Average reply ~1 min)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Redirecting to QuickBite Official WhatsApp Care...')}
              style={{
                background: '#059669',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Message
            </button>
          </div>

          {/* Email Support */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              border: '1px solid #EADBCE',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                ✉️
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#1F2937' }}>Email Grievance Officer</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>care@quickbite.com</div>
              </div>
            </div>
            <a
              href="mailto:care@quickbite.com"
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Write Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
