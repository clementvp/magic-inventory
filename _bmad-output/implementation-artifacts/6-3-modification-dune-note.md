# Story 6.3: Modification d'une Note

Status: done

## Story

As a **utilisateur**,
I want **modifier une note existante**,
so that **je peux compléter ou corriger mes idées** (FR48).

## Acceptance Criteria

1. **Given** je clique sur une note depuis /notes **When** je suis redirigé vers /notes/:id/edit **Then** le breadcrumb affiche : `Accueil > Notes > [Titre] > Modifier`

2. **Given** je suis sur la page modification **When** la page se charge **Then** le formulaire est pré-rempli avec le Titre actuel et le Contenu actuel

3. **Given** le formulaire est pré-rempli **When** je modifie n'importe quel champ **Then** l'auto-save se déclenche après 2 secondes d'inactivité (debounce) **And** l'indicateur "Sauvegardé" s'affiche

4. **Given** je modifie la note **When** l'auto-save fonctionne **Then** la note est mise à jour dans la table notes **And** aucune action manuelle n'est nécessaire

5. **Given** je suis sur la page modification **When** je clique sur "Retour aux notes" **Then** je suis redirigé vers /notes **And** les modifications sont déjà sauvegardées

## Tasks / Subtasks

- [x] Task 1 : Corriger `Notes/Edit.tsx` (AC: #1, #3)
  - [x] Corriger le breadcrumb : passer `title="Modifier"` + `breadcrumbLabels={{ [String(note.id)]: title || 'Note sans titre' }}` à `<Layout>`
  - [x] Corriger l'auto-save : ajouter `const isFirstRender = useRef(true)` et guard dans `useEffect` pour éviter le save au montage
  - [x] Vérifier que le formulaire reste pré-rempli (AC #2 - déjà ok via `useState(note.title ?? '')`)
  - [x] Vérifier que "Retour aux notes" navigue vers `/notes` (AC #5 - déjà ok)

- [x] Task 2 : Créer `Notes/Edit.test.tsx` (AC: #1-#5)
  - [x] Test : le formulaire est pré-rempli avec le titre et le contenu de la note
  - [x] Test : "Retour aux notes" navigue vers `/notes`
  - [x] Test : auto-save NON déclenché au chargement initial (sans modification)
  - [x] Test : auto-save NON déclenché avant 2000ms
  - [x] Test : auto-save déclenché après 2000ms quand le titre change (router.put)
  - [x] Test : auto-save déclenché après 2000ms quand le contenu change
  - [x] Test : auto-save envoie `router.put('/notes/:id', { title, content }, ...)`
  - [x] Test : affiche "Sauvegarde en cours..." pendant le traitement
  - [x] Test : affiche "Sauvegardé" après succès
  - [x] Test : affiche "Erreur de sauvegarde" en cas d'échec

## Dev Notes

### Architecture Critique — LIRE AVANT DE CODER

**Ce projet utilise AdonisJS v6 + Inertia.js + React + Ant Design 6.2.2**

#### Stack confirmée
- Backend : AdonisJS v6, Lucid ORM
- Frontend : React + Inertia.js (`@inertiajs/react`), Ant Design 6.2.2
- Tests Frontend : Vitest + React Testing Library + `@testing-library/user-event`

#### État existant du codebase (IMPORTANT)

**`Notes/Edit.tsx` existe déjà** avec l'auto-save implémenté, MAIS contient 2 bugs à corriger :

**Bug #1 : Breadcrumb incorrect**
```tsx
// ❌ ACTUEL - mauvais breadcrumb : "Accueil > Notes > 42 > Note Title"
<Layout title={title || 'Note sans titre'}>

// ✅ CORRIGÉ - bon breadcrumb : "Accueil > Notes > Note Title > Modifier"
<Layout title="Modifier" breadcrumbLabels={{ [String(note.id)]: title || 'Note sans titre' }}>
```

Le Layout génère les breadcrumbs depuis l'URL `/notes/:id/edit` avec segments `['notes', '42', 'edit']`.
- `title` override s'applique uniquement au **dernier segment** ("edit")
- `breadcrumbLabels` permet de mapper l'ID vers le titre de la note
- [Source: `inertia/components/Layout.tsx` ligne 66]

**Bug #2 : Auto-save se déclenche au montage**
```tsx
// ❌ ACTUEL - timer démarre dès le montage, save après 2s sans interaction
useEffect(() => {
  const timer = setTimeout(() => {
    router.put(...)
  }, 2000)
  return () => clearTimeout(timer)
}, [title, content])

// ✅ CORRIGÉ - guard isFirstRender pour éviter le save au montage
const isFirstRender = useRef(true)

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false
    return
  }
  const timer = setTimeout(() => {
    setSaveStatus('saving')
    router.put(
      `/notes/${note.id}`,
      { title, content },
      {
        onSuccess: () => setSaveStatus('saved'),
        onError: () => setSaveStatus('error'),
        preserveScroll: true,
      }
    )
  }, 2000)
  return () => clearTimeout(timer)
}, [title, content])
```

#### Controller existant — NE PAS MODIFIER

```typescript
// app/controllers/notes_controller.ts
async edit({ params, auth, inertia }: HttpContext) {
  const note = await Note.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  return inertia.render('Notes/Edit', {
    note: { id: note.id, title: note.title, content: note.content }
    // NOTE: pas de createdAt/updatedAt dans les props Edit
  })
}

async update({ params, request, auth, session, response }: HttpContext) {
  // Valide, sauvegarde, flash 'Note sauvegardée', redirect vers /notes/:id/edit
}
```

Interface Props utilisée dans Edit.tsx :
```typescript
interface Note {
  id: number
  title: string | null
  content: string | null
  // Pas de createdAt/updatedAt ici (différent de Index)
}
```

#### Pattern de tests (basé sur Create.test.tsx)

```typescript
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import NotesEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/notes/1/edit', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleNote = {
  id: 1,
  title: 'Mon idée magique',
  content: 'Description du tour',
}

const emptyNote = { id: 2, title: null, content: null }
```

**Points importants pour les tests :**
- Utiliser `vi.useFakeTimers()` dans `beforeEach`, `vi.useRealTimers()` dans `afterEach`
- Pour tester auto-save NON déclenché au montage : `render(...)` + `vi.advanceTimersByTime(3000)` + vérifier `router.put` pas appelé
- Pour tester auto-save déclenché : `render(...)` + `fireEvent.change(...)` + `vi.advanceTimersByTime(2000)` + vérifier `router.put('/notes/1', { title: '...', content: '...' }, ...)`
- Mock `router.put` pour tester les états "Sauvegarde en cours..." / "Sauvegardé" / "Erreur"

### Project Structure Notes

**Fichiers à modifier :**
- `inertia/pages/Notes/Edit.tsx` — corriger breadcrumb + guard isFirstRender pour auto-save

**Fichiers à créer :**
- `inertia/pages/Notes/Edit.test.tsx` — tests unitaires complets

**Fichiers à NE PAS toucher :**
- `app/controllers/notes_controller.ts` — déjà complet
- `start/routes.ts` — routes notes déjà en place
- `inertia/pages/Notes/Create.tsx` — déjà implémenté (Story 6.1)
- `inertia/pages/Notes/Index.tsx` — déjà implémenté (Story 6.2)

### References

- Fichier à corriger : `inertia/pages/Notes/Edit.tsx`
- Pattern auto-save (Create) : `inertia/pages/Notes/Create.tsx`
- Pattern tests auto-save : `inertia/pages/Notes/Create.test.tsx`
- Layout breadcrumb : `inertia/components/Layout.tsx` lignes 44-78
- Controller complet : `app/controllers/notes_controller.ts`
- Story précédente (patterns) : `_bmad-output/implementation-artifacts/6-2-liste-des-notes.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Corrected breadcrumb Bug #1: `<Layout title="Modifier" breadcrumbLabels={{ [String(note.id)]: title || 'Note sans titre' }}>` — breadcrumb now shows `Accueil > Notes > [Titre] > Modifier`
- Fixed auto-save Bug #2: added `isFirstRender = useRef(true)` guard in `useEffect` to prevent save on initial mount
- Created `Edit.test.tsx` with 14 tests covering all ACs: pre-fill, navigation, auto-save timing (RED then GREEN cycle), save status states
- Code review fixes: added `note.id` to useEffect deps, wrapped timer assertions in `act()`, added breadcrumbLabels null-title test, `toBeInTheDocument()`, `autoFocus`
- All 364 tests pass (no regressions)

### File List

- `inertia/pages/Notes/Edit.tsx`
- `inertia/pages/Notes/Edit.test.tsx`

## Change Log

- 2026-03-25: Fixed breadcrumb (Bug #1) and auto-save on mount (Bug #2) in `Edit.tsx`; created `Edit.test.tsx` with 13 tests (TDD RED→GREEN cycle)
- 2026-03-25: Code review fixes — `note.id` dep, `act()` wrappers, null-title breadcrumb test, `toBeInTheDocument()`, `autoFocus`
