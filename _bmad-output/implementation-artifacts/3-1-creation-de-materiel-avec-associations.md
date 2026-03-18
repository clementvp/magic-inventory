# Story 3.1: Création de Matériel avec Associations

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **ajouter un matériel à mon inventaire avec toutes ses informations**,
so that **je peux organiser mon inventaire dès le début** (FR7, FR10-13).

## Acceptance Criteria

**Scenario 1 : Navigation vers le formulaire de création**
- **Given** je suis connecté
- **When** j'accède à /materials/create
- **Then** le formulaire de création est affiché
- **And** le breadcrumb affiche : Accueil > Inventaire > Ajouter un matériel

**Scenario 2 : Affichage du formulaire**
- **Given** je suis sur /materials/create
- **When** la page se charge
- **Then** je vois un formulaire Ant Design avec les champs :
  - **Nom** (Input, requis)
  - **Type** (Select, optionnel — liste des types de l'utilisateur)
  - **Catégorie(s)** (Select mode multiple, optionnel — liste des catégories)
  - **Lieu de stockage** (Select, optionnel — liste des lieux de l'utilisateur)
  - **Auteur** (Input texte libre, optionnel)
- **And** un bouton "Créer le matériel" (primary) et un bouton "Annuler"

**Scenario 3 : Création réussie (FR7, FR10-13)**
- **Given** je remplis au minimum le champ Nom
- **When** je soumets le formulaire
- **Then** le matériel est créé dans la table `materials` avec `user_id` = moi
- **And** si typeId fourni → enregistré dans `materials.type_id`
- **And** si categoryIds fournis → lignes créées dans `material_category`
- **And** si storageLocationId fourni → enregistré dans `materials.storage_location_id`
- **And** si author fourni → enregistré dans `materials.author`
- **And** un flash success "Matériel ajouté avec succès" s'affiche
- **And** redirection vers `/materials` (⚠️ 404 jusqu'à Story 3.2 — comportement attendu)

**Scenario 4 : Validation client — champ Nom requis**
- **Given** le formulaire est affiché
- **When** je soumets sans remplir le Nom
- **Then** la validation Ant Design affiche : "Le nom est requis"
- **And** aucune requête serveur n'est envoyée

**Scenario 5 : Validation serveur**
- **Given** une requête malformée arrive côté serveur
- **When** le VineJS validator rejette
- **Then** flash error affiché + redirection back (aucun crash)

**Scenario 6 : Annuler**
- **Given** je suis sur /materials/create
- **When** je clique "Annuler"
- **Then** router.visit('/materials') est appelé sans soumettre le formulaire

## Tasks / Subtasks

### Backend — Migrations (AC: 3)

- [x] Créer `database/migrations/{{timestamp}}_create_materials_table.ts` (AC: 3)
  - [x] Table `materials` : `id`, `user_id` (FK users CASCADE), `name` (varchar 255 NOT NULL), `type_id` (FK types SET NULL nullable), `storage_location_id` (FK storage_locations SET NULL nullable), `author` (varchar 255 nullable), `created_at`, `updated_at`
  - [x] Index sur `user_id`, `name`, `type_id`, `author`, `storage_location_id` (NFR2 < 500ms)
- [x] Créer `database/migrations/{{timestamp}}_create_material_category_table.ts` (AC: 3)
  - [x] Table `material_category` : `id`, `material_id` (FK materials CASCADE), `category_id` (FK categories CASCADE), `created_at`
  - [x] UNIQUE constraint sur `(material_id, category_id)`
  - [x] Index sur `material_id`, `category_id`

### Backend — Model (AC: 3)

- [x] Créer `app/models/material.ts` (AC: 3)
  - [x] Colonnes : `id`, `userId`, `name`, `typeId` (nullable), `storageLocationId` (nullable), `author` (nullable), `createdAt`, `updatedAt`
  - [x] Relation `belongsTo(() => Type)` avec clé `typeId`
  - [x] Relation `belongsTo(() => StorageLocation)` avec clé `storageLocationId`
  - [x] Relation `manyToMany(() => Category)` avec `pivotTable: 'material_category'`
  - [x] Relation `belongsTo(() => User)`
- [x] Modifier `app/models/category.ts` (AC: 3)
  - [x] Ajouter relation `manyToMany(() => Material)` avec `pivotTable: 'material_category'` (relation inverse)

### Backend — Validator (AC: 3, 4, 5)

- [x] Créer `app/validators/materials/create_material_validator.ts` (AC: 3, 4, 5)
  - [x] `name` : `vine.string().trim().minLength(1).maxLength(255)` (requis)
  - [x] `typeId` : `vine.number().optional().nullable()` (optionnel)
  - [x] `storageLocationId` : `vine.number().optional().nullable()` (optionnel)
  - [x] `author` : `vine.string().trim().maxLength(255).optional().nullable()` (optionnel)
  - [x] `categoryIds` : `vine.array(vine.number()).optional()` (optionnel)
  - [x] Messages français : `'name.required': 'Le nom du matériel est requis'`

### Backend — Controller (AC: 1, 2, 3, 5)

- [x] Créer `app/controllers/materials_controller.ts` (AC: 1, 2, 3, 5)
  - [x] Méthode `create({ auth, inertia })` :
    - [x] Charger types : `Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc')`
    - [x] Charger categories : `Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc')`
    - [x] Charger locations : `StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc')`
    - [x] `inertia.render('Materials/Create', { types, categories, storageLocations })`
  - [x] Méthode `store({ request, auth, response, session })` :
    - [x] `request.validateUsing(createMaterialValidator)` HORS try-catch (auto 422)
    - [x] `Material.create({ userId, name, typeId, storageLocationId, author })` dans try-catch
    - [x] Si `categoryIds.length > 0` : `material.related('categories').sync(categoryIds)`
    - [x] `session.flash('success', 'Matériel ajouté avec succès')`
    - [x] `response.redirect().toRoute('materials.index')` (⚠️ 404 jusqu'à Story 3.2)
    - [x] catch : `logger.error(...)` + `session.flash('error', ...)` + `response.redirect().back()`

### Backend — Routes (AC: 1, 3)

- [x] Modifier `start/routes.ts`
  - [x] Importer `MaterialsController`
  - [x] Ajouter `router.resource('materials', MaterialsController).only(['create', 'store'])`
  - [x] Vérifier que route nommée `materials.create` et `materials.store` sont disponibles

### Frontend — Layout breadcrumb (AC: 1)

- [x] Modifier `inertia/components/Layout.tsx`
  - [x] Pattern `title` prop déjà en place depuis Story 2.4 review — aucune modification nécessaire. Utilisation de `<Layout title="Ajouter un matériel">` dans `Create.tsx`.

### Frontend — Page Materials/Create (AC: 1, 2, 3, 4, 5, 6)

- [x] Créer `inertia/pages/Materials/Create.tsx` (AC: 1, 2, 3, 4, 5, 6)
  - [x] Props : `{ types: TypeItem[], categories: CategoryItem[], storageLocations: LocationItem[] }`
  - [x] Interfaces TypeScript locales : `TypeItem { id: number; name: string }`, `CategoryItem`, `LocationItem`
  - [x] Layout wrapper avec `title="Ajouter un matériel"`
  - [x] `Form` Ant Design layout="vertical" avec `Form.useForm()`
  - [x] Champ `name` : `Input` requis, rules `[{ required: true, message: 'Le nom est requis' }]`
  - [x] Champ `typeId` : `Select` optionnel, options depuis `types`, placeholder "Sélectionner un type..."
  - [x] Champ `categoryIds` : `Select mode="multiple"` optionnel, options depuis `categories`, placeholder "Sélectionner des catégories..."
  - [x] Champ `storageLocationId` : `Select` optionnel, options depuis `storageLocations`, placeholder "Sélectionner un lieu..."
  - [x] Champ `author` : `Input` optionnel, placeholder "Ex: Paul Curry, Dai Vernon..."
  - [x] Bouton submit : `<Button type="primary" htmlType="submit" loading={submitting}>Créer le matériel</Button>`
  - [x] Bouton annuler : `<Button onClick={() => router.visit('/materials')}>Annuler</Button>`
  - [x] `handleSubmit(values)` : `setSubmitting(true)` + `router.post('/materials', values, { onFinish: () => setSubmitting(false) })`
  - [x] État `submitting` (boolean) — PAS de `deletingId`, pas de modal ici (page dédiée)

### Tests Frontend (AC: 1, 2, 3, 4, 6)

- [x] Créer `inertia/pages/Materials/Create.test.tsx`
  - [x] Mock `@inertiajs/react` : `router: { post: vi.fn(), visit: vi.fn() }`, `Link`, `usePage`
  - [x] Mock `~/components/Layout`
  - [x] Fixtures : `mockTypes`, `mockCategories`, `mockLocations`
  - [x] Test : formulaire affiché avec les 5 champs
  - [x] Test : bouton "Créer le matériel" présent
  - [x] Test : bouton "Annuler" présent
  - [x] Test : validation — erreur "Le nom est requis" si champ vide à la soumission
  - [x] Test : `router.post('/materials', ...)` appelé avec les bonnes données
  - [x] Test : `router.visit('/materials')` appelé au clic Annuler
  - [x] Lancer `npx vitest run` — 0 régression (97 → 105 tests)

### Validation Finale (AC: Tous)

- [x] `node ace migration:run` — 2 nouvelles tables créées sans erreur
- [ ] Tester manuellement : créer un matériel avec nom seul → success + flash
- [ ] Tester manuellement : créer avec toutes les associations → vérifier DB
- [ ] Tester manuellement : soumettre sans nom → validation client bloque
- [ ] Tester manuellement : /materials/create depuis menu → breadcrumb correct
- [ ] Isolation : vérifier que les Select (types, categories, locations) ne montrent que les données du user connecté
- [x] `npx vitest run` — 0 régression

## Dev Notes

### ⚠️ Fichier `Create.tsx` — PAS un Modal, une Page dédiée

Contrairement aux stories Epic 2 (Index.tsx avec modals inline), **Story 3.1 crée une page dédiée** `/materials/create`. C'est un formulaire pleine page, pas un modal. Cela est cohérent avec la complexité du formulaire (5 champs avec associations multiples).

### 🔥 Pattern Critique — Breadcrumb avec `title` prop

Depuis la review de Story 2.4, `Layout.tsx` accepte une prop `title?: string` qui override le dernier segment du breadcrumb. **Utiliser ce pattern** plutôt que d'ajouter `'create'` au `labelMap` (trop générique) :

```tsx
// Create.tsx
return (
  <Layout title="Ajouter un matériel">
    ...
  </Layout>
)
// Résultat breadcrumb : Accueil > Inventaire > Ajouter un matériel ✅
```

### 🔥 Pattern Critique — `manyToMany` avec Lucid ORM

Lucid v6 AdonisJS — syntaxe exacte pour ManyToMany :

```typescript
// app/models/material.ts
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'

@manyToMany(() => Category, {
  pivotTable: 'material_category',
  localKey: 'id',
  pivotForeignKey: 'material_id',
  relatedKey: 'id',
  pivotRelatedForeignKey: 'category_id',
})
declare categories: ManyToMany<typeof Category>
```

Synchronisation des catégories (crée/supprime proprement) :
```typescript
// Dans store() après Material.create()
if (data.categoryIds && data.categoryIds.length > 0) {
  await material.related('categories').sync(data.categoryIds)
}
// sync() est idempotent — parfait pour create ET update
```

### 🔥 Pattern Critique — Validator avec champs optionnels nullable

```typescript
// app/validators/materials/create_material_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom du matériel est requis',
})

export const createMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    typeId: vine.number().optional().nullable(),
    storageLocationId: vine.number().optional().nullable(),
    author: vine.string().trim().maxLength(255).optional().nullable(),
    categoryIds: vine.array(vine.number()).optional(),
  })
)
createMaterialValidator.messagesProvider = frenchMessages
```

### 🔥 Pattern Critique — `create()` controller charge les associations

```typescript
// app/controllers/materials_controller.ts
async create({ auth, inertia }: HttpContext) {
  const [types, categories, storageLocations] = await Promise.all([
    Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
  ])

  return inertia.render('Materials/Create', {
    types: types.map((t) => ({ id: t.id, name: t.name })),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    storageLocations: storageLocations.map((l) => ({ id: l.id, name: l.name })),
  })
}
```

### 🔥 Pattern Critique — `store()` controller

```typescript
async store({ request, auth, response, session }: HttpContext) {
  const data = await request.validateUsing(createMaterialValidator) // HORS try-catch

  try {
    const material = await Material.create({
      userId: auth.user!.id,
      name: data.name,
      typeId: data.typeId ?? null,
      storageLocationId: data.storageLocationId ?? null,
      author: data.author ?? null,
    })

    if (data.categoryIds && data.categoryIds.length > 0) {
      await material.related('categories').sync(data.categoryIds)
    }

    session.flash('success', 'Matériel ajouté avec succès')
    return response.redirect().toRoute('materials.index') // ⚠️ 404 jusqu'à Story 3.2
  } catch (error) {
    logger.error('Material creation failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de l\'ajout du matériel')
    return response.redirect().back()
  }
}
```

### 🔥 Pattern Critique — Create.tsx structure

```tsx
// inertia/pages/Materials/Create.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface TypeItem { id: number; name: string }
interface CategoryItem { id: number; name: string }
interface LocationItem { id: number; name: string }

interface Props {
  types: TypeItem[]
  categories: CategoryItem[]
  storageLocations: LocationItem[]
}

export default function MaterialsCreate({ types, categories, storageLocations }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: {
    name: string
    typeId?: number
    categoryIds?: number[]
    storageLocationId?: number
    author?: string
  }) => {
    setSubmitting(true)
    router.post('/materials', values, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Ajouter un matériel">
      <h1>Ajouter un matériel</h1>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: Bicycle Standard, Thumb Tip, Foulard..." />
        </Form.Item>

        <Form.Item name="typeId" label="Type">
          <Select
            allowClear
            placeholder="Sélectionner un type..."
            options={types.map((t) => ({ label: t.name, value: t.id }))}
          />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="storageLocationId" label="Lieu de stockage">
          <Select
            allowClear
            placeholder="Sélectionner un lieu..."
            options={storageLocations.map((l) => ({ label: l.name, value: l.id }))}
          />
        </Form.Item>

        <Form.Item name="author" label="Auteur">
          <Input placeholder="Ex: Paul Curry, Dai Vernon, Juan Tamariz..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Créer le matériel
          </Button>
          <Button onClick={() => router.visit('/materials')}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
```

### 🔥 Pattern Critique — Tests Create.test.tsx

```typescript
// inertia/pages/Materials/Create.test.tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MaterialsCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/materials/create', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockTypes = [{ id: 1, name: 'Jeu de cartes' }, { id: 2, name: 'Accessoire' }]
const mockCategories = [{ id: 1, name: 'Cartomagie' }, { id: 2, name: 'Close-up' }]
const mockLocations = [{ id: 1, name: 'Tiroir cartes' }]

describe('MaterialsCreate', () => {
  it('affiche le formulaire avec tous les champs', () => {
    render(<MaterialsCreate types={mockTypes} categories={mockCategories} storageLocations={mockLocations} />)
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Créer le matériel')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })
  // ... autres tests
})
```

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
database/
  migrations/
    {{timestamp}}_create_materials_table.ts
    {{timestamp}}_create_material_category_table.ts
app/
  models/
    material.ts
  validators/
    materials/
      create_material_validator.ts
  controllers/
    materials_controller.ts
inertia/
  pages/
    Materials/
      Create.tsx
      Create.test.tsx
```

**Fichiers existants à MODIFIER :**
```
app/models/category.ts         ← Ajouter relation manyToMany inverse
start/routes.ts                ← Ajouter resource materials .only(['create', 'store'])
inertia/components/Layout.tsx  ← Rien à changer (utiliser prop title)
```

**⚠️ Redirect `materials.index` — 404 temporaire**
Après `store()`, la redirection vers `materials.index` produit une 404 jusqu'à Story 3.2 qui crée la route `index`. C'est un comportement attendu dans le cadre du développement séquentiel des stories. Ne pas corriger en Story 3.1.

**Alignement architecture :**
- ✅ Page dédiée `Materials/Create.tsx` (pas modal — formulaire complexe 5 champs)
- ✅ Route kebab-case : `materials.create`, `materials.store`
- ✅ Isolation multi-tenant : `where('user_id', auth.user!.id)` dans `create()`
- ✅ Validator HORS try-catch dans `store()`
- ✅ `import type { HttpContext }` (pas `import { HttpContext }`)
- ✅ `Promise.all` pour charger les 3 listes en parallèle (performance)
- ✅ Prop `title` sur Layout pour breadcrumb dynamique (pattern Story 2.4 review)

### Learnings des Stories Précédentes

**Story 2.4 — Code Review Fixes critiques à appliquer ici :**
- ✅ `redirect().back()` dans `update()` (pas `toRoute('index')` depuis une page de détail)
- ✅ Message d'erreur `catch` générique (pas assumé)
- ✅ `onError` au lieu de `onFinish` pour reset d'état si navigation away
- ✅ Tests : `objectContaining` pour vérifier les options de `router.post`

**Story 2.3 — Patterns CRUD établis :**
- ✅ `request.validateUsing()` HORS try-catch (auto 422 + redirect back géré par AdonisJS)
- ✅ `firstOrFail()` pour 404 automatique (pour `show()`, `update()`, `destroy()` — future stories)
- ✅ Loading state via `useState<boolean>(false)` + `onFinish` sur `router.post`

### Git Intelligence Summary

**Commits récents pertinents :**
- `1ebe323` : Story 2.3 tests Index (patterns test Select, Popconfirm)
- `883212e` : Story 2.4 + fixes review (prop `title` Layout, `redirect().back()`, `onError`)
- `7b23e0e` : Story 2.3 (migration pattern, model pattern, validator VineJS, controller CRUD)
- `5b8475e` : Story 2.2 (loading states séparés, patterns test)

**Pattern établi :**
- 97 tests passent actuellement (0 échec)
- 1 commit par story après code review

### References

- **[Source: epics.md#Story 3.1]** — User story, 6 scénarios BDD, FR7, FR10-13
- **[Source: epics.md#Epic 3]** — Contexte : Gestion de l'Inventaire
- **[Source: architecture.md#File Structure]** — `inertia/pages/Materials/Create.tsx`, `app/controllers/materials_controller.ts`
- **[Source: architecture.md#Naming Conventions]** — Route kebab-case, named route `materials.create`
- **[Source: architecture.md#Security]** — Isolation multi-tenant systématique dans `create()`
- **[Source: architecture.md#Database]** — Migration pattern, index performance NFR2
- **[Source: 2-4-gestion-des-lieux-de-stockage.md#Dev Notes]** — prop `title` Layout, `redirect().back()`
- **[Source: 2-3-gestion-des-lieux-de-stockage.md#Dev Notes]** — Patterns CRUD, validator, migration

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive des artefacts et des stories 2.3, 2.4 + architecture + epics

### Completion Notes List

**Phase Planification (2026-03-18):**
- ✅ Story auto-découverte depuis sprint-status.yaml (3-1-creation-de-materiel-avec-associations = premier backlog)
- ✅ Analyse epics.md — Epic 3 complet, story 3.1 extraite avec 6 scénarios BDD (FR7, FR10-13)
- ✅ Analyse architecture — patterns migrations, models, validators, controllers, frontend extraits
- ✅ Analyse stories 2.3 et 2.4 — tous les patterns CRUD, review fixes intégrés
- ✅ Patterns critiques documentés : manyToMany Lucid v6, sync(), Promise.all, prop title Layout
- ✅ CRITIQUE documenté : page dédiée (pas modal) pour formulaire 5 champs
- ✅ CRITIQUE documenté : redirect().back() dans store() si erreur
- ✅ CRITIQUE documenté : `redirect().toRoute('materials.index')` → 404 temporaire attendu jusqu'à Story 3.2
- ✅ Pattern test documenté avec mocks router.post et router.visit
- ✅ 2 migrations nécessaires : materials + material_category (pivot ManyToMany)

**Phase Implémentation (2026-03-18):**
- ✅ 2 migrations créées et exécutées (materials + material_category avec FK, index, UNIQUE constraint)
- ✅ Model Material avec 4 relations (belongsTo User/Type/StorageLocation + manyToMany Category)
- ✅ Category modifié avec relation manyToMany inverse vers Material (ESM circular dep via static import + lazy eval)
- ✅ Validator createMaterialValidator : name requis, 4 champs optionnels/nullable, messages français
- ✅ Controller MaterialsController : create() avec Promise.all, store() avec sync() categories + gestion erreur
- ✅ Routes : resource materials .only(['create', 'store']) dans groupe auth
- ✅ Page Materials/Create.tsx : formulaire 5 champs, prop title Layout, états submitting
- ✅ 8 tests vitest : 97 → 105 tests, 0 régression

### File List

**Nouveaux fichiers créés :**
- `database/migrations/1774000000001_create_materials_table.ts`
- `database/migrations/1774000000002_create_material_category_table.ts`
- `app/models/material.ts`
- `app/validators/materials/create_material_validator.ts`
- `app/controllers/materials_controller.ts`
- `inertia/pages/Materials/Create.tsx`
- `inertia/pages/Materials/Create.test.tsx`

**Fichiers modifiés :**
- `app/models/category.ts` (ajout relation manyToMany inverse vers Material)
- `start/routes.ts` (ajout resource materials avec create + store)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 1.0 | Story créée — analyse exhaustive, patterns critiques documentés depuis architecture, epics, stories 2.3 et 2.4 | SM Agent |
| 2026-03-18 | 1.1 | Implémentation complète — migrations, model, validator, controller, routes, page Create.tsx, 8 tests (105 total) | Dev Agent |
| 2026-03-18 | 1.2 | Code review — 3 fixes appliqués : (1) isolation multi-tenant dans store() pour typeId/storageLocationId/categoryIds, (2) onError ajouté dans handleSubmit, (3) tests Select complétés (5 champs couverts), sync() toujours appelé quand categoryIds défini. 104 tests (0 régression) | Code Review |
