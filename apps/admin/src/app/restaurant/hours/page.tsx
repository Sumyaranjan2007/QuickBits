'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HoursRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/restaurant/profile');
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6F6F6F' }}>
      Redirecting to Operating Hours in Restaurant Hub...
    </div>
  );
}
