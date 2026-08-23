'use client';
import React, { useState } from 'react';

interface AuditLog {
  id: string;
  admin: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  ip: string;
  timestamp: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG-8812', admin: 'admin@quickbite.com', role: 'SUPER_ADMIN', action: 'COMMISSION_UPDATE', entity: 'Restaurant #rest-1', details: 'Changed commission from 18% to 20%', ip: '127.0.0.1', timestamp: '22 Aug 2026, 18:14' },
  { id: 'LOG-8811', admin: 'admin@quickbite.com', role: 'SUPER_ADMIN', action: 'RESTAURANT_APPROVE', entity: 'Restaurant #rest-3', details: 'Approved Pizzeria Bella onboarding documentation', ip: '127.0.0.1', timestamp: '22 Aug 2026, 17:30' },
  { id: 'LOG-8810', admin: 'ops_agent@quickbite.com', role: 'OPERATIONS_ADMIN', action: 'DRIVER_DISPATCH_REASSIGN', entity: 'Order #QB-982144', details: 'Reassigned courier to Amit Verma (KA-01-EQ-9876)', ip: '127.0.0.1', timestamp: '22 Aug 2026, 16:45' },
  { id: 'LOG-8809', admin: 'finance@quickbite.com', role: 'FINANCE_ADMIN', action: 'SETTLEMENT_RELEASE', entity: 'Settlement #SET-102', details: 'Released ₹18,876 payout batch to Spice Symphony', ip: '127.0.0.1', timestamp: '22 Aug 2026, 15:10' },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">📜 Security, RBAC &amp; Audit Trail</h1>
          <p className="page-subtitle">Immutable security ledger recording administrative interventions and permission events</p>
        </div>
      </div>

      {/* ─── RBAC Role Matrix Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { role: 'SUPER_ADMIN', count: 1, desc: 'Unrestricted full access across all platform modules', badge: 'badge-primary' },
          { role: 'OPERATIONS_ADMIN', count: 2, desc: 'Live dispatch, driver reallocation, merchant approvals', badge: 'badge-info' },
          { role: 'FINANCE_ADMIN', count: 1, desc: 'Commissions, merchant settlements, driver payouts', badge: 'badge-success' },
          { role: 'CUSTOMER_SUPPORT', count: 3, desc: 'Disputes, order tracking assistance, customer tickets', badge: 'badge-neutral' },
        ].map((r, i) => (
          <div key={i} style={{ background: '#fff', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className={`badge ${r.badge}`} style={{ fontSize: 10 }}>{r.role}</span>
              <span style={{ fontWeight: 800, fontSize: 12 }}>{r.count} Active</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.4 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* ─── Audit Trail Table ─── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">System Audit Log Trail</span>
          <span className="badge badge-primary">Append-Only Ledger</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Administrator</th>
              <th>Action Category</th>
              <th>Target Entity</th>
              <th>Operational Details</th>
              <th>IP &amp; Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{l.id}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{l.admin}</div>
                  <span className="badge badge-neutral" style={{ fontSize: 9 }}>{l.role}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 800, fontSize: 12, color: '#1A1A2E' }}>{l.action}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{l.entity}</td>
                <td style={{ fontSize: 13, color: 'var(--text-sec)', maxWidth: 280 }}>{l.details}</td>
                <td className="text-sm text-muted">
                  <div>{l.timestamp}</div>
                  <div style={{ fontSize: 10 }}>IP: {l.ip}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
