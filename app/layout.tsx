import React from 'react';
import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'BitHedge - Bitcoin PUT Option Premium Calculator',
  description: 'Calculate Bitcoin PUT option premiums using the Black-Scholes pricing model',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        {children}
      </body>
    </html>
  );
}