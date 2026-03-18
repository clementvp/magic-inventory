# Story 2.4: Vue Contenu d'un Lieu de Stockage

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **voir tout le contenu d'un lieu de stockage spécifique**,
so that **je peux rapidement voir ce qui est rangé à un endroit donné** (FR20).

## Acceptance Criteria

**Scenario 1 : Navigation depuis la liste vers le détail**
- **Given** je suis sur /storage-locations
- **When** je clique sur le nom d'un lieu
- **Then** je suis redirigé vers /storage-locations/:id
- **And** le breadcrumb affiche : Accueil > Lieux de Stockage > [Nom du lieu]

**Scenario 2 : Affichage du titre et de la liste des matériels**
- **Given** je suis sur /storage-locations/:id
- **When** la page se charge
- **Then** le titre du lieu est affiché en Typography.Title (h1)
- **And** la liste Ant Design des matériels rangés dans ce lieu est affichée

**Scenario 3 : Détails de chaque item de matériel**
- **Given** le lieu contient du matériel
- **When** la liste est affichée
- **Then** chaque item affiche : **Nom, Type, Catégorie(s), Auteur**
- **And** chaque item est cliquable pour accéder à la fiche complète du matériel (/materials/:id)

**Scenario 4 : Empty state (lieu vide)**
- **Given** le lieu ne contient aucun matériel
- **When** la page se charge
- **Then** Ant Design `Empty` est affiché avec le message "Aucun matériel dans ce lieu"
- **And** un bouton "Ajouter un matériel" est présent

**Scenario 5 : Modifier le lieu depuis le détail**
- **Given** je suis sur la page détail
- **When** je clique sur "Modifier le lieu"
- **Then** un Modal Ant Design s'ouvre avec le nom pré-rempli
- **And** la soumission met à jour le lieu (MÊME comportement que Story 2.3)

**Scenario 6 : Supprimer le lieu depuis le détail**
- **Given** je suis sur la page détail
- **When** je clique sur "Supprimer le lieu"
- **Then** un Popconfirm Ant Design s'affiche
- **And** la suppression fonctionne (MÊME comportement que Story 2.3)
- **And** après suppression, redirection vers /storage-locations

**Note Scope Epic 2 :** En Epic 2, la table `materials` n'existe pas encore. La liste sera toujours vide (empty state). Les relations et le chargement réel du matériel seront implémentés en Epic 3.

## Tasks / Subtasks

### Backend — Controller : méthode show (AC: 1, 2, 3, 4)

- [x] Ajouter `show({ params, auth, inertia })` dans `app/controllers/storage_locations_controller.ts` (AC: 1, 2, 3, 4)
  - [x] Récupérer le lieu avec isolation multi-tenant : `.where('id', params.id).where('user_id', auth.user!.id).firstOrFail()`
  - [x] ⚠️ `materials = []` hardcodé en Epic 2 (table materials absente — Epic 3 ajoutera `.related('materials').query()`)
  - [x] `inertia.render('StorageLocations/Show', { location: { id, name, createdAt }, materials })`

### Backend — Routes (AC: 1)

- [x] Modifier `start/routes.ts`
  - [x] Ajouter `'show'` dans `.only(['index', 'show', 'store', 'update', 'destroy'])`
  - [x] Vérifie que la route nommée `storage-locations.show` est disponible

### Frontend — Index.tsx : nom du lieu cliquable (AC: 1)

- [x] Modifier `inertia/pages/StorageLocations/Index.tsx`
  - [x] Importer `Link` depuis `@inertiajs/react`
  - [x] Dans la colonne `Nom` de la Table, remplacer le texte brut par `<Link href={`/storage-locations/${record.id}`}>{record.name}</Link>`

### Frontend — Page StorageLocations/Show (AC: 1, 2, 3, 4, 5, 6)

- [x] Créer `inertia/pages/StorageLocations/Show.tsx` (AC: 1, 2, 3, 4, 5, 6)
  - [x] Props : `{ location: StorageLocationDetail, materials: MaterialItem[] }`
  - [x] Layout wrapper
  - [x] `Typography.Title` avec le nom du lieu
  - [x] Boutons : "Modifier le lieu" (ouvre modal edit) + Popconfirm "Supprimer le lieu"
  - [x] Si `materials.length > 0` : `List` Ant Design avec chaque item cliquable via `Link href="/materials/:id"`
  - [x] Si `materials.length === 0` : `Empty` avec message "Aucun matériel dans ce lieu" + bouton "Ajouter un matériel"
  - [x] Modal de modification (même pattern que Index.tsx — Form instance `editForm`, état `editModalOpen`, `editLoading`)
  - [x] Soumission modification via `router.put('/storage-locations/:id', ...)`
  - [x] Soumission suppression via `router.delete('/storage-locations/:id', ...)` + `onSuccess: () => router.visit('/storage-locations')`

### Tests Frontend (AC: 1, 2, 3, 4, 5, 6)

- [x] Créer `inertia/pages/StorageLocations/Show.test.tsx`
  - [x] Mock `@inertiajs/react` (router.put, router.delete, router.visit, Link, usePage)
  - [x] Mock `~/components/Layout`
  - [x] Test : titre du lieu affiché
  - [x] Test : boutons "Modifier le lieu" et "Supprimer le lieu" présents
  - [x] Test : liste matériels affichée si non vide
  - [x] Test : Empty state affiché si liste vide
  - [x] Test : clic "Modifier" → modal s'ouvre pré-rempli
  - [x] Test : `router.put` appelé lors de la soumission modification
  - [x] Test : `router.delete` appelé lors de la confirmation suppression
  - [x] Lancer `npx vitest run` — 0 régression (86 → 96 tests)

### Validation Finale (AC: Tous)

- [x] Vérifier flow complet :
  - [x] Clic sur nom lieu dans Index → redirection vers /storage-locations/:id
  - [x] Breadcrumb : Accueil > Lieux de Stockage > [Nom du lieu]
  - [x] Empty state affiché (Epic 2 = pas de matériels)
  - [x] Modifier lieu depuis Show → nom mis à jour, flash success
  - [x] Supprimer lieu depuis Show → redirection vers /storage-locations, flash success
  - [x] Isolation : /storage-locations/999 (autre user) → 404
- [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🔥 Patterns Critiques — MÊME PATTERN que Story 2.3

**⚠️ PAS de nouvelle migration / model / validator pour cette story**
Tout le backend de stockage existe déjà (Story 2.3). On ajoute UNIQUEMENT `show()` au controller et la page frontend.

**Méthode `show()` à ajouter dans `StorageLocationsController` :**

```typescript
async show({ params, auth, inertia }: HttpContext) {
  const location = await StorageLocation.query()
    .where('id', params.id)
    .where('user_id', auth.user!.id)  // Isolation multi-tenant CRITIQUE
    .firstOrFail()                      // 404 automatique si non trouvé

  // ⚠️ materialsCount = [] en Epic 2 (table materials pas encore créée)
  // En Epic 3, remplacer par :
  // const materials = await location.related('materials').query()
  //   .preload('type').preload('categories')
  const materials: MaterialItem[] = []

  return inertia.render('StorageLocations/Show', {
    location: {
      id: location.id,
      name: location.name,
      createdAt: location.createdAt,
    },
    materials,
  })
}
```

**Route : ajouter 'show' dans `.only()`**

```typescript
// start/routes.ts
router.resource('storage-locations', StorageLocationsController)
  .only(['index', 'store', 'update', 'destroy', 'show'])
// Génère en PLUS : GET /storage-locations/:id → storage-locations.show
```

**Index.tsx — Rendre le nom cliquable :**

```typescript
// AVANT
{ title: 'Nom', dataIndex: 'name', key: 'name' }

// APRÈS
{
  title: 'Nom',
  dataIndex: 'name',
  key: 'name',
  render: (name: string, record: StorageLocationItem) => (
    <Link href={`/storage-locations/${record.id}`}>{name}</Link>
  ),
}
```

**Interfaces TypeScript pour Show.tsx :**

```typescript
interface StorageLocationDetail {
  id: number
  name: string
  createdAt: string
}

interface MaterialItem {
  id: number
  name: string
  type?: string
  categories?: string[]
  author?: string
}

interface Props {
  location: StorageLocationDetail
  materials: MaterialItem[]
}
```

**Page Show.tsx — structure complète :**

```tsx
// inertia/pages/StorageLocations/Show.tsx
import { router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Empty, Form, Input, List, Modal, Popconfirm, Typography } from 'antd'
import Layout from '~/components/Layout'

export default function StorageLocationsShow({ location, materials }: Props) {
  const [editForm] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleEdit = () => {
    editForm.setFieldsValue({ name: location.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    setEditLoading(true)
    router.put(`/storage-locations/${location.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = () => {
    setDeletingId(location.id)
    router.delete(`/storage-locations/${location.id}`, {
      onSuccess: () => router.visit('/storage-locations'),
      onFinish: () => setDeletingId(null),
    })
  }

  return (
    <Layout>
      <Typography.Title level={1}>{location.name}</Typography.Title>

      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleEdit} style={{ marginRight: 8 }}>Modifier le lieu</Button>
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer ce lieu ?"
          onConfirm={handleDelete}
          okText="Supprimer"
          cancelText="Annuler"
        >
          <Button danger loading={deletingId === location.id}>Supprimer le lieu</Button>
        </Popconfirm>
      </div>

      {materials.length > 0 ? (
        <List
          dataSource={materials}
          renderItem={(material) => (
            <List.Item key={material.id}>
              <Link href={`/materials/${material.id}`}>
                <strong>{material.name}</strong>
                {material.type && <span> — {material.type}</span>}
                {material.categories?.length && <span> [{material.categories.join(', ')}]</span>}
                {material.author && <span> par {material.author}</span>}
              </Link>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Aucun matériel dans ce lieu" style={{ marginTop: 48 }}>
          <Button type="primary">
            <Link href="/materials/create">Ajouter un matériel</Link>
          </Button>
        </Empty>
      )}

      <Modal
        title="Modifier le lieu"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
```

**Pattern test :**

```typescript
// inertia/pages/StorageLocations/Show.test.tsx
import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StorageLocationsShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), delete: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/storage-locations/1', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockLocation = { id: 1, name: 'Tiroir cartes', createdAt: '2026-01-01T00:00:00.000Z' }
const mockMaterials = [
  { id: 1, name: 'Bicycle Standard', type: 'Jeu de cartes', categories: ['Cartomagie'], author: 'USPCC' },
  { id: 2, name: 'Thumb Tip', type: 'Accessoire', categories: ['Close-up'], author: 'Vernet' },
]

describe('StorageLocationsShow', () => {
  it('affiche le titre du lieu', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByRole('heading', { name: 'Tiroir cartes' })).toBeInTheDocument()
  })

  it('affiche les boutons Modifier et Supprimer', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByText('Modifier le lieu')).toBeInTheDocument()
    expect(screen.getByText('Supprimer le lieu')).toBeInTheDocument()
  })

  it('affiche empty state si aucun matériel', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByText('Aucun matériel dans ce lieu')).toBeInTheDocument()
    expect(screen.getByText('Ajouter un matériel')).toBeInTheDocument()
  })

  it('affiche la liste des matériels si non vide', async () => {
    render(<StorageLocationsShow location={mockLocation} materials={mockMaterials} />)
    await waitFor(() => {
      expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
      expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
    })
  })

  it('ouvre le modal de modification au clic Modifier', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByText('Modifier le lieu'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByText('Modifier le lieu'))
    const dialog = screen.getByRole('dialog')
    const submitButton = within(dialog).getByRole('button', { name: 'Modifier' })
    await user.click(submitButton)
    expect(router.put).toHaveBeenCalledWith(
      '/storage-locations/1',
      { name: 'Tiroir cartes' },
      expect.any(Object)
    )
  })

  it('appelle router.delete lors de la confirmation suppression', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    const deleteButtons = await screen.findAllByRole('button', { name: 'Supprimer le lieu' })
    await user.click(deleteButtons[0])
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Supprimer' }).length).toBeGreaterThan(0)
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Supprimer' })
    await user.click(confirmButtons[confirmButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith('/storage-locations/1', expect.any(Object))
  })
})
```

### ⚠️ Scope Epic 2 — Table materials non encore disponible

La page `Show.tsx` affiche **toujours un empty state** en Epic 2 car la table `materials` n'existe pas encore. Ce comportement est attendu. En Epic 3 :
- Ajouter relation `hasMany(() => Material)` sur `StorageLocation`
- Remplacer `materials: []` par la vraie requête dans `show()`
- Le bouton "Ajouter un matériel" pointera vers la vraie route de création

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
inertia/
  pages/
    StorageLocations/
      Show.tsx         ← Page détail lieu + liste matériels + modals
      Show.test.tsx    ← Tests 7+ cas
```

**Fichiers existants à MODIFIER :**
```
app/controllers/storage_locations_controller.ts  ← Ajouter show()
start/routes.ts                                  ← Ajouter 'show' dans .only()
inertia/pages/StorageLocations/Index.tsx         ← Nom du lieu → Link cliquable
```

**Fichiers NE PAS TOUCHER :**
- `database/migrations/` — aucune migration nécessaire
- `app/models/storage_location.ts` — aucun changement
- `app/validators/storage_locations/` — aucun changement
- `inertia/components/Layout.tsx` — aucun changement (breadcrumb auto via labelMap existant)

**Alignement architecture :**
- ✅ Page `Show.tsx` dans `inertia/pages/StorageLocations/` [Source: architecture.md#File Structure]
- ✅ Route `storage-locations.show` kebab-case [Source: architecture.md#Naming Conventions]
- ✅ Isolation multi-tenant `.where('user_id', auth.user!.id)` dans `show()` [Source: architecture.md#Security]

### Learnings des Stories Précédentes

**Story 2.3 — Patterns à réutiliser :**
- ✅ `firstOrFail()` pour 404 automatique (pas de try-catch dans `show()`)
- ✅ Loading state par ID `deletingId === location.id` (pas un bool global)
- ✅ Modal avec Form instance séparée + `resetFields()` dans `onCancel`
- ✅ `request.validateUsing()` HORS try-catch dans `update()`
- ✅ `import type { HttpContext }` (pas `import { HttpContext }`)

**Story 2.2 — Code review insights :**
- ✅ Loading states SÉPARÉS : ici `editLoading` + `deletingId`
- ✅ Test `router.put` : vérifier les bons arguments (pas juste `not.toHaveBeenCalled()`)
- ✅ Test `router.delete` : confirmer via Popconfirm

### Git Intelligence Summary

**Commits récents pertinents :**
- (non commité) Story 2.3 — `storage_locations_controller.ts`, `app/models/storage_location.ts`, `inertia/pages/StorageLocations/Index.tsx`, tests (86 tests)
- `5b8475e` : Story 2.2 — `types_controller.ts`, loading states séparés
- `478f885` : Story 2.1 — `categories_controller.ts`, defaults à l'inscription

**Pattern établi :**
- Stories implémentées comme unités atomiques (1 commit par story)
- 86 tests passent actuellement (0 échec)

### References

- **[Source: epics.md#Story 2.4]** — User story, 6 scénarios BDD, FR20
- **[Source: epics.md#Epic 2]** — Contexte : Organisation et Taxonomie
- **[Source: architecture.md#File Structure]** — `inertia/pages/StorageLocations/Show.tsx`
- **[Source: architecture.md#Naming Conventions]** — Route kebab-case, named route `storage-locations.show`
- **[Source: architecture.md#Security]** — Isolation multi-tenant systématique
- **[Source: 2-3-gestion-des-lieux-de-stockage.md#Dev Notes]** — Patterns CRUD, modals, loading states, tests

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive des artefacts et des stories 2.1, 2.2, 2.3

### Completion Notes List

**Phase Planification (2026-03-18):**
- ✅ Story auto-découverte depuis sprint-status.yaml (2-4-vue-contenu-dun-lieu-de-stockage = premier backlog)
- ✅ Analyse epics.md — 6 scénarios BDD extraits (FR20)
- ✅ Analyse architecture — patterns routes, nommage, isolation multi-tenant
- ✅ Analyse stories 2.3, 2.2, 2.1 — tous les patterns CRUD et code review intégrés
- ✅ CRITIQUE documenté : `firstOrFail()` sans try-catch dans `show()`
- ✅ CRITIQUE documenté : isolation multi-tenant `.where('user_id', auth.user!.id)` dans `show()`
- ✅ CRITIQUE documenté : `materials: []` hardcodé en Epic 2 (table materials absente)
- ✅ CRITIQUE documenté : `deletingId` pattern (pas boolean simple)
- ✅ CRITIQUE documenté : ajouter 'show' dans `.only()` des routes
- ✅ CRITIQUE documenté : rendre nom du lieu cliquable dans Index.tsx
- ✅ Pattern test documenté avec vérifications router.put et router.delete robustes
- ✅ Breadcrumb automatique via labelMap existant dans Layout.tsx (aucun changement nécessaire)

**Phase Implémentation (2026-03-18):**
- ✅ `show()` ajouté dans `StorageLocationsController` — isolation multi-tenant, materials: [] hardcodé, rendu StorageLocations/Show
- ✅ Interface `MaterialItem` ajoutée dans le controller (typage TypeScript propre)
- ✅ Routes mises à jour — `'show'` ajouté dans `.only()`
- ✅ `Index.tsx` modifié — colonne Nom rendue avec `<Link href="/storage-locations/:id">`
- ✅ `Show.tsx` créé — Layout, Typography.Title, List/Empty, Modal modifier, Popconfirm supprimer, `deletingId` pattern
- ✅ `Show.test.tsx` créé — 10 tests couvrant tous les ACs
- ✅ Suite complète : 96 tests, 0 échec (86 → 96)

### File List

**Nouveaux fichiers créés :**
- `inertia/pages/StorageLocations/Show.tsx`
- `inertia/pages/StorageLocations/Show.test.tsx`

**Fichiers modifiés :**
- `app/controllers/storage_locations_controller.ts`
- `start/routes.ts`
- `inertia/pages/StorageLocations/Index.tsx`
- `inertia/components/Layout.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 1.0 | Story créée — analyse exhaustive, patterns critiques documentés depuis stories 2.1, 2.2, 2.3 et architecture | SM Agent |
| 2026-03-18 | 1.1 | Story implémentée — show() controller, route show, Index.tsx Link, Show.tsx + Show.test.tsx (96 tests, 0 échec) | Dev Agent |
| 2026-03-18 | 1.2 | Code review fixes — H1: prop title sur Layout pour breadcrumb nom lieu, H2: message erreur destroy() générique, M3: onError au lieu de onFinish pour delete, L2: redirect().back() dans update(), M2+L1: tests renforcés (97 tests, 0 échec) | Review Agent |
