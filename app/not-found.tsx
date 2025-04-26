import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-6">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          The page you were looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}