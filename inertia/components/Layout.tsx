import { ReactNode } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import FlashMessages from './FlashMessages'
import Icon from './Icon'

interface LayoutProps {
  children: ReactNode
  title?: string
  breadcrumbLabels?: Record<string, string>
}

const NAV_ITEMS = [
  { key: 'categories',       href: '/categories',        icon: 'category',       label: 'Catégories' },
  { key: 'types',            href: '/types',             icon: 'style',          label: 'Types' },
  { key: 'storage-locations',href: '/storage-locations', icon: 'inventory_2',    label: 'Stockage' },
  { key: 'materials',        href: '/materials',         icon: 'magic_button',   label: 'Inventaire' },
  { key: 'routines',         href: '/routines',          icon: 'auto_fix_high',  label: 'Routines' },
  { key: 'shows',            href: '/shows',             icon: 'theater_comedy', label: 'Spectacles' },
  { key: 'notes',            href: '/notes',             icon: 'description',    label: 'Notes' },
  { key: 'profile',          href: '/profile',           icon: 'person',         label: 'Profil' },
]

const LABEL_MAP: Record<string, string> = {
  categories: 'Catégories',
  types: 'Types',
  'storage-locations': 'Stockage',
  materials: 'Inventaire',
  routines: 'Routines',
  shows: 'Spectacles',
  notes: 'Notes',
  dashboard: 'Accueil',
  profile: 'Profil',
}

export default function Layout({ children, title, breadcrumbLabels }: LayoutProps) {
  const { url } = usePage()

  const getSelectedKey = (): string => {
    if (url.startsWith('/storage-locations')) return 'storage-locations'
    if (url.startsWith('/types')) return 'types'
    if (url.startsWith('/categories')) return 'categories'
    if (url.startsWith('/materials')) return 'materials'
    if (url.startsWith('/routines')) return 'routines'
    if (url.startsWith('/shows')) return 'shows'
    if (url.startsWith('/notes')) return 'notes'
    if (url.startsWith('/profile')) return 'profile'
    return 'dashboard'
  }

  const segments = url.split('/').filter(Boolean)

  const pageTitle = title ?? (() => {
    const last = segments[segments.length - 1]
    return (breadcrumbLabels?.[last]) ?? LABEL_MAP[last] ?? LABEL_MAP[segments[0]] ?? last ?? 'Arcane Ledger'
  })()

  const buildBreadcrumbs = () => {
    const items: { label: string; href?: string }[] = []
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const isLast = i === segments.length - 1
      const href = `/${segments.slice(0, i + 1).join('/')}`
      const label = isLast
        ? pageTitle
        : (breadcrumbLabels?.[seg]) ?? LABEL_MAP[seg] ?? seg
      items.push({ label, href: isLast ? undefined : href })
    }
    return items
  }

  const breadcrumbs = buildBreadcrumbs()

  const activeKey = getSelectedKey()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '"Manrope", sans-serif' }}>
      <Head title={pageTitle} />
      <FlashMessages />

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: 256,
        zIndex: 40,
        backgroundColor: '#1c1917',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div>
          <div style={{ padding: '32px 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              backgroundColor: '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="auto_fix_high" style={{ color: 'white', fontSize: 20 }} />
            </div>
            <div>
              <h1 style={{
                fontFamily: '"Newsreader", serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#f59e0b',
                lineHeight: 1,
                margin: 0,
                fontWeight: 400,
              }}>
                Arcane Ledger
              </h1>
              <p style={{
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#78716c',
                margin: 0,
              }}>
                Master Magician
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
            {NAV_ITEMS.map(item => {
              const isActive = activeKey === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    color: isActive ? '#fbbf24' : '#a8a29e',
                    backgroundColor: isActive ? '#292524' : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#d97706' : 'transparent'}`,
                    textDecoration: 'none',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon
                    name={item.icon}
                    filled={isActive}
                    style={{ fontSize: 18, flexShrink: 0 }}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div style={{ padding: '0 16px 24px' }}>
          <Link
            href="/materials/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(88, 59, 0, 0.35)',
              marginBottom: 4,
            }}
          >
            <Icon name="add" style={{ fontSize: 16 }} />
            Ajouter un matériel
          </Link>

          <div style={{ borderTop: '1px solid rgba(41,37,36,0.5)', marginTop: 12, paddingTop: 8 }}>
            <form method="POST" action="/logout">
              <button
                type="submit"
                aria-label="Se déconnecter"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '8px',
                  color: '#78716c',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: '"Manrope", sans-serif',
                }}
              >
                <Icon name="logout" style={{ fontSize: 16 }} />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{
        marginLeft: 256,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fcf9f8',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          padding: '0 40px',
          backgroundColor: 'rgba(252, 249, 248, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(218, 194, 182, 0.2)',
        }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <Link href="/dashboard" style={{ color: '#a8a29e', textDecoration: 'none' }}>
              Dashboard
            </Link>
            {breadcrumbs.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="chevron_right" style={{ fontSize: 16, color: '#d6d3d1' }} />
                {item.href
                  ? <Link href={item.href} style={{ color: '#a8a29e', textDecoration: 'none' }}>{item.label}</Link>
                  : <span style={{ color: '#7c2d12', fontWeight: 600 }}>{item.label}</span>
                }
              </span>
            ))}
          </nav>

        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 40 }}>
          {children}
        </main>

      </div>
    </div>
  )
}
