'use client'

import React from 'react'
import type { Reservation } from '@/lib/reservations'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { downloadReservationPdf } from '@/lib/utils'

type Props = {
  event: Reservation
  label?: string
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
}

export default function DownloadPDF({ event, label = 'Descargar PDF', className, variant = 'outline', size }: Props) {
  const onClick = async () => {
    await downloadReservationPdf(event)
  }

  return (
    <Button onClick={onClick} variant={variant} size={size} className={className}>
      <Download className="w-4 h-4 mr-2" /> {label}
    </Button>
  )
}


