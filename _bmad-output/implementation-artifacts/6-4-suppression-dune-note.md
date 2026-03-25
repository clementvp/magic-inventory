# Story 6.4: Suppression d'une Note

Status: done

## Story

As a **utilisateur**,
I want **supprimer une note**,
so that **je peux retirer les idées obsolètes** (FR49).

## Acceptance Criteria

1. **Given** je suis sur /notes/:id/edit ou sur la liste /notes **When** je clique sur "Supprimer" (bouton danger) **Then** un Popconfirm Ant Design s'affiche **And** le message est : "Êtes-vous sûr de vouloir supprimer cette note ?"

2. **Given** le Popconfirm est affiché **When** je confirme la suppression **Then** la note est supprimée de la table notes **And** un message success s'affiche : "Note supprimée avec succès" **And** je suis redirigé vers /notes (liste)

3. **Given** le Popconfirm est affiché **When** j'annule la suppression **Then** le Popconfirm se ferme **And** je reste sur la page actuelle

## Tasks / Subtasks

### Backend — DÉJÀ COMPLET (ne pas toucher)

- [x] Route `destroy` déjà dans `start/routes.ts` (ligne 58 : `.only([..., 'destroy'])`)
- [x] Méthode `destroy()` déjà dans `app/controllers/notes_controller.ts` (lignes 102-121)
  - Ownership check : `.where('user_id', auth.user!.id).where('id', params.id).firstOrFail()`
  - Flash success : `'Note supprimée avec succès'`
  - Redirection : `response.redirect().toRoute('notes.index')`
  - Try/catch : 404 → redirect silencieux, autres erreurs → `logger.error` + flash error

### Frontend — Edit.tsx (AC: #1, #2, #3)

- [x] Modifier `inertia/pages/Notes/Edit.tsx` (AC: #1, #2, #3)
  - [x] Ajouter `useState` aux imports react existants (déjà `useEffect, useRef, useState` — vérifier)
  - [x] Ajouter `Popconfirm, message` aux imports antd existants (`Button, Form, Input, Space, Spin`)
  - [x] Ajouter state : `const [deleting, setDeleting] = useState(false)`
  - [x] Ajouter handler `handleDelete` : appelle `router.delete('/notes/${note.id}', { onError: () => { setDeleting(false); message.error('Une erreur est survenue lors de la suppression') } })`
  - [x] Ajouter le bouton Supprimer avec Popconfirm dans le Form.Item des actions (après "Retour aux notes")

### Frontend — Index.tsx (AC: #1, #2, #3)

- [x] Modifier `inertia/pages/Notes/Index.tsx`
  - [x] Ajouter `{ useState }` aux imports react (actuellement pas de hooks)
  - [x] Ajouter `Popconfirm, message` aux imports antd existants
  - [x] Ajouter `DeleteOutlined` aux imports `@ant-design/icons`
  - [x] Ajouter state par note : utiliser `deletingId` (`number | null`) pour tracker la note en cours de suppression
  - [x] Ajouter handler `handleDelete(id: number)` : `router.delete('/notes/${id}', { onError: () => ... })`
  - [x] Ajouter bouton "Supprimer" danger avec Popconfirm dans chaque Card (utiliser `extra` prop de Card ou bouton séparé dans le contenu)
  - [x] Stopper la propagation du click Card lors du clic sur Supprimer (`e.stopPropagation()`)

### Tests — Edit.test.tsx (AC: #1, #2, #3)

- [x] Modifier `inertia/pages/Notes/Edit.test.tsx`
  - [x] Ajouter `delete: vi.fn()` au mock `@inertiajs/react` (actuellement seulement `put: vi.fn(), visit: vi.fn()`)
  - [x] Ajouter import `userEvent` depuis `@testing-library/user-event`
  - [x] Ajouter test : "affiche le bouton Supprimer"
  - [x] Ajouter test : "ouvre un Popconfirm au clic 'Supprimer'"
  - [x] Ajouter test : "appelle router.delete après confirmation dans le Popconfirm"
  - [x] Ajouter test : "n'appelle pas router.delete après annulation dans le Popconfirm"

### Tests — Index.test.tsx (AC: #1, #2, #3)

- [x] Modifier `inertia/pages/Notes/Index.test.tsx`
  - [x] Ajouter `delete: vi.fn()` au mock `@inertiajs/react` (actuellement seulement `visit: vi.fn()`)
  - [x] Ajouter test : "affiche le bouton Supprimer sur chaque Card"
  - [x] Ajouter test : "ouvre un Popconfirm au clic 'Supprimer'"
  - [x] Ajouter test : "appelle router.delete après confirmation dans le Popconfirm"
  - [x] Ajouter test : "n'appelle pas router.delete après annulation dans le Popconfirm"
  - [x] Ajouter test : "clic 'Supprimer' ne navigue pas vers /notes/:id/edit (stopPropagation)"

## Dev Notes

### Architecture Critique — LIRE AVANT DE CODER

**Ce projet utilise AdonisJS v6 + Inertia.js + React + Ant Design 6.2.2**

#### Stack confirmée
- Backend : AdonisJS v6, Lucid ORM
- Frontend : React + Inertia.js (`@inertiajs/react`), Ant Design 6.2.2
- Tests Frontend : Vitest + React Testing Library + `@testing-library/user-event`

#### 🎯 Delta minimal — Ce que Story 6.4 représente

**Backend : ZÉRO modification nécessaire.** La route `destroy` et le controller `destroy()` sont déjà en place :
- `start/routes.ts` ligne 58 : `.only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])` ✅
- `app/controllers/notes_controller.ts` lignes 102-121 : `destroy()` complet ✅

**Frontend uniquement :**
1. Ajouter Popconfirm "Supprimer" dans `Edit.tsx`
2. Ajouter Popconfirm "Supprimer" dans `Index.tsx` sur chaque Card
3. Tests correspondants dans `Edit.test.tsx` et `Index.test.tsx`

#### État actuel d'Edit.tsx

```tsx
// Imports actuels (ligne 1-6) :
import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'  // useState déjà importé ✅
import { Button, Form, Input, Space, Spin } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import Layout from '~/components/Layout'

// Form.Item actuel (lignes 95-97) :
<Form.Item>
  <Button onClick={() => router.visit('/notes')}>Retour aux notes</Button>
</Form.Item>
```

**Modification à apporter dans Edit.tsx :**

```tsx
// Ajouter Popconfirm, message aux imports antd :
import { Button, Form, Input, Popconfirm, Space, Spin, message } from 'antd'

// Ajouter dans le composant :
const [deleting, setDeleting] = useState(false)

const handleDelete = () => {
  setDeleting(true)
  router.delete(`/notes/${note.id}`, {
    onError: () => {
      setDeleting(false)
      message.error('Une erreur est survenue lors de la suppression')
    },
  })
}

// Modifier le Form.Item des boutons :
<Form.Item>
  <Space>
    <Button onClick={() => router.visit('/notes')}>Retour aux notes</Button>
    <Popconfirm
      title="Êtes-vous sûr de vouloir supprimer cette note ?"
      onConfirm={handleDelete}
      okText="Supprimer"
      cancelText="Annuler"
    >
      <Button danger loading={deleting}>Supprimer</Button>
    </Popconfirm>
  </Space>
</Form.Item>
```

#### État actuel d'Index.tsx

```tsx
// Imports actuels :
import { router } from '@inertiajs/react'
import { useState } from 'react'  // useState déjà importé pour la pagination ✅
import { Button, Card, Col, Empty, Pagination, Row, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
```

**Modification à apporter dans Index.tsx :**

```tsx
// Ajouter Popconfirm, message aux imports antd existants
import { Button, Card, Col, Empty, Pagination, Popconfirm, Row, Space, Typography, message } from 'antd'
// Ajouter DeleteOutlined
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

// Ajouter state dans le composant (après const [page, setPage]) :
const [deletingId, setDeletingId] = useState<number | null>(null)

const handleDelete = (id: number) => {
  setDeletingId(id)
  router.delete(`/notes/${id}`, {
    onError: () => {
      setDeletingId(null)
      message.error('Une erreur est survenue lors de la suppression')
    },
  })
}

// Dans chaque Card : ajouter extra prop avec Popconfirm
<Card
  hoverable
  data-testid={`note-card-${note.id}`}
  onClick={() => router.visit(`/notes/${note.id}/edit`)}
  extra={
    <Popconfirm
      title="Êtes-vous sûr de vouloir supprimer cette note ?"
      onConfirm={(e) => {
        e?.stopPropagation()
        handleDelete(note.id)
      }}
      onCancel={(e) => e?.stopPropagation()}
      okText="Supprimer"
      cancelText="Annuler"
    >
      <Button
        danger
        size="small"
        icon={<DeleteOutlined />}
        loading={deletingId === note.id}
        onClick={(e) => e.stopPropagation()}
      />
    </Popconfirm>
  }
  // ... reste inchangé
>
```

#### Pattern de tests (Edit.test.tsx)

**Modification du mock (ajouter `delete`):**

```typescript
vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn(), delete: vi.fn() },  // ← ajouter delete
  usePage: () => ({ url: '/notes/1/edit', props: { flash: {} } }),
}))
```

**Ajouter import userEvent si non présent** (vérifier Edit.test.tsx actuel — si absent, ajouter) :
```typescript
import userEvent from '@testing-library/user-event'
```

**Tests à ajouter dans Edit.test.tsx :**
```typescript
it('affiche le bouton "Supprimer"', () => {
  render(<NotesEdit note={sampleNote} />)
  expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
})

it("ouvre un Popconfirm au clic 'Supprimer'", async () => {
  render(<NotesEdit note={sampleNote} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer cette note ?")).toBeInTheDocument()
})

it("appelle router.delete après confirmation dans le Popconfirm", async () => {
  render(<NotesEdit note={sampleNote} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
  expect(router.delete).toHaveBeenCalledWith(
    '/notes/1',
    expect.objectContaining({ onError: expect.any(Function) })
  )
})

it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
  render(<NotesEdit note={sampleNote} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  const annulerButton = await screen.findByRole('button', { name: /annuler/i })
  await userEvent.click(annulerButton)
  expect(router.delete).not.toHaveBeenCalled()
})
```

**Pattern Popconfirm Ant Design pour les tests :**
- Le Popconfirm crée un second bouton "Supprimer" dans le DOM (le bouton de confirmation)
- Pour tester la confirmation : `screen.findAllByRole('button', { name: /supprimer/i })` → prendre le dernier
- Pattern validé dans : `Shows/Show.test.tsx`, `Routines/Show.test.tsx`, `Materials/Show.test.tsx`

#### Pattern de tests (Index.test.tsx)

**Modification du mock (ajouter `delete`):**
```typescript
vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },  // ← ajouter delete
  usePage: () => ({ url: '/notes', props: { flash: {} } }),
}))
```

**Tests à ajouter dans Index.test.tsx :**
```typescript
it('affiche le bouton Supprimer sur chaque note', () => {
  render(<NotesIndex notes={sampleNotes} />)
  // Vérifier qu'il y a au moins un bouton Supprimer
  expect(screen.getAllByRole('button', { name: /supprimer/i }).length).toBeGreaterThanOrEqual(1)
})

it("ouvre un Popconfirm au clic 'Supprimer' sur une note", async () => {
  render(<NotesIndex notes={sampleNotes} />)
  const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerBtns[0])
  expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer cette note ?")).toBeInTheDocument()
})

it("appelle router.delete après confirmation dans le Popconfirm", async () => {
  render(<NotesIndex notes={sampleNotes} />)
  const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerBtns[0])
  const confirmBtns = await screen.findAllByRole('button', { name: /supprimer/i })
  await userEvent.click(confirmBtns[confirmBtns.length - 1])
  expect(router.delete).toHaveBeenCalledWith(
    '/notes/1',
    expect.objectContaining({ onError: expect.any(Function) })
  )
})

it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
  render(<NotesIndex notes={sampleNotes} />)
  const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerBtns[0])
  const annulerButton = await screen.findByRole('button', { name: /annuler/i })
  await userEvent.click(annulerButton)
  expect(router.delete).not.toHaveBeenCalled()
})

it("clic 'Supprimer' ne navigue pas vers /notes/:id/edit (stopPropagation)", async () => {
  render(<NotesIndex notes={sampleNotes} />)
  const supprimerBtns = screen.getAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerBtns[0])
  expect(router.visit).not.toHaveBeenCalled()
})
```

### ⚠️ Points d'Attention

**1. Backend déjà complet — Ne rien modifier**
- `start/routes.ts` : `destroy` déjà dans `.only([...])` ✅
- `app/controllers/notes_controller.ts` : `destroy()` complet ✅
- Ne pas toucher au backend

**2. `useState` déjà importé dans Edit.tsx**
`useState` est déjà importé ligne 2 de `Edit.tsx`. Ne pas le ré-importer.

**3. `useState` déjà importé dans Index.tsx**
`useState` est déjà importé ligne 2 de `Index.tsx` (pour la pagination). Ne pas le ré-importer.

**4. Propagation click dans Index.tsx**
Chaque Card redirige vers `/notes/:id/edit` au clic. Le bouton Supprimer doit stopper la propagation pour ne pas déclencher la navigation. Utiliser `onClick={(e) => e.stopPropagation()}` sur le bouton ET `onConfirm={(e) => { e?.stopPropagation(); handleDelete(note.id) }}` dans le Popconfirm.

**5. router.delete vs router.visit**
Utiliser `router.delete()` d'Inertia (pas `router.visit()` avec method override).

**6. Ownership IDOR — déjà en place dans le controller**
Le controller `destroy()` vérifie `.where('user_id', auth.user!.id)` — aucune action frontend nécessaire.

**7. userEvent dans Edit.test.tsx — Vérifier s'il est importé**
Avant d'ajouter les tests Popconfirm, vérifier si `userEvent` est déjà importé dans `Edit.test.tsx`. Si non, l'ajouter : `import userEvent from '@testing-library/user-event'`.

**8. Nombre de tests attendus**
- Base actuelle : 364 tests
- Edit.test.tsx : +4 tests Popconfirm
- Index.test.tsx : +5 tests Popconfirm/delete
- **Total attendu : ~373 tests** (364 + 9 nouveaux)

### Project Structure Notes

**Fichiers à modifier :**
- `inertia/pages/Notes/Edit.tsx` — ajouter Popconfirm + handleDelete
- `inertia/pages/Notes/Index.tsx` — ajouter Popconfirm par Card + handleDelete
- `inertia/pages/Notes/Edit.test.tsx` — ajouter mock `delete` + 4 tests Popconfirm
- `inertia/pages/Notes/Index.test.tsx` — ajouter mock `delete` + 5 tests Popconfirm/delete

**Fichiers à NE PAS toucher :**
- `start/routes.ts` — route `destroy` déjà présente
- `app/controllers/notes_controller.ts` — `destroy()` déjà implémenté
- `inertia/pages/Notes/Create.tsx` — non concerné

### References

- Controller destroy() déjà complet : `app/controllers/notes_controller.ts#102-121`
- Route destroy déjà en place : `start/routes.ts#58`
- Edit.tsx à modifier : `inertia/pages/Notes/Edit.tsx`
- Index.tsx à modifier : `inertia/pages/Notes/Index.tsx`
- Pattern Popconfirm dans Shows : `inertia/pages/Shows/Show.tsx` (Story 5.7)
- Pattern tests Popconfirm : `inertia/pages/Shows/Show.test.tsx` (Story 5.7)
- Story précédente (6.3) : `_bmad-output/implementation-artifacts/6-3-modification-dune-note.md`
- Epic 6 Story 6.4 : `_bmad-output/planning-artifacts/epics.md#Story 6.4`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Conflit `vi.useFakeTimers()` / `userEvent` dans Edit.test.tsx → résolu avec `vi.useRealTimers()` avant chaque test Popconfirm
- Bouton icône-seule dans Index.tsx → ajout `aria-label="Supprimer"` pour accessibilité et sélecteur test

### Completion Notes List

- Ajouté Popconfirm "Supprimer" dans Edit.tsx avec state `deleting` et handler `handleDelete` via `router.delete`
- Ajouté Popconfirm "Supprimer" dans Index.tsx sur chaque Card via prop `extra`, state `deletingId`, stopPropagation pour éviter la navigation
- 4 tests Popconfirm dans Edit.test.tsx (+ mock `delete`, + import `userEvent`)
- 5 tests Popconfirm/delete dans Index.test.tsx (+ mock `delete`)
- Total : 373 tests passent (364 base + 9 nouveaux), aucune régression

### File List

- inertia/pages/Notes/Edit.tsx
- inertia/pages/Notes/Index.tsx
- inertia/pages/Notes/Edit.test.tsx
- inertia/pages/Notes/Index.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Senior Developer Review (AI)

**Date :** 2026-03-25
**Outcome :** Changes Requested → Auto-fixed

### Action Items

- [x] [Med] sprint-status.yaml absent de la File List de la story
- [x] [Med] Edit.test.tsx : `vi.useRealTimers()` mid-describe fragile → extracted dans describe('suppression') dédié
- [x] [Med] Index.test.tsx : assertion `>= 1` trop faible → `.toHaveLength(2)`
- [x] [Med] Aucun test pour reset état onError (Edit + Index)
- [x] [Low] handleDelete déclarée avant useEffect dans Edit.tsx → déplacée après
- [x] [Low] Card `extra` sans title → by-design per story spec, non modifié

## Change Log

- 2026-03-25 : Story 6.4 implémentée — Ajout Popconfirm suppression dans Edit.tsx et Index.tsx, 9 nouveaux tests (373 total)
- 2026-03-25 : Code review — 4 fixes moyens + 1 low appliqués, 2 nouveaux tests onError (375 total)
