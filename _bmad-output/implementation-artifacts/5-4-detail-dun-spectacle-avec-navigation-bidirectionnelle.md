# Story 5.4: Détail d'un Spectacle avec Navigation Bidirectionnelle

Status: done

## Story

As a **utilisateur**,
I want **voir tous les détails d'un spectacle avec ses routines liées**,
so that **je peux consulter mon spectacle et naviguer vers les routines et matériel** (FR44).

## Acceptance Criteria

**Scenario 1 : Breadcrumb**
- **Given** je clique sur un spectacle depuis /shows
- **When** je suis redirigé vers /shows/:id
- **Then** le breadcrumb affiche : Accueil > Spectacles > [Nom du spectacle]

**Scenario 2 : Affichage du détail**
- **Given** je suis sur la page détail /shows/:id
- **When** la page se charge
- **Then** je vois :
  - Nom (titre principal)
  - Notes (lecture seule, si définies, retours à la ligne préservés)
  - Section "Routines du spectacle" (liste routines liées)
  - Bouton "Générer checklist" (primary)
  - Bouton "Modifier"
  - Bouton "Supprimer" (danger)

**Scenario 3 : Affichage des notes**
- **Given** le spectacle a des notes
- **When** j'affiche les notes
- **Then** le texte est affiché avec retours à la ligne préservés (whiteSpace: pre-wrap)

**Scenario 4 : Navigation vers les routines**
- **Given** le spectacle a des routines liées
- **When** j'affiche la section "Routines du spectacle"
- **Then** chaque routine affiche : Nom + Catégorie(s) (Tags Ant Design)
- **And** chaque routine est cliquable (cursor: pointer)
- **When** je clique sur une routine
- **Then** je suis redirigé vers /routines/:id (Story 4.5)
- **And** navigation bidirectionnelle complète : Spectacle → Routine → Matériel

**Scenario 5 : Empty state routines**
- **Given** le spectacle n'a pas de routines liées
- **When** j'affiche la section
- **Then** le texte affiche : "Aucune routine dans ce spectacle"

**Scenario 6 : Boutons d'action**
- **Given** je suis sur la page détail
- **When** je clique sur "Modifier"
- **Then** je suis redirigé vers /shows/:id/edit
- **When** je clique sur "Générer checklist" (primary)
- **Then** je suis redirigé vers /shows/:id/checklist (Story 5.5)
- **And** le bouton "Supprimer" est visible mais désactivé (activé en Story 5.7)

## Tasks / Subtasks

### Backend — Route (AC: 1–6)

- [x] Modifier `start/routes.ts` (AC: 1–6)
  - [x] Ajouter `'show'` dans le `.only([...])` du resource shows
  - [x] Route résultante : `GET /shows/:id` → `ShowsController.show`

### Backend — Controller (AC: 2–5)

- [x] Ajouter méthode `show()` dans `app/controllers/shows_controller.ts` (AC: 2–5)
  - [x] Query : `Show.query().where('user_id', auth.user!.id).where('id', params.id).preload('routines', q => q.preload('categories')).firstOrFail()`
  - [x] Mapper : `{ id, name, notes, createdAt, routines: [{ id, name, categories }] }`
  - [x] `return inertia.render('Shows/Show', { show: {...} })`

### Frontend — Shows/Show.tsx (AC: 1–6)

- [x] Créer `inertia/pages/Shows/Show.tsx` (AC: 1–6)
  - [x] Interface `RoutineItem { id: number; name: string; categories: { id: number; name: string }[] }`
  - [x] Interface `ShowDetail { id: number; name: string; notes: string | null; routines: RoutineItem[]; createdAt: string }`
  - [x] Interface `Props { show: ShowDetail }`
  - [x] `<Layout title={show.name}>` pour breadcrumb (layout gère le titre dans la sidebar)
  - [x] `<Typography.Title level={1}>{show.name}</Typography.Title>`
  - [x] Boutons actions en `<Space style={{ marginBottom: 16 }}>` :
    - `<Button type="primary" onClick={() => router.visit(\`/shows/${show.id}/checklist\`)}>Générer checklist</Button>`
    - `<Button type="primary" onClick={() => router.visit(\`/shows/${show.id}/edit\`)}>Modifier</Button>`
    - `<Button danger disabled>Supprimer</Button>` (activé en Story 5.7)
  - [x] Notes : `if show.notes` → `<Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>{show.notes}</Typography.Paragraph>`
  - [x] `<Typography.Title level={3}>Routines du spectacle</Typography.Title>`
  - [x] Si `show.routines.length === 0` → `<Typography.Text type="secondary">Aucune routine dans ce spectacle</Typography.Text>`
  - [x] Sinon → `<List dataSource={show.routines} renderItem={(r) => <List.Item style={{ cursor: 'pointer' }} onClick={() => router.visit(\`/routines/${r.id}\`)}>...`
  - [x] Chaque List.Item : `<List.Item.Meta title={r.name} description={<Space>{r.categories.map(c => <Tag key={c.id}>{c.name}</Tag>)}</Space>} />`

### Tests — Shows/Show.test.tsx (AC: 1–6)

- [x] Créer `inertia/pages/Shows/Show.test.tsx` (AC: 1–6)
  - [x] Mock `@inertiajs/react` : `router.visit`, `usePage` avec `url: '/shows/1'`
  - [x] Mock `~/components/Layout`
  - [x] `sampleShow` : spectacle avec notes + 2 routines (chacune avec catégories)
  - [x] `showNoRoutines` : spectacle sans routines, notes null
  - [x] Test : affiche le nom du spectacle en titre
  - [x] Test : affiche les notes avec `whiteSpace: pre-wrap` (style)
  - [x] Test : n'affiche pas de section notes si `notes=null`
  - [x] Test : affiche les noms des routines
  - [x] Test : affiche les catégories des routines (Tags)
  - [x] Test : clic routine → `router.visit('/routines/10')`
  - [x] Test : empty state "Aucune routine dans ce spectacle" si `routines=[]`
  - [x] Test : bouton "Modifier" → `router.visit('/shows/1/edit')`
  - [x] Test : bouton "Générer checklist" → `router.visit('/shows/1/checklist')`
  - [x] Test : bouton "Supprimer" est `disabled`
  - [x] Lancer `npx vitest run` — 291 tests (279 existants + 12 nouveaux), 0 régression

## Dev Notes

### 🎯 Scope Story 5.4

Cette story ajoute la **page détail `/shows/:id`** uniquement.
- Pas de checklist interactive → Story 5.5
- Pas de delete fonctionnel → Story 5.7
- Pas de modification → route `/shows/:id/edit` déjà implémentée (Story 5.2)
- Infrastructure Shows (model, migrations, controller CRUD partiel) déjà complète

**Ce qui n'est PAS dans cette story :**
- Checklist interactive → Story 5.5
- Modification du spectacle → déjà fait Story 5.2
- Suppression → Story 5.7
- Recherche spectacles → Story 5.8

### 🔥 Backend — Route (ajouter 'show')

```typescript
// start/routes.ts — ligne ~53
// AVANT :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'edit', 'update'])

// APRÈS :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
```

### 🔥 Backend — Controller show()

```typescript
// app/controllers/shows_controller.ts — ajouter AVANT create()
async show({ params, auth, inertia }: HttpContext) {
  const show = await Show.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('routines', (q) => q.preload('categories'))
    .firstOrFail()

  return inertia.render('Shows/Show', {
    show: {
      id: show.id,
      name: show.name,
      notes: show.notes,
      createdAt: show.createdAt.toISO() ?? '',
      routines: show.routines.map((r) => ({
        id: r.id,
        name: r.name,
        categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
      })),
    },
  })
}
```

**Pattern identique à `RoutinesController.show()` :** [Source: app/controllers/routines_controller.ts#60]

### 🔥 Frontend — Shows/Show.tsx (pattern complet)

Modèle : `inertia/pages/Routines/Show.tsx` (pattern maître Story 4.5).

**Différences avec RoutinesShow :**
- Titre principal = nom du spectacle (même)
- Pas de contenu rich text (juste des notes texte brut)
- Section "Routines du spectacle" au lieu de "Matériel utilisé"
- Chaque routine est cliquable → `/routines/:id` (navigation bidirectionnelle)
- Chaque routine affiche ses catégories (Tags)
- Bouton delete désactivé (Story 5.7)

```tsx
import { router } from '@inertiajs/react'
import { Button, List, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface RoutineItem {
  id: number
  name: string
  categories: { id: number; name: string }[]
}

interface ShowDetail {
  id: number
  name: string
  notes: string | null
  routines: RoutineItem[]
  createdAt: string
}

interface Props {
  show: ShowDetail
}

export default function ShowsShow({ show }: Props) {
  return (
    <Layout title={show.name}>
      <Typography.Title level={1}>{show.name}</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => router.visit(`/shows/${show.id}/checklist`)}>
          Générer checklist
        </Button>
        <Button onClick={() => router.visit(`/shows/${show.id}/edit`)}>
          Modifier
        </Button>
        <Button danger disabled>
          Supprimer
        </Button>
      </Space>

      {show.notes && (
        <>
          <Typography.Title level={3}>Notes</Typography.Title>
          <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
            {show.notes}
          </Typography.Paragraph>
        </>
      )}

      <Typography.Title level={3}>Routines du spectacle</Typography.Title>
      {show.routines.length === 0 ? (
        <Typography.Text type="secondary">Aucune routine dans ce spectacle</Typography.Text>
      ) : (
        <List
          dataSource={show.routines}
          renderItem={(r) => (
            <List.Item
              key={r.id}
              style={{ cursor: 'pointer' }}
              onClick={() => router.visit(`/routines/${r.id}`)}
            >
              <List.Item.Meta
                title={<span style={{ fontWeight: 500 }}>{r.name}</span>}
                description={
                  r.categories.length > 0 ? (
                    <Space wrap>
                      {r.categories.map((c) => (
                        <Tag key={c.id}>{c.name}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <span>—</span>
                  )
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

### 🔥 Tests — Shows/Show.test.tsx (pattern)

Modèle : `inertia/pages/Routines/Show.test.tsx`

```typescript
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShowsShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/shows/1', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleShow = {
  id: 1,
  name: 'Spectacle Cocktail',
  notes: 'Note de préparation\nDeuxième ligne',
  createdAt: '2026-01-15T12:00:00.000Z',
  routines: [
    { id: 10, name: 'Routine Cartes', categories: [{ id: 1, name: 'Magie des cartes' }] },
    { id: 11, name: 'Routine Pièces', categories: [] },
  ],
}

const showNoRoutines = {
  id: 2,
  name: 'Soirée Corporate',
  notes: null,
  createdAt: '2026-02-01T12:00:00.000Z',
  routines: [],
}

describe('ShowsShow', () => {
  beforeEach(() => vi.clearAllMocks())

  // Tests à implémenter...
})
```

**Tests critiques à écrire :**
1. Affiche le nom du spectacle en titre h1
2. Affiche les notes (Spectacle Cocktail)
3. Notes : retours à la ligne préservés (style `whiteSpace: 'pre-wrap'`)
4. Notes null → section Notes absente
5. Affiche les noms des routines ("Routine Cartes", "Routine Pièces")
6. Affiche les catégories (Tag "Magie des cartes")
7. Clic sur routine → `router.visit('/routines/10')`
8. Empty state "Aucune routine dans ce spectacle" si `routines=[]`
9. Bouton "Modifier" → `router.visit('/shows/1/edit')`
10. Bouton "Générer checklist" → `router.visit('/shows/1/checklist')`
11. Bouton "Supprimer" est `disabled`

### ⚠️ Points d'Attention

**1. Route `show` absente**
La route `GET /shows/:id` n'existe pas encore — elle est bloquée par `.only(['index', 'create', 'store', 'edit', 'update'])`. Bien ajouter `'show'`.

**2. firstOrFail() = 404 automatique**
AdonisJS lance une exception 404 automatiquement si l'ID n'existe pas ou n'appartient pas à l'utilisateur. Pas besoin de gestion d'erreur manuelle.

**3. Bouton Supprimer désactivé**
Le bouton `Supprimer` est rendu `disabled` — il sera activé en Story 5.7 qui ajoutera la route `destroy` et la méthode controller. Ne pas ajouter la route `destroy` ni la méthode `destroy()` dans cette story.

**4. Bouton "Générer checklist" — navigation vers Story 5.5**
Le bouton navigue vers `/shows/:id/checklist` — cette route n'existe pas encore. Elle sera créée en Story 5.5. Le bouton sera fonctionnel une fois Story 5.5 implémentée.

**5. Breadcrumb via Layout**
Le composant `Layout` gère le breadcrumb automatiquement via la prop `title`. Vérifier que `<Layout title={show.name}>` génère bien `Accueil > Spectacles > [Nom]` en inspectant `inertia/components/Layout.tsx`. Si le Layout ne gère pas ce niveau de breadcrumb, adapter en ajoutant un composant `Breadcrumb` Ant Design manuellement.

**6. Navigation bidirectionnelle**
- Spectacle (`/shows/:id`) → Routine (`/routines/:id`) : via clic sur routine (cette story)
- Routine (`/routines/:id`) → Matériel (`/materials/:id`) : déjà implémenté Story 4.5
- Navigation complète : `/shows/:id` → `/routines/:id` → `/materials/:id` ✓

**7. Preload routines + categories**
Pattern identique à `shows_controller.ts#edit()` qui fait déjà `.preload('routines', (q) => q.preload('categories'))`. Réutiliser exactement le même pattern.

**8. Relation `routines` dans Show model**
La relation `ManyToMany` via `routine_show` est déjà déclarée dans `app/models/show.ts`. Pas de modification du modèle nécessaire.

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
start/routes.ts                            ← Ajouter 'show' au resource shows
app/controllers/shows_controller.ts        ← Ajouter méthode show()

Fichiers à CRÉER :
inertia/pages/Shows/Show.tsx               ← Page détail spectacle
inertia/pages/Shows/Show.test.tsx          ← Tests unitaires

Fichiers NON modifiés :
app/models/show.ts                         ← Déjà complet (preload compatible)
app/models/routine.ts                      ← Déjà complet (categories relation)
inertia/pages/Shows/Index.tsx              ← Pas touché
inertia/pages/Shows/Edit.tsx               ← Pas touché
inertia/pages/Shows/Create.tsx             ← Pas touché
```

### 📝 Learnings des Stories Précédentes

**Story 5.3 (liste spectacles — améliorations code review) :**
- `toISO() ?? ''` — null guard requis pour les dates Luxon
- Tests: `.limit(200)` sur les queries index
- `data-testid` sur les éléments cliquables pour les tests
- Accessibilité: `tabIndex`, `role`, `aria-label`, `onKeyDown` pour les éléments cliquables non-button

**Story 5.2 (notes spectacle) :**
- Show model : `notes: string | null` (nullable)
- Flash messages via `session.flash()` → affiché par `Layout.tsx`

**Story 5.1 (création spectacle) :**
- Route resource shows : `.only(['create', 'store'])` → étendu en 5.3
- `createShowValidator` utilise `request.validateUsing()`
- `logger` importé depuis `@adonisjs/core/services/logger`

**Story 4.5 (détail routine — pattern maître navigation bidirectionnelle) :**
- Pattern complet `Routines/Show.tsx` : Typography.Title, Space boutons, List cliquable
- `List.Item style={{ cursor: 'pointer' }} onClick={() => router.visit(...)}`
- Naviguer vers materials depuis routine → `router.visit('/materials/${m.id}')`
- `router.delete()` pour suppression (pas dans cette story — Story 5.7)

**Convention tests actuels :**
- 279 tests existants (après Story 5.3 + code review)
- `vi.clearAllMocks()` dans `beforeEach`
- Mock complet `@inertiajs/react` avec `router: { visit: vi.fn(), delete: vi.fn() }`
- `npx vitest run` pour vérifier 0 régression

### Project Structure Notes

- Controller : `app/controllers/shows_controller.ts` (modifier, pas créer)
- Frontend : `inertia/pages/Shows/Show.tsx` (créer)
- Tests co-localisés : `inertia/pages/Shows/Show.test.tsx`
- Route ajoutée dans : `start/routes.ts` (ligne ~53)

### References

- Pattern Controller show (routines) : [Source: app/controllers/routines_controller.ts#60]
- Pattern RoutinesShow : [Source: inertia/pages/Routines/Show.tsx]
- Shows Edit (preload pattern) : [Source: app/controllers/shows_controller.ts#edit]
- Show model (routines relation) : [Source: app/models/show.ts]
- Routes shows actuelles : [Source: start/routes.ts#53]
- Epic 5 Story 5.4 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.4]
- Story 5.3 (learnings) : [Source: _bmad-output/implementation-artifacts/5-3-liste-des-spectacles.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun problème rencontré — implémentation directe selon les specs.

### Completion Notes List

- Route `GET /shows/:id` ajoutée via `'show'` dans `.only([...])` du resource shows
- Méthode `show()` ajoutée dans ShowsController : query avec `where('user_id')` + `preload('routines', q => q.preload('categories'))` + `firstOrFail()`
- Page `Shows/Show.tsx` créée : titre Typography.Title, boutons (Générer checklist primary, Modifier, Supprimer disabled), notes avec `whiteSpace: pre-wrap`, List routines cliquables avec Tags catégories, empty state
- Navigation bidirectionnelle : `/shows/:id` → `/routines/:id` (→ `/materials/:id` déjà fait en Story 4.5)
- 12 tests ajoutés : titre, notes/pre-wrap, notes absentes, routines, catégories, clic routine, empty state, Modifier, Générer checklist, Supprimer disabled
- 291 tests totaux, 0 régression (cycle RED-GREEN validé)

### File List

start/routes.ts
app/controllers/shows_controller.ts
inertia/pages/Shows/Show.tsx
inertia/pages/Shows/Show.test.tsx

## Change Log

- 2026-03-22 : Implémentation Story 5.4 — Page détail spectacle avec navigation bidirectionnelle (route GET /shows/:id, controller show(), Shows/Show.tsx, 12 tests)
- 2026-03-22 : Code review — Fixes : accessibilité List.Item (tabIndex/role/aria-label/onKeyDown), data-testid routines, type="primary" bouton Modifier, test h1 via getByRole, test pre-wrap vérifie style.whiteSpace, test breadcrumb via data-title, test navigation clavier. 293 tests (0 régression).
