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
    emergencyContactName: 'Suman Kumar (Brother)',
    emergencyContactPhone: '+91 98765 44332',
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
    <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* ─── Top Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0C2340', margin: 0 }}>👤 Partner Profile & Verification</h1>
          <p style={{ fontSize: 13, color: '#4A6FA5', marginTop: 4, marginBottom: 0 }}>
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
        borderRadius: 18,
        padding: '18px 16px',
        border: '1px solid #E2ECF5',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: '1 1 240px' }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0984E3, #00CEC9)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 900,
            flexShrink: 0
          }}>
            RK
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0C2340' }}>{personal.name}</div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#E8FFF8', color: '#00B894' }}>
                ✓ VERIFIED
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#4A6FA5', marginTop: 2 }}>
              ID: <strong>DLV-882194</strong> • Indiranagar Fleet
            </div>
            <div style={{ fontSize: 11, color: '#636E72', marginTop: 2 }}>
              ⭐ 4.89 Rating • 418 Completed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ background: '#F8FAFD', padding: '8px 12px', borderRadius: 10, border: '1px solid #E2ECF5', textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 10, color: '#4A6FA5', fontWeight: 700 }}>VEHICLE</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#0C2340', marginTop: 2 }}>{vehicle.registrationNumber}</div>
          </div>

          <div style={{ background: '#F8FAFD', padding: '8px 12px', borderRadius: 10, border: '1px solid #E2ECF5', textAlign: 'center', minWidth: 80 }}>
            <div style={{ fontSize: 10, color: '#4A6FA5', fontWeight: 700 }}>KYC STATUS</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#00B894', marginTop: 2 }}>Approved</div>
          </div>
        </div>
      </div>

      {/* ─── Tabs Switcher ─── */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 20,
        overflowX: 'auto',
        paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        width: '100%',
        boxSizing: 'border-box'
      }}>
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
              padding: '9px 14px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === t.key ? '#0C2340' : '#fff',
              color: activeTab === t.key ? '#fff' : '#636E72',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Personal Info Form (Mobile Vertical 1-Column Layout) ─── */}
      {activeTab === 'PERSONAL' && (
        <form onSubmit={handleSave} className="delivery-form-card">
          <div className="delivery-form-title">
            Personal & Emergency Contact Details
          </div>

          <div className="delivery-form-grid desktop-two-col">
            <div className="delivery-form-field">
              <label>Full Legal Name</label>
              <input
                type="text"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                placeholder="Full Legal Name"
              />
            </div>

            <div className="delivery-form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>

            <div className="delivery-form-field">
              <label>Phone Number (OTP Verification)</label>
              <input
                type="tel"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                placeholder="+91 98450 99881"
              />
            </div>

            <div className="delivery-form-field">
              <label>Date of Birth</label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={personal.dob}
                onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
              />
            </div>

            <div className="delivery-form-field form-col-full">
              <label>Permanent Residential Address</label>
              <textarea
                rows={3}
                value={personal.address}
                onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
                placeholder="House / Flat No, Street, Landmark, Area, City, Pincode"
              />
            </div>

            <div className="delivery-form-field">
              <label>Emergency Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Suman Kumar (Brother)"
                value={personal.emergencyContactName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setPersonal({
                    ...personal,
                    emergencyContactName: newName,
                    emergencyContact: `${newName} — ${personal.emergencyContactPhone}`
                  });
                }}
              />
            </div>

            <div className="delivery-form-field">
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 44332"
                value={personal.emergencyContactPhone}
                onChange={(e) => {
                  const newPhone = e.target.value;
                  setPersonal({
                    ...personal,
                    emergencyContactPhone: newPhone,
                    emergencyContact: `${personal.emergencyContactName} — ${newPhone}`
                  });
                }}
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
              cursor: 'pointer',
              width: '100%',
              maxWidth: 240
            }}
          >
            Save Personal Details
          </button>
        </form>
      )}

      {/* ─── Tab 2: Vehicle Info Form ─── */}
      {activeTab === 'VEHICLE' && (
        <form onSubmit={handleSave} className="delivery-form-card">
          <div className="delivery-form-title">
            Registered Delivery Vehicle
          </div>

          <div className="delivery-form-grid desktop-two-col">
            <div className="delivery-form-field">
              <label>Vehicle Category</label>
              <select
                value={vehicle.type}
                onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })}
              >
                <option value="Electric Scooter (EV)">Electric Scooter (EV)</option>
                <option value="Petrol Motorcycle / Bike">Petrol Motorcycle / Bike</option>
                <option value="Bicycle / E-Bike">Bicycle / E-Bike</option>
                <option value="Commercial 3-Wheeler">Commercial 3-Wheeler</option>
              </select>
            </div>

            <div className="delivery-form-field">
              <label>Make & Model</label>
              <input
                type="text"
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
              />
            </div>

            <div className="delivery-form-field">
              <label>Vehicle Registration Plate (RC Number)</label>
              <input
                type="text"
                value={vehicle.registrationNumber}
                onChange={(e) => setVehicle({ ...vehicle, registrationNumber: e.target.value })}
              />
            </div>

            <div className="delivery-form-field">
              <label>Fuel / Battery Range</label>
              <input
                type="text"
                value={vehicle.batteryRange}
                onChange={(e) => setVehicle({ ...vehicle, batteryRange: e.target.value })}
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
              cursor: 'pointer',
              width: '100%',
              maxWidth: 240
            }}
          >
            Update Vehicle Information
          </button>
        </form>
      )}

      {/* ─── Tab 3: Documents Compliance ─── */}
      {activeTab === 'DOCUMENTS' && (
        <div className="delivery-form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="delivery-form-title" style={{ margin: 0 }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {DOCUMENTS.map((doc) => (
              <div key={doc.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#F8FAFD',
                borderRadius: 12,
                border: `1.5px solid ${doc.status === 'EXPIRING_SOON' ? '#FAB1A0' : '#E2ECF5'}`,
                flexWrap: 'wrap',
                gap: 10,
                boxSizing: 'border-box',
                width: '100%'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{doc.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0C2340' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: '#636E72', marginTop: 2, wordBreak: 'break-word' }}>
                      No: <strong>{doc.docNumber}</strong> • Until: {doc.expiryDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: doc.status === 'VERIFIED' ? '#E8FFF8' : '#FFF5F0',
                    color: doc.status === 'VERIFIED' ? '#00B894' : '#E17055',
                    border: `1px solid ${doc.status === 'VERIFIED' ? '#A3E4D7' : '#FAB1A0'}`
                  }}>
                    {doc.status === 'EXPIRING_SOON' ? '⚠️ EXPIRES SOON' : '✓ VERIFIED'}
                  </span>

                  <button
                    onClick={() => alert(`View/Download ${doc.name}`)}
                    style={{
                      background: '#fff',
                      border: '1px solid #E2ECF5',
                      padding: '5px 10px',
                      borderRadius: 6,
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
        <form onSubmit={handleSave} className="delivery-form-card">
          <div className="delivery-form-title">
            Bank Account for Weekly Payouts
          </div>

          <div className="delivery-form-grid desktop-two-col">
            <div className="delivery-form-field">
              <label>Account Holder Name</label>
              <input
                type="text"
                value={bank.accountHolder}
                onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })}
              />
            </div>

            <div className="delivery-form-field">
              <label>Bank Name</label>
              <input
                type="text"
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
              />
            </div>

            <div className="delivery-form-field">
              <label>Account Number</label>
              <input
                type="text"
                value={bank.accountNumber}
                onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
              />
            </div>

            <div className="delivery-form-field">
              <label>IFSC Code</label>
              <input
                type="text"
                value={bank.ifsc}
                onChange={(e) => setBank({ ...bank, ifsc: e.target.value })}
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
              cursor: 'pointer',
              width: '100%',
              maxWidth: 240
            }}
          >
            Update Bank Details
          </button>
        </form>
      )}
    </div>
  );
}
