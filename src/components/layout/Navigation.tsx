'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  X,
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
  shortKey?: string
  icon: typeof Map
  center?: boolean
  more?: boolean
}> = [
  { href: '/', labelKey: 'map', shortKey: 'mapShort', icon: Map },
  { href: '/buscar', labelKey: 'search', shortKey: 'searchShort', icon: Search },
  { href: '/reportar', labelKey: 'report', shortKey: 'reportShort', icon: FilePlus, center: true },
  { href: '/necesito-ayuda', labelKey: 'needHelp', shortKey: 'needHelpShort', icon: HandHelping },
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
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const primaryMobile = navItems.filter((item) => !item.more)
  const moreItems = navItems.filter((item) => item.more)

  const closeMore = useCallback(() => setMoreOpen(false), [])

  // Close the sheet whenever the route changes (a link was followed).
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  // Escape to close, body scroll lock, focus management + basic focus trap.
  useEffect(() => {
    if (!moreOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMore()
        return
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.()
    }
  }, [moreOpen, closeMore])

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-4 py-5">
          <Link href="/" className="font-display text-[20px] font-bold tracking-tight text-vigil-ink">
            Vigil
          </Link>
          <p className="mt-1 text-[13px] text-vigil-muted">Venezuela 2026</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[44px] items-center gap-3 rounded-input px-3 text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
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
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden"
        aria-label="Mobile"
      >
        {primaryMobile.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          const shortLabel = item.shortKey ? t(item.shortKey) : t(item.labelKey)
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="-mt-6 flex flex-col items-center focus-visible:outline-none"
                aria-label={t(item.labelKey)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vigil-blue text-white shadow-sm">
                  <Plus className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-1 text-[13px] font-medium text-vigil-blue">{shortLabel}</span>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey)}
              className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
            >
              <Icon className={cn('h-5 w-5', active ? 'text-vigil-blue' : 'text-vigil-muted')} aria-hidden />
              <span className={cn(active ? 'font-medium text-vigil-blue' : 'text-vigil-muted')}>
                {shortLabel}
              </span>
              {active && <span className="h-1 w-1 rounded-full bg-vigil-blue" aria-hidden />}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="more-nav-sheet"
          className="flex min-h-[44px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[13px] text-vigil-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
          {t('more')}
        </button>
      </nav>

      {/* Más menu — bottom-sheet (never clips in landscape, unlike the old side flyout) */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={closeMore}
          role="presentation"
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            ref={sheetRef}
            id="more-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t('more')}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-card border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-lg"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <span className="text-[16px] font-semibold text-vigil-ink">{t('more')}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMore}
                aria-label={tCommon('close')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="p-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMore}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[44px] items-center gap-3 rounded-input px-3 text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
                        active
                          ? 'bg-vigil-blue-light font-medium text-vigil-blue'
                          : 'text-slate-700 hover:bg-vigil-cloud'
                      )}
                    >
                      <Icon
                        className={cn('h-5 w-5 shrink-0', active ? 'text-vigil-blue' : 'text-vigil-muted')}
                        aria-hidden
                      />
                      {t(item.labelKey)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
