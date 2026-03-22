# Story 4.2: Éditeur de Contenu pour Routines

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **écrire et éditer le contenu de ma routine (script, mise en scène, déroulé)**,
so that **je peux documenter ma routine complètement** (FR31).

## Acceptance Criteria

**Scenario 1 : Breadcrumb sur la page d'édition**
- **Given** je viens de créer une routine (Story 4.1) et suis redirigé vers /routines/:id/edit
- **When** la page se charge
- **Then** le breadcrumb affiche : Accueil > Routines > [id] > [Nom de la routine]
  - *(Note technique : avec le Layout actuel, le segment intermédiaire ID affiche le numéro — le Layout utilise `title` pour le dernier segment. Passer `title={routine.name}` donne : Accueil > Routines > 1 > [Nom], ce qui est l'approximation la plus proche avec le code existant. Acceptable pour MVP.)*

**Scenario 2 : Affichage du formulaire d'édition**
- **Given** je suis sur /routines/:id/edit
- **When** la page se charge
- **Then** je vois un formulaire Ant Design Form pré-rempli avec :
  - Nom (Input, valeur actuelle de la routine)
  - Catégorie(s) (Select multiple, catégories actuellement associées)
  - Contenu (Input.TextArea, valeur actuelle ou vide)

**Scenario 3 : Champ Contenu — TextArea avec autoSize**
- **Given** je vois le champ Contenu
- **When** je clique dessus
- **Then** le TextArea s'agrandit automatiquement (`autoSize={{ minRows: 10, maxRows: 30 }}`)
- **And** le placeholder affiche : "Écrivez votre script, mise en scène, déroulé technique..."
- **And** le formatage texte brut est supporté (pas d'éditeur riche pour MVP)

**Scenario 4 : Saisie multiline dans le Contenu**
- **Given** je tape dans le champ Contenu
- **When** j'écris mon script/mise en scène avec des retours à la ligne
- **Then** le texte est affiché avec les retours à la ligne préservés
- **And** le texte sera sauvegardé tel quel lors de la soumission

**Scenario 5 : Soumission réussie**
- **Given** j'édite le contenu de ma routine
- **When** je soumets le formulaire
- **Then** le validator UpdateRoutineValidator valide côté serveur
- **And** la routine est mise à jour (nom, catégories, contenu)
- **And** un message success s'affiche : "Routine enregistrée avec succès"
- **And** je suis redirigé vers /routines/:id (page détail)

**Scenario 6 : Validation — Nom requis**
- **Given** je vide le champ Nom
- **When** je tente de soumettre le formulaire
- **Then** la validation client affiche : "Le nom est requis"
- **And** le formulaire n'est pas soumis

**Scenario 7 : Bouton Annuler**
- **Given** je suis sur la page édition
- **When** je clique sur "Annuler"
- **Then** je suis redirigé vers /routines/:id (détail) sans sauvegarder les modifications

**Scenario 8 : Bouton Liaison matériel (placeholder Story 4.3)**
- **Given** je suis sur la page édition
- **When** je clique sur "Liaison matériel"
- **Then** je suis redirigé vers /routines/:id (la section liaison matériel sera ajoutée en Story 4.3)
  - *(Note : ce bouton est un placeholder. En Story 4.3, il ouvrira le modal de liaison directement.)*

## Tasks / Subtasks

### Backend — Validator (AC: 5, 6)

- [x] Créer `app/validators/routines/update_routine_validator.ts` (AC: 5, 6)
  - [x] Copier le pattern `update_material_validator.ts`
  - [x] `name: vine.string().trim().minLength(1).maxLength(255)`
  - [x] `categoryIds: vine.array(vine.number()).optional()`
  - [x] `content: vine.string().trim().optional().nullable()`
  - [x] Messages français : `'name.required': 'Le nom de la routine est requis'`

### Backend — Controller (AC: 1, 2, 5, 7)

- [x] Ajouter méthode `edit` dans `app/controllers/routines_controller.ts` (AC: 1, 2)
  - [x] Charger la routine avec `.where('user_id', auth.user!.id).where('id', params.id).preload('categories').firstOrFail()`
  - [x] Charger les catégories de l'utilisateur
  - [x] Render `Routines/Edit` avec `{ routine: { id, name, content, categoryIds }, categories }`
- [x] Ajouter méthode `update` dans `app/controllers/routines_controller.ts` (AC: 5, 6)
  - [x] Charger la routine avec `firstOrFail()` (owner check via user_id)
  - [x] Valider avec `updateRoutineValidator`
  - [x] `routine.name = data.name`
  - [x] `routine.content = data.content ?? null`
  - [x] `await routine.save()`
  - [x] `await routine.related('categories').sync(data.categoryIds ?? [])`
  - [x] Flash success "Routine enregistrée avec succès"
  - [x] Redirect vers `/routines/${routine.id}`

### Backend — Routes (AC: 1, 5, 7)

- [x] Modifier `start/routes.ts` : étendre la resource routines (AC: 1, 5, 7)
  - [x] Changer `.only(['create', 'store'])` → `.only(['create', 'store', 'edit', 'update'])`

### Frontend — Page Edit (AC: 1, 2, 3, 4, 7, 8)

- [x] Créer `inertia/pages/Routines/Edit.tsx` (AC: 1–4, 7, 8)
  - [x] Props : `routine: RoutineEditData`, `categories: CategoryItem[]`
  - [x] Ant Design `Form` avec `layout="vertical"`, `style={{ maxWidth: 600 }}`, `initialValues={{ name, categoryIds, content }}`
  - [x] Champ "Nom" : `Form.Item name="name"` + `rules={[{ required: true, message: 'Le nom est requis' }]}` + `<Input />`
  - [x] Champ "Catégorie(s)" : `Form.Item name="categoryIds"` + `<Select mode="multiple" allowClear .../>`
  - [x] Champ "Contenu" : `Form.Item name="content" label="Contenu"` + `<Input.TextArea autoSize={{ minRows: 10, maxRows: 30 }} placeholder="Écrivez votre script, mise en scène, déroulé technique..." />`
  - [x] Bouton "Enregistrer" (`type="primary" htmlType="submit" loading={submitting}`)
  - [x] Bouton "Liaison matériel" (`onClick={() => router.visit('/routines/' + routine.id)}`)
  - [x] Bouton "Annuler" (`onClick={() => router.visit('/routines/' + routine.id)}`)
  - [x] `router.put('/routines/' + routine.id, values, { onFinish: () => setSubmitting(false) })`
  - [x] `<Layout title={routine.name}>` pour le breadcrumb (Accueil > Routines > [id] > [Nom])

### Frontend — Tests (AC: 1–8)

- [x] Créer `inertia/pages/Routines/Edit.test.tsx` (AC: 1–8)
  - [x] Mock `@inertiajs/react` : `router: { put: vi.fn(), visit: vi.fn() }`, `usePage: () => ({ url: '/routines/1/edit', props: {} })`
  - [x] Mock `~/components/Layout`
  - [x] Test : affiche le titre "Modifier la routine" ou heading (AC: 2)
  - [x] Test : affiche les 3 champs (Nom, Catégorie(s), Contenu) (AC: 2)
  - [x] Test : pré-remplit le champ Nom avec le nom de la routine (AC: 2)
  - [x] Test : pré-remplit le champ Contenu avec le contenu existant (AC: 2)
  - [x] Test : affiche erreur validation si Nom vide à la soumission (AC: 6)
  - [x] Test : n'appelle pas router.put si Nom vide (AC: 6)
  - [x] Test : appelle `router.put('/routines/1', ...)` avec les bonnes données à la soumission (AC: 5)
  - [x] Test : appelle `router.visit('/routines/1')` au clic Annuler (AC: 7)
  - [x] Test : appelle `router.visit('/routines/1')` au clic "Liaison matériel" (AC: 8)
  - [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Contexte — Continuation Story 4.1

Story 4.2 est la suite directe de 4.1. La table `routines`, le model `Routine`, et le controller de base existent déjà. Cette story ajoute :
- `edit` + `update` au controller
- `update_routine_validator.ts`
- La page `Routines/Edit.tsx` avec le champ Contenu (TextArea)
- Extension des routes resource

**Note importante sur `content`** : Dans story 4.1, le controller crée la routine avec `content: null` (pas `''`). Le validator `update_routine_validator` doit accepter `null` et les chaînes vides.

### 🏗️ Validator — UpdateRoutineValidator

```typescript
// app/validators/routines/update_routine_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'string': 'Ce champ doit être une chaîne de caractères',
  'minLength': 'Ce champ doit contenir au moins {{ min }} caractère(s)',
  'maxLength': 'Ce champ ne peut pas dépasser {{ max }} caractères',
  'name.required': 'Le nom de la routine est requis',
})

export const updateRoutineValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    categoryIds: vine.array(vine.number()).optional(),
    content: vine.string().trim().optional().nullable(),
  })
)
updateRoutineValidator.messagesProvider = frenchMessages
```

### 🏗️ Controller — Méthodes edit + update

```typescript
// app/controllers/routines_controller.ts — ajouter ces méthodes

import { updateRoutineValidator } from '#validators/routines/update_routine_validator'

// Ajouter dans la classe RoutinesController :

async edit({ params, auth, inertia }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('categories')
    .firstOrFail()

  const categories = await Category.query()
    .where('user_id', auth.user!.id)
    .orderBy('name', 'asc')

  return inertia.render('Routines/Edit', {
    routine: {
      id: routine.id,
      name: routine.name,
      content: routine.content,
      categoryIds: routine.categories.map((c) => c.id),
    },
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
  })
}

async update({ params, request, auth, session, response }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('categories')
    .firstOrFail()

  const data = await request.validateUsing(updateRoutineValidator)

  try {
    routine.name = data.name
    routine.content = data.content ?? null
    await routine.save()

    await routine.related('categories').sync(data.categoryIds ?? [])

    session.flash('success', 'Routine enregistrée avec succès')
    return response.redirect().toPath(`/routines/${routine.id}`)
  } catch (error) {
    logger.error('Failed to update routine', { error, data })
    session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
    return response.redirect().back()
  }
}
```

### 🏗️ Routes — Étendre la resource routines

```typescript
// start/routes.ts — modifier la ligne existante :
// AVANT :
router.resource('routines', RoutinesController).only(['create', 'store'])
// APRÈS :
router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])
```

### 🏗️ Page Edit.tsx — Calquée sur Materials/Edit.tsx + champ Contenu

```tsx
// inertia/pages/Routines/Edit.tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import Layout from '~/components/Layout'

interface RoutineEditData {
  id: number
  name: string
  content: string | null
  categoryIds: number[]
}

interface CategoryItem {
  id: number
  name: string
}

interface Props {
  routine: RoutineEditData
  categories: CategoryItem[]
}

export default function RoutinesEdit({ routine, categories }: Props) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (values: {
    name: string
    categoryIds?: number[]
    content?: string | null
  }) => {
    setSubmitting(true)
    router.put(`/routines/${routine.id}`, values, {
      onFinish: () => setSubmitting(false),
    })
  }

  return (
    <Layout title={routine.name}>
      <h1>Modifier la routine</h1>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{ maxWidth: 600 }}
        initialValues={{
          name: routine.name,
          categoryIds: routine.categoryIds,
          content: routine.content ?? '',
        }}
      >
        <Form.Item
          name="name"
          label="Nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Ex: La pièce voyageuse, Le détective..." />
        </Form.Item>

        <Form.Item name="categoryIds" label="Catégorie(s)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Sélectionner des catégories..."
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="content" label="Contenu">
          <Input.TextArea
            autoSize={{ minRows: 10, maxRows: 30 }}
            placeholder="Écrivez votre script, mise en scène, déroulé technique..."
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
            Enregistrer
          </Button>
          <Button
            onClick={() => router.visit(`/routines/${routine.id}`)}
            style={{ marginRight: 8 }}
          >
            Liaison matériel
          </Button>
          <Button onClick={() => router.visit(`/routines/${routine.id}`)}>Annuler</Button>
        </Form.Item>
      </Form>
    </Layout>
  )
}
```

### ⚠️ Points d'Attention

**1. Route resource actuelle vs cible**
```typescript
// Actuel (Story 4.1) :
router.resource('routines', RoutinesController).only(['create', 'store'])
// Après Story 4.2 :
router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])
```
AdonisJS resource `edit` → `GET /routines/:id/edit` → controller `edit()`
AdonisJS resource `update` → `PUT /routines/:id` → controller `update()`

**2. `content: null` vs `content: ''`**
- Model permet `content: string | null`
- Controller create (Story 4.1) initialise avec `content: null`
- Edit.tsx initialise l'`initialValues` avec `routine.content ?? ''` (null devient chaîne vide pour le Form)
- Validator `update_routine_validator` utilise `.optional().nullable()` pour `content`
- Controller update stocke `data.content ?? null`

**3. Redirection après update**
- L'AC dit "je reste sur la page édition (ou redirection vers /routines/:id au choix UX)"
- Choisir la redirection vers `/routines/:id` (cohérent avec Materials/Edit → Materials/Show)
- `/routines/:id` (page Show) n'existe pas encore (Story 4.5), AdonisJS retournera 404
- **Ne pas changer la redirection** — elle sera fonctionnelle en Story 4.5

**4. Bouton "Liaison matériel"**
- Pointe vers `/routines/:id` pour l'instant (page détail future)
- Story 4.3 ajoutera la section liaison matériel dans la page Show/Edit
- Le bouton est un placeholder navigant vers le détail de la routine

**5. Breadcrumb avec Layout actuel**
- URL `/routines/:id/edit` → segments `['routines', id, 'edit']`
- Layout utilise `title` prop seulement pour le **dernier** segment
- Avec `<Layout title={routine.name}>` : breadcrumb = Accueil > Routines > [id] > [Nom de la routine]
- Acceptable pour MVP, cohérent avec le pattern Materials/Edit qui montre l'ID numérique

**6. `sync` vs `attach` pour les catégories**
- Story 4.1 utilise `attach` (première liaison, pas de catégories existantes)
- Story 4.2 utilise `sync` pour remplacer les catégories existantes (comme dans MaterialsController.update)

### 📝 Learnings de la Story 4.1

- **`router.put`** : utiliser `router.put` pour les updates (pas `router.post`)
- **`initialValues`** : toujours passer les valeurs initiales dans `Form` pour pré-remplir
- **Test `router.put`** : mock `router: { put: vi.fn(), visit: vi.fn() }`
- **`content: null`** : convertir en `''` pour `initialValues` du Form Ant Design
- **Tests Select** : utiliser placeholder ou `findByTitle`, éviter `getByText` qui conflicte
- **Mock Layout** : toujours mocker `~/components/Layout`

### 📊 Structure des fichiers

```
Fichiers à créer :
app/validators/routines/
  update_routine_validator.ts     ← CRÉER

inertia/pages/Routines/
  Edit.tsx                        ← CRÉER
  Edit.test.tsx                   ← CRÉER

Fichiers à modifier :
app/controllers/routines_controller.ts  ← MODIFIER (ajouter edit + update)
start/routes.ts                         ← MODIFIER (ajouter 'edit', 'update' au .only())
```

### Project Structure Notes

- Dossier `app/validators/routines/` existe déjà (créé en Story 4.1)
- Dossier `inertia/pages/Routines/` existe déjà (créé en Story 4.1)
- `RichTextEditor.tsx` mentionné dans l'architecture **n'existe pas encore** — cette story utilise `Input.TextArea` (texte brut pour MVP)
- Pas de modification du Layout nécessaire (breadcrumb acceptable avec l'implémentation actuelle)

### References

- Pattern edit controller (Materials) : [Source: app/controllers/materials_controller.ts#72-98]
- Pattern update controller (Materials) : [Source: app/controllers/materials_controller.ts#100-155]
- Update validator (pattern) : [Source: app/validators/materials/update_material_validator.ts]
- Edit page (pattern) : [Source: inertia/pages/Materials/Edit.tsx]
- Edit test (pattern) : [Source: inertia/pages/Materials/Edit.test.tsx]
- Model Routine (référence) : [Source: app/models/routine.ts]
- Controller routines actuel : [Source: app/controllers/routines_controller.ts]
- Routes actuelles : [Source: start/routes.ts#49]
- Epic 4 Story 4.2 : [Source: _bmad-output/planning-artifacts/epics.md#1185-1229]
- Architecture FR31 composants : [Source: _bmad-output/planning-artifacts/architecture.md#1295]
- Story 4.1 (précédente) : [Source: _bmad-output/implementation-artifacts/4-1-creation-de-routine-avec-categories.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Validator `update_routine_validator.ts` créé en suivant le pattern `update_material_validator.ts` avec `content` acceptant `.optional().nullable()` et `maxLength(50000)`
- Controller `routines_controller.ts` étendu avec `edit()` et `update()` : owner check via `user_id`, validation ownership des `categoryIds` (IDOR fix), `sync()` pour les catégories, `content || null` pour éviter stockage de chaîne vide, redirection vers `/routines/:id`
- Routes étendues : `.only(['create', 'store', 'edit', 'update'])` — expose `GET /routines/:id/edit` et `PUT /routines/:id`
- Page `Routines/Edit.tsx` créée avec Ant Design Form, TextArea autoSize, 3 boutons (Enregistrer, Liaison matériel, Annuler)
- 10 tests frontend écrits et passants, assertions `router.put` renforcées (name + content + categoryIds), 188 tests au total — 0 régression
- Code Review fixes : IDOR categoryIds ownership check, content empty string → null, preload inutile supprimé, maxLength content, tests assertions renforcées

### File List

- app/validators/routines/update_routine_validator.ts (créé)
- app/controllers/routines_controller.ts (modifié — ajout edit + update)
- start/routes.ts (modifié — ajout 'edit', 'update' au .only())
- inertia/pages/Routines/Edit.tsx (créé)
- inertia/pages/Routines/Edit.test.tsx (créé)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modifié — statut 4-2 → done)
