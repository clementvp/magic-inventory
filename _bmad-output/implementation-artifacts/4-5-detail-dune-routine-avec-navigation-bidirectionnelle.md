# Story 4.5: Détail d'une Routine avec Navigation Bidirectionnelle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **voir tous les détails d'une routine et son matériel lié**,
so that **je peux consulter ma routine et naviguer vers le matériel** (FR36).

## Acceptance Criteria

**Scenario 1 : Breadcrumb de la page**
- **Given** je clique sur une routine depuis /routines
- **When** je suis redirigé vers /routines/:id
- **Then** le breadcrumb affiche : Accueil > Routines > [Nom de la routine]
- **Note** : Le breadcrumb est géré automatiquement par `Layout.tsx` via `generateBreadcrumbs()` — passer `title={routine.name}` à `<Layout>` suffit

**Scenario 2 : Affichage des informations de la routine**
- **Given** je suis sur /routines/:id
- **When** la page se charge
- **Then** je vois :
  - Nom (titre principal via `<Typography.Title level={1}>`)
  - Catégorie(s) (Tags si définies, sinon "—")
  - Contenu (lecture seule, retours à la ligne préservés, scrollable si long)
  - Section "Matériel utilisé" (liste du matériel lié)

**Scenario 3 : Affichage du contenu avec retours à la ligne**
- **Given** la routine a du contenu
- **When** j'affiche le contenu
- **Then** le texte est affiché avec les retours à la ligne préservés (`white-space: pre-wrap`)
- **And** le contenu est scrollable si très long (via `max-height` + `overflow-y: auto`)

**Scenario 4 : Section matériel lié — avec matériel**
- **Given** la routine a du matériel lié
- **When** j'affiche la section "Matériel utilisé"
- **Then** chaque matériel est affiché avec : Nom, Type (Tag ou "—"), Lieu de stockage (ou "—")
- **And** chaque matériel est cliquable (`router.visit('/materials/:id')`)

**Scenario 5 : Navigation bidirectionnelle vers matériel**
- **Given** je clique sur un matériel lié
- **When** le clic est effectué
- **Then** je suis redirigé vers /materials/:id (détail matériel - Story 3.4)
- **And** sur la page matériel, je vois que ce matériel est utilisé dans des routines (navigation bidirectionnelle déjà implémentée dans Materials/Show.tsx)

**Scenario 6 : Section matériel lié — vide**
- **Given** la routine n'a pas de matériel lié
- **When** j'affiche la section "Matériel utilisé"
- **Then** le texte affiche : "Aucun matériel lié"

**Scenario 7 : Boutons d'action**
- **Given** je suis sur /routines/:id
- **When** je vois la page
- **Then** les boutons "Modifier" (type="primary") et "Supprimer" (danger) sont visibles
- **Note** : Le bouton "Supprimer" sera pleinement fonctionnel en Story 4.7 — Story 4.5 le rend visible uniquement (placeholder sans handler)

**Scenario 8 : Navigation vers modification**
- **Given** je clique sur "Modifier"
- **When** le bouton est cliqué
- **Then** je suis redirigé vers /routines/:id/edit (Story 4.2)

## Tasks / Subtasks

### Backend — Route `show` (AC: 1, 2)

- [x] Modifier `start/routes.ts`
  - [x] Ajouter `'show'` à la resource : `router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update'])`
  - [x] ⚠️ Ne pas toucher aux routes custom `attachMaterial` / `detachMaterial` qui suivent

### Backend — Controller `show()` (AC: 2, 3, 4, 5, 6)

- [x] Modifier `app/controllers/routines_controller.ts` — ajouter méthode `show()` AVANT `edit()`
  - [x] Query : `Routine.query().where('user_id', auth.user!.id).where('id', params.id).preload('categories').preload('materials', q => q.preload('type').preload('storageLocation')).firstOrFail()`
  - [x] Retourner `inertia.render('Routines/Show', { routine: { ... } })`
  - [x] Sérialiser : `{ id, name, content, categories: [{ id, name }], materials: [{ id, name, type: { id, name } | null, storageLocation: { id, name } | null }], createdAt: routine.createdAt.toISO() }`

### Frontend — Page `Show.tsx` (AC: 1–8)

- [x] Créer `inertia/pages/Routines/Show.tsx`
  - [x] Imports : `{ router }` de `@inertiajs/react`, `{ Button, Space, Tag, Typography, List }` de `antd`, `Layout` de `~/components/Layout`
  - [x] Interface `RoutineDetail` : `{ id, name, content, categories: { id, name }[], materials: { id, name, type: { id, name } | null, storageLocation: { id, name } | null }[], createdAt }`
  - [x] Interface `Props` : `{ routine: RoutineDetail }`
  - [x] `<Layout title={routine.name}>` → breadcrumb automatique : Accueil > Routines > [Nom]
  - [x] `<Typography.Title level={1}>{routine.name}</Typography.Title>`
  - [x] Boutons d'action (`<Space style={{ marginBottom: 16 }}>`) :
    - `<Button type="primary" onClick={() => router.visit('/routines/${routine.id}/edit')}>Modifier</Button>`
    - `<Button danger>Supprimer</Button>` (placeholder — fonctionnel en Story 4.7)
    - `<Button onClick={() => router.visit('/routines')}>Retour aux routines</Button>`
  - [x] Section catégories : `<Typography.Title level={3}>Catégories</Typography.Title>` + Tags ou "—"
  - [x] Section contenu :
    - `<Typography.Title level={3}>Contenu</Typography.Title>`
    - `<div style={{ whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', padding: 8, background: '#fafafa', borderRadius: 4 }}>{routine.content || 'Aucun contenu'}</div>`
  - [x] Section matériel :
    - `<Typography.Title level={3}>Matériel utilisé</Typography.Title>`
    - Si `routine.materials.length === 0` : `<Typography.Text type="secondary">Aucun matériel lié</Typography.Text>`
    - Sinon : `<List dataSource={routine.materials} renderItem={...}>` — chaque item cliquable vers `/materials/:id`
    - Chaque item affiche : Nom (bold), Type (Tag ou "—"), Lieu ("— " ou nom)

### Frontend — Tests `Show.test.tsx` (AC: 1–8)

- [x] Créer `inertia/pages/Routines/Show.test.tsx`
  - [x] Setup mocks : `vi.mock('~/components/Layout', ...)`, `vi.mock('@inertiajs/react', () => ({ router: { visit: vi.fn() }, usePage: () => ({ url: '/routines/1', props: { flash: {} } }) }))`
  - [x] Données de test : routine avec catégories, contenu multilignes, 2 matériaux (1 avec type+lieu, 1 sans)
  - [x] Test : titre de la routine affiché (AC: 2)
  - [x] Test : catégories affichées en Tags (AC: 2)
  - [x] Test : contenu affiché (AC: 3)
  - [x] Test : contenu multilignes avec `whiteSpace: pre-wrap` (AC: 3)
  - [x] Test : chaque matériel affiché avec nom (AC: 4)
  - [x] Test : clic sur un matériel appelle `router.visit('/materials/1')` (AC: 5)
  - [x] Test : Empty state "Aucun matériel lié" si `materials: []` (AC: 6)
  - [x] Test : bouton "Modifier" visible (AC: 7)
  - [x] Test : bouton "Supprimer" visible (AC: 7)
  - [x] Test : bouton "Retour aux routines" visible
  - [x] Test : clic "Modifier" appelle `router.visit('/routines/1/edit')` (AC: 8)
  - [x] Test : clic "Retour aux routines" appelle `router.visit('/routines')`
  - [x] Lancer `npx vitest run` — 0 régression (220 tests passent)

## Dev Notes

### 🎯 Contexte — Ce que Story 4.5 ajoute

Story 4.5 crée la page `/routines/:id` (Show) qui était la pièce manquante pour la navigation bidirectionnelle. Depuis Story 4.4, les Cards de la liste `/routines` pointent déjà vers `/routines/:id` — ce qui donnait une 404 jusqu'à maintenant.

**Ce que Story 4.5 N'INCLUT PAS :**
- Pas de logique de suppression (c'est Story 4.7 — le bouton "Supprimer" est uniquement visible)
- Pas de breadcrumb custom (géré automatiquement par Layout avec `title` prop)
- Pas de modification (c'est Story 4.6 — le bouton "Modifier" navigue vers `/edit`)

### 🏗️ Backend — Controller `show()`

```typescript
// app/controllers/routines_controller.ts — ajouter AVANT edit() :
async show({ params, auth, inertia }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('categories')
    .preload('materials', (q) => {
      q.preload('type').preload('storageLocation')
    })
    .firstOrFail()

  return inertia.render('Routines/Show', {
    routine: {
      id: routine.id,
      name: routine.name,
      content: routine.content,
      categories: routine.categories.map((c) => ({ id: c.id, name: c.name })),
      materials: routine.materials.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type ? { id: m.type.id, name: m.type.name } : null,
        storageLocation: m.storageLocation
          ? { id: m.storageLocation.id, name: m.storageLocation.name }
          : null,
      })),
      createdAt: routine.createdAt.toISO() ?? '',
    },
  })
}
```

**Note** : Le même preload `materials q => q.preload('type').preload('storageLocation')` est déjà utilisé dans `edit()` — réutiliser le même pattern.

### 🏗️ Route — Ajout de `show`

```typescript
// start/routes.ts — AVANT :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'edit', 'update'])

// APRÈS :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
```

⚠️ **Ordre des routes** : `attachMaterial` et `detachMaterial` doivent rester après la resource — ne pas les déplacer.

### 🏗️ Frontend — Show.tsx

```tsx
// inertia/pages/Routines/Show.tsx
import { router } from '@inertiajs/react'
import { Button, List, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface RoutineDetail {
  id: number
  name: string
  content: string | null
  categories: { id: number; name: string }[]
  materials: MaterialItem[]
  createdAt: string
}

interface Props {
  routine: RoutineDetail
}

export default function RoutinesShow({ routine }: Props) {
  return (
    <Layout title={routine.name}>
      <Typography.Title level={1}>{routine.name}</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/routines/${routine.id}/edit`)}>
          Modifier
        </Button>
        <Button danger>Supprimer</Button>
        <Button onClick={() => router.visit('/routines')}>Retour aux routines</Button>
      </Space>

      <Typography.Title level={3}>Catégories</Typography.Title>
      <div style={{ marginBottom: 16 }}>
        {routine.categories.length > 0
          ? routine.categories.map((c) => <Tag key={c.id}>{c.name}</Tag>)
          : '—'}
      </div>

      <Typography.Title level={3}>Contenu</Typography.Title>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          maxHeight: 400,
          overflowY: 'auto',
          padding: 8,
          background: '#fafafa',
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        {routine.content || 'Aucun contenu'}
      </div>

      <Typography.Title level={3}>Matériel utilisé</Typography.Title>
      {routine.materials.length === 0 ? (
        <Typography.Text type="secondary">Aucun matériel lié</Typography.Text>
      ) : (
        <List
          dataSource={routine.materials}
          renderItem={(m) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => router.visit(`/materials/${m.id}`)}
            >
              <List.Item.Meta
                title={<span style={{ fontWeight: 500 }}>{m.name}</span>}
                description={
                  <Space>
                    <span>Type : {m.type ? <Tag>{m.type.name}</Tag> : '—'}</span>
                    <span>Lieu : {m.storageLocation ? m.storageLocation.name : '—'}</span>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Layout>
  )
}
```

### 🏗️ Frontend — Show.test.tsx (pattern de test)

```tsx
// inertia/pages/Routines/Show.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesShow from './Show'

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const mockVisit = vi.fn()

vi.mock('@inertiajs/react', () => ({
  router: { visit: mockVisit },
  usePage: () => ({ url: '/routines/1', props: { flash: {} } }),
}))

const sampleRoutine = {
  id: 1,
  name: 'Apparition du foulard',
  content: 'Ligne 1\nLigne 2\nLigne 3',
  categories: [{ id: 1, name: 'Close-up' }],
  materials: [
    {
      id: 10,
      name: 'Foulard rouge',
      type: { id: 2, name: 'Accessoire' },
      storageLocation: { id: 3, name: 'Boîte A' },
    },
    {
      id: 11,
      name: 'Pièce de monnaie',
      type: null,
      storageLocation: null,
    },
  ],
  createdAt: '2026-01-15T10:00:00.000Z',
}

describe('RoutinesShow', () => {
  beforeEach(() => {
    mockVisit.mockClear()
  })

  it('affiche le nom de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getAllByText('Apparition du foulard').length).toBeGreaterThan(0)
  })

  it('affiche les catégories en Tags', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Close-up')).toBeDefined()
  })

  it('affiche le contenu de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText(/Ligne 1/)).toBeDefined()
  })

  it('affiche les matériaux liés', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Foulard rouge')).toBeDefined()
    expect(screen.getByText('Pièce de monnaie')).toBeDefined()
  })

  it('clic sur un matériel navigue vers /materials/:id', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    const items = screen.getAllByText('Foulard rouge')
    await userEvent.click(items[0].closest('[style*="cursor"]') ?? items[0])
    expect(mockVisit).toHaveBeenCalledWith('/materials/10')
  })

  it('affiche "Aucun matériel lié" si aucun matériel', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, materials: [] }} />)
    expect(screen.getByText('Aucun matériel lié')).toBeDefined()
  })

  it('affiche le bouton "Modifier"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Modifier')).toBeDefined()
  })

  it('affiche le bouton "Supprimer"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Supprimer')).toBeDefined()
  })

  it('clic "Modifier" navigue vers /routines/:id/edit', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByText('Modifier'))
    expect(mockVisit).toHaveBeenCalledWith('/routines/1/edit')
  })

  it('clic "Retour aux routines" navigue vers /routines', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByText('Retour aux routines'))
    expect(mockVisit).toHaveBeenCalledWith('/routines')
  })
})
```

### ⚠️ Points d'Attention

**1. Bouton "Supprimer" — Placeholder Story 4.7**
- Story 4.5 rend le bouton "Supprimer" visible SANS handler onClick
- Story 4.7 ajoutera `destroy()` au controller, la route `destroy`, le Popconfirm et la logique de suppression
- Le test vérifie uniquement que le bouton est présent, pas qu'il appelle quelque chose

**2. Breadcrumb automatique avec `title`**
- `Layout.tsx` utilise `generateBreadcrumbs()` : si `title` est fourni, il remplace le dernier segment URL
- Pour `/routines/1` avec `title="Apparition du foulard"` : breadcrumb = Accueil > Routines > Apparition du foulard
- Le segment `1` (l'ID) serait affiché sans label map — c'est pourquoi `title` doit être passé
- Pattern identique à `Materials/Show.tsx` qui utilise `<Layout title={material.name}>`

**3. Contenu multilignes — `white-space: pre-wrap`**
- Le contenu des routines peut contenir des `\n` (éditeur de Story 4.2)
- Utiliser `white-space: pre-wrap` pour préserver les retours à la ligne
- Ne pas utiliser `<Typography.Paragraph>` qui ignorerait les `\n` bruts
- `maxHeight: 400` + `overflowY: auto` pour les contenus très longs

**4. Navigation bidirectionnelle déjà partiellement implémentée**
- `Materials/Show.tsx` affiche déjà la section "Utilisé dans les routines suivantes"
- MAIS cette section est actuellement en placeholder (texte statique "Ce matériel n'est utilisé dans aucune routine")
- Story 4.5 n'a PAS à modifier Materials/Show.tsx — ce sera fait dans une story ultérieure
- La bidirectionnel complète Routine → Matériel est suffisante pour Story 4.5

**5. Ownership IDOR**
- `show()` doit TOUJOURS inclure `.where('user_id', auth.user!.id)` comme toutes les autres méthodes
- Pattern déjà présent dans `edit()`, `update()`, `attachMaterial()`, `detachMaterial()`
- `.firstOrFail()` renvoie une 404 automatiquement si l'ID n'existe pas ou n'appartient pas à l'user

**6. Preload matériel avec relations**
- Utiliser le même preload que dans `edit()` : `.preload('materials', q => q.preload('type').preload('storageLocation'))`
- Dans `show()` on n'a pas besoin de `allMaterials` ni des `categories` globales (contrairement à `edit()`)

**7. Mock `usePage` dans les tests**
- `Layout.tsx` utilise `usePage()` pour les breadcrumbs et l'URL active
- Le mock doit inclure `usePage: () => ({ url: '/routines/1', props: { flash: {} } })`
- Pattern identique aux tests précédents (Edit.test.tsx, Index.test.tsx)

**8. Ordre des méthodes dans le controller**
- Ajouter `show()` AVANT `edit()` pour respecter l'ordre CRUD conventionnel : `index, create, store, show, edit, update`
- L'ordre actuel du controller est : `index, create, store, edit, update, attachMaterial, detachMaterial`
- Insérer `show()` entre `store()` et `edit()`

### 📊 Structure des fichiers

```
Fichiers à MODIFIER :
app/controllers/routines_controller.ts    ← MODIFIER (ajouter méthode show() entre store() et edit())
start/routes.ts                           ← MODIFIER (ajouter 'show' à .only([...]))

Fichiers à CRÉER :
inertia/pages/Routines/Show.tsx           ← CRÉER
inertia/pages/Routines/Show.test.tsx      ← CRÉER
```

### 📝 Learnings des stories précédentes

- **`router.visit()`** : navigation simple sans formulaire
- **Mock Layout** : toujours `vi.mock('~/components/Layout', ...)`
- **Mock `usePage`** : inclure `url` et `props.flash` dans le mock
- **Owner check IDOR** : toujours `.where('user_id', auth.user!.id)` dans les queries
- **`.toISO()`** : sérialiser les DateTime Luxon en ISO string (pas nécessaire pour Show mais présent pour cohérence)
- **`.firstOrFail()`** : 404 automatique si ressource non trouvée ou non autorisée
- **`white-space: pre-wrap`** : préserver les retours à la ligne dans le contenu texte
- **Pas de `hideOnSinglePage`** ici : pas de pagination sur la page Show

### References

- Pattern Materials Show (page détail avec boutons + sections) : [Source: inertia/pages/Materials/Show.tsx]
- Pattern Materials controller show() : [Source: app/controllers/materials_controller.ts#show]
- Modèle Routine (champs, relations) : [Source: app/models/routine.ts]
- Preload materials avec type+lieu : [Source: app/controllers/routines_controller.ts#edit]
- Routes actuelles routines : [Source: start/routes.ts#49-51]
- Layout breadcrumb avec title : [Source: inertia/components/Layout.tsx#63-66]
- labelMap routines : [Source: inertia/components/Layout.tsx#56]
- Epic 4 Story 4.5 : [Source: _bmad-output/planning-artifacts/epics.md#Story 4.5]
- Story 4.4 (précédente, learnings) : [Source: _bmad-output/implementation-artifacts/4-4-liste-des-routines.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Correction du mock `vi.mock('@inertiajs/react', ...)` : erreur de hoisting due à la référence à `mockVisit` externe. Résolution : utiliser `vi.fn()` inline dans la factory du mock et importer `router` directement depuis `@inertiajs/react` pour les assertions (pattern identique à Edit.test.tsx).

### Completion Notes List

- Route `show` ajoutée à `routines` resource dans `start/routes.ts` (tout en préservant les routes custom `attachMaterial`/`detachMaterial`)
- Méthode `show()` ajoutée dans `RoutinesController` avant `edit()`, avec ownership check IDOR et preload complet des categories + materials (type, storageLocation)
- Page `Routines/Show.tsx` créée avec : breadcrumb automatique via `<Layout title={routine.name}>`, boutons Modifier/Supprimer(placeholder)/Retour, sections Catégories/Contenu/Matériel utilisé
- Contenu affiché avec `white-space: pre-wrap` et `maxHeight: 400px` (scrollable si long)
- Navigation bidirectionnelle Routine → Matériel implémentée (clic sur matériel → `/materials/:id`)
- 12 nouveaux tests dans `Show.test.tsx` — 220/220 tests passent (zéro régression)

### File List

- `start/routes.ts` (modifié)
- `app/controllers/routines_controller.ts` (modifié)
- `inertia/pages/Routines/Show.tsx` (créé)
- `inertia/pages/Routines/Show.test.tsx` (créé)

## Change Log

- 2026-03-22 : Implémentation complète de Story 4.5 — route show, controller show(), page Routines/Show.tsx, 12 tests. 220/220 tests passent.
