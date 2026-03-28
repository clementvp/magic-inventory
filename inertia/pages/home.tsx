import { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'

// ─────────────────────────────────────────────────────────────────────────────
// Screenshot placeholders
// Replace each src="" with the actual screenshot path once taken.
//
// SCREENSHOT GUIDE:
//   HERO_SHOT      → /images/landing/screenshot-dashboard.png
//                    Page: /dashboard — Vue tableau de bord avec les 5 stat cards
//                    Conseil: avoir quelques données existantes, fenêtre pleine
//
//   MATERIALS_SHOT → /images/landing/screenshot-materials.png
//                    Page: /materials — Vue liste, avec plusieurs cartes visibles
//                    et leurs tags catégorie/type colorés
//
//   ROUTINES_SHOT  → /images/landing/screenshot-routine.png
//                    Page: /routines/:id — Vue détail d'une routine
//                    avec la liste de matériels attachés
//
//   SHOWS_SHOT     → /images/landing/screenshot-checklist.png
//                    Page: /shows/:id/checklist — Vue checklist d'un spectacle
//                    avec des cases à cocher et les routines listées
// ─────────────────────────────────────────────────────────────────────────────

const HERO_SHOT = ''
const MATERIALS_SHOT = ''
const ROUTINES_SHOT = ''
const SHOWS_SHOT = ''

// ─────────────────────────────────────────────────────────────────────────────

function ScreenshotFrame({
  src,
  alt,
  label,
  height = 340,
}: {
  src: string
  alt: string
  label: string
  height?: number
}) {
  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(88,59,0,0.18)',
        border: '1px solid #dac2b6',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: '#f0ebe8',
          padding: '9px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          borderBottom: '1px solid #dac2b6',
        }}
      >
        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
            <div
              key={i}
              style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: '4px',
            padding: '3px 10px',
            fontSize: '10px',
            color: '#a8a29e',
            textAlign: 'center',
            maxWidth: '240px',
            margin: '0 auto',
          }}
        >
          magic-inventory.fr
        </div>
      </div>

      {/* Screenshot or placeholder */}
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ display: 'block', width: '100%', height: `${height}px`, objectFit: 'cover', objectPosition: 'top' }}
        />
      ) : (
        <div
          style={{
            height: `${height}px`,
            background: 'linear-gradient(135deg, #f6f3f2 0%, #fef9eb 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '32px', color: '#dac2b6' }}
          >
            image
          </span>
          <span style={{ fontSize: '12px', color: '#a8a29e', fontWeight: 500 }}>
            {label}
          </span>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title="Magic Inventory — Gérez votre magie" />

      <div style={{ fontFamily: "'Manrope', sans-serif", color: '#1b1c1c', overflowX: 'hidden' }}>

        {/* ══════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════ */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            transition: 'background 0.25s, box-shadow 0.25s',
            background: scrolled ? 'rgba(252,249,248,0.94)' : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
            boxShadow: scrolled ? '0 1px 0 #dac2b6' : 'none',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <a href="#top" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#d97706', fontSize: '18px', lineHeight: 1 }}>✦</span>
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontWeight: 600, fontSize: '18px', color: '#1b1c1c' }}>
                Magic Inventory
              </span>
            </a>

            <div className="hidden md:flex" style={{ gap: '32px', alignItems: 'center' }}>
              {[
                { label: 'Fonctionnalités', href: '#features' },
                { label: 'Comment ça marche', href: '#how' },
                { label: 'Aperçu', href: '#preview' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ fontSize: '14px', color: '#78716c', textDecoration: 'none', fontWeight: 500 }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link href="/login" style={{ fontSize: '14px', color: '#583b00', textDecoration: 'none', fontWeight: 600 }}>
                Se connecter
              </Link>
              <Link
                href="/register"
                style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(88,59,0,0.28)',
                }}
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </nav>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section
          id="top"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #fcf9f8 0%, #fef9eb 55%, #fcf9f8 100%)',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '64px',
          }}
        >
          {/* Dot grid background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, #dac2b6 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.4,
            }}
          />
          {/* Glow radial */}
          <div
            style={{
              position: 'absolute',
              top: '35%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1000px',
              height: '800px',
              background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.09) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              padding: '80px 32px 64px',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 16px',
                borderRadius: '999px',
                border: '1px solid #dac2b6',
                background: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#78716c',
                marginBottom: '36px',
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ color: '#d97706' }}>✦</span>
              L'outil des artistes de magie
            </div>

            <h1
              style={{
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(44px, 7vw, 80px)',
                fontWeight: 600,
                lineHeight: 1.05,
                color: '#1b1c1c',
                maxWidth: '900px',
                marginBottom: '28px',
                letterSpacing: '-0.025em',
              }}
            >
              Vos accessoires, routines
              <br />
              et spectacles —
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #583b00 0%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                tout sous contrôle.
              </span>
            </h1>

            <p
              style={{
                fontSize: '18px',
                color: '#78716c',
                lineHeight: 1.75,
                maxWidth: '560px',
                marginBottom: '44px',
              }}
            >
              Magic Inventory est l'application pensée pour les magiciens professionnels.
              Inventoriez chaque prop, construisez vos numéros, planifiez vos shows.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '15px 32px',
                  background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(88,59,0,0.32)',
                }}
              >
                Commencer gratuitement
                <span className="material-symbols-outlined" style={{ fontSize: '18px', lineHeight: 1 }}>arrow_forward</span>
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '15px 32px',
                  border: '1.5px solid #dac2b6',
                  color: '#583b00',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: '#fff',
                }}
              >
                Se connecter
              </Link>
            </div>

            {/* Hero screenshot */}
            <div style={{ width: '100%', maxWidth: '900px', marginTop: '64px' }}>
              <ScreenshotFrame
                src={HERO_SHOT}
                alt="Tableau de bord Magic Inventory"
                label="Capture : /dashboard — Tableau de bord"
                height={400}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════ */}
        <section
          style={{
            background: '#1c1917',
            padding: '40px 32px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              { value: '5', label: 'modules intégrés', icon: 'widgets' },
              { value: '∞', label: 'matériels cataloguables', icon: 'all_inclusive' },
              { value: '100%', label: 'privé et personnel', icon: 'lock' },
              { value: '0€', label: 'pour toujours', icon: 'star' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: '#d97706', display: 'block', marginBottom: '8px', fontVariationSettings: "'FILL' 1" }}
                >
                  {stat.icon}
                </span>
                <div
                  style={{
                    fontFamily: "'Newsreader', serif",
                    fontStyle: 'italic',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#fafaf9',
                    lineHeight: 1,
                    marginBottom: '4px',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE: MATÉRIELS
        ══════════════════════════════════════════ */}
        <section
          id="features"
          style={{ background: '#fcf9f8', padding: '96px 32px' }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Text */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}
                >
                  inventory_2
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Matériels
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 600,
                  color: '#1b1c1c',
                  marginBottom: '20px',
                  lineHeight: 1.15,
                }}
              >
                Chaque accessoire à sa place, rangé et retrouvable.
              </h2>
              <p style={{ fontSize: '16px', color: '#78716c', lineHeight: 1.75, marginBottom: '28px' }}>
                Ajoutez vos props un à un : cordes, cartes, baguettes, foulards...
                Associez-leur une catégorie, un type et un emplacement de rangement
                pour ne plus jamais les chercher.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Catégories et types personnalisables',
                  'Emplacements de rangement dédiés',
                  'Vue liste ou grille de cartes',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#57534e' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: '#d97706', flexShrink: 0, fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Screenshot */}
            <ScreenshotFrame
              src={MATERIALS_SHOT}
              alt="Page Matériels"
              label="Capture : /materials — Liste des matériels"
              height={320}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE: ROUTINES
        ══════════════════════════════════════════ */}
        <section style={{ background: '#f6f3f2', padding: '96px 32px' }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Screenshot first on desktop */}
            <div className="order-last md:order-first">
              <ScreenshotFrame
                src={ROUTINES_SHOT}
                alt="Page Routines"
                label="Capture : /routines/:id — Détail d'une routine"
                height={320}
              />
            </div>

            {/* Text */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}
                >
                  auto_stories
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Routines
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 600,
                  color: '#1b1c1c',
                  marginBottom: '20px',
                  lineHeight: 1.15,
                }}
              >
                Composez vos numéros avec les bons accessoires.
              </h2>
              <p style={{ fontSize: '16px', color: '#78716c', lineHeight: 1.75, marginBottom: '28px' }}>
                Créez une routine pour chaque tour ou numéro de votre répertoire.
                Sélectionnez les matériels nécessaires et gardez une trace de tout ce qu'il vous faut pour performer.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Attachez les matériels nécessaires',
                  'Ordonnez les étapes de chaque numéro',
                  'Retrouvez en un clic ce qu'il faut préparer',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#57534e' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: '#d97706', flexShrink: 0, fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURE: SPECTACLES & CHECKLIST
        ══════════════════════════════════════════ */}
        <section style={{ background: '#1c1917', padding: '96px 32px' }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Text */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: 'rgba(217,119,6,0.12)',
                  border: '1px solid rgba(217,119,6,0.25)',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}
                >
                  theater_comedy
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Spectacles
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  fontWeight: 600,
                  color: '#fafaf9',
                  marginBottom: '20px',
                  lineHeight: 1.15,
                }}
              >
                Planifiez chaque show. Rien n'est laissé au hasard.
              </h2>
              <p style={{ fontSize: '16px', color: '#a8a29e', lineHeight: 1.75, marginBottom: '28px' }}>
                Assemblez vos routines dans l'ordre du spectacle, puis utilisez la checklist
                interactive pour vérifier chaque accessoire avant de monter sur scène.
                Terminé la valise oubliée.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Ordonnez les routines par drag & drop',
                  'Checklist interactive le soir du show',
                  'Historique de vos spectacles passés',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#a8a29e' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', color: '#d97706', flexShrink: 0, fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Screenshot */}
            <ScreenshotFrame
              src={SHOWS_SHOT}
              alt="Checklist spectacle"
              label="Capture : /shows/:id/checklist — Checklist"
              height={320}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEATURES GRID (Notes + vue d'ensemble)
        ══════════════════════════════════════════ */}
        <section style={{ background: '#fcf9f8', padding: '96px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Et aussi
              </p>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 600,
                  color: '#1b1c1c',
                }}
              >
                Tout ce qu'il faut pour performer sereinement
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
              }}
            >
              {[
                {
                  icon: 'sticky_note_2',
                  title: 'Notes',
                  description: 'Capturez vos idées, retours de répétition et observations sur chaque numéro pour progresser.',
                },
                {
                  icon: 'category',
                  title: 'Catégories & Types',
                  description: 'Organisez votre inventaire avec vos propres catégories et types de matériels.',
                },
                {
                  icon: 'warehouse',
                  title: 'Emplacements',
                  description: 'Définissez où chaque accessoire est rangé : flight case, sac, meuble... et retrouvez-le en secondes.',
                },
                {
                  icon: 'import_export',
                  title: 'Export & Import',
                  description: 'Exportez toute votre base de données en JSON pour la sauvegarder ou la migrer.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '28px',
                    border: '1px solid #dac2b6',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '18px',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '22px', color: '#d97706', fontVariationSettings: "'FILL' 1" }}
                    >
                      {feature.icon}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Newsreader', serif",
                      fontStyle: 'italic',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1b1c1c',
                      marginBottom: '10px',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#78716c', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section id="how" style={{ background: '#f6f3f2', padding: '96px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Prise en main
              </p>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 600,
                  color: '#1b1c1c',
                  marginBottom: '16px',
                }}
              >
                Trois étapes, et vous êtes prêt
              </h2>
              <p style={{ fontSize: '16px', color: '#78716c', maxWidth: '440px', margin: '0 auto' }}>
                Magic Inventory est conçu pour être pris en main en quelques minutes.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
              }}
            >
              {[
                {
                  number: '01',
                  title: 'Inventoriez vos matériels',
                  description: 'Ajoutez chaque accessoire avec sa catégorie, son type et son emplacement de rangement. Constituez votre catalogue complet.',
                  icon: 'inventory_2',
                },
                {
                  number: '02',
                  title: 'Composez vos routines',
                  description: 'Pour chaque numéro, sélectionnez les matériels requis. Vos routines deviennent des fiches de préparation complètes.',
                  icon: 'auto_stories',
                },
                {
                  number: '03',
                  title: 'Préparez vos spectacles',
                  description: 'Assemblez vos routines dans l\'ordre du show. Utilisez la checklist le soir J pour ne rien oublier.',
                  icon: 'theater_comedy',
                },
              ].map((step, index) => (
                <div
                  key={step.number}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '36px 32px',
                    border: '1px solid #dac2b6',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Large background number */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '16px',
                      fontFamily: "'Newsreader', serif",
                      fontStyle: 'italic',
                      fontSize: '100px',
                      fontWeight: 800,
                      color: '#f6f3f2',
                      lineHeight: 1,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {step.number}
                  </div>

                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      boxShadow: '0 4px 12px rgba(88,59,0,0.25)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '22px', color: '#fff', fontVariationSettings: "'FILL' 1" }}
                    >
                      {step.icon}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Newsreader', serif",
                      fontStyle: 'italic',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: '#1b1c1c',
                      marginBottom: '12px',
                      position: 'relative',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#78716c', lineHeight: 1.75, position: 'relative' }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            APP PREVIEW
        ══════════════════════════════════════════ */}
        <section id="preview" style={{ background: '#fff', padding: '96px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Interface
              </p>
              <h2
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 600,
                  color: '#1b1c1c',
                  marginBottom: '16px',
                }}
              >
                Une interface pensée pour les pros
              </h2>
              <p style={{ fontSize: '16px', color: '#78716c', maxWidth: '480px', margin: '0 auto' }}>
                Claire, rapide et organisée. Tout est accessible en un clic depuis la barre latérale.
              </p>
            </div>

            {/* Dashboard mockup */}
            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(88,59,0,0.14)',
                border: '1px solid #dac2b6',
                maxWidth: '960px',
                margin: '0 auto',
              }}
            >
              {/* Browser chrome */}
              <div
                style={{
                  background: '#f0ebe8',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #dac2b6',
                }}
              >
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#fff',
                    borderRadius: '4px',
                    padding: '3px 10px',
                    fontSize: '10px',
                    color: '#a8a29e',
                    textAlign: 'center',
                    maxWidth: '260px',
                    margin: '0 auto',
                  }}
                >
                  magic-inventory.fr/dashboard
                </div>
              </div>

              {/* App layout */}
              <div style={{ display: 'flex', height: '440px', background: '#fcf9f8' }}>

                {/* Sidebar */}
                <div
                  style={{
                    width: '210px',
                    flexShrink: 0,
                    background: '#1c1917',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ padding: '16px', borderBottom: '1px solid #292524' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ color: '#d97706', fontSize: '12px' }}>✦</span>
                      <span style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', fontSize: '13px', color: '#fafaf9', fontWeight: 600 }}>
                        Magic Inventory
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '8px 0', flex: 1 }}>
                    {[
                      { icon: 'dashboard', label: 'Tableau de bord', active: true },
                      { icon: 'inventory_2', label: 'Matériels', active: false },
                      { icon: 'auto_stories', label: 'Routines', active: false },
                      { icon: 'theater_comedy', label: 'Spectacles', active: false },
                      { icon: 'sticky_note_2', label: 'Notes', active: false },
                      { icon: 'category', label: 'Catégories', active: false },
                    ].map((nav) => (
                      <div
                        key={nav.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderLeft: nav.active ? '2px solid #d97706' : '2px solid transparent',
                          background: nav.active ? 'rgba(217,119,6,0.08)' : 'transparent',
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '15px',
                            color: nav.active ? '#fbbf24' : '#57534e',
                            fontVariationSettings: nav.active ? "'FILL' 1" : "'FILL' 0",
                            lineHeight: 1,
                          }}
                        >
                          {nav.icon}
                        </span>
                        <span style={{ fontSize: '12px', color: nav.active ? '#fbbf24' : '#78716c', fontWeight: nav.active ? 600 : 400 }}>
                          {nav.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Add material button */}
                  <div style={{ padding: '12px' }}>
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #583b00 0%, #765100 100%)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(88,59,0,0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff', lineHeight: 1 }}>add</span>
                      <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>Ajouter un matériel</span>
                    </div>
                  </div>
                </div>

                {/* Main */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Header */}
                  <div
                    style={{
                      padding: '12px 24px',
                      borderBottom: '1px solid #e7e5e4',
                      background: 'rgba(252,249,248,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#a8a29e' }}>Accueil</span>
                    <span style={{ fontSize: '11px', color: '#d5d0cd' }}>/</span>
                    <span style={{ fontSize: '11px', color: '#57534e', fontWeight: 500 }}>Tableau de bord</span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '24px', overflow: 'hidden', flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "'Newsreader', serif",
                        fontStyle: 'italic',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#1b1c1c',
                        marginBottom: '20px',
                      }}
                    >
                      Tableau de bord
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      {[
                        { icon: 'inventory_2', label: 'Matériels', value: '42' },
                        { icon: 'auto_stories', label: 'Routines', value: '8' },
                        { icon: 'theater_comedy', label: 'Spectacles', value: '3' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: '#fff',
                            borderRadius: '8px',
                            padding: '14px',
                            border: '1px solid #dac2b6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '22px', color: '#d97706', fontVariationSettings: "'FILL' 1", lineHeight: 1, flexShrink: 0 }}
                          >
                            {stat.icon}
                          </span>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1b1c1c', lineHeight: 1.1 }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {[
                        { icon: 'category', label: 'Catégories', value: '6' },
                        { icon: 'sticky_note_2', label: 'Notes', value: '15' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: '#fff',
                            borderRadius: '8px',
                            padding: '14px',
                            border: '1px solid #dac2b6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '22px', color: '#d97706', fontVariationSettings: "'FILL' 1", lineHeight: 1, flexShrink: 0 }}
                          >
                            {stat.icon}
                          </span>
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1b1c1c', lineHeight: 1.1 }}>{stat.value}</div>
                            <div style={{ fontSize: '10px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════ */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            padding: '112px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(217,119,6,0.08) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '36px', color: '#d97706', marginBottom: '28px', lineHeight: 1 }}>✦</div>
            <h2
              style={{
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 600,
                color: '#fafaf9',
                marginBottom: '20px',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Prêt à organiser votre magie ?
            </h2>
            <p style={{ fontSize: '17px', color: '#a8a29e', marginBottom: '48px', lineHeight: 1.75 }}>
              Rejoignez les artistes qui gèrent leur inventaire avec précision.
              <br />
              Gratuit, sans carte de crédit, pour toujours.
            </p>
            <Link
              href="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 6px 28px rgba(217,119,6,0.4)',
              }}
            >
              Créer mon compte gratuitement
              <span className="material-symbols-outlined" style={{ fontSize: '22px', lineHeight: 1 }}>arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <footer style={{ background: '#0c0a09', padding: '32px' }}>
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#d97706', fontSize: '14px' }}>✦</span>
              <span
                style={{
                  fontFamily: "'Newsreader', serif",
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#57534e',
                }}
              >
                Magic Inventory
              </span>
              <span style={{ fontSize: '12px', color: '#3c3836', marginLeft: '8px' }}>
                — Votre assistant pour artistes de magie
              </span>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link href="/login" style={{ fontSize: '13px', color: '#44403c', textDecoration: 'none' }}>
                Se connecter
              </Link>
              <Link href="/register" style={{ fontSize: '13px', color: '#44403c', textDecoration: 'none' }}>
                S'inscrire
              </Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
