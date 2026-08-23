'use client';
import React, { useState } from 'react';

export default function DeliverySafetyPage() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [showAccidentModal, setShowAccidentModal] = useState(false);
  const [accidentForm, setAccidentForm] = useState({
    isSafe: 'YES',
    needsAmbulance: false,
    location: 'Near Domlur Sony Signal Junction, Bengaluru',
    description: '',
  });

  const handleSosClick = () => {
    if (confirm('Are you in immediate emergency? This will share your live GPS location with Police & QuickBite 24x7 Safety Command.')) {
      setSosTriggered(true);
    }
  };

  const handleAccidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Accident & Emergency ticket submitted. QuickBite Roadside Assistance team has been dispatched to your location.');
    setShowAccidentModal(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🦺 Partner Safety Center & Emergency SOS</h1>
        <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
          24x7 Emergency assistance, accident roadside support, and live safety incident reporting
        </p>
      </div>

      {/* ─── Master SOS Emergency Button Card ─── */}
      <div style={{
        background: sosTriggered ? '#D63031' : 'linear-gradient(135deg, #FF7675 0%, #D63031 100%)',
        borderRadius: 22,
        padding: '28px',
        color: '#fff',
        marginBottom: 24,
        boxShadow: '0 10px 30px rgba(214, 48, 49, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, animation: sosTriggered ? 'pulse 1s infinite' : 'none' }}>🚨</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8 }}>
          {sosTriggered ? 'SOS ACTIVE — HELP DISPATCHED' : '24x7 EMERGENCY SOS BUTTON'}
        </div>
        <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 540, margin: '8px auto 20px' }}>
          {sosTriggered
            ? 'Your live GPS coordinates have been sent to our Emergency Response Team and your emergency contact (Suman Kumar).'
            : 'Press in case of medical emergency, assault, severe road accident, or personal danger during delivery duty.'}
        </p>

        {!sosTriggered ? (
          <button
            onClick={handleSosClick}
            style={{
              background: '#fff',
              color: '#D63031',
              border: 'none',
              borderRadius: 14,
              padding: '16px 36px',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            }}
          >
            TRIGGER EMERGENCY SOS
          </button>
        ) : (
          <button
            onClick={() => setSosTriggered(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Cancel SOS (I am Safe Now)
          </button>
        )}
      </div>

      {/* ─── Quick Helplines ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { title: 'Police Control Room', number: '112 / 100', icon: '👮' },
          { title: 'Ambulance Emergency', number: '108 / 102', icon: '🚑' },
          { title: 'QuickBite Safety Helpline', number: '1800-889-1099', icon: '📞' },
          { title: 'Emergency Contact', number: '+91 98765 44332', icon: '👤' },
        ].map((line, i) => (
          <a
            key={i}
            href={`tel:${line.number.split(' ')[0]}`}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '16px',
              border: '1px solid #E2ECF5',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            <span style={{ fontSize: 24 }}>{line.icon}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A6FA5' }}>{line.title}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0C2340', marginTop: 2 }}>{line.number}</div>
            </div>
          </a>
        ))}
      </div>

      {/* ─── Severe Weather & Hazard Advisory ─── */}
      <div style={{ background: '#FFF9E6', borderRadius: 18, padding: '20px', border: '1.5px solid #FFEAA7', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>🌧️</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: '#856404' }}>
              Heavy Rain & Wet Roads Advisory (Bengaluru Central & East)
            </div>
            <div style={{ fontSize: 13, color: '#636E72', marginTop: 4 }}>
              Speed limit advisory: <strong>Max 35 km/h</strong>. Rain surge of +₹20/order is active. Partner safety is priority over delivery time.
            </div>
          </div>
        </div>
      </div>

      {/* ─── Incident Reporting Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 24 }}>🛵💥</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginTop: 8 }}>
            Report Road Accident
          </div>
          <p style={{ fontSize: 12, color: '#636E72', marginTop: 4, lineHeight: 1.5 }}>
            File an instant roadside incident report to claim ₹5,00,000 accidental medical insurance coverage and vehicle breakdown towing.
          </p>
          <button
            onClick={() => setShowAccidentModal(true)}
            style={{
              marginTop: 14,
              background: '#0984E3',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            File Accident Report ➔
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontSize: 24 }}>🛑</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginTop: 8 }}>
            Report Unsafe Delivery Location
          </div>
          <p style={{ fontSize: 12, color: '#636E72', marginTop: 4, lineHeight: 1.5 }}>
            Report poorly lit alleys, aggressive stray dogs, or customer/merchant misconduct for immediate safety review.
          </p>
          <button
            onClick={() => alert('Hazard location reported. Area marked for security check.')}
            style={{
              marginTop: 14,
              background: '#F8FAFD',
              color: '#0C2340',
              border: '1px solid #E2ECF5',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Report Hazard / Misconduct ➔
          </button>
        </div>
      </div>

      {/* ─── Accident Report Modal ─── */}
      {showAccidentModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(12,35,64,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <form onSubmit={handleAccidentSubmit} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340' }}>🛵 Road Accident Assistance</div>
              <button
                type="button"
                onClick={() => setShowAccidentModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#636E72' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Are you physically safe?</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['YES', 'NO (Need Medical Help)'].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setAccidentForm({ ...accidentForm, isSafe: opt })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        border: `1.5px solid ${accidentForm.isSafe === opt ? '#D63031' : '#E2ECF5'}`,
                        background: accidentForm.isSafe === opt ? '#FFF5F0' : '#F8FAFD',
                        color: accidentForm.isSafe === opt ? '#D63031' : '#0C2340',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Current GPS Location</label>
                <input
                  type="text"
                  value={accidentForm.location}
                  onChange={(e) => setAccidentForm({ ...accidentForm, location: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Incident Description</label>
                <textarea
                  placeholder="Describe what happened, vehicle condition, active order status..."
                  value={accidentForm.description}
                  onChange={(e) => setAccidentForm({ ...accidentForm, description: e.target.value })}
                  style={{ width: '100%', height: 70, padding: '10px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 12, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAccidentModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #E2ECF5', background: '#fff', color: '#636E72', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#D63031', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Dispatch Roadside Help
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
