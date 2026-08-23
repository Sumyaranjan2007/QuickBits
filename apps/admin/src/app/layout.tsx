'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ─── Determine theme from path ────────────
  let theme = 'customer';
  if (pathname.startsWith('/admin')) theme = 'admin';
  else if (pathname.startsWith('/restaurant')) theme = 'restaurant';
  else if (pathname.startsWith('/delivery')) theme = 'delivery';
  else theme = 'customer';

  return (
    <html lang="en">
      <head>
        <title>QuickBite — Multi-Sided Food Platform</title>
        <meta name="description" content="QuickBite food delivery platform - Order food, manage restaurants, deliver orders, admin operations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body data-theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
