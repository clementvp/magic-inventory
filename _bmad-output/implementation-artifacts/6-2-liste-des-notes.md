# Story 6.2: Liste des Notes

Status: done

## Story

As a **utilisateur**,
I want **voir la liste de toutes mes notes libres**,
so that **je peux accéder rapidement à mes idées** (FR50).

## Acceptance Criteria

1. **Given** je suis connecté **When** j'accède à `/notes` **Then** le breadcrumb affiche : `Accueil > Notes`

2. **Given** je suis sur `/notes` **When** la page se charge **Then** mes notes sont affichées en Cards Ant Design **And** chaque item affiche : Titre, Extrait du contenu (100 premiers caractères), Date de création

3. **Given** les notes sont affichées **When** je clique sur une note **Then** je suis redirigé vers `/notes/:id/edit` (modification directe)

4. **Given** j'ai beaucoup de notes **When** la liste se charge **Then** la pagination est active (20 notes par page)

5. **Given** j'ai 0 note **When** j'accède à `/notes` **Then** un Empty Ant Design s'affiche **And** le message est : "Aucune note créée" **And** un bouton "Créer votre première note" est visible

6. **Given** je suis sur `/notes` **When** je clique sur "Nouvelle note" **Then** je suis redirigé vers `/notes/create`

## Tasks / Subtasks

- [x] Task 1 : Mettre à jour `Notes/Index.tsx` (AC: #1, #2, #3, #4, #5, #6)
  - [x] Retirer le prop `title="Mes Notes"` du Layout pour que le breadcrumb auto-généré affiche "Accueil > Notes"
  - [x] Remplacer les `<div>` clickables par des `<Card hoverable>` Ant Design avec `data-testid="note-card-{id}"`
  - [x] `Card.Meta` avec : `title={note.title || '(Sans titre)'}` + description contenant l'extrait 100 chars + date
  - [x] Extrait contenu : `{note.content?.slice(0, 100)}{note.content && note.content.length > 100 ? '...' : ''}`
  - [x] Date : `dayjs(note.createdAt).format('DD/MM/YYYY')` (importer `dayjs`)
  - [x] Pagination client-side : `PAGE_SIZE = 20`, `useState` pour `page`, `hideOnSinglePage`
  - [x] Corriger Empty state : description `"Aucune note créée"`, bouton `"Créer votre première note"`
  - [x] Ajouter `role="button"`, `tabIndex={0}`, `aria-label`, `onKeyDown` (accessibilité) sur les Cards
  - [x] Layout en `<Row gutter={[16,16]}>` + `<Col xs={24} sm={12} md={8}>` (même pattern que Shows/Index)

- [x] Task 2 : Créer `Notes/Index.test.tsx` (AC: #1-#6)
  - [x] Test : affiche le titre "Mes Notes"
  - [x] Test : affiche le bouton "Nouvelle note"
  - [x] Test : affiche les titres des notes
  - [x] Test : affiche l'extrait du contenu (100 premiers caractères, tronqué avec "...")
  - [x] Test : affiche la date au format DD/MM/YYYY
  - [x] Test : clic sur une Card navigue vers `/notes/:id/edit`
  - [x] Test : Empty state "Aucune note créée" quand 0 notes
  - [x] Test : bouton "Créer votre première note" navigue vers `/notes/create`
  - [x] Test : bouton "Nouvelle note" navigue vers `/notes/create`
  - [x] Test : pagination absente si ≤ 20 notes (hideOnSinglePage)
  - [x] Test : pagination présente avec 21+ notes
  - [x] Test : page 1 affiche 20 premières notes, pas la 21ème
  - [x] Test : note sans titre affiche "(Sans titre)"
  - [x] Test : note sans contenu n'affiche pas d'extrait

## Dev Notes

### Architecture Critique — LIRE AVANT DE CODER

**Ce projet utilise AdonisJS v6 + Inertia.js + React + Ant Design 6.2.2**

#### Stack confirmée
- Backend : AdonisJS v6, Lucid ORM
- Frontend : React + Inertia.js (`@inertiajs/react`), Ant Design 6.2.2
- Tests Frontend : Vitest + React Testing Library + `@testing-library/user-event`
- `dayjs` est installé et disponible pour le formatage des dates

#### État existant du codebase (IMPORTANT)

**Le `NotesController` est déjà complet** — `index()`, `create()`, `store()`, `show()`, `edit()`, `update()`, `destroy()` tous implémentés dans `app/controllers/notes_controller.ts`. **Ne rien modifier dans le controller.**

**`Notes/Index.tsx` existe déjà** (créé comme stub dans Story 6.1) mais est incomplet :
- Empty state : "Aucune note pour l'instant" → à corriger en "Aucune note créée"
- Bouton : "Créer ma première note" → à corriger en "Créer votre première note"
- Pas de pagination, pas de date, pas de Cards Ant Design
- `title="Mes Notes"` passé à Layout → à retirer (sinon breadcrumb = "Accueil > Mes Notes")

**Routes déjà configurées** dans `start/routes.ts` — `router.resource('notes', ...)` déjà en place.

#### Breadcrumb auto-généré par Layout

Le composant `Layout.tsx` génère automatiquement les breadcrumbs depuis l'URL :
```tsx
// Pour URL /notes :
// Segments = ['notes']
// labelMap['notes'] = 'Notes'
// → Breadcrumb: Accueil > Notes
```
**Ne pas passer `title` à `<Layout>` sur la page Index** — sinon le breadcrumb utilisera ce titre au lieu de "Notes".

#### Pattern Cards avec pagination (copier depuis Shows/Index.tsx)

```tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Space, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

const PAGE_SIZE = 20

export default function NotesIndex({ notes }: Props) {
  const [page, setPage] = useState(1)
  const paginatedNotes = notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      {/* header row */}
      {notes.length === 0 ? (
        <Empty description="Aucune note créée">
          <Button type="primary" onClick={() => router.visit('/notes/create')}>
            Créer votre première note
          </Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedNotes.map((note) => (
              <Col xs={24} sm={12} md={8} key={note.id}>
                <Card
                  hoverable
                  data-testid={`note-card-${note.id}`}
                  onClick={() => router.visit(`/notes/${note.id}/edit`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Modifier la note ${note.title || '(Sans titre)'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.visit(`/notes/${note.id}/edit`)
                  }}
                >
                  <Card.Meta
                    title={note.title || '(Sans titre)'}
                    description={
                      <Space direction="vertical" size={4}>
                        {note.content && (
                          <Typography.Text type="secondary">
                            {note.content.slice(0, 100)}{note.content.length > 100 ? '...' : ''}
                          </Typography.Text>
                        )}
                        <span style={{ color: '#8c8c8c' }}>
                          {dayjs(note.createdAt).format('DD/MM/YYYY')}
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
            total={notes.length}
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

#### Interface Props attendue par le controller

Le controller retourne déjà :
```typescript
notes: notes.map((n) => ({
  id: n.id,
  title: n.title,           // string | null
  content: n.content,        // string | null
  createdAt: n.createdAt.toISO() ?? '',
  updatedAt: n.updatedAt.toISO() ?? '',
}))
```

Interface TypeScript à utiliser dans `Notes/Index.tsx` :
```typescript
interface Note {
  id: number
  title: string | null
  content: string | null
  createdAt: string
  updatedAt: string
}
```

#### Pattern de tests (copier depuis Shows/Index.test.tsx)

```typescript
import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/notes', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleNotes = [
  {
    id: 1,
    title: 'Idée magie',
    content: 'Un tour avec des cartes',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    title: null,
    content: null,
    createdAt: '2026-02-20T12:00:00.000Z',
    updatedAt: '2026-02-20T12:00:00.000Z',
  },
]

const manyNotes = Array.from({ length: 21 }, (_, i) => ({
  id: i + 1,
  title: `Note ${i + 1}`,
  content: 'Contenu',
  createdAt: '2026-01-15T12:00:00.000Z',
  updatedAt: '2026-01-15T12:00:00.000Z',
}))
```

**Tests importants :**
- Tronquer le contenu à 100 chars : tester avec une note ayant >100 chars de contenu que `'...'` est affiché
- Pagination : `manyNotes` (21 items), `PAGE_SIZE=20` → page 1 affiche 20, pas la 21ème
- Tester `hideOnSinglePage` avec `container.querySelector('[class*="pagination"]')`
- Clic sur Card : `await userEvent.click(screen.getByTestId('note-card-1'))` → `router.visit('/notes/1/edit')`

**Utiliser `userEvent` (pas `fireEvent`)** pour les clics sur éléments — pattern de Shows/Index.test.tsx. Pas de fake timers nécessaires (pas de debounce dans ce composant).

### Project Structure Notes

**Fichiers à modifier :**
- `inertia/pages/Notes/Index.tsx` — mise à jour complète (stub → implémentation finale)

**Fichiers à créer :**
- `inertia/pages/Notes/Index.test.tsx` — tests unitaires complets

**Fichiers à NE PAS toucher :**
- `app/controllers/notes_controller.ts` — déjà complet
- `start/routes.ts` — routes notes déjà en place
- `inertia/pages/Notes/Create.tsx` — déjà implémenté (Story 6.1)
- `inertia/pages/Notes/Edit.tsx` — sera implémenté en Story 6.3

### References

- Pattern Cards + pagination : `inertia/pages/Shows/Index.tsx`
- Pattern tests liste : `inertia/pages/Shows/Index.test.tsx`
- Controller existant : `app/controllers/notes_controller.ts`
- Story précédente (patterns) : `_bmad-output/implementation-artifacts/6-1-creation-de-note-avec-auto-save.md`
- Layout breadcrumb auto : `inertia/components/Layout.tsx` lignes 43-78

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Implémenté `Notes/Index.tsx` en remplaçant le stub incomplet par la version finale : Cards Ant Design avec pagination client-side (PAGE_SIZE=20), breadcrumb auto (sans `title` passé à Layout), Empty state corrigé, accessibilité complète (role, tabIndex, aria-label, onKeyDown).
- Créé `Notes/Index.test.tsx` avec 18 tests couvrant tous les ACs.
- Code review fixes : supprimé `updatedAt` (dead code), déplacé `paginatedNotes` inline dans la branche non-vide, ajout test boundary 20 notes exact, ajout tests navigation clavier (Enter/Space), corrigé test "sans contenu" pour vérifier l'absence réelle d'extrait.
- Tous les 350 tests passent (0 régression).

### File List

- `inertia/pages/Notes/Index.tsx` — mise à jour complète (stub → implémentation finale)
- `inertia/pages/Notes/Index.test.tsx` — créé (15 tests unitaires)

## Change Log

- 2026-03-25 : Implémentation Story 6.2 — Notes/Index.tsx refactorisé (Cards + pagination + breadcrumb auto + accessibilité), Index.test.tsx créé (18 tests). Tous les ACs satisfaits, 350 tests passent.
- 2026-03-25 : Code review fixes — supprimé `updatedAt` dead code, paginatedNotes inline, +3 tests (boundary 20 notes, keyboard Enter/Space, vraie assertion absence contenu).
