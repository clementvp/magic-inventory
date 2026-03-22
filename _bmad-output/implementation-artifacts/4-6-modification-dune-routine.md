# Story 4.6: Modification d'une Routine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **modifier une routine existante**,
so that **je peux corriger ou améliorer ma routine** (FR29).

## Acceptance Criteria

**Scenario 1 : Navigation vers la page modification**
- **Given** je suis sur /routines/:id
- **When** je clique sur "Modifier"
- **Then** je suis redirigé vers /routines/:id/edit
- **And** le breadcrumb affiche : Accueil > Routines > [Nom] > Modifier
- **Note** : Le breadcrumb est géré par `Layout.tsx` via `generateBreadcrumbs()`. Pour `/routines/1/edit`, le segment ID `1` s'affiche tel quel (limitation Layout connue — acceptée depuis Story 4.2). Le dernier segment `edit` affiche le `title` passé à `<Layout>`.

**Scenario 2 : Formulaire pré-rempli au chargement**
- **Given** je suis sur /routines/:id/edit
- **When** la page se charge
- **Then** le formulaire est pré-rempli avec :
  - Nom actuel
  - Catégorie(s) actuelles (sélectionnées dans le Select multiple)
  - Contenu actuel (dans le TextArea)
  - Liste du matériel lié (avec bouton "Retirer" et modal "Ajouter du matériel" — Story 4.3)

**Scenario 3 : Validation client en temps réel**
- **Given** le formulaire est pré-rempli
- **When** je vide le champ Nom
- **Then** le message d'erreur "Le nom est requis" s'affiche immédiatement (Ant Design Form validation)
- **And** le bouton "Enregistrer" ne soumet pas le formulaire tant que le Nom est vide

**Scenario 4 : Soumission avec données valides**
- **Given** je modifie la routine
- **When** je soumets le formulaire avec des données valides
- **Then** `updateRoutineValidator` valide côté serveur (Nom requis, Catégories optionnelles, Contenu optionnel ≤ 50 000 chars)
- **And** la routine est mise à jour dans la table `routines`
- **And** les catégories sont synchronisées via `routine.related('categories').sync()`
- **And** un message success s'affiche : **"Routine modifiée avec succès"**
- **And** je suis redirigé vers /routines/:id (page détail)

**Scenario 5 : Annulation sans sauvegarde**
- **Given** je suis sur la page modification
- **When** je clique sur "Annuler"
- **Then** je suis redirigé vers /routines/:id sans sauvegarder

## Tasks / Subtasks

### Backend — Correction du message flash (AC: 4)

- [x] Modifier `app/controllers/routines_controller.ts` — méthode `update()`
  - [x] Changer `session.flash('success', 'Routine enregistrée avec succès')` → `session.flash('success', 'Routine modifiée avec succès')`
  - [x] ⚠️ Ne modifier QUE cette ligne — tout le reste de `update()` est déjà correct

### Frontend — Vérification (AC: 1–5)

- [x] Vérifier `inertia/pages/Routines/Edit.tsx` — **aucune modification attendue**
  - [x] Confirmer que `<Layout title={routine.name}>` est bien présent (breadcrumb automatique)
  - [x] Confirmer que le bouton "Annuler" appelle `router.visit('/routines/${routine.id}')`
  - [x] Confirmer que `router.put('/routines/${routine.id}', values)` est bien le handler de soumission

### Tests — Vérification de la couverture (AC: 1–5)

- [x] Vérifier `inertia/pages/Routines/Edit.test.tsx` — les 16 tests existants couvrent tous les AC
  - [x] AC2 : "pré-remplit le champ Nom", "pré-remplit le champ Contenu", section matériel
  - [x] AC3 : "affiche une erreur si le Nom est vide", "n'appelle pas router.put si le Nom est vide"
  - [x] AC4 : "appelle router.put avec les bonnes données à la soumission"
  - [x] AC5 : "appelle router.visit vers /routines/1 au clic Annuler"
- [x] Lancer `npx vitest run` — 222/222 tests passent (0 régression)

## Dev Notes

### 🎯 Contexte — Ce que Story 4.6 représente

Story 4.6 **valide** la modification de routine de bout en bout. La quasi-totalité de l'implémentation a été faite dans les stories précédentes :
- **Story 4.2** : Éditeur de contenu — a créé `Edit.tsx`, `edit()` et `update()` dans le controller, `updateRoutineValidator`, les routes `edit` + `update`, et 16 tests dans `Edit.test.tsx`
- **Story 4.3** : Liaison matériel — a complété `Edit.tsx` avec la section matériel (add/remove)

**Ce que Story 4.6 AJOUTE uniquement :**
- Correction du message flash : `'Routine enregistrée avec succès'` → `'Routine modifiée avec succès'`

### 🏗️ Backend — Seul changement requis

```typescript
// app/controllers/routines_controller.ts — méthode update()
// AVANT :
session.flash('success', 'Routine enregistrée avec succès')
// APRÈS :
session.flash('success', 'Routine modifiée avec succès')
```

**Le reste de `update()` est déjà conforme aux AC :**
```typescript
async update({ params, request, auth, session, response }: HttpContext) {
  const routine = await Routine.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()                          // ← ownership IDOR check ✓

  const data = await request.validateUsing(updateRoutineValidator)  // ← AC4 validator ✓

  // Ownership check des catégories...
  routine.name = data.name
  routine.content = data.content || null
  await routine.save()
  await routine.related('categories').sync(data.categoryIds ?? [])  // ← sync catégories ✓

  session.flash('success', 'Routine modifiée avec succès')          // ← AC4 message ← CHANGER
  return response.redirect().toPath(`/routines/${routine.id}`)      // ← AC4 redirect ✓
}
```

### 🏗️ Routes — Déjà configurées

```typescript
// start/routes.ts — DÉJÀ en place depuis Story 4.2 :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
// Génère automatiquement :
//   GET  /routines/:id/edit  → edit()
//   PUT  /routines/:id       → update()
```

### 🏗️ Frontend — Edit.tsx déjà complet

Le composant `inertia/pages/Routines/Edit.tsx` est déjà complet. Structure :

```tsx
export default function RoutinesEdit({ routine, categories, allMaterials }: Props) {
  const handleSubmit = (values) => {
    router.put(`/routines/${routine.id}`, values, ...)  // AC4 ✓
  }

  return (
    <Layout title={routine.name}>               {/* breadcrumb auto ✓ */}
      <Form initialValues={{ name, categoryIds, content }}>  {/* AC2 ✓ */}
        <Form.Item name="name" rules={[{ required: true }]}>  {/* AC3 ✓ */}
        <Form.Item name="categoryIds">           {/* AC2 ✓ */}
        <Form.Item name="content">               {/* AC2 ✓ */}
        <Button type="primary">Enregistrer</Button>
        <Button onClick={() => router.visit(`/routines/${routine.id}`)}>
          Annuler                                {/* AC5 ✓ */}
        </Button>
      </Form>
      {/* Section matériel (add/remove) — AC2 ✓ */}
    </Layout>
  )
}
```

### ⚠️ Points d'Attention

**1. Breadcrumb — Limitation Layout acceptée**
- Pour `/routines/1/edit`, le breadcrumb généré par `generateBreadcrumbs()` est : **Accueil > Routines > 1 > [routine.name]**
- L'AC idéal serait : "Accueil > Routines > [Nom] > Modifier"
- Cette limitation est connue depuis Story 4.2 et a été acceptée en code review (même comportement sur Materials/Edit)
- **Ne pas modifier Layout.tsx pour corriger ce point** — hors scope de cette story

**2. Message flash — Seul vrai delta**
- Le message actuel "Routine enregistrée avec succès" a été choisi en Story 4.2 pour l'éditeur de contenu (auto-save sémantique)
- Story 4.6 aligne le message sur l'intent utilisateur : "modification" plutôt qu'"enregistrement"
- Ce changement est **non-breaking** — aucun test actuel ne vérifie le contenu du flash message backend

**3. Tests existants — Couverture complète**
Les 16 tests de `Edit.test.tsx` couvrent tous les AC :
- AC2 : pré-remplissage Nom, Contenu, état vide, section matériel, lien vers /materials/:id
- AC3 : validation client (erreur Nom vide, blocage submit)
- AC4 : `router.put` appelé avec les bonnes données
- AC5 : `router.visit('/routines/1')` au clic Annuler

**4. Ownership IDOR — Déjà en place**
`update()` vérifie `.where('user_id', auth.user!.id)` à deux niveaux :
- Sur la routine elle-même (`.firstOrFail()`)
- Sur les catégories liées (`ownedCategories.length !== data.categoryIds.length`)

### 📊 Structure des fichiers

```
Fichiers à MODIFIER :
app/controllers/routines_controller.ts    ← MODIFIER (1 ligne : message flash update())

Fichiers à VÉRIFIER (aucune modification attendue) :
start/routes.ts                           ← VÉRIFIER (routes edit + update déjà là)
inertia/pages/Routines/Edit.tsx           ← VÉRIFIER (complet depuis 4.2 + 4.3)
inertia/pages/Routines/Edit.test.tsx      ← VÉRIFIER (16 tests couvrent tous les AC)
```

### 📝 Learnings des stories précédentes

- **Story 4.2 learnings** : `router.put()` pour la soumission Inertia (pas `router.post`), `Form.useForm()` + `initialValues` pour le pré-remplissage, `autoSize` sur TextArea pour le contenu long
- **Story 4.3 learnings** : `router.post('/routines/:id/materials')` pour attacher, `router.delete('/routines/:id/materials/:id')` pour détacher, Popconfirm pour confirmer le retrait
- **Ownership IDOR** : toujours `.where('user_id', auth.user!.id)` + `.firstOrFail()`
- **Sync catégories** : `routine.related('categories').sync([])` vide toutes les catégories si tableau vide

### References

- Controller update() : [Source: app/controllers/routines_controller.ts#124-156]
- Edit.tsx complet : [Source: inertia/pages/Routines/Edit.tsx]
- Edit.test.tsx (16 tests) : [Source: inertia/pages/Routines/Edit.test.tsx]
- updateRoutineValidator : [Source: app/validators/routines/update_routine_validator.ts]
- Routes routines : [Source: start/routes.ts#49]
- Layout breadcrumb logic : [Source: inertia/components/Layout.tsx#63-76]
- Epic 4 Story 4.6 : [Source: _bmad-output/planning-artifacts/epics.md#Story 4.6]
- Story 4.5 (précédente) : [Source: _bmad-output/implementation-artifacts/4-5-detail-dune-routine-avec-navigation-bidirectionnelle.md]
- Story 4.2 (Edit.tsx origin) : [Source: _bmad-output/implementation-artifacts/4-2-editeur-de-contenu-pour-routines.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun — implémentation triviale (1 ligne).

### Completion Notes List

- Message flash `update()` corrigé : `'Routine enregistrée avec succès'` → `'Routine modifiée avec succès'` (AC4)
- Tous les autres AC (1, 2, 3, 5) étaient déjà couverts par les stories 4.2 et 4.3 (Edit.tsx, routes, validator, tests)
- 16 tests existants dans `Edit.test.tsx` couvrent tous les scénarios des AC 2–5
- 222/222 tests passent — 0 régression

### Senior Developer Review (AI)

Date: 2026-03-22
Outcome: Changes Requested → Fixed

**Action Items (tous résolus) :**
- [x] [MEDIUM] AC1 breadcrumb : `<Layout title={routine.name}>` → `<Layout title="Modifier">` [Edit.tsx:71]
- [x] [MEDIUM] `<h1>` → `<Typography.Title level={1}>` pour cohérence Ant Design [Edit.tsx:72]
- [x] [LOW] Aucun test vérifiant `title` passé à Layout → ajout test + mise à jour mock [Edit.test.tsx]
- [x] [LOW] `validateUsing` après `firstOrFail` → inversion pour cohérence architecture [routines_controller.ts:124]

### File List

- `app/controllers/routines_controller.ts` (modifié — message flash + ordre validate/firstOrFail)
- `inertia/pages/Routines/Edit.tsx` (modifié — title="Modifier" + Typography.Title)
- `inertia/pages/Routines/Edit.test.tsx` (modifié — mock Layout + test title breadcrumb)

## Change Log

- 2026-03-22 : Implémentation Story 4.6 — correction message flash `update()` ("Routine modifiée avec succès"). 222/222 tests passent.
- 2026-03-22 : Code review fixes — breadcrumb title="Modifier", Typography.Title, test title Layout, ordre validateUsing/firstOrFail. 223/223 tests passent.
