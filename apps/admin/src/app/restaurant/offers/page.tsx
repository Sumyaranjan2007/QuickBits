'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OffersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/restaurant/profile');
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6F6F6F' }}>
      Redirecting to Offers & Coupons in Restaurant Hub...
    </div>
  );
}
