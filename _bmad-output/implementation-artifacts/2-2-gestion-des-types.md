# Story 2.2: Gestion des Types

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **gérer mes types personnalisés de matériel**,
so that **je peux classifier précisément mon inventaire** (FR21-23).

## Acceptance Criteria

**Scenario 1 : Affichage de la liste des types**
- **Given** je suis connecté
- **When** j'accède à la page /types
- **Then** je vois la liste de tous mes types
- **And** la liste utilise Ant Design Table avec colonnes : Nom, Date de création, Actions
- **And** le breadcrumb affiche : Accueil > Types

**Scenario 2 : Création d'un type (FR21)**
- **Given** je suis sur la page types
- **When** je clique sur "Ajouter un type"
- **Then** un Modal Ant Design s'ouvre
- **And** le formulaire contient un champ "Nom" (Input)
- **And** la validation client vérifie que le nom n'est pas vide

**Scenario 3 : Soumission formulaire création**
- **Given** je remplis le formulaire d'ajout
- **When** je soumets avec un nom valide (ex: "Cartes", "Pièces", "Livre", "Accessoire")
- **Then** le validator `createTypeValidator` valide côté serveur
- **And** le type est créé dans la table `types` avec mon user_id
- **And** un message success s'affiche : "Type créé avec succès"
- **And** le modal se ferme
- **And** la liste est mise à jour avec le nouveau type

**Scenario 4 : Modification d'un type (FR22)**
- **Given** un type existe
- **When** je clique sur "Modifier"
- **Then** un Modal Ant Design s'ouvre
- **And** le formulaire est pré-rempli avec le nom actuel
- **And** je peux modifier le nom

**Scenario 5 : Soumission formulaire modification**
- **Given** je modifie un type
- **When** je soumets avec un nom valide
- **Then** le validator `updateTypeValidator` valide côté serveur
- **And** le type est mis à jour
- **And** un message success s'affiche : "Type modifié avec succès"

**Scenario 6 : Suppression avec confirmation (FR23)**
- **Given** un type existe
- **When** je clique sur "Supprimer"
- **Then** un Popconfirm Ant Design s'affiche
- **And** le message est : "Êtes-vous sûr de vouloir supprimer ce type ?"

**Scenario 7 : Suppression réussie**
- **Given** je confirme la suppression
- **When** le type n'est utilisé par aucun matériel
- **Then** le type est supprimé de la base
- **And** un message success s'affiche : "Type supprimé avec succès"

**Scenario 8 : Suppression bloquée (préparation Epic 3)**
- **Given** je confirme la suppression
- **When** le type est utilisé par des matériels
- **Then** la suppression échoue
- **And** un message error s'affiche : "Ce type est utilisé et ne peut pas être supprimé"
- **Note** : En Epic 2, aucun matériel n'existe encore. Ce scénario sera naturellement protégé par les FK de la migration materials (Epic 3). Pour l'instant, toute suppression réussit.

## Tasks / Subtasks

### Backend — Migration & Model (AC: 1, 3, 5, 7)

- [x] Créer migration `database/migrations/TIMESTAMP_create_types_table.ts` (AC: 1, 3, 7)
  - [x] `node ace make:migration create_types_table`
  - [x] Colonnes : `id` (increments), `user_id` (integer, not nullable, FK → users), `name` (string 255, not nullable), `created_at`, `updated_at`
  - [x] Index sur `user_id` pour performance multi-tenant
  - [x] Foreign key `user_id` → `users.id` (ON DELETE CASCADE)

- [x] Créer `app/models/type.ts` (AC: 1, 3, 5, 7)
  - [x] Étendre `BaseModel` (@adonisjs/lucid/orm)
  - [x] Colonnes : `id`, `userId` (→ `user_id`), `name`, `createdAt`, `updatedAt`
  - [x] Relation `belongsTo(() => User)` via `userId`

### Backend — Validators (AC: 3, 5)

- [x] Créer `app/validators/types/create_type_validator.ts` (AC: 3)
  - [x] `vine.compile(vine.object({ name: vine.string().trim().minLength(1).maxLength(255) }))`
  - [x] Messages en français avec `SimpleMessagesProvider`

- [x] Créer `app/validators/types/update_type_validator.ts` (AC: 5)
  - [x] Identique à create (même schéma — seul le nom peut être modifié)

### Backend — Controller (AC: 1, 3, 5, 7, 8)

- [x] Créer `app/controllers/types_controller.ts` (AC: 1, 3, 5, 7)
  - [x] `index({ auth, inertia })` : `Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc')` → `inertia.render('Types/Index', { types })`
  - [x] `store({ request, auth, response, session })` : `request.validateUsing()` HORS try-catch → `Type.create({ userId: auth.user!.id, name })` → flash success → redirect types.index
  - [x] `update({ request, auth, response, session, params })` : validate → find type (scoped user) → update → flash success → redirect
  - [x] `destroy({ auth, response, session, params })` (AC: 7, 8) : find type (scoped user) → try delete → catch 404 séparément → catch FK violation → flash error

### Backend — Routes (AC: 1, 3, 5, 7)

- [x] Modifier `start/routes.ts` (AC: 1, 3, 5, 7)
  - [x] Importer `TypesController` : `const TypesController = () => import('#controllers/types_controller')`
  - [x] Ajouter dans le groupe auth : `router.resource('types', TypesController).only(['index', 'store', 'update', 'destroy'])`

### Frontend — Page Types/Index (AC: 1, 2, 3, 4, 5, 6, 7)

- [x] Créer `inertia/pages/Types/Index.tsx` (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Layout wrapper
  - [x] `Table` Ant Design avec colonnes : Nom, Date de création, Actions (Modifier | Supprimer)
  - [x] Bouton "Ajouter un type" au-dessus du tableau
  - [x] Modal création (état `createModalOpen`) avec Form instance séparée `createForm`
  - [x] Modal modification pré-remplie (état `editingType` + `editModalOpen`) avec Form instance séparée `editForm`
  - [x] Popconfirm sur bouton "Supprimer"
  - [x] Soumissions via `router.post('/types', ...)` / `router.put('/types/:id', ...)` / `router.delete('/types/:id', ...)`
  - [x] Gestion loading state sur les boutons d'action

### Frontend — Layout navigation (AC: 1)

- [x] Modifier `inertia/components/Layout.tsx` (AC: 1)
  - [x] Ajouter `types: 'Types'` dans `labelMap`
  - [x] Ajouter `if (url.startsWith('/types')) return 'types'` dans `getSelectedKey()` (avant le cas 'categories')
  - [x] Ajouter menu item "Types" dans `menuItems` (entre Catégories et Inventaire, avec `UnorderedListOutlined` icon)
  - [x] Importer `UnorderedListOutlined` depuis `@ant-design/icons`

### Tests Frontend (AC: 1, 2, 4, 6)

- [x] Créer `inertia/pages/Types/Index.test.tsx` (AC: 1, 2, 4, 6)
  - [x] Mock `@inertiajs/react` (router.post, router.put, router.delete, Link, usePage)
  - [x] Mock `~/components/Layout`
  - [x] Test : titre "Types" affiché
  - [x] Test : bouton "Ajouter un type" présent
  - [x] Test : liste des types affichée dans le tableau
  - [x] Test : clic "Ajouter" → modal s'ouvre
  - [x] Test : clic "Modifier" → modal s'ouvre pré-remplie
  - [x] Test : boutons "Supprimer" de type danger présents
  - [x] Test : `router.put` appelé lors de la soumission modification
  - [x] Lancer `npm run test:front` — 0 régression

### Validation Finale (AC: Tous)

- [x] Vérifier flow complet :
  - [x] Ajouter un type → liste mise à jour, flash success
  - [x] Modifier un type → nom mis à jour, flash success
  - [x] Supprimer un type → disparaît de la liste, flash success
  - [x] Vérifier isolation : un autre compte ne voit pas mes types
  - [x] Breadcrumb affiche : Accueil > Types
- [x] Lancer les tests : `npm run test:front` — 0 régression

## Dev Notes

### 🔥 Patterns Critiques — COPIER EXACTEMENT depuis Story 2.1

**⚠️ AVERTISSEMENT NAMING : Model `Type` vs keyword TypeScript `type`**
```typescript
// ✅ CORRECT : PascalCase `Type` est une classe valide, pas le keyword `type`
import Type from '#models/type'  // ← import VALUE (class), PAS `import type`

// ❌ PIÈGE : ne PAS confondre avec :
import type Type from '#models/type'  // ← utilise `type` comme modificateur d'import
```
Le modèle s'appelle `Type` (PascalCase, classe Lucid). C'est différent du keyword TypeScript `type` (minuscule). L'import `import Type from '#models/type'` est 100% valide.

**Migration pattern (identique à categories) :**
```typescript
// database/migrations/TIMESTAMP_create_types_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'types'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()

      table.index(['user_id'])  // Index pour performance multi-tenant

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**⚠️ Commande pour générer la migration :**
```bash
node ace make:migration create_types_table
# Le fichier généré aura un timestamp automatique
```
Ne PAS créer la migration manuellement — utiliser `node ace make:migration` pour le bon timestamp.

**Model Type pattern (Lucid ORM AdonisJS v6) :**
```typescript
// app/models/type.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Type extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number  // camelCase en TypeScript, user_id en DB (mapping automatique)

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
```

**Validator pattern (identique à categories, VineJS AdonisJS v6) :**
```typescript
// app/validators/types/create_type_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom du type est requis',
})

export const createTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
  })
)
createTypeValidator.messagesProvider = frenchMessages
```

**Controller pattern — destroy() avec catch différenciée 404 vs FK :**
```typescript
// app/controllers/types_controller.ts
import Type from '#models/type'
import { createTypeValidator } from '#validators/types/create_type_validator'
import { updateTypeValidator } from '#validators/types/update_type_validator'
import logger from '@adonisjs/core/services/logger'
import { HttpContext } from '@adonisjs/core/http'

export default class TypesController {
  async index({ auth, inertia }: HttpContext) {
    const types = await Type.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')
    return inertia.render('Types/Index', { types })
  }

  async store({ request, auth, response, session }: HttpContext) {
    // ✅ validateUsing HORS try-catch (validation exception = retour form auto)
    const data = await request.validateUsing(createTypeValidator)

    try {
      await Type.create({
        userId: auth.user!.id,
        name: data.name,
      })
      session.flash('success', 'Type créé avec succès')
      return response.redirect().toRoute('types.index')
    } catch (error) {
      logger.error('Type creation failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la création du type')
      return response.redirect().back()
    }
  }

  async update({ request, auth, response, session, params }: HttpContext) {
    const data = await request.validateUsing(updateTypeValidator)

    try {
      const type = await Type.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)  // Isolation multi-tenant CRITIQUE
        .firstOrFail()

      type.name = data.name
      await type.save()

      session.flash('success', 'Type modifié avec succès')
      return response.redirect().toRoute('types.index')
    } catch (error) {
      logger.error('Type update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification du type')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session, params }: HttpContext) {
    try {
      const type = await Type.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)  // Isolation multi-tenant CRITIQUE
        .firstOrFail()

      await type.delete()
      session.flash('success', 'Type supprimé avec succès')
    } catch (error) {
      // En Epic 3+, si FK violation (type utilisé par des matériels) :
      // L'erreur DB sera capturée ici → message utilisateur
      logger.error('Type deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Ce type est utilisé et ne peut pas être supprimé')
    }
    return response.redirect().toRoute('types.index')
  }
}
```

**⚠️ CRITIQUE : Isolation multi-tenant sur chaque query :**
```typescript
// ✅ TOUJOURS filtrer par user_id pour éviter accès inter-user
const type = await Type.query()
  .where('id', params.id)
  .where('user_id', auth.user!.id)
  .firstOrFail()

// ❌ JAMAIS sans le filtre user_id
const type = await Type.find(params.id)
```

**Routes — Resource dans le groupe auth :**
```typescript
// start/routes.ts — ajouter dans le groupe auth
const TypesController = () => import('#controllers/types_controller')

// Dans le groupe .use(middleware.auth()) :
router.resource('types', TypesController).only(['index', 'store', 'update', 'destroy'])
```
Ceci génère automatiquement :
- `GET /types` → `types.index`
- `POST /types` → `types.store`
- `PUT/PATCH /types/:id` → `types.update`
- `DELETE /types/:id` → `types.destroy`

**Layout.tsx — Modifications requises :**
```typescript
// 1. Import à ajouter (parmi les autres icônes @ant-design/icons) :
import {
  // ... icônes existantes ...
  UnorderedListOutlined,
} from '@ant-design/icons'

// 2. Dans labelMap (ajouter 'types') :
const labelMap: Record<string, string> = {
  categories: 'Catégories',
  types: 'Types',                // ← AJOUTER
  materials: 'Inventaire',
  // ... reste inchangé ...
}

// 3. Dans getSelectedKey() (ajouter AVANT categories ou dans l'ordre) :
if (url.startsWith('/types')) return 'types'      // ← AJOUTER
if (url.startsWith('/categories')) return 'categories'
// ... reste inchangé ...

// 4. Dans menuItems (ajouter après categories, avant materials) :
{
  key: 'types',
  icon: <UnorderedListOutlined />,
  label: <Link href="/types">Types</Link>,
},
```

**Frontend — Pattern modal CRUD avec 2 Form instances séparées (CRITIQUE - leçon 2.1) :**
```tsx
// inertia/pages/Types/Index.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'

interface TypeItem {
  id: number
  name: string
  createdAt: string
}

interface Props {
  types: TypeItem[]
}

export default function TypesIndex({ types }: Props) {
  // ✅ 2 instances Form SÉPARÉES (leçon code review 2.1 : éviter interférence état)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<TypeItem | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreate = (values: { name: string }) => {
    setLoading(true)
    router.post('/types', { name: values.name }, {
      onSuccess: () => { setCreateModalOpen(false); createForm.resetFields() },
      onFinish: () => setLoading(false),
    })
  }

  const handleEdit = (type: TypeItem) => {
    setEditingType(type)
    editForm.setFieldsValue({ name: type.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingType) return
    setLoading(true)
    router.put(`/types/${editingType.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setLoading(false),
    })
  }

  const handleDelete = (id: number) => {
    router.delete(`/types/${id}`)
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TypeItem) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce type ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
          >
            <Button type="link" danger>Supprimer</Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <Layout>
      <h1>Types</h1>
      <Button type="primary" onClick={() => setCreateModalOpen(true)} style={{ marginBottom: 16 }}>
        Ajouter un type
      </Button>
      <Table dataSource={types} columns={columns} rowKey="id" />

      <Modal
        title="Ajouter un type"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Créer</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier un type"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du type est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
```

**Pattern test (cohérent avec Categories/Index.test.tsx) :**
```typescript
// inertia/pages/Types/Index.test.tsx
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TypesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/types', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockTypes = [
  { id: 1, name: 'Cartes', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Pièces', createdAt: '2026-01-01T00:00:00.000Z' },
]

describe('TypesIndex', () => {
  it('affiche le titre Types', () => {
    render(<TypesIndex types={mockTypes} />)
    expect(screen.getByRole('heading', { name: 'Types' })).toBeInTheDocument()
  })

  it('affiche le bouton Ajouter un type', () => {
    render(<TypesIndex types={[]} />)
    expect(screen.getByText('Ajouter un type')).toBeInTheDocument()
  })

  it('affiche la liste des types dans le tableau', async () => {
    render(<TypesIndex types={mockTypes} />)
    await waitFor(() => {
      expect(screen.getByText('Cartes')).toBeInTheDocument()
      expect(screen.getByText('Pièces')).toBeInTheDocument()
    })
  })

  it('ouvre le modal de création au clic Ajouter', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={[]} />)
    await user.click(screen.getByText('Ajouter un type'))
    const allTexts = screen.getAllByText('Ajouter un type')
    expect(allTexts.length).toBeGreaterThan(0)
  })

  it('ouvre le modal de modification au clic Modifier', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={mockTypes} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    expect(screen.getByText('Modifier un type')).toBeInTheDocument()
  })

  it('boutons Supprimer sont de type danger', async () => {
    render(<TypesIndex types={mockTypes} />)
    await waitFor(() => {
      const dangerButtons = screen.getAllByText('Supprimer')
      expect(dangerButtons.length).toBeGreaterThan(0)
    })
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={mockTypes} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    // Le modal est ouvert avec le type pré-rempli
    expect(router.put).not.toHaveBeenCalled()
  })
})
```

**⚠️ Ant Design Table dans jsdom** : Utiliser `waitFor` et `findAllByText` pour le contenu async du tableau.

### ⚠️ Scope Epic 2 — Tables materials non encore disponibles

En Epic 2, seule la table `types` (et `categories`, `users`) existe. La table `materials` (Epic 3) n'existe pas encore. Conséquences :
- La **suppression** de types réussit toujours (aucun FK constraint côté matériels)
- Le scénario 8 (suppression bloquée) sera naturellement protégé par la migration materials (Epic 3)
- **NE PAS requêter** `materials`, `material_types`, `routines` dans ce controller

### ⚠️ Différences vs Story 2.1

| Aspect | Story 2.1 (Categories) | Story 2.2 (Types) |
|--------|------------------------|-------------------|
| Defaults à l'inscription | ✅ 6 catégories par défaut | ❌ Aucun type par défaut |
| Modification auth_controller | ✅ Requis | ❌ Non requis |
| Nombre de scénarios AC | 9 | 8 |
| Lien matériels Epic 3 | material_category (pivot) | type_id direct sur materials |

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
database/
  migrations/
    TIMESTAMP_create_types_table.ts  ← node ace make:migration create_types_table

app/
  models/
    type.ts                          ← Lucid BaseModel (classe `Type`)
  controllers/
    types_controller.ts              ← CRUD controller (index, store, update, destroy)
  validators/
    types/
      create_type_validator.ts       ← VineJS (name required)
      update_type_validator.ts       ← VineJS (name required)

inertia/
  pages/
    Types/
      Index.tsx                      ← Page liste + modals CRUD
      Index.test.tsx                 ← Tests composant
```

**Fichiers existants à MODIFIER :**
```
start/routes.ts                      ← Ajouter router.resource('types', TypesController)
inertia/components/Layout.tsx        ← Ajouter types dans labelMap + getSelectedKey + menu
```

**Fichiers NE PAS TOUCHER :**
- `app/controllers/auth_controller.ts` — Aucune modification requise (pas de types par défaut)
- `app/models/category.ts` — Aucun lien avec types dans cette story
- `database/migrations/1773598822421_create_create_categories_table.ts` — Ne jamais modifier une migration existante
- `app/controllers/categories_controller.ts` — Story séparée, ne pas modifier

**Alignement architecture :**
- ✅ Controller dans `app/controllers/types_controller.ts` [Source: architecture.md#File Structure ligne 1126]
- ✅ Model dans `app/models/type.ts` [Source: architecture.md#File Structure ligne 1136]
- ✅ Validators dans `app/validators/types/` [Source: architecture.md#File Structure lignes 1157-1159]
- ✅ Migration dans `database/migrations/` (généré via `node ace make:migration`)
- ✅ Pages dans `inertia/pages/Types/`
- ✅ Routes resource dans `start/routes.ts` [Source: architecture.md ligne 1355]

### Learnings des Stories Précédentes

**Story 2.1 — Code review insights (NE PAS RÉPÉTER) :**
- ✅ 2 instances Form SÉPARÉES pour create et edit (`createForm`, `editForm`) — évite interférence d'état entre modals
- ✅ `router.put()` appelé dans le test (ne pas oublier ce test)
- ✅ Catch différenciée dans `destroy()` : 404 (firstOrFail) vs FK violation — même try/catch suffit car message générique
- ✅ `request.validateUsing(validator)` HORS du try-catch
- ✅ Isolation multi-tenant `.where('user_id', auth.user!.id)` sur chaque query (index + update + destroy)
- ✅ `import type { ReactNode }` — PAS `React.ReactNode`
- ✅ `vi.mock('@inertiajs/react', ...)` avec router mocké (post, put, delete)
- ✅ `vi.mock('~/components/Layout', ...)` pour isoler les tests de page

**Story 1.4/1.6 — Patterns fondamentaux :**
- ✅ `session.flash('success/error', '...')` + `response.redirect().toRoute('...')`
- ✅ `logger.error('...', { error, userId: auth.user?.id })` avec optional chaining
- ✅ VineJS `SimpleMessagesProvider` pour messages d'erreur en français

### Git Intelligence Summary

**Commits récents pertinents :**
- `a5485d5` : Story 1.4 — ProfileController, profile/edit.tsx (patterns Form, validation)
- Stories 1.5, 1.6, 2.1 implémentées mais pas encore committées (fichiers non-trackés dans git)

**Pattern établi :**
- Stories implémentées comme unités atomiques (1 commit par story)
- Controller + Model + Validators + Frontend + Tests dans le même commit
- Stories 2.1 complète : migration + model + validators + controller + routes + frontend + 9 tests

### References

- **[Source: epics.md#Story 2.2]** — User story, 8 scénarios BDD, FR21-23
- **[Source: epics.md#Epic 2]** — Contexte : Organisation et Taxonomie, FR16-27
- **[Source: architecture.md#File Structure ligne 1126]** — `app/controllers/types_controller.ts`
- **[Source: architecture.md#File Structure ligne 1136]** — `app/models/type.ts`
- **[Source: architecture.md#File Structure lignes 1157-1159]** — `app/validators/types/`
- **[Source: architecture.md ligne 1355]** — `Route.resource('types', 'TypesController')`
- **[Source: architecture.md#Authorization Pattern]** — Scoping user_id, isolation multi-tenant
- **[Source: architecture.md#Error Handling Strategy]** — Flash messages + redirect pattern
- **[Source: 2-1-gestion-des-categories-avec-categories-par-defaut.md#Dev Notes]** — Tous les patterns CRUD (validator HORS try-catch, Lucid ORM, Inertia router, tests)
- **[Source: 2-1-gestion-des-categories-avec-categories-par-defaut.md#Dev Agent Record]** — Code review insights : 2 Form instances séparées, catch différenciée

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive des artefacts et de la story 2.1

### Completion Notes List

**Phase Planification (2026-03-15):**
- ✅ Story auto-découverte depuis sprint-status.yaml (2-2-gestion-des-types = premier backlog)
- ✅ Analyse epics.md — 8 scénarios BDD extraits (FR21-23)
- ✅ Analyse architecture — types_controller.ts, models/type.ts, validators/types/, routes resource
- ✅ Analyse story 2.1 — patterns CRUD documentés et code review insights intégrés
- ✅ CRITIQUE documenté : naming `Type` (PascalCase valide) vs keyword TypeScript `type` (minuscule)
- ✅ CRITIQUE documenté : `request.validateUsing()` HORS try-catch
- ✅ CRITIQUE documenté : isolation multi-tenant `.where('user_id', auth.user!.id)` sur chaque query
- ✅ CRITIQUE documenté : `node ace make:migration create_types_table` pour timestamp correct
- ✅ CRITIQUE documenté : 2 Form instances séparées (createForm + editForm) — leçon code review 2.1
- ✅ CRITIQUE documenté : Aucun type par défaut à l'inscription (différence vs Story 2.1)
- ✅ Layout.tsx — ajouts nécessaires (types dans labelMap + getSelectedKey + menuItems avec UnorderedListOutlined)
- ✅ Pattern test documenté (cohérent avec Categories tests)

**Phase Implémentation (2026-03-15):**
- ✅ Migration `1773606133431_create_create_types_table.ts` générée via `node ace make:migration`
- ✅ Model `app/models/type.ts` créé (Lucid ORM, belongsTo User, mapping userId/user_id)
- ✅ Validator `create_type_validator.ts` créé (VineJS, messages français, SimpleMessagesProvider)
- ✅ Validator `update_type_validator.ts` créé (identique au create)
- ✅ Controller `types_controller.ts` créé (index, store, update, destroy — isolation multi-tenant)
- ✅ Routes mises à jour (TypesController importé, resource types dans groupe auth)
- ✅ Layout.tsx mis à jour (UnorderedListOutlined importé, types dans labelMap + getSelectedKey + menuItems)
- ✅ Page `inertia/pages/Types/Index.tsx` créée (Table, 2 Form instances séparées, Popconfirm)
- ✅ Tests `inertia/pages/Types/Index.test.tsx` créés (7 tests)
- ✅ 76 tests passent (0 régression)

### File List

**Nouveaux fichiers :**
- `database/migrations/1773606133431_create_create_types_table.ts` — Migration table types
- `app/models/type.ts` — Lucid ORM model (classe `Type`)
- `app/controllers/types_controller.ts` — CRUD controller (index, store, update, destroy)
- `app/validators/types/create_type_validator.ts` — VineJS validator création
- `app/validators/types/update_type_validator.ts` — VineJS validator modification
- `inertia/pages/Types/Index.tsx` — Page liste + modals CRUD
- `inertia/pages/Types/Index.test.tsx` — Tests composant (7 tests)

**Fichiers modifiés :**
- `start/routes.ts` — Route resource types + import TypesController
- `inertia/components/Layout.tsx` — UnorderedListOutlined import + labelMap types + getSelectedKey + menuItems

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-15 | 1.0 | Story créée — analyse exhaustive, patterns critiques documentés depuis story 2.1 et architecture | SM Agent |
| 2026-03-15 | 1.1 | Story implémentée — migration, model, validators, controller, routes, frontend, tests (76 tests pass) | Dev Agent |
| 2026-03-15 | 1.2 | Code review — fixes : destroy() 404 vs FK différencié, loading states séparés (createLoading/editLoading), test router.put corrigé (vérifie vraiment la soumission), test modal création robustifié (role dialog) | Review Agent |
