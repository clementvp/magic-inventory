# Story 4.4: Liste des Routines

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **voir la liste de toutes mes routines**,
so that **je peux accéder rapidement à n'importe quelle routine** (FR35).

## Acceptance Criteria

**Scenario 1 : Breadcrumb de la page**
- **Given** je suis connecté
- **When** j'accède à /routines
- **Then** le breadcrumb affiche : Accueil > Routines
- **Note** : Le breadcrumb est géré automatiquement par `Layout.tsx` via `generateBreadcrumbs()` basé sur l'URL — aucun code spécifique requis

**Scenario 2 : Affichage des routines en Cards**
- **Given** je suis sur /routines
- **When** la page se charge
- **Then** mes routines sont affichées en Cards Ant Design (vue par défaut)
- **And** chaque Card affiche : Nom (titre), Catégorie(s) (Tags), Date de création (format DD/MM/YYYY)

**Scenario 3 : Navigation vers le détail d'une routine**
- **Given** les routines sont affichées
- **When** je clique sur une Card
- **Then** je suis redirigé vers /routines/:id (détail - Story 4.5)

**Scenario 4 : Pagination**
- **Given** j'ai plus de 12 routines
- **When** la liste se charge
- **Then** la pagination est active (12 routines par page)
- **And** la pagination se masque s'il n'y a qu'une seule page (hideOnSinglePage)

**Scenario 5 : État vide — aucune routine**
- **Given** j'ai 0 routine
- **When** j'accède à /routines
- **Then** un `Empty` Ant Design s'affiche
- **And** le message est : "Aucune routine créée"
- **And** un bouton "Créer votre première routine" est visible → redirige vers /routines/create

**Scenario 6 : Bouton de création**
- **Given** je suis sur /routines
- **When** je clique sur "Créer une routine" (bouton en haut à droite)
- **Then** je suis redirigé vers /routines/create (Story 4.1)

## Tasks / Subtasks

### Backend — Controller `index()` (AC: 1, 2, 4, 5)

- [x] Modifier `app/controllers/routines_controller.ts` — ajouter méthode `index()`
  - [x] `const routines = await Routine.query().where('user_id', auth.user!.id).preload('categories').orderBy('created_at', 'desc')`
  - [x] Retourner `inertia.render('Routines/Index', { routines: [...] })`
  - [x] Sérialiser chaque routine : `{ id, name, categories: [{ id, name }], createdAt: routine.createdAt.toISO() }`

### Backend — Routes (AC: 1)

- [x] Modifier `start/routes.ts`
  - [x] Ajouter `'index'` à `.only([...])` : `router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'edit', 'update'])`

### Frontend — Page `Index.tsx` (AC: 1, 2, 3, 4, 5, 6)

- [x] Créer `inertia/pages/Routines/Index.tsx`
  - [x] Imports : `{ router }` de `@inertiajs/react`, `{ Button, Card, Col, Empty, Pagination, Row, Space, Tag }` de `antd`, `dayjs` pour dates, `Layout` de `~/components/Layout`
  - [x] Interface `RoutineItem` : `{ id: number, name: string, categories: { id: number, name: string }[], createdAt: string }`
  - [x] Interface `Props` : `{ routines: RoutineItem[] }`
  - [x] State : `const [page, setPage] = useState(1)` pour la pagination
  - [x] Constante `PAGE_SIZE = 12`
  - [x] `paginatedRoutines = routines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)`
  - [x] Header : titre "Mes Routines" + bouton "Créer une routine" (`router.visit('/routines/create')`)
  - [x] Empty state si `routines.length === 0` : `<Empty description="Aucune routine créée"><Button type="primary" onClick={() => router.visit('/routines/create')}>Créer votre première routine</Button></Empty>`
  - [x] `<Row gutter={[16, 16]}>` avec `<Col xs={24} sm={12} md={8}>` par routine
  - [x] Chaque `<Card hoverable onClick={() => router.visit('/routines/${r.id}')}>` avec `<Card.Meta title={r.name} description={...} />`
  - [x] Description de la Card : catégories en `<Tag>`, date de création (`dayjs(r.createdAt).format('DD/MM/YYYY')`)
  - [x] `<Pagination>` : `current={page}`, `pageSize={PAGE_SIZE}`, `total={routines.length}`, `onChange={setPage}`, `hideOnSinglePage`, `style={{ textAlign: 'center', marginTop: 16 }}`

### Frontend — Tests `Index.test.tsx` (AC: 1–6)

- [x] Créer `inertia/pages/Routines/Index.test.tsx`
  - [x] Setup : `vi.mock('~/components/Layout', ...)`, `vi.mock('@inertiajs/react', () => ({ router: { visit: vi.fn() }, usePage: () => ({ url: '/routines', props: {} }) }))`
  - [x] Données de test : 2 routines avec catégories, date createdAt en ISO string
  - [x] Test : titre "Mes Routines" visible (AC: 2)
  - [x] Test : bouton "Créer une routine" visible (AC: 6)
  - [x] Test : clic "Créer une routine" appelle `router.visit('/routines/create')` (AC: 6)
  - [x] Test : nom de chaque routine affiché (AC: 2)
  - [x] Test : catégories affichées en Tags (AC: 2)
  - [x] Test : date de création affichée au format DD/MM/YYYY (AC: 2)
  - [x] Test : clic sur une Card appelle `router.visit('/routines/1')` (AC: 3)
  - [x] Test : Empty state "Aucune routine créée" si `routines: []` (AC: 5)
  - [x] Test : bouton "Créer votre première routine" visible quand routines vides (AC: 5)
  - [x] Test : clic "Créer votre première routine" appelle `router.visit('/routines/create')` (AC: 5)
  - [x] Test : Pagination absente si < 12 routines (AC: 4, `hideOnSinglePage`)
  - [x] Lancer `npx vitest run` — 0 régression (cible : 196+ tests → 205 tests)

## Dev Notes

### 🎯 Contexte — Ce que Story 4.4 ajoute

Story 4.4 crée la page `/routines` (liste de toutes les routines) qui était manquante. Les stories 4.1–4.3 ont créé les routes `/routines/create`, `/routines/:id/edit`, mais pas `/routines`. Story 4.5 (Show) n'existe pas encore — la navigation via les Cards vers `/routines/:id` sera fonctionnelle après Story 4.5.

**Ce que Story 4.4 N'INCLUT PAS :**
- Pas de recherche / filtrage (c'est Story 4.8)
- Pas de vue Table (les routines n'ont qu'une vue Cards selon l'AC)
- Pas de switcher Table/Cards (contrairement à Materials/Index.tsx)
- La route `/routines/:id` (Show) n'existe pas encore (Story 4.5) — le clic sur une Card naviguera vers une 404 jusqu'à Story 4.5

### 🏗️ Backend — Controller `index()`

```typescript
// app/controllers/routines_controller.ts — ajouter en premier :
async index({ auth, inertia }: HttpContext) {
  const routines = await Routine.query()
    .where('user_id', auth.user!.id)
    .preload('categories')
    .orderBy('created_at', 'desc')

  return inertia.render('Routines/Index', {
    routines: routines.map((r) => ({
      id: r.id,
      name: r.name,
      categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
      createdAt: r.createdAt.toISO(),
    })),
  })
}
```

**Note** : `r.createdAt` est un `DateTime` Luxon (`@column.dateTime` dans le modèle). Utiliser `.toISO()` pour sérialisation vers le frontend — même pattern que Materials.

### 🏗️ Routes — Ajout de `index`

```typescript
// start/routes.ts — AVANT :
router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])

// APRÈS :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'edit', 'update'])
```

⚠️ **Ordre des routes** : Ne pas toucher aux routes custom `attachMaterial` / `detachMaterial` qui suivent — elles restent inchangées.

### 🏗️ Frontend — Index.tsx

```tsx
// inertia/pages/Routines/Index.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
  createdAt: string
}

interface Props {
  routines: RoutineItem[]
}

const PAGE_SIZE = 12

export default function RoutinesIndex({ routines }: Props) {
  const [page, setPage] = useState(1)

  const paginatedRoutines = routines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
      >
        <h1 style={{ margin: 0 }}>Mes Routines</h1>
        <Button type="primary" onClick={() => router.visit('/routines/create')}>
          Créer une routine
        </Button>
      </div>

      {routines.length === 0 ? (
        <Empty description="Aucune routine créée">
          <Button type="primary" onClick={() => router.visit('/routines/create')}>
            Créer votre première routine
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedRoutines.map((r) => (
              <Col xs={24} sm={12} md={8} key={r.id}>
                <Card hoverable onClick={() => router.visit(`/routines/${r.id}`)}>
                  <Card.Meta
                    title={r.name}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {r.categories.length > 0 ? (
                          <Space wrap size={4}>
                            {r.categories.map((c) => (
                              <Tag key={c.id}>{c.name}</Tag>
                            ))}
                          </Space>
                        ) : (
                          <span style={{ color: '#8c8c8c' }}>Aucune catégorie</span>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(r.createdAt).format('DD/MM/YYYY')}
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
            total={routines.length}
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

### 🏗️ Frontend — Index.test.tsx (pattern de test)

```tsx
// inertia/pages/Routines/Index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesIndex from './Index'

// Mock Layout
vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockVisit = vi.fn()

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
  router: { visit: mockVisit },
  usePage: () => ({ url: '/routines', props: { flash: {} } }),
}))

const sampleRoutines = [
  {
    id: 1,
    name: 'Apparition du foulard',
    categories: [{ id: 1, name: 'Close-up' }],
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Disparition de pièce',
    categories: [],
    createdAt: '2026-02-20T14:30:00.000Z',
  },
]

describe('RoutinesIndex', () => {
  beforeEach(() => {
    mockVisit.mockClear()
  })

  it('affiche le titre et le bouton de création', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Mes Routines')).toBeDefined()
    expect(screen.getByText('Créer une routine')).toBeDefined()
  })

  it('clique "Créer une routine" navigue vers /routines/create', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    await userEvent.click(screen.getByText('Créer une routine'))
    expect(mockVisit).toHaveBeenCalledWith('/routines/create')
  })

  it('affiche les noms des routines', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Apparition du foulard')).toBeDefined()
    expect(screen.getByText('Disparition de pièce')).toBeDefined()
  })

  it('affiche les catégories en Tags', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('Close-up')).toBeDefined()
  })

  it('affiche la date de création au format DD/MM/YYYY', () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    expect(screen.getByText('15/01/2026')).toBeDefined()
  })

  it('clic sur une Card navigue vers /routines/:id', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    const cards = screen.getAllByText(/Apparition du foulard/)
    await userEvent.click(cards[0])
    expect(mockVisit).toHaveBeenCalledWith('/routines/1')
  })

  it('affiche Empty state quand aucune routine', () => {
    render(<RoutinesIndex routines={[]} />)
    expect(screen.getByText('Aucune routine créée')).toBeDefined()
    expect(screen.getByText('Créer votre première routine')).toBeDefined()
  })

  it('clique "Créer votre première routine" navigue vers /routines/create', async () => {
    render(<RoutinesIndex routines={[]} />)
    await userEvent.click(screen.getByText('Créer votre première routine'))
    expect(mockVisit).toHaveBeenCalledWith('/routines/create')
  })
})
```

### ⚠️ Points d'Attention

**1. `createdAt` : Luxon DateTime → ISO string**
- Le modèle `Routine` expose `createdAt` en tant que `DateTime` Luxon (décorateur `@column.dateTime`)
- Dans le controller, utiliser `.toISO()` pour sérialiser vers le frontend
- Côté frontend, `dayjs(r.createdAt).format('DD/MM/YYYY')` fonctionne avec une ISO string
- Pattern déjà utilisé dans `MaterialsController.index()` pour `material.createdAt`

**2. Route `index` à ajouter**
- Actuellement `router.resource('routines', ...).only(['create', 'store', 'edit', 'update'])` — `'index'` est absent
- Ajouter `'index'` en premier dans le tableau `.only([...])`
- Les routes custom `attachMaterial` / `detachMaterial` restent inchangées

**3. Breadcrumb automatique**
- `Layout.tsx` génère automatiquement le breadcrumb via `generateBreadcrumbs()` basé sur l'URL
- Pour `/routines`, génère : "Accueil > Routines" (via `labelMap['routines'] = 'Routines'`)
- Aucun code spécifique n'est nécessaire dans `Index.tsx` — juste `<Layout>` suffit

**4. Navigation vers Show non encore implémentée**
- `router.visit('/routines/${r.id}')` naviguera vers une 404 jusqu'à Story 4.5
- C'est attendu et normal — le code peut être écrit maintenant
- Ne pas ajouter de guard conditionnel — la route sera créée en Story 4.5

**5. Pas de `'show'` dans la resource pour Story 4.4**
- Story 4.5 ajoutera `'show'` à la resource et créera le controller `show()`
- Story 4.4 n'a besoin que de `'index'`

**6. Pagination côté client**
- La pagination est gérée côté frontend (`slice`) comme pour `Materials/Index.tsx`
- Pas de pagination server-side nécessaire pour cette story
- 12 routines par page (vs 50 pour materials en vue table)

**7. Absence de catégories**
- Afficher `<span style={{ color: '#8c8c8c' }}>Aucune catégorie</span>` si `categories.length === 0`
- Cohérent avec le pattern des autres pages qui affichent "—" pour les valeurs manquantes

**8. Tests — Mock de `usePage`**
- `Layout.tsx` utilise `usePage()` d'Inertia pour les breadcrumbs et l'URL active
- Le mock doit inclure `usePage: () => ({ url: '/routines', props: { flash: {} } })`
- Pattern déjà utilisé dans `Edit.test.tsx` (Story 4.2/4.3)

### 📊 Structure des fichiers

```
Fichiers à MODIFIER :
app/controllers/routines_controller.ts    ← MODIFIER (ajouter méthode index())
start/routes.ts                           ← MODIFIER (ajouter 'index' à .only([...]))

Fichiers à CRÉER :
inertia/pages/Routines/Index.tsx          ← CRÉER
inertia/pages/Routines/Index.test.tsx     ← CRÉER
```

### 📝 Learnings de Story 4.3 (et stories précédentes)

- **`router.visit()`** : utiliser pour la navigation simple (pas de formulaire)
- **Mock Layout** : toujours `vi.mock('~/components/Layout', ...)` dans les tests
- **Mock `usePage`** : inclure `url` et `props.flash` pour Layout
- **`createdAt.toISO()`** : sérialiser les DateTime Luxon en ISO string pour le frontend
- **`dayjs(isoString).format('DD/MM/YYYY')`** : format date côté frontend
- **Cards hoverable** : `<Card hoverable onClick={...}>` pour navigation au clic
- **Owner check IDOR** : toujours `where('user_id', auth.user!.id)` — respecté dans `index()` via `.where('user_id', ...)`
- **`hideOnSinglePage`** : sur `<Pagination>` pour masquer si une seule page

### References

- Pattern Materials Index (vue cards + pagination) : [Source: inertia/pages/Materials/Index.tsx]
- Pattern Materials controller index() : [Source: app/controllers/materials_controller.ts#index]
- Pattern sérialisation createdAt : [Source: app/controllers/materials_controller.ts#index] (`.toISO()`)
- Modèle Routine (champs, relations) : [Source: app/models/routine.ts]
- Routines controller existant : [Source: app/controllers/routines_controller.ts]
- Routes actuelles routines : [Source: start/routes.ts#35-38]
- Layout breadcrumb auto-généré : [Source: inertia/components/Layout.tsx#43-77]
- labelMap routines : [Source: inertia/components/Layout.tsx#56] (`routines: 'Routines'`)
- Epic 4 Story 4.4 : [Source: _bmad-output/planning-artifacts/epics.md] (Story 4.4 liste routines)
- Story 4.3 (précédente, learnings) : [Source: _bmad-output/implementation-artifacts/4-3-liaison-materiel-a-une-routine.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Correction mock `@inertiajs/react` : variable `mockVisit` hissée hors du factory `vi.mock()` causait une erreur de hoisting. Correction : utiliser `vi.fn()` directement dans le factory et importer `router` depuis `@inertiajs/react` pour les assertions (pattern identique à `Edit.test.tsx`).

### Completion Notes List

- Méthode `index()` ajoutée en premier dans `RoutinesController` : query avec `where('user_id')`, `preload('categories')`, sérialisation `createdAt.toISO()`
- Route `index` ajoutée à la resource routines dans `routes.ts`
- Page `Routines/Index.tsx` créée : Cards responsive (xs/sm/md), pagination client-side (PAGE_SIZE=12, hideOnSinglePage), Empty state, catégories en Tags, dates DD/MM/YYYY
- 9 tests créés initialement, 12 après code review — total suite : 208 tests (0 régression)

### File List

- app/controllers/routines_controller.ts
- start/routes.ts
- inertia/pages/Routines/Index.tsx
- inertia/pages/Routines/Index.test.tsx
