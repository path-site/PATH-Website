/**
 * Resolves media URLs (especially relative /api/public/media/... paths)
 * to full URLs when VITE_API_BASE_URL is configured, or leaves them relative
 * for local dev proxy and Vercel rewrites.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    const cleanBase = apiBase.trim().replace(/\/+$/, '').replace(/\/api$/, '');
    if (url.startsWith('/')) {
      return `${cleanBase}${url}`;
    }
    return `${cleanBase}/${url}`;
  }

  return url;
}
