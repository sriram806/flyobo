export const NEXT_PUBLIC_BACKEND_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api/v1' : null);