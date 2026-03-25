# Story 6.1: Création de Note avec Auto-Save

Status: done

## Story

As a **utilisateur**,
I want **créer une note libre avec sauvegarde automatique**,
so that **je peux capturer mes idées sans jamais les perdre** (FR47 + UX Design).

## Acceptance Criteria

1. **Given** je suis connecté **When** j'accède à `/notes/create` ou clique "Nouvelle note" **Then** le breadcrumb affiche : `Accueil > Notes > Nouvelle note`

2. **Given** je suis sur la page création note **When** la page se charge **Then** je vois un formulaire avec : Titre (Input, focus automatique) + Contenu (TextArea grande taille)

3. **Given** je tape dans le champ Titre ou Contenu **When** je commence à écrire **Then** un auto-save se déclenche après 2 secondes d'inactivité (debounce)

4. **Given** l'auto-save est en cours **When** la requête est en transit **Then** l'indicateur affiche "Sauvegarde en cours..." avec un spinner (Spin Ant Design)

5. **Given** l'auto-save a réussi **When** la note est créée en base **Then** l'indicateur affiche "Sauvegardé" avec une icône check (CheckCircleOutlined)

6. **Given** la note est auto-sauvegardée (après 2s d'inactivité) **When** je quitte la page (fermeture onglet, navigation) **Then** aucune donnée n'est perdue et la note est bien enregistrée en base

7. **Given** je crée une note **When** je remplis au minimum un titre **Then** la note est créée dans la table `notes` avec mon `user_id` et la `created_at` automatique

8. **Given** je suis sur la page création **When** je clique sur "Retour aux notes" **Then** je suis redirigé vers `/notes` (liste - Story 6.2) et la note est déjà sauvegardée (pas de perte)

## Tasks / Subtasks

- [x] Task 1 : Créer la migration `notes` (AC: #7)
  - [x] Créer `database/migrations/<timestamp>_create_notes_table.ts`
  - [x] Colonnes : `id`, `user_id` (FK integer not null), `title` (string nullable), `content` (text nullable), `created_at`, `updated_at`

- [x] Task 2 : Créer le modèle `Note` (AC: #7)
  - [x] Créer `app/models/note.ts`
  - [x] `@belongsTo(() => User)` avec `userId` column
  - [x] `@column title: string | null`
  - [x] `@column content: string | null`
  - [x] Pas de relations pivot (notes indépendantes)

- [x] Task 3 : Créer les validators `notes` (AC: #7)
  - [x] Créer `app/validators/notes/create_note_validator.ts` : title (string nullable optional), content (string nullable optional)
  - [x] Créer `app/validators/notes/update_note_validator.ts` : même schéma (réutilisé en Story 6.3)

- [x] Task 4 : Créer le controller `NotesController` (AC: #1, #7, #8)
  - [x] Créer `app/controllers/notes_controller.ts`
  - [x] `create()` → `inertia.render('Notes/Create')`
  - [x] `store()` → créer note avec user_id, session.flash('success'), redirect vers `/notes/:id/edit`
  - [x] Méthodes `index`, `edit`, `update`, `destroy` → stubs vides pour Stories 6.2-6.4 (éviter erreurs de routing)

- [x] Task 5 : Enregistrer les routes `notes` (AC: #1)
  - [x] Dans `start/routes.ts`, ajouter `router.resource('notes', ...)` sous le middleware auth
  - [x] Vérifier que la route `/notes/create` est accessible (GET)

- [x] Task 6 : Créer la page `Notes/Create.tsx` avec auto-save (AC: #1-#8)
  - [x] Créer `inertia/pages/Notes/Create.tsx`
  - [x] Input Titre avec `autoFocus` et `aria-label`, TextArea Contenu avec `autoSize={{ minRows: 10, maxRows: 30 }}`
  - [x] Debounce auto-save : `useEffect` + `setTimeout(2000)` sur changements `title`/`content`
  - [x] Statut auto-save : état local `'idle' | 'saving' | 'saved' | 'error'`
  - [x] Callbacks Inertia : `setSaveStatus('saving')` avant post, `onSuccess → 'saved'`, `onError → 'error'`
  - [x] Bouton "Retour aux notes" → `router.visit('/notes')`
  - [x] Pas de bouton "Sauvegarder" manuel (auto-save uniquement)

- [x] Task 7 : Ajouter "Notes" dans le sidebar Layout (AC: #1)
  - [x] Layout.tsx avait déjà "Notes" avec `FileTextOutlined` — aucune modification nécessaire

- [x] Task 8 : Tests `Notes/Create.test.tsx` (AC: #3-#5)
  - [x] Créer `inertia/pages/Notes/Create.test.tsx`
  - [x] Test : rendu initial (titre, Input titre, TextArea contenu)
  - [x] Test : auto-save déclenché après 2000ms (vi.useFakeTimers + act + vi.advanceTimersByTime)
  - [x] Test : auto-save NON déclenché avant 2000ms
  - [x] Test : statut "Sauvegarde en cours..." pendant processing
  - [x] Test : statut "Sauvegardé" après succès
  - [x] Test : bouton "Retour aux notes" navigue vers /notes
  - [x] Test : auto-save non déclenché si titre ET contenu sont vides

## Dev Notes

### Architecture Critique — LIRE AVANT DE CODER

**Ce projet utilise AdonisJS v6 + Inertia.js + React + Ant Design 6.2.2**

**⚠️ Les notes de cette story sont des entités INDÉPENDANTES** — ne pas confondre avec le champ `notes` (texte) existant sur le modèle `Show` (colonne `shows.notes`). La table à créer s'appelle `notes` et contient des enregistrements autonomes.

#### Stack confirmée (à ne pas réinventer)
- Backend : AdonisJS v6, Lucid ORM, migrations Lucid
- Frontend : React + Inertia.js (`@inertiajs/react`), Ant Design 6.2.2
- Tests Frontend : Vitest + React Testing Library (`@testing-library/react`)
- Pas de Redux, Zustand, Axios direct — **Inertia uniquement** pour les requêtes

#### Pattern auto-save avec Inertia.js

Le mécanisme d'auto-save n'existe pas encore dans le projet. Voici le pattern exact à implémenter :

```tsx
const [title, setTitle] = useState('')
const [content, setContent] = useState('')
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

// Debounce auto-save
useEffect(() => {
  if (!title.trim() && !content.trim()) return // Rien à sauvegarder

  const timer = setTimeout(() => {
    setSaveStatus('saving')
    router.post(
      '/notes',
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

**Note importante** : le `router.post('/notes', ...)` redirige vers `/notes/:id/edit` (côté backend). La page Create est donc une page "one-shot" — après la première sauvegarde, l'utilisateur est sur Edit. C'est le comportement attendu.

**Indicateur de statut** à afficher dans le coin supérieur droit du formulaire :
```tsx
{saveStatus === 'saving' && <Space><Spin size="small" /><span style={{ color: '#8c8c8c' }}>Sauvegarde en cours...</span></Space>}
{saveStatus === 'saved' && <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /><span style={{ color: '#52c41a' }}>Sauvegardé</span></Space>}
{saveStatus === 'error' && <Space><ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /><span style={{ color: '#ff4d4f' }}>Erreur de sauvegarde</span></Space>}
```

#### Naming conventions (à respecter absolument)
- Table DB : `notes` (snake_case pluriel)
- Model : `Note` (PascalCase singulier) → `app/models/note.ts`
- Controller : `NotesController` → `app/controllers/notes_controller.ts`
- Routes : `/notes` (pluriel, pas de tirets car un seul mot)
- Pages : `inertia/pages/Notes/Create.tsx`, `inertia/pages/Notes/Index.tsx`, etc.
- Colonnes DB : `user_id`, `title`, `content`, `created_at`, `updated_at` (snake_case)
- Props TypeScript : `userId`, `createdAt` (camelCase)

#### Schema migration `notes` (pattern exact des migrations précédentes)

```typescript
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').nullable()
      table.text('content').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

#### Modèle `Note` (pattern exact des modèles existants)

```typescript
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Note extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare title: string | null

  @column()
  declare content: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

#### Controller `NotesController` — actions attendues pour cette story

```typescript
async create({ inertia }: HttpContext) {
  return inertia.render('Notes/Create')
}

async store({ auth, request, session, response }: HttpContext) {
  const data = await request.validateUsing(createNoteValidator)

  try {
    const note = await Note.create({
      userId: auth.user!.id,
      title: data.title || null,
      content: data.content || null,
    })

    session.flash('success', 'Note créée avec succès')
    return response.redirect().toPath(`/notes/${note.id}/edit`)
  } catch (error) {
    logger.error('Failed to create note', { error, data })
    session.flash('error', 'Une erreur est survenue lors de la création de la note')
    return response.redirect().back()
  }
}
```

**Les méthodes `index`, `show`, `edit`, `update`, `destroy`** doivent être créées comme stubs (retournant une réponse temporaire ou `inertia.render('Notes/Index', {})`) pour éviter les erreurs de routing. Elles seront implémentées dans Stories 6.2-6.4.

#### Routes — ajouter dans `start/routes.ts`

Chercher le bloc `router.group(() => { ... }).use(middleware.auth())` et ajouter :
```typescript
router.resource('notes', () => import('#controllers/notes_controller')).apiOnly()
router.get('/notes/create', [NotesController, 'create'])
```

**Attention** : `resource().apiOnly()` ne crée pas les routes `create` et `edit` (vues de formulaire). Il faut les ajouter séparément. Regarder le pattern de `shows` dans `start/routes.ts` pour voir comment `create` et `edit` sont enregistrés.

#### Sidebar Navigation

Le composant Layout (probablement `inertia/components/Layout.tsx`) contient le Menu Ant Design. Ajouter l'item "Notes" **après "Spectacles"** :
```tsx
{ key: '/notes', icon: <FileTextOutlined />, label: 'Notes' }
```
Utiliser l'icône `FileTextOutlined` d'Ant Design (`@ant-design/icons`).

#### Breadcrumb pattern (copier depuis Shows/Create)
```tsx
const breadcrumbItems = [
  { title: <a onClick={() => router.visit('/')}>Accueil</a> },
  { title: <a onClick={() => router.visit('/notes')}>Notes</a> },
  { title: 'Nouvelle note' },
]
```

### Project Structure Notes

**Fichiers à créer (nouveaux) :**
- `database/migrations/<timestamp>_create_notes_table.ts`
- `app/models/note.ts`
- `app/controllers/notes_controller.ts`
- `app/validators/notes/create_note_validator.ts`
- `app/validators/notes/update_note_validator.ts`
- `inertia/pages/Notes/Create.tsx`
- `inertia/pages/Notes/Create.test.tsx`

**Fichiers à modifier (existants) :**
- `start/routes.ts` — ajouter routes `notes`
- `inertia/components/Layout.tsx` (ou équivalent) — ajouter "Notes" dans sidebar

**Fichiers à NE PAS toucher :**
- `app/models/show.ts` — contient déjà une colonne `notes` (texte), c'est différent
- `database/migrations/1774600000003_add_notes_to_shows_table.ts` — notes de shows, pas les notes libres
- Tous les fichiers des Epics 1-5

### Pattern de tests (copier depuis Shows/Index.test.tsx)

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NotesCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/notes/create', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('NotesCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('déclenche auto-save après 2 secondes', async () => {
    render(<NotesCreate />)
    fireEvent.change(screen.getByRole('textbox', { name: /titre/i }), {
      target: { value: 'Mon idée' },
    })
    expect(router.post).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(router.post).toHaveBeenCalledWith(
      '/notes',
      { title: 'Mon idée', content: '' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })
})
```

**Utiliser `fireEvent` (pas `userEvent`)** avec fake timers — pattern confirmé Story 5.8.

### References

- Architecture — patterns généraux : `_bmad-output/planning-artifacts/architecture.md`
- Pattern controller : `app/controllers/shows_controller.ts`
- Pattern model : `app/models/show.ts`
- Pattern migration : `database/migrations/1774600000001_create_shows_table.ts`
- Pattern tests avec debounce : `inertia/pages/Shows/Index.test.tsx`
- Pattern page avec router.visit : `inertia/pages/Shows/Create.tsx`
- Epics Story 6.1 : `_bmad-output/planning-artifacts/epics.md` lignes 1768-1816
- Story précédente (patterns récents) : `_bmad-output/implementation-artifacts/5-8-recherche-de-spectacles.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

(aucun)

### Completion Notes List

- Migration `notes` créée avec FK user_id et colonnes title/content nullable
- Modèle `Note` avec `belongsTo(User)`, columns title/content nullable
- Validators `create_note_validator` et `update_note_validator` avec vine optional string
- `NotesController` complet : create/store + stubs index/show/edit/update/destroy pour Stories 6.2-6.4 ; `update()` utilise `updateNoteValidator`
- Routes : `resource('notes').only(['index','create','store','show','edit','update','destroy'])` — pattern conforme à shows
- Layout.tsx avait déjà l'item "Notes" avec `FileTextOutlined` — Task 7 déjà faite
- Page `Notes/Create.tsx` : auto-save debounce 2000ms, indicateur saving/saved/error, `aria-label` sur inputs pour accessibilité et tests
- Pages stubs `Notes/Index.tsx` et `Notes/Edit.tsx` créées pour éviter crash Inertia
- 11 tests unitaires (+ onError + contenu seul), pattern `act(() => vi.advanceTimersByTime(2000))` pour state updates async
- **Code review fixes** : routing conflict résolu, updateNoteValidator importé, pages stubs créées, tests onError/contenu-seul ajoutés
- 332 tests total, 0 régression

### File List

- `database/migrations/1774700000001_create_notes_table.ts` (nouveau)
- `app/models/note.ts` (nouveau)
- `app/validators/notes/create_note_validator.ts` (nouveau)
- `app/validators/notes/update_note_validator.ts` (nouveau)
- `app/controllers/notes_controller.ts` (nouveau)
- `inertia/pages/Notes/Create.tsx` (nouveau)
- `inertia/pages/Notes/Create.test.tsx` (nouveau)
- `inertia/pages/Notes/Index.tsx` (nouveau — stub)
- `inertia/pages/Notes/Edit.tsx` (nouveau — stub)
- `start/routes.ts` (modifié — ajout routes notes)

### Change Log

- 2026-03-25 : Implémentation Story 6.1 — Création de Note avec Auto-Save. Migration notes, modèle Note, validators, NotesController (avec stubs 6.2-6.4), routes, page Create.tsx avec auto-save debounce 2000ms, 11 tests unitaires.
- 2026-03-25 : Code review fixes — conflit routage corrigé (create dans resource), updateNoteValidator importé dans update(), pages Index/Edit stubs créées, tests onError et contenu-seul ajoutés.
