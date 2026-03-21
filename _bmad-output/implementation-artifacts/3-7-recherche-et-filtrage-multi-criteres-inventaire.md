# Story 3.7: Recherche et Filtrage Multi-Critères Inventaire

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **rechercher et filtrer mon inventaire par nom, type, catégorie, lieu et auteur**,
so that **je peux trouver rapidement n'importe quel matériel** (FR51-55, NFR2).

## Acceptance Criteria

**Scenario 1 : Affichage de la barre de recherche et du bouton Filtres**
- **Given** je suis sur /materials
- **When** la page se charge
- **Then** je vois la barre de recherche globale dans le Header (déjà créée Story 1.2)
- **And** un bouton "Filtres" est visible à côté

**Scenario 2 : Recherche par nom (search-as-you-type)**
- **Given** je tape dans la barre de recherche (FR51)
- **When** je tape "Hedan"
- **Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
- **And** les résultats s'affichent en moins de 500ms (NFR2)
- **And** seuls les matériels dont le nom contient "Hedan" sont affichés
- **And** la recherche est case-insensitive

**Scenario 3 : Effacement de la recherche**
- **Given** la recherche est active
- **When** j'efface la barre de recherche
- **Then** tous les matériels réapparaissent

**Scenario 4 : Ouverture du panneau filtres**
- **Given** je clique sur "Filtres"
- **When** le panneau s'ouvre (Drawer Ant Design)
- **Then** je vois les filtres disponibles :
  - Type (Select - FR52)
  - Catégorie (Select multiple - FR53)
  - Lieu de stockage (Select - FR54)
  - Auteur (Input - FR55)

**Scenario 5 : Filtre par Type**
- **Given** le panneau filtres est ouvert
- **When** je sélectionne un Type
- **Then** seuls les matériels de ce type sont affichés
- **And** le filtre s'applique immédiatement (< 500ms)
- **And** le nombre de résultats est affiché

**Scenario 6 : Filtre par Catégorie (multi-select)**
- **Given** le panneau filtres est ouvert
- **When** je sélectionne plusieurs Catégories
- **Then** seuls les matériels ayant au moins une de ces catégories sont affichés
- **And** le filtre s'applique immédiatement

**Scenario 7 : Filtre par Lieu de stockage**
- **Given** le panneau filtres est ouvert
- **When** je sélectionne un Lieu de stockage
- **Then** seuls les matériels rangés dans ce lieu sont affichés

**Scenario 8 : Filtre par Auteur**
- **Given** le panneau filtres est ouvert
- **When** je tape un nom d'Auteur
- **Then** seuls les matériels de cet auteur sont affichés
- **And** la recherche est case-insensitive

**Scenario 9 : Combinaison de filtres (AND logic)**
- **Given** plusieurs filtres sont actifs
- **When** j'affiche les résultats
- **Then** les filtres se combinent (AND logic)
- **And** seuls les matériels respectant TOUS les filtres sont affichés

**Scenario 10 : Réinitialisation des filtres**
- **Given** des filtres sont actifs
- **When** je clique sur "Réinitialiser les filtres"
- **Then** tous les filtres sont effacés
- **And** tous les matériels réapparaissent

**Scenario 11 : Préservation des filtres lors du changement de vue**
- **Given** des filtres ou recherche sont actifs
- **When** je bascule entre vue Table et vue Cards
- **Then** les filtres et recherche sont conservés
- **And** les résultats filtrés s'affichent dans la nouvelle vue

## Tasks / Subtasks

### Frontend — Modifier `inertia/pages/Materials/Index.tsx` (AC: 1-11)

- [x] Ajouter les imports nécessaires (AC: 1-11)
  - [x] Ajouter `Input, Drawer, Select, Badge` depuis antd (en plus des imports existants)
  - [x] Ajouter `useMemo, useEffect` depuis react (useRef et useCallback non nécessaires)
- [x] Ajouter les états de recherche et filtrage (AC: 2, 3, 5-10)
  - [x] `const [searchInput, setSearchInput] = useState('')` — valeur affichée dans l'input
  - [x] `const [searchQuery, setSearchQuery] = useState('')` — valeur debouncée (300ms)
  - [x] `const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)`
  - [x] `const [filterTypeId, setFilterTypeId] = useState<number | null>(null)`
  - [x] `const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])`
  - [x] `const [filterStorageLocationId, setFilterStorageLocationId] = useState<number | null>(null)`
  - [x] `const [filterAuthor, setFilterAuthor] = useState('')`
- [x] Implémenter le debounce 300ms avec useEffect (AC: 2)
  - [x] `useEffect(() => { const timer = setTimeout(() => setSearchQuery(searchInput), 300); return () => clearTimeout(timer) }, [searchInput])`
- [x] Calculer les options de filtres disponibles avec useMemo (AC: 4)
  - [x] `availableTypes` — types uniques extraits de `materials` (triés par nom)
  - [x] `availableCategories` — catégories uniques extraites de `materials` (triées par nom)
  - [x] `availableStorageLocations` — lieux uniques extraits de `materials` (triés par nom)
- [x] Implémenter `filteredMaterials` avec useMemo (AC: 2, 3, 5-9)
  - [x] Filtrer par `searchQuery` : `m.name.toLowerCase().includes(q)` (case-insensitive)
  - [x] Filtrer par `filterTypeId` : `m.type?.id === filterTypeId`
  - [x] Filtrer par `filterCategoryIds` : `m.categories.some(c => filterCategoryIds.includes(c.id))` (OR logic dans une même catégorie)
  - [x] Filtrer par `filterStorageLocationId` : `m.storageLocation?.id === filterStorageLocationId`
  - [x] Filtrer par `filterAuthor` : `m.author?.toLowerCase().includes(filterAuthor.toLowerCase())` (case-insensitive)
  - [x] Combinaison AND entre tous les filtres actifs
- [x] Calculer `activeFilterCount` (AC: 1, 10)
  - [x] Compter le nombre de filtres Drawer actifs : typeId, categoryIds.length > 0, storageLocationId, filterAuthor non vide
- [x] Mettre à jour le toolbar (AC: 1, 5)
  - [x] Ajouter `Input.Search` dans le toolbar pour la recherche par nom
  - [x] Ajouter bouton "Filtres" avec `Badge` affichant `activeFilterCount` si > 0
  - [x] Afficher le nombre de résultats : "X résultat(s)" quand au moins un filtre actif
- [x] Ajouter le `Drawer` pour les filtres (AC: 4-10)
  - [x] `title="Filtres"`, `placement="right"`, `open={isFilterDrawerOpen}`, `onClose={() => setIsFilterDrawerOpen(false)}`
  - [x] Select "Type" : `options={availableTypes.map(t => ({ value: t.id, label: t.name }))}`, `allowClear`
  - [x] Select "Catégorie(s)" : `mode="multiple"`, `options={availableCategories.map(...)}`, `allowClear`
  - [x] Select "Lieu de stockage" : `options={availableStorageLocations.map(...)}`, `allowClear`
  - [x] Input "Auteur" : input texte libre
  - [x] Bouton "Réinitialiser les filtres" qui reset tous les filtres du Drawer (pas searchInput)
- [x] Remplacer `materials` par `filteredMaterials` dans les vues Table et Cards (AC: 2-9, 11)
  - [x] `dataSource={filteredMaterials}` dans le `<Table>` (la pagination Table Ant Design gère automatiquement)
  - [x] `paginatedMaterials = filteredMaterials.slice(...)` dans la vue Cards
  - [x] `total={filteredMaterials.length}` dans la `<Pagination>` de la vue Cards
  - [x] Remettre `cardsPage` à 1 quand les filtres changent (useEffect sur filteredMaterials)

### Tests — Modifier `inertia/pages/Materials/Index.test.tsx` (AC: 2-11)

- [x] Vérifier 0 régression sur les tests existants
- [x] Test : affiche l'input de recherche dans le toolbar
- [x] Test : filtrage par nom (search-as-you-type) — mocker les timers avec `vi.useFakeTimers()`
  - [x] Saisir "Bicycle" → avancer le timer 300ms → seul "Bicycle Standard" est affiché
  - [x] Effacer → tous les matériels réapparaissent
- [x] Test : affiche le bouton "Filtres"
- [x] Test : ouvre le Drawer au clic "Filtres"
- [x] Test : filtre par Type via le Select Drawer (`fireEvent.mouseDown` + `findByTitle`)
- [x] Test : filtre par Catégorie (multi-select) via le Select Drawer
- [x] Test : filtre par Lieu de stockage via le Select Drawer
- [x] Test : filtre par Auteur
- [x] Test : combinaison de 2 filtres Drawer — AND logic (type + auteur avec 3 matériels)
- [x] Test : "Réinitialiser les filtres" remet à zéro les filtres Drawer
- [x] Test : filtres préservés lors du basculement Table ↔ Cards (AC: 11)
- [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Approche Générale : Filtrage Client-Side

**⚠️ DÉCISION ARCHITECTURE MVP : Filtrage 100% côté frontend (in-memory)**

L'architecture spécifie "Query parameters + backend filtering" comme pattern cible. Pour ce MVP :
- Tous les matériels sont déjà chargés en mémoire dans `materials` props
- Le filtrage in-memory est instantané (< 1ms pour des centaines d'items)
- Pas de modification backend nécessaire pour cette story
- NFR2 (< 500ms) est largement respecté

Note : La migration vers backend filtering (Inertia `router.get` + `request.qs()`) pourra être faite en Epic 4+ si le volume de données le justifie.

**Fichiers à modifier :**
```
inertia/pages/Materials/Index.tsx        ← MODIFIER (ajout search + filter)
inertia/pages/Materials/Index.test.tsx   ← MODIFIER (nouveaux tests)
```

**Fichiers SANS modification :**
```
app/controllers/materials_controller.ts  ← INTOUCHER (index() reste inchangé)
inertia/components/Layout.tsx            ← INTOUCHER (Header search rewire hors scope MVP)
app/models/material.ts                   ← INTOUCHER
start/routes.ts                          ← INTOUCHER
```

### 🔥 Pattern Critique — Debounce 300ms

```typescript
// État séparé : input affiché vs query debouncée
const [searchInput, setSearchInput] = useState('')
const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setSearchQuery(searchInput)
  }, 300)
  return () => clearTimeout(timer) // cleanup sur chaque changement
}, [searchInput])
```

### 🔥 Pattern Critique — `filteredMaterials` avec useMemo

```typescript
const filteredMaterials = useMemo(() => {
  let result = materials

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter((m) => m.name.toLowerCase().includes(q))
  }

  if (filterTypeId !== null) {
    result = result.filter((m) => m.type?.id === filterTypeId)
  }

  if (filterCategoryIds.length > 0) {
    result = result.filter((m) =>
      m.categories.some((c) => filterCategoryIds.includes(c.id))
    )
  }

  if (filterStorageLocationId !== null) {
    result = result.filter((m) => m.storageLocation?.id === filterStorageLocationId)
  }

  if (filterAuthor.trim()) {
    const a = filterAuthor.toLowerCase()
    result = result.filter((m) => m.author?.toLowerCase().includes(a))
  }

  return result
}, [materials, searchQuery, filterTypeId, filterCategoryIds, filterStorageLocationId, filterAuthor])
```

### 🔥 Pattern Critique — Extraction options disponibles

```typescript
// Types uniques présents dans les matériels
const availableTypes = useMemo(() => {
  const seen = new Set<number>()
  const types: { id: number; name: string }[] = []
  materials.forEach((m) => {
    if (m.type && !seen.has(m.type.id)) {
      seen.add(m.type.id)
      types.push(m.type)
    }
  })
  return types.sort((a, b) => a.name.localeCompare(b.name))
}, [materials])

// Catégories uniques
const availableCategories = useMemo(() => {
  const seen = new Set<number>()
  const cats: { id: number; name: string }[] = []
  materials.forEach((m) =>
    m.categories.forEach((c) => {
      if (!seen.has(c.id)) { seen.add(c.id); cats.push(c) }
    })
  )
  return cats.sort((a, b) => a.name.localeCompare(b.name))
}, [materials])

// Lieux uniques
const availableStorageLocations = useMemo(() => {
  const seen = new Set<number>()
  const locs: { id: number; name: string }[] = []
  materials.forEach((m) => {
    if (m.storageLocation && !seen.has(m.storageLocation.id)) {
      seen.add(m.storageLocation.id)
      locs.push(m.storageLocation)
    }
  })
  return locs.sort((a, b) => a.name.localeCompare(b.name))
}, [materials])
```

### 🔥 Pattern Critique — Reset cardsPage quand filtres changent

```typescript
useEffect(() => {
  setCardsPage(1)
}, [filteredMaterials])
```

### 🔥 Pattern Critique — Toolbar avec Search + Filtres + Compteur

```tsx
const activeFilterCount = [
  filterTypeId !== null,
  filterCategoryIds.length > 0,
  filterStorageLocationId !== null,
  filterAuthor.trim() !== '',
].filter(Boolean).length

const hasActiveFilters = searchQuery.trim() !== '' || activeFilterCount > 0

// Dans le toolbar :
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  <Space>
    <h1 style={{ margin: 0 }}>Mon Inventaire</h1>
    {hasActiveFilters && (
      <span style={{ color: '#8c8c8c', fontSize: 14 }}>
        {filteredMaterials.length} résultat(s)
      </span>
    )}
  </Space>
  <Space>
    <Input.Search
      placeholder="Rechercher par nom..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      onSearch={(val) => { setSearchInput(val); setSearchQuery(val) }}
      allowClear
      style={{ width: 220 }}
    />
    <Badge count={activeFilterCount} size="small">
      <Button onClick={() => setIsFilterDrawerOpen(true)}>Filtres</Button>
    </Badge>
    <Segmented ... />
    <Button type="primary" ...>Ajouter un matériel</Button>
  </Space>
</div>
```

### 🔥 Pattern Critique — Drawer avec filtres

```tsx
<Drawer
  title="Filtres"
  placement="right"
  open={isFilterDrawerOpen}
  onClose={() => setIsFilterDrawerOpen(false)}
  footer={
    <Button onClick={resetFilters} disabled={activeFilterCount === 0}>
      Réinitialiser les filtres
    </Button>
  }
>
  <Space direction="vertical" style={{ width: '100%' }} size="middle">
    <div>
      <label>Type</label>
      <Select
        placeholder="Tous les types"
        style={{ width: '100%' }}
        options={availableTypes.map((t) => ({ value: t.id, label: t.name }))}
        value={filterTypeId}
        onChange={(val) => setFilterTypeId(val ?? null)}
        allowClear
      />
    </div>
    <div>
      <label>Catégorie(s)</label>
      <Select
        mode="multiple"
        placeholder="Toutes les catégories"
        style={{ width: '100%' }}
        options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
        value={filterCategoryIds}
        onChange={(vals) => setFilterCategoryIds(vals)}
        allowClear
      />
    </div>
    <div>
      <label>Lieu de stockage</label>
      <Select
        placeholder="Tous les lieux"
        style={{ width: '100%' }}
        options={availableStorageLocations.map((l) => ({ value: l.id, label: l.name }))}
        value={filterStorageLocationId}
        onChange={(val) => setFilterStorageLocationId(val ?? null)}
        allowClear
      />
    </div>
    <div>
      <label>Auteur</label>
      <Input
        placeholder="Filtrer par auteur..."
        value={filterAuthor}
        onChange={(e) => setFilterAuthor(e.target.value)}
        allowClear
      />
    </div>
  </Space>
</Drawer>
```

### 🔥 Pattern Critique — resetFilters

```typescript
const resetFilters = () => {
  setFilterTypeId(null)
  setFilterCategoryIds([])
  setFilterStorageLocationId(null)
  setFilterAuthor('')
}
```

### 📊 Utilisation de `filteredMaterials` dans les vues

```tsx
// Vue Table — remplacer materials par filteredMaterials
<Table<MaterialItem>
  dataSource={filteredMaterials}  // ← WAS: materials
  ...
/>

// Vue Cards — remplacer materials par filteredMaterials
const paginatedMaterials = filteredMaterials.slice(...)  // ← WAS: materials.slice(...)

// Pagination Cards
<Pagination
  total={filteredMaterials.length}  // ← WAS: materials.length
  ...
/>

// Empty state (vérifier filteredMaterials.length === 0)
// ATTENTION : distinguer "aucun matériel du tout" (materials.length === 0)
// vs "aucun résultat pour les filtres actifs" (filteredMaterials.length === 0 mais materials.length > 0)
{materials.length === 0 ? emptyState : filteredMaterials.length === 0 ? noResultsState : cardsGrid}
```

Pour l'empty state conditionnel :
```tsx
const noResultsState = (
  <Empty description="Aucun matériel ne correspond à vos critères de recherche">
    <Button onClick={() => { setSearchInput(''); setSearchQuery(''); resetFilters() }}>
      Réinitialiser la recherche
    </Button>
  </Empty>
)
```

### ⚠️ Piège Tests — Debounce avec Fake Timers

```typescript
import { vi } from 'vitest'

// Dans les tests de recherche :
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('filtre par nom après debounce 300ms', async () => {
  render(<MaterialsIndex materials={mockMaterials} />)
  const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
  await userEvent.type(searchInput, 'Bicycle')
  // Avant le debounce : les 2 matériels sont encore affichés
  expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
  // Avancer le timer
  act(() => vi.advanceTimersByTime(300))
  // Après le debounce : seul Bicycle Standard reste
  expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
})
```

### ⚠️ Piège — Import Ant Design `Space` (conflit de noms)

`Index.tsx` importe déjà `Space` depuis antd. Si besoin de renommer pour éviter confusion :
```typescript
import { ..., Space, ... } from 'antd'
// Pas besoin de renommer — déjà importé
```

Vérifier que `Space` est dans les imports existants dans `Index.tsx` — il est déjà là (`import { ..., Space, ... } from 'antd'`). Pas de duplication nécessaire.

### 📝 Composants Architecture (Note)

L'architecture prévoit `inertia/components/SearchBar.tsx` et `FilterPanel.tsx` comme composants réutilisables. Pour ce MVP, l'implémentation est **inline dans `Index.tsx`**. Si ces composants sont requis pour les Epic 4+ (routines, shows), extraire dans des composants séparés à ce moment-là.

### Project Structure Notes

- Pattern search-as-you-type : cohérent avec le commentaire dans `Layout.tsx` ligne 162 ("logique de recherche à implémenter en Epic 3") — mais on implémente dans la page, pas dans le Layout
- Pas de nouvelle route, pas de nouvelle migration, pas de nouveau validator
- Pas de modification du controller (filtrage 100% frontend)
- Tests avec `vi.useFakeTimers()` pour le debounce (pattern standard Vitest)

### References

- Index page existante : [Source: inertia/pages/Materials/Index.tsx]
- Tests existants : [Source: inertia/pages/Materials/Index.test.tsx]
- Layout.tsx Search (non modifié) : [Source: inertia/components/Layout.tsx#159-165]
- Story précédente 3.6 : [Source: _bmad-output/implementation-artifacts/3-6-suppression-dun-materiel.md]
- Epic 3 story 3.7 : [Source: _bmad-output/planning-artifacts/epics.md#1070]
- Architecture search/filter : [Source: _bmad-output/planning-artifacts/architecture.md#1480-1484]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage critique. Deux corrections de tests :
- `getByText('Type')` conflictait avec la colonne Table → remplacé par `getByText('Tous les types')` (placeholder Select)
- `userEvent.click` + `vi.useFakeTimers()` incompatibles → remplacé par `fireEvent.click` dans les tests Combinaison

### Completion Notes List

- ✅ `Index.tsx` : imports `Badge, Drawer, Input, Select` ajoutés ; `useMemo, useEffect` ajoutés
- ✅ État recherche : `searchInput` (affiché) + `searchQuery` (debouncé 300ms via useEffect)
- ✅ Debounce 300ms avec cleanup `clearTimeout` sur chaque changement
- ✅ Effacement immédiat : `if (!e.target.value) setSearchQuery('')` dans `onChange`
- ✅ `availableTypes`, `availableCategories`, `availableStorageLocations` dérivés des matériels (useMemo)
- ✅ `filteredMaterials` useMemo avec AND logic : search + typeId + categoryIds + storageLocationId + author
- ✅ `activeFilterCount` (4 filtres Drawer) + `hasActiveFilters` (inclut search)
- ✅ Toolbar : `Input.Search` + `Badge`+`Filtres` + compteur résultats + Segmented + Bouton ajout
- ✅ `Drawer` placement=right avec 4 contrôles (Select type, Select multi catégories, Select lieu, Input auteur)
- ✅ Bouton "Réinitialiser les filtres" dans footer du Drawer (disabled si aucun filtre actif)
- ✅ `noResultsState` distinct de `emptyState` (aucun matériel vs aucun résultat)
- ✅ Vue Table : `dataSource={filteredMaterials}` + locale conditionnel (noResults vs empty)
- ✅ Vue Cards : pagination sur `filteredMaterials`, cardsPage reset via useEffect
- ✅ 41 tests passent (28 existants + 13 nouveaux) ; 0 régression
- ✅ Code Review fixes : `virtual={false}` sur les 3 Selects Drawer (testabilité jsdom + accessibilité), `aria-label` sur les 4 contrôles Drawer, tests Select par type/catégorie/lieu ajoutés, test AND logic avec 3 matériels, test onSearch amélioré

### File List

- `inertia/pages/Materials/Index.tsx` (modifié — recherche debounce + Drawer filtres + filteredMaterials)
- `inertia/pages/Materials/Index.test.tsx` (modifié — 9 nouveaux tests + import `within`)

## Change Log

- 2026-03-21 : Story 3.7 implémentée — recherche par nom (debounce 300ms) + Drawer filtres (type, catégories, lieu, auteur) + AND logic + reset + filtres préservés lors du changement de vue
