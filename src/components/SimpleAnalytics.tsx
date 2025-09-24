'use client';

import Script from 'next/script';

export function SimpleAnalytics() {
  return (
    <Script
      async
      src="https://scripts.simpleanalyticscdn.com/latest.js"
    />
  );
}
