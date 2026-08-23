'use client';
import React, { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
  lastAction: string;
  joinedDate: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  RESTAURANT_OWNER: ['All permissions (full access)'],
  RESTAURANT_MANAGER: ['orders.view', 'orders.update', 'menu.*', 'analytics.view', 'staff.view', 'settings.view'],
  KITCHEN_STAFF: ['orders.view', 'orders.update', 'kitchen.view'],
  CASHIER: ['orders.view', 'payments.view'],
  ORDER_MANAGER: ['orders.*', 'delivery.view'],
  VIEW_ONLY: ['orders.view', 'menu.view'],
};

const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'Vikram Singhania', email: 'restaurant@quickbite.com', phone: '+91 98765 43210', role: 'RESTAURANT_OWNER', status: 'ACTIVE', lastLogin: '22 Aug, 18:45', lastAction: 'Updated commission', joinedDate: '01 Jan 2024' },
  { id: 's2', name: 'Deepa Nair', email: 'manager@quickbite.com', phone: '+91 91234 56789', role: 'RESTAURANT_MANAGER', status: 'ACTIVE', lastLogin: '22 Aug, 16:30', lastAction: 'Accepted 3 orders', joinedDate: '15 Mar 2024' },
  { id: 's3', name: 'Ramu Chef', email: 'kitchen@quickbite.com', phone: '+91 99111 22333', role: 'KITCHEN_STAFF', status: 'ACTIVE', lastLogin: '22 Aug, 19:00', lastAction: 'Marked order READY', joinedDate: '02 Jun 2024' },
  { id: 's4', name: 'Suresh Cashier', email: 'cashier@quickbite.com', phone: '+91 88444 55666', role: 'CASHIER', status: 'SUSPENDED', lastLogin: '20 Aug, 10:12', lastAction: 'Viewed payments', joinedDate: '01 Aug 2024' },
];

const ROLE_COLORS: Record<string, string> = {
  RESTAURANT_OWNER: '#6C5CE7',
  RESTAURANT_MANAGER: '#0984E3',
  KITCHEN_STAFF: '#E17055',
  CASHIER: '#00B894',
  ORDER_MANAGER: '#FDCB6E',
  VIEW_ONLY: '#B2BEC3',
};

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'KITCHEN_STAFF' };

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const handleAddStaff = async () => {
    if (!form.name || !form.email) { alert('Name and email are required'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const newMember: StaffMember = {
      id: `s-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      status: 'ACTIVE',
      lastLogin: 'Never',
      lastAction: 'Account created',
      joinedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setStaff(prev => [...prev, newMember]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaving(false);
    alert(`Invitation sent to ${form.email} with login credentials.`);
  };

  const toggleStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : s));
    if (selectedStaff?.id === id) {
      setSelectedStaff(prev => prev ? { ...prev, status: prev.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : null);
    }
  };

  const deleteStaff = (id: string) => {
    if (confirm('Remove this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== id));
      if (selectedStaff?.id === id) setSelectedStaff(null);
    }
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">👥 Staff Management</h1>
          <p className="page-subtitle">{staff.filter(s => s.status === 'ACTIVE').length} active team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ borderRadius: 10 }}>
          + Add Staff Member
        </button>
      </div>

      {/* ─── Role Permission Reference ─── */}
      <div style={{ background: 'var(--surface-hover)', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>🔐 Role Permission Matrix</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
            <div key={role} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: `2px solid ${ROLE_COLORS[role]}20`, minWidth: 160 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: ROLE_COLORS[role], marginBottom: 4 }}>{role.replace('_', ' ')}</div>
              {perms.slice(0, 2).map(p => <div key={p} style={{ fontSize: 10, color: 'var(--text-muted)' }}>• {p}</div>)}
              {perms.length > 2 && <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>+{perms.length - 2} more</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Staff Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {staff.map(member => (
          <div key={member.id} style={{
            background: '#fff', borderRadius: 16, border: `2px solid ${member.status === 'ACTIVE' ? 'var(--border)' : '#FFD6D1'}`,
            padding: 20, boxShadow: 'var(--shadow-sm)', opacity: member.status === 'ACTIVE' ? 1 : 0.75,
            cursor: 'pointer', transition: '0.2s',
          }}
          onClick={() => setSelectedStaff(member)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: ROLE_COLORS[member.role] + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 900, color: ROLE_COLORS[member.role],
              }}>
                {member.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{member.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.email}</div>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4,
                  background: ROLE_COLORS[member.role] + '18', color: ROLE_COLORS[member.role],
                }}>
                  {member.role.replace('RESTAURANT_', '').replace('_', ' ')}
                </span>
              </div>
              <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`} style={{ flexShrink: 0 }}>
                {member.status}
              </span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14 }}>
              <div>🕐 Last Login: {member.lastLogin}</div>
              <div>⚡ Last Action: {member.lastAction}</div>
              <div>📅 Joined: {member.joinedDate}</div>
            </div>

            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
              <button
                className={`btn btn-sm ${member.status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => toggleStatus(member.id)}
                style={{ flex: 1, fontSize: 11 }}
                disabled={member.role === 'RESTAURANT_OWNER'}
              >
                {member.status === 'ACTIVE' ? '🚫 Suspend' : '✓ Reinstate'}
              </button>
              {member.role !== 'RESTAURANT_OWNER' && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteStaff(member.id)}
                  style={{ fontSize: 11 }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Staff Detail Side Panel ─── */}
      {selectedStaff && (
        <div className="modal-backdrop" onClick={() => setSelectedStaff(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900 }}>Staff Details</h3>
              <button onClick={() => setSelectedStaff(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: ROLE_COLORS[selectedStaff.role] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: ROLE_COLORS[selectedStaff.role] }}>
                {selectedStaff.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{selectedStaff.name}</div>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 5, background: ROLE_COLORS[selectedStaff.role] + '18', color: ROLE_COLORS[selectedStaff.role] }}>
                  {selectedStaff.role.replace('RESTAURANT_', '')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
              <div><strong>Email:</strong> {selectedStaff.email}</div>
              <div><strong>Phone:</strong> {selectedStaff.phone}</div>
              <div><strong>Status:</strong> <span className={`badge ${selectedStaff.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>{selectedStaff.status}</span></div>
              <div><strong>Joined:</strong> {selectedStaff.joinedDate}</div>
              <div><strong>Last Login:</strong> {selectedStaff.lastLogin}</div>
            </div>
            <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🔐 Permissions:</div>
              {(ROLE_PERMISSIONS[selectedStaff.role] || []).map(p => (
                <div key={p} style={{ fontSize: 12, color: 'var(--text-sec)', padding: '2px 0' }}>• {p}</div>
              ))}
            </div>
            {selectedStaff.role !== 'RESTAURANT_OWNER' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={`btn ${selectedStaff.status === 'ACTIVE' ? 'btn-outline' : 'btn-primary'}`} style={{ flex: 1 }} onClick={() => toggleStatus(selectedStaff.id)}>
                  {selectedStaff.status === 'ACTIVE' ? '🚫 Suspend Account' : '✓ Reinstate'}
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => deleteStaff(selectedStaff.id)}>🗑️ Remove</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Add Staff Modal ─── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>+ Add Staff Member</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Chef Ramesh" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Email Address * (Login credential)</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="staff@yourrestaurant.com" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Phone Number</label>
                <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 XXXXX" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Role & Permissions</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {Object.keys(ROLE_PERMISSIONS).filter(r => r !== 'RESTAURANT_OWNER').map(r => (
                    <option key={r} value={r}>{r.replace('RESTAURANT_', '').replace('_', ' ')}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Permissions: {ROLE_PERMISSIONS[form.role]?.slice(0, 2).join(', ')}{ROLE_PERMISSIONS[form.role]?.length > 2 ? '...' : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddStaff} disabled={saving}>
                {saving ? 'Sending invite...' : '📧 Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
