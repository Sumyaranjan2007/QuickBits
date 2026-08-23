'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts: string;
}

const QUICK_PROMPTS = [
  'How much did I earn today?',
  'How many more orders for my ₹250 incentive?',
  'When is my next bank payout?',
  'Where is the nearest high-demand surge hotspot?',
  'Why am I not receiving orders right now?',
  'Are any of my KYC documents expiring?',
  'How do I handle customer unavailable on COD?',
  'What are my customer rating stats?',
];

function generateDeliveryAiResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('earn') || q.includes('today') || q.includes('made')) {
    return `💰 **Today's Earnings Breakdown:**\n\n• Net Earnings: **₹942**\n• Completed Trips: **14 orders**\n• Average Per Trip: **₹67.2**\n• Customer Tips: **₹120** (6 tips)\n• Surge Bonus: **₹90**\n\n🔥 You are up **+24%** compared to yesterday! Great hustle!`;
  }
  if (q.includes('incentive') || q.includes('bonus') || q.includes('target')) {
    return `🎯 **Current Incentive Status:**\n\n• Milestone: **Tier 2 (18 Orders)**\n• Current Progress: **14 / 18 completed** (77%)\n• Remaining: **4 more orders** before 11:59 PM\n• Reward: **₹250 cash bonus** added to weekly wallet!\n\n💡 Tip: Indiranagar dinner rush has 40+ pending orders!`;
  }
  if (q.includes('payout') || q.includes('settlement') || q.includes('bank')) {
    return `🏦 **Payout & Settlement Information:**\n\n• Unsettled Wallet Balance: **₹2,480**\n• Scheduled Payout Date: **Monday, 25 Aug 2026**\n• Receiving Bank: **HDFC Bank (A/C •••• 4912)**\n• COD Pending Adjustment: **₹396**\n\nYou can also request an **Instant Payout** in the Payouts tab.`;
  }
  if (q.includes('hotspot') || q.includes('surge') || q.includes('demand') || q.includes('where')) {
    return `🗺️ **Top High-Demand Surge Zones Right Now:**\n\n1. 🔥 **Indiranagar 100ft Road** — 1.4x Surge (+₹40/order) • 42 active orders (0.4 km away)\n2. 🔥 **Koramangala 5th Block** — 1.3x Surge (+₹30/order) • 58 active orders\n3. ⚡ **HSR Layout Sector 1** — 1.2x Surge (+₹20/order)\n\nPosition yourself near **Sony World Junction** for maximum assignment speed!`;
  }
  if (q.includes('not receiving') || q.includes('slow') || q.includes('order') || q.includes('wait')) {
    return `⚡ **Diagnostic Check for Order Assignments:**\n\n✅ Duty Status: **ONLINE**\n✅ GPS Location: **Accurate & Updated**\n✅ Active Delivery: **None pending**\n✅ Acceptance Rate: **96% (High Priority Tier)**\n\n💡 Recommendations:\n• Move closer to commercial restaurant clusters (e.g. 100 Feet Rd)\n• Ensure battery saver mode is disabled to prevent background GPS sleep.`;
  }
  if (q.includes('doc') || q.includes('expir') || q.includes('kyc') || q.includes('licen')) {
    return `📑 **Document Compliance Status:**\n\n• Driving Licence (DL): **Valid until 2031** ✅\n• Vehicle RC: **Valid until 2035** ✅\n• PAN Card: **Verified** ✅\n• ⚠️ **Vehicle Insurance Policy:** Expires on **15 Sep 2026 (in 24 days)**\n\nPlease upload the renewed insurance copy in Profile > Documents before expiry.`;
  }
  if (q.includes('cod') || q.includes('unavail') || q.includes('customer') || q.includes('door')) {
    return `🚪 **Standard SOP for Customer Unavailable / COD:**\n\n1. Try calling the customer via in-app masked dialer twice.\n2. Ring doorbell and wait for the **5-minute countdown timer** at the door.\n3. If unreachable after 5 mins, tap **"Report Issue > Customer Unavailable"**.\n4. Support team will attempt customer contact and cancel with full compensation.\n\n⚠️ **Never mark delivered without customer OTP or collecting COD cash!**`;
  }
  if (q.includes('rating') || q.includes('star') || q.includes('review')) {
    return `⭐ **Your Performance & Quality Score:**\n\n• Rating: **4.89 / 5.0 Stars** (Top 5% in city)\n• 5-Star Reviews: **298 / 342 (87%)**\n• On-time completion: **97.5%**\n• Food safety complaints: **0**\n\nKeep maintaining clean bag insulation and friendly customer greetings!`;
  }
  return `🤖 Hello partner! I am your **QuickBite AI Delivery Copilot**.\n\nI have access to your live delivery stats, today's earnings, current demand heatmaps, incentive milestones, and fleet guidelines.\n\nTry asking:\n• "How much did I earn today?"\n• "Where is the nearest surge hotspot?"\n• "When is my next bank payout?"`;
}

export default function DeliveryAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: '👋 Hello partner! I am your **QuickBite AI Delivery Copilot**. Ask me anything about your earnings, active surge zones, daily incentives, or delivery troubleshooting!',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      role: 'user',
      text,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    await new Promise((r) => setTimeout(r, 800));
    const response = generateDeliveryAiResponse(text);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: response,
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTyping(false);
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} style={{ lineHeight: 1.5, marginBottom: line === '' ? 8 : 2 }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', maxWidth: 900, margin: '0 auto' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #E2ECF5', paddingBottom: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0C2340', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🤖</span> AI Delivery Partner Copilot
          </h1>
          <p style={{ fontSize: 12, color: '#4A6FA5', marginTop: 2 }}>
            Connected to real-time earnings, GPS demand heatmaps, and platform rules
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E8FFF8', border: '1px solid #00B894', padding: '4px 10px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#00B894' }}>AI Online</span>
        </div>
      </div>

      {/* ─── Quick Prompt Chips ─── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, flexShrink: 0, scrollbarWidth: 'none' }}>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            style={{
              padding: '6px 12px',
              borderRadius: 16,
              border: '1px solid #E2ECF5',
              background: '#fff',
              color: '#0C2340',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ─── Messages Canvas ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                gap: 10,
                alignItems: 'flex-start'
              }}
            >
              {!isUser && (
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                padding: '14px 18px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isUser ? '#0984E3' : '#fff',
                color: isUser ? '#fff' : '#0C2340',
                border: isUser ? 'none' : '1px solid #E2ECF5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                fontSize: 13,
              }}>
                {renderText(m.text)}
                <div style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.7)' : '#A0A8C0', textAlign: 'right', marginTop: 4 }}>
                  {m.ts}
                </div>
              </div>

              {isUser && (
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#0C2340',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  RK
                </div>
              )}
            </div>
          );
        })}

        {typing && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0984E3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              🤖
            </div>
            <div style={{ background: '#fff', padding: '12px 18px', borderRadius: '18px', border: '1px solid #E2ECF5', fontSize: 12, color: '#636E72' }}>
              Copilot is checking live fleet metrics...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─── Bottom Chat Input Bar ─── */}
      <div style={{ borderTop: '1px solid #E2ECF5', paddingTop: 12, flexShrink: 0 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          style={{ display: 'flex', gap: 10 }}
        >
          <input
            type="text"
            placeholder="Ask about earnings, surge zones, incentives, or delivery issues..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1.5px solid #E2ECF5',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            style={{
              background: '#0984E3',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '0 20px',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Send ➔
          </button>
        </form>
      </div>
    </div>
  );
}
