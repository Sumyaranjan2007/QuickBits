'use client';
import React, { useState } from 'react';

interface RiskAlert {
  id: string;
  entityType: 'CUSTOMER' | 'RESTAURANT' | 'DRIVER';
  name: string;
  identifier: string;
  flag: string;
  score: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING_REVIEW' | 'RESTRICTED' | 'DISMISSED';
}

const INITIAL_ALERTS: RiskAlert[] = [
  { id: 'RSK-101', entityType: 'CUSTOMER', name: 'Vikram Mehta', identifier: 'vikram.m@example.com', flag: 'High cancellation frequency (>40% of orders cancelled)', score: 72, level: 'MEDIUM', status: 'PENDING_REVIEW' },
  { id: 'RSK-102', entityType: 'CUSTOMER', name: 'Anonymous User', identifier: '+91 98765 00000', flag: 'Multiple promo coupon attempts from single device ID', score: 85, level: 'HIGH', status: 'PENDING_REVIEW' },
  { id: 'RSK-103', entityType: 'DRIVER', name: 'Ravi Teja', identifier: 'KA-03-EV-4412', flag: 'GPS telemetry mismatch during pickup confirmation', score: 45, level: 'LOW', status: 'DISMISSED' },
];

export default function AdminRiskPage() {
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_ALERTS);

  const handleAction = (id: string, action: 'RESTRICT' | 'DISMISS') => {
    setAlerts(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: action === 'RESTRICT' ? 'RESTRICTED' : 'DISMISSED' };
      }
      return a;
    }));
    alert(`Risk Alert #${id} updated: ${action === 'RESTRICT' ? 'Account coupon/order restrictions enabled' : 'Flag dismissed after human review'}.`);
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🛡️ Fraud Prevention &amp; Risk Shield</h1>
          <p className="page-subtitle">Behavioral anomaly detection, coupon abuse prevention, and suspicious telemetry</p>
        </div>
      </div>

      {/* ─── Risk KPI Cards ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{alerts.filter(a => a.status === 'PENDING_REVIEW').length}</div>
          <div className="stat-label">Pending Risk Alerts</div>
          <div className="stat-change down">Human review required</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-value">{alerts.filter(a => a.status === 'RESTRICTED').length}</div>
          <div className="stat-label">Restricted Accounts</div>
          <div className="stat-change down">Coupon block active</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-value">99.4%</div>
          <div className="stat-label">Legitimate Order Trust Index</div>
          <div className="stat-change up">↑ Zero credit card chargebacks</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-value">Active</div>
          <div className="stat-label">Anti-Sybil Device Fingerprint</div>
          <div className="stat-change up">Live AI heuristics</div>
        </div>
      </div>

      {/* ─── Risk Alerts Table ─── */}
      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Flagged Behavioral Risk Events</span>
          <span className="badge badge-warning">Review Pipeline</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Entity</th>
              <th>Account Details</th>
              <th>Risk Flag &amp; Telemetry</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Review Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 800 }}>{a.id}</td>
                <td>
                  <span className={`badge ${a.entityType === 'CUSTOMER' ? 'badge-primary' : a.entityType === 'DRIVER' ? 'badge-info' : 'badge-neutral'}`}>
                    {a.entityType}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{a.name}</div>
                  <div className="text-sm text-muted">{a.identifier}</div>
                </td>
                <td style={{ fontSize: 13, maxWidth: 280 }}>{a.flag}</td>
                <td>
                  <span style={{ fontWeight: 900, color: a.level === 'HIGH' ? '#DC2626' : a.level === 'MEDIUM' ? '#F39C12' : '#00B894' }}>
                    {a.score} / 100 ({a.level})
                  </span>
                </td>
                <td>
                  <span className={`badge ${a.status === 'RESTRICTED' ? 'badge-error' : a.status === 'DISMISSED' ? 'badge-success' : 'badge-warning'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {a.status === 'PENDING_REVIEW' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleAction(a.id, 'RESTRICT')}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                      >
                        Restrict
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleAction(a.id, 'DISMISS')}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
