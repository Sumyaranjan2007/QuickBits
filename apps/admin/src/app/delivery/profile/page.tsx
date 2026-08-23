'use client';
import React, { useState } from 'react';

interface DocumentItem {
  id: string;
  name: string;
  docNumber: string;
  expiryDate: string;
  status: 'VERIFIED' | 'PENDING' | 'EXPIRING_SOON';
  icon: string;
}

const DOCUMENTS: DocumentItem[] = [
  { id: 'doc-1', name: 'Driving Licence (DL)', docNumber: 'KA-01-2021-0098214', expiryDate: '14 Oct 2031', status: 'VERIFIED', icon: '🪪' },
  { id: 'doc-2', name: 'Vehicle Registration (RC)', docNumber: 'KA-01-EQ-9876', expiryDate: '28 Aug 2035', status: 'VERIFIED', icon: '🛵' },
  { id: 'doc-3', name: 'PAN Card', docNumber: 'ABCDE1234F', expiryDate: 'Lifetime', status: 'VERIFIED', icon: '📑' },
  { id: 'doc-4', name: 'Vehicle Insurance Policy', docNumber: 'POL-992184019', expiryDate: '15 Sep 2026', status: 'EXPIRING_SOON', icon: '🛡️' },
  { id: 'doc-5', name: 'Aadhaar Card (KYC)', docNumber: '•••• •••• 8812', expiryDate: 'Verified', status: 'VERIFIED', icon: '🆔' },
];

export default function DeliveryProfilePage() {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'VEHICLE' | 'DOCUMENTS' | 'BANK'>('PERSONAL');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [personal, setPersonal] = useState({
    name: 'Ramesh Kumar',
    email: 'ramesh.delivery@quickbite.com',
    phone: '+91 98450 99881',
    dob: '14/08/1996',
    address: 'No 42, 3rd Cross, Old Airport Road, Kodihalli, Bengaluru',
    city: 'Bengaluru',
    pincode: '560008',
    emergencyContact: 'Suman Kumar (Brother) — +91 98765 44332',
  });

  const [vehicle, setVehicle] = useState({
    type: 'Electric Scooter (EV)',
    model: 'Ather 450X Gen 3',
    registrationNumber: 'KA-01-EQ-9876',
    batteryRange: '105 km / charge',
    fuelType: 'ELECTRIC',
  });

  const [bank, setBank] = useState({
    accountHolder: 'Ramesh Kumar',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '•••• •••• 4912',
    ifsc: 'HDFC0001234',
    payoutFrequency: 'Weekly (Every Monday)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0C2340' }}>👤 Partner Profile & Verification</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
            Manage KYC credentials, vehicle registration, compliance documents, and bank payout details
          </p>
        </div>

        {saveSuccess && (
          <div style={{ background: '#E8FFF8', color: '#00B894', border: '1px solid #00B894', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
            ✓ Profile Changes Saved!
          </div>
        )}
      </div>

      {/* ─── Profile Header Badge Card ─── */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '24px',
        border: '1px solid #E2ECF5',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 900,
          }}>
            RK
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0C2340' }}>{personal.name}</div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#E8FFF8', color: '#00B894' }}>
                ✓ VERIFIED PARTNER
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#4A6FA5', marginTop: 2 }}>
              Partner ID: <strong>DLV-882194</strong> • Joined March 2024 • Indiranagar Fleet
            </div>
            <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>
              ⭐ 4.89 Rating • 418 Total Deliveries Completed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: '#F8FAFD', padding: '10px 16px', borderRadius: 12, border: '1px solid #E2ECF5', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#4A6FA5', fontWeight: 700 }}>VEHICLE</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#0C2340', marginTop: 2 }}>{vehicle.registrationNumber}</div>
          </div>

          <div style={{ background: '#F8FAFD', padding: '10px 16px', borderRadius: 12, border: '1px solid #E2ECF5', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#4A6FA5', fontWeight: 700 }}>KYC STATUS</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#00B894', marginTop: 2 }}>100% Approved</div>
          </div>
        </div>
      </div>

      {/* ─── Tabs Switcher ─── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'PERSONAL', label: '👤 Personal Info' },
          { key: 'VEHICLE', label: '🛵 Vehicle Details' },
          { key: 'DOCUMENTS', label: '📑 KYC Documents (5)' },
          { key: 'BANK', label: '🏦 Bank & Settlements' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === t.key ? '#0C2340' : '#fff',
              color: activeTab === t.key ? '#fff' : '#636E72',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Personal Info Form ─── */}
      {activeTab === 'PERSONAL' && (
        <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
            Personal & Emergency Contact Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Full Legal Name</label>
              <input
                type="text"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Phone Number (OTP Verification)</label>
              <input
                type="text"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Date of Birth</label>
              <input
                type="text"
                value={personal.dob}
                onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Permanent Residential Address</label>
              <input
                type="text"
                value={personal.address}
                onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#E17055', display: 'block', marginBottom: 6 }}>🚨 SOS Emergency Contact (Name, Relation & Phone)</label>
              <input
                type="text"
                value={personal.emergencyContact}
                onChange={(e) => setPersonal({ ...personal, emergencyContact: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #FAB1A0', background: '#FFF5F0', fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: '#0984E3',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Save Personal Details
          </button>
        </form>
      )}

      {/* ─── Tab 2: Vehicle Info Form ─── */}
      {activeTab === 'VEHICLE' && (
        <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
            Registered Delivery Vehicle
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Vehicle Category</label>
              <select
                value={vehicle.type}
                onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              >
                <option value="Electric Scooter (EV)">Electric Scooter (EV)</option>
                <option value="Petrol Motorcycle / Bike">Petrol Motorcycle / Bike</option>
                <option value="Bicycle / E-Bike">Bicycle / E-Bike</option>
                <option value="Commercial 3-Wheeler">Commercial 3-Wheeler</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Make & Model</label>
              <input
                type="text"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Vehicle Registration Plate (RC Number)</label>
              <input
                type="text"
                value={vehicle.registrationNumber}
                onChange={(e) => setVehicle({ ...vehicle, registrationNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Fuel / Battery Range</label>
              <input
                type="text"
                value={vehicle.batteryRange}
                onChange={(e) => setVehicle({ ...vehicle, batteryRange: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: '#0984E3',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Update Vehicle Information
          </button>
        </form>
      )}

      {/* ─── Tab 3: Documents Compliance ─── */}
      {activeTab === 'DOCUMENTS' && (
        <div style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #E2ECF5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340' }}>
                Compliance & KYC Document Vault
              </div>
              <div style={{ fontSize: 12, color: '#4A6FA5', marginTop: 2 }}>
                All partners must maintain valid driving license and insurance policies
              </div>
            </div>

            <button
              onClick={() => alert('Document upload modal opened. Please select file.')}
              style={{
                background: '#E8F4FD',
                color: '#0984E3',
                border: '1px solid #0984E3',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              + Upload Document
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DOCUMENTS.map((doc) => (
              <div key={doc.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#F8FAFD',
                borderRadius: 12,
                border: `1.5px solid ${doc.status === 'EXPIRING_SOON' ? '#FAB1A0' : '#E2ECF5'}`,
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>{doc.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0C2340' }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: '#636E72', marginTop: 2 }}>
                      No: <strong>{doc.docNumber}</strong> • Valid Until: {doc.expiryDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: doc.status === 'VERIFIED' ? '#E8FFF8' : '#FFF5F0',
                    color: doc.status === 'VERIFIED' ? '#00B894' : '#E17055',
                    border: `1px solid ${doc.status === 'VERIFIED' ? '#A3E4D7' : '#FAB1A0'}`
                  }}>
                    {doc.status === 'EXPIRING_SOON' ? '⚠️ EXPIRES IN 24 DAYS' : '✓ VERIFIED & APPROVED'}
                  </span>

                  <button
                    onClick={() => alert(`View/Download ${doc.name}`)}
                    style={{
                      background: '#fff',
                      border: '1px solid #E2ECF5',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tab 4: Bank Details Form ─── */}
      {activeTab === 'BANK' && (
        <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #E2ECF5' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0C2340', marginBottom: 16 }}>
            Bank Account for Weekly Payouts
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Account Holder Name</label>
              <input
                type="text"
                value={bank.accountHolder}
                onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Bank Name</label>
              <input
                type="text"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>Account Number</label>
              <input
                type="text"
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A6FA5', display: 'block', marginBottom: 6 }}>IFSC Code</label>
              <input
                type="text"
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2ECF5', fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: '#0984E3',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Update Bank Details
          </button>
        </form>
      )}
    </div>
  );
}
