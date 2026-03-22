# Story 4.3: Liaison Matériel à une Routine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **lier et délier du matériel à mes routines**,
so that **je sais quel matériel est nécessaire pour chaque routine** (FR32, FR33).

## Acceptance Criteria

**Scenario 1 : Section "Matériel utilisé" visible sur /routines/:id/edit**
- **Given** je suis sur /routines/:id/edit
- **When** la page se charge
- **Then** je vois une section "Matériel utilisé" sous le formulaire d'édition
- **And** la liste du matériel actuellement lié est affichée (List Ant Design)

**Scenario 2 : Ouvrir le modal d'ajout de matériel**
- **Given** je vois la section "Matériel utilisé"
- **When** je clique sur "Ajouter du matériel" (FR32)
- **Then** un Modal Ant Design s'ouvre
- **And** le modal affiche un Select (mode="multiple") avec tout mon inventaire
- **And** je peux rechercher par nom dans le Select (filterOption sur label)

**Scenario 3 : Lier un ou plusieurs matériels**
- **Given** le modal d'ajout est ouvert
- **When** je sélectionne un ou plusieurs matériels dans le Select
- **And** je clique sur "Ajouter"
- **Then** `router.post('/routines/:id/materials', { materialIds })` est envoyé
- **And** le controller attache les matériels dans la table `material_routine`
- **And** le modal se ferme
- **And** la page est rechargée (redirect vers /routines/:id/edit)
- **And** un message success s'affiche : "Matériel ajouté à la routine"

**Scenario 4 : Affichage de chaque matériel lié**
- **Given** du matériel est lié à la routine
- **When** j'affiche la liste
- **Then** chaque item affiche : Nom (cliquable → /materials/:id), Type (Tag ou "—"), Lieu (ou "—")
- **And** chaque item a un bouton "Retirer" (Button danger size="small")

**Scenario 5 : Retirer un matériel (FR33)**
- **Given** je vois un matériel dans la liste liée
- **When** je clique sur "Retirer"
- **Then** un Popconfirm s'affiche : "Retirer ce matériel de la routine ?"
- **And** si je confirme, `router.delete('/routines/:id/materials/:materialId')` est envoyé
- **And** la liaison est supprimée dans `material_routine`
- **And** la page est rechargée (redirect vers /routines/:id/edit)
- **And** un message success s'affiche : "Matériel retiré de la routine"

**Scenario 6 : État vide — aucun matériel lié**
- **Given** la routine n'a aucun matériel lié
- **When** j'affiche la section "Matériel utilisé"
- **Then** le texte "Aucun matériel lié à cette routine" s'affiche (Empty Ant Design ou Text)
- **And** le bouton "Ajouter du matériel" est toujours visible

**Scenario 7 : Navigation vers le détail du matériel**
- **Given** du matériel est lié
- **When** je clique sur le nom d'un matériel
- **Then** je suis redirigé vers /materials/:id (Story 3.4 déjà implémentée)

**Scenario 8 : Validation ownership — matériel non possédé**
- **Given** un materialId envoyé n'appartient pas à l'utilisateur (IDOR)
- **When** le controller reçoit la requête
- **Then** le controller vérifie la propriété via `where('user_id', auth.user!.id)`
- **And** retourne une erreur flash "Matériel invalide" et redirect back

## Tasks / Subtasks

### Backend — Migration `material_routine` (AC: 3, 5)

- [x] Créer `database/migrations/TIMESTAMP_create_material_routine_table.ts`
  - [x] Copier le pattern `1774000000002_create_material_category_table.ts`
  - [x] `table.integer('material_id').unsigned().notNullable().references('id').inTable('materials').onDelete('CASCADE')`
  - [x] `table.integer('routine_id').unsigned().notNullable().references('id').inTable('routines').onDelete('CASCADE')`
  - [x] `table.unique(['material_id', 'routine_id'])`
  - [x] `table.index(['material_id'])` + `table.index(['routine_id'])`
  - [x] `table.timestamp('created_at').notNullable()`
  - [x] Lancer `node ace migration:run` pour vérifier

### Backend — Models (AC: 3, 5)

- [x] Modifier `app/models/routine.ts` — ajouter relation `materials`
  - [x] Importer `Material`
  - [x] `@manyToMany(() => Material, { pivotTable: 'material_routine', localKey: 'id', pivotForeignKey: 'routine_id', relatedKey: 'id', pivotRelatedForeignKey: 'material_id' }) declare materials: ManyToMany<typeof Material>`
- [x] Modifier `app/models/material.ts` — ajouter relation `routines`
  - [x] Importer `Routine`
  - [x] `@manyToMany(() => Routine, { pivotTable: 'material_routine', localKey: 'id', pivotForeignKey: 'material_id', relatedKey: 'id', pivotRelatedForeignKey: 'routine_id' }) declare routines: ManyToMany<typeof Routine>`

### Backend — Validator (AC: 3, 8)

- [x] Créer `app/validators/routines/attach_material_validator.ts`
  - [x] `materialIds: vine.array(vine.number()).minLength(1)` — au moins 1 matériel requis

### Backend — Controller (AC: 1, 3, 5, 8)

- [x] Modifier `app/controllers/routines_controller.ts`
  - [x] Mettre à jour `edit()` : preload `materials` (avec type, storageLocation), charger `allMaterials` (inventaire user)
    - [x] `routine.preload('materials', (q) => q.preload('type').preload('storageLocation'))`
    - [x] `const allMaterials = await Material.query().where('user_id', auth.user!.id).orderBy('name', 'asc')`
    - [x] Passer dans inertia : `{ routine: { ..., materials: [...] }, allMaterials: [...] }` (`linkedMaterialIds` non nécessaire — les IDs sont dérivables de `materials.map(m => m.id)` côté frontend)
  - [x] Ajouter méthode `attachMaterial()` (AC: 3, 8)
    - [x] Charger routine avec `where('user_id')` + `.firstOrFail()`
    - [x] Valider avec `attachMaterialValidator` → `data.materialIds`
    - [x] Vérifier ownership : `Material.query().whereIn('id', data.materialIds).where('user_id', auth.user!.id)`
    - [x] Si count !== materialIds.length → flash error + redirect back
    - [x] `await routine.related('materials').sync(data.materialIds, false)` — `false` = ne pas détacher les existants (attach uniquement)
    - [x] flash success "Matériel ajouté à la routine"
    - [x] redirect vers `/routines/${routine.id}/edit`
  - [x] Ajouter méthode `detachMaterial()` (AC: 5)
    - [x] Charger routine avec `where('user_id')` + `.firstOrFail()`
    - [x] Vérifier que le matériel appartient à l'utilisateur : `Material.query().where('id', params.materialId).where('user_id', auth.user!.id).firstOrFail()`
    - [x] `await routine.related('materials').detach([params.materialId])`
    - [x] flash success "Matériel retiré de la routine"
    - [x] redirect vers `/routines/${routine.id}/edit`

### Backend — Routes (AC: 3, 5)

- [x] Modifier `start/routes.ts` — ajouter routes custom pour attach/detach
  - [x] `router.post('/routines/:id/materials', [RoutinesController, 'attachMaterial'])`
  - [x] `router.delete('/routines/:id/materials/:materialId', [RoutinesController, 'detachMaterial'])`
  - [x] Ces routes doivent être dans le groupe `.use(middleware.auth())`

### Frontend — Page Edit.tsx (AC: 1, 2, 3, 4, 5, 6, 7)

- [x] Modifier `inertia/pages/Routines/Edit.tsx`
  - [x] Nouveaux imports : `Link` de `@inertiajs/react`, `List, Modal, Popconfirm, Typography` de `antd`
  - [x] Nouvelles Props : `materials: MaterialItem[]`, `allMaterials: MaterialOption[]`
  - [x] Interface `MaterialItem` : `{ id: number, name: string, type: { id: number, name: string } | null, storageLocation: { id: number, name: string } | null }`
  - [x] Interface `MaterialOption` : `{ id: number, name: string }`
  - [x] State : `modalOpen: boolean`, `selectedMaterialIds: number[]`, `submittingMaterial: boolean`
  - [x] Section "Matériel utilisé" sous le `</Form>` :
    - [x] `<Typography.Title level={3}>Matériel utilisé</Typography.Title>`
    - [x] Bouton "Ajouter du matériel" → `setModalOpen(true)`
    - [x] `<List>` : si `materials.length === 0` → `<Empty description="Aucun matériel lié à cette routine" />`
    - [x] Chaque `<List.Item>` : nom cliquable (`<Link href={/materials/${m.id}}>`), type Tag, lieu, bouton "Retirer" (Popconfirm)
  - [x] Retirer : `router.delete('/routines/${routine.id}/materials/${m.id}')` avec confirm
  - [x] Modal d'ajout :
    - [x] `<Modal title="Ajouter du matériel" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleAttach} confirmLoading={submittingMaterial}>`
    - [x] `<Select mode="multiple" filterOption showSearch options={allMaterials.map(...)} onChange={setSelectedMaterialIds} />`
  - [x] `handleAttach` : `router.post('/routines/${routine.id}/materials', { materialIds: selectedMaterialIds }, { onFinish: () => { setSubmittingMaterial(false); setModalOpen(false) } })`
  - [x] Le bouton "Liaison matériel" existant peut être supprimé (remplacé par la section native)

### Frontend — Tests (AC: 1–8)

- [x] Mettre à jour `inertia/pages/Routines/Edit.test.tsx`
  - [x] Ajouter mocks : `router: { ..., post: vi.fn(), delete: vi.fn() }`
  - [x] Props de test : `materials: []`, `allMaterials: [{ id: 1, name: 'Jeu de cartes' }]`
  - [x] Test : section "Matériel utilisé" visible (AC: 1)
  - [x] Test : "Aucun matériel lié à cette routine" affiché si `materials: []` (AC: 6)
  - [x] Test : bouton "Ajouter du matériel" visible (AC: 2)
  - [x] Test : clic "Ajouter du matériel" ouvre le modal (AC: 2)
  - [x] Test : nom du matériel lié affiché avec lien /materials/:id (AC: 4, 7)
  - [x] Test : clic "Retirer" déclenche Popconfirm (AC: 5)
  - [x] Test : confirmation Popconfirm appelle `router.delete('/routines/1/materials/2')` (AC: 5)
  - [x] Test : `handleAttach` appelle `router.post('/routines/1/materials', { materialIds: [...] })` (AC: 3)
  - [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Contexte — Ce que Story 4.3 ajoute à 4.2

Story 4.3 étend la page `/routines/:id/edit` (créée en Story 4.2) avec une section "Matériel utilisé". Elle crée les infrastructures de liaison (table pivot, relations, routes) qui seront réutilisées en Story 4.5 (page Show).

**Important** : La page `/routines/:id` (Show) n'existe pas encore (Story 4.5). Le redirect post-update dans `routines_controller.update()` pointe déjà vers `/routines/:id` — ne pas modifier ce comportement, il sera fonctionnel en Story 4.5.

### 🏗️ Migration — `material_routine`

```typescript
// database/migrations/TIMESTAMP_create_material_routine_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'material_routine'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('material_id').unsigned().notNullable()
        .references('id').inTable('materials').onDelete('CASCADE')
      table.integer('routine_id').unsigned().notNullable()
        .references('id').inTable('routines').onDelete('CASCADE')

      table.unique(['material_id', 'routine_id'])
      table.index(['material_id'])
      table.index(['routine_id'])

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

Pattern identique à `1774000000002_create_material_category_table.ts` — [Source: database/migrations/1774000000002_create_material_category_table.ts]

### 🏗️ Model Routine — Ajout de la relation materials

```typescript
// app/models/routine.ts — ajouter (importer Material)
import Material from '#models/material'

// Dans la classe Routine :
@manyToMany(() => Material, {
  pivotTable: 'material_routine',
  localKey: 'id',
  pivotForeignKey: 'routine_id',
  relatedKey: 'id',
  pivotRelatedForeignKey: 'material_id',
})
declare materials: ManyToMany<typeof Material>
```

### 🏗️ Model Material — Ajout de la relation routines

```typescript
// app/models/material.ts — ajouter (importer Routine)
import Routine from '#models/routine'

// Dans la classe Material :
@manyToMany(() => Routine, {
  pivotTable: 'material_routine',
  localKey: 'id',
  pivotForeignKey: 'material_id',
  relatedKey: 'id',
  pivotRelatedForeignKey: 'routine_id',
})
declare routines: ManyToMany<typeof Routine>
```

⚠️ **Attention aux imports circulaires** : AdonisJS gère bien les relations circulaires via lazy loading (`() => Material`). Pattern déjà utilisé dans le projet (Material → Category, Routine → Category).

### 🏗️ Validator — attachMaterialValidator

```typescript
// app/validators/routines/attach_material_validator.ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const frenchMessages = new SimpleMessagesProvider({
  'required': 'Ce champ est requis',
  'minLength': 'Sélectionnez au moins un matériel',
})

export const attachMaterialValidator = vine.compile(
  vine.object({
    materialIds: vine.array(vine.number()).minLength(1),
  })
)
attachMaterialValidator.messagesProvider = frenchMessages
```

### 🏗️ Controller — Méthode `edit()` mise à jour

```typescript
async edit({ params, auth, inertia }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .preload('categories')
    .preload('materials', (q) => {
      q.preload('type').preload('storageLocation')
    })
    .firstOrFail()

  const [categories, allMaterials] = await Promise.all([
    Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    Material.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
  ])

  return inertia.render('Routines/Edit', {
    routine: {
      id: routine.id,
      name: routine.name,
      content: routine.content,
      categoryIds: routine.categories.map((c) => c.id),
      materials: routine.materials.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type ? { id: m.type.id, name: m.type.name } : null,
        storageLocation: m.storageLocation
          ? { id: m.storageLocation.id, name: m.storageLocation.name }
          : null,
      })),
    },
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    allMaterials: allMaterials.map((m) => ({ id: m.id, name: m.name })),
  })
}
```

### 🏗️ Controller — `attachMaterial` et `detachMaterial`

```typescript
import { attachMaterialValidator } from '#validators/routines/attach_material_validator'
import Material from '#models/material'

async attachMaterial({ params, request, auth, session, response }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  const data = await request.validateUsing(attachMaterialValidator)

  // Vérification ownership IDOR
  const ownedMaterials = await Material.query()
    .whereIn('id', data.materialIds)
    .where('user_id', auth.user!.id)
  if (ownedMaterials.length !== data.materialIds.length) {
    session.flash('error', 'Matériel invalide')
    return response.redirect().back()
  }

  try {
    // sync avec false = attach sans détacher les existants
    await routine.related('materials').sync(data.materialIds, false)
    session.flash('success', 'Matériel ajouté à la routine')
    return response.redirect().toPath(`/routines/${routine.id}/edit`)
  } catch (error) {
    logger.error('Failed to attach material to routine', { error })
    session.flash('error', "Une erreur est survenue lors de l'ajout du matériel")
    return response.redirect().back()
  }
}

async detachMaterial({ params, auth, session, response }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  // Vérifier que le matériel appartient à l'utilisateur
  await Material.query()
    .where('id', params.materialId)
    .where('user_id', auth.user!.id)
    .firstOrFail()

  try {
    await routine.related('materials').detach([params.materialId])
    session.flash('success', 'Matériel retiré de la routine')
    return response.redirect().toPath(`/routines/${routine.id}/edit`)
  } catch (error) {
    logger.error('Failed to detach material from routine', { error })
    session.flash('error', 'Une erreur est survenue lors du retrait du matériel')
    return response.redirect().back()
  }
}
```

### 🏗️ Routes — Nouvelles routes custom

```typescript
// start/routes.ts — dans le groupe middleware.auth() :
// Avant :
router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])

// Après (routes custom ajoutées séparément — resource inchangé) :
router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])
router.post('/routines/:id/materials', [RoutinesController, 'attachMaterial'])
router.delete('/routines/:id/materials/:materialId', [RoutinesController, 'detachMaterial'])
```

⚠️ **Ordre des routes** : Les routes custom doivent être après le `resource()` pour éviter les conflits de paramètres.

### 🏗️ Frontend — Edit.tsx modifiée (section matériel)

```tsx
// Nouveaux imports à ajouter :
import { router, Link } from '@inertiajs/react'
import { Button, Empty, Form, Input, List, Modal, Popconfirm, Select, Tag, Typography } from 'antd'

// Nouvelles interfaces :
interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  storageLocation: { id: number; name: string } | null
}

interface MaterialOption {
  id: number
  name: string
}

// Props étendues :
interface Props {
  routine: RoutineEditData & { materials: MaterialItem[] }
  categories: CategoryItem[]
  allMaterials: MaterialOption[]
}

// Nouveaux états dans le composant :
const [modalOpen, setModalOpen] = useState(false)
const [selectedMaterialIds, setSelectedMaterialIds] = useState<number[]>([])
const [submittingMaterial, setSubmittingMaterial] = useState(false)

// Handler attach :
const handleAttach = () => {
  if (selectedMaterialIds.length === 0) return
  setSubmittingMaterial(true)
  router.post(
    `/routines/${routine.id}/materials`,
    { materialIds: selectedMaterialIds },
    {
      onSuccess: () => {
        setModalOpen(false)
        setSelectedMaterialIds([])
      },
      onFinish: () => setSubmittingMaterial(false),
    }
  )
}

// Section à ajouter APRÈS </Form> et AVANT </Layout> :
<>
  <Typography.Title level={3} style={{ marginTop: 32 }}>
    Matériel utilisé
  </Typography.Title>

  <Button onClick={() => setModalOpen(true)} style={{ marginBottom: 16 }}>
    Ajouter du matériel
  </Button>

  {routine.materials.length === 0 ? (
    <Empty description="Aucun matériel lié à cette routine" />
  ) : (
    <List
      bordered
      dataSource={routine.materials}
      renderItem={(m) => (
        <List.Item
          actions={[
            <Popconfirm
              key="retirer"
              title="Retirer ce matériel de la routine ?"
              onConfirm={() => router.delete(`/routines/${routine.id}/materials/${m.id}`)}
              okText="Retirer"
              cancelText="Annuler"
            >
              <Button danger size="small">Retirer</Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            title={<Link href={`/materials/${m.id}`}>{m.name}</Link>}
            description={
              <>
                {m.type ? <Tag color="blue">{m.type.name}</Tag> : '—'}
                {m.storageLocation ? ` · ${m.storageLocation.name}` : ''}
              </>
            }
          />
        </List.Item>
      )}
    />
  )}

  <Modal
    title="Ajouter du matériel"
    open={modalOpen}
    onCancel={() => { setModalOpen(false); setSelectedMaterialIds([]) }}
    onOk={handleAttach}
    confirmLoading={submittingMaterial}
    okText="Ajouter"
    cancelText="Annuler"
  >
    <Select
      mode="multiple"
      style={{ width: '100%' }}
      placeholder="Rechercher du matériel..."
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
      options={allMaterials.map((m) => ({ label: m.name, value: m.id }))}
      onChange={(values) => setSelectedMaterialIds(values)}
      value={selectedMaterialIds}
    />
  </Modal>
</>
```

**Note** : Supprimer le bouton "Liaison matériel" placeholder qui était dans Story 4.2 (il pointe vers `/routines/:id` non existant). La section ci-dessus le remplace de façon fonctionnelle.

### ⚠️ Points d'Attention

**1. `sync(ids, false)` vs `sync(ids)` pour attach**
- `routine.related('materials').sync(ids, false)` → attach sans détacher les existants (ajout)
- `routine.related('materials').sync(ids)` → remplace tous les liés (dangereux ici)
- Pour `attachMaterial` : toujours `sync(ids, false)`
- Pour les catégories (update routine) : `sync(ids)` (remplace, comportement voulu)

**2. Table `material_routine` n'existe pas encore**
- La migration doit être créée et exécutée avant tout test
- Le `material.ts` controller a un TODO commenté qui référence cette table : `// TODO Epic 4: Vérifier material_routine` → ce TODO reste commenté pour cette story (sera activé en Epic 4/5 quand la Story 4.5 ou une story de suppression le nécessite)

**3. Import circulaire Material ↔ Routine**
- `Routine` importe `Material`, `Material` importe `Routine`
- AdonisJS résout cela via `() => Material` (lazy evaluation) — pattern standard du projet
- Si TypeScript se plaint : utiliser `type` import pour les types uniquement

**4. Tests — Mocking des nouvelles routes**
- `router.post` et `router.delete` doivent être mockés dans les tests existants
- Les tests Edit.test.tsx existants ne testent pas `router.post`/`router.delete` → les ajouter au mock

**5. Le bouton "Liaison matériel" de Story 4.2**
- Actuellement dans Edit.tsx il navigue vers `/routines/:id` (non existant)
- Story 4.3 doit supprimer ce bouton et le remplacer par la section "Matériel utilisé" en bas de page
- Mettre à jour le test correspondant : supprimer `Test : appelle router.visit('/routines/1') au clic "Liaison matériel"`

**6. Flash messages dans Inertia**
- Les flash messages (success/error) sont affichés par le Layout existant via `usePage().props.flash`
- Pattern déjà utilisé dans Materials et Routines controllers — pas de code supplémentaire côté frontend

### 📊 Structure des fichiers

```
Fichiers à CRÉER :
database/migrations/
  TIMESTAMP_create_material_routine_table.ts  ← CRÉER (migration pivot)

app/validators/routines/
  attach_material_validator.ts                ← CRÉER

Fichiers à MODIFIER :
app/models/routine.ts                         ← MODIFIER (ajouter relation materials)
app/models/material.ts                        ← MODIFIER (ajouter relation routines)
app/controllers/routines_controller.ts        ← MODIFIER (edit + attachMaterial + detachMaterial)
start/routes.ts                               ← MODIFIER (ajouter routes attach/detach)
inertia/pages/Routines/Edit.tsx               ← MODIFIER (section matériel + modal)
inertia/pages/Routines/Edit.test.tsx          ← MODIFIER (nouveaux tests + mise à jour existants)
```

### 📝 Learnings de la Story 4.2

- **`router.put`** : utiliser pour les updates (pas `router.post`)
- **`initialValues`** : toujours passer les valeurs initiales dans `Form` pour pré-remplir
- **Tests Select** : utiliser `filterOption` avec label pour la recherche, éviter `getByText` qui conflicte
- **Mock Layout** : toujours mocker `~/components/Layout`
- **`content: null` vs `''`** : convertir en `''` pour `initialValues` du Form Ant Design
- **Owner check IDOR** : toujours vérifier `where('user_id', auth.user!.id)` pour toutes les entités

### References

- Pattern migration pivot table : [Source: database/migrations/1774000000002_create_material_category_table.ts]
- Pattern manyToMany Lucid : [Source: app/models/material.ts#43-50] (Material → Category)
- Pattern manyToMany Lucid : [Source: app/models/routine.ts#29-36] (Routine → Category)
- TODO commenté material_routine : [Source: app/controllers/materials_controller.ts#223-228]
- Pattern edit controller : [Source: app/controllers/routines_controller.ts#42-62] (routine edit actuel)
- Pattern attach/detach Lucid : [Source: app/controllers/routines_controller.ts#87] (`sync`)
- Page Edit actuelle (à modifier) : [Source: inertia/pages/Routines/Edit.tsx]
- Page Show material (pattern List) : [Source: inertia/pages/Materials/Show.tsx]
- Architecture material_routine : [Source: _bmad-output/planning-artifacts/architecture.md#1413]
- Epic 4 Story 4.3 : [Source: _bmad-output/planning-artifacts/epics.md#1230-1278]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun problème bloquant. Ajustement mineur : le sélecteur `.ant-modal-title *` n'est pas accessible en JSDOM — remplacé par la vérification du bouton okText "Ajouter" du Modal. Le placeholder du Select Ant Design n'est pas un attribut HTML standard — idem.

### Completion Notes List

- Migration `1774500000001_create_material_routine_table.ts` créée et exécutée avec succès.
- Relations `manyToMany` ajoutées sur `Routine` (→ Material) et `Material` (→ Routine) via la table pivot `material_routine`.
- Validator `attachMaterialValidator` créé avec validation `vine.array(vine.number()).minLength(1)`.
- Controller `routines_controller.ts` étendu : `edit()` preload materials, `attachMaterial()` avec IDOR ownership check, `detachMaterial()` avec vérification ownership.
- Routes ajoutées dans le groupe `middleware.auth()` après le `resource()`.
- `Edit.tsx` : section "Matériel utilisé" avec liste, modal d'ajout, Popconfirm de retrait — bouton "Liaison matériel" supprimé.
- 17 tests Edit.tsx passent, 195/195 tests total (0 régression).

### File List

database/migrations/1774500000001_create_material_routine_table.ts
app/validators/routines/attach_material_validator.ts
app/models/routine.ts
app/models/material.ts
app/controllers/routines_controller.ts
start/routes.ts
inertia/pages/Routines/Edit.tsx
inertia/pages/Routines/Edit.test.tsx

## Change Log

| Date | Description |
|------|-------------|
| 2026-03-22 | Implémentation Story 4.3 : migration table pivot `material_routine`, relations manyToMany Material↔Routine, validator attachMaterial, routes attach/detach, section "Matériel utilisé" dans Edit.tsx avec modal et Popconfirm. |
| 2026-03-22 | Code review fixes : déduplication materialIds (M1), Number(params.materialId) dans detach (M2), test router.post ajouté (H2), assert Popconfirm confirmButton.toBeDefined() (H3), filterOption type-safe (L1), task linkedMaterialIds clarifiée (H1). 196/196 tests. |
