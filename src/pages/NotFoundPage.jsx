// src/pages/NotFoundPage.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-6">
          The requested path{' '}
          <code className="bg-gray-800 px-2 py-1 rounded text-emerald-400 text-sm">
            {location.pathname}
          </code>{' '}
          is invalid or does not exist.
        </p>
        <Link
          to="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
