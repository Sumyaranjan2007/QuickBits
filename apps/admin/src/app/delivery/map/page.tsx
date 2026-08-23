'use client';
import React, { useState } from 'react';

interface Zone {
  id: string;
  name: string;
  demandLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  surgeMultiplier: string;
  activeOrdersCount: number;
  partnerCount: number;
  recommendedWaitSpot: string;
  distanceFromYou: string;
}

const ZONES: Zone[] = [
  {
    id: 'z-1',
    name: 'Indiranagar (100ft & 12th Main)',
    demandLevel: 'VERY_HIGH',
    surgeMultiplier: '1.4x (+₹40/order)',
    activeOrdersCount: 42,
    partnerCount: 16,
    recommendedWaitSpot: 'Sony World Junction / 100ft Road',
    distanceFromYou: '0.4 km (You are here)',
  },
  {
    id: 'z-2',
    name: 'Koramangala (5th & 7th Block)',
    demandLevel: 'VERY_HIGH',
    surgeMultiplier: '1.3x (+₹30/order)',
    activeOrdersCount: 58,
    partnerCount: 22,
    recommendedWaitSpot: 'Jyoti Nivas College Road',
    distanceFromYou: '3.2 km',
  },
  {
    id: 'z-3',
    name: 'HSR Layout (Sector 1 to 7)',
    demandLevel: 'HIGH',
    surgeMultiplier: '1.2x (+₹20/order)',
    activeOrdersCount: 34,
    partnerCount: 18,
    recommendedWaitSpot: '27th Main Road / BDA Complex',
    distanceFromYou: '5.6 km',
  },
  {
    id: 'z-4',
    name: 'MG Road & Brigade Road',
    demandLevel: 'HIGH',
    surgeMultiplier: '1.2x (+₹20/order)',
    activeOrdersCount: 29,
    partnerCount: 15,
    recommendedWaitSpot: 'Church Street Junction',
    distanceFromYou: '4.1 km',
  },
  {
    id: 'z-5',
    name: 'Whitefield (ITPB & ECC Rd)',
    demandLevel: 'MODERATE',
    surgeMultiplier: '1.0x (Standard)',
    activeOrdersCount: 19,
    partnerCount: 14,
    recommendedWaitSpot: 'Nexus Shantiniketan Mall',
    distanceFromYou: '12.4 km',
  },
  {
    id: 'z-6',
    name: 'Electronic City Phase 1',
    demandLevel: 'LOW',
    surgeMultiplier: '1.0x (Standard)',
    activeOrdersCount: 11,
    partnerCount: 12,
    recommendedWaitSpot: 'Velankani Tech Park',
    distanceFromYou: '16.8 km',
  },
];

export default function DeliveryMapPage() {
  const [selectedZone, setSelectedZone] = useState<Zone>(ZONES[0]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>🗺️ Live Demand Heatmap & Surge Zones</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Position yourself in high-demand zones to receive more orders and surge multiplier payouts
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E8FFF8', border: '1px solid #00B894', padding: '6px 12px', borderRadius: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#00B894' }}>Live GPS Tracking Active</span>
        </div>
      </div>

      {/* ─── Two-Column Layout: Visual Map + Zone Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Heatmap Graphic Canvas */}
        <div style={{
          background: 'linear-gradient(135deg, #0C2340, #1A2A3A)',
          borderRadius: 20,
          padding: '24px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 340,
          boxShadow: '0 8px 30px rgba(12,35,64,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#74B9FF', letterSpacing: 1, textTransform: 'uppercase' }}>
              CURRENT LOCATION
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>
              Indiranagar 100ft Road, Bengaluru
            </div>
            <div style={{ fontSize: 13, color: '#55EFC4', fontWeight: 700, marginTop: 4 }}>
              🔥 You are inside a 1.4x Surge Multiplier Zone (+₹40 per delivery)
            </div>
          </div>

          {/* Grid of Hotspots Simulation */}
          <div style={{
            margin: '20px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {ZONES.slice(0, 6).map((z) => (
              <div
                key={z.id}
                onClick={() => setSelectedZone(z)}
                style={{
                  background: selectedZone.id === z.id ? 'rgba(9, 132, 227, 0.4)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${selectedZone.id === z.id ? '#00CEC9' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12,
                  padding: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: z.demandLevel === 'VERY_HIGH' ? '#FF7675' : z.demandLevel === 'HIGH' ? '#FDCB6E' : '#74B9FF'
                }}>
                  {z.demandLevel.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {z.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 11, color: '#55EFC4', fontWeight: 700, marginTop: 2 }}>
                  {z.surgeMultiplier.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            <span>🔴 Very High (Surge)</span>
            <span>🟡 High Demand</span>
            <span>🔵 Moderate / Normal</span>
          </div>
        </div>

        {/* Selected Zone Details Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '2px solid #0984E3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: selectedZone.demandLevel === 'VERY_HIGH' ? '#FFF5F0' : '#E8F4FD',
                  color: selectedZone.demandLevel === 'VERY_HIGH' ? '#E17055' : '#0984E3'
                }}>
                  {selectedZone.demandLevel.replace('_', ' ')} DEMAND
                </span>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340', marginTop: 6 }}>
                  {selectedZone.name}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#00B894' }}>
                  {selectedZone.surgeMultiplier}
                </div>
                <div style={{ fontSize: 11, color: '#636E72' }}>{selectedZone.distanceFromYou}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFD', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: '#4A6FA5' }}>Active Food Orders in Area:</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0C2340' }}>{selectedZone.activeOrdersCount} Orders</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFD', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: '#4A6FA5' }}>Active Delivery Partners:</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0C2340' }}>{selectedZone.partnerCount} Partners</span>
              </div>

              <div style={{ padding: '10px 12px', background: '#FFF9E6', borderRadius: 10, border: '1px solid #FFEAA7' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#856404' }}>📍 RECOMMENDED WAITING SPOT:</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0C2340', marginTop: 2 }}>{selectedZone.recommendedWaitSpot}</div>
              </div>
            </div>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(selectedZone.name + ' Bengaluru')}`}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 20,
              background: '#0984E3',
              color: '#fff',
              textDecoration: 'none',
              padding: '14px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              textAlign: 'center',
              display: 'block'
            }}
          >
            Navigate to {selectedZone.name.split(' ')[0]} Hotspot ➔
          </a>
        </div>
      </div>

      {/* ─── All City Delivery Zones Table ─── */}
      <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '1px solid #E2ECF5' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 14 }}>
          🏙️ All City Zones Demand Overview
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ZONES.map((zone) => (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 12,
                border: `1.5px solid ${selectedZone.id === zone.id ? '#0984E3' : '#E2ECF5'}`,
                background: selectedZone.id === zone.id ? '#F0F7FF' : '#F8FAFD',
                cursor: 'pointer',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340' }}>{zone.name}</div>
                <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>
                  {zone.distanceFromYou} • Waiting Spot: {zone.recommendedWaitSpot}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 14, color: '#00B894' }}>{zone.surgeMultiplier}</div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: zone.demandLevel === 'VERY_HIGH' ? '#E17055' : '#0984E3'
                }}>
                  {zone.activeOrdersCount} Live Orders ({zone.partnerCount} drivers)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
