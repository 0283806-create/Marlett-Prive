import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marlett - Sistema de Reservas de Eventos',
  description: 'Sistema moderno y elegante para gestionar reservas de eventos con diseño inspirado en madera, verde olivo y contrastes elegantes.',
  keywords: 'reservas, eventos, sistema, marlett, restaurante, eventos corporativos, bodas, cumpleaños',
  authors: [{ name: 'Marlett Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10B981',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
