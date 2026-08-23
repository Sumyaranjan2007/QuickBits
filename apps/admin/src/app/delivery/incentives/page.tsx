'use client';
import React, { useState } from 'react';

interface IncentivePlan {
  id: string;
  title: string;
  category: 'DAILY' | 'STREAK' | 'PEAK' | 'FESTIVAL';
  target: number;
  current: number;
  unit: string;
  rewardAmount: number;
  deadline: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
  badgeIcon: string;
  description: string;
}

const INCENTIVES: IncentivePlan[] = [
  {
    id: 'inc-1',
    title: 'Daily Starter Milestone',
    category: 'DAILY',
    target: 10,
    current: 10,
    unit: 'Deliveries',
    rewardAmount: 120,
    deadline: 'Tonight, 11:59 PM',
    status: 'COMPLETED',
    badgeIcon: '🥉',
    description: 'Complete 10 successful deliveries anywhere in the city.',
  },
  {
    id: 'inc-2',
    title: 'Super Hero Daily Milestone',
    category: 'DAILY',
    target: 18,
    current: 14,
    unit: 'Deliveries',
    rewardAmount: 250,
    deadline: 'Tonight, 11:59 PM',
    status: 'IN_PROGRESS',
    badgeIcon: '🥈',
    description: 'Complete 18 successful orders today to unlock a ₹250 instant cash bonus.',
  },
  {
    id: 'inc-3',
    title: 'Legendary 25 Order Marathon',
    category: 'DAILY',
    target: 25,
    current: 14,
    unit: 'Deliveries',
    rewardAmount: 450,
    deadline: 'Tonight, 11:59 PM',
    status: 'IN_PROGRESS',
    badgeIcon: '🥇',
    description: 'Deliver 25 orders in a single day for our highest daily payout tier.',
  },
  {
    id: 'inc-4',
    title: 'Weekend 4-Day Super Streak',
    category: 'STREAK',
    target: 4,
    current: 3,
    unit: 'Active Days',
    rewardAmount: 600,
    deadline: 'Sunday Night, 11:59 PM',
    status: 'IN_PROGRESS',
    badgeIcon: '🔥',
    description: 'Deliver minimum 8 orders per day for 4 consecutive weekend days (Thu-Sun).',
  },
  {
    id: 'inc-5',
    title: 'Dinner Peak Surge Multiplier',
    category: 'PEAK',
    target: 6,
    current: 4,
    unit: 'Peak Orders',
    rewardAmount: 180,
    deadline: '11:00 PM Tonight',
    status: 'IN_PROGRESS',
    badgeIcon: '⚡',
    description: 'Complete 6 orders during peak dinner hours (7:30 PM to 11:00 PM).',
  },
  {
    id: 'inc-6',
    title: 'Zero Cancellation Gold Badge',
    category: 'FESTIVAL',
    target: 50,
    current: 50,
    unit: 'Consecutive Orders',
    rewardAmount: 350,
    deadline: 'Active this Week',
    status: 'COMPLETED',
    badgeIcon: '🛡️',
    description: 'Maintain a 100% acceptance and 0% cancellation record across 50 orders.',
  },
];

export default function DeliveryIncentivesPage() {
  const [filter, setFilter] = useState<'ALL' | 'DAILY' | 'STREAK' | 'PEAK'>('ALL');

  const filtered = INCENTIVES.filter((item) => filter === 'ALL' || item.category === filter);
  const totalEarnedSoFar = INCENTIVES.filter((i) => i.status === 'COMPLETED').reduce((sum, i) => sum + i.rewardAmount, 0);
  const totalAvailable = INCENTIVES.reduce((sum, i) => sum + i.rewardAmount, 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🎁 Incentives & Milestones</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Unlock daily targets, surge bonuses, and weekend streak cash rewards
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {(['ALL', 'DAILY', 'STREAK', 'PEAK'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: filter === f ? '#0984E3' : '#fff',
                color: filter === f ? '#fff' : '#636E72',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Bonus Hero Card ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #6C5CE7 0%, #00B894 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 10px 30px rgba(108, 92, 231, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>
            TOTAL INCENTIVES EARNED THIS WEEK
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, marginTop: 4 }}>
            ₹{totalEarnedSoFar} <span style={{ fontSize: 18, opacity: 0.8, fontWeight: 600 }}>/ ₹{totalAvailable} Available</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
            2 milestones claimed • Complete 4 more orders today to claim +₹250!
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.18)', padding: '12px 18px', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>🔥</div>
          <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>Streak: 3 Days</div>
        </div>
      </div>

      {/* ─── Incentives List ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 16 }}>
        {filtered.map((inc) => {
          const percent = Math.min(100, Math.round((inc.current / inc.target) * 100));
          const isCompleted = inc.status === 'COMPLETED';

          return (
            <div
              key={inc.id}
              style={{
                background: '#fff',
                borderRadius: 18,
                padding: '20px',
                border: `1.5px solid ${isCompleted ? '#00B894' : '#E2ECF5'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{inc.badgeIcon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0C2340' }}>{inc.title}</div>
                      <div style={{ fontSize: 11, color: '#636E72' }}>⏰ Ends: {inc.deadline}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: isCompleted ? '#00B894' : '#0984E3',
                    background: isCompleted ? '#E8FFF8' : '#E8F4FD',
                    padding: '4px 8px',
                    borderRadius: 8
                  }}>
                    +₹{inc.rewardAmount}
                  </span>
                </div>

                <p style={{ fontSize: 12, color: '#4A6FA5', lineHeight: 1.5, marginBottom: 16 }}>
                  {inc.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#0C2340', marginBottom: 6 }}>
                  <span>Progress: {inc.current} / {inc.target} {inc.unit}</span>
                  <span style={{ color: isCompleted ? '#00B894' : '#0984E3' }}>{percent}%</span>
                </div>

                <div style={{ height: 8, background: '#E2ECF5', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: isCompleted ? '#00B894' : 'linear-gradient(90deg, #0984E3, #00CEC9)',
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{
                  padding: '8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  background: isCompleted ? '#E8FFF8' : '#F8FAFD',
                  color: isCompleted ? '#00B894' : '#4A6FA5',
                  border: `1px solid ${isCompleted ? '#A3E4D7' : '#E2ECF5'}`
                }}>
                  {isCompleted ? '✓ Reward Claimed & Credited' : `${inc.target - inc.current} more ${inc.unit} to complete`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
