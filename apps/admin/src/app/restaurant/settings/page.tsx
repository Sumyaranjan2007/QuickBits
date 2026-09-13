'use client';
import React, { useState } from 'react';
import { useOrderSoundAlert } from '../../../context/OrderSoundAlertContext';

const STAFF_ROLES = ['Store Manager', 'Kitchen Chef', 'Cashier', 'Order Handler'];

const DEMO_STAFF = [
  { id: 'st-1', name: 'Rohan Sharma', email: 'rohan@restaurant.com', role: 'Store Manager', phone: '+91 99887 76655', isActive: true },
  { id: 'st-2', name: 'Chef Suresh Kumar', email: 'suresh.chef@restaurant.com', role: 'Kitchen Chef', phone: '+91 98765 11223', isActive: true },
  { id: 'st-3', name: 'Anjali Verma', email: 'anjali@restaurant.com', role: 'Cashier', phone: '+91 98111 44556', isActive: true },
  { id: 'st-4', name: 'Karthik R.', email: 'karthik@restaurant.com', role: 'Order Handler', phone: '+91 98222 77889', isActive: false },
];

export default function RestaurantSettingsPage() {
  const {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    alertDuration,
    setAlertDuration,
    repeatReminder,
    setRepeatReminder,
    isPlayingAlert,
    remainingAlertSeconds,
    testSound,
    stopSound,
    notificationPermission,
    requestBrowserNotificationPermission,
  } = useOrderSoundAlert();

  const [activeTab, setActiveTab] = useState<'STAFF' | 'AI' | 'NOTIFICATIONS' | 'ACCOUNT'>('STAFF');
  const [staffList, setStaffList] = useState(DEMO_STAFF);
  const [inviteModal, setInviteModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'Kitchen Chef', phone: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderCancelled: true,
    riderAssigned: true,
    soundAlerts: true,
    settlementAlerts: true,
    reviewAlerts: true,
  });

  // AI Tools Demo Generation States
  const [aiPromptType, setAiPromptType] = useState('PROMO');
  const [aiGeneratedResult, setAiGeneratedResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStaff = (id: string) => {
    setStaffList(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    showToast('Staff status updated!');
  };

  const handleInviteStaff = () => {
    if (!newStaff.name.trim() || !newStaff.email.trim()) {
      alert('Name and email are required');
      return;
    }
    const created = {
      id: `st-${Date.now()}`,
      ...newStaff,
      isActive: true,
    };
    setStaffList(prev => [...prev, created]);
    setInviteModal(false);
    setNewStaff({ name: '', email: '', role: 'Kitchen Chef', phone: '' });
    showToast(`Invite sent to ${created.email}!`);
  };

  const handleRunAiTool = (tool: string) => {
    setAiLoading(true);
    setAiGeneratedResult(null);
    setTimeout(() => {
      setAiLoading(false);
      if (tool === 'PROMO') {
        setAiGeneratedResult('🔥 Weekend Biryani Bonanza! Order 2 Chicken Dum Biryanis and get a Free Starter with code DUMDEAL. Valid till Sunday midnight!');
      } else if (tool === 'PRICING') {
        setAiGeneratedResult('💡 Smart Pricing Insight: Raising Paneer Butter Masala from ₹220 to ₹235 aligns with nearby Indiranagar competitor benchmarks while maintaining strong margin (+6.8%).');
      } else if (tool === 'REVIEW_REPLY') {
        setAiGeneratedResult('💬 "Dear Guest, we are overjoyed to hear you loved our dum biryani! Our chefs use authentic slow-fire dum techniques to preserve aromatic spices. We look forward to cooking for you again soon!"');
      } else if (tool === 'MENU_PERFORMANCE') {
        setAiGeneratedResult('📊 Performance Suggestion: "Crispy Peri Peri Fries" is frequently bundled with "Smash Burgers". Consider creating a Combo to lift Average Order Value by ~₹80.');
      }
    }, 600);
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
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#4A0A10', margin: 0 }}>
          ⚙️ Partner Settings & Tools
        </h1>
        <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
          Manage team members, automated AI assistants, sound notifications, and store credentials
        </p>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #EAE0D0', paddingBottom: 10, overflowX: 'auto' }}>
        {[
          { key: 'STAFF', label: '👥 Team & Staff' },
          { key: 'AI', label: '🤖 AI Business Tools' },
          { key: 'NOTIFICATIONS', label: '🔔 Notifications & Sound' },
          { key: 'ACCOUNT', label: '🔒 Account & Security' },
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
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: STAFF ─── */}
      {activeTab === 'STAFF' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
                Store Staff & Roles
              </h3>
              <p style={{ fontSize: 13, color: '#6F6F6F', margin: '2px 0 0' }}>
                Grant kitchen chefs, cashiers, and managers access to the portal
              </p>
            </div>
            <button
              onClick={() => setInviteModal(true)}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: '#FFB21A',
                color: '#171717',
                fontWeight: 900,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 178, 26, 0.3)',
              }}
            >
              + INVITE STAFF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {staffList.map(member => (
              <div
                key={member.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #EAE0D0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: '#6F6F6F' }}>{member.email}</div>
                    <div style={{ fontSize: 12, color: '#6F6F6F' }}>{member.phone}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: member.isActive ? '#E8F8F0' : '#FEECEC',
                      color: member.isActive ? '#20A464' : '#D64545',
                    }}
                  >
                    {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div
                  style={{
                    background: '#FAF6EF',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#4A0A10',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>Role:</span>
                  <strong>{member.role}</strong>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => handleToggleStaff(member.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      border: '1px solid #EAE0D0',
                      background: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: AI TOOLS ─── */}
      {activeTab === 'AI' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
              AI Restaurant Advisor & Marketing Automation
            </h3>
            <p style={{ fontSize: 13, color: '#6F6F6F', margin: '4px 0 0' }}>
              One-click AI tools to optimize menu, craft promo campaigns, and answer customer reviews
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {[
              { key: 'PROMO', label: 'Generate Promo Copy', icon: '📢', desc: 'Craft festival and weekend discount text' },
              { key: 'PRICING', label: 'Suggest Menu Pricing', icon: '🏷️', desc: 'Analyze competitive dish benchmarks' },
              { key: 'REVIEW_REPLY', label: 'Smart Review Replies', icon: '💬', desc: 'Draft courteous owner responses' },
              { key: 'MENU_PERFORMANCE', label: 'Combo & Upsell Tips', icon: '🍔', desc: 'Identify bundle opportunities' },
            ].map(tool => (
              <button
                key={tool.key}
                onClick={() => {
                  setAiPromptType(tool.key);
                  handleRunAiTool(tool.key);
                }}
                style={{
                  padding: '16px',
                  borderRadius: 14,
                  background: aiPromptType === tool.key ? '#FAF0EB' : '#FFFFFF',
                  border: aiPromptType === tool.key ? '2px solid #4A0A10' : '1px solid #EAE0D0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 24 }}>{tool.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#171717' }}>{tool.label}</div>
                <div style={{ fontSize: 11, color: '#6F6F6F' }}>{tool.desc}</div>
              </button>
            ))}
          </div>

          {/* AI Result Box */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#4A0A10' }}>
                ✨ AI Assistant Output
              </span>
              {aiGeneratedResult && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiGeneratedResult || '');
                    showToast('Copied to clipboard!');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #EAE0D0',
                    background: '#FAF6EF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  📋 Copy Output
                </button>
              )}
            </div>

            {aiLoading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#6F6F6F' }}>
                Generating intelligent suggestions...
              </div>
            ) : aiGeneratedResult ? (
              <div
                style={{
                  background: '#FAF6EF',
                  padding: '16px',
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#171717',
                  border: '1px solid #EAE0D0',
                }}
              >
                {aiGeneratedResult}
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: 13 }}>
                Select an AI action above to generate suggestions for your store.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: NOTIFICATIONS ─── */}
      {activeTab === 'NOTIFICATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
          {/* 1. Core New Order Sound Alert Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '2px solid #4A0A10',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: '0 4px 16px rgba(74, 10, 16, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#4A0A10',
                    color: '#FFB21A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  🔔
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#171717', margin: 0 }}>
                    New Order Sound Alert
                  </h3>
                  <p style={{ fontSize: 12, color: '#6F6F6F', margin: '3px 0 0' }}>
                    Instant attention-grabbing chime whenever a customer places an order
                  </p>
                </div>
              </div>

              {/* Sound ON/OFF Toggle Button */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(soundEnabled ? '🔇 Order sound disabled' : '🔊 Order sound enabled!');
                }}
                id="toggle-order-sound-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: soundEnabled ? '1px solid #BBE9D1' : '1px solid #EAE0D0',
                  background: soundEnabled ? '#E8F8F0' : '#F5F5F5',
                  color: soundEnabled ? '#20A464' : '#6F6F6F',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div
              style={{
                background: '#FAF6EF',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #EAE0D0',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>
                  Notification Volume
                </label>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: '#4A0A10',
                    background: '#FFFFFF',
                    padding: '2px 10px',
                    borderRadius: 8,
                    border: '1px solid #EAE0D0',
                  }}
                >
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                disabled={!soundEnabled}
                onChange={e => setVolume(parseFloat(e.target.value))}
                id="order-volume-slider"
                style={{
                  width: '100%',
                  accentColor: '#4A0A10',
                  cursor: soundEnabled ? 'pointer' : 'not-allowed',
                  opacity: soundEnabled ? 1 : 0.5,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
                <span>Mute (0%)</span>
                <span>Balanced (50%)</span>
                <span>Max Alert (100%)</span>
              </div>
            </div>

            {/* Alert Duration Control (Enforced >= 15 Seconds) */}
            <div
              style={{
                background: '#FAF6EF',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #EAE0D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>
                  Alert Duration (Minimum 15 Seconds)
                </div>
                <div style={{ fontSize: 11, color: '#6F6F6F', marginTop: 2 }}>
                  Guarantees sound rings continuously for busy restaurant counters
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[15, 20, 30].map(secs => (
                  <button
                    key={secs}
                    onClick={() => {
                      setAlertDuration(secs);
                      showToast(`Alert duration set to ${secs}s!`);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: alertDuration === secs ? '2px solid #4A0A10' : '1px solid #EAE0D0',
                      background: alertDuration === secs ? '#4A0A10' : '#FFFFFF',
                      color: alertDuration === secs ? '#FFFFFF' : '#171717',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            </div>

            {/* Repeat Reminder & Test Sound Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#171717',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={repeatReminder}
                  onChange={e => {
                    setRepeatReminder(e.target.checked);
                    showToast('Repeat reminder updated');
                  }}
                  style={{ width: 18, height: 18, accentColor: '#4A0A10' }}
                />
                <span>Repeat reminder every 30s while order is PENDING</span>
              </label>

              {/* TEST ORDER SOUND BUTTON (15 SECONDS) */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={testSound}
                  id="test-sound-btn"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: isPlayingAlert ? '#D64545' : '#FFB21A',
                    color: isPlayingAlert ? '#FFFFFF' : '#4A0A10',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isPlayingAlert ? '⏹️' : '🔔'}</span>
                  <span>
                    {isPlayingAlert
                      ? `STOP ALERT (${remainingAlertSeconds}s left)`
                      : `TEST ORDER SOUND (${alertDuration}s)`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Desktop Background Notification Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>
                Desktop Background Notifications
              </div>
              <div style={{ fontSize: 12, color: '#6F6F6F', marginTop: 2 }}>
                Receive popups with sound when the browser tab is minimized or in the background.
              </div>
            </div>
            {notificationPermission === 'granted' ? (
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: '#E8F8F0',
                  color: '#20A464',
                  fontSize: 12,
                  fontWeight: 800,
                  border: '1px solid #BBE9D1',
                  whiteSpace: 'nowrap',
                }}
              >
                ✓ Permission Granted
              </span>
            ) : (
              <button
                onClick={async () => {
                  const res = await requestBrowserNotificationPermission();
                  showToast(res === 'granted' ? 'Notifications enabled!' : 'Permission status: ' + res);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #4A0A10',
                  background: '#FFFFFF',
                  color: '#4A0A10',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Enable Notifications
              </button>
            )}
          </div>

          {/* 3. Additional Operational Notification Preferences */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #EAE0D0',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 800, color: '#171717', margin: '0 0 4px' }}>
              Other Partner Notifications
            </h4>
            {[
              { key: 'soundAlerts', label: 'Kitchen Prep Reminder Bells', desc: 'Audio beep when an order ticket approaches 15 mins' },
              { key: 'riderAssigned', label: 'Rider Arrived Notification', desc: 'Popup when assigned delivery partner reaches store' },
              { key: 'settlementAlerts', label: 'Daily Bank Settlement Summaries', desc: 'SMS and email notification after payout processing' },
              { key: 'reviewAlerts', label: 'Customer Review Alerts', desc: 'Notify immediately when customer leaves feedback' },
            ].map(item => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#FAF6EF',
                  border: '1px solid #EAE0D0',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#171717' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#6F6F6F' }}>{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(notifications as any)[item.key]}
                  onChange={e => {
                    setNotifications({ ...notifications, [item.key]: e.target.checked });
                    showToast('Notification preference saved!');
                  }}
                  style={{ width: 18, height: 18, accentColor: '#4A0A10' }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ACCOUNT & SECURITY ─── */}
      {activeTab === 'ACCOUNT' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #EAE0D0',
            padding: '24px',
            maxWidth: 540,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#171717', margin: 0 }}>
            Security & Login Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Current Password</label>
              <input type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>New Password</label>
              <input type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <button
              onClick={() => showToast('Password changed successfully!')}
              style={{
                padding: '12px',
                borderRadius: 10,
                background: '#4A0A10',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                marginTop: 6,
              }}
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {/* ─── Invite Staff Modal ─── */}
      {inviteModal && (
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
          onClick={() => setInviteModal(false)}
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
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#4A0A10', margin: '0 0 14px' }}>
              Invite Team Member
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chef"
                  value={newStaff.name}
                  onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="ramesh@restaurant.com"
                  value={newStaff.email}
                  onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Designated Role</label>
                <select
                  value={newStaff.role}
                  onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                  style={inputStyle}
                >
                  {STAFF_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#6F6F6F' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98..."
                  value={newStaff.phone}
                  onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={() => setInviteModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #EAE0D0', background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteStaff}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#4A0A10', color: '#FFFFFF', fontWeight: 800 }}
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #EAE0D0',
  fontSize: 14,
  background: '#FAF6EF',
  color: '#171717',
  boxSizing: 'border-box',
};
