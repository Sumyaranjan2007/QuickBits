'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase, approvePriceChangeRequest, rejectPriceChangeRequest } from '../../../lib/supabase';

interface PriceRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  menuItemId: string;
  menuItemName: string;
  currentPrice: number;
  requestedPrice: number;
  priceDiff?: number;
  priceDiffPercent?: number;
  reason: string;
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface PriceAuditLog {
  id: string;
  requestId: string;
  restaurantId: string;
  restaurantName: string;
  menuItemId: string;
  menuItemName: string;
  oldPrice: number;
  newPrice: number;
  requestedBy: string;
  approvedBy: string;
  requestedAt: string;
  approvedAt: string;
  reason: string;
}

const DEMO_PRICE_REQUESTS: PriceRequest[] = [
  {
    id: 'pr-101',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro (Indiranagar)',
    menuItemId: 'item-1',
    menuItemName: 'Hyderabadi Chicken Dum Biryani',
    currentPrice: 249,
    requestedPrice: 279,
    priceDiff: 30,
    priceDiffPercent: 12,
    reason: 'Raw chicken and basmati rice procurement costs increased by 15% across South India vendors.',
    note: 'Supplier invoice available upon request',
    status: 'PENDING',
    requestedBy: 'partner@quickbite.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'pr-102',
    restaurantId: 'rest-2',
    restaurantName: 'Truffle & Smash Co. (Koramangala)',
    menuItemId: 'item-8',
    menuItemName: 'Double Truffle Cheeseburger',
    currentPrice: 299,
    requestedPrice: 349,
    priceDiff: 50,
    priceDiffPercent: 17,
    reason: 'Imported truffle oil and aged cheddar price surge.',
    note: 'Matching competitor pricing in Koramangala',
    status: 'PENDING',
    requestedBy: 'manager@trufflesmash.com',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'pr-100',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro (Indiranagar)',
    menuItemId: 'item-2',
    menuItemName: 'Paneer Butter Masala',
    currentPrice: 200,
    requestedPrice: 220,
    priceDiff: 20,
    priceDiffPercent: 10,
    reason: 'Dairy and butter market rate revision',
    status: 'APPROVED',
    approvedBy: 'Admin (superadmin@quickbite.com)',
    approvedAt: '2026-09-12 11:30 AM',
    requestedBy: 'partner@quickbite.com',
    createdAt: '2026-09-11 09:00 AM',
    updatedAt: '2026-09-12 11:30 AM',
  },
  {
    id: 'pr-99',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro (Indiranagar)',
    menuItemId: 'item-3',
    menuItemName: 'Crispy Peri Peri Fries',
    currentPrice: 120,
    requestedPrice: 160,
    priceDiff: 40,
    priceDiffPercent: 33,
    reason: 'Portion size increase',
    adminReason: 'Price increase exceeds 25% cap without verified portion resize inspection.',
    status: 'REJECTED',
    approvedBy: 'Admin (superadmin@quickbite.com)',
    requestedBy: 'partner@quickbite.com',
    createdAt: '2026-09-10 02:15 PM',
    updatedAt: '2026-09-10 04:30 PM',
  },
];

const DEMO_AUDIT_LOGS: PriceAuditLog[] = [
  {
    id: 'audit-1',
    requestId: 'pr-100',
    restaurantId: 'rest-1',
    restaurantName: 'QuickBite Bistro',
    menuItemId: 'item-2',
    menuItemName: 'Paneer Butter Masala',
    oldPrice: 200,
    newPrice: 220,
    requestedBy: 'partner@quickbite.com',
    approvedBy: 'superadmin@quickbite.com',
    requestedAt: '2026-09-11 09:00 AM',
    approvedAt: '2026-09-12 11:30 AM',
    reason: 'Dairy and butter market rate revision',
  },
];

export default function AdminPriceRequestsPage() {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'AUDIT'>('REQUESTS');
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [requests, setRequests] = useState<PriceRequest[]>(DEMO_PRICE_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<PriceAuditLog[]>(DEMO_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectDialogReq, setRejectDialogReq] = useState<PriceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    // 1. Try Supabase first
    try {
      const { data: supaReqs } = await supabase
        .from('restaurant_price_change_requests')
        .select('*, restaurants(name), menu_items(name)')
        .order('created_at', { ascending: false });

      if (supaReqs && supaReqs.length > 0) {
        const mapped: PriceRequest[] = supaReqs.map((r: any) => ({
          id: r.id,
          restaurantId: r.restaurant_id,
          restaurantName: r.restaurants?.name || r.restaurant_id || 'QuickBite Partner',
          menuItemId: r.menu_item_id,
          menuItemName: r.menu_items?.name || r.menu_item_id,
          currentPrice: Number(r.old_price),
          requestedPrice: Number(r.requested_price),
          priceDiff: Number(r.requested_price) - Number(r.old_price),
          priceDiffPercent: Math.round(((Number(r.requested_price) - Number(r.old_price)) / (Number(r.old_price) || 1)) * 100),
          reason: r.reason,
          status: r.status,
          requestedBy: 'Store Partner',
          createdAt: r.created_at,
          updatedAt: r.created_at,
          approvedAt: r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : undefined,
          approvedBy: r.reviewed_by || undefined,
        }));
        setRequests(mapped);
        return;
      }
    } catch (e) {
      console.warn('Supabase admin price requests error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to realtime changes on price change requests
    const channel = supabase
      .channel('admin-price-change-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_price_change_requests' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Approve Handler
  const handleApprove = async (req: PriceRequest) => {
    try {
      await approvePriceChangeRequest(req.id);
    } catch (e) {
      console.warn('Supabase approve price request error:', e);
    }

    const approvedAt = new Date().toLocaleString();
    setRequests(prev =>
      prev.map(r =>
        r.id === req.id
          ? {
              ...r,
              status: 'APPROVED',
              approvedBy: 'Admin (Current Session)',
              approvedAt,
            }
          : r
      )
    );

    // Add to Audit Log
    const newAudit: PriceAuditLog = {
      id: `audit-${Date.now()}`,
      requestId: req.id,
      restaurantId: req.restaurantId,
      restaurantName: req.restaurantName,
      menuItemId: req.menuItemId,
      menuItemName: req.menuItemName,
      oldPrice: req.currentPrice,
      newPrice: req.requestedPrice,
      requestedBy: req.requestedBy || 'Store Partner',
      approvedBy: 'Admin (superadmin@quickbite.com)',
      requestedAt: new Date(req.createdAt).toLocaleString(),
      approvedAt,
      reason: req.reason,
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    showToast(`✓ APPROVED! Live price of "${req.menuItemName}" updated to ₹${req.requestedPrice}.`);
  };

  // Reject Handler
  const handleConfirmReject = async () => {
    if (!rejectDialogReq) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a valid rejection reason for the restaurant.');
      return;
    }

    try {
      await rejectPriceChangeRequest(rejectDialogReq.id);
    } catch (e) {
      console.warn('Supabase reject price request error:', e);
    }

    setRequests(prev =>
      prev.map(r =>
        r.id === rejectDialogReq.id
          ? {
              ...r,
              status: 'REJECTED',
              adminReason: rejectionReason.trim(),
              approvedBy: 'Admin (Current Session)',
            }
          : r
      )
    );

    showToast(`✕ REJECTED! Live price remains ₹${rejectDialogReq.currentPrice}.`);
    setRejectDialogReq(null);
    setRejectionReason('');
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#1A1A2E',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
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

      {/* ─── Page Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>
            🏷️ Menu Price Governance & Approval Hub
          </h1>
          <p style={{ fontSize: 13, color: '#636E8A', margin: '4px 0 0' }}>
            Strict administrative authorization for live menu pricing adjustments across all merchant partners
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: '#FFF7E6',
              border: '1px solid #FDDCA5',
              color: '#C77700',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            ⏳ {pendingCount} Pending Approval
          </span>
        </div>
      </div>

      {/* ─── Top Tabs ─── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E4E1F5', paddingBottom: 10 }}>
        <button
          onClick={() => setActiveTab('REQUESTS')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'REQUESTS' ? '#6C5CE7' : 'transparent',
            color: activeTab === 'REQUESTS' ? '#FFFFFF' : '#636E8A',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Price Change Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'AUDIT' ? '#6C5CE7' : 'transparent',
            color: activeTab === 'AUDIT' ? '#FFFFFF' : '#636E8A',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          📜 Price Change Audit History ({auditLogs.length})
        </button>
      </div>

      {/* ─── TAB 1: REQUESTS ─── */}
      {activeTab === 'REQUESTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'PENDING', label: `Pending (${pendingCount})` },
                { key: 'APPROVED', label: 'Approved' },
                { key: 'REJECTED', label: 'Rejected' },
                { key: 'ALL', label: 'All Requests' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: filterStatus === f.key ? '1px solid #6C5CE7' : '1px solid #E4E1F5',
                    background: filterStatus === f.key ? '#6C5CE7' : '#FFFFFF',
                    color: filterStatus === f.key ? '#FFFFFF' : '#1A1A2E',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 260 }}>
              <input
                type="text"
                placeholder="Search restaurant or dish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid #E4E1F5',
                  fontSize: 13,
                  background: '#FFFFFF',
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 9, fontSize: 13, color: '#999' }}>🔍</span>
            </div>
          </div>

          {/* Requests List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredRequests.map(req => {
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: isPending ? '1.5px solid #FDCB6E' : '1px solid #E4E1F5',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#6C5CE7', textTransform: 'uppercase' }}>
                        🏪 {req.restaurantName} · <span style={{ color: '#888' }}>ID: #{req.restaurantId}</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E', marginTop: 2 }}>
                        {req.menuItemName}
                      </div>
                      <div style={{ fontSize: 12, color: '#636E8A', marginTop: 2 }}>
                        Requested by <strong>{req.requestedBy || 'Store Partner'}</strong> on{' '}
                        {new Date(req.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: isPending ? '#FFF7E6' : isApproved ? '#E8F8F0' : '#FEECEC',
                        color: isPending ? '#C77700' : isApproved ? '#20A464' : '#D64545',
                      }}
                    >
                      {isPending ? '🟡 PENDING ADMIN APPROVAL' : isApproved ? '🟢 APPROVED' : '🔴 REJECTED'}
                    </span>
                  </div>

                  {/* Price Comparison Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      background: '#F8F9FA',
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: '1px solid #EDEDED',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: '#636E8A', fontWeight: 700 }}>CURRENT LIVE PRICE</span>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E' }}>₹{req.currentPrice}</div>
                    </div>

                    <span style={{ fontSize: 24, color: '#6C5CE7' }}>→</span>

                    <div>
                      <span style={{ fontSize: 11, color: '#636E8A', fontWeight: 700 }}>REQUESTED NEW PRICE</span>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#6C5CE7' }}>₹{req.requestedPrice}</div>
                    </div>

                    {req.priceDiff !== undefined && (
                      <div
                        style={{
                          marginLeft: 'auto',
                          background: req.priceDiff > 0 ? '#FAF0EB' : '#E8F8F0',
                          border: `1px solid ${req.priceDiff > 0 ? '#F0D4CB' : '#BBE9D1'}`,
                          padding: '6px 12px',
                          borderRadius: 8,
                          textAlign: 'right',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: req.priceDiff > 0 ? '#D64545' : '#20A464' }}>
                          {req.priceDiff > 0 ? `+₹${req.priceDiff}` : `-₹${Math.abs(req.priceDiff)}`} (
                          {req.priceDiffPercent}%)
                        </div>
                        <div style={{ fontSize: 10, color: '#888' }}>Price Difference</div>
                      </div>
                    )}
                  </div>

                  {/* Reason & Notes */}
                  <div style={{ fontSize: 13, color: '#1A1A2E', lineHeight: 1.5 }}>
                    <strong>Merchant Rationale:</strong> {req.reason}
                    {req.note && (
                      <div style={{ fontSize: 12, color: '#636E8A', marginTop: 3 }}>
                        <strong>Attachment / Note:</strong> {req.note}
                      </div>
                    )}
                  </div>

                  {/* Outcome Note */}
                  {isApproved && (
                    <div style={{ background: '#E8F8F0', padding: '10px 14px', borderRadius: 8, fontSize: 12, color: '#1F7A4D', fontWeight: 700 }}>
                      ✓ Approved by {req.approvedBy} on {req.approvedAt}. Live price updated.
                    </div>
                  )}

                  {isRejected && (
                    <div style={{ background: '#FFF5F5', border: '1px solid #F9BABA', padding: '10px 14px', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#D64545' }}>REJECTION REASON</div>
                      <div style={{ fontSize: 13, color: '#7D1F1F', marginTop: 2 }}>{req.adminReason}</div>
                    </div>
                  )}

                  {/* Action Buttons for Pending */}
                  {isPending && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, borderTop: '1px solid #E4E1F5', paddingTop: 14 }}>
                      <button
                        onClick={() => handleApprove(req)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: 10,
                          border: 'none',
                          background: '#20A464',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        ✓ APPROVE & MAKE PRICE LIVE (₹{req.requestedPrice})
                      </button>

                      <button
                        onClick={() => {
                          setRejectDialogReq(req);
                          setRejectionReason('');
                        }}
                        style={{
                          padding: '12px 24px',
                          borderRadius: 10,
                          border: '1px solid #F9BABA',
                          background: '#FFF5F5',
                          color: '#D64545',
                          fontWeight: 800,
                          fontSize: 13,
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        ✕ REJECT REQUEST
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '60px 20px', textAlign: 'center', border: '1px solid #E4E1F5' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>No price change requests found</div>
                <div style={{ fontSize: 13, color: '#636E8A', marginTop: 4 }}>All restaurant price requests are processed.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: AUDIT LOGS ─── */}
      {activeTab === 'AUDIT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E4E1F5', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E4E1F5' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>
                📜 Immutable Menu Price Change Audit Trail
              </h3>
              <p style={{ fontSize: 12, color: '#636E8A', margin: '2px 0 0' }}>
                Complete verifiable history of every approved price change across the platform
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {auditLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #F0F0F0',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A2E' }}>
                      {log.menuItemName} · <span style={{ color: '#6C5CE7' }}>{log.restaurantName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#636E8A', marginTop: 2 }}>
                      Approved by <strong>{log.approvedBy}</strong> on {log.approvedAt}
                    </div>
                    <div style={{ fontSize: 12, color: '#171717', marginTop: 4 }}>
                      <strong>Rationale:</strong> {log.reason}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 900 }}>
                      <span style={{ color: '#888', textDecoration: 'line-through' }}>₹{log.oldPrice}</span>
                      <span style={{ color: '#6C5CE7' }}>→</span>
                      <span style={{ color: '#20A464' }}>₹{log.newPrice}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#20A464', fontWeight: 800, background: '#E8F8F0', padding: '2px 6px', borderRadius: 4 }}>
                      ✓ AUDITED LIVE CHANGE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECTION REASON MODAL DIALOG ─── */}
      {rejectDialogReq && (
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
          onClick={() => setRejectDialogReq(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 460,
              width: '100%',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#D64545', margin: '0 0 8px' }}>
              Reject Price Change Request
            </h3>
            <p style={{ fontSize: 13, color: '#636E8A', margin: '0 0 16px' }}>
              Rejecting request for <strong>{rejectDialogReq.menuItemName}</strong> (₹{rejectDialogReq.currentPrice} → ₹
              {rejectDialogReq.requestedPrice}). The current live price will remain unchanged.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#1A1A2E', display: 'block', marginBottom: 4 }}>
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this price adjustment was rejected (e.g. exceeds maximum category markup, lack of supporting documentation)..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #E4E1F5',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => setRejectDialogReq(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid #E4E1F5',
                    background: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmReject}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#D64545',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  REJECT REQUEST
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
