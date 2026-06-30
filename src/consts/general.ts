export const BUILD_CANADA_URL = "https://www.buildcanada.com";

// Canonical origin for the bills app (the `/bills` basePath is appended via buildRelativePath).
// Used by sitemap, robots, and canonical/OG URLs when NEXT_PUBLIC_APP_URL is not set.
export const BUILD_CANADA_BILLS_ORIGIN = "https://www.buildcanada.com";

export const PROJECT_NAME = "Builder MP";

export const GOOGLE_ANALYTICS_ID = "G-VFXPGBE1PR";
export const BUILD_CANADA_TWITTER_HANDLE = "@buildcanada";

// Revalidation intervals (in seconds)
// Note: Route segment configs (export const revalidate in page.tsx files) must use literal values
// due to Next.js static analysis requirements. Use these constants only for runtime fetch calls.
export const BILL_API_REVALIDATE_INTERVAL = 600; // Bill API data cache (fetch revalidation)
