'use client'

import React from 'react'
import type { Reservation } from '@/lib/reservations'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportReservationsToCSV, exportReservationsToXLSX } from '@/lib/utils'

type Props = {
  data: Reservation[]
}

export default function ExportData({ data }: Props) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => exportReservationsToCSV(data)}>
        <Download className="w-4 h-4 mr-2" /> CSV
      </Button>
      <Button variant="outline" onClick={() => exportReservationsToXLSX(data)}>
        <Download className="w-4 h-4 mr-2" /> XLSX
      </Button>
    </div>
  )
}


