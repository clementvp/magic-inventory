# Story 3.2: Liste Inventaire Vue Table

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **voir mon inventaire sous forme de tableau avec tri et pagination**,
so that **je peux explorer et analyser mon inventaire en détail** (FR14).

## Acceptance Criteria

**Scenario 1 : Navigation et affichage de base**
- **Given** je suis connecté
- **When** j'accède à `/materials`
- **Then** le breadcrumb affiche : Accueil > Inventaire
- **And** je vois mon inventaire affiché sous forme de Table Ant Design (vue par défaut)

**Scenario 2 : Colonnes de la Table**
- **Given** la vue Table est affichée
- **When** la page se charge
- **Then** les colonnes sont : Nom, Type, Catégorie(s), Lieu, Auteur, Date d'ajout, Actions
- **And** toutes les lignes affichent uniquement mes matériels (`user_id` = moi — isolation multi-tenant)

**Scenario 3 : Tri par colonne**
- **Given** la Table est affichée
- **When** je clique sur un en-tête de colonne triable
- **Then** le tri s'applique (ascendant ou descendant)
- **And** le tri fonctionne pour : Nom (alphabétique), Type (alphabétique), Date d'ajout (chronologique)

**Scenario 4 : Pagination**
- **Given** j'ai > 50 matériels
- **When** la Table se charge
- **Then** la pagination Ant Design est visible
- **And** 50 items par page sont affichés par défaut
- **And** je peux changer le nombre d'items par page (25, 50, 100)

**Scenario 5 : Navigation vers détail**
- **Given** la Table est affichée
- **When** je clique sur une ligne de matériel (ou le nom)
- **Then** je suis redirigé vers `/materials/:id` (détail du matériel — Story 3.4)

**Scenario 6 : État vide (Empty State)**
- **Given** j'ai 0 matériel
- **When** j'accède à `/materials`
- **Then** un Empty Ant Design s'affiche avec le message : "Aucun matériel dans votre inventaire"
- **And** un bouton "Ajouter votre premier matériel" est visible
- **And** le clic sur ce bouton navigue vers `/materials/create`

**Scenario 7 : Bouton "Ajouter un matériel"**
- **Given** je suis sur la page `/materials`
- **When** la page se charge (même si l'inventaire n'est pas vide)
- **Then** un bouton "Ajouter un matériel" est visible en haut de la page
- **And** le clic navigue vers `/materials/create`

## Tasks / Subtasks

### Backend — Controller `index()` (AC: 1, 2, 3, 4, 5, 6)

- [x] Ajouter méthode `index()` dans `app/controllers/materials_controller.ts` (AC: 1, 2, 3, 4)
  - [x] `Material.query().where('user_id', auth.user!.id)` — isolation multi-tenant obligatoire
  - [x] `.preload('type')` — eager loading pour colonne Type (évite N+1)
  - [x] `.preload('categories')` — eager loading pour colonne Catégorie(s) (évite N+1)
  - [x] `.preload('storageLocation')` — eager loading pour colonne Lieu (évite N+1)
  - [x] `.orderBy('created_at', 'desc')` — ordre par défaut (tri serveur)
  - [x] `inertia.render('Materials/Index', { materials: materials.map(m => serializeMaterial(m)) })`
  - [x] Sérialisation : mapper les relations pour passer uniquement les données nécessaires au frontend

### Backend — Routes (AC: 1)

- [x] Modifier `start/routes.ts`
  - [x] Étendre le resource `materials` : `.only(['index', 'create', 'store'])` (ajouter `index` à l'existant)
  - [x] Route nommée générée : `materials.index` (résout le ⚠️ 404 temporaire de Story 3.1)

### Frontend — Page `Materials/Index.tsx` (AC: 1, 2, 3, 4, 5, 6, 7)

- [x] Créer `inertia/pages/Materials/Index.tsx`
  - [x] Props : `{ materials: MaterialItem[] }`
  - [x] Interface TypeScript `MaterialItem` :
    ```typescript
    interface MaterialItem {
      id: number
      name: string
      type: { id: number; name: string } | null
      categories: { id: number; name: string }[]
      storageLocation: { id: number; name: string } | null
      author: string | null
      createdAt: string // ISO 8601
    }
    ```
  - [x] Layout wrapper avec `<Layout>` (breadcrumb auto : Accueil > Inventaire)
  - [x] Bouton "Ajouter un matériel" en haut à droite (primary, `router.visit('/materials/create')`)
  - [x] `Table` Ant Design avec colonnes :
    - `name` : clé primaire, titre "Nom", `sorter: true`, cliquable → navigate `/materials/${record.id}`
    - `type` : titre "Type", render `record.type?.name ?? '—'`, `sorter: true`
    - `categories` : titre "Catégorie(s)", render `<Space wrap>{record.categories.map(c => <Tag key={c.id}>{c.name}</Tag>)}</Space>` (ou `'—'` si vide)
    - `storageLocation` : titre "Lieu", render `record.storageLocation?.name ?? '—'`
    - `author` : titre "Auteur", render `record.author ?? '—'`
    - `createdAt` : titre "Date d'ajout", render `dayjs(record.createdAt).format('DD/MM/YYYY')`, `sorter: true`
    - `actions` : titre "Actions" (vide pour cette story — colonne réservée pour Stories 3.5/3.6)
  - [x] `rowKey="id"` obligatoire sur Table
  - [x] `pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['25', '50', '100'] }}`
  - [x] `onRow={(record) => ({ onClick: () => router.visit(\`/materials/${record.id}\`) })}` — ligne cliquable
  - [x] `locale={{ emptyText: ... }}` avec composant Empty personnalisé (Scenario 6)
  - [x] Empty state : `<Empty description="Aucun matériel dans votre inventaire"><Button type="primary" onClick={() => router.visit('/materials/create')}>Ajouter votre premier matériel</Button></Empty>`

### Frontend — Tests `Materials/Index.test.tsx` (AC: 1, 2, 4, 6, 7)

- [x] Créer `inertia/pages/Materials/Index.test.tsx`
  - [x] Mocks standards (voir pattern ci-dessous)
  - [x] Test : table affichée avec headers des colonnes
  - [x] Test : matériels listés (nom, type, catégories, lieu, auteur, date)
  - [x] Test : bouton "Ajouter un matériel" présent et fonctionnel
  - [x] Test : empty state affiché quand `materials = []`
  - [x] Test : bouton "Ajouter votre premier matériel" dans empty state navigue vers `/materials/create`
  - [x] Test : clic sur ligne navigue vers `/materials/:id`
  - [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### ⚠️ Résolution du 404 temporaire de Story 3.1

Story 3.1 avait averti : `redirect().toRoute('materials.index')` → 404 temporaire jusqu'à Story 3.2.
**Cette story RÉSOUT ce problème** en ajoutant la route `index` au resource `materials`.

Modifier `.only(['create', 'store'])` → `.only(['index', 'create', 'store'])` dans `start/routes.ts`.

### 🔥 Pattern Critique — Controller `index()` avec eager loading

```typescript
// app/controllers/materials_controller.ts
async index({ auth, inertia }: HttpContext) {
  const materials = await Material.query()
    .where('user_id', auth.user!.id)
    .preload('type')
    .preload('categories')
    .preload('storageLocation')
    .orderBy('created_at', 'desc')

  return inertia.render('Materials/Index', {
    materials: materials.map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type ? { id: m.type.id, name: m.type.name } : null,
      categories: m.categories.map((c) => ({ id: c.id, name: c.name })),
      storageLocation: m.storageLocation
        ? { id: m.storageLocation.id, name: m.storageLocation.name }
        : null,
      author: m.author,
      createdAt: m.createdAt.toISO(), // Luxon ISO string
    })),
  })
}
```

**Pourquoi cette sérialisation explicite ?**
- Évite d'exposer des données sensibles (userId, etc.)
- Contrôle précis du payload Inertia
- TypeScript end-to-end cohérent

### 🔥 Pattern Critique — Table Ant Design avec tri et pagination

```tsx
// inertia/pages/Materials/Index.tsx
import { router } from '@inertiajs/react'
import { Button, Empty, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
}

interface Props {
  materials: MaterialItem[]
}

export default function MaterialsIndex({ materials }: Props) {
  const columns: ColumnsType<MaterialItem> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <a onClick={() => router.visit(`/materials/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => record.type?.name ?? '—',
      sorter: (a, b) => (a.type?.name ?? '').localeCompare(b.type?.name ?? ''),
    },
    {
      title: 'Catégorie(s)',
      key: 'categories',
      render: (_, record) =>
        record.categories.length > 0 ? (
          <Space wrap size={4}>
            {record.categories.map((c) => (
              <Tag key={c.id}>{c.name}</Tag>
            ))}
          </Space>
        ) : (
          '—'
        ),
    },
    {
      title: 'Lieu',
      key: 'storageLocation',
      render: (_, record) => record.storageLocation?.name ?? '—',
    },
    {
      title: 'Auteur',
      dataIndex: 'author',
      key: 'author',
      render: (author: string | null) => author ?? '—',
    },
    {
      title: "Date d'ajout",
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => null, // Réservé Stories 3.5/3.6
    },
  ]

  const emptyState = (
    <Empty description="Aucun matériel dans votre inventaire">
      <Button type="primary" onClick={() => router.visit('/materials/create')}>
        Ajouter votre premier matériel
      </Button>
    </Empty>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mon Inventaire</h1>
        <Button type="primary" onClick={() => router.visit('/materials/create')}>
          Ajouter un matériel
        </Button>
      </div>
      <Table<MaterialItem>
        dataSource={materials}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: ['25', '50', '100'],
        }}
        onRow={(record) => ({
          onClick: () => router.visit(`/materials/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{ emptyText: emptyState }}
      />
    </Layout>
  )
}
```

### 🔥 Pattern Critique — Mocks tests Index (pattern stories précédentes)

```typescript
// inertia/pages/Materials/Index.test.tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MaterialsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/materials', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockMaterials = [
  {
    id: 1,
    name: 'Bicycle Standard',
    type: { id: 1, name: 'Jeu de cartes' },
    categories: [{ id: 1, name: 'Cartomagie' }],
    storageLocation: { id: 1, name: 'Tiroir cartes' },
    author: 'Dai Vernon',
    createdAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Thumb Tip',
    type: null,
    categories: [],
    storageLocation: null,
    author: null,
    createdAt: '2026-03-17T10:00:00.000Z',
  },
]

describe('MaterialsIndex', () => {
  it('affiche la table avec les colonnes correctes', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Catégorie(s)')).toBeInTheDocument()
    expect(screen.getByText('Lieu')).toBeInTheDocument()
    expect(screen.getByText('Auteur')).toBeInTheDocument()
  })

  it('affiche les matériels dans la table', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
  })

  it('affiche "—" pour les champs null', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    // Thumb Tip a type null, author null → '—' attendus
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le bouton "Ajouter un matériel"', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Ajouter un matériel')).toBeInTheDocument()
  })

  it('navigue vers /materials/create au clic "Ajouter un matériel"', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Ajouter un matériel'))
    expect(router.visit).toHaveBeenCalledWith('/materials/create')
  })

  it('affiche empty state quand aucun matériel', () => {
    render(<MaterialsIndex materials={[]} />)
    expect(screen.getByText('Aucun matériel dans votre inventaire')).toBeInTheDocument()
    expect(screen.getByText('Ajouter votre premier matériel')).toBeInTheDocument()
  })

  it('navigue vers /materials/create depuis empty state', async () => {
    render(<MaterialsIndex materials={[]} />)
    await userEvent.click(screen.getByText('Ajouter votre premier matériel'))
    expect(router.visit).toHaveBeenCalledWith('/materials/create')
  })

  it('navigue vers /materials/:id au clic sur le nom', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Bicycle Standard'))
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })
})
```

### ⚠️ dayjs — Importation

`dayjs` est déjà une dépendance d'Ant Design — vérifier qu'il est disponible avant d'importer :
```typescript
import dayjs from 'dayjs'
```
Si non disponible : `npm install dayjs`

### ⚠️ Tri côté client vs serveur

Le tri est implémenté côté **client** dans cette story (sorter functions dans les columns).
Story 3.7 (Recherche et filtrage multi-critères) pourra migrer vers tri serveur si la volumétrie le justifie.
Pour le MVP, le tri côté client est suffisant et plus simple à implémenter.

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
inertia/
  pages/
    Materials/
      Index.tsx        ← Nouvelle page liste inventaire
      Index.test.tsx   ← Tests correspondants
```

**Fichiers existants à MODIFIER :**
```
app/controllers/materials_controller.ts  ← Ajouter méthode index()
start/routes.ts                          ← Étendre resource materials avec 'index'
```

**Fichiers SANS modification :**
```
app/models/material.ts          ← Aucune modification nécessaire
app/models/category.ts          ← Aucune modification nécessaire
inertia/components/Layout.tsx   ← Utilisation standard sans prop title (breadcrumb auto)
```

**Alignement architecture :**
- ✅ Page `Materials/Index.tsx` (pattern établi : PascalCase, dans `inertia/pages/Materials/`)
- ✅ Route pluriel strict : `materials.index`
- ✅ Isolation multi-tenant : `.where('user_id', auth.user!.id)` dans `index()`
- ✅ Eager loading : `.preload('type')`, `.preload('categories')`, `.preload('storageLocation')` (évite N+1)
- ✅ `Table.loading` via Ant Design natif (pas de custom loader)
- ✅ Messages en français (empty state, UI labels)
- ✅ `dayjs` pour formatage dates (cohérent avec Ant Design)
- ✅ Sérialisation explicite dans controller (pas d'exposition directe du modèle Lucid)

### References

- **[Source: epics.md#Story 3.2]** — User story, 7 scénarios BDD, FR14
- **[Source: epics.md#Epic 3]** — Contexte : Gestion de l'Inventaire
- **[Source: architecture.md#API & Communication Patterns]** — Controller RESTful, méthodes standard (index, create, store...)
- **[Source: architecture.md#Frontend Architecture]** — Component Architecture, `inertia/pages/Materials/Index.tsx`
- **[Source: architecture.md#Loading States]** — `Table.loading` pattern, Ant Design Table
- **[Source: architecture.md#Enforcement Guidelines]** — Naming conventions, multi-tenant isolation, messages français
- **[Source: 3-1-creation-de-materiel-avec-associations.md#Dev Notes]** — Patterns controller, validator, routes, tests mocks
- **[Source: 3-1-creation-de-materiel-avec-associations.md#Completion Notes]** — ⚠️ redirect `materials.index` → 404 attendu jusqu'à Story 3.2 (cette story)

### Learnings des Stories Précédentes

**Story 3.1 — Code Review Fixes à appliquer ici :**
- ✅ Isolation multi-tenant dans `index()` : vérifier ownership de TOUTES les relations (déjà garanti par `.where('user_id', auth.user!.id)` sur la query principale + preload)
- ✅ `onError` dans les handlers de mutation (N/A ici — pas de mutation en Story 3.2)
- ✅ Tests : utiliser `objectContaining` pour vérifier les options de navigation

**Story 2.4 — Pattern `Layout` sans prop `title` :**
- Cette page n'a pas besoin de `title` prop car le breadcrumb auto "Inventaire" convient.
  Le `labelMap` dans Layout.tsx doit déjà avoir `materials → 'Inventaire'` (à vérifier et ajouter si absent).

**Story 2.3 — Pattern Empty State :**
- `<Empty>` Ant Design utilisé avec `<Button>` enfant pour action CTA.
- Pattern cohérent avec StorageLocations/Index.tsx.

### Git Intelligence Summary

**Commits récents pertinents :**
- `ca3a19d` : Story 3.1 — Materials model, controller (create/store), routes, Create.tsx (patterns à suivre)
- `883212e` : Story 2.4 — StorageLocations show page (pattern page détail + Layout prop title)
- `7b23e0e` : Story 2.3 — StorageLocations Index (pattern Index.tsx avec Table Ant Design, Empty state)

**Pattern établi :**
- 104 tests passent actuellement (0 échec)
- 1 commit par story après code review complet

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive : epics.md (Story 3.2 extraite), architecture.md (Table pattern, controller index(), eager loading), story 3.1 (patterns CRUD, mocks tests, code review fixes), git log (104 tests, 0 régression)

### Completion Notes List

**Phase Planification (2026-03-21):**
- ✅ Story auto-découverte depuis sprint-status.yaml (3-2-liste-inventaire-vue-table = premier backlog)
- ✅ Analyse epics.md — Story 3.2 extraite avec 7 scénarios BDD (FR14)
- ✅ Analyse architecture — pattern Table Ant Design, eager loading, controller index(), sérialisation
- ✅ Analyse story 3.1 — patterns mocks, code review fixes, résolution ⚠️ 404 `materials.index`
- ✅ CRITIQUE documenté : résolution du 404 temporaire de Story 3.1 (ajouter 'index' au resource)
- ✅ CRITIQUE documenté : eager loading `.preload()` pour éviter N+1 queries (3 relations)
- ✅ CRITIQUE documenté : tri côté client pour MVP (migration serveur possible en Story 3.7)
- ✅ Pattern complet Index.tsx documenté avec code prêt à copier
- ✅ Pattern tests Index.test.tsx documenté avec fixtures et 8 cas de test
- ✅ dayjs déjà disponible via Ant Design — vérification import documentée

**Phase Implémentation (2026-03-21):**
- ✅ `app/controllers/materials_controller.ts` — méthode `index()` ajoutée avec eager loading (type, categories, storageLocation), isolation multi-tenant `.where('user_id', auth.user!.id)`, sérialisation explicite
- ✅ `start/routes.ts` — resource materials étendu avec 'index' → résolution du ⚠️ 404 `materials.index` de Story 3.1
- ✅ `inertia/pages/Materials/Index.tsx` — page créée : Table Ant Design 7 colonnes, tri client (Nom/Type/Date), pagination (25/50/100), lignes cliquables, empty state avec CTA
- ✅ `inertia/pages/Materials/Index.test.tsx` — 8 tests créés couvrant colonnes, matériels, nulls, empty state, navigation
- ✅ `npx vitest run` — 112 tests passent (104 + 8 nouveaux), 0 régression

**Phase Code Review (2026-03-21):**
- ✅ H1 Fix : `e.stopPropagation()` sur `<a>` du nom pour éviter double navigation (onRow + link)
- ✅ H2 Fix : Test colonnes complété — "Date d'ajout" et "Actions" vérifiés
- ✅ H3 Fix : Test données complété — type, catégorie, lieu, auteur, date vérifiés
- ✅ M1 Fix : `createdAt.toISO()!` — assertion non-null pour compatibilité TypeScript
- ✅ M2 Fix : `beforeEach(() => vi.clearAllMocks())` — isolation entre tests
- ✅ M3 Fix : Assertion nulls renforcée — `>= 4` au lieu de `>= 1`
- ✅ L1 Fix : Test ajouté pour clic sur ligne entière (hors nom) via `onRow`
- ✅ `npx vitest run` — 113 tests passent (1 test ajouté), 0 régression

### File List

**Nouveaux fichiers :**
- `inertia/pages/Materials/Index.tsx`
- `inertia/pages/Materials/Index.test.tsx`

**Fichiers modifiés :**
- `app/controllers/materials_controller.ts` (ajout méthode `index()`)
- `start/routes.ts` (extension resource materials avec `'index'`)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-21 | 1.0 | Story créée — analyse exhaustive epics, architecture, story 3.1, résolution ⚠️ 404 materials.index | SM Agent |
| 2026-03-21 | 1.1 | Implémentation complète — controller index(), route materials.index, page Materials/Index.tsx, 8 tests (112 total, 0 régression) | Dev Agent |
| 2026-03-21 | 1.2 | Code Review fixes — double navigation fix, tests colonnes/données/nulls/ligne complets, clearAllMocks, toISO()! (113 tests, 0 régression) | Review Agent |
