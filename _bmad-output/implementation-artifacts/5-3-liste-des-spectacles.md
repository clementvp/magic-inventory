# Story 5.3: Liste des Spectacles

Status: done

## Story

As a **utilisateur**,
I want **voir la liste de tous mes spectacles**,
so that **je peux accéder rapidement à mes prestations** (FR43).

## Acceptance Criteria

**Scenario 1 : Breadcrumb**
- **Given** je suis connecté
- **When** j'accède à /shows
- **Then** le breadcrumb affiche : Accueil > Spectacles

**Scenario 2 : Affichage en Cards**
- **Given** je suis sur /shows
- **When** la page se charge
- **Then** mes spectacles sont affichés en Cards Ant Design
- **And** chaque Card affiche : Nom (titre), Nombre de routines, Date de création

**Scenario 3 : Navigation vers le détail**
- **Given** les spectacles sont affichés
- **When** je clique sur une Card
- **Then** je suis redirigé vers /shows/:id (détail - Story 5.4)

**Scenario 4 : Pagination**
- **Given** j'ai beaucoup de spectacles
- **When** la liste se charge
- **Then** la pagination est active (12 spectacles par page)

**Scenario 5 : Empty state**
- **Given** j'ai 0 spectacle
- **When** j'accède à /shows
- **Then** un Empty Ant Design s'affiche
- **And** le message est : "Aucun spectacle créé"
- **And** un bouton "Créer votre premier spectacle" est visible

## Tasks / Subtasks

### Backend — Route (AC: 1–5)

- [x] Modifier `start/routes.ts` (AC: 1–5)
  - [x] Ajouter `'index'` dans le `.only([...])` du resource shows
  - [x] Route résultante : `GET /shows` → `ShowsController.index`

### Backend — Controller (AC: 2, 4, 5)

- [x] Modifier `app/controllers/shows_controller.ts` (AC: 2, 4, 5)
  - [x] Ajouter méthode `index()` : query Shows.where(user_id).withCount('routines').orderBy('created_at', 'desc')
  - [x] Mapper les résultats : `id`, `name`, `routinesCount` (via `$extras.routinesCount`), `createdAt`
  - [x] `return inertia.render('Shows/Index', { shows: [...] })`

### Frontend — Shows/Index.tsx (AC: 1–5)

- [x] Créer `inertia/pages/Shows/Index.tsx` (AC: 1–5)
  - [x] Interface `ShowItem { id: number; name: string; routinesCount: number; createdAt: string }`
  - [x] Interface `Props { shows: ShowItem[] }`
  - [x] Constante `PAGE_SIZE = 12`
  - [x] Pagination client-side avec `useState(1)` pour la page courante
  - [x] Cards Ant Design : `Card.Meta title={show.name}` avec description (routinesCount + date)
  - [x] `Card hoverable onClick={() => router.visit('/shows/' + show.id)}`
  - [x] Empty state si `shows.length === 0` : message "Aucun spectacle créé" + bouton "Créer votre premier spectacle"
  - [x] `Pagination hideOnSinglePage` avec `total={shows.length}` et onChange
  - [x] Bouton "Créer un spectacle" en toolbar (router.visit('/shows/create'))
  - [x] Breadcrumb : Accueil > Spectacles (menu sidebar déjà configuré dans Layout)

### Tests — Shows/Index.test.tsx (AC: 1–5)

- [x] Créer `inertia/pages/Shows/Index.test.tsx` (AC: 1–5)
  - [x] Mock `@inertiajs/react` : `router.visit`, `usePage` avec `url: '/shows'`
  - [x] Mock `~/components/Layout`
  - [x] `sampleShows` : 2 spectacles avec routinesCount > 0 et = 0
  - [x] `manyShows` : 13 spectacles pour tester la pagination
  - [x] Test : affiche le titre "Mes Spectacles"
  - [x] Test : affiche les noms des spectacles
  - [x] Test : affiche le nombre de routines (ex: "2 routine(s)")
  - [x] Test : affiche la date de création au format DD/MM/YYYY
  - [x] Test : clic sur une Card → `router.visit('/shows/1')`
  - [x] Test : Empty state quand `shows=[]` → "Aucun spectacle créé"
  - [x] Test : bouton "Créer votre premier spectacle" → `router.visit('/shows/create')`
  - [x] Test : pagination absente si ≤ 12 spectacles (`hideOnSinglePage`)
  - [x] Test : pagination présente avec 13+ spectacles
  - [x] Test : page 1 affiche 12 premiers, pas le 13ème
  - [x] Lancer `npx vitest run` — 0 régression (278 tests : 267 existants + 11 nouveaux)

## Dev Notes

### 🎯 Scope Story 5.3

Cette story ajoute la **page liste `/shows`** uniquement.
- Pas de recherche dans cette story → Story 5.8 (recherche globale dans le Header)
- Pas de page détail `/shows/:id` → Story 5.4
- L'infrastructure Shows (model, migrations, controller CRUD) est déjà complète

**Ce qui n'est PAS dans cette story :**
- Recherche / filtrage → Story 5.8
- Page détail → Story 5.4
- Checklist → Story 5.5

### 🔥 Backend — Route (ajouter 'index')

```typescript
// start/routes.ts — ligne ~53
// AVANT :
router.resource('shows', ShowsController).only(['create', 'store', 'edit', 'update'])

// APRÈS :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'edit', 'update'])
```

### 🔥 Backend — Controller index()

```typescript
// app/controllers/shows_controller.ts — ajouter AVANT create()
async index({ auth, inertia }: HttpContext) {
  const shows = await Show.query()
    .where('user_id', auth.user!.id)
    .withCount('routines')
    .orderBy('created_at', 'desc')

  return inertia.render('Shows/Index', {
    shows: shows.map((s) => ({
      id: s.id,
      name: s.name,
      routinesCount: Number(s.$extras.routinesCount),
      createdAt: s.createdAt.toISO(),
    })),
  })
}
```

**Point important :** `withCount('routines')` peuple `$extras.routinesCount` (string en Lucid — convertir avec `Number()`). La relation `routines` est déjà déclarée dans `Show` model.

### 🔥 Frontend — Shows/Index.tsx (pattern)

Modèle : `inertia/pages/Routines/Index.tsx` (pattern maître de la Story 4.4 + 4.8).

**Différences avec RoutinesIndex :**
- Pas de Drawer filtres (recherche en 5.8)
- Pas de searchInput/debounce (recherche en 5.8)
- Afficher `routinesCount` dans la Card description
- Breadcrumb dans le titre ou via composant

**Structure complète :**
```tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface ShowItem {
  id: number
  name: string
  routinesCount: number
  createdAt: string
}

interface Props {
  shows: ShowItem[]
}

const PAGE_SIZE = 12

export default function ShowsIndex({ shows }: Props) {
  const [page, setPage] = useState(1)
  const paginatedShows = shows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mes Spectacles</h1>
        <Button type="primary" onClick={() => router.visit('/shows/create')}>
          Créer un spectacle
        </Button>
      </div>

      {shows.length === 0 ? (
        <Empty description="Aucun spectacle créé">
          <Button type="primary" onClick={() => router.visit('/shows/create')}>
            Créer votre premier spectacle
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedShows.map((s) => (
              <Col xs={24} sm={12} md={8} key={s.id}>
                <Card hoverable onClick={() => router.visit(`/shows/${s.id}`)}>
                  <Card.Meta
                    title={s.name}
                    description={
                      <Space direction="vertical" size={4}>
                        <span>{s.routinesCount} routine(s)</span>
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(s.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={shows.length}
            onChange={(p) => setPage(p)}
            hideOnSinglePage
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </Layout>
  )
}
```

### 🔥 Tests — Shows/Index.test.tsx (pattern)

Modèle : `inertia/pages/Routines/Index.test.tsx`

```typescript
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShowsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/shows', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleShows = [
  { id: 1, name: 'Spectacle Cocktail', routinesCount: 2, createdAt: '2026-01-15T12:00:00.000Z' },
  { id: 2, name: 'Soirée Mariage', routinesCount: 0, createdAt: '2026-02-20T12:00:00.000Z' },
]

const manyShows = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  name: `Spectacle ${i + 1}`,
  routinesCount: i,
  createdAt: '2026-01-15T12:00:00.000Z',
}))

describe('ShowsIndex', () => {
  beforeEach(() => vi.clearAllMocks())

  // tests...
})
```

**Tests critiques à écrire :**
1. Affiche "Mes Spectacles" et bouton "Créer un spectacle"
2. Affiche les noms des spectacles dans des Cards
3. Affiche `routinesCount` : "3 routine(s)"
4. Affiche la date "15/01/2026"
5. Clic Card → `router.visit('/shows/1')`
6. Empty state : "Aucun spectacle créé" quand `shows=[]`
7. Bouton "Créer votre premier spectacle" → `router.visit('/shows/create')`
8. Pagination absente si ≤ 12 shows
9. Pagination présente avec 13+ shows (via `[class*="pagination"]`)
10. Page 1 : montre "Spectacle 1" et "Spectacle 12", pas "Spectacle 13"

### ⚠️ Points d'Attention

**1. `withCount` et `$extras`**
AdonisJS Lucid : `withCount('routines')` ajoute `routines_count` dans `$extras`. Accès via `s.$extras.routinesCount` (camelCase automatique). Convertir avec `Number()` car c'est une string SQL.

**2. Route `index` absente**
La route `/shows` (GET) n'existe pas encore — elle est bloquée par `.only(['create', 'store', 'edit', 'update'])`. Bien ajouter `'index'`.

**3. Navigation vers `/shows/:id`**
La route `/shows/:id` (GET, `show` action) n'est pas encore créée (Story 5.4). Le `router.visit('/shows/${s.id}')` sera fonctionnel une fois Story 5.4 implémentée. Implémenter quand même dans cette story — c'est le bon endroit.

**4. Pas de recherche dans cette story**
Story 5.8 précise "je vois la barre de recherche globale dans le Header" — la recherche shows sera dans le Header global (non locale). Ne pas ajouter de barre de recherche dans Index.tsx.

**5. Sidebar — menu "Spectacles"**
Vérifier si le lien "Spectacles" dans le menu sidebar (Layout) pointe déjà vers `/shows`. Si non, l'ajouter lors de l'implémentation. [Source: inertia/components/Layout.tsx]

**6. Nombre de routines = 0**
Afficher "0 routine(s)" normalement (pas de style spécial requis par les ACs).

**7. Tests — `manyShows` pagination**
Pattern identique à `RoutinesIndex.test.tsx` : `container.querySelector('[class*="pagination"]')` pour vérifier la présence de la pagination.

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
start/routes.ts                            ← Ajouter 'index' au resource shows
app/controllers/shows_controller.ts        ← Ajouter méthode index()

Fichiers à CRÉER :
inertia/pages/Shows/Index.tsx              ← Page liste spectacles
inertia/pages/Shows/Index.test.tsx         ← Tests unitaires

Fichiers NON modifiés :
app/models/show.ts                         ← Déjà complet (model + withCount compatible)
app/validators/                            ← Aucun validator pour index
database/migrations/                       ← Aucune migration nécessaire
inertia/pages/Shows/Edit.tsx              ← Pas touché
inertia/pages/Shows/Create.tsx            ← Pas touché
```

### 📝 Learnings des Stories Précédentes

**Story 5.1 (infrastructure shows — pattern maître) :**
- Route resource shows : `.only(['create', 'store', 'edit', 'update'])` → ajouter `'index'`
- Controller : `import type { HttpContext }` déjà en haut du fichier
- Flash messages via `session.flash()`, affiché par `Layout.tsx` — PAS `message.success()` dans le controller
- Relation `routines` déclarée dans `Show` model comme `ManyToMany` via `routine_show`

**Story 5.2 (notes spectacle) :**
- `Show` model : `id`, `name`, `notes`, `createdAt`, `updatedAt`, `userId`, `routines`
- 267 tests, 0 régression attendue

**Story 4.4 (liste routines — pattern Card list) :**
- Pattern complet Cards Ant Design avec pagination dans `RoutinesIndex.tsx`
- Pattern tests `Index.test.tsx` avec mock Layout + router
- `dayjs(r.createdAt).format('DD/MM/YYYY')` pour dates

**Story 4.8 (recherche routines) :**
- Pas de recherche dans cette story (5.3 est plus simple que 4.8)

**Convention tests actuels :**
- 267 tests existants (après Story 5.2)
- `vi.clearAllMocks()` dans `beforeEach`
- Mock complet `@inertiajs/react`
- `npx vitest run` pour vérifier

### Project Structure Notes

- Controller : `app/controllers/shows_controller.ts` (modifier, pas créer)
- Frontend : `inertia/pages/Shows/Index.tsx` (créer)
- Tests co-localisés : `inertia/pages/Shows/Index.test.tsx`
- Route ajoutée dans : `start/routes.ts` (ligne ~53)

### References

- Pattern Controller index (routines) : [Source: app/controllers/routines_controller.ts#index]
- Pattern RoutinesIndex Cards : [Source: inertia/pages/Routines/Index.tsx]
- Pattern tests RoutinesIndex : [Source: inertia/pages/Routines/Index.test.tsx]
- Routes shows actuelles : [Source: start/routes.ts#53-55]
- Show model avec withCount : [Source: app/models/show.ts]
- Epic 5 Story 5.3 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]
- Story 5.2 (learnings) : [Source: _bmad-output/implementation-artifacts/5-2-editeur-de-notes-pour-spectacles.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun problème rencontré — implémentation directe selon les specs.

### Completion Notes List

- Route `GET /shows` ajoutée via `'index'` dans `.only([...])` du resource shows
- Méthode `index()` ajoutée dans ShowsController : query avec `withCount('routines')`, `Number()` pour convertir `$extras.routinesCount`
- Page `Shows/Index.tsx` créée : Cards Ant Design, pagination client-side (PAGE_SIZE=12), empty state, bouton toolbar
- Breadcrumb fonctionnel via la sidebar Layout (lien "Spectacles" → `/shows` déjà configuré)
- 11 tests ajoutés : titre, noms, routinesCount, date format, clic card, empty state, bouton empty, pagination absente/présente/page1
- 279 tests totaux, 0 régression

### File List

start/routes.ts
app/controllers/shows_controller.ts
inertia/pages/Shows/Index.tsx
inertia/pages/Shows/Index.test.tsx

## Change Log

- 2026-03-22 : Implémentation Story 5.3 — Page liste spectacles avec Cards, pagination client-side, empty state, route GET /shows et controller index()
- 2026-03-22 : Code Review fixes — M1: null guard `toISO() ?? ''`, M2: test clic toolbar button, M3: `.limit(200)` sur query index, L1: `data-testid` sur cards (remplace `.ant-card`), L2: `tabIndex/role/aria-label/onKeyDown` pour accessibilité clavier, L3: fixture sampleShows corrigée (routinesCount: 2)
