# Story 3.5: Modification d'un Matériel

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **modifier un matériel existant**,
so that **je peux corriger ou mettre à jour ses informations** (FR8).

## Acceptance Criteria

**Scenario 1 : Navigation vers la page modification**
- **Given** je suis sur `/materials/:id`
- **When** je clique sur "Modifier"
- **Then** je suis redirigé vers `/materials/:id/edit`
- **And** le breadcrumb affiche : Accueil > Inventaire > [id] > Modifier

**Scenario 2 : Formulaire pré-rempli**
- **Given** je suis sur `/materials/:id/edit`
- **When** la page se charge
- **Then** je vois le même formulaire que la création (Story 3.1)
- **And** tous les champs sont pré-remplis avec les valeurs actuelles
- **And** les `Select` affichent les valeurs sélectionnées (Type, Catégories, Lieu de stockage)

**Scenario 3 : Validation client en temps réel**
- **Given** le formulaire est pré-rempli
- **When** je modifie un ou plusieurs champs
- **Then** la validation client fonctionne en temps réel
- **And** les erreurs s'affichent immédiatement si un champ requis est vidé

**Scenario 4 : Mise à jour réussie**
- **Given** je modifie le matériel
- **When** je soumets le formulaire avec des données valides
- **Then** le `updateMaterialValidator` valide côté serveur
- **And** le matériel est mis à jour dans la table `materials`
- **And** les associations `material_category` sont mises à jour (sync)
- **And** un message success s'affiche : "Matériel modifié avec succès"
- **And** je suis redirigé vers `/materials/:id` (détail)

**Scenario 5 : Validation champ requis**
- **Given** je modifie le matériel
- **When** je vide le champ Nom (requis)
- **Then** la validation client affiche : "Le nom est requis"
- **And** le bouton "Enregistrer les modifications" ne soumet pas le formulaire

**Scenario 6 : Annulation sans sauvegarde**
- **Given** je suis sur `/materials/:id/edit`
- **When** je clique sur "Annuler"
- **Then** je suis redirigé vers `/materials/:id` sans sauvegarder
- **And** aucune modification n'est appliquée

**Scenario 7 : Accès non autorisé (isolation multi-tenant)**
- **Given** un utilisateur tente d'accéder à `/materials/:id/edit` d'un autre utilisateur
- **When** la requête arrive sur le serveur
- **Then** une erreur 404 est retournée automatiquement (`firstOrFail`)

## Tasks / Subtasks

### Backend — Créer `app/validators/materials/update_material_validator.ts` (AC: 3, 4, 5)

- [x] Créer le fichier suivant le même pattern que `create_material_validator.ts`
  - [x] Mêmes règles de validation : `name` (requis, trim, 1-255), `typeId` (optionnel nullable), `storageLocationId` (optionnel nullable), `author` (optionnel nullable, 255 max), `categoryIds` (array de number, optionnel)
  - [x] Mêmes messages français avec `SimpleMessagesProvider`
  - [x] Exporter `updateMaterialValidator`

### Backend — Modifier `app/controllers/materials_controller.ts` (AC: 2, 4, 7)

- [x] Ajouter l'import de `updateMaterialValidator`
- [x] Ajouter la méthode `edit({ params, auth, inertia }: HttpContext)` (AC: 2, 7)
  - [x] Récupérer le matériel avec isolation multi-tenant : `.where('user_id', auth.user!.id).where('id', params.id).preload('type').preload('categories').preload('storageLocation').firstOrFail()`
  - [x] Récupérer `types`, `categories`, `storageLocations` via `Promise.all` (même pattern que `create()`)
  - [x] Retourner `inertia.render('Materials/Edit', { material: { id, name, typeId, categoryIds, storageLocationId, author }, types, categories, storageLocations })`
  - [x] Sérialiser `typeId: m.typeId`, `categoryIds: m.categories.map(c => c.id)`, `storageLocationId: m.storageLocationId`
- [x] Ajouter la méthode `update({ params, request, auth, response, session }: HttpContext)` (AC: 4, 7)
  - [x] Récupérer le matériel : `.where('user_id', auth.user!.id).where('id', params.id).preload('categories').firstOrFail()`
  - [x] Valider avec `updateMaterialValidator`
  - [x] Vérifier ownership de `typeId` (même pattern que `store()`)
  - [x] Vérifier ownership de `storageLocationId` (même pattern que `store()`)
  - [x] Vérifier ownership des `categoryIds` (même pattern que `store()`)
  - [x] Mettre à jour : `material.name = data.name`, `material.typeId = data.typeId ?? null`, etc., puis `await material.save()`
  - [x] Synchroniser les catégories : `await material.related('categories').sync(data.categoryIds ?? [])`
  - [x] `session.flash('success', 'Matériel modifié avec succès')`
  - [x] `return response.redirect().toRoute('materials.show', { id: material.id })`
  - [x] Gérer les erreurs avec `try/catch` + `logger.error` + `session.flash('error', ...)` + `response.redirect().back()`

### Backend — Modifier `start/routes.ts` (AC: 1)

- [x] Ajouter `'edit'` et `'update'` à la liste des actions resource materials
  - [x] Changer `.only(['index', 'create', 'store', 'show'])` en `.only(['index', 'create', 'store', 'show', 'edit', 'update'])`

### Frontend — Créer `inertia/pages/Materials/Edit.tsx` (AC: 1, 2, 3, 5, 6)

- [x] Définir les interfaces TypeScript
  - [x] `interface MaterialEditData { id: number; name: string; typeId: number | null; categoryIds: number[]; storageLocationId: number | null; author: string | null }`
  - [x] `interface TypeItem { id: number; name: string }` (idem Create)
  - [x] `interface CategoryItem { id: number; name: string }` (idem Create)
  - [x] `interface LocationItem { id: number; name: string }` (idem Create)
  - [x] `interface Props { material: MaterialEditData; types: TypeItem[]; categories: CategoryItem[]; storageLocations: LocationItem[] }`
- [x] Créer le composant `MaterialsEdit` (AC: 2, 3, 5, 6)
  - [x] `import { router } from '@inertiajs/react'`
  - [x] `import { Button, Form, Input, Select } from 'antd'`
  - [x] `import Layout from '~/components/Layout'`
  - [x] `const [form] = Form.useForm()`
  - [x] `const [submitting, setSubmitting] = useState(false)`
  - [x] Pré-remplir le formulaire avec `Form` prop `initialValues` : `{ name: material.name, typeId: material.typeId, categoryIds: material.categoryIds, storageLocationId: material.storageLocationId, author: material.author }`
  - [x] Utiliser `<Layout title="Modifier">` pour breadcrumb : `Accueil > Inventaire > [id] > Modifier`
  - [x] `<h1>Modifier le matériel</h1>`
- [x] Implémenter les 5 champs du formulaire (AC: 2) — même structure que `Create.tsx` :
  - [x] `Form.Item name="name"` avec règle `required` et message "Le nom est requis"
  - [x] `Form.Item name="typeId"` avec `Select allowClear`
  - [x] `Form.Item name="categoryIds"` avec `Select mode="multiple" allowClear`
  - [x] `Form.Item name="storageLocationId"` avec `Select allowClear`
  - [x] `Form.Item name="author"` avec `Input`
- [x] Implémenter le submit et les boutons (AC: 4, 6)
  - [x] `handleSubmit` : `router.put('/materials/' + material.id, values, { onFinish: () => setSubmitting(false), onError: () => setSubmitting(false) })`
  - [x] Bouton "Enregistrer les modifications" (type `primary`, `htmlType="submit"`, `loading={submitting}`)
  - [x] Bouton "Annuler" : `onClick={() => router.visit('/materials/' + material.id)}`

### Frontend — Créer `inertia/pages/Materials/Edit.test.tsx` (AC: 1, 2, 3, 4, 5, 6)

- [x] Configurer les mocks standards
  - [x] Mock `@inertiajs/react` : `router` (put + visit), `Link`, `usePage` (url: `/materials/1/edit`)
  - [x] Mock `~/components/Layout`
  - [x] `mockMaterial` complet avec toutes les propriétés (`id: 1, name, typeId, categoryIds, storageLocationId, author`)
  - [x] `mockTypes`, `mockCategories`, `mockLocations` (idem Create.test.tsx)
- [x] Test AC 1 — rendu initial
  - [x] Test : le titre "Modifier le matériel" est visible
  - [x] Test : les 5 champs sont présents (Nom, Type, Catégorie(s), Lieu de stockage, Auteur)
  - [x] Test : le champ Nom est pré-rempli avec `material.name`
- [x] Test AC 5 — validation champ requis
  - [x] Test : soumission avec Nom vide affiche "Le nom est requis"
  - [x] Test : `router.put` n'est pas appelé si Nom vide
- [x] Test AC 4 — soumission réussie
  - [x] Test : `router.put` appelé avec `/materials/1` et les données correctes
- [x] Test AC 6 — annulation
  - [x] Test : clic Annuler → `router.visit` appelé avec `/materials/1`
- [x] Lancer `npx vitest run` — 0 régression (137 tests actuels + nouveaux tests, 0 échec)

## Dev Notes

### 🎯 Approche Générale

**Fichiers à créer :**
```
app/validators/materials/update_material_validator.ts  ← CRÉER (copie de create_material_validator)
inertia/pages/Materials/Edit.tsx                       ← CRÉER (fork de Create.tsx + pré-remplissage)
inertia/pages/Materials/Edit.test.tsx                  ← CRÉER (tests)
```

**Fichiers à modifier :**
```
app/controllers/materials_controller.ts  ← MODIFIER (ajouter edit() et update())
start/routes.ts                          ← MODIFIER (ajouter 'edit' et 'update')
```

**Fichiers SANS modification :**
```
inertia/pages/Materials/Show.tsx   ← Bouton "Modifier" déjà implémenté (router.visit('/materials/' + id + '/edit'))
inertia/pages/Materials/Create.tsx ← Intoucher
app/models/material.ts             ← Intoucher
inertia/components/Layout.tsx      ← Utilisation standard
```

### 🔥 Pattern Critique — Validator `update_material_validator.ts`

```typescript
// app/validators/materials/update_material_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom du matériel est requis',
})

export const updateMaterialValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    typeId: vine.number().optional().nullable(),
    storageLocationId: vine.number().optional().nullable(),
    author: vine.string().trim().maxLength(255).optional().nullable(),
    categoryIds: vine.array(vine.number()).optional(),
  })
)
updateMaterialValidator.messagesProvider = frenchMessages
```

### 🔥 Pattern Critique — Controller `edit()` et `update()`

```typescript
// app/controllers/materials_controller.ts — import à ajouter
import { updateMaterialValidator } from '#validators/materials/update_material_validator'

// Méthode edit()
async edit({ params, auth, inertia }: HttpContext) {
  const material = await Material.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('type')
    .preload('categories')
    .preload('storageLocation')
    .firstOrFail()

  const [types, categories, storageLocations] = await Promise.all([
    Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
  ])

  return inertia.render('Materials/Edit', {
    material: {
      id: material.id,
      name: material.name,
      typeId: material.typeId,
      categoryIds: material.categories.map((c) => c.id),
      storageLocationId: material.storageLocationId,
      author: material.author,
    },
    types: types.map((t) => ({ id: t.id, name: t.name })),
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    storageLocations: storageLocations.map((l) => ({ id: l.id, name: l.name })),
  })
}

// Méthode update()
async update({ params, request, auth, response, session }: HttpContext) {
  const material = await Material.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('categories')
    .firstOrFail()

  const data = await request.validateUsing(updateMaterialValidator)

  try {
    // Vérifications ownership (même pattern que store())
    if (data.typeId) {
      const ownedType = await Type.query()
        .where('id', data.typeId)
        .where('user_id', auth.user!.id)
        .first()
      if (!ownedType) {
        session.flash('error', 'Type invalide')
        return response.redirect().back()
      }
    }

    if (data.storageLocationId) {
      const ownedLocation = await StorageLocation.query()
        .where('id', data.storageLocationId)
        .where('user_id', auth.user!.id)
        .first()
      if (!ownedLocation) {
        session.flash('error', 'Lieu de stockage invalide')
        return response.redirect().back()
      }
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      const ownedCategories = await Category.query()
        .whereIn('id', data.categoryIds)
        .where('user_id', auth.user!.id)
      if (ownedCategories.length !== data.categoryIds.length) {
        session.flash('error', 'Catégorie(s) invalide(s)')
        return response.redirect().back()
      }
    }

    material.name = data.name
    material.typeId = data.typeId ?? null
    material.storageLocationId = data.storageLocationId ?? null
    material.author = data.author ?? null
    await material.save()

    await material.related('categories').sync(data.categoryIds ?? [])

    session.flash('success', 'Matériel modifié avec succès')
    return response.redirect().toRoute('materials.show', { id: material.id })
  } catch (error) {
    logger.error('Material update failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de la modification du matériel')
    return response.redirect().back()
  }
}
```

**⚠️ CRITIQUE — Ordre des opérations dans `update()`** : `firstOrFail()` se fait AVANT `validateUsing()` pour garantir que l'utilisateur possède bien le matériel avant toute opération. La validation du formulaire peut échouer côté client mais pas côté serveur — s'assurer que le matériel existe et appartient à l'user en premier.

### 🔥 Pattern Critique — Route `edit` et `update`

```typescript
// start/routes.ts — AVANT
router.resource('materials', MaterialsController).only(['index', 'create', 'store', 'show'])

// APRÈS — Ajouter 'edit' et 'update'
router.resource('materials', MaterialsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
```

Ceci génère automatiquement :
- `GET /materials/:id/edit → materials.edit`
- `PUT /materials/:id → materials.update`

### 🔥 Pattern Critique — Composant `Edit.tsx`

```tsx
// inertia/pages/Materials/Edit.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface MaterialEditData {
  id: number
  name: string
  typeId: number | null
  categoryIds: number[]
  storageLocationId: number | null
  author: string | null
}

interface TypeItem { id: number; name: string }
interface CategoryItem { id: number; name: string }
interface LocationItem { id: number; name: string }

interface Props {
  material: MaterialEditData
  types: TypeItem[]
  categories: CategoryItem[]
  storageLocations: LocationItem[]
}

export default function MaterialsEdit({ material, types, categories, storageLocations }: Props) {
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
    router.put(`/materials/${material.id}`, values, {
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    })
  }

  return (
    <Layout title="Modifier">
      <h1>Modifier le matériel</h1>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 600 }}
        initialValues={{
          name: material.name,
          typeId: material.typeId,
          categoryIds: material.categoryIds,
          storageLocationId: material.storageLocationId,
          author: material.author,
        }}
      >
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
            Enregistrer les modifications
          </Button>
          <Button onClick={() => router.visit(`/materials/${material.id}`)}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
```

**⚠️ CRITIQUE — `initialValues` vs `form.setFieldsValue()`** : Utiliser la prop `initialValues` sur `<Form>` est la bonne approche pour pré-remplir un formulaire Ant Design au montage. Ne PAS utiliser `useEffect` + `form.setFieldsValue()` — `initialValues` est suffisant ici.

**⚠️ CRITIQUE — `router.put()` (pas `router.post()`)** : Pour la mise à jour, Inertia utilise `router.put()` qui envoie une requête HTTP `PUT`. AdonisJS resource routing mappe `PUT /materials/:id` → `materials.update`.

### 🔥 Pattern Critique — Tests `Edit.test.tsx`

```typescript
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MaterialsEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/materials/1/edit', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockMaterial = {
  id: 1,
  name: 'Bicycle Standard',
  typeId: 1,
  categoryIds: [1, 2],
  storageLocationId: 1,
  author: 'Dai Vernon',
}
const mockTypes = [{ id: 1, name: 'Jeu de cartes' }, { id: 2, name: 'Accessoire' }]
const mockCategories = [{ id: 1, name: 'Cartomagie' }, { id: 2, name: 'Close-up' }]
const mockLocations = [{ id: 1, name: 'Tiroir cartes' }]

function renderEdit(materialOverrides = {}) {
  return render(
    <MaterialsEdit
      material={{ ...mockMaterial, ...materialOverrides }}
      types={mockTypes}
      categories={mockCategories}
      storageLocations={mockLocations}
    />
  )
}

describe('MaterialsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier le matériel"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier le matériel/i })).toBeInTheDocument()
  })

  it('affiche les 5 champs du formulaire', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Catégorie(s)')).toBeInTheDocument()
    expect(screen.getByText('Lieu de stockage')).toBeInTheDocument()
    expect(screen.getByLabelText('Auteur')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom du matériel', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('Bicycle Standard')
  })

  it('pré-remplit le champ Auteur avec la valeur actuelle', () => {
    renderEdit()
    expect(screen.getByLabelText('Auteur')).toHaveValue('Dai Vernon')
  })

  it('affiche les boutons Enregistrer et Annuler', () => {
    renderEdit()
    expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.put si le Nom est vide", async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.put).not.toHaveBeenCalled()
  })

  it('appelle router.put avec les bonnes données à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.type(nameInput, 'Bicycle 808')
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/materials/1',
        expect.objectContaining({ name: 'Bicycle 808' }),
        expect.objectContaining({ onFinish: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })

  it('appelle router.visit vers /materials/1 au clic Annuler', async () => {
    const user = userEvent.setup()
    renderEdit()
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })
})
```

### ⚠️ CRITIQUE — Breadcrumb pour `/materials/:id/edit`

Le composant `Layout.tsx` génère les breadcrumbs depuis les segments d'URL. Pour `/materials/1/edit` :
- `materials` → "Inventaire" (link vers `/materials`) ✅
- `1` → affiche l'ID brut `"1"` (lien vers `/materials/1`) — PAS le nom du matériel
- `edit` → isLast → affiche `title` prop → "Modifier" ✅

**Le breadcrumb sera** : `Accueil > Inventaire > 1 > Modifier`

C'est acceptable (l'ID `1` est un lien cliquable vers la page détail). Le nom complet `[Nom]` nécessiterait de modifier `Layout.tsx` ce qui est hors scope de cette story. **Ne pas modifier Layout.tsx.**

### ⚠️ CRITIQUE — `router.put()` vs méthode HTTP

Ant Design Form + `router.put()` d'Inertia : la requête HTTP sera `PUT /materials/:id`. AdonisJS resource route mappe `PUT /materials/:id` → `update`. Vérifier que la route `update` est bien dans la liste `.only([...])`.

### ⚠️ CRITIQUE — `sync()` vide les catégories si aucune sélectionnée

`material.related('categories').sync([])` supprime toutes les associations. C'est le comportement attendu — si l'utilisateur retire toutes les catégories, le matériel n'en a plus. **Ne pas** faire `if (data.categoryIds && data.categoryIds.length > 0)` avant le sync.

### ⚠️ CRITIQUE — `firstOrFail()` en premier dans `update()`

Dans `update()`, récupérer le matériel (et vérifier ownership) AVANT `validateUsing()`. Cela garantit un 404 si l'utilisateur tente de modifier un matériel qui ne lui appartient pas, indépendamment de la validité des données.

### ⚠️ CRITIQUE — `Show.tsx` déjà prêt

Le bouton "Modifier" dans `Show.tsx` navigue déjà vers `/materials/${material.id}/edit`. **Aucune modification de Show.tsx** n'est nécessaire — la route était simplement absente côté backend.

### Project Structure Notes

**Alignement architecture :**
- ✅ Nouveau validator `update_material_validator.ts` (cohérent avec `update_type_validator.ts`, `update_storage_location_validator.ts`)
- ✅ Méthodes `edit()` / `update()` suivent le pattern resource AdonisJS standard
- ✅ Route resource `.only([...])` étendue avec `'edit'` et `'update'`
- ✅ `Edit.tsx` miroir de `Create.tsx` avec `initialValues` pour pré-remplissage
- ✅ `router.put()` Inertia pour PUT HTTP
- ✅ `sync([])` pour mise à jour des associations ManyToMany
- ✅ Isolation multi-tenant : `.where('user_id', auth.user!.id)` + `firstOrFail()`
- ✅ Aucune dépendance nouvelle requise

### References

- **[Source: epics.md#Story 3.5]** — User story FR8, 7 scénarios BDD
- **[Source: epics.md#Epic 3]** — Contexte Gestion de l'Inventaire
- **[Source: architecture.md#Backend Architecture]** — Resource routing AdonisJS, controllers, multi-tenant isolation, validators
- **[Source: app/controllers/materials_controller.ts]** — Pattern store() : vérifications ownership, sync(), flash messages
- **[Source: app/validators/materials/create_material_validator.ts]** — Template exact pour update_material_validator
- **[Source: inertia/pages/Materials/Create.tsx]** — Template exact pour Edit.tsx (form fields, layout)
- **[Source: inertia/pages/Materials/Create.test.tsx]** — Template exact pour Edit.test.tsx (mocks, patterns)
- **[Source: inertia/pages/Materials/Show.tsx]** — Bouton "Modifier" déjà implémenté (no-op pour cette story)
- **[Source: start/routes.ts:47]** — Route resource materials à modifier
- **[Source: 3-4-detail-dun-materiel.md]** — Learnings Story 3.4, patterns tests, 137 tests actuels

### Learnings des Stories Précédentes

**Story 3.4 — Patterns à respecter :**
- ✅ `beforeEach(() => vi.clearAllMocks())` dans chaque `describe`
- ✅ Mocks standards : `@inertiajs/react` (router avec toutes les méthodes utilisées), `~/components/Layout`
- ✅ 137 tests passent actuellement — 0 régression attendue
- ✅ `firstOrFail()` pour isolation multi-tenant automatique
- ✅ `logger.error` dans les catch blocks (import déjà présent dans le controller)

**Story 3.1 (Create) — Pattern de référence exact pour Edit :**
- `router.post()` → remplacer par `router.put()` pour l'update
- `Form initialValues` est la bonne approche pour pré-remplir (pas `useEffect + setFieldsValue`)
- Même validation côté client : `required` + message "Le nom est requis"

**Story 2.3/2.4 (StorageLocations) — Pattern update validator :**
- `update_storage_location_validator.ts` existe déjà et montre le pattern exact à suivre
- Même structure que le create validator mais nommé `update`

### Git Intelligence Summary

**Commits récents pertinents :**
- `61c0801` : Story 3.4 — Show.tsx avec bouton "Modifier" naviguant vers `/materials/:id/edit` (route créée à cette story)
- `42a5f9e` : Story 3.2 — MaterialsController index() + store() patterns établis
- `ca3a19d` : Story 3.1 — Create.tsx template de référence exact pour Edit.tsx

**État actuel (2026-03-21) :**
- 137 tests passent (0 échec — suite complète Story 3.4)
- Route `/materials/:id/edit` non créée côté backend (AdonisJS)
- `Materials/Edit.tsx` n'existe pas encore — à créer
- `update_material_validator.ts` n'existe pas encore — à créer

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive : sprint-status.yaml (3-5 auto-découverte), epics.md (Story 3.5 extraite, 7 scénarios BDD FR8), materials_controller.ts (patterns store() existants), Create.tsx (template form), Create.test.tsx (patterns tests), Show.tsx (bouton Modifier déjà présent), routes.ts (route à modifier), Layout.tsx (breadcrumb behaviour analysé), architecture.md (resource routing, validators, multi-tenant), git log (137 tests actuels)

### Completion Notes List

**Phase Code Review — Fixes (2026-03-21) :**
- ✅ [M1] `edit()` : suppression de `.preload('type')` et `.preload('storageLocation')` inutiles (2 requêtes DB en moins)
- ✅ [M2] `Edit.tsx` : suppression `onError` redondant dans `router.put` (onFinish suffit)
- ✅ [M3] `Edit.test.tsx` : ajout test pour valeurs initiales nulles (typeId/storageLocationId/author = null)
- ✅ [L1] `Edit.tsx` : types TypeScript corrigés (`typeId?: number | null`, etc.)
- ✅ [L2] `Edit.test.tsx` : test router.put vérifie maintenant tous les champs (typeId, categoryIds, storageLocationId, author)
- ✅ 147 tests passent (0 régression)

**Phase Implémentation (2026-03-21) :**
- ✅ `update_material_validator.ts` créé (copie exacte de `create_material_validator.ts` avec renommage)
- ✅ `materials_controller.ts` mis à jour : `edit()` + `update()` ajoutés (isolation multi-tenant, ownership checks, sync catégories)
- ✅ `start/routes.ts` mis à jour : `'edit'` et `'update'` ajoutés au resource materials
- ✅ `Edit.tsx` créé : fork de `Create.tsx` avec `initialValues` pour pré-remplissage, `router.put()` pour submit
- ✅ `Edit.test.tsx` créé : 9 tests couvrant AC 1, 2, 4, 5, 6
- ✅ 146 tests passent (137 existants + 9 nouveaux, 0 régression)

**Phase Planification (2026-03-21) :**
- ✅ Story auto-découverte depuis sprint-status.yaml (3-5-modification-dun-materiel = premier backlog)
- ✅ Epic 3 analysé depuis epics.md — Story 3.5 extraite avec 7 scénarios BDD (FR8)
- ✅ MaterialsController analysé — méthodes `edit()` et `update()` manquantes identifiées
- ✅ Route resource analysée — `'edit'` et `'update'` manquants identifiés
- ✅ Create.tsx analysé — template exact pour Edit.tsx (initialValues pour pré-remplissage)
- ✅ Show.tsx analysé — bouton "Modifier" déjà présent, aucune modification nécessaire
- ✅ Layout.tsx analysé — breadcrumb comportement documenté (ID brut pour segments intermédiaires)
- ✅ CRITIQUE documenté : `router.put()` (pas `router.post()`) pour l'update
- ✅ CRITIQUE documenté : `sync([])` vide toutes les catégories si aucune sélectionnée — comportement attendu
- ✅ CRITIQUE documenté : `firstOrFail()` en premier dans `update()` pour sécurité
- ✅ Code complet `edit()`, `update()`, `Edit.tsx`, `Edit.test.tsx` documenté dans Dev Notes

### File List

**Fichiers créés :**
- `app/validators/materials/update_material_validator.ts`
- `inertia/pages/Materials/Edit.tsx`
- `inertia/pages/Materials/Edit.test.tsx`

**Fichiers modifiés :**
- `app/controllers/materials_controller.ts`
- `start/routes.ts`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-21 | 1.0 | Story créée — analyse exhaustive : epics.md (7 BDD scénarios FR8), materials_controller.ts (store() pattern), Create.tsx (template form), Show.tsx (bouton Modifier déjà présent), routes.ts (edit+update manquants), Layout.tsx (breadcrumb analyse), 137 tests actuels | SM Agent |
| 2026-03-21 | 1.1 | Implémentation complète — update_material_validator.ts (copie create), edit()+update() dans MaterialsController, routes 'edit'+'update', Edit.tsx (fork Create.tsx + initialValues), Edit.test.tsx (9 tests), 146 tests passent (0 régression) | Dev Agent |
| 2026-03-21 | 1.2 | Code review fixes — [M1] preloads inutiles supprimés, [M2] onError redondant supprimé, [M3] test valeurs nulles ajouté, [L1] types TS corrigés, [L2] assertions router.put complètes, 147 tests passent | Review Agent |
