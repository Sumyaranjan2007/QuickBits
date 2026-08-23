'use client';
import React, { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
  hasBreak: boolean;
}

interface Holiday {
  id: string;
  date: string;
  reason: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((_, i) => ({
  isOpen: i < 6,
  openTime: '11:00',
  closeTime: '23:00',
  breakStart: '15:00',
  breakEnd: '18:00',
  hasBreak: false,
}));

const DEMO_HOLIDAYS: Holiday[] = [
  { id: 'h1', date: '2026-10-02', reason: 'Gandhi Jayanti — National Holiday' },
  { id: 'h2', date: '2026-10-24', reason: 'Diwali Closure (Full Day)' },
];

export default function RestaurantHoursPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [holidays, setHolidays] = useState<Holiday[]>(DEMO_HOLIDAYS);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' });
  const [closureMode, setClosureMode] = useState<string | null>(null);

  const updateDay = (index: number, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setSaving(false);
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.reason) { alert('Date and reason are required'); return; }
    setHolidays(prev => [...prev, { id: `h-${Date.now()}`, ...newHoliday }]);
    setNewHoliday({ date: '', reason: '' });
    setShowHolidayModal(false);
  };

  const removeHoliday = (id: string) => setHolidays(prev => prev.filter(h => h.id !== id));

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🕐 Operating Hours & Holidays</h1>
          <p className="page-subtitle">Set your weekly schedule, breaks, temporary closures, and planned holidays</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saveSuccess && <span style={{ fontSize: 13, fontWeight: 700, color: '#00B894' }}>✓ Saved!</span>}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: 10 }}>
            {saving ? '⏳ Saving...' : '💾 Save Schedule'}
          </button>
        </div>
      </div>

      {/* ─── Temporary Closure ─── */}
      <div style={{ background: '#FFF8E8', borderRadius: 16, border: '1.5px solid #FDCB6E', padding: 20, marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: '#856404' }}>⚡ Temporary Closure / Pause Orders</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Pause 15 min', value: '15min' },
            { label: 'Pause 30 min', value: '30min' },
            { label: 'Pause 1 hour', value: '1hour' },
            { label: 'Close Today', value: 'today' },
            { label: 'Manual Reopen', value: 'manual' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setClosureMode(opt.value); alert(`Restaurant paused: ${opt.label}. Tap again to reopen.`); }}
              style={{
                padding: '8px 14px', borderRadius: 8, border: `2px solid ${closureMode === opt.value ? '#E17055' : '#FDCB6E'}`,
                background: closureMode === opt.value ? '#E17055' : '#fff', color: closureMode === opt.value ? '#fff' : '#856404',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: '0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Weekly Schedule ─── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: 16 }}>📅 Weekly Schedule</div>
        <div>
          {DAYS.map((day, i) => {
            const d = schedule[i];
            return (
              <div key={day} style={{
                display: 'grid', gridTemplateColumns: '140px 60px 1fr', gap: 16, alignItems: 'center',
                padding: '14px 20px', borderBottom: i < 6 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? '#fff' : 'var(--surface-hover)',
              }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{day}</div>

                {/* Open/Closed toggle */}
                <button
                  onClick={() => updateDay(i, 'isOpen', !d.isOpen)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11,
                    background: d.isOpen ? '#00B894' : '#E17055', color: '#fff',
                  }}
                >
                  {d.isOpen ? 'OPEN' : 'CLOSED'}
                </button>

                {/* Times */}
                {d.isOpen ? (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600 }}>Opens:</span>
                      <input type="time" value={d.openTime} onChange={e => updateDay(i, 'openTime', e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600 }}>Closes:</span>
                      <input type="time" value={d.closeTime} onChange={e => updateDay(i, 'closeTime', e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={d.hasBreak} onChange={e => updateDay(i, 'hasBreak', e.target.checked)} />
                      Break
                    </label>
                    {d.hasBreak && (
                      <>
                        <input type="time" value={d.breakStart} onChange={e => updateDay(i, 'breakStart', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>to</span>
                        <input type="time" value={d.breakEnd} onChange={e => updateDay(i, 'breakEnd', e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }} />
                      </>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Restaurant will be closed this day</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Holiday Manager ─── */}
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>🎉 Holidays & Closures</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowHolidayModal(true)} style={{ borderRadius: 8 }}>
            + Add Holiday
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {holidays.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-title">No holidays scheduled</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {holidays.map(h => (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-hover)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ background: '#E8FFF8', padding: '8px 12px', borderRadius: 8, fontWeight: 800, fontSize: 14, color: '#00B894' }}>
                      {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{h.reason}</span>
                  </div>
                  <button onClick={() => removeHoliday(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E17055', fontSize: 14 }}>✕ Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Holiday Add Modal */}
      {showHolidayModal && (
        <div className="modal-backdrop" onClick={() => setShowHolidayModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 900, marginBottom: 16 }}>🎉 Schedule Holiday / Closure</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Date *</label>
                <input type="date" className="input" value={newHoliday.date} onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sec)', display: 'block', marginBottom: 6 }}>Reason / Note *</label>
                <input className="input" value={newHoliday.reason} onChange={e => setNewHoliday(p => ({ ...p, reason: e.target.value }))} placeholder="e.g. Diwali, Maintenance, Owner Vacation" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowHolidayModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addHoliday}>Schedule Holiday</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
