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
  Newspaper,
  Map,
  Plus,
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
  BookOpen,
  Phone,
  Activity,
  AlertTriangle,
  Accessibility,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton'
import { useViewModeContext } from '@/components/onboarding/ViewModeProvider'
import { isRouteVisibleForMode, type ViewModeId } from '@/config/viewMode.config'
import { cn } from '@/lib/utils'

type NavLabelKey =
  | 'search'
  | 'report'
  | 'needHelp'
  | 'volunteers'
  | 'organizations'
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
  | 'preparedness'
  | 'myReports'
  | 'services'
  | 'hazards'
  | 'press'
  | 'accessibility'

const navItems: Array<{
  href: string
  labelKey: NavLabelKey
  shortKey?: string
  icon: typeof Map
  center?: boolean
  more?: boolean
  /** Reachable only through the menu sheet — never sidebar or mobile bar. */
  sheetOnly?: boolean
  alwaysVisible?: boolean
}> = [
  { href: '/ayuda', labelKey: 'help', shortKey: 'helpShort', icon: LifeBuoy, alwaysVisible: true },
  { href: '/', labelKey: 'map', shortKey: 'mapShort', icon: Map },
  { href: '/buscar', labelKey: 'search', shortKey: 'searchShort', icon: Search },
  { href: '/reportar', labelKey: 'report', shortKey: 'reportShort', icon: FilePlus, center: true },
  { href: '/necesito-ayuda', labelKey: 'needHelp', shortKey: 'needHelpShort', icon: HandHelping },
  { href: '/preparacion', labelKey: 'preparedness', icon: BookOpen, more: true, alwaysVisible: true },
  // /monitor intentionally omitted from public nav until §68 FIRMS/GDACS redistribution confirmed
  // (docs/reference/MONITOR-AND-AUDIT-DELIVERABLES.md). Route remains URL-reachable when kill switch allows.
  // /donaciones and /noticias are retired redirects (75 §3) — never re-add here;
  // see the compliance note in src/config/viewMode.config.ts.
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
  // Sheet-only destinations — one list defines the whole IA (75 §4); the sheet
  // no longer carries its own ad-hoc entries.
  { href: '/mis-reportes', labelKey: 'myReports', icon: ClipboardList, more: true, sheetOnly: true },
  { href: '/servicios', labelKey: 'services', icon: Activity, more: true, sheetOnly: true },
  { href: '/amenazas', labelKey: 'hazards', icon: AlertTriangle, more: true, sheetOnly: true },
  { href: '/prensa', labelKey: 'press', icon: Newspaper, more: true, sheetOnly: true, alwaysVisible: true },
  { href: '/accesibilidad', labelKey: 'accessibility', icon: Accessibility, more: true, sheetOnly: true, alwaysVisible: true },
]

/**
 * Menu-sheet IA (prompt 72), pinned by mode (75 §4): the sheet is always the
 * FULL site — the active mode's group simply surfaces first. Hiding a route
 * from someone who already knows what they want costs more than showing too
 * many.
 */
const SHEET_GROUPS = [
  { titleKey: 'groupFindSomeone', items: ['/buscar', '/reportar', '/red', '/mis-reportes'] },
  {
    titleKey: 'groupNeedHelp',
    items: ['/necesito-ayuda', '/conectividad', '/evaluacion-estructural', '/preparacion', '/servicios'],
  },
  {
    titleKey: 'groupWantToHelp',
    items: ['/como-ayudar', '/voluntarios', '/intercambio', '/punto-de-acopio', '/organizaciones'],
  },
  { titleKey: 'groupEmergencyStatus', items: ['/', '/estadisticas', '/equipo-activo', '/amenazas'] },
  { titleKey: 'groupInfo', items: ['/informacion', '/ayuda', '/calendario', '/muro', '/prensa'] },
  { titleKey: 'groupSettings', items: ['/accesibilidad'] },
] as const

type SheetGroupKey = (typeof SHEET_GROUPS)[number]['titleKey']

const MODE_PRIMARY_GROUP: Record<ViewModeId, SheetGroupKey | null> = {
  busco_a_alguien: 'groupFindSomeone',
  necesito_ayuda: 'groupNeedHelp',
  quiero_ayudar: 'groupWantToHelp',
  soy_organizacion: 'groupWantToHelp',
  equipo_rescate: 'groupEmergencyStatus',
  solo_informacion: 'groupInfo',
  ver_todo: null,
}

export function Navigation() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { mode, sidebarCollapsed: collapsed, toggleSidebar, sidebarReady } = useViewModeContext()
  const [moreOpen, setMoreOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const isVisible = (item: (typeof navItems)[number]) => {
    if (item.alwaysVisible) return true
    return isRouteVisibleForMode(item.href, mode)
  }

  const visibleItems = navItems.filter(isVisible)
  const helpItem = visibleItems.find((item) => item.href === '/ayuda')
  const reportItem = visibleItems.find((item) => item.center)
  const mobilePrimaryCandidates = visibleItems.filter(
    (item) => !item.more && !item.alwaysVisible && !item.center && !item.sheetOnly
  )
  const mobilePrimary = mobilePrimaryCandidates.slice(0, 2)
  // Collapsed rail is an icon quick-strip of the active mode's items — the
  // grouped menu itself moves to the header sheet while collapsed (R1).
  const collapsedRailItems = visibleItems.filter((item) => !item.sheetOnly)

  // One grouping model everywhere (R1 / 75 §4): active mode's group first.
  const primaryGroup = MODE_PRIMARY_GROUP[mode]
  const orderedGroups = primaryGroup
    ? [...SHEET_GROUPS].sort((a, b) =>
        a.titleKey === primaryGroup ? -1 : b.titleKey === primaryGroup ? 1 : 0
      )
    : [...SHEET_GROUPS]

  // Sidebar group folding: the mode's group is open, the rest are named but
  // folded. Hiding a category's existence has a real cost on a crisis platform,
  // so headers always show — only contents fold. Keyed override on top of the
  // mode default so a user can open any group and it survives a mode change.
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({})
  // In "ver todo" there is no single mode group, and the intent is to see
  // everything — so every group defaults open. In a specific mode, only that
  // mode's group is open; the rest are named but folded.
  const isGroupOpen = (titleKey: string) =>
    groupOverrides[titleKey] ?? (primaryGroup === null ? true : titleKey === primaryGroup)
  const toggleGroup = (titleKey: string) =>
    setGroupOverrides((prev) => ({ ...prev, [titleKey]: !isGroupOpen(titleKey) }))

  const closeMore = useCallback(() => setMoreOpen(false), [])

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
              collapsed ? 'inline-flex h-11 w-11 items-center justify-center rounded-input text-[17px]' : 'text-[20px]'
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
          {collapsed
            ? // Icon quick-strip of the active mode's items. The grouped menu is
              // reached via the header button while collapsed (R1).
              collapsedRailItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                const label = t(item.labelKey)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    aria-label={label}
                    title={label}
                    className={cn(
                      'flex min-h-[44px] items-center justify-center rounded-input px-2 text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
                      active
                        ? 'border-l-4 border-vigil-blue bg-vigil-blue-light font-medium text-vigil-blue'
                        : 'text-slate-600 hover:bg-vigil-cloud'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </Link>
                )
              })
            : // Grouped, full-site nav: mode's group open, others named + folded.
              orderedGroups.map((group) => {
                const open = isGroupOpen(group.titleKey)
                return (
                  <div key={group.titleKey} className="mb-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.titleKey)}
                      aria-expanded={open}
                      className="flex min-h-[36px] w-full items-center justify-between gap-2 rounded-input px-3 text-[13px] font-semibold uppercase tracking-wide text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                    >
                      <span>{t(group.titleKey)}</span>
                      <ChevronDown
                        className={cn('h-4 w-4 shrink-0 transition-transform', !open && '-rotate-90')}
                        aria-hidden
                      />
                    </button>
                    {open && (
                      <ul className="mt-0.5">
                        {group.items.map((href) => {
                          const item = navItems.find((n) => n.href === href)
                          if (!item) return null
                          const Icon = item.icon
                          const active = pathname === href
                          const label = t(item.labelKey)
                          return (
                            <li key={href}>
                              <Link
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                  'flex min-h-[44px] items-center gap-3 rounded-input px-3 text-[16px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
                                  active
                                    ? 'border-l-4 border-vigil-blue bg-vigil-blue-light font-medium text-vigil-blue'
                                    : 'text-slate-600 hover:bg-vigil-cloud'
                                )}
                              >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                                <span className="whitespace-nowrap">{label}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
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

        <Link
          href="/informacion"
          aria-current={pathname === '/informacion' ? 'page' : undefined}
          aria-label={t('emergencyNav')}
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          <Phone
            className={cn(
              'h-5 w-5',
              pathname === '/informacion' ? 'text-vigil-blue' : 'text-vigil-muted'
            )}
            aria-hidden
          />
          <span
            className={cn(
              pathname === '/informacion' ? 'font-medium text-vigil-blue' : 'text-vigil-muted'
            )}
          >
            {t('emergencyNav')}
          </span>
          {pathname === '/informacion' && (
            <span className="h-1 w-1 rounded-full bg-vigil-blue" aria-hidden />
          )}
        </Link>
      </nav>

      {/* Header-triggered menu sheet — grouped IA (prompt 72). Exposed via custom event from AppHeader. */}
      <button
        type="button"
        id="vigil-open-nav-menu"
        onClick={() => setMoreOpen(true)}
        className="sr-only"
        aria-haspopup="dialog"
        aria-expanded={moreOpen}
        aria-controls="more-nav-sheet"
      >
        {t('menu')}
      </button>

      {moreOpen && (
        <div className="fixed inset-0 z-[60]" onClick={closeMore} role="presentation">
          <div className="absolute inset-0 bg-black/40" />
          <div
            ref={sheetRef}
            id="more-nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t('menu')}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-card border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-lg lg:bottom-auto lg:left-auto lg:right-4 lg:top-16 lg:max-h-[80vh] lg:w-[380px] lg:rounded-card lg:border"
          >
            <div className="sticky top-0 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-vigil-ink">{t('menu')}</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMore}
                  aria-label={tCommon('close')}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {/* Full-site semantics stated, not implied (75 §4). */}
              <p className="text-[13px] text-vigil-muted">{t('menuFullSite')}</p>
            </div>
            <div className="space-y-4 p-3">
              <PwaInstallButton onInstalled={closeMore} />
              {orderedGroups.map((group) => (
                <div key={group.titleKey}>
                  <p className="px-2 text-[13px] font-semibold uppercase tracking-wide text-vigil-muted">
                    {t(group.titleKey)}
                  </p>
                  <ul className="mt-1">
                    {group.items.map((href) => {
                      const item = navItems.find((n) => n.href === href)
                      if (!item) return null
                      const Icon = item.icon
                      const active = pathname === href
                      const subtitleKey = `sub_${item.labelKey}` as const
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={closeMore}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-[44px] flex-col justify-center rounded-input px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
                              active
                                ? 'bg-vigil-blue-light font-medium text-vigil-blue'
                                : 'text-slate-700 hover:bg-vigil-cloud'
                            )}
                          >
                            <span className="flex items-center gap-3 text-[16px]">
                              <Icon className="h-5 w-5 shrink-0" aria-hidden />
                              {t(item.labelKey)}
                            </span>
                            <span className="pl-8 text-[13px] font-normal text-vigil-muted">
                              {t(subtitleKey)}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
