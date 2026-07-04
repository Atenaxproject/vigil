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
  MessageSquare,
  BarChart3,
  ExternalLink,
  Wifi,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  LifeBuoy,
} from 'lucide-react'
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton'
import { useViewModeContext } from '@/components/onboarding/ViewModeProvider'
import { isRouteVisibleForMode } from '@/config/viewMode.config'
import { cn } from '@/lib/utils'

const SIDEBAR_STORAGE_KEY = 'vigil-sidebar-collapsed'

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
  | 'wall'
  | 'stats'
  | 'network'
  | 'collectionPoint'
  | 'connectivity'
  | 'propertyAssessment'
  | 'help'

const navItems: Array<{
  href: string
  labelKey: NavLabelKey
  shortKey?: string
  icon: typeof Map
  center?: boolean
  more?: boolean
  sidebarHidden?: boolean
  alwaysVisible?: boolean
}> = [
  { href: '/ayuda', labelKey: 'help', shortKey: 'helpShort', icon: LifeBuoy, alwaysVisible: true },
  { href: '/', labelKey: 'map', shortKey: 'mapShort', icon: Map },
  { href: '/buscar', labelKey: 'search', shortKey: 'searchShort', icon: Search },
  { href: '/reportar', labelKey: 'report', shortKey: 'reportShort', icon: FilePlus, center: true },
  { href: '/necesito-ayuda', labelKey: 'needHelp', shortKey: 'needHelpShort', icon: HandHelping },
  { href: '/calendario', labelKey: 'calendar', icon: Calendar, more: true },
  { href: '/muro', labelKey: 'wall', icon: MessageSquare, more: true },
  { href: '/red', labelKey: 'network', icon: ExternalLink, more: true },
  { href: '/estadisticas', labelKey: 'stats', icon: BarChart3, more: true },
  { href: '/punto-de-acopio', labelKey: 'collectionPoint', icon: Package, more: true },
  { href: '/conectividad', labelKey: 'connectivity', icon: Wifi, more: true },
  { href: '/evaluacion-estructural', labelKey: 'propertyAssessment', icon: Home, more: true },
  { href: '/intercambio', labelKey: 'exchange', icon: ArrowLeftRight, more: true },
  { href: '/voluntarios', labelKey: 'volunteers', icon: Users, more: true },
  { href: '/organizaciones', labelKey: 'organizations', icon: Building2, more: true },
  { href: '/como-ayudar', labelKey: 'howToHelp', icon: HelpCircle, more: true },
  { href: '/equipo-activo', labelKey: 'activeTeam', icon: Shield, more: true },
  { href: '/informacion', labelKey: 'info', icon: Info, more: true },
  { href: '/donaciones', labelKey: 'donate', icon: Heart, more: true, sidebarHidden: true },
  { href: '/noticias', labelKey: 'news', icon: Newspaper, more: true, sidebarHidden: true },
]

export function Navigation() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { mode, ready: modeReady } = useViewModeContext()
  const [moreOpen, setMoreOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarReady, setSidebarReady] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const isVisible = (item: (typeof navItems)[number]) =>
    item.alwaysVisible || !modeReady || isRouteVisibleForMode(item.href, mode)

  const visibleItems = navItems.filter(isVisible)
  const helpItem = visibleItems.find((item) => item.href === '/ayuda')
  const reportItem = visibleItems.find((item) => item.center)
  const mobilePrimaryCandidates = visibleItems.filter(
    (item) => !item.more && !item.alwaysVisible && !item.center
  )
  const mobilePrimary = mobilePrimaryCandidates.slice(0, 2)
  const moreItems = visibleItems.filter((item) => item.more)
  const sidebarItems = visibleItems.filter((item) => !item.sidebarHidden)

  const closeMore = useCallback(() => setMoreOpen(false), [])

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (stored === 'true') setCollapsed(true)
    } catch {
      /* ignore */
    }
    setSidebarReady(true)
  }, [])

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

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
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-slate-200 bg-white lg:flex',
          'transition-[width] duration-200 ease-out motion-reduce:transition-none',
          collapsed ? 'w-16' : 'w-[280px]'
        )}
        data-sidebar-ready={sidebarReady ? 'true' : 'false'}
      >
        <div
          className={cn(
            'border-b border-slate-200',
            collapsed ? 'px-2 py-4 text-center' : 'px-4 py-5'
          )}
        >
          <Link
            href="/"
            className={cn(
              'font-display font-bold tracking-tight text-vigil-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
              collapsed ? 'inline-flex h-9 w-9 items-center justify-center rounded-input text-[17px]' : 'text-[20px]'
            )}
            aria-label="Vigil"
          >
            {collapsed ? 'V' : 'Vigil'}
          </Link>
          {!collapsed && <p className="mt-1 text-[13px] text-vigil-muted">Venezuela 2026</p>}
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2"
          aria-label={t('desktopNav')}
        >
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            const label = t(item.labelKey)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex min-h-[44px] items-center rounded-input text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  active
                    ? 'border-l-4 border-vigil-blue bg-vigil-blue-light font-medium text-vigil-blue'
                    : 'text-slate-600 hover:bg-vigil-cloud'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className={cn(collapsed && 'sr-only', !collapsed && 'whitespace-nowrap')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('expandMenu') : t('collapseMenu')}
            className={cn(
              'flex min-h-[44px] w-full items-center rounded-input text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden />
            ) : (
              <PanelLeftClose className="h-5 w-5 shrink-0" aria-hidden />
            )}
            <span className={cn('text-[13px]', collapsed && 'sr-only')}>
              {collapsed ? t('expandMenu') : t('collapseMenu')}
            </span>
          </button>
        </div>
      </aside>

      <nav
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2 lg:hidden"
        aria-label={t('mobileNav')}
      >
        {mobilePrimary.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          const shortLabel = item.shortKey ? t(item.shortKey) : t(item.labelKey)
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

        {reportItem && (
          <Link
            key={reportItem.href}
            href={reportItem.href}
            aria-current={pathname === reportItem.href ? 'page' : undefined}
            className="-mt-6 flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
            aria-label={t(reportItem.labelKey)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vigil-blue text-white shadow-sm">
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <span className="mt-1 text-[13px] font-medium text-vigil-blue">
              {reportItem.shortKey ? t(reportItem.shortKey) : t(reportItem.labelKey)}
            </span>
          </Link>
        )}

        {helpItem && (
          <Link
            key={helpItem.href}
            href={helpItem.href}
            aria-current={pathname === helpItem.href ? 'page' : undefined}
            aria-label={t(helpItem.labelKey)}
            className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            <LifeBuoy
              className={cn('h-5 w-5', pathname === helpItem.href ? 'text-vigil-blue' : 'text-vigil-muted')}
              aria-hidden
            />
            <span
              className={cn(pathname === helpItem.href ? 'font-medium text-vigil-blue' : 'text-vigil-muted')}
            >
              {helpItem.shortKey ? t(helpItem.shortKey) : t(helpItem.labelKey)}
            </span>
            {pathname === helpItem.href && (
              <span className="h-1 w-1 rounded-full bg-vigil-blue" aria-hidden />
            )}
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="more-nav-sheet"
          aria-label={t('more')}
          className="flex min-h-[44px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[13px] text-vigil-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden />
          {t('more')}
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" onClick={closeMore} role="presentation">
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
              <PwaInstallButton onInstalled={closeMore} />
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
