# Story 1.8: Harmonisation du bouton de création (position haut-droite)

Status: done

## Story

As a **utilisateur de l'application**,
I want **que le bouton de création soit toujours positionné en haut à droite du titre de page**,
so that **l'interface soit cohérente et que je sache toujours où trouver l'action principale**.

## Acceptance Criteria

**Scenario 1: Cohérence visuelle sur la page Catégories**
- **Given** je suis sur la page `/categories`
- **When** je regarde l'en-tête de la page
- **Then** le titre "Catégories" est à gauche et le bouton "Ajouter une catégorie" est aligné à droite sur la même ligne

**Scenario 2: Cohérence visuelle sur la page Types**
- **Given** je suis sur la page `/types`
- **When** je regarde l'en-tête de la page
- **Then** le titre "Types" est à gauche et le bouton "Ajouter un type" est aligné à droite sur la même ligne

**Scenario 3: Cohérence visuelle sur la page Lieux de Stockage**
- **Given** je suis sur la page `/storage-locations`
- **When** je regarde l'en-tête de la page
- **Then** le titre "Lieux de Stockage" est à gauche et le bouton "Ajouter un lieu" est aligné à droite sur la même ligne

**Scenario 4: Cohérence avec les autres pages**
- **Given** je navigue entre Routines, Spectacles, Notes, Inventaire, Catégories, Types et Lieux de Stockage
- **When** j'observe l'en-tête de chaque page
- **Then** toutes les pages utilisent le même pattern flex `space-between` avec titre à gauche et bouton à droite

## Tasks / Subtasks

### Catégories (AC: 1, 4)

- [x] Modifier `inertia/pages/Categories/Index.tsx` (AC: 1)
  - [x] Envelopper `<h1>Catégories</h1>` et `<Button>Ajouter une catégorie</Button>` dans un `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>`
  - [x] Ajouter `style={{ margin: 0 }}` sur le `<h1>` (sinon marge par défaut crée un décalage vertical)
  - [x] Supprimer `style={{ marginBottom: 16 }}` du `<Button>` (le marginBottom se déplace sur le wrapper div)

### Types (AC: 2, 4)

- [x] Modifier `inertia/pages/Types/Index.tsx` (AC: 2)
  - [x] Envelopper `<h1>Types</h1>` et `<Button>Ajouter un type</Button>` dans un `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>`
  - [x] Ajouter `style={{ margin: 0 }}` sur le `<h1>`
  - [x] Supprimer `style={{ marginBottom: 16 }}` du `<Button>`

### Lieux de Stockage (AC: 3, 4)

- [x] Modifier `inertia/pages/StorageLocations/Index.tsx` (AC: 3)
  - [x] Envelopper `<h1>Lieux de Stockage</h1>` et `<Button>Ajouter un lieu</Button>` dans un `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>`
  - [x] Ajouter `style={{ margin: 0 }}` sur le `<h1>`
  - [x] Supprimer `style={{ marginBottom: 16 }}` du `<Button>`

### Tests (AC: 1, 2, 3)

- [x] Vérifier que les tests existants passent toujours après les changements (ils utilisent `getByRole` sémantique, pas de sélecteurs positionnels — aucune modification attendue)
  - [x] `npx vitest run inertia/pages/Categories/Index.test.tsx` — vert
  - [x] `npx vitest run inertia/pages/Types/Index.test.tsx` — vert
  - [x] `npx vitest run inertia/pages/StorageLocations/Index.test.tsx` — vert

### Validation Finale (AC: Tous)

- [x] Lancer la suite complète `npx vitest run` — 0 régression (381 tests passés)
- [ ] Vérifier visuellement en dev que les 3 pages ont le même layout que Routines/Spectacles/Notes

## Dev Notes

### 🎯 Contexte : Incohérence UI constatée en développement

Lors de la review de la Story 1.7, il a été observé que 3 pages utilisent un layout vertical simple (titre puis bouton en dessous) alors que les 4 autres pages (Routines, Spectacles, Notes, Inventaire) utilisent un flex row avec titre à gauche et bouton à droite.

---

### ✅ Pattern cible — identique sur toutes les pages concernées

```tsx
// Pattern utilisé par Routines/Shows/Notes/Materials — à reproduire
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  <h1 style={{ margin: 0 }}>Titre de la page</h1>
  <Button type="primary" onClick={() => setCreateModalOpen(true)}>
    Ajouter...
  </Button>
</div>
```

---

### ❌ Pattern actuel à remplacer (Categories, Types, StorageLocations)

```tsx
// AVANT — bouton sous le titre
<h1>Catégories</h1>
<Button
  type="primary"
  onClick={() => setCreateModalOpen(true)}
  style={{ marginBottom: 16 }}
>
  Ajouter une catégorie
</Button>
```

---

### 📁 Fichiers à modifier

**Fichiers à MODIFIER :**
- `inertia/pages/Categories/Index.tsx` — lignes 92-99
- `inertia/pages/Types/Index.tsx` — lignes 81-84
- `inertia/pages/StorageLocations/Index.tsx` — lignes 98-101

**Fichiers à NE PAS TOUCHER :**
- `inertia/pages/Routines/Index.tsx` — déjà correct ✅
- `inertia/pages/Shows/Index.tsx` — déjà correct ✅
- `inertia/pages/Notes/Index.tsx` — déjà correct ✅
- `inertia/pages/Materials/Index.tsx` — déjà correct ✅
- Modals, forms, colonnes de table — aucun changement

---

### 🧪 Compatibilité tests existants

Les tests existants utilisent des sélecteurs sémantiques (`getByRole`) qui sont insensibles au positionnement DOM :

```typescript
// Categories/Index.test.tsx — Ces tests passent SANS modification
screen.getByRole('heading', { name: /catégories/i })       // ✅ trouve h1 peu importe la structure
screen.getByRole('button', { name: /ajouter une catégorie/i }) // ✅ trouve button peu importe sa position
```

Aucun test ne cible de structure CSS ou de positionnement. **Aucun test ne doit être modifié.**

---

### 🔄 Note sur Categories/Index.tsx

La page Categories a un `<Input />` sans placeholder (cohérence avec Types et StorageLocations qui ont été corrigés dans les commits récents). Ce n'est **pas** dans le scope de cette story — à traiter séparément si besoin.

---

### Learnings des Stories Précédentes

- ✅ Ne pas oublier `style={{ margin: 0 }}` sur `<h1>` quand dans un flex container — sinon la marge par défaut du `<h1>` crée un alignement vertical asymétrique
- ✅ Le `marginBottom: 16` se déplace du `<Button>` vers le wrapper `<div>`
- ✅ Les tests existants utilisent tous `vi.mock('~/components/Layout', ...)` — aucun changement requis dans les mocks

### Project Structure Notes

- Pages dans `inertia/pages/{Entity}/Index.tsx`
- Tests co-localisés `inertia/pages/{Entity}/Index.test.tsx`
- Aucune migration, aucun controller, aucun backend à toucher

### References

- `inertia/pages/Routines/Index.tsx:92-95` — pattern flex reference
- `inertia/pages/Shows/Index.tsx:48-51` — pattern flex reference
- `inertia/pages/Notes/Index.tsx:37-40` — pattern flex reference (version minimaliste sans Space wrapper)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

_Aucun blocage._

### Completion Notes List

- Appliqué le pattern `flex space-between` sur les 3 pages : Categories, Types, StorageLocations
- `style={{ margin: 0 }}` ajouté sur chaque `<h1>` pour éviter le décalage vertical dans le flex container
- `style={{ marginBottom: 16 }}` déplacé du `<Button>` vers le wrapper `<div>`
- 378 tests passés — 0 régression

### File List

- `inertia/pages/Categories/Index.tsx`
- `inertia/pages/Types/Index.tsx`
- `inertia/pages/StorageLocations/Index.tsx`
- `inertia/pages/Categories/Index.test.tsx`
- `inertia/pages/Types/Index.test.tsx`
- `inertia/pages/StorageLocations/Index.test.tsx`

### Change Log

- 2026-03-25 : Harmonisation du layout en-tête sur les pages Categories, Types et StorageLocations — pattern flex `space-between` aligné avec Routines/Shows/Notes/Materials
