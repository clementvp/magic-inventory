# Story 5.5: Génération de Checklist Interactive

Status: done

## Story

As a **utilisateur**,
I want **générer une checklist de matériel pour mon spectacle avec emplacements**,
so that **je ne jamais oublier d'accessoire en prestation** (FR45, FR46, NFR3).

## Acceptance Criteria

**Scenario 1 : Navigation vers la checklist**
- **Given** je suis sur /shows/:id
- **When** je clique sur "Générer checklist"
- **Then** je suis redirigé vers /shows/:id/checklist
- **And** la page se charge en moins de 1 seconde (NFR3)

**Scenario 2 : Affichage du breadcrumb**
- **Given** je suis sur /shows/:id/checklist
- **When** la page se charge
- **Then** le breadcrumb affiche : Accueil > Spectacles > [Nom du spectacle] > Checklist

**Scenario 3 : Checklist avec matériel (FR45, FR46)**
- **Given** le spectacle a des routines liées avec du matériel
- **When** la checklist est générée
- **Then** je vois la liste complète du matériel nécessaire pour ce spectacle
- **And** le matériel est dédupliqué (si présent dans plusieurs routines, apparaît une seule fois)
- **And** chaque item affiche : Nom du matériel, Type (Tag), Lieu de stockage (FR46)

**Scenario 4 : Lieu de stockage**
- **Given** la checklist est affichée
- **When** j'examine un item avec un lieu défini
- **Then** le lieu de stockage est clairement indiqué (nom)
- **And** le lieu est cliquable → redirige vers /storage-locations/:id

**Scenario 5 : Lieu non défini**
- **Given** un matériel n'a pas de lieu défini
- **When** j'affiche la checklist
- **Then** le lieu affiche : "Lieu non défini" (style warning/orange)

**Scenario 6 : Checkboxes progressives**
- **Given** la checklist est affichée
- **When** je vois les items
- **Then** chaque item a une Checkbox Ant Design (non cochée par défaut)
- **And** je peux cocher progressivement les items

**Scenario 7 : Validation visuelle d'un item coché**
- **Given** je coche un item de la checklist
- **When** je clique sur la Checkbox
- **Then** l'item est visuellement marqué comme validé (texte barré + opacité réduite)
- **And** l'état est conservé en state React (réinitialisation à l'actualisation = comportement attendu)

**Scenario 8 : Checklist complète**
- **Given** je coche tous les items de la checklist
- **When** le dernier item est coché
- **Then** un message success s'affiche : "Checklist complète !"

**Scenario 9 : Empty state — aucune routine**
- **Given** le spectacle n'a aucune routine liée
- **When** j'accède à /shows/:id/checklist
- **Then** un message warning s'affiche : "Ce spectacle ne contient aucune routine"
- **And** aucune checklist n'est générée

**Scenario 10 : Empty state — aucun matériel**
- **Given** les routines du spectacle n'ont aucun matériel lié
- **When** la checklist est générée
- **Then** un message info s'affiche : "Aucun matériel nécessaire pour ce spectacle"

**Scenario 11 : Bouton retour**
- **Given** je suis sur /shows/:id/checklist
- **When** je clique sur "Retour au spectacle"
- **Then** je suis redirigé vers /shows/:id

## Tasks / Subtasks

### Backend — Route (AC: 1–10)

- [x] Ajouter route `GET /shows/:id/checklist` dans `start/routes.ts` (AC: 1)
  - [x] Après les routes shows existantes : `router.get('/shows/:id/checklist', [ShowsController, 'checklist'])`

### Backend — Controller (AC: 1–10)

- [x] Ajouter méthode `checklist()` dans `app/controllers/shows_controller.ts` (AC: 1–10)
  - [x] Query : `Show.query().where('user_id', auth.user!.id).where('id', params.id).preload('routines', q => q.preload('materials', mq => mq.preload('type').preload('storageLocation'))).firstOrFail()`
  - [x] Déduplication : utiliser `Map<number, MaterialData>` pour dédupliquer par `material.id`
  - [x] `hasRoutines = show.routines.length > 0`
  - [x] `materials = [...materialsMap.values()]`
  - [x] `return inertia.render('Shows/Checklist', { show: { id, name }, materials, hasRoutines })`

### Frontend — Shows/Checklist.tsx (AC: 1–11)

- [x] Créer `inertia/pages/Shows/Checklist.tsx` (AC: 1–11)
  - [x] Interface `ChecklistMaterial { id: number; name: string; type: { id: number; name: string } | null; storageLocation: { id: number; name: string } | null }`
  - [x] Interface `Props { show: { id: number; name: string }; materials: ChecklistMaterial[]; hasRoutines: boolean }`
  - [x] State : `const [checked, setChecked] = useState<Set<number>>(new Set())`
  - [x] `<Layout title={`Checklist — ${show.name}`}>`
  - [x] Bouton "Retour au spectacle" → `router.visit(\`/shows/${show.id}\`)`
  - [x] Si `!hasRoutines` → `<Alert type="warning" message="Ce spectacle ne contient aucune routine" />`
  - [x] Si `hasRoutines && materials.length === 0` → `<Alert type="info" message="Aucun matériel nécessaire pour ce spectacle" />`
  - [x] Si `checked.size === materials.length && materials.length > 0` → `<Alert type="success" message="Checklist complète !" />`
  - [x] Sinon → `<List>` avec chaque item :
    - `<Checkbox checked={checked.has(m.id)} onChange={...}>` avec toggle dans Set
    - Nom du matériel en texte (barré si coché : `textDecoration: 'line-through'`, `opacity: 0.5`)
    - Type : `<Tag>{m.type.name}</Tag>` ou `—`
    - Lieu : `<span style={{ cursor: 'pointer' }} onClick={() => router.visit(\`/storage-locations/${m.storageLocation.id}\`)}>{m.storageLocation.name}</span>` ou `<span style={{ color: 'orange' }}>Lieu non défini</span>`

### Tests — Shows/Checklist.test.tsx (AC: 1–11)

- [x] Créer `inertia/pages/Shows/Checklist.test.tsx` (AC: 1–11)
  - [x] Mock `@inertiajs/react` : `router.visit`, `usePage` avec `url: '/shows/1/checklist'`
  - [x] Mock `~/components/Layout`
  - [x] Données de test : `sampleProps` avec show + 3 matériaux (type + lieu, type sans lieu, ni type ni lieu)
  - [x] Données de test : `noRoutinesProps` (hasRoutines: false, materials: [])
  - [x] Données de test : `noMaterialsProps` (hasRoutines: true, materials: [])
  - [x] Test : affiche "Ce spectacle ne contient aucune routine" si `!hasRoutines`
  - [x] Test : affiche "Aucun matériel nécessaire pour ce spectacle" si `hasRoutines && materials.length === 0`
  - [x] Test : affiche les noms des matériaux
  - [x] Test : affiche le type (Tag)
  - [x] Test : affiche le lieu de stockage cliquable → `router.visit('/storage-locations/5')`
  - [x] Test : affiche "Lieu non défini" si `storageLocation === null`
  - [x] Test : coche un item → barré + opacité réduite
  - [x] Test : tous cochés → "Checklist complète !" visible
  - [x] Test : bouton "Retour au spectacle" → `router.visit('/shows/1')`
  - [x] Lancer `npx vitest run` — 305 tests (293 + 12), 0 régression

## Dev Notes

### 🎯 Scope Story 5.5

Cette story ajoute la **page checklist `/shows/:id/checklist`** uniquement.
- Route GET custom (pas dans le resource standard)
- Checklist 100% frontend (state React — pas de persistance DB)
- Déduplication matériel côté controller

**Ce qui n'est PAS dans cette story :**
- Suppression spectacle → Story 5.7
- Modification spectacle → déjà fait Story 5.2
- Recherche spectacles → Story 5.8
- Persistance de la checklist (localStorage ou DB) → hors scope

### 🔥 Backend — Route à ajouter

```typescript
// start/routes.ts — après les routes shows existantes
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
router.post('/shows/:id/routines', [ShowsController, 'attachRoutine'])
router.delete('/shows/:id/routines/:routineId', [ShowsController, 'detachRoutine'])
router.get('/shows/:id/checklist', [ShowsController, 'checklist'])  // ← AJOUTER ICI
```

### 🔥 Backend — Controller checklist()

```typescript
// app/controllers/shows_controller.ts — ajouter après show()
async checklist({ params, auth, inertia }: HttpContext) {
  const show = await Show.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('routines', (q) =>
      q.preload('materials', (mq) => mq.preload('type').preload('storageLocation'))
    )
    .firstOrFail()

  // Déduplication par material.id (un matériel peut être dans plusieurs routines)
  const materialsMap = new Map<
    number,
    {
      id: number
      name: string
      type: { id: number; name: string } | null
      storageLocation: { id: number; name: string } | null
    }
  >()

  for (const routine of show.routines) {
    for (const material of routine.materials) {
      if (!materialsMap.has(material.id)) {
        materialsMap.set(material.id, {
          id: material.id,
          name: material.name,
          type: material.type ? { id: material.type.id, name: material.type.name } : null,
          storageLocation: material.storageLocation
            ? { id: material.storageLocation.id, name: material.storageLocation.name }
            : null,
        })
      }
    }
  }

  return inertia.render('Shows/Checklist', {
    show: { id: show.id, name: show.name },
    materials: [...materialsMap.values()],
    hasRoutines: show.routines.length > 0,
  })
}
```

**Pattern :** déduplication via `Map<id, data>` — pattern simple et performant pour le volume attendu.
**Preload nested :** `q.preload('materials', mq => mq.preload('type').preload('storageLocation'))` — identique à `RoutinesController.show()`.
**Sécurité :** `where('user_id', auth.user!.id)` protège l'accès IDOR. `firstOrFail()` → 404 automatique si inexistant.

### 🔥 Frontend — Shows/Checklist.tsx (pattern complet)

```tsx
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Alert, Button, Checkbox, List, Space, Tag, Typography } from 'antd'
import Layout from '~/components/Layout'

interface ChecklistMaterial {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface Props {
  show: { id: number; name: string }
  materials: ChecklistMaterial[]
  hasRoutines: boolean
}

export default function ShowsChecklist({ show, materials, hasRoutines }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allChecked = materials.length > 0 && checked.size === materials.length

  return (
    <Layout title={`Checklist — ${show.name}`}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => router.visit(`/shows/${show.id}`)}>Retour au spectacle</Button>
      </Space>

      <Typography.Title level={1}>Checklist — {show.name}</Typography.Title>

      {!hasRoutines && (
        <Alert
          type="warning"
          message="Ce spectacle ne contient aucune routine"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasRoutines && materials.length === 0 && (
        <Alert
          type="info"
          message="Aucun matériel nécessaire pour ce spectacle"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {allChecked && (
        <Alert
          type="success"
          message="Checklist complète !"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {materials.length > 0 && (
        <List
          dataSource={materials}
          renderItem={(m) => (
            <List.Item key={m.id}>
              <Space align="start" style={{ width: '100%' }}>
                <Checkbox
                  checked={checked.has(m.id)}
                  onChange={() => toggle(m.id)}
                  aria-label={`Cocher ${m.name}`}
                />
                <div style={{ opacity: checked.has(m.id) ? 0.5 : 1 }}>
                  <span
                    style={{
                      fontWeight: 500,
                      textDecoration: checked.has(m.id) ? 'line-through' : 'none',
                    }}
                  >
                    {m.name}
                  </span>
                  <div>
                    <Space>
                      <span>
                        Type : {m.type ? <Tag>{m.type.name}</Tag> : <span>—</span>}
                      </span>
                      <span>
                        Lieu :{' '}
                        {m.storageLocation ? (
                          <span
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Aller au lieu ${m.storageLocation.name}`}
                            onClick={() => router.visit(`/storage-locations/${m.storageLocation!.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ')
                                router.visit(`/storage-locations/${m.storageLocation!.id}`)
                            }}
                          >
                            {m.storageLocation.name}
                          </span>
                        ) : (
                          <span style={{ color: 'orange' }}>Lieu non défini</span>
                        )}
                      </span>
                    </Space>
                  </div>
                </div>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Layout>
  )
}
```

### 🔥 Tests — Shows/Checklist.test.tsx (pattern)

Modèle : `inertia/pages/Shows/Show.test.tsx`

```typescript
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShowsChecklist from './Checklist'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/shows/1/checklist', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleProps = {
  show: { id: 1, name: 'Spectacle Cocktail' },
  hasRoutines: true,
  materials: [
    {
      id: 10,
      name: 'Jeu de cartes',
      type: { id: 1, name: 'Cartes' },
      storageLocation: { id: 5, name: 'Tiroir cartes' },
    },
    {
      id: 11,
      name: 'Foulard rouge',
      type: { id: 2, name: 'Accessoire' },
      storageLocation: null,
    },
    {
      id: 12,
      name: 'Pièce truquée',
      type: null,
      storageLocation: { id: 6, name: 'Boîte pièces' },
    },
  ],
}

const noRoutinesProps = {
  show: { id: 2, name: 'Show vide' },
  hasRoutines: false,
  materials: [],
}

const noMaterialsProps = {
  show: { id: 3, name: 'Show sans matériel' },
  hasRoutines: true,
  materials: [],
}

describe('ShowsChecklist', () => {
  beforeEach(() => vi.clearAllMocks())
  // Tests...
})
```

**Tests critiques à écrire :**
1. Affiche warning "Ce spectacle ne contient aucune routine" si `!hasRoutines`
2. Affiche info "Aucun matériel nécessaire pour ce spectacle" si `hasRoutines && materials.length === 0`
3. Affiche les noms des matériaux ("Jeu de cartes", "Foulard rouge", "Pièce truquée")
4. Affiche le type en Tag ("Cartes")
5. Affiche "—" si type null
6. Lieu cliquable → `router.visit('/storage-locations/5')`
7. Affiche "Lieu non défini" si `storageLocation === null` (style orange)
8. Clic Checkbox → item barré + opacité réduite
9. Tous cochés → "Checklist complète !" visible
10. "Checklist complète !" absent si pas tous cochés
11. Bouton "Retour au spectacle" → `router.visit('/shows/1')`

### ⚠️ Points d'Attention

**1. Route custom (pas dans resource)**
La route `GET /shows/:id/checklist` n'est pas une action REST standard. Elle doit être déclarée séparément avec `router.get(...)` et non via `router.resource(...).only([...])`. L'ajouter APRÈS les routes resource et custom shows existantes.

**2. Déduplication côté controller, pas frontend**
Si un matériel est lié à plusieurs routines d'un même spectacle, il ne doit apparaître qu'une fois dans la checklist. La déduplication se fait via `Map<number, data>` dans le controller pour que le frontend reçoive des données déjà propres.

**3. Preload nested profond**
La query `preload('routines', q => q.preload('materials', mq => mq.preload('type').preload('storageLocation')))` est une triple profondeur. Pattern identique à RoutinesController.show() pour `preload('materials', ...)`, mais ajout du preload routines autour.

**4. hasRoutines vs materials.length**
Deux empty states distincts :
- `!hasRoutines` → le spectacle n'a pas de routines (warning)
- `hasRoutines && materials.length === 0` → les routines existent mais aucun matériel (info)
Ces deux cas sont mutuellement exclusifs et doivent être testés séparément.

**5. Accessibilité du lieu cliquable**
Le span du lieu doit avoir `role="button"`, `tabIndex={0}`, `aria-label`, `onKeyDown` — même pattern que les List.Item cliquables des stories précédentes (retour code review Story 5.3/5.4).

**6. State React suffit (pas localStorage)**
L'état des checkboxes est en state React local — réinitialisation à l'actualisation de la page. C'est le comportement attendu (checklist de préparation avant le spectacle). Ne pas ajouter localStorage sauf demande explicite.

**7. Nombre de tests actuel**
Après Story 5.4 + code review : 293 tests. La commande de vérification reste `npx vitest run`.

**8. firstOrFail() = 404 automatique**
Si l'ID du spectacle n'existe pas ou n'appartient pas à l'utilisateur, AdonisJS lève automatiquement une exception 404. Pas de gestion d'erreur manuelle.

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
start/routes.ts                            ← Ajouter route GET /shows/:id/checklist
app/controllers/shows_controller.ts        ← Ajouter méthode checklist()

Fichiers à CRÉER :
inertia/pages/Shows/Checklist.tsx          ← Page checklist interactive
inertia/pages/Shows/Checklist.test.tsx     ← Tests unitaires

Fichiers NON modifiés :
app/models/show.ts                         ← Déjà complet (routines relation)
app/models/material.ts                     ← Déjà complet (type + storageLocation)
app/models/routine.ts                      ← Déjà complet (materials relation)
inertia/pages/Shows/Show.tsx               ← Bouton "Générer checklist" déjà en place
```

### 📝 Learnings des Stories Précédentes

**Story 5.4 (détail spectacle — code review) :**
- Accessibilité : `tabIndex`, `role`, `aria-label`, `onKeyDown` sur les éléments cliquables non-button
- `data-testid` sur les éléments cliquables pour les tests ciblés
- Tests accessibles : `getByRole('heading', { level: 1 })` plutôt que querySelector
- Bouton "Générer checklist" → `router.visit(\`/shows/${show.id}/checklist\`)` DÉJÀ IMPLÉMENTÉ en Show.tsx

**Story 5.3 (liste spectacles — code review) :**
- `toISO() ?? ''` — null guard requis pour les dates Luxon
- `.limit(200)` sur les queries index (pas applicable ici — query par ID)

**Story 4.5 (détail routine — pattern maître matériel) :**
- Pattern complet `Routines/Show.tsx` pour afficher matériel avec type + lieu
- `Type : {m.type ? <Tag>{m.type.name}</Tag> : '—'}`
- `Lieu : {m.storageLocation ? m.storageLocation.name : '—'}`
- Dans Checklist.tsx, le lieu doit en plus être cliquable (→ /storage-locations/:id)

**Convention tests actuelle :**
- 293 tests existants (après Story 5.4 + code review fixes)
- `vi.clearAllMocks()` dans `beforeEach`
- Mock complet `@inertiajs/react` avec `router: { visit: vi.fn() }`
- `npx vitest run` pour vérifier 0 régression

### Project Structure Notes

- Controller : `app/controllers/shows_controller.ts` (modifier — ajouter `checklist()` après `show()`)
- Route : `start/routes.ts` (ajouter `router.get('/shows/:id/checklist', ...)` à la fin des routes shows)
- Frontend : `inertia/pages/Shows/Checklist.tsx` (créer)
- Tests co-localisés : `inertia/pages/Shows/Checklist.test.tsx` (créer)

### References

- Pattern preload nested (routines→materials) : [Source: app/controllers/routines_controller.ts#show]
- Pattern MaterialItem + type + storageLocation : [Source: inertia/pages/Routines/Show.tsx]
- Pattern route custom shows : [Source: start/routes.ts#54-55] (attachRoutine/detachRoutine)
- Show model (routines relation) : [Source: app/models/show.ts]
- Material model (type + storageLocation) : [Source: app/models/material.ts]
- Story 5.4 (button "Générer checklist" déjà en place) : [Source: inertia/pages/Shows/Show.tsx]
- Epic 5 Story 5.5 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.5]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Implémentation RED-GREEN TDD : tests écrits en premier (12 tests, tous RED), puis component créé (tous GREEN)
- Route GET /shows/:id/checklist ajoutée dans start/routes.ts (après les routes shows custom existantes)
- Méthode checklist() ajoutée dans ShowsController avec déduplication Map<number, MaterialData>
- Page Checklist.tsx créée avec state React local (Set<number>) pour les checkboxes — pas de persistance
- Lieu cliquable avec role="button", tabIndex, aria-label, onKeyDown (accessibilité conforme aux learnings 5.3/5.4)
- Code review fixes : breadcrumb AC2 (breadcrumbLabels prop sur Layout), data-testid sur lieux, 4 tests ajoutés (keyboard, opacity, h1, title)
- 309 tests totaux (293 + 16 nouveaux), 0 régression

### File List

start/routes.ts
app/controllers/shows_controller.ts
inertia/components/Layout.tsx
inertia/pages/Shows/Checklist.tsx
inertia/pages/Shows/Checklist.test.tsx

## Change Log

- 2026-03-22 : Implémentation Story 5.5 — page checklist interactive `/shows/:id/checklist` avec route, controller (déduplication Map), composant React (state local checkboxes), 12 tests unitaires (RED-GREEN TDD)
- 2026-03-22 : Code review fixes — breadcrumb AC2 (breadcrumbLabels prop sur Layout.tsx), data-testid lieux, +4 tests (keyboard navigation, opacity, h1, Layout title)
