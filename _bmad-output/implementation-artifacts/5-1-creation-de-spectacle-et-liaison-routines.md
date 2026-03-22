# Story 5.1: Création de Spectacle et Liaison Routines

Status: done

## Story

As a **utilisateur**,
I want **créer un spectacle et lui lier des routines**,
so that **je peux structurer mes prestations** (FR37, FR41, FR42).

## Acceptance Criteria

**Scenario 1 : Accès à la page création**
- **Given** je suis connecté
- **When** j'accède à /shows/create
- **Then** le breadcrumb affiche : Accueil > Spectacles > Créer un spectacle

**Scenario 2 : Formulaire de création**
- **Given** je suis sur la page création spectacle
- **When** la page se charge
- **Then** je vois un formulaire avec :
  - Nom (Input requis)
  - Section "Routines du spectacle" (vide initialement)

**Scenario 3 : Validation client du nom**
- **Given** je remplis le champ Nom (FR37)
- **When** je tape un nom de spectacle
- **Then** la validation client vérifie que le nom n'est pas vide

**Scenario 4 : Création et redirection**
- **Given** je remplis le formulaire
- **When** je soumets avec au minimum un nom
- **Then** le validator CreateShowValidator valide côté serveur
- **And** le spectacle est créé dans la table shows avec mon user_id
- **And** un message success s'affiche : "Spectacle créé avec succès"
- **And** je suis redirigé vers /shows/:id/edit pour ajouter routines et notes

**Scenario 5 : Section Routines sur la page Edit**
- **Given** je suis sur /shows/:id/edit
- **When** la page se charge
- **Then** je vois la section "Routines du spectacle"
- **And** un bouton "Ajouter des routines" est visible (FR41)

**Scenario 6 : Modal d'ajout de routines**
- **Given** je clique sur "Ajouter des routines"
- **When** le Modal s'ouvre
- **Then** je vois la liste de toutes mes routines (Select multiple)
- **And** je peux rechercher par nom

**Scenario 7 : Liaison routines**
- **Given** le modal d'ajout routines est ouvert
- **When** je sélectionne une ou plusieurs routines et clique "Ajouter"
- **Then** les routines sont liées au spectacle dans routine_show
- **And** le modal se ferme
- **And** la liste routines est mise à jour
- **And** un message success s'affiche : "Routines ajoutées au spectacle"

**Scenario 8 : Affichage des routines liées**
- **Given** des routines sont liées au spectacle
- **When** j'affiche la liste
- **Then** chaque routine affiche : Nom, Catégorie(s)
- **And** chaque routine a un bouton "Retirer" (FR42)

**Scenario 9 : Retrait d'une routine**
- **Given** je clique sur "Retirer" pour une routine
- **When** le bouton est cliqué
- **Then** un Popconfirm s'affiche : "Retirer cette routine du spectacle ?"
- **And** si je confirme, la routine est déliée (suppression dans routine_show)
- **And** la liste est mise à jour
- **And** un message success s'affiche : "Routine retirée du spectacle"

**Scenario 10 : État vide**
- **Given** le spectacle n'a aucune routine liée
- **When** j'affiche la section
- **Then** le texte affiche : "Aucune routine dans ce spectacle"

## Tasks / Subtasks

### Backend — Migrations (AC: 4, 7, 9)

- [x] Créer migration `database/migrations/9_create_shows_table.ts` (AC: 4)
  - [x] Table `shows` : id (PK), user_id (FK → users ON DELETE CASCADE), name (string NOT NULL), timestamps
- [x] Créer migration `database/migrations/10_create_routine_show_table.ts` (AC: 7, 9)
  - [x] Table `routine_show` : id (PK), routine_id (FK → routines ON DELETE CASCADE), show_id (FK → shows ON DELETE CASCADE), unique(routine_id, show_id), index sur routine_id et show_id, created_at

### Backend — Model (AC: 4, 7, 9)

- [x] Créer `app/models/show.ts` (AC: 4)
  - [x] Colonnes : id, userId, name, createdAt, updatedAt
  - [x] belongsTo User
  - [x] manyToMany Routine via pivotTable: 'routine_show', pivotForeignKey: 'show_id', pivotRelatedForeignKey: 'routine_id'

### Backend — Validators (AC: 3, 4)

- [x] Créer `app/validators/shows/create_show_validator.ts` (AC: 3, 4)
  - [x] `name` : vine.string().trim().minLength(1).maxLength(255), messages français
- [x] Créer `app/validators/shows/update_show_validator.ts` (prépare Story 5.2)
  - [x] `name` : vine.string().trim().minLength(1).maxLength(255)
  - [x] `notes` : vine.string().optional() (pour Story 5.2)

### Backend — Controller (AC: 1–10)

- [x] Créer `app/controllers/shows_controller.ts` (AC: 1–10)
  - [x] `create()` : charge les routines de l'user, render Shows/Create
  - [x] `store()` : valide createShowValidator, crée le show, flash success, redirect /shows/:id/edit
  - [x] `edit()` : charge le show (avec routines preload + categories), charge toutes routines user, render Shows/Edit
  - [x] `update()` : valide updateShowValidator, met à jour le show (name), flash success, redirect back
  - [x] `attachRoutine()` : POST /shows/:id/routines — valide ownership, sync(false), flash success
  - [x] `detachRoutine()` : DELETE /shows/:id/routines/:routineId — vérifie ownership, detach, flash success

### Backend — Routes (AC: 1, 4, 5, 7, 9)

- [x] Ajouter ShowsController dans `start/routes.ts` (AC: 1, 4, 5)
  - [x] Import lazy : `const ShowsController = () => import('#controllers/shows_controller')`
  - [x] `router.resource('shows', ShowsController).only(['create', 'store', 'edit', 'update'])` dans le groupe auth
  - [x] `router.post('/shows/:id/routines', [ShowsController, 'attachRoutine'])` (AC: 7)
  - [x] `router.delete('/shows/:id/routines/:routineId', [ShowsController, 'detachRoutine'])` (AC: 9)

### Frontend — Shows/Create.tsx (AC: 1, 2, 3, 4)

- [x] Créer `inertia/pages/Shows/Create.tsx` (AC: 1–4)
  - [x] Props : aucune prop (formulaire simple)
  - [x] Form Ant Design avec `name` (requis, placeholder "Ex: Soirée mariage, Festival d'été...")
  - [x] Bouton "Créer le spectacle" (primary, loading) + "Annuler" (→ /shows)
  - [x] `router.post('/shows', values)` à la soumission

### Frontend — Shows/Edit.tsx (AC: 5–10)

- [x] Créer `inertia/pages/Shows/Edit.tsx` (AC: 5–10)
  - [x] Props : `show: ShowEditData` (id, name, routines liées avec categories), `allRoutines: RoutineOption[]`
  - [x] Form avec champ `name` (pré-rempli) et bouton "Enregistrer"
  - [x] Section "Routines du spectacle" avec bouton "Ajouter des routines"
  - [x] Modal Select multiple filtrable par nom pour ajouter routines (pattern identique Routines/Edit.tsx)
  - [x] `handleAttach()` → `router.post('/shows/:id/routines', { routineIds })` (AC: 7)
  - [x] Liste routines liées avec : Nom, Tags catégories, bouton "Retirer" (AC: 8)
  - [x] Popconfirm "Retirer cette routine du spectacle ?" → `router.delete('/shows/:id/routines/:routineId')` (AC: 9)
  - [x] Empty "Aucune routine dans ce spectacle" si liste vide (AC: 10)

### Tests — Shows/Create.test.tsx (AC: 1–4)

- [x] Créer `inertia/pages/Shows/Create.test.tsx` (AC: 1–4)
  - [x] Test : affiche le titre "Créer un spectacle"
  - [x] Test : affiche le champ Nom
  - [x] Test : soumet le formulaire avec router.post('/shows')
  - [x] Test : validation client — bouton désactivé ou message si nom vide

### Tests — Shows/Edit.test.tsx (AC: 5–10)

- [x] Créer `inertia/pages/Shows/Edit.test.tsx` (AC: 5–10)
  - [x] Test : affiche le champ Nom pré-rempli (AC: 5)
  - [x] Test : affiche "Ajouter des routines" (AC: 5)
  - [x] Test : ouvre le Modal au clic "Ajouter des routines" (AC: 6)
  - [x] Test : soumet attachRoutine avec router.post (AC: 7)
  - [x] Test : affiche routines liées avec nom et catégories (AC: 8)
  - [x] Test : affiche Popconfirm au clic "Retirer" (AC: 9)
  - [x] Test : appelle router.delete au confirm du Popconfirm (AC: 9)
  - [x] Test : affiche "Aucune routine dans ce spectacle" si vide (AC: 10)
  - [x] Test : lancer npx vitest run — 0 régression (261 tests, 0 fail)

## Dev Notes

### 🎯 Scope Story 5.1

Cette story crée **toute l'infrastructure Shows** (migrations, model, validators, controller, routes) et les deux premières pages : **Create** et **Edit** (avec liaison routines).

**Ce qui n'est PAS dans cette story :**
- Notes/TextArea → Story 5.2 (le `update_show_validator.ts` prépare le champ `notes` pour la prochaine story)
- Liste `/shows` → Story 5.3
- Détail `/shows/:id` → Story 5.4
- Checklist → Story 5.5
- Modification complète → Story 5.6
- Suppression → Story 5.7

### 🏗️ Patterns Architecturaux à Suivre

**Modèle de référence : `Routine` + `RoutinesController`**

Les shows suivent exactement le même pattern que les routines :
- `Routine` ↔ `Category` via `routine_category` ← **analogue** → `Routine` ↔ `Show` via `routine_show`
- `attachMaterial` / `detachMaterial` dans RoutinesController ← **même pattern** → `attachRoutine` / `detachRoutine` dans ShowsController

**Fichier de référence complet :** `app/controllers/routines_controller.ts`

### 🔥 Pattern Migration — Table shows

```typescript
// database/migrations/9_create_shows_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### 🔥 Pattern Migration — Table routine_show (pivot)

```typescript
// database/migrations/10_create_routine_show_table.ts
// Copier exactement le pattern de 1774500000001_create_material_routine_table.ts
export default class extends BaseSchema {
  protected tableName = 'routine_show'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('routine_id').unsigned().notNullable()
        .references('id').inTable('routines').onDelete('CASCADE')
      table.integer('show_id').unsigned().notNullable()
        .references('id').inTable('shows').onDelete('CASCADE')
      table.unique(['routine_id', 'show_id'])
      table.index(['routine_id'])
      table.index(['show_id'])
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### 🔥 Pattern Model — Show

```typescript
// app/models/show.ts
// Copier le pattern de app/models/routine.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Routine from '#models/routine'

export default class Show extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Routine, {
    pivotTable: 'routine_show',
    localKey: 'id',
    pivotForeignKey: 'show_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'routine_id',
  })
  declare routines: ManyToMany<typeof Routine>
}
```

### 🔥 Pattern Controller — ShowsController (méthodes Story 5.1)

```typescript
// store() : crée le show et redirige vers edit
async store({ auth, request, session, response }: HttpContext) {
  const data = await request.validateUsing(createShowValidator)
  try {
    const show = await Show.create({ userId: auth.user!.id, name: data.name })
    session.flash('success', 'Spectacle créé avec succès')
    return response.redirect().toPath(`/shows/${show.id}/edit`)
  } catch (error) {
    logger.error('Failed to create show', { error })
    session.flash('error', 'Une erreur est survenue lors de la création du spectacle')
    return response.redirect().back()
  }
}

// edit() : charge show avec routines + leurs catégories + toutes routines user
async edit({ params, auth, inertia }: HttpContext) {
  const show = await Show.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('routines', (q) => q.preload('categories'))
    .firstOrFail()

  const allRoutines = await Routine.query()
    .where('user_id', auth.user!.id)
    .orderBy('name', 'asc')

  return inertia.render('Shows/Edit', {
    show: {
      id: show.id,
      name: show.name,
      routines: show.routines.map((r) => ({
        id: r.id,
        name: r.name,
        categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
      })),
    },
    allRoutines: allRoutines.map((r) => ({ id: r.id, name: r.name })),
  })
}

// attachRoutine() : POST /shows/:id/routines
async attachRoutine({ params, request, auth, session, response }: HttpContext) {
  const show = await Show.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  const data = await request.validateUsing(attachRoutineValidator)
  const uniqueRoutineIds = [...new Set(data.routineIds)]

  // Vérification ownership IDOR
  const ownedRoutines = await Routine.query()
    .whereIn('id', uniqueRoutineIds)
    .where('user_id', auth.user!.id)
  if (ownedRoutines.length !== uniqueRoutineIds.length) {
    session.flash('error', 'Routine invalide')
    return response.redirect().back()
  }

  await show.related('routines').sync(uniqueRoutineIds, false)
  session.flash('success', 'Routines ajoutées au spectacle')
  return response.redirect().toPath(`/shows/${show.id}/edit`)
}
```

### 🔥 Pattern Frontend — Shows/Edit.tsx (section routines)

```tsx
// Exactement le même pattern que Routines/Edit.tsx (section matériels)
// - Modal avec Select multiple + filtre par nom
// - List.Item avec Popconfirm "Retirer"
// - Empty state "Aucune routine dans ce spectacle"
```

### ⚠️ Points d'Attention

**1. Validator `attachRoutine` manquant**
- Il faut créer `app/validators/shows/attach_routine_validator.ts`
- Pattern identique à `app/validators/routines/attach_material_validator.ts`
- `routineIds: vine.array(vine.number()).minLength(1)`

**2. Routine model — relation inverse (Story 5.1 inclut)**
- `app/models/routine.ts` a un TODO Epic 5 dans `destroy()` du controller
- Ne pas modifier `routine.ts` pour la relation inverse dans cette story (pas nécessaire pour Story 5.1)
- La relation inverse `shows` sera utile en Story 5.4 (navigation bidirectionnelle)

**3. Noms des timestamps dans la migration pivot**
- Table `routine_show` : seulement `created_at` (pas `updated_at`), même pattern que `material_routine`

**4. Nom de la table pivot : `routine_show` (pas `show_routine`)**
- Convention alphabétique AdonisJS → mais l'architecture spécifie `routine_show`
- [Source: architecture.md#1141]

**5. Flash messages côté frontend**
- Les messages flash (success/error) sont déjà gérés par `Layout.tsx` via les props Inertia
- Pas besoin d'utiliser `message.success()` de antd directement dans les pages

**6. Tests — Pattern de référence**
- Utiliser `inertia/pages/Routines/Edit.test.tsx` comme référence directe pour Edit.test.tsx
- `vi.mock('@inertiajs/react', ...)` pour mocker router
- `screen.getByRole`, `userEvent.click` pour les interactions

### 📊 Structure des Fichiers

```
Fichiers à CRÉER :
database/migrations/9_create_shows_table.ts
database/migrations/10_create_routine_show_table.ts
app/models/show.ts
app/validators/shows/create_show_validator.ts
app/validators/shows/update_show_validator.ts
app/validators/shows/attach_routine_validator.ts
app/controllers/shows_controller.ts
inertia/pages/Shows/Create.tsx
inertia/pages/Shows/Edit.tsx
inertia/pages/Shows/Create.test.tsx
inertia/pages/Shows/Edit.test.tsx

Fichiers à MODIFIER :
start/routes.ts  ← Ajouter ShowsController + routes shows

Fichiers NON modifiés :
app/models/routine.ts  ← Pas de relation inverse (Story 5.4)
database/migrations/*existantes*  ← Pas de modification
```

### 📝 Learnings des Stories Précédentes

**Story 4.3 (liaison matériel-routine — pattern maître) :**
- `sync(uniqueIds, false)` pour attach sans détacher les existants
- Vérification ownership IDOR avant toute liaison
- Modal avec Select multiple + `filterOption` par nom

**Story 4.7 (suppression) :**
- `ON DELETE CASCADE` sur les tables pivot → pas besoin de nettoyage manuel
- Pattern Popconfirm avec `okText="Retirer"` + `cancelText="Annuler"`

**Story 4.8 (recherche) :**
- Tests actuels : **237 tests**, 0 régression

**Convention timestamps pivot :**
- Tables pivot n'ont que `created_at` (pas `updated_at`)
- [Source: database/migrations/1774500000001_create_material_routine_table.ts]

### Project Structure Notes

- Alignement avec architecture : `app/controllers/shows_controller.ts`, `app/models/show.ts`, `inertia/pages/Shows/`
- Migrations numérotées 9 et 10 (séquence architecture)
- Route resource `.only(['create', 'store', 'edit', 'update'])` pour cette story (les autres actions viennent dans 5.3–5.7)

### References

- Pattern controller routines : [Source: app/controllers/routines_controller.ts]
- Pattern model routines : [Source: app/models/routine.ts]
- Pattern migration pivot : [Source: database/migrations/1774500000001_create_material_routine_table.ts]
- Pattern Edit page : [Source: inertia/pages/Routines/Edit.tsx]
- Pattern tests Edit : [Source: inertia/pages/Routines/Edit.test.tsx]
- Architecture Shows : [Source: _bmad-output/planning-artifacts/architecture.md#FR37-46]
- Epic 5 Story 5.1 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Infrastructure Shows complète créée from scratch (migrations, model, validators, controller, routes)
- Table `shows` avec FK user_id (CASCADE) + table pivot `routine_show` (CASCADE sur routine et show)
- `ShowsController` avec create, store, edit, update, attachRoutine, detachRoutine — pattern identique RoutinesController
- Vérification ownership IDOR dans attachRoutine (même pattern que attachMaterial)
- `update_show_validator.ts` inclut le champ `notes` (optionnel, trim, nullable) pour préparer Story 5.2
- Page `Shows/Create.tsx` : formulaire nom seul, redirect /shows/:id/edit après création
- Page `Shows/Edit.tsx` : champ nom + section routines avec modal Select multiple (filtré sans routines déjà liées) + Popconfirm retrait
- 24 nouveaux tests (8 Create + 16 Edit) — 261 tests total, 0 régression

**Code Review Fixes (via code-review workflow) :**
- M1: Ajout `beforeEach(() => vi.clearAllMocks())` dans `Create.test.tsx` (cohérence avec Edit.test.tsx)
- M2: Filtre `availableRoutines` dans `Edit.tsx` — le Select n'affiche plus les routines déjà liées
- M3: `parseInt(params.routineId, 10)` au lieu de `Number()` dans `detachRoutine`
- L1: Commentaire explicatif dans `update()` pour `data.notes` non persisté (Story 5.2)
- L2: `update_show_validator.ts` — `notes` passe à `.trim().nullable().optional()`

### File List

database/migrations/1774600000001_create_shows_table.ts
database/migrations/1774600000002_create_routine_show_table.ts
app/models/show.ts
app/validators/shows/create_show_validator.ts
app/validators/shows/update_show_validator.ts
app/validators/shows/attach_routine_validator.ts
app/controllers/shows_controller.ts
start/routes.ts
inertia/pages/Shows/Create.tsx
inertia/pages/Shows/Edit.tsx
inertia/pages/Shows/Create.test.tsx
inertia/pages/Shows/Edit.test.tsx
