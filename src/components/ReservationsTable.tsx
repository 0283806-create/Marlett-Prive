'use client'

import React from 'react'
import type { Reservation } from '@/lib/reservations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getStatusColor, getStatusText } from '@/lib/reservations'
import DownloadPDF from '@/components/DownloadPDF'

type Props = {
  reservations: Reservation[]
}

export default function ReservationsTable({ reservations }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="min-w-full bg-white">
        <thead className="bg-stone-50 text-stone-700">
          <tr>
            <th className="text-left p-3">Evento</th>
            <th className="text-left p-3">Cliente</th>
            <th className="text-left p-3">Fecha</th>
            <th className="text-left p-3">Invitados</th>
            <th className="text-left p-3">Total</th>
            <th className="text-left p-3">Estado</th>
            <th className="text-left p-3">Contacto</th>
            <th className="text-left p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="border-t border-stone-100">
              <td className="p-3">
                <div className="font-medium text-stone-800">{r.eventType}</div>
                <div className="text-xs text-stone-500">ID: {r.id}</div>
              </td>
              <td className="p-3">
                <div className="font-medium text-stone-800">{r.name}</div>
                <div className="text-xs text-stone-500">{r.email}</div>
              </td>
              <td className="p-3">{r.date} {r.time}</td>
              <td className="p-3">{r.guests}</td>
              <td className="p-3">${r.totalPrice.toLocaleString()}</td>
              <td className="p-3">
                <Badge className={`${getStatusColor(r.status)} px-3 py-1`}>{getStatusText(r.status)}</Badge>
              </td>
              <td className="p-3">
                <div className="text-sm text-stone-700">{r.email}</div>
                <div className="text-sm text-stone-700">{r.phone}</div>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <DownloadPDF event={r} label="PDF" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


