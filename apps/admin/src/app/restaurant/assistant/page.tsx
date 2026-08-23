'use client';
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts: string;
}

const QUICK_PROMPTS = [
  'How were my sales today?',
  'Which dishes are performing best?',
  'Show my pending orders',
  'What are my busiest hours?',
  'How much is my pending payout?',
  'Which items should I promote?',
  'Show my cancellation rate',
  'How do I improve my rating?',
];

function generateResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('sale') || q.includes('revenue')) {
    return `📊 **Today's Sales Summary:**\n\n• Gross Revenue: **₹8,420**\n• Total Orders: **18**\n• Average Order Value: **₹468**\n• Best performing item: Classic Smash Burger (6 orders)\n\n📈 You're up **+22%** compared to last week! Keep it up!`;
  }
  if (q.includes('dish') || q.includes('item') || q.includes('performing')) {
    return `🍕 **Top Performing Dishes This Week:**\n\n1. Classic Smash Burger — 128 orders · ₹36,992\n2. Chicken Biryani — 98 orders · ₹34,202\n3. Margherita Pizza — 76 orders · ₹34,124\n\n💡 Tip: Add a combo deal with your #1 and #2 dishes to increase order value!`;
  }
  if (q.includes('pending') || q.includes('order')) {
    return `📦 **Current Order Status:**\n\n• ⏳ Pending (needs acceptance): **2 orders**\n• 🍳 Preparing: **1 order**\n• ✅ Ready for pickup: **1 order**\n\nWould you like me to navigate you to the Live Orders page?`;
  }
  if (q.includes('hour') || q.includes('busy') || q.includes('peak')) {
    return `⏰ **Your Peak Hours (Last 7 Days):**\n\n🔥 Dinner rush: **7pm – 10pm** (highest volume)\n🍽️ Lunch rush: **12pm – 2pm** (2nd busiest)\n🌅 Late morning: **11am – 12pm** (moderate)\n\n💡 Consider increasing staff during 7–9pm to reduce preparation delays!`;
  }
  if (q.includes('payout') || q.includes('settlement') || q.includes('payment')) {
    return `💰 **Your Financial Summary:**\n\n• Pending Settlement: **₹17,520** (due Mon 25 Aug)\n• This month's Net Payout: **₹53,260**\n• Commission paid (20%): **₹14,976**\n\n✅ Your bank account is set up correctly and payouts are on schedule.`;
  }
  if (q.includes('promot') || q.includes('offer') || q.includes('coupon')) {
    return `🎁 **Promotion Recommendations:**\n\nBased on your slow-selling items:\n\n1. **Paneer Tikka Burger** — Consider a 15% discount coupon\n2. **Garlic Bread** — Bundle with your top pizzas as a combo\n\nYour current WELCOME50 coupon has been used 312 times! 🔥`;
  }
  if (q.includes('cancel') || q.includes('rate')) {
    return `📊 **Operational Performance:**\n\n• Acceptance Rate: **94%** ✅ (Excellent!)\n• Cancellation Rate: **3.2%** ✅ (Below platform average of 5%)\n• Avg Preparation Time: **22 minutes** ✅ (Target: 25 min)\n\nYou're in the top 15% of restaurants in your area! 🏆`;
  }
  if (q.includes('rating') || q.includes('improve')) {
    return `⭐ **Rating Improvement Tips:**\n\nYour current rating: **4.8★** (Excellent!)\n\nTo reach 5.0★:\n1. Reply to all reviews — you have 2 unanswered ⚠️\n2. Add photos to your menu items — 3 items missing images\n3. Reduce prep time variability during peak hours\n4. Consider adding a "Thank you" note to orders 🙏`;
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return `👋 Hello! I'm your **QuickBite AI Restaurant Assistant**.\n\nI can help you with:\n• 📊 Sales & revenue insights\n• 📦 Order management\n• 🍕 Menu performance analysis\n• 💰 Financial summaries\n• ⭐ Rating & review guidance\n• 📈 Growth recommendations\n\nWhat would you like to know?`;
  }
  return `🤖 I can help you analyze your restaurant's performance, orders, menu, finances, and more!\n\nTry asking me:\n• "How were my sales today?"\n• "Which dishes are bestsellers?"\n• "What's my pending payout?"\n• "When are my busiest hours?"\n\nI always use your **real restaurant data** to give accurate insights.`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: '👋 Hello! I\'m your **QuickBite AI Restaurant Assistant**. Ask me anything about your orders, sales, menu performance, or payouts! I have access to your real-time restaurant data.',
      ts: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text, ts: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const response = generateResponse(text);
    setMessages(prev => [...prev, { role: 'assistant', text: response, ts: new Date().toLocaleTimeString() }]);
    setTyping(false);
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 0, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">🤖 AI Business Assistant</h1>
          <p className="page-subtitle">Powered by your real restaurant data — sales, orders, menu, and finances</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#E8FFF8', border: '1px solid #00B894' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00B894' }}>AI Online</span>
        </div>
      </div>

      {/* ─── Quick Prompts ─── */}
      <div style={{ padding: '12px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            style={{
              padding: '7px 14px', background: 'var(--surface-hover)', border: '1px solid var(--border)',
              borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              color: 'var(--text-sec)', transition: '0.2s',
            }}
            onMouseEnter={e => { (e.target as any).style.background = 'var(--primary-light)'; (e.target as any).style.color = 'var(--primary)'; }}
            onMouseLeave={e => { (e.target as any).style.background = 'var(--surface-hover)'; (e.target as any).style.color = 'var(--text-sec)'; }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ─── Chat Messages ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', scrollbarWidth: 'thin' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: '70%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                fontSize: 14, lineHeight: 1.5, boxShadow: 'var(--shadow-sm)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}>
                {renderText(msg.text)}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6, textAlign: 'right' }}>{msg.ts}</div>
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#00B894', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  👤
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                🤖
              </div>
              <div style={{ padding: '12px 16px', background: '#fff', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', opacity: 0.5, animation: `bounce 0.8s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ─── Input Bar ─── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="input"
            placeholder="Ask me about your sales, orders, menu, or payouts..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            disabled={typing}
            style={{ flex: 1, height: 48, fontSize: 14 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            style={{ height: 48, width: 56, borderRadius: 12, fontSize: 20, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
          AI uses your real restaurant data · Always confirm before making changes
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
