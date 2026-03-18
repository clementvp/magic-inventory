# Story 2.3: Gestion des Lieux de Stockage

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **gérer mes lieux de stockage**,
so that **je sais toujours où est rangé mon matériel** (FR16-19).

## Acceptance Criteria

**Scenario 1 : Affichage de la liste des lieux de stockage**
- **Given** je suis connecté
- **When** j'accède à la page /storage-locations (FR19)
- **Then** je vois la liste de tous mes lieux de stockage
- **And** la liste utilise Ant Design Table avec colonnes : Nom, Nombre d'items, Date de création, Actions
- **And** le breadcrumb affiche : Accueil > Lieux de Stockage

**Scenario 2 : Création d'un lieu (FR16)**
- **Given** je suis sur la page lieux
- **When** je clique sur "Ajouter un lieu"
- **Then** un Modal Ant Design s'ouvre
- **And** le formulaire contient un champ "Nom" (Input)
- **And** des exemples sont suggérés : "Tiroir cartes", "Bibliothèque", "Valise close-up", "Boîte pièces"
- **And** la validation client vérifie que le nom n'est pas vide

**Scenario 3 : Soumission formulaire création**
- **Given** je remplis le formulaire d'ajout
- **When** je soumets avec un nom valide
- **Then** le validator `CreateStorageLocationValidator` valide côté serveur
- **And** le lieu est créé dans la table `storage_locations` avec mon user_id
- **And** un message success s'affiche : "Lieu de stockage créé avec succès"
- **And** le modal se ferme
- **And** la liste est mise à jour

**Scenario 4 : Modification d'un lieu (FR17)**
- **Given** un lieu existe
- **When** je clique sur "Modifier"
- **Then** un Modal Ant Design s'ouvre
- **And** le formulaire est pré-rempli avec le nom actuel
- **And** je peux modifier le nom

**Scenario 5 : Soumission formulaire modification**
- **Given** je modifie un lieu
- **When** je soumets avec un nom valide
- **Then** le validator `UpdateStorageLocationValidator` valide côté serveur
- **And** le lieu est mis à jour
- **And** un message success s'affiche : "Lieu modifié avec succès"

**Scenario 6 : Suppression avec confirmation (FR18)**
- **Given** un lieu existe
- **When** je clique sur "Supprimer"
- **Then** un Popconfirm Ant Design s'affiche
- **And** le message est : "Êtes-vous sûr de vouloir supprimer ce lieu ?"

**Scenario 7 : Suppression réussie**
- **Given** je confirme la suppression
- **When** le lieu ne contient aucun matériel
- **Then** le lieu est supprimé de la base
- **And** un message success s'affiche : "Lieu supprimé avec succès"

**Scenario 8 : Suppression bloquée (préparation Epic 3)**
- **Given** je confirme la suppression
- **When** le lieu contient du matériel
- **Then** la suppression échoue
- **And** un message error s'affiche : "Ce lieu contient du matériel et ne peut pas être supprimé"
- **Note** : En Epic 2, aucun matériel n'existe encore. Ce scénario sera naturellement protégé par les FK de la migration materials (Epic 3). Pour l'instant, toute suppression réussit.

## Tasks / Subtasks

### Backend — Migration & Model (AC: 1, 3, 5, 7)

- [x] Créer migration `database/migrations/TIMESTAMP_create_storage_locations_table.ts` (AC: 1, 3, 7)
  - [x] `node ace make:migration create_storage_locations_table`
  - [x] Colonnes : `id` (increments), `user_id` (integer, not nullable, FK → users ON DELETE CASCADE), `name` (string 255, not nullable), `created_at`, `updated_at`
  - [x] Index sur `user_id` pour performance multi-tenant

- [x] Créer `app/models/storage_location.ts` (AC: 1, 3, 5, 7)
  - [x] Étendre `BaseModel` (@adonisjs/lucid/orm)
  - [x] Colonnes : `id`, `userId` (→ `user_id`), `name`, `createdAt`, `updatedAt`
  - [x] Relation `belongsTo(() => User)` via `userId`
  - [x] Nom de la classe : `StorageLocation` (PascalCase, deux mots)

### Backend — Validators (AC: 3, 5)

- [x] Créer `app/validators/storage_locations/create_storage_location_validator.ts` (AC: 3)
  - [x] `vine.compile(vine.object({ name: vine.string().trim().minLength(1).maxLength(255) }))`
  - [x] Messages en français avec `SimpleMessagesProvider`

- [x] Créer `app/validators/storage_locations/update_storage_location_validator.ts` (AC: 5)
  - [x] Identique à create (même schéma — seul le nom peut être modifié)

### Backend — Controller (AC: 1, 3, 5, 7, 8)

- [x] Créer `app/controllers/storage_locations_controller.ts` (AC: 1, 3, 5, 7, 8)
  - [x] `index({ auth, inertia })` : `StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc')` → `inertia.render('StorageLocations/Index', { storageLocations })`
  - [x] ⚠️ Passer `materialsCount: 0` pour chaque lieu (colonne "Nombre d'items" — dynamique en Epic 3)
  - [x] `store({ request, auth, response, session })` : `request.validateUsing()` HORS try-catch → `StorageLocation.create({ userId: auth.user!.id, name })` → flash success → redirect
  - [x] `update({ request, auth, response, session, params })` : validate → find (scoped user) → update → flash success → redirect
  - [x] `destroy({ auth, response, session, params })` : find (scoped user) → try delete → catch FK violation → flash error

### Backend — Routes (AC: 1, 3, 5, 7)

- [x] Modifier `start/routes.ts`
  - [x] Importer `StorageLocationsController` : `const StorageLocationsController = () => import('#controllers/storage_locations_controller')`
  - [x] Ajouter dans le groupe auth : `router.resource('storage-locations', StorageLocationsController).only(['index', 'store', 'update', 'destroy'])`
  - [x] ⚠️ KEBAB-CASE obligatoire : `'storage-locations'` (pas `'storageLocations'`, pas `'storage_locations'`)

### Frontend — Page StorageLocations/Index (AC: 1, 2, 3, 4, 5, 6, 7)

- [x] Créer `inertia/pages/StorageLocations/Index.tsx` (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Layout wrapper
  - [x] `Table` Ant Design avec colonnes : Nom, Nombre d'items (valeur `materialsCount`), Date de création, Actions (Modifier | Supprimer)
  - [x] Bouton "Ajouter un lieu" au-dessus du tableau
  - [x] Modal création (état `createModalOpen`) avec Form instance séparée `createForm`
  - [x] Placeholder dans le champ Nom : ex. "Tiroir cartes, Bibliothèque, Valise close-up..."
  - [x] Modal modification pré-remplie (état `editingLocation` + `editModalOpen`) avec Form instance séparée `editForm`
  - [x] Popconfirm sur bouton "Supprimer"
  - [x] Soumissions via `router.post('/storage-locations', ...)` / `router.put('/storage-locations/:id', ...)` / `router.delete('/storage-locations/:id', ...)`
  - [x] Loading states SÉPARÉS : `createLoading` et `editLoading` (leçon code review 2.2)

### Frontend — Layout navigation (AC: 1)

- [x] Modifier `inertia/components/Layout.tsx`
  - [x] Ajouter `InboxOutlined` dans les imports depuis `@ant-design/icons`
  - [x] Ajouter `'storage-locations': 'Lieux de Stockage'` dans `labelMap`
  - [x] Ajouter `if (url.startsWith('/storage-locations')) return 'storage-locations'` dans `getSelectedKey()` (AVANT les autres cas pour éviter conflit)
  - [x] Ajouter menu item "Lieux de Stockage" dans `menuItems` (après Types, avant Inventaire)

### Tests Frontend (AC: 1, 2, 4, 6)

- [x] Créer `inertia/pages/StorageLocations/Index.test.tsx`
  - [x] Mock `@inertiajs/react` (router.post, router.put, router.delete, Link, usePage)
  - [x] Mock `~/components/Layout`
  - [x] Test : titre "Lieux de Stockage" affiché
  - [x] Test : bouton "Ajouter un lieu" présent
  - [x] Test : liste des lieux affichée dans le tableau
  - [x] Test : clic "Ajouter" → modal s'ouvre
  - [x] Test : clic "Modifier" → modal s'ouvre pré-remplie
  - [x] Test : boutons "Supprimer" présents
  - [x] Lancer `npx vitest run` — 0 régression (84 tests, 77 → 84)

### Validation Finale (AC: Tous)

- [x] Vérifier flow complet :
  - [x] Ajouter un lieu → liste mise à jour, flash success
  - [x] Modifier un lieu → nom mis à jour, flash success
  - [x] Supprimer un lieu → disparaît de la liste, flash success
  - [x] Vérifier isolation : un autre compte ne voit pas mes lieux
  - [x] Breadcrumb affiche : Accueil > Lieux de Stockage
- [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🔥 Patterns Critiques — MÊME PATTERN que Story 2.2 (Types) et 2.1 (Categories)

**⚠️ NAMING CRITIQUE : Route kebab-case `storage-locations`**

```typescript
// ✅ CORRECT — kebab-case pour URLs multi-mots (AdonisJS convention)
router.resource('storage-locations', StorageLocationsController)
// Génère : GET /storage-locations, POST /storage-locations, PUT /storage-locations/:id, DELETE /storage-locations/:id
// Named routes : storage-locations.index, storage-locations.store, etc.

// ❌ JAMAIS camelCase dans l'URL
router.resource('storageLocations', StorageLocationsController)  // URL serait /storageLocations

// ❌ JAMAIS underscore dans l'URL
router.resource('storage_locations', StorageLocationsController)  // URL serait /storage_locations
```

**⚠️ NAMING CRITIQUE : Model `StorageLocation` (deux mots PascalCase)**

```typescript
// ✅ CORRECT
import StorageLocation from '#models/storage_location'  // fichier snake_case, classe PascalCase
const location = await StorageLocation.query()...

// ❌ JAMAIS
import StorageLocation from '#models/StorageLocation'  // nom de fichier PascalCase incorrect
```

**Migration pattern :**

```typescript
// database/migrations/TIMESTAMP_create_storage_locations_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'storage_locations'

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
node ace make:migration create_storage_locations_table
# Le fichier généré aura un timestamp automatique
```
Ne PAS créer la migration manuellement — utiliser `node ace make:migration` pour le bon timestamp.

**Model StorageLocation pattern :**

```typescript
// app/models/storage_location.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class StorageLocation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number  // camelCase en TypeScript, user_id en DB (mapping automatique Lucid)

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

**Validator pattern :**

```typescript
// app/validators/storage_locations/create_storage_location_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom du lieu est requis',
})

export const createStorageLocationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
  })
)
createStorageLocationValidator.messagesProvider = frenchMessages
```

**Controller complet :**

```typescript
// app/controllers/storage_locations_controller.ts
import StorageLocation from '#models/storage_location'
import { createStorageLocationValidator } from '#validators/storage_locations/create_storage_location_validator'
import { updateStorageLocationValidator } from '#validators/storage_locations/update_storage_location_validator'
import logger from '@adonisjs/core/services/logger'
import { HttpContext } from '@adonisjs/core/http'

export default class StorageLocationsController {
  async index({ auth, inertia }: HttpContext) {
    const storageLocations = await StorageLocation.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    // ⚠️ materialsCount = 0 en Epic 2 (table materials pas encore créée)
    // En Epic 3, remplacer par : .withCount('materials') et utiliser location.$extras.materialsCount
    const locationsWithCount = storageLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      createdAt: loc.createdAt,
      materialsCount: 0,
    }))

    return inertia.render('StorageLocations/Index', { storageLocations: locationsWithCount })
  }

  async store({ request, auth, response, session }: HttpContext) {
    // ✅ validateUsing HORS try-catch (validation exception = retour form auto)
    const data = await request.validateUsing(createStorageLocationValidator)

    try {
      await StorageLocation.create({
        userId: auth.user!.id,
        name: data.name,
      })
      session.flash('success', 'Lieu de stockage créé avec succès')
      return response.redirect().toRoute('storage-locations.index')
    } catch (error) {
      logger.error('StorageLocation creation failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la création du lieu')
      return response.redirect().back()
    }
  }

  async update({ request, auth, response, session, params }: HttpContext) {
    const data = await request.validateUsing(updateStorageLocationValidator)

    try {
      const location = await StorageLocation.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)  // Isolation multi-tenant CRITIQUE
        .firstOrFail()

      location.name = data.name
      await location.save()

      session.flash('success', 'Lieu modifié avec succès')
      return response.redirect().toRoute('storage-locations.index')
    } catch (error) {
      logger.error('StorageLocation update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification du lieu')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session, params }: HttpContext) {
    try {
      const location = await StorageLocation.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)  // Isolation multi-tenant CRITIQUE
        .firstOrFail()

      await location.delete()
      session.flash('success', 'Lieu supprimé avec succès')
    } catch (error) {
      // En Epic 3+, si FK violation (lieu contient des matériels) :
      logger.error('StorageLocation deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Ce lieu contient du matériel et ne peut pas être supprimé')
    }
    return response.redirect().toRoute('storage-locations.index')
  }
}
```

**⚠️ CRITIQUE : Named route avec kebab-case :**
```typescript
// ✅ CORRECT — le nom de route reflète le nom de la resource
response.redirect().toRoute('storage-locations.index')

// ❌ JAMAIS
response.redirect().toRoute('storageLocations.index')
response.redirect().toRoute('storage_locations.index')
```

**Routes — Resource dans le groupe auth :**

```typescript
// start/routes.ts — ajouter (APRÈS les imports existants)
const StorageLocationsController = () => import('#controllers/storage_locations_controller')

// Dans le groupe .use(middleware.auth()) :
router.resource('storage-locations', StorageLocationsController).only(['index', 'store', 'update', 'destroy'])
```

**Layout.tsx — Modifications requises :**

```typescript
// 1. Import à ajouter :
import {
  // ... icônes existantes ...
  InboxOutlined,
} from '@ant-design/icons'

// 2. Dans labelMap :
const labelMap: Record<string, string> = {
  categories: 'Catégories',
  types: 'Types',
  'storage-locations': 'Lieux de Stockage',  // ← AJOUTER (clé avec tiret)
  materials: 'Inventaire',
  // ...
}

// 3. Dans getSelectedKey() — AJOUTER avant les autres (priorité) :
if (url.startsWith('/storage-locations')) return 'storage-locations'
if (url.startsWith('/types')) return 'types'
if (url.startsWith('/categories')) return 'categories'
// ...

// 4. Dans menuItems (entre Types et Inventaire) :
{
  key: 'storage-locations',
  icon: <InboxOutlined />,
  label: <Link href="/storage-locations">Lieux de Stockage</Link>,
},
```

**Frontend — Page StorageLocations/Index.tsx (avec loading states SÉPARÉS, leçon 2.2) :**

```tsx
// inertia/pages/StorageLocations/Index.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Table } from 'antd'
import Layout from '~/components/Layout'

interface StorageLocationItem {
  id: number
  name: string
  materialsCount: number
  createdAt: string
}

interface Props {
  storageLocations: StorageLocationItem[]
}

export default function StorageLocationsIndex({ storageLocations }: Props) {
  // ✅ 2 instances Form SÉPARÉES (leçon 2.1/2.2)
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<StorageLocationItem | null>(null)
  // ✅ Loading states SÉPARÉS (leçon code review 2.2)
  const [createLoading, setCreateLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const handleCreate = (values: { name: string }) => {
    setCreateLoading(true)
    router.post('/storage-locations', { name: values.name }, {
      onSuccess: () => { setCreateModalOpen(false); createForm.resetFields() },
      onFinish: () => setCreateLoading(false),
    })
  }

  const handleEdit = (location: StorageLocationItem) => {
    setEditingLocation(location)
    editForm.setFieldsValue({ name: location.name })
    setEditModalOpen(true)
  }

  const handleUpdate = (values: { name: string }) => {
    if (!editingLocation) return
    setEditLoading(true)
    router.put(`/storage-locations/${editingLocation.id}`, { name: values.name }, {
      onSuccess: () => { setEditModalOpen(false); editForm.resetFields() },
      onFinish: () => setEditLoading(false),
    })
  }

  const handleDelete = (id: number) => {
    router.delete(`/storage-locations/${id}`)
  }

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    {
      title: "Nombre d'items",
      dataIndex: 'materialsCount',
      key: 'materialsCount',
    },
    {
      title: 'Date de création',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: StorageLocationItem) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Modifier</Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce lieu ?"
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
      <h1>Lieux de Stockage</h1>
      <Button type="primary" onClick={() => setCreateModalOpen(true)} style={{ marginBottom: 16 }}>
        Ajouter un lieu
      </Button>
      <Table dataSource={storageLocations} columns={columns} rowKey="id" />

      <Modal
        title="Ajouter un lieu"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields() }}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input placeholder="ex : Tiroir cartes, Bibliothèque, Valise close-up, Boîte pièces" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading}>Créer</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Modifier un lieu"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields() }}
        footer={null}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom du lieu est requis' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading}>Modifier</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
```

**Pattern test :**

```typescript
// inertia/pages/StorageLocations/Index.test.tsx
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StorageLocationsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/storage-locations', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockLocations = [
  { id: 1, name: 'Tiroir cartes', materialsCount: 0, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Bibliothèque', materialsCount: 0, createdAt: '2026-01-01T00:00:00.000Z' },
]

describe('StorageLocationsIndex', () => {
  it('affiche le titre Lieux de Stockage', () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    expect(screen.getByRole('heading', { name: 'Lieux de Stockage' })).toBeInTheDocument()
  })

  it('affiche le bouton Ajouter un lieu', () => {
    render(<StorageLocationsIndex storageLocations={[]} />)
    expect(screen.getByText('Ajouter un lieu')).toBeInTheDocument()
  })

  it('affiche la liste des lieux dans le tableau', async () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    await waitFor(() => {
      expect(screen.getByText('Tiroir cartes')).toBeInTheDocument()
      expect(screen.getByText('Bibliothèque')).toBeInTheDocument()
    })
  })

  it('ouvre le modal de création au clic Ajouter', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={[]} />)
    await user.click(screen.getByText('Ajouter un lieu'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('ouvre le modal de modification au clic Modifier', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    expect(screen.getByText('Modifier un lieu')).toBeInTheDocument()
  })

  it('boutons Supprimer sont présents', async () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    await waitFor(() => {
      const dangerButtons = screen.getAllByText('Supprimer')
      expect(dangerButtons.length).toBeGreaterThan(0)
    })
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    // Vérifier que le modal est ouvert et pré-rempli
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Soumettre le form
    const submitButton = screen.getByRole('button', { name: 'Modifier' })
    await user.click(submitButton)
    expect(router.put).toHaveBeenCalledWith(
      '/storage-locations/1',
      { name: 'Tiroir cartes' },
      expect.any(Object)
    )
  })
})
```

**⚠️ Ant Design Table dans jsdom** : Utiliser `waitFor` et `findAllByText` pour le contenu async du tableau.

### ⚠️ Scope Epic 2 — Table materials non encore disponible

En Epic 2, seules les tables `storage_locations`, `categories`, `types`, `users` existent. La table `materials` (Epic 3) n'existe pas encore. Conséquences :
- La colonne "Nombre d'items" affiche **toujours 0** dans ce scope (valeur hardcodée dans le controller)
- La **suppression** de lieux réussit toujours (aucun FK constraint côté matériels)
- Le scénario 8 (suppression bloquée) sera naturellement protégé par la migration materials (Epic 3)
- **NE PAS requêter** `materials` dans ce controller

**Comment activer le comptage dynamique en Epic 3 :**
```typescript
// À remplacer en Epic 3 dans StorageLocationsController.index() :
const storageLocations = await StorageLocation.query()
  .where('user_id', auth.user!.id)
  .withCount('materials')  // Nécessite relation hasMany sur StorageLocation model
  .orderBy('name', 'asc')
// Puis utiliser location.$extras.materialsCount
```

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
database/
  migrations/
    TIMESTAMP_create_storage_locations_table.ts  ← node ace make:migration create_storage_locations_table

app/
  models/
    storage_location.ts                          ← Lucid BaseModel (classe `StorageLocation`)
  controllers/
    storage_locations_controller.ts              ← CRUD controller (index, store, update, destroy)
  validators/
    storage_locations/
      create_storage_location_validator.ts       ← VineJS (name required)
      update_storage_location_validator.ts       ← VineJS (name required)

inertia/
  pages/
    StorageLocations/
      Index.tsx                                  ← Page liste + modals CRUD
      Index.test.tsx                             ← Tests composant
```

**Fichiers existants à MODIFIER :**
```
start/routes.ts                      ← Ajouter StorageLocationsController + resource storage-locations
inertia/components/Layout.tsx        ← Ajouter InboxOutlined + storage-locations dans labelMap + getSelectedKey + menuItems
```

**Fichiers NE PAS TOUCHER :**
- `app/controllers/auth_controller.ts` — Aucune modification requise (pas de lieux par défaut)
- `app/models/category.ts`, `app/models/type.ts` — Aucun lien avec storage_locations dans cette story
- `database/migrations/1770117743163_create_users_table.ts` — Ne jamais modifier une migration existante
- `app/controllers/categories_controller.ts`, `app/controllers/types_controller.ts` — Stories séparées

**Alignement architecture :**
- ✅ Controller dans `app/controllers/storage_locations_controller.ts` [Source: architecture.md#File Structure ligne 1124]
- ✅ Model dans `app/models/storage_location.ts` [Source: architecture.md#File Structure ligne 1134]
- ✅ Validators dans `app/validators/storage_locations/` [Source: architecture.md#File Structure lignes 1151-1153]
- ✅ Migration dans `database/migrations/` (généré via `node ace make:migration`)
- ✅ Pages dans `inertia/pages/StorageLocations/`
- ✅ Route `router.resource('storage-locations', ...)` kebab-case [Source: architecture.md ligne 1353]

### Learnings des Stories Précédentes

**Story 2.2 — Code review insights (NE PAS RÉPÉTER) :**
- ✅ Loading states SÉPARÉS : `createLoading` et `editLoading` (pas un seul `loading` partagé)
- ✅ Test `router.put` doit VRAIMENT vérifier l'appel avec les bons arguments (pas juste `not.toHaveBeenCalled()`)
- ✅ Modal création : utiliser `getByRole('dialog')` pour vérifier l'ouverture (plus robuste que `getAllByText`)
- ✅ `request.validateUsing(validator)` HORS du try-catch
- ✅ Isolation multi-tenant `.where('user_id', auth.user!.id)` sur chaque query (index + update + destroy)
- ✅ Catch dans `destroy()` : message générique + logger (pas de différenciation 404 vs FK nécessaire)
- ✅ `import type { ReactNode }` — PAS `React.ReactNode`

**Story 2.1 — Patterns fondamentaux :**
- ✅ `session.flash('success/error', '...')` + `response.redirect().toRoute('...')`
- ✅ `logger.error('...', { error, userId: auth.user?.id })` avec optional chaining
- ✅ VineJS `SimpleMessagesProvider` pour messages d'erreur en français

### Git Intelligence Summary

**Commits récents pertinents :**
- `5b8475e` : Story 2.2 — `types_controller.ts`, `app/models/type.ts`, `inertia/pages/Types/Index.tsx`, code review fixes (loading states séparés)
- `478f885` : Story 2.1 — `categories_controller.ts`, `app/models/category.ts`, defaults categories à l'inscription

**Pattern établi :**
- Stories implémentées comme unités atomiques (1 commit par story)
- Controller + Model + Validators + Migration + Frontend + Tests dans le même commit
- 77 tests passent actuellement

### References

- **[Source: epics.md#Story 2.3]** — User story, 8 scénarios BDD, FR16-19
- **[Source: epics.md#Epic 2]** — Contexte : Organisation et Taxonomie
- **[Source: architecture.md#File Structure ligne 1124]** — `app/controllers/storage_locations_controller.ts`
- **[Source: architecture.md#File Structure ligne 1134]** — `app/models/storage_location.ts`
- **[Source: architecture.md#File Structure lignes 1151-1153]** — `app/validators/storage_locations/`
- **[Source: architecture.md ligne 1353]** — `Route.resource('storage-locations', 'StorageLocationsController')` (kebab-case)
- **[Source: architecture.md#Naming Conventions ligne 679]** — URL kebab-case pour routes multi-mots
- **[Source: 2-2-gestion-des-types.md#Dev Notes]** — Patterns CRUD, validators, tests, loading states séparés
- **[Source: 2-2-gestion-des-types.md#Dev Agent Record]** — Code review insights : loading states séparés, test router.put robuste

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive des artefacts et des stories 2.1, 2.2

### Completion Notes List

**Phase Planification (2026-03-18):**
- ✅ Story auto-découverte depuis sprint-status.yaml (2-3-gestion-des-lieux-de-stockage = premier backlog)
- ✅ Analyse epics.md — 8 scénarios BDD extraits (FR16-19)
- ✅ Analyse architecture — storage_locations_controller.ts, models/storage_location.ts, validators/storage_locations/, route kebab-case
- ✅ Analyse stories 2.1, 2.2 — patterns CRUD et code review insights intégrés
- ✅ CRITIQUE documenté : route `storage-locations` (kebab-case) pour URL multi-mots
- ✅ CRITIQUE documenté : named route `storage-locations.index` (avec tiret)
- ✅ CRITIQUE documenté : `request.validateUsing()` HORS try-catch
- ✅ CRITIQUE documenté : isolation multi-tenant `.where('user_id', auth.user!.id)` sur chaque query
- ✅ CRITIQUE documenté : `node ace make:migration create_storage_locations_table` pour timestamp correct
- ✅ CRITIQUE documenté : 2 Form instances séparées (createForm + editForm) + loading states SÉPARÉS (leçon 2.2)
- ✅ CRITIQUE documenté : colonne "Nombre d'items" = 0 hardcodé en Epic 2 (table materials absente)
- ✅ Layout.tsx — ajouts nécessaires (InboxOutlined + storage-locations dans labelMap/getSelectedKey/menuItems)
- ✅ Pattern test documenté avec vérification router.put robuste (leçon code review 2.2)

**Phase Implémentation (2026-03-18):**
- ✅ Migration générée via `node ace make:migration create_storage_locations_table` (fichier : 1773861417949_create_storage_locations_table.ts) — nom de table corrigé de `create_storage_locations` → `storage_locations`
- ✅ Model `StorageLocation` créé — BaseModel, colonnes id/userId/name/createdAt/updatedAt, belongsTo User
- ✅ Validators créés — create + update, VineJS + SimpleMessagesProvider en français
- ✅ Controller créé — 4 actions (index, store, update, destroy), isolation multi-tenant, validateUsing hors try-catch, materialsCount: 0 hardcodé
- ✅ Routes ajoutées — resource kebab-case `storage-locations` dans groupe auth
- ✅ Page `StorageLocations/Index.tsx` créée — Table, 2 modals, Popconfirm, loading states séparés, 2 Form instances séparées
- ✅ Layout.tsx modifié — InboxOutlined, storage-locations dans labelMap/getSelectedKey (en premier)/menuItems
- ✅ Tests créés — 7 tests, `within(dialog)` pour éviter ambiguïté boutons "Modifier"
- ✅ Suite complète : 84 tests, 0 échec (77 → 84)

### File List

**Nouveaux fichiers créés :**
- `database/migrations/1773861417949_create_storage_locations_table.ts`
- `app/models/storage_location.ts`
- `app/controllers/storage_locations_controller.ts`
- `app/validators/storage_locations/create_storage_location_validator.ts`
- `app/validators/storage_locations/update_storage_location_validator.ts`
- `inertia/pages/StorageLocations/Index.tsx`
- `inertia/pages/StorageLocations/Index.test.tsx`

**Fichiers modifiés :**
- `start/routes.ts`
- `inertia/components/Layout.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-18 | 1.0 | Story créée — analyse exhaustive, patterns critiques documentés depuis stories 2.1, 2.2 et architecture | SM Agent |
| 2026-03-18 | 1.1 | Story implémentée — migration, model, validators, controller, routes, page frontend, tests (84 tests, 0 échec) | Dev Agent |
