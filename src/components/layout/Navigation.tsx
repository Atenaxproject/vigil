'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Search,
  FilePlus,
  HandHelping,
  Users,
  Building2,
  Heart,
  Newspaper,
  Map,
  Plus,
  MoreHorizontal,
  ArrowLeftRight,
  Info,
  HelpCircle,
  Shield,
  Calendar,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavLabelKey =
  | 'search'
  | 'report'
  | 'needHelp'
  | 'volunteers'
  | 'organizations'
  | 'donate'
  | 'news'
  | 'map'
  | 'exchange'
  | 'howToHelp'
  | 'info'
  | 'activeTeam'
  | 'calendar'
  | 'collectionPoint'

const navItems: Array<{
  href: string
  labelKey: NavLabelKey
  icon: typeof Map
  center?: boolean
  more?: boolean
}> = [
  { href: '/', labelKey: 'map', icon: Map },
  { href: '/buscar', labelKey: 'search', icon: Search },
  { href: '/reportar', labelKey: 'report', icon: FilePlus, center: true },
  { href: '/necesito-ayuda', labelKey: 'needHelp', icon: HandHelping },
  { href: '/calendario', labelKey: 'calendar', icon: Calendar, more: true },
  { href: '/punto-de-acopio', labelKey: 'collectionPoint', icon: Package, more: true },
  { href: '/intercambio', labelKey: 'exchange', icon: ArrowLeftRight, more: true },
  { href: '/voluntarios', labelKey: 'volunteers', icon: Users, more: true },
  { href: '/organizaciones', labelKey: 'organizations', icon: Building2, more: true },
  { href: '/como-ayudar', labelKey: 'howToHelp', icon: HelpCircle, more: true },
  { href: '/equipo-activo', labelKey: 'activeTeam', icon: Shield, more: true },
  { href: '/informacion', labelKey: 'info', icon: Info, more: true },
  { href: '/donaciones', labelKey: 'donate', icon: Heart, more: true },
  { href: '/noticias', labelKey: 'news', icon: Newspaper, more: true },
]

export function Navigation() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const primaryMobile = navItems.filter((item) => !item.more)
  const moreItems = navItems.filter((item) => item.more)

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-200 px-4 py-5">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-vigil-ink">
            Vigil
          </Link>
          <p className="mt-1 text-[11px] text-vigil-muted">Venezuela 2026</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-[44px] items-center gap-3 rounded-input px-3 text-[13px] transition-colors',
                  active
                    ? 'border-l-4 border-vigil-blue bg-vigil-blue-light font-medium text-vigil-blue'
                    : 'text-slate-600 hover:bg-vigil-cloud'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden"
        aria-label="Mobile"
      >
        {primaryMobile.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-6 flex flex-col items-center"
                aria-label={t(item.labelKey)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vigil-blue text-white shadow-sm">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="mt-1 text-[10px] font-medium text-vigil-blue">{t(item.labelKey)}</span>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px]"
            >
              <Icon className={cn('h-5 w-5', active ? 'text-vigil-blue' : 'text-vigil-muted')} />
              <span className={cn(active ? 'font-medium text-vigil-blue' : 'text-vigil-muted')}>
                {t(item.labelKey)}
              </span>
              {active && <span className="h-1 w-1 rounded-full bg-vigil-blue" />}
            </Link>
          )
        })}
        <details className="relative flex flex-1 flex-col items-center">
          <summary className="flex min-h-[44px] cursor-pointer list-none flex-col items-center justify-center gap-0.5 text-[10px] text-vigil-muted">
            <MoreHorizontal className="h-5 w-5" />
            Más
          </summary>
          <div className="absolute bottom-full mb-2 max-h-64 w-48 overflow-y-auto rounded-card border border-slate-200 bg-white p-2 shadow-sm">
            {moreItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-input px-3 py-2 text-[13px] hover:bg-vigil-cloud"
                >
                  <Icon className="h-4 w-4 text-vigil-muted" />
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </div>
        </details>
      </nav>
    </>
  )
}
