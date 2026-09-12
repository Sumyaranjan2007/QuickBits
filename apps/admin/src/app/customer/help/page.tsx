'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface RefundTicket {
  id: string;
  orderId: string;
  restaurantName: string;
  amount: number;
  reason: string;
  destination: 'WALLET' | 'BANK';
  status: 'PENDING_AGENT_REVIEW' | 'CHATTING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  date: string;
  txId?: string;
  agentName?: string;
  agentApproved?: boolean;
}

const FAQS = [
  {
    category: 'Refund Process',
    q: 'How does the refund approval process work?',
    a: 'To prevent fraudulent claims and ensure restaurant accountability, all refund requests are reviewed by our Live Support Agent in chat. Once you share the details, the agent verifies with the restaurant and approves the refund immediately.',
  },
  {
    category: 'Refund Process',
    q: 'Why do I need to chat with an agent for refund?',
    a: 'Chatting with our support executive ensures your specific issue (spillage, wrong item, or delay) is verified directly against restaurant kitchen dispatch logs and delivery partner telemetry for instant approval.',
  },
  {
    category: 'Payouts',
    q: 'How fast is the approved refund transferred?',
    a: 'Once approved by our support agent, QuickBite Wallet refunds are credited in under 10 seconds with a 5% bonus! Bank/UPI transfers are processed in 2 to 4 business hours.',
  },
  {
    category: 'Order Delays',
    q: 'What if my order is delayed beyond ETA?',
    a: 'If your delivery partner is delayed by more than 30 minutes, connect with our support chat. Our agent will verify the rider GPS and authorize a full refund + apology voucher.',
  },
  {
    category: 'Food Quality',
    q: 'What proof is required for damaged food?',
    a: 'Simply tell the agent in chat whether the seal was broken, food spilled, or items were missing. Our agent checks the kitchen packaging checklist for immediate approval.',
  },
];

const ISSUE_TYPES = [
  { id: 'damaged_spill', label: 'Food spilled / bad packaging 🥣', defaultPct: 100 },
  { id: 'missing_items', label: 'Missing item(s) in order 🔍', defaultPct: 60 },
  { id: 'quality_taste', label: 'Food quality or taste issue 🍲', defaultPct: 80 },
  { id: 'late_delivery', label: 'Severe delivery delay (>30 min) ⏰', defaultPct: 100 },
  { id: 'wrong_order', label: 'Wrong food item delivered ❌', defaultPct: 100 },
  { id: 'payment_failed', label: 'Charged but order failed 💳', defaultPct: 100 },
];

export default function CustomerHelpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [activeTab, setActiveTab] = useState<'refunds' | 'chat' | 'history' | 'faqs' | 'contact'>('refunds');

  // Orders available for refund
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedIssue, setSelectedIssue] = useState('damaged_spill');
  const [refundDest, setRefundDest] = useState<'WALLET' | 'BANK'>('WALLET');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Active Ticket being reviewed
  const [activeTicket, setActiveTicket] = useState<RefundTicket | null>(null);
  const [refundHistory, setRefundHistory] = useState<RefundTicket[]>([]);

  // Live Agent Chat states
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'agent' | 'user' | 'system'; text: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [claimedSuccess, setClaimedSuccess] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAgentTyping]);

  // Load orders & existing refunds on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedOrders = localStorage.getItem('qb_customer_orders');
        let parsedOrders: any[] = [];
        if (storedOrders) {
          parsedOrders = JSON.parse(storedOrders);
        }
        
        if (parsedOrders.length === 0) {
          parsedOrders = [
            {
              id: 'QB-982144',
              total: 512,
              status: 'OUT_FOR_DELIVERY',
              restaurant: { name: 'Sharief Bhai Biryani' },
              createdAt: new Date().toISOString(),
              items: [{ name: 'Hyderabadi Dum Biryani', price: 299 }, { name: 'Peri Peri Fries', price: 139 }],
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
          const list: RefundTicket[] = JSON.parse(storedRefunds);
          setRefundHistory(list);
          if (list.length > 0 && !activeTicket) {
            setActiveTicket(list[0]);
          }
        } else {
          const sampleTicket: RefundTicket = {
            id: 'TK-89214',
            orderId: 'QB-310842',
            restaurantName: 'Tuscany Woodfire Pizzeria',
            amount: 449,
            reason: 'Severe delivery delay (>30 min) ⏰',
            destination: 'WALLET',
            status: 'REFUNDED',
            agentName: 'Pooja Sharma (Senior Support Lead)',
            agentApproved: true,
            date: '3 days ago',
            txId: 'TXN_REF_9812490',
          };
          setRefundHistory([sampleTicket]);
          setActiveTicket(sampleTicket);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedOrderId]);

  const selectedOrder = ordersList.find((o) => o.id === selectedOrderId) || ordersList[0];
  const issueObj = ISSUE_TYPES.find((i) => i.id === selectedIssue) || ISSUE_TYPES[0];
  const calculatedRefundAmount = selectedOrder ? Math.round((selectedOrder.total || 450) * (issueObj.defaultPct / 100)) : 300;

  // 1. Submit Ticket for Agent Review -> Opens Chat
  const handleCreateRefundTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingTicket(true);

    setTimeout(() => {
      const newTicket: RefundTicket = {
        id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
        orderId: selectedOrder.id,
        restaurantName: selectedOrder.restaurant?.name || 'Restaurant',
        amount: calculatedRefundAmount,
        reason: issueObj.label,
        destination: refundDest,
        status: 'PENDING_AGENT_REVIEW',
        agentName: 'Pooja Sharma (Senior Support Lead)',
        agentApproved: false,
        date: 'Just now',
      };

      const updated = [newTicket, ...refundHistory.filter((t) => t.id !== newTicket.id)];
      setRefundHistory(updated);
      setActiveTicket(newTicket);
      setIsSubmittingTicket(false);
      setClaimedSuccess(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('qb_customer_refunds', JSON.stringify(updated));
      }

      // Initialize Chat with Agent
      setChatMessages([
        {
          id: 'sys-1',
          sender: 'system',
          text: `📋 Refund Ticket #${newTicket.id} registered for Order #${newTicket.orderId} (₹${newTicket.amount}). Connecting with support agent...`,
          time: 'Just now',
        },
        {
          id: 'agent-1',
          sender: 'agent',
          text: `Hello! I am Pooja Sharma from QuickBite Senior Support. I see you requested a refund for Order #${newTicket.orderId} from ${newTicket.restaurantName} regarding "${newTicket.reason}".`,
          time: 'Just now',
        },
        {
          id: 'agent-2',
          sender: 'agent',
          text: `I am reviewing your order dispatch details with the restaurant right now. Could you confirm if the package was damaged upon delivery, or what exactly went wrong?`,
          time: 'Just now',
        },
      ]);

      setActiveTab('chat');
    }, 700);
  };

  // 2. Open Existing Ticket in Chat
  const handleOpenTicketChat = (ticket: RefundTicket) => {
    setActiveTicket(ticket);
    setClaimedSuccess(ticket.status === 'REFUNDED');

    setChatMessages([
      {
        id: 'sys-1',
        sender: 'system',
        text: `📋 Loaded Ticket #${ticket.id} for Order #${ticket.orderId} • Status: ${ticket.status}`,
        time: ticket.date,
      },
      {
        id: 'agent-1',
        sender: 'agent',
        text: `Hello! I am ${ticket.agentName || 'Pooja Sharma'} regarding Ticket #${ticket.id}. ${
          ticket.agentApproved
            ? `Your refund of ₹${ticket.amount} was approved by support!`
            : `I am currently reviewing this refund request for Order #${ticket.orderId}.`
        }`,
        time: ticket.date,
      },
    ]);

    setActiveTab('chat');
  };

  // 3. Customer sends message in Chat
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
    setIsAgentTyping(true);

    setTimeout(() => {
      const ticket = activeTicket;
      const orderName = ticket?.restaurantName || 'the restaurant';
      const amt = ticket?.amount || 299;

      let agentResponse = `Thank you for the explanation. I am cross-checking the delivery dispatch logs and food preparation camera footage with ${orderName}.`;
      let shouldApprove = false;

      const lower = text.toLowerCase();
      if (
        lower.includes('spill') ||
        lower.includes('leak') ||
        lower.includes('damaged') ||
        lower.includes('cold') ||
        lower.includes('missing') ||
        lower.includes('wrong') ||
        lower.includes('late') ||
        lower.includes('delay') ||
        lower.includes('yes') ||
        lower.includes('photo') ||
        lower.includes('proof') ||
        lower.includes('deducted') ||
        lower.includes('please approve')
      ) {
        agentResponse = `I have verified your complaint with ${orderName} and confirmed the issue. Under QuickBite Customer Protection Guarantee, I have **OFFICIALLY APPROVED** your refund of ₹${amt}! 🎉 Please click the claim button below to receive the money into your ${
          ticket?.destination === 'WALLET' ? 'QuickBite Wallet' : 'Bank Account'
        }.`;
        shouldApprove = true;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `agent-reply-${Date.now()}`,
          sender: 'agent',
          text: agentResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsAgentTyping(false);

      if (shouldApprove && ticket) {
        const approvedTicket: RefundTicket = {
          ...ticket,
          agentApproved: true,
          status: 'APPROVED',
        };
        setActiveTicket(approvedTicket);
        setRefundHistory((prev) =>
          prev.map((t) => (t.id === ticket.id ? approvedTicket : t))
        );
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('qb_customer_refunds');
            if (stored) {
              const parsed = JSON.parse(stored);
              const updated = parsed.map((t: any) =>
                t.id === ticket.id ? approvedTicket : t
              );
              localStorage.setItem('qb_customer_refunds', JSON.stringify(updated));
            }
          } catch {}
        }
      }
    }, 1200);
  };

  // 4. Claim the Agent-Approved Refund
  const handleClaimApprovedRefund = () => {
    if (!activeTicket || !activeTicket.agentApproved) return;

    const amt = activeTicket.amount;
    const finalTicket: RefundTicket = {
      ...activeTicket,
      status: 'REFUNDED',
      txId: `TXN_REF_${Date.now().toString().slice(-8)}`,
    };

    setActiveTicket(finalTicket);
    setClaimedSuccess(true);
    setRefundHistory((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? finalTicket : t))
    );

    if (typeof window !== 'undefined') {
      // Credit wallet if destination is wallet
      if (finalTicket.destination === 'WALLET') {
        const currentBal = Number(localStorage.getItem('qb_customer_wallet') || '500');
        const bonusAmt = Math.round(amt * 1.05); // 5% bonus for wallet
        const newBal = currentBal + bonusAmt;
        localStorage.setItem('qb_customer_wallet', String(newBal));
      }

      const stored = localStorage.getItem('qb_customer_refunds');
      if (stored) {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((t: any) =>
          t.id === activeTicket.id ? finalTicket : t
        );
        localStorage.setItem('qb_customer_refunds', JSON.stringify(updated));
      }
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-done-${Date.now()}`,
        sender: 'system',
        text: `✅ ₹${amt} successfully credited to your ${
          finalTicket.destination === 'WALLET' ? 'QuickBite Wallet (+5% bonus added)' : 'Bank Account'
        }! Transaction ID: ${finalTicket.txId}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="customer-help-container" style={{ padding: '4px 0 30px' }}>
      {/* ─── Top Header Bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => router.push('/customer')}
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
          ← Home
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0E9F6E', display: 'inline-block', boxShadow: '0 0 0 3px rgba(14, 159, 110, 0.2)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#0E9F6E' }}>AGENT LIVE SUPPORT</span>
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
              🛡️ AGENT REVIEW & REFUND CENTER
            </span>
            <h1 style={{ fontSize: 19, fontWeight: 900, margin: '8px 0 4px 0', color: '#FFFFFF' }}>
              Help & Refund Resolution
            </h1>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.35 }}>
              Chat directly with our support specialist. After reviewing and approving your case, funds are released instantly.
            </p>
          </div>
          <div style={{ fontSize: 40, flexShrink: 0 }}>🎧</div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #EADBCE', paddingBottom: 10, marginBottom: 16 }}>
        {[
          { id: 'refunds', label: '📝 Request Refund' },
          { id: 'chat', label: `💬 Agent Chat ${activeTicket && !activeTicket.agentApproved ? '🔴' : ''}` },
          { id: 'history', label: `📋 Tickets (${refundHistory.length})` },
          { id: 'faqs', label: '❓ Refund Policy' },
          { id: 'contact', label: '📞 Direct Helpline' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`filter-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* ─── TAB 1: SUBMIT REFUND REQUEST FOR AGENT REVIEW ─── */}
      {activeTab === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EADBCE',
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                💬
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
                  Start Refund Review with Support Agent
                </h3>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
                  Step 1: Select issue ➔ Step 2: Chat with Agent ➔ Step 3: Agent approves & transfers money
                </p>
              </div>
            </div>

            {/* Workflow Notice Banner */}
            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: 11.5,
                color: '#92400E',
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              🔒 <strong>How Approval Works:</strong> To protect merchants and verify delivery conditions, our Live Support Executive reviews order details in chat before releasing the refund amount.
            </div>

            <form onSubmit={handleCreateRefundTicket} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 1. Select Order */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                  1. SELECT ORDER TO CLAIM REFUND
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
                  2. WHAT IS THE COMPLAINT / ISSUE?
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
                        <span style={{ fontSize: 11.5, fontWeight: isSelected ? 800 : 600, color: isSelected ? '#4A0A10' : '#374151' }}>
                          {it.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Issue details */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 6 }}>
                  3. EXPLAIN TO SUPPORT AGENT (OPTIONAL)
                </label>
                <textarea
                  placeholder="e.g., The biryani container lid came open during transit and spilled in bag..."
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
                  4. PREFERRED REFUND DESTINATION (UPON AGENT APPROVAL)
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
                      ⚡ Instant + 5% Extra Bonus
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
                      UPI / Bank Account
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Value Banner */}
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
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4B5563' }}>Eligible Refund Value:</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#0E9F6E' }}>₹{calculatedRefundAmount}</span>
              </div>

              {/* Connect with agent button */}
              <button
                type="submit"
                disabled={isSubmittingTicket}
                id="connect-agent-refund-btn"
                style={{
                  background: '#4A0A10',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 0',
                  fontSize: 13.5,
                  fontWeight: 900,
                  cursor: isSubmittingTicket ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(74, 10, 16, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {isSubmittingTicket ? 'Connecting to Agent...' : '💬 Connect with Support Agent to Approve Refund →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: LIVE AGENT REVIEW CHAT ─── */}
      {activeTab === 'chat' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #EADBCE',
            display: 'flex',
            flexDirection: 'column',
            height: '75vh',
            maxHeight: 620,
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Agent Chat Header */}
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
              <div style={{ position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#4A0A10', fontWeight: 900 }}>
                  👩‍💼
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#10B981',
                    border: '2px solid #4A0A10',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {activeTicket?.agentName || 'Pooja Sharma'}
                  <span style={{ fontSize: 9.5, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 6 }}>
                    Senior Executive
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: '#FCD34D' }}>
                  {activeTicket ? `Reviewing Ticket #${activeTicket.id}` : 'Live Agent Support'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 10,
                  background: activeTicket?.agentApproved ? '#0E9F6E' : '#D97706',
                  color: '#FFFFFF',
                }}
              >
                {activeTicket?.agentApproved ? '✅ APPROVED' : '⏳ UNDER REVIEW'}
              </span>
            </div>
          </div>

          {/* Ticket Information Bar */}
          {activeTicket && (
            <div
              style={{
                background: '#FFFBEB',
                borderBottom: '1px solid #FEF3C7',
                padding: '7px 14px',
                fontSize: 11,
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Order #{activeTicket.orderId} • {activeTicket.restaurantName}</span>
              <span style={{ fontWeight: 800, color: '#B45309' }}>Claim: ₹{activeTicket.amount}</span>
            </div>
          )}

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
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>🎧</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>No Active Chat Session</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Select an order from "Request Refund" to chat with an agent.</div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: 'center',
                        background: '#EEF2F6',
                        color: '#475569',
                        padding: '6px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        textAlign: 'center',
                        maxWidth: '90%',
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                }

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
              })
            )}

            {/* Live Agent Typing */}
            {isAgentTyping && (
              <div style={{ fontSize: 11.5, color: '#6B7280', padding: '6px 12px', background: '#FFFFFF', borderRadius: 12, width: 'fit-content', border: '1px solid #E5E7EB' }}>
                Pooja is reviewing kitchen telemetry...
              </div>
            )}

            {/* Official Agent Approval Action Card */}
            {activeTicket?.agentApproved && !claimedSuccess && (
              <div
                style={{
                  background: '#ECFDF5',
                  borderRadius: 16,
                  border: '2px solid #10B981',
                  padding: 14,
                  marginTop: 8,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  animation: 'slideUp 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#065F46' }}>
                      Refund Approved by Support Agent
                    </div>
                    <div style={{ fontSize: 11, color: '#047857' }}>
                      Verified for Order #{activeTicket.orderId} • Approved Amount: ₹{activeTicket.amount}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="claim-agent-approved-money-btn"
                  onClick={handleClaimApprovedRefund}
                  style={{
                    width: '100%',
                    background: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '11px 0',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                  }}
                >
                  ⚡ Claim ₹{activeTicket.amount} to {activeTicket.destination === 'WALLET' ? 'Wallet (+5% Bonus)' : 'Bank Account'}
                </button>
              </div>
            )}

            {/* Claimed Successful Notification */}
            {claimedSuccess && (
              <div
                style={{
                  background: '#F0FDF4',
                  borderRadius: 14,
                  border: '1px solid #86EFAC',
                  padding: '12px',
                  textAlign: 'center',
                  color: '#166534',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🎉 <strong>Refund Completed:</strong> ₹{activeTicket?.amount} transferred to your{' '}
                {activeTicket?.destination === 'WALLET' ? 'Wallet' : 'Bank Account'}.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '8px 12px 4px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              'Yes, food was spilled in packaging 🥣',
              'Items were completely missing 🔍',
              'Driver arrived 40 mins late ⏰',
              'Please review and approve refund 🙏',
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '5px 10px',
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
              placeholder="Message Support Agent Pooja..."
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
              id="send-agent-msg-btn"
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
              Send 🚀
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 3: TICKETS & REFUND STATUS ─── */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#1A1A1A', marginBottom: 4 }}>
            Support Tickets & Refund Claims
          </div>

          {refundHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', background: '#FFFFFF', borderRadius: 16, border: '1px solid #EADBCE', color: '#9CA3AF', fontSize: 12 }}>
              No refund requests placed yet.
            </div>
          ) : (
            refundHistory.map((t) => {
              const isApproved = t.agentApproved;
              const isRefunded = t.status === 'REFUNDED';

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #EADBCE',
                    padding: 14,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1F2937' }}>
                        {t.reason}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                        Ticket #{t.id} • Order #{t.orderId} • {t.restaurantName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#0E9F6E' }}>
                        ₹{t.amount}
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: isRefunded ? '#ECFDF5' : isApproved ? '#EFF6FF' : '#FEF3C7',
                          color: isRefunded ? '#047857' : isApproved ? '#1D4ED8' : '#B45309',
                          border: `1px solid ${isRefunded ? '#A7F3D0' : isApproved ? '#BFDBFE' : '#FDE68A'}`,
                          display: 'inline-block',
                          marginTop: 2,
                        }}
                      >
                        {isRefunded ? '✓ CREDITED' : isApproved ? '✓ AGENT APPROVED' : '⏳ UNDER REVIEW'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>
                      Agent: <strong>{t.agentName || 'Pooja Sharma'}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenTicketChat(t)}
                      style={{
                        background: '#4A0A10',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 8,
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Open Chat 💬
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── TAB 4: REFUND POLICY & FAQS ─── */}
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

      {/* ─── TAB 5: DIRECT HELPLINE ─── */}
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
              onClick={() => alert('Opening QuickBite Official WhatsApp Care...')}
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
        </div>
      )}
    </div>
  );
}
