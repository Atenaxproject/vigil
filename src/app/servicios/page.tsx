import { ServiciosClient } from '@/components/servicios/ServiciosClient'

export const metadata = {
  title: 'Estado de servicios — Vigil',
  description: 'Estado comunitario de luz, agua, gasolina, gas y señal por zona.',
}

export default function ServiciosPage() {
  return <ServiciosClient />
}
