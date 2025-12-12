const normalizeSiteUrl = (value: string | undefined | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const url = hasProtocol ? trimmed : `https://${trimmed}`;
  return url.replace(/\/+$/, '');
};

const DEFAULT_SITE_URL = 'https://marlettprive.mx';

export const SITE_URL =
  normalizeSiteUrl(import.meta.env.VITE_SITE_URL) ?? DEFAULT_SITE_URL;

export const withSiteUrl = (path = ''): string => {
  if (!path) return SITE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
};

