# Story 5.2: Éditeur de Notes pour Spectacles

Status: done

## Story

As a **utilisateur**,
I want **écrire et éditer des notes pour mes spectacles**,
so that **je peux documenter mes annotations, consignes et détails** (FR40).

## Acceptance Criteria

**Scenario 1 : Affichage du champ Notes**
- **Given** je suis sur /shows/:id/edit
- **When** la page se charge
- **Then** je vois un champ "Notes" (TextArea Ant Design) dans le formulaire

**Scenario 2 : TextArea extensible**
- **Given** je vois le champ Notes (FR40)
- **When** je clique dedans
- **Then** le TextArea s'agrandit (autoSize={{ minRows: 10, maxRows: 30 }})
- **And** le placeholder suggère : "Notes, annotations, consignes pour ce spectacle..."

**Scenario 3 : Saisie multiline**
- **Given** je tape dans le champ Notes
- **When** j'écris mes notes
- **Then** le texte est sauvegardé lors de la soumission du formulaire
- **And** je peux utiliser des retours à la ligne (multiline)

**Scenario 4 : Sauvegarde des notes**
- **Given** j'édite les notes du spectacle
- **When** je soumets le formulaire
- **Then** le validator UpdateShowValidator valide côté serveur
- **And** le spectacle est mis à jour (champ `notes` persisté en base)
- **And** un message success s'affiche : "Spectacle enregistré avec succès"

**Scenario 5 : Notes pré-remplies à l'édition**
- **Given** le spectacle a déjà des notes sauvegardées
- **When** j'ouvre /shows/:id/edit
- **Then** le champ Notes affiche les notes existantes

**Scenario 6 : Notes optionnelles**
- **Given** je soumets le formulaire sans remplir le champ Notes
- **When** le formulaire est soumis
- **Then** le spectacle est sauvegardé avec notes = null (champ optionnel)

## Tasks / Subtasks

### Backend — Migration (AC: 4, 5, 6)

- [x] Créer migration `database/migrations/1774600000003_add_notes_to_shows_table.ts` (AC: 4)
  - [x] ALTER TABLE `shows` : ajouter colonne `notes` (text, nullable)
  - [x] `down()` : dropColumn('notes')

### Backend — Model (AC: 4, 5)

- [x] Modifier `app/models/show.ts` (AC: 4, 5)
  - [x] Ajouter `@column() declare notes: string | null`

### Backend — Controller (AC: 4, 5)

- [x] Modifier `app/controllers/shows_controller.ts` (AC: 4, 5)
  - [x] `edit()` : inclure `notes: show.notes` dans l'objet passé à inertia.render
  - [x] `update()` : persister `show.notes = data.notes ?? null` (supprimer le commentaire "non persisté Story 5.1")

### Frontend — Shows/Edit.tsx (AC: 1, 2, 3, 5, 6)

- [x] Modifier `inertia/pages/Shows/Edit.tsx` (AC: 1–3, 5, 6)
  - [x] Ajouter `notes?: string | null` dans l'interface `ShowEditData`
  - [x] Ajouter `Input.TextArea` dans le `<Form>` avec :
    - `name="notes"`
    - `label="Notes"`
    - `autoSize={{ minRows: 10, maxRows: 30 }}`
    - `placeholder="Notes, annotations, consignes pour ce spectacle..."`
  - [x] Ajouter `notes` dans les `initialValues` du Form
  - [x] Modifier `handleSubmit` : typer `values: { name: string; notes?: string }` (ou laisser le Form passer tout)

### Tests — Shows/Edit.test.tsx (AC: 1–6)

- [x] Modifier `inertia/pages/Shows/Edit.test.tsx` (AC: 1–6)
  - [x] Ajouter `notes` dans `mockShow` (ex: `notes: null`)
  - [x] Mettre à jour `renderEdit()` si nécessaire
  - [x] Test : affiche le champ "Notes" (label visible)
  - [x] Test : pré-remplit le TextArea si `notes` non null
  - [x] Test : inclut `notes` dans l'appel `router.put` à la soumission
  - [x] Lancer `npx vitest run` — 0 régression (265 tests, 0 fail)

## Dev Notes

### 🎯 Scope Story 5.2

Cette story ajoute **uniquement le champ Notes** sur la page `/shows/:id/edit` existante.
L'infrastructure Shows est déjà complète (migration shows, model, controller, routes, validator).

**Ce qui n'est PAS dans cette story :**
- Affichage des notes en lecture seule → Story 5.4 (détail spectacle)
- Liste des spectacles → Story 5.3
- Suppression → Story 5.7

### 🔥 Migration — ALTER TABLE shows

```typescript
// database/migrations/1774600000003_add_notes_to_shows_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shows'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('notes').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notes')
    })
  }
}
```

### 🔥 Model — Show (ajout colonne notes)

```typescript
// app/models/show.ts — ajouter après declare name: string
@column()
declare notes: string | null
```

### 🔥 Controller — update() (activer persistance notes)

Ligne actuelle (Story 5.1, commentaire intentionnel) :
```typescript
show.name = data.name
// Note: data.notes validé mais non persisté en Story 5.1 (colonne ajoutée en Story 5.2)
```

Remplacer par :
```typescript
show.name = data.name
show.notes = data.notes ?? null
```

### 🔥 Controller — edit() (passer notes au frontend)

Objet inertia.render actuel :
```typescript
show: {
  id: show.id,
  name: show.name,
  routines: show.routines.map(...)
}
```

Ajouter `notes: show.notes` :
```typescript
show: {
  id: show.id,
  name: show.name,
  notes: show.notes,
  routines: show.routines.map(...)
}
```

### 🔥 Frontend — Shows/Edit.tsx (ajout TextArea Notes)

**Interface à mettre à jour :**
```typescript
interface ShowEditData {
  id: number
  name: string
  notes?: string | null  // ← AJOUTER
  routines: LinkedRoutine[]
}
```

**initialValues du Form à mettre à jour :**
```typescript
initialValues={{ name: show.name, notes: show.notes ?? '' }}
```

**Form.Item Notes à ajouter (après le Form.Item "Nom") :**
```tsx
<Form.Item name="notes" label="Notes">
  <Input.TextArea
    autoSize={{ minRows: 10, maxRows: 30 }}
    placeholder="Notes, annotations, consignes pour ce spectacle..."
  />
</Form.Item>
```

**handleSubmit — mettre à jour le type :**
```typescript
const handleSubmit = (values: { name: string; notes?: string }) => {
  setSubmitting(true)
  router.put(`/shows/${show.id}`, values, {
    onFinish: () => setSubmitting(false),
  })
}
```

### ⚠️ Points d'Attention

**1. Validator déjà prêt**
`app/validators/shows/update_show_validator.ts` a déjà `notes: vine.string().trim().nullable().optional()` depuis Story 5.1 — aucun changement nécessaire.

**2. Colonne `text` vs `string`**
Utiliser `table.text('notes').nullable()` (pas `string`) pour supporter de longues notes multiline.

**3. Initialisation Form avec notes null**
`initialValues={{ notes: show.notes ?? '' }}` — convertir `null` en chaîne vide pour le Form Ant Design. Lors de la soumission, une chaîne vide pourra être envoyée et le validator la convertira correctement (`.nullable().optional()`).

**4. Import `Input` déjà présent dans Edit.tsx**
`Input` est déjà importé depuis `antd` — utiliser `Input.TextArea` directement, pas besoin d'import supplémentaire.

**5. Tests — mock existant**
Le mock `@inertiajs/react` dans `Edit.test.tsx` mocke déjà `router.put` — les nouveaux tests pour Notes s'intègrent directement dans le même describe block. Mettre à jour `mockShow` avec `notes: null` pour éviter les warnings TypeScript.

**6. Tests — vérifier `notes` dans `router.put`**
Le test principal à ajouter :
```typescript
it('inclut les notes dans router.put à la soumission', async () => {
  const user = userEvent.setup()
  render(<ShowsEdit show={{ ...mockShow, notes: 'Mes notes de spectacle' }} allRoutines={mockAllRoutines} />)
  await user.click(screen.getByRole('button', { name: /enregistrer/i }))
  await waitFor(() => {
    expect(router.put).toHaveBeenCalledWith(
      '/shows/1',
      expect.objectContaining({ notes: 'Mes notes de spectacle' }),
      expect.objectContaining({ onFinish: expect.any(Function) })
    )
  })
})
```

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
database/migrations/1774600000003_add_notes_to_shows_table.ts  ← CRÉER (migration ALTER TABLE)
app/models/show.ts                          ← Ajouter colonne notes
app/controllers/shows_controller.ts        ← edit() + update() pour notes
inertia/pages/Shows/Edit.tsx               ← Ajouter TextArea Notes
inertia/pages/Shows/Edit.test.tsx          ← Tests du champ Notes

Fichiers NON modifiés :
app/validators/shows/update_show_validator.ts  ← Déjà prêt depuis Story 5.1
start/routes.ts                                ← Aucun changement
app/validators/shows/create_show_validator.ts  ← Pas de notes à la création
inertia/pages/Shows/Create.tsx                 ← Pas de notes à la création
```

### 📝 Learnings des Stories Précédentes

**Story 5.1 (infrastructure shows — pattern maître) :**
- `update_show_validator.ts` inclut déjà `notes: vine.string().trim().nullable().optional()`
- `update()` dans ShowsController valide `data.notes` mais ne le persiste pas (commentaire Story 5.2)
- Pattern Form Ant Design avec `initialValues` et `form.useForm()` établi dans Edit.tsx
- Flash messages gérés par `Layout.tsx` — pas de `message.success()` antd dans les pages
- Tests : `vi.clearAllMocks()` dans `beforeEach`, mock `@inertiajs/react` complet

**Story 4.6 (modification routine — pattern de référence pour TextArea) :**
- Pattern Form.Item avec Input.TextArea similaire si utilisé dans les routines
- Toujours vérifier `initialValues` pour pré-remplir correctement

**Convention tests actuels :**
- 261 tests, 0 régression attendue après Story 5.1
- `npx vitest run` pour vérifier

### Project Structure Notes

- Migration numérotée `1774600000003` (séquence après les deux migrations shows existantes)
- Model `show.ts` : pattern AdonisJS Lucid, `@column() declare notes: string | null`
- Controller : fichier `app/controllers/shows_controller.ts` (pattern immuable)
- Frontend : `inertia/pages/Shows/Edit.tsx` (modification, pas création)

### References

- Validator notes déjà prêt : [Source: app/validators/shows/update_show_validator.ts]
- Controller update() commentaire Story 5.2 : [Source: app/controllers/shows_controller.ts#66-68]
- Pattern Form Ant Design Edit : [Source: inertia/pages/Shows/Edit.tsx]
- Tests Edit existants : [Source: inertia/pages/Shows/Edit.test.tsx]
- Epic 5 Story 5.2 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- Story 5.1 (learnings) : [Source: _bmad-output/implementation-artifacts/5-1-creation-de-spectacle-et-liaison-routines.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage rencontré. Implémentation directe selon les specs.

### Completion Notes List

- Migration ALTER TABLE créée : colonne `notes` (text, nullable) sur la table `shows`
- Model `Show` mis à jour avec `@column() declare notes: string | null`
- Controller `edit()` : `notes: show.notes` ajouté à l'objet inertia.render
- Controller `update()` : `show.notes = data.notes ?? null` — persistance activée (commentaire Story 5.1 supprimé)
- Frontend `Edit.tsx` : TextArea Notes ajouté avec autoSize, placeholder, initialValues et type handleSubmit mis à jour
- Tests : 6 nouveaux tests ajoutés (affichage label, placeholder, pré-remplissage, valeur vide, soumission vide, soumission avec notes) — 267 tests, 0 régression
- Code review : correction `data.notes?.trim() || null` pour AC6 (chaîne vide → null), ajout tests placeholder et soumission vide

### File List

- database/migrations/1774600000003_add_notes_to_shows_table.ts (créé)
- app/models/show.ts (modifié)
- app/controllers/shows_controller.ts (modifié)
- inertia/pages/Shows/Edit.tsx (modifié)
- inertia/pages/Shows/Edit.test.tsx (modifié)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modifié)

## Change Log

- 2026-03-22 : Implémentation Story 5.2 — ajout champ Notes sur /shows/:id/edit. Migration, model, controller, frontend et tests.
