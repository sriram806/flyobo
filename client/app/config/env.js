export const NEXT_PUBLIC_BACKEND_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/v1' : 'https://flyobo.com/api/v1');

// Public site URL used for building canonical links and share URLs.
export const NEXT_PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://flyobo.com');