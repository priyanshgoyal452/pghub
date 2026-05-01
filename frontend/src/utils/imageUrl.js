export const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Get origin from VITE_API_BASE
  // Example: https://mintcream-seal-312444.hostingersite.com/pghub/php-backend/api -> https://mintcream-seal-312444.hostingersite.com
  try {
    const apiBase = import.meta.env.VITE_API_BASE;
    const origin = new URL(apiBase).origin;
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  } catch (err) {
    console.error('Invalid VITE_API_BASE', err);
    return path;
  }
};
