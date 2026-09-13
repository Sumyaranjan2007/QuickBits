'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/restaurant/settings');
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6F6F6F' }}>
      Redirecting to Team & Staff Settings...
    </div>
  );
}
