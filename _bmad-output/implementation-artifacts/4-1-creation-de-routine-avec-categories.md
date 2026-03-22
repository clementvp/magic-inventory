# Story 4.1: Création de Routine avec Catégories

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **créer une routine et lui associer des catégories**,
so that **je peux organiser mes routines par style de magie** (FR28, FR34).

## Acceptance Criteria

**Scenario 1 : Breadcrumb sur la page de création**
- **Given** je suis connecté
- **When** j'accède à /routines/create
- **Then** le breadcrumb affiche : Accueil > Routines > Créer une routine

**Scenario 2 : Affichage du formulaire**
- **Given** je suis sur la page création routine
- **When** la page se charge
- **Then** je vois un formulaire Ant Design Form
- **And** les champs sont : Nom (Input requis), Catégorie(s) (Select multiple optionnel)

**Scenario 3 : Validation client — Nom requis**
- **Given** je remplis le champ Nom
- **When** je tape un nom de routine
- **Then** la validation client vérifie que le nom n'est pas vide
- **And** si le nom est vide à la soumission → message "Le nom est requis"

**Scenario 4 : Champ Catégorie(s) — multi-select optionnel**
- **Given** je remplis le champ Catégorie
- **When** je clique sur le Select Catégorie (mode multiple)
- **Then** je vois la liste de toutes mes catégories
- **And** je peux en sélectionner plusieurs
- **And** le champ est optionnel (pas de validation required)

**Scenario 5 : Soumission réussie**
- **Given** je remplis le formulaire avec au minimum un nom
- **When** je soumets le formulaire
- **Then** le validator CreateRoutineValidator valide côté serveur
- **And** la routine est créée dans la table routines avec mon user_id
- **And** le champ content est initialisé vide (sera édité dans Story 4.2)
- **And** un message success s'affiche : "Routine créée avec succès"
- **And** je suis redirigé vers /routines/:id/edit pour continuer l'édition (Story 4.2)

**Scenario 6 : Validation serveur — Nom vide**
- **Given** je soumets le formulaire
- **When** le nom est vide
- **Then** la validation client affiche : "Le nom est requis"
- **And** la validation serveur rejette également

**Scenario 7 : Bouton Annuler**
- **Given** le formulaire est rempli
- **When** je clique sur "Annuler"
- **Then** je suis redirigé vers /routines sans créer la routine

## Tasks / Subtasks

### Backend — Migrations (AC: 5)

- [x] Créer la migration `create_routines_table` (AC: 5)
  - [x] `node ace make:migration create_routines_table`
  - [x] Colonnes : `id`, `user_id` (FK → users CASCADE), `name` (string 255 NOT NULL), `content` (text nullable), `created_at`, `updated_at`
  - [x] Index sur `user_id`, `name`
- [x] Créer la migration `create_routine_category_table` (AC: 4, 5)
  - [x] `node ace make:migration create_routine_category_table`
  - [x] Colonnes : `id`, `routine_id` (FK → routines CASCADE), `category_id` (FK → categories CASCADE), `created_at`
  - [x] Contrainte unique `[routine_id, category_id]`
  - [x] Index sur `routine_id`, `category_id`

### Backend — Model (AC: 5)

- [x] Créer `app/models/routine.ts` (AC: 5)
  - [x] Colonnes : `id`, `userId`, `name`, `content` (string | null), `createdAt`, `updatedAt`
  - [x] Relation `belongsTo(() => User)`
  - [x] Relation `manyToMany(() => Category, { pivotTable: 'routine_category', pivotForeignKey: 'routine_id', pivotRelatedForeignKey: 'category_id' })`

### Backend — Validator (AC: 3, 6)

- [x] Créer `app/validators/routines/create_routine_validator.ts` (AC: 3, 6)
  - [x] Utiliser VineJS `vine.compile` (même pattern que `create_material_validator.ts`)
  - [x] `name: vine.string().trim().minLength(1).maxLength(255)`
  - [x] `categoryIds: vine.array(vine.number()).optional()`
  - [x] Messages d'erreur en français : `'name.required': 'Le nom de la routine est requis'`

### Backend — Controller (AC: 2, 5, 7)

- [x] Créer `app/controllers/routines_controller.ts` (AC: 2, 5, 7)
  - [x] Méthode `create` : charger les catégories de l'utilisateur (`Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc')`), rendre `Routines/Create` avec `{ categories }`
  - [x] Méthode `store` : valider avec `createRoutineValidator`, créer `Routine` avec `userId` + `name` + `content: ''` (vide), attacher les catégories via `routine.related('categories').attach(categoryIds ?? [])`, flash success "Routine créée avec succès", rediriger vers `/routines/${routine.id}/edit`

### Backend — Routes (AC: 1, 5, 7)

- [x] Enregistrer la route dans `start/routes.ts` (AC: 1, 5, 7)
  - [x] `const RoutinesController = () => import('#controllers/routines_controller')`
  - [x] `router.resource('routines', RoutinesController).only(['create', 'store'])` dans le groupe auth
  - [x] ⚠️ Utiliser `.only(['create', 'store'])` pour cette story — les autres actions seront ajoutées au fil des stories 4.2–4.8

### Frontend — Page Create (AC: 1, 2, 3, 4, 7)

- [x] Créer `inertia/pages/Routines/Create.tsx` (AC: 1–4, 7)
  - [x] Props : `categories: CategoryItem[]`
  - [x] Ant Design `Form` avec `layout="vertical"`, `style={{ maxWidth: 600 }}`
  - [x] Champ "Nom" : `Form.Item name="name"` + `rules={[{ required: true, message: 'Le nom est requis' }]}` + `<Input placeholder="Ex: La pièce voyageuse, Le détective...">`
  - [x] Champ "Catégorie(s)" : `Form.Item name="categoryIds"` + `<Select mode="multiple" allowClear placeholder="Sélectionner des catégories..." options={categories.map(c => ({ label: c.name, value: c.id }))}/>`
  - [x] Bouton "Créer la routine" (`type="primary" htmlType="submit" loading={submitting}`)
  - [x] Bouton "Annuler" (`onClick={() => router.visit('/routines')`)
  - [x] `router.post('/routines', values, { onFinish: () => setSubmitting(false), onError: () => setSubmitting(false) })`
  - [x] `<Layout title="Créer une routine">` pour le breadcrumb (Accueil > Routines > Créer une routine)

### Frontend — Tests (AC: 1–7)

- [x] Créer `inertia/pages/Routines/Create.test.tsx` (AC: 1–7)
  - [x] Mock `@inertiajs/react` : `router: { post: vi.fn(), visit: vi.fn() }`, `usePage: () => ({ url: '/routines/create', props: {} })`
  - [x] Mock `~/components/Layout`
  - [x] Test : affiche le champ "Nom" (AC: 2)
  - [x] Test : affiche le Select "Catégorie(s)" (AC: 2, 4)
  - [x] Test : affiche le bouton "Créer la routine" (AC: 2)
  - [x] Test : affiche le bouton "Annuler" (AC: 2, 7)
  - [x] Test : affiche erreur validation si Nom vide à la soumission (AC: 3, 6)
  - [x] Test : n'appelle pas router.post si Nom vide (AC: 3, 6)
  - [x] Test : appelle `router.post('/routines', ...)` avec les bonnes données à la soumission (AC: 5)
  - [x] Test : appelle `router.visit('/routines')` au clic Annuler (AC: 7)
  - [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Contexte Epic 4 — Première story d'un nouvel Epic

**C'est la première story de l'Epic 4 (Routines).** Toute l'infrastructure backend Routines doit être créée à partir de zéro :
- Migrations (routines + routine_category)
- Model (Routine)
- Validator (create_routine_validator)
- Controller (routines_controller)
- Route (resource routes, .only(['create', 'store']) pour cette story)
- Dossier pages Inertia (`inertia/pages/Routines/`)

### 🏗️ Schéma DB — Table `routines`

```sql
-- Basé sur le pattern de la table materials
CREATE TABLE routines (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  content     TEXT NULL,        -- Sera utilisé dans Story 4.2 (éditeur)
  created_at  TIMESTAMP NOT NULL,
  updated_at  TIMESTAMP NULL
);
CREATE INDEX ON routines (user_id);
CREATE INDEX ON routines (name);
```

### 🏗️ Schéma DB — Table pivot `routine_category`

```sql
-- Basé sur le pattern de material_category
CREATE TABLE routine_category (
  id          SERIAL PRIMARY KEY,
  routine_id  INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL,
  UNIQUE (routine_id, category_id)
);
CREATE INDEX ON routine_category (routine_id);
CREATE INDEX ON routine_category (category_id);
```

### 🔥 Pattern Critique — Migration (copier exactement le pattern materials)

```typescript
// database/migrations/TIMESTAMP_create_routines_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routines'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.text('content').nullable()  // Utilisé Story 4.2

      table.index(['user_id'])
      table.index(['name'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

```typescript
// database/migrations/TIMESTAMP_create_routine_category_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_category'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('routine_id').unsigned().notNullable()
        .references('id').inTable('routines').onDelete('CASCADE')
      table.integer('category_id').unsigned().notNullable()
        .references('id').inTable('categories').onDelete('CASCADE')

      table.unique(['routine_id', 'category_id'])
      table.index(['routine_id'])
      table.index(['category_id'])

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### 🔥 Pattern Critique — Model Routine

```typescript
// app/models/routine.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Category from '#models/category'

export default class Routine extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare content: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Category, {
    pivotTable: 'routine_category',
    localKey: 'id',
    pivotForeignKey: 'routine_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'category_id',
  })
  declare categories: ManyToMany<typeof Category>
}
```

### 🔥 Pattern Critique — Validator (copier exactement le pattern materials)

```typescript
// app/validators/routines/create_routine_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom de la routine est requis',
})

export const createRoutineValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    categoryIds: vine.array(vine.number()).optional(),
  })
)
createRoutineValidator.messagesProvider = frenchMessages
```

### 🔥 Pattern Critique — Controller (copier le pattern MaterialsController)

```typescript
// app/controllers/routines_controller.ts
import Routine from '#models/routine'
import Category from '#models/category'
import { createRoutineValidator } from '#validators/routines/create_routine_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoutinesController {
  async create({ auth, inertia }: HttpContext) {
    const categories = await Category.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Routines/Create', {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createRoutineValidator)

    try {
      const routine = await Routine.create({
        userId: auth.user!.id,
        name: data.name,
        content: '',  // Vide — sera édité dans Story 4.2
      })

      if (data.categoryIds && data.categoryIds.length > 0) {
        await routine.related('categories').attach(data.categoryIds)
      }

      session.flash('success', 'Routine créée avec succès')
      return response.redirect().toPath(`/routines/${routine.id}/edit`)
    } catch (error) {
      logger.error('Failed to create routine', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création de la routine')
      return response.redirect().back()
    }
  }
}
```

### 🔥 Pattern Critique — Routes (ajouter dans le groupe auth)

```typescript
// start/routes.ts — ajouter après MaterialsController
const RoutinesController = () => import('#controllers/routines_controller')

// Dans le groupe .use(middleware.auth()) :
router.resource('routines', RoutinesController).only(['create', 'store'])
// ⚠️ .only(['create', 'store']) — les actions index, show, edit, update, destroy
//    seront ajoutées dans les stories 4.2–4.7
```

### 🔥 Pattern Critique — Page Create.tsx (calqué sur Materials/Create.tsx)

```tsx
// inertia/pages/Routines/Create.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface CategoryItem {
  id: number
  name: string
}

interface Props {
  categories: CategoryItem[]
}

export default function RoutinesCreate({ categories }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: { name: string; categoryIds?: number[] }) => {
    setSubmitting(true)
    router.post('/routines', values, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Créer une routine">
      <h1>Créer une routine</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: La pièce voyageuse, Le détective, Ambitious Card..." />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Créer la routine
          </Button>
          <Button onClick={() => router.visit('/routines')}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
```

### ⚠️ Point d'Attention — Redirection vers `/routines/:id/edit`

Après la création (story 4.1), le controller redirige vers `/routines/${routine.id}/edit`. Cette URL n'existe pas encore (Story 4.2 créera la page Edit). En pratique :
- Le test `router.post` mock ne déclenche pas la vraie redirection, donc les tests passent
- En dev/prod : AdonisJS retournera une erreur 404 après la création jusqu'à ce que Story 4.2 implémente la page Edit
- **Ne pas changer la redirection** — elle est correcte et sera fonctionnelle dès Story 4.2
- Si Clement préfère rediriger vers `/routines` temporairement, il peut le décider

### ⚠️ Point d'Attention — `.only(['create', 'store'])` sur la resource

On n'enregistre que `create` et `store` dans cette story. Les autres actions AdonisJS seront ajoutées progressivement :
- Story 4.4 : ajouter `index`
- Story 4.5 : ajouter `show`
- Story 4.2 : ajouter `edit` et `update`
- Story 4.7 : ajouter `destroy`

### ⚠️ Point d'Attention — Pas de page `/routines` (index) dans cette story

L'AC dit "je suis redirigé vers /routines sans créer la routine" pour le bouton Annuler. La page `/routines` n'existe pas encore (Story 4.4). Le bouton Annuler pointera vers cette URL qui retournera 404. C'est acceptable et cohérent avec l'approche incrémentale des stories.

### 📝 Learnings de la Story 3.7 (Story précédente)

De la story 3.7 et des stories précédentes :
- **Pattern router.post** : utiliser `router.post` (pas `useForm` d'Inertia) — c'est le pattern établi
- **Test Ant Design Select** : ne pas utiliser `getByText('Type')` car conflicte avec colonnes — utiliser `getByText('Tous les types')` ou le placeholder
- **Tests Select** : Pour tester les Select Ant Design, utiliser `findByTitle` ou tester via placeholder text
- **`userEvent.click` + fake timers** : incompatibles, utiliser `fireEvent.click` dans ces cas
- **Mock Layout** : toujours mocker `~/components/Layout` dans les tests
- **Mock usePage** : `usePage: () => ({ url: '/routines/create', props: {} })`

### 📊 Structure des fichiers à créer

```
Nouveaux fichiers à créer :
database/migrations/
  TIMESTAMP_create_routines_table.ts          ← CRÉER
  TIMESTAMP_create_routine_category_table.ts  ← CRÉER

app/
  models/
    routine.ts                                ← CRÉER
  validators/
    routines/
      create_routine_validator.ts             ← CRÉER
  controllers/
    routines_controller.ts                    ← CRÉER

inertia/pages/Routines/
  Create.tsx                                  ← CRÉER
  Create.test.tsx                             ← CRÉER

Fichiers à modifier :
start/routes.ts                               ← MODIFIER (ajouter RoutinesController + resource route)
```

### Project Structure Notes

- Dossier `inertia/pages/Routines/` n'existe pas encore → le créer
- Dossier `app/validators/routines/` n'existe pas encore → le créer
- Le Layout.tsx supporte déjà `/routines` pour le menu et le breadcrumb (ligne 35, 56, 101-103) → aucune modification nécessaire
- Pas de modification du `inertia/types/models.ts` nécessaire pour cette story (les types sont définis localement dans Create.tsx comme dans Materials/Create.tsx)

### References

- Pattern migration materials : [Source: database/migrations/1774000000001_create_materials_table.ts]
- Pattern pivot material_category : [Source: database/migrations/1774000000002_create_material_category_table.ts]
- Model Material (pattern à reproduire) : [Source: app/models/material.ts]
- Validator create_material (pattern à reproduire) : [Source: app/validators/materials/create_material_validator.ts]
- MaterialsController.create/store (pattern à reproduire) : [Source: app/controllers/materials_controller.ts#58-70]
- Materials/Create.tsx (pattern à reproduire) : [Source: inertia/pages/Materials/Create.tsx]
- Materials/Create.test.tsx (pattern tests à reproduire) : [Source: inertia/pages/Materials/Create.test.tsx]
- Layout.tsx routines support existant : [Source: inertia/components/Layout.tsx#35,56,101-103]
- Routes actuelles : [Source: start/routes.ts]
- Epic 4 story 4.1 : [Source: _bmad-output/planning-artifacts/epics.md#1141]
- Architecture FR28-36 : [Source: _bmad-output/planning-artifacts/architecture.md#1460-1465]
- Architecture routes routines : [Source: _bmad-output/planning-artifacts/architecture.md#491,677]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage rencontré — implémentation directe en suivant les patterns Materials existants.

### Completion Notes List

- Migrations créées : `1774173801345_create_create_routines_table.ts` et `1774173804063_create_create_routine_categories_table.ts`
- Model `Routine` avec relations `belongsTo(User)` et `manyToMany(Category)` créé
- Validator VineJS avec messages français créé
- Controller avec méthodes `create` (rendu Inertia) et `store` (création + attach catégories + flash + redirect) créé
- Route resource `.only(['create', 'store'])` ajoutée dans le groupe auth
- Page `Routines/Create.tsx` avec Form Ant Design, champs Nom + Catégorie(s) multi-select, boutons Submit/Annuler
- 8 tests vitest passants, 177 tests total (0 régression)

### File List

- database/migrations/1774173801345_create_create_routines_table.ts (créé)
- database/migrations/1774173804063_create_create_routine_categories_table.ts (créé)
- app/models/routine.ts (créé)
- app/validators/routines/create_routine_validator.ts (créé)
- app/controllers/routines_controller.ts (créé)
- inertia/pages/Routines/Create.tsx (créé)
- inertia/pages/Routines/Create.test.tsx (créé)
- start/routes.ts (modifié)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modifié)

## Change Log

- 2026-03-22 : Implémentation complète de la Story 4.1 — migrations routines + routine_category, model Routine, validator VineJS, controller RoutinesController, routes resource, page Routines/Create.tsx avec 8 tests (177 total, 0 régression)
