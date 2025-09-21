'use client';

import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    try {
      const ok = typeof window !== 'undefined' && localStorage.getItem('marlett-admin-token') === '1';
      if (!ok) {
        const k = prompt('Área restringida. Ingresa la clave:');
        const expected = process.env.NEXT_PUBLIC_ADMIN_KEY || 'marlett-admin';
        if (k && k.trim() === expected) {
          localStorage.setItem('marlett-admin-token', '1');
        } else {
          window.location.href = '/';
        }
      }
    } catch {
      window.location.href = '/';
    }
  }, []);

  return children;
}
