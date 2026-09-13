'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderSoundAlert, PendingAlertOrder } from '../context/OrderSoundAlertContext';

export function AudioUnlockBanner() {
  const { isAudioUnlocked, unlockAudio } = useOrderSoundAlert();
  const [dismissed, setDismissed] = useState(false);

  if (isAudioUnlocked || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        maxWidth: 420,
        background: '#4A0A10',
        color: '#FFFFFF',
        borderRadius: 16,
        padding: '16px 20px',
        boxShadow: '0 12px 36px rgba(74, 10, 16, 0.35)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        border: '1px solid #6B151C',
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255, 178, 26, 0.2)',
            color: '#FFB21A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🔔
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Enable New Order Alerts</div>
          <div style={{ fontSize: 12, color: '#F0D4CB', marginTop: 2 }}>
            Allow audio chime so you never miss new incoming orders.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={unlockAudio}
          id="enable-order-audio-btn"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#FFB21A',
            color: '#4A0A10',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          ENABLE ALERTS
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#F0D4CB',
            fontSize: 16,
            cursor: 'pointer',
            padding: '4px',
          }}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function NewOrderAlertModal() {
  const router = useRouter();
  const {
    pendingAlertOrders,
    isAlertModalOpen,
    dismissAlertModal,
    acceptOrderFromAlert,
    rejectOrderFromAlert,
  } = useOrderSoundAlert();

  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Kitchen too busy / Rush hour');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAlertModalOpen || pendingAlertOrders.length === 0) return null;

  const orderCount = pendingAlertOrders.length;
  const activeOrder = pendingAlertOrders[0];

  const handleViewOrder = (orderId: string) => {
    dismissAlertModal();
    router.push('/restaurant/orders');
  };

  const handleAccept = async (orderId: string) => {
    setIsProcessing(true);
    await acceptOrderFromAlert(orderId);
    setIsProcessing(false);
  };

  const handleReject = async (orderId: string) => {
    setIsProcessing(true);
    await rejectOrderFromAlert(orderId, rejectReason);
    setRejectingOrderId(null);
    setIsProcessing(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={dismissAlertModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: 20,
          border: '2px solid #4A0A10',
          boxShadow: '0 20px 60px rgba(74, 10, 16, 0.35)',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Brand Palette */}
        <div
          style={{
            background: '#4A0A10',
            color: '#FFFFFF',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FFB21A',
                color: '#4A0A10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                animation: 'bellShake 1.2s infinite ease-in-out',
              }}
            >
              🔔
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.2 }}>
                {orderCount === 1 ? 'NEW ORDER RECEIVED' : `${orderCount} NEW ORDERS RECEIVED!`}
              </div>
              <div style={{ fontSize: 12, color: '#FFB21A', fontWeight: 600, marginTop: 2 }}>
                Action required: Confirm order to start prep
              </div>
            </div>
          </div>
          <button
            onClick={dismissAlertModal}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: 16,
              color: '#FFFFFF',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close Alert"
          >
            ✕
          </button>
        </div>

        {/* Order Details Body */}
        <div style={{ padding: '24px', background: '#FAF6EF', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Order Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '18px',
              border: '1px solid #EAE0D0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4A0A10' }}>
                  #{activeOrder.id}
                </div>
                <div style={{ fontSize: 13, color: '#6F6F6F', marginTop: 2 }}>
                  Customer: <strong>{activeOrder.customer || 'QuickBite Guest'}</strong>
                </div>
              </div>
              <span
                style={{
                  background: '#FFF7E6',
                  color: '#F5A623',
                  border: '1px solid #FDDCA5',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                PENDING
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                background: '#FAF6EF',
                padding: '12px',
                borderRadius: 10,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#6F6F6F' }}>Items</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#171717' }}>{activeOrder.itemsCount} Items</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6F6F6F' }}>Total</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#20A464' }}>₹{activeOrder.total}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6F6F6F' }}>Payment</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#171717' }}>{activeOrder.paymentMethod}</div>
              </div>
            </div>

            {/* Item Preview list */}
            {activeOrder.items && activeOrder.items.length > 0 && (
              <div style={{ borderTop: '1px solid #F0E8DC', paddingTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>
                  Ordered Dishes
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {activeOrder.items.slice(0, 3).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#333' }}>
                      <span>{(it.qty || it.quantity || 1)}x {it.name}</span>
                      {it.price && <span style={{ fontWeight: 600 }}>₹{it.price * (it.qty || it.quantity || 1)}</span>}
                    </div>
                  ))}
                  {activeOrder.items.length > 3 && (
                    <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>
                      +{activeOrder.items.length - 3} more items...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Multiple Orders Stack indicator */}
          {orderCount > 1 && (
            <div
              style={{
                background: '#FAF0EB',
                border: '1px solid #F0D4CB',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                color: '#4A0A10',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>+ {orderCount - 1} more order(s) in queue:</span>
              <span style={{ fontSize: 11, color: '#6F6F6F' }}>
                {pendingAlertOrders.slice(1).map(o => `#${o.id}`).join(', ')}
              </span>
            </div>
          )}

          {/* Reject Reason Selector when clicking Reject */}
          {rejectingOrderId === activeOrder.id ? (
            <div
              style={{
                background: '#FEECEC',
                border: '1px solid #F9BABA',
                borderRadius: 12,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#D64545' }}>
                Select Reason for Order Rejection:
              </div>
              <select
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #F9BABA',
                  background: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <option value="Item(s) out of stock">Item(s) out of stock</option>
                <option value="Kitchen too busy / Rush hour">Kitchen too busy / Rush hour</option>
                <option value="Restaurant closing soon">Restaurant closing soon</option>
                <option value="Special instructions cannot be fulfilled">Special instructions cannot be fulfilled</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setRejectingOrderId(null)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    border: '1px solid #CCC',
                    background: '#FFF',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(activeOrder.id)}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#D64545',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setRejectingOrderId(activeOrder.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid #F3D2D2',
                  background: '#FFF5F5',
                  color: '#D64545',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.15s',
                }}
              >
                ✕ REJECT
              </button>

              <button
                onClick={() => handleViewOrder(activeOrder.id)}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid #4A0A10',
                  background: '#FFFFFF',
                  color: '#4A0A10',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'background 0.15s',
                }}
              >
                👁️ VIEW ORDER
              </button>

              <button
                onClick={() => handleAccept(activeOrder.id)}
                disabled={isProcessing}
                id="modal-accept-order-btn"
                style={{
                  flex: 1.3,
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#FFB21A',
                  color: '#4A0A10',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(255, 178, 26, 0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(255, 178, 26, 0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(255, 178, 26, 0.4)';
                }}
              >
                {isProcessing ? 'CONFIRMING...' : '✓ ACCEPT ORDER'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-8deg); }
          80% { transform: rotate(8deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
