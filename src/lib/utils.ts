import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- PDF generation for Reservation ---
export function formatPersonName(raw: string): string {
  if (!raw) return ''
  // Normalize spaces and underscores
  const cleaned = raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/_/g, ' ')

  // Insert spaces between lower-Upper boundaries (camel/pascal)
  let withBoundaries = cleaned.replace(/([a-záéíóúüñ])([A-ZÁÉÍÓÚÜÑ])/g, '$1 $2')

  // If it is a single concatenated token, try to split into 3 parts (first, middle, last)
  if (!/\s/.test(withBoundaries)) {
    const s = withBoundaries.toLowerCase()
    const n = s.length
    const isLetter = (c: string) => /[a-záéíóúüñ]/i.test(c)
    const isVowel = (c: string) => /[aeiouáéíóúü]/i.test(c)
    const isBoundary = (i: number) => {
      if (i <= 1 || i >= n - 1) return false
      const left = s[i - 1]
      const right = s[i]
      return isVowel(left) && !isVowel(right)
    }
    const findBoundaryNear = (target: number) => {
      const maxD = Math.min(6, Math.max(target, n - target))
      for (let d = 0; d <= maxD; d++) {
        const i1 = target - d
        const i2 = target + d
        if (isBoundary(i1)) return i1
        if (isBoundary(i2)) return i2
      }
      return Math.min(Math.max(2, target), n - 2)
    }

    if (n >= 6 && s.split('').every(isLetter)) {
      // Prefer 3-way split when name is long enough
      if (n >= 12) {
        let i = findBoundaryNear(Math.round(n / 3))
        let j = findBoundaryNear(Math.round((2 * n) / 3))
        if (j - i < 2) {
          j = Math.min(n - 2, i + 2)
        }
        if (i >= 2 && j <= n - 2) {
          withBoundaries = `${s.slice(0, i)} ${s.slice(i, j)} ${s.slice(j)}`
        } else {
          // Fallback to 2-way split near middle
          const mid = Math.floor(n / 2)
          const k = findBoundaryNear(mid)
          withBoundaries = `${s.slice(0, k)} ${s.slice(k)}`
        }
      } else {
        // For shorter tokens, split into two parts
        const mid = Math.floor(n / 2)
        const k = findBoundaryNear(mid)
        withBoundaries = `${s.slice(0, k)} ${s.slice(k)}`
      }
    }
  }

  const normalized = withBoundaries.toLowerCase()
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
import { jsPDF } from 'jspdf'
import type { Reservation } from './reservations'
import { getPricingConfig } from './reservations'

let cachedLogoDataUrl: string | null = null

async function loadLogoPngDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl
  try {
    const response = await fetch('/marlett-logo.svg', { cache: 'force-cache' })
    if (!response.ok) return null
    const svgText = await response.text()
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject as any
      image.src = url
    })

    const canvas = document.createElement('canvas')
    const targetWidth = 1600
    const scale = targetWidth / img.width
    canvas.width = targetWidth
    canvas.height = Math.max(1, Math.floor(img.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    URL.revokeObjectURL(url)
    cachedLogoDataUrl = dataUrl
    return dataUrl
  } catch {
    return null
  }
}

export function generateReservationPdf(reservation: Reservation, options?: { logoDataUrl?: string | null }): jsPDF {
  const doc = new jsPDF()

  const line = (text: string, y: number, x: number = 14) => {
    doc.text(String(text), x, y)
  }

  let y = 20

  // Header with logo if available
  const logo = options?.logoDataUrl
  if (logo) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth()
      const logoWidth = 60
      const logoHeight = 18
      const x = (pageWidth - logoWidth) / 2
      doc.addImage(logo, 'PNG', x, 10, logoWidth, logoHeight)
      y = 10 + logoHeight + 6
    } catch {
      y = 20
    }
  }
  doc.setFontSize(18)
  line('Marlett - Detalles de Reserva', y)
  y += 6
  doc.setFontSize(11)
  line('================================', y)
  y += 10

  const addField = (label: string, value: string | number) => {
    const text = `${label}: ${value}`
    const split = doc.splitTextToSize(text, 180)
    doc.text(split, 14, y)
    y += (split.length * 6)
  }

  addField('ID', reservation.id)
  addField('Nombre', reservation.name)
  addField('Email', reservation.email)
  addField('Teléfono', reservation.phone)
  addField('Tipo de evento', reservation.eventType)
  addField('Fecha', reservation.date)
  addField('Hora de inicio', reservation.time)
  addField('Duración (horas)', reservation.duration)
  addField('Invitados', reservation.guests)
  addField('Salones asignados', reservation.rooms.join(', '))

  y += 6
  doc.setFontSize(13)
  line('Desglose de precios', y)
  y += 8
  doc.setFontSize(11)
  const pricing = getPricingConfig()
  const fmt = (n: number) => `$${n.toLocaleString()}`
  const cateringPerPerson = Number(pricing.catering) || 0
  const decorPerPerson = Number(pricing.decoracion) || 0
  const avPerPerson = Number(pricing.audioVisual) || 0
  const guests = Number(reservation.guests) || 0
  const cateringCalc = cateringPerPerson * guests
  const decorCalc = decorPerPerson * guests
  const avCalc = avPerPerson * guests

  addField('Base', fmt(reservation.priceBreakdown.basePrice))
  addField('Horas', fmt(reservation.priceBreakdown.hourlyRate))
  addField('Salones', fmt(reservation.priceBreakdown.roomCost))
  // Cálculo por persona x invitados
  addField('Catering (por persona x invitados)', `${fmt(cateringPerPerson)} x ${guests} = ${fmt(cateringCalc)}`)
  addField('Decoración (por persona x invitados)', `${fmt(decorPerPerson)} x ${guests} = ${fmt(decorCalc)}`)
  addField('Audio/Visual (por persona x invitados)', `${fmt(avPerPerson)} x ${guests} = ${fmt(avCalc)}`)
  addField('Montaje especial', fmt(reservation.priceBreakdown.specialSetupCost))
  addField('Total Estimado', `$${reservation.totalPrice.toLocaleString()}`)

  y += 6
  doc.setFontSize(13)
  line('Selecciones', y)
  y += 8
  doc.setFontSize(11)
  addField('Catering', reservation.cateringSelection.join(', ') || 'N/A')
  addField('Decoración', reservation.decorationSelection.join(', ') || 'N/A')
  addField('Audio/Visual', reservation.audioVisualSelection.join(', ') || 'N/A')

  y += 6
  addField('Estatus', reservation.status)
  addField('Creado', reservation.createdAt)

  return doc
}

export async function downloadReservationPdf(reservation: Reservation): Promise<void> {
  const logoDataUrl = await loadLogoPngDataUrl()
  const doc = generateReservationPdf(reservation, { logoDataUrl })
  doc.save(`reserva-${reservation.id}.pdf`)
}

// --- Admin PDF generation: extended summary for internal use ---
function calculateEndTime(startTime: string, durationHours: number): string {
  try {
    const [hStr, mStr] = startTime.split(':')
    const start = new Date()
    start.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0)
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
    const hh = String(end.getHours()).padStart(2, '0')
    const mm = String(end.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  } catch {
    return startTime
  }
}

export function generateAdminReservationPdf(reservation: Reservation, options?: { logoDataUrl?: string | null }): jsPDF {
  const doc = new jsPDF()

  const write = (text: string, y: number, x: number = 14) => {
    doc.text(String(text), x, y)
  }

  let y = 20

  const logo = options?.logoDataUrl
  if (logo) {
    try {
      const pageWidth = doc.internal.pageSize.getWidth()
      const logoWidth = 60
      const logoHeight = 18
      const x = (pageWidth - logoWidth) / 2
      doc.addImage(logo, 'PNG', x, 10, logoWidth, logoHeight)
      y = 10 + logoHeight + 6
    } catch {
      y = 20
    }
  }

  doc.setFontSize(18)
  write('Marlett - Resumen Interno de Evento (Administración)', y)
  y += 6
  doc.setFontSize(11)
  write('================================', y)
  y += 10

  const addField = (label: string, value: string | number) => {
    const text = `${label}: ${value}`
    const split = doc.splitTextToSize(text, 180)
    doc.text(split, 14, y)
    y += split.length * 6
  }

  // Datos generales
  doc.setFontSize(13)
  write('Datos Generales', y)
  y += 8
  doc.setFontSize(11)
  addField('ID', reservation.id)
  addField('Cliente', reservation.name)
  addField('Contacto', `${reservation.email} | ${reservation.phone}`)
  addField('Tipo de evento', reservation.eventType)
  addField('Fecha', reservation.date)
  addField('Hora inicio', reservation.time)
  addField('Duración (h)', reservation.duration)
  addField('Hora fin (estimada)', calculateEndTime(reservation.time, reservation.duration))
  addField('Invitados', reservation.guests)
  addField('Salones', reservation.rooms.join(', ') || 'N/A')

  // Estimado de costos clave (comida/bebida y otros)
  y += 6
  doc.setFontSize(13)
  write('Estimado de Costos', y)
  y += 8
  doc.setFontSize(11)
  const pricing = getPricingConfig()
  const fmt = (n: number) => `$${n.toLocaleString()}`
  const guests = Number(reservation.guests) || 0
  const cateringPerPerson = Number(pricing.catering) || 0
  const decorPerPerson = Number(pricing.decoracion) || 0
  const avPerPerson = Number(pricing.audioVisual) || 0
  const cateringCalc = cateringPerPerson * guests
  const decorCalc = decorPerPerson * guests
  const avCalc = avPerPerson * guests

  addField('Catering (por persona x invitados)', `${fmt(cateringPerPerson)} x ${guests} = ${fmt(cateringCalc)}`)
  addField('Decoración (por persona x invitados)', `${fmt(decorPerPerson)} x ${guests} = ${fmt(decorCalc)}`)
  addField('Audio/Visual (por persona x invitados)', `${fmt(avPerPerson)} x ${guests} = ${fmt(avCalc)}`)
  addField('Horas', `$${reservation.priceBreakdown.hourlyRate.toLocaleString()}`)
  addField('Salones', `$${reservation.priceBreakdown.roomCost.toLocaleString()}`)
  addField('Montaje especial', `$${reservation.priceBreakdown.specialSetupCost.toLocaleString()}`)
  addField('Total estimado', `$${reservation.totalPrice.toLocaleString()}`)

  // Selecciones detalladas para catering/decoración/AV
  y += 6
  doc.setFontSize(13)
  write('Selecciones de Servicio', y)
  y += 8
  doc.setFontSize(11)
  addField('Catering (alimentos/bebidas)', reservation.cateringSelection.join(', ') || 'N/A')
  addField('Decoración', reservation.decorationSelection.join(', ') || 'N/A')
  addField('Audio/Visual', reservation.audioVisualSelection.join(', ') || 'N/A')

  // Recomendaciones de pre-planeación
  y += 6
  doc.setFontSize(13)
  write('Recomendaciones de Pre-Planeación', y)
  y += 8
  doc.setFontSize(11)
  const recommendations = [
    'Definir menú y bebidas 10 días antes (considerar restricciones alimentarias).',
    'Confirmar número final de invitados 7 días antes.',
    'Programar montaje/decoración 2–3 horas antes del inicio.',
    'Prueba de sonido y verificación AV 1–2 horas antes.',
    'Asignar responsables para recepción, catering y cierre.',
    'Compartir agenda detallada con proveedores 48 horas antes.',
  ]
  for (const rec of recommendations) {
    const bullet = `- ${rec}`
    const split = doc.splitTextToSize(bullet, 180)
    doc.text(split, 14, y)
    y += split.length * 6
  }

  // Notas
  if (reservation.notes && reservation.notes.length > 0) {
    y += 6
    doc.setFontSize(13)
    write('Notas del Evento', y)
    y += 8
    doc.setFontSize(11)
    const notesText = reservation.notes.join(' | ')
    const splitNotes = doc.splitTextToSize(notesText, 180)
    doc.text(splitNotes, 14, y)
    y += splitNotes.length * 6
  }

  // Estatus
  y += 6
  addField('Estatus', reservation.status)
  addField('Creado', reservation.createdAt)

  return doc
}

export async function downloadAdminReservationPdf(reservation: Reservation): Promise<void> {
  const logoDataUrl = await loadLogoPngDataUrl()
  const doc = generateAdminReservationPdf(reservation, { logoDataUrl })
  doc.save(`admin-reserva-${reservation.id}.pdf`)
}

// --- Export helpers (CSV/XLSX) ---
import * as XLSX from 'xlsx'

type FlatReservation = Record<string, string | number | boolean | null>

function flattenReservation(reservation: Reservation): FlatReservation {
  return {
    id: reservation.id,
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    eventType: reservation.eventType,
    date: reservation.date,
    time: reservation.time,
    duration: reservation.duration,
    guests: reservation.guests,
    rooms: reservation.rooms.join(', '),
    totalPrice: reservation.totalPrice,
    status: reservation.status,
    catering: reservation.cateringSelection.join(', '),
    decoration: reservation.decorationSelection.join(', '),
    audioVisual: reservation.audioVisualSelection.join(', '),
    createdAt: reservation.createdAt,
  }
}

export function exportReservationsToCSV(reservations: Reservation[], filename = 'reservas.csv'): void {
  const headers = [
    'id','name','email','phone','eventType','date','time','duration','guests','rooms','totalPrice','status','catering','decoration','audioVisual','createdAt'
  ]
  const rows = reservations.map(flattenReservation)
  const csv = [headers.join(',')]
  for (const row of rows) {
    const values = headers.map((h) => {
      const v = row[h as keyof FlatReservation]
      const s = v == null ? '' : String(v)
      // simple CSV escaping
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    })
    csv.push(values.join(','))
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportReservationsToXLSX(reservations: Reservation[], filename = 'reservas.xlsx'): void {
  const rows = reservations.map(flattenReservation)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas')
  const blob = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as unknown as ArrayBuffer
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
