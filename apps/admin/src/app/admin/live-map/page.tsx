'use client';
import React, { useState } from 'react';

interface FleetDriver {
  id: string;
  name: string;
  vehicle: string;
  status: 'DELIVERING' | 'IDLE' | 'PICKING_UP';
  location: string;
  battery: string;
  rating: number;
  currentOrder?: string;
}

const FLEET_DRIVERS: FleetDriver[] = [
  { id: 'drv-1', name: 'Amit Verma', vehicle: 'Motorcycle (KA-01-EQ-9876)', status: 'DELIVERING', location: 'Indiranagar 100ft Rd', battery: '88%', rating: 4.85, currentOrder: 'QB-982144' },
  { id: 'drv-2', name: 'Suresh Kumar', vehicle: 'Motorcycle (KA-05-AB-1234)', status: 'PICKING_UP', location: 'Koramangala 5th Block', battery: '74%', rating: 4.70, currentOrder: 'QB-518293' },
  { id: 'drv-3', name: 'Ravi Teja', vehicle: 'Electric Scooter (KA-03-EV-4412)', status: 'IDLE', location: 'HSR Layout Sector 4', battery: '95%', rating: 4.90 },
  { id: 'drv-4', name: 'Mohammed Ali', vehicle: 'Motorcycle (KA-04-TR-8821)', status: 'IDLE', location: 'Lavelle Road, MG Rd', battery: '62%', rating: 4.80 },
];

export default function AdminLiveMapPage() {
  const [drivers, setDrivers] = useState<FleetDriver[]>(FLEET_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<FleetDriver | null>(FLEET_DRIVERS[0]);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">🗺️ Live Delivery Fleet Radar Map</h1>
          <p className="page-subtitle">Real-time GPS tracking of active couriers, restaurants, and active routes</p>
        </div>
      </div>

      {/* ─── Top Fleet Stats Strip ─── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="stat-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#00B894' }}>4 Drivers</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Online in Bangalore</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0984E3' }}>2 Active Deliveries</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>En route right now</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#6C5CE7' }}>2 Available (Idle)</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Ready for instant dispatch</div>
        </div>
        <div className="stat-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>22 mins</div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Avg Zone Delivery Speed</div>
        </div>
      </div>

      {/* ─── Main Map & Driver List Split View ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Radar Map Canvas */}
        <div style={{ background: '#EAF2F8', borderRadius: 20, border: '1.5px solid var(--border)', height: 500, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Simulated Map Grid Lines */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#1A1A2E 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Major Bangalore Arterial Roads */}
          <div style={{ position: 'absolute', width: '90%', height: 8, background: '#CBD5E1', borderRadius: 4, transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', height: '90%', width: 8, background: '#CBD5E1', borderRadius: 4, transform: 'rotate(25deg)' }} />

          {/* Restaurant Pins */}
          <div style={{ position: 'absolute', top: '25%', left: '20%', textAlign: 'center' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🍽️</span>
            <div style={{ background: '#1A1A2E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginTop: 2 }}>Burger &amp; Co.</div>
          </div>

          <div style={{ position: 'absolute', top: '65%', left: '35%', textAlign: 'center' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🍽️</span>
            <div style={{ background: '#1A1A2E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginTop: 2 }}>Spice Symphony</div>
          </div>

          <div style={{ position: 'absolute', top: '35%', right: '25%', textAlign: 'center' }}>
            <span style={{ fontSize: 32, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>🍽️</span>
            <div style={{ background: '#1A1A2E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, marginTop: 2 }}>Pizzeria Bella</div>
          </div>

          {/* Active Drivers Pins */}
          <div
            onClick={() => setSelectedDriver(FLEET_DRIVERS[0])}
            style={{ position: 'absolute', top: '40%', left: '42%', cursor: 'pointer', textAlign: 'center', transition: '0.2s', transform: selectedDriver?.id === 'drv-1' ? 'scale(1.2)' : 'scale(1)' }}
          >
            <span style={{ fontSize: 36, filter: 'drop-shadow(0 6px 12px rgba(108, 92, 231, 0.4))' }}>🛵</span>
            <div style={{ background: '#6C5CE7', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>Amit Verma</div>
          </div>

          <div
            onClick={() => setSelectedDriver(FLEET_DRIVERS[1])}
            style={{ position: 'absolute', top: '68%', left: '48%', cursor: 'pointer', textAlign: 'center', transition: '0.2s', transform: selectedDriver?.id === 'drv-2' ? 'scale(1.2)' : 'scale(1)' }}
          >
            <span style={{ fontSize: 36, filter: 'drop-shadow(0 6px 12px rgba(9, 132, 227, 0.4))' }}>🛵</span>
            <div style={{ background: '#0984E3', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>Suresh Kumar</div>
          </div>

          <div
            onClick={() => setSelectedDriver(FLEET_DRIVERS[2])}
            style={{ position: 'absolute', top: '78%', right: '30%', cursor: 'pointer', textAlign: 'center', transition: '0.2s', transform: selectedDriver?.id === 'drv-3' ? 'scale(1.2)' : 'scale(1)' }}
          >
            <span style={{ fontSize: 30, opacity: 0.85 }}>🛵</span>
            <div style={{ background: '#00B894', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>Ravi (Idle)</div>
          </div>

          {/* Map Controls */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
            📍 Bangalore Central Hub • Zoom: 14x
          </div>
        </div>

        {/* Driver Fleet Inspector Drawer */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: 500 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900 }}>Active Couriers ({drivers.length})</h3>

          {drivers.map(drv => {
            const isSelected = selectedDriver?.id === drv.id;
            return (
              <div
                key={drv.id}
                onClick={() => setSelectedDriver(drv)}
                style={{
                  padding: 14, borderRadius: 12, border: '1.5px solid var(--border)',
                  cursor: 'pointer', background: isSelected ? 'var(--primary-light)' : '#fff',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                  transition: '0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{drv.name}</div>
                  <span className={`badge ${drv.status === 'DELIVERING' ? 'badge-primary' : drv.status === 'PICKING_UP' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: 9 }}>
                    {drv.status}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{drv.vehicle}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>📍 {drv.location}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 11, fontWeight: 700 }}>
                  <span>⭐ {drv.rating} • 🔋 {drv.battery}</span>
                  {drv.currentOrder && (
                    <span style={{ color: 'var(--primary)' }}>Order #{drv.currentOrder}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
