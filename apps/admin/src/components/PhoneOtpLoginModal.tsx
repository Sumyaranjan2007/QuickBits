'use client';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PHONE_ACCOUNTS } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneOtpLoginModal({ isOpen, onClose }: Props) {
  const { sendPhoneOtp, verifyPhoneOtpAndLogin } = useAuth();
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendPhoneOtp(phone);
      if (res.success) {
        setInfoMessage(res.message || 'OTP sent successfully. (Dev test code: 123456 or 4821)');
        setStep('OTP');
      } else {
        setError('Failed to send OTP. Please check your number.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyPhoneOtpAndLogin(phone, otp);
      if (!res.success) {
        setError(res.error || 'Invalid OTP code. Try 123456');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoNumber = (num: string) => {
    setPhone(num);
    setStep('PHONE');
    setError(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 420,
          width: '100%',
          padding: 28,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            border: 'none',
            background: '#F5EFEB',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 800,
            color: '#4A0A10',
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A1A', margin: 0 }}>
            {step === 'PHONE' ? 'Phone Number Login' : 'Enter Verification OTP'}
          </h2>
          <p style={{ fontSize: 13, color: '#7A6A5E', marginTop: 6 }}>
            {step === 'PHONE'
              ? 'QuickBite authenticates securely via Supabase Auth'
              : `Enter the 6-digit code sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {infoMessage && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              color: '#047857',
              padding: '10px 14px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            ✓ {infoMessage}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSend}>
            <label style={{ fontSize: 12, fontWeight: 800, color: '#4A0A10', display: 'block', marginBottom: 6 }}>
              Mobile Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: '1.5px solid #EADBCE',
                fontSize: 15,
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 18,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(74, 10, 16, 0.35)',
              }}
            >
              {loading ? 'Sending OTP via Supabase...' : 'Send Verification OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <label style={{ fontSize: 12, fontWeight: 800, color: '#4A0A10', display: 'block', marginBottom: 6 }}>
              6-Digit OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 123456"
              maxLength={6}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: '1.5px solid #EADBCE',
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 6,
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 18,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#4A0A10',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px',
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(74, 10, 16, 0.35)',
                marginBottom: 10,
              }}
            >
              {loading ? 'Verifying with Supabase...' : 'Verify OTP & Open App'}
            </button>

            <button
              type="button"
              onClick={() => setStep('PHONE')}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#7A6A5E',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 6,
              }}
            >
              ← Change Phone Number
            </button>
          </form>
        )}

        {/* Demo Fast-Switch Numbers */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px dashed #EADBCE' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#9E8F84', textTransform: 'uppercase', marginBottom: 8 }}>
            Quick Demo Phone Logins (1-Tap):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(DEMO_PHONE_ACCOUNTS).map(([num, acc]) => (
              <button
                key={num}
                type="button"
                onClick={() => selectDemoNumber(num)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: phone === num ? '1.5px solid #4A0A10' : '1px solid #E5E7EB',
                  backgroundColor: phone === num ? '#FFF8F4' : '#FAFAFA',
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 800, color: '#1A1A1A' }}>{acc.role.replace('_', ' ')}</div>
                <div style={{ color: '#6B7280', fontSize: 10 }}>{num}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
