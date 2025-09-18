'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    // console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ha ocurrido un error</h2>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Algo salió mal al cargar esta página. Puedes intentar recargar.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => reset()}
            style={{
              background: '#065f46',
              color: 'white',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 600
            }}
          >
            Reintentar
          </button>
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            style={{
              background: 'white',
              color: '#065f46',
              border: '1px solid #065f46',
              borderRadius: 12,
              padding: '10px 16px',
              fontWeight: 600
            }}
          >
            Recargar
          </button>
      </div>
      </div>
    </div>
  )
}


