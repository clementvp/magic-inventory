# Story 4.8: Recherche et Filtrage des Routines

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **rechercher et filtrer mes routines par nom et catégorie**,
so that **je peux trouver rapidement n'importe quelle routine** (FR56, FR57).

## Acceptance Criteria

**Scenario 1 : Affichage de la barre de recherche et du bouton Filtres**
- **Given** je suis sur /routines
- **When** la page se charge
- **Then** je vois la barre de recherche globale dans le Header
- **And** un bouton "Filtres" est visible

**Scenario 2 : Recherche par nom (search-as-you-type)**
- **Given** je tape dans la barre de recherche (FR56)
- **When** je tape "Matrix"
- **Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
- **And** les résultats s'affichent en moins de 500ms
- **And** seules les routines dont le nom contient "Matrix" sont affichées
- **And** la recherche est case-insensitive

**Scenario 3 : Effacement de la recherche**
- **Given** la recherche est active
- **When** j'efface la barre de recherche
- **Then** toutes les routines réapparaissent

**Scenario 4 : Ouverture du panneau filtres (Drawer)**
- **Given** je clique sur "Filtres"
- **When** le Drawer s'ouvre
- **Then** je vois le filtre : Catégorie (Select multiple - FR57)

**Scenario 5 : Filtre par Catégorie (multi-select)**
- **Given** le panneau filtres est ouvert
- **When** je sélectionne une ou plusieurs Catégories
- **Then** seules les routines ayant au moins une de ces catégories sont affichées
- **And** le filtre s'applique immédiatement (< 500ms)

**Scenario 6 : Réinitialisation des filtres**
- **Given** des filtres sont actifs
- **When** je clique sur "Réinitialiser les filtres"
- **Then** tous les filtres sont effacés
- **And** toutes les routines réapparaissent

**Scenario 7 : Aucun résultat**
- **Given** des filtres/recherche actifs
- **When** aucune routine ne correspond
- **Then** un Empty state "Aucune routine ne correspond à vos critères" s'affiche avec bouton "Réinitialiser la recherche"

**Scenario 8 : Reset de la pagination quand les filtres changent**
- **Given** je suis sur la page 2 (si > 12 routines)
- **When** je tape dans la recherche ou modifie les filtres
- **Then** la pagination revient à la page 1

## Tasks / Subtasks

### Frontend — Modifier `inertia/pages/Routines/Index.tsx` (AC: 1-8)

- [x] Ajouter les imports nécessaires (AC: 1-8)
  - [x] Ajouter `useMemo, useEffect` depuis `react` (en plus de `useState` existant)
  - [x] Ajouter `Badge, Drawer, Input, Select` depuis `antd` (en plus des imports existants : `Button, Card, Col, Empty, Pagination, Row, Space, Tag`)
- [x] Ajouter les états de recherche et filtrage (AC: 2, 3, 5, 6)
  - [x] `const [searchInput, setSearchInput] = useState('')` — valeur affichée dans l'input
  - [x] `const [searchQuery, setSearchQuery] = useState('')` — valeur debouncée (300ms)
  - [x] `const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)`
  - [x] `const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([])`
- [x] Implémenter le debounce 300ms avec useEffect (AC: 2)
  - [x] `useEffect(() => { const timer = setTimeout(() => setSearchQuery(searchInput), 300); return () => clearTimeout(timer) }, [searchInput])`
- [x] Calculer les options de catégories disponibles avec useMemo (AC: 4)
  - [x] `availableCategories` — catégories uniques extraites de `routines` (triées par nom)
- [x] Implémenter `filteredRoutines` avec useMemo (AC: 2, 3, 5, 6, 8)
  - [x] Filtrer par `searchQuery` : `r.name.toLowerCase().includes(q)` (case-insensitive)
  - [x] Filtrer par `filterCategoryIds` : `r.categories.some(c => filterCategoryIds.includes(c.id))` (OR logic)
  - [x] Combinaison AND entre les 2 filtres actifs
- [x] Calculer `activeFilterCount` (AC: 1, 6)
  - [x] Compter les filtres Drawer actifs : `filterCategoryIds.length > 0`
- [x] Mettre à jour le toolbar (AC: 1)
  - [x] Ajouter `Input.Search` dans le toolbar pour la recherche par nom
  - [x] Ajouter bouton "Filtres" avec `Badge` affichant `activeFilterCount` si > 0
  - [x] Afficher le nombre de résultats quand au moins un filtre actif
- [x] Ajouter le `Drawer` pour les filtres (AC: 4, 5, 6)
  - [x] `title="Filtres"`, `placement="right"`, `open={isFilterDrawerOpen}`, `onClose={() => setIsFilterDrawerOpen(false)}`
  - [x] Select "Catégorie(s)" : `mode="multiple"`, `virtual={false}` (testabilité jsdom), `aria-label="Catégories"`, `options={availableCategories.map(...)}`, `allowClear`
  - [x] Bouton "Réinitialiser les filtres" dans le footer du Drawer (disabled si `activeFilterCount === 0`)
- [x] Implémenter `resetFilters` (AC: 6)
  - [x] `const resetFilters = () => { setFilterCategoryIds([]) }`
- [x] Mettre à jour la pagination (AC: 8)
  - [x] Utiliser `filteredRoutines` pour le slice et le total : `filteredRoutines.slice(...)`, `total={filteredRoutines.length}`
  - [x] Ajouter `useEffect(() => { setPage(1) }, [filteredRoutines])` pour reset la pagination
- [x] Gérer l'état vide conditionnel (AC: 7)
  - [x] Distinguer "aucune routine du tout" (`routines.length === 0`) vs "aucun résultat pour les filtres" (`filteredRoutines.length === 0 && routines.length > 0`)
  - [x] Ajouter `noResultsState` avec `Empty description="Aucune routine ne correspond à vos critères de recherche"` et bouton "Réinitialiser la recherche"

### Tests — Modifier `inertia/pages/Routines/Index.test.tsx` (AC: 1-8)

- [x] Vérifier 0 régression sur les tests existants
- [x] Test : affiche l'input de recherche dans le toolbar
- [x] Test : filtrage par nom (search-as-you-type) — mocker les timers avec `vi.useFakeTimers()`
  - [x] Saisir "Matrix" → avancer le timer 300ms → seul "Matrix" est affiché
  - [x] Effacer → toutes les routines réapparaissent
- [x] Test : affiche le bouton "Filtres"
- [x] Test : ouvre le Drawer au clic "Filtres"
- [x] Test : filtre par Catégorie (multi-select) via le Select Drawer (`fireEvent.mouseDown` + `findByTitle`)
- [x] Test : "Réinitialiser les filtres" remet à zéro les filtres Drawer
- [x] Test : Empty state "Aucune routine ne correspond" quand aucun résultat filtré
- [x] Test : reset pagination à la page 1 quand les filtres changent (si manyRoutines)
- [x] Lancer `npx vitest run` — 0 régression (237 tests, 0 fail)

## Dev Notes

### 🎯 Approche Générale : Filtrage Client-Side

**⚠️ DÉCISION ARCHITECTURE MVP : Filtrage 100% côté frontend (in-memory)**

Même décision que Story 3.7 (recherche matériels) :
- Toutes les routines sont déjà chargées en mémoire dans la prop `routines`
- Le filtrage in-memory est instantané (< 1ms pour des centaines d'items)
- Pas de modification backend nécessaire
- NFR2 (< 500ms) est largement respecté

**Fichiers à modifier :**
```
inertia/pages/Routines/Index.tsx        ← MODIFIER (ajout search + filter)
inertia/pages/Routines/Index.test.tsx   ← MODIFIER (nouveaux tests)
```

**Fichiers SANS modification :**
```
app/controllers/routines_controller.ts  ← INTOUCHER (index() déjà charge categories)
inertia/components/Layout.tsx           ← INTOUCHER
app/models/routine.ts                   ← INTOUCHER
start/routes.ts                         ← INTOUCHER
database/migrations/*                   ← INTOUCHER
```

### 🏗️ Structure actuelle de `Index.tsx` (à comprendre avant de modifier)

Le composant actuel (84 lignes) :
- Props : `routines: RoutineItem[]` avec `{ id, name, categories: { id, name }[], createdAt }`
- Un seul état : `const [page, setPage] = useState(1)` pour la pagination
- Vue Cards seulement (pas de switcher Table/Cards comme Materials)
- `PAGE_SIZE = 12` → pagination `hideOnSinglePage`
- Toolbar actuel : `<h1>Mes Routines</h1>` + `<Button>Créer une routine</Button>`

[Source: inertia/pages/Routines/Index.tsx]

### 🔥 Pattern Critique — Debounce 300ms

Copier exactement de 3.7 :

```typescript
// 2 états séparés : input affiché vs query debouncée
const [searchInput, setSearchInput] = useState('')
const [searchQuery, setSearchQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setSearchQuery(searchInput)
  }, 300)
  return () => clearTimeout(timer)
}, [searchInput])
```

[Source: inertia/pages/Materials/Index.tsx — pattern identique]

### 🔥 Pattern Critique — `filteredRoutines` avec useMemo

Story 4.8 est plus simple que 3.7 : seulement 2 critères (nom + catégories) :

```typescript
const filteredRoutines = useMemo(() => {
  let result = routines

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    result = result.filter((r) => r.name.toLowerCase().includes(q))
  }

  if (filterCategoryIds.length > 0) {
    result = result.filter((r) =>
      r.categories.some((c) => filterCategoryIds.includes(c.id))
    )
  }

  return result
}, [routines, searchQuery, filterCategoryIds])
```

### 🔥 Pattern Critique — `availableCategories` avec useMemo

```typescript
const availableCategories = useMemo(() => {
  const seen = new Set<number>()
  const cats: { id: number; name: string }[] = []
  routines.forEach((r) =>
    r.categories.forEach((c) => {
      if (!seen.has(c.id)) {
        seen.add(c.id)
        cats.push(c)
      }
    })
  )
  return cats.sort((a, b) => a.name.localeCompare(b.name))
}, [routines])
```

### 🔥 Pattern Critique — Toolbar avec Search + Filtres + Compteur

```tsx
const activeFilterCount = [filterCategoryIds.length > 0].filter(Boolean).length
const hasActiveFilters = searchQuery.trim() !== '' || activeFilterCount > 0

// Dans le render, remplacer le toolbar actuel :
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
  <Space>
    <h1 style={{ margin: 0 }}>Mes Routines</h1>
    {hasActiveFilters && (
      <span style={{ color: '#8c8c8c', fontSize: 14 }}>
        {filteredRoutines.length} résultat(s)
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
    <Button type="primary" onClick={() => router.visit('/routines/create')}>
      Créer une routine
    </Button>
  </Space>
</div>
```

### 🔥 Pattern Critique — Drawer avec filtre Catégorie

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
      <label>Catégorie(s)</label>
      <Select
        mode="multiple"
        placeholder="Toutes les catégories"
        style={{ width: '100%' }}
        options={availableCategories.map((c) => ({ value: c.id, label: c.name }))}
        value={filterCategoryIds}
        onChange={(vals) => setFilterCategoryIds(vals)}
        allowClear
        virtual={false}
        aria-label="Catégories"
      />
    </div>
  </Space>
</Drawer>
```

**⚠️ `virtual={false}` OBLIGATOIRE** pour que les options soient dans le DOM (jsdom/tests). Code Review 3.7 a ajouté ce fix.

### 🔥 Pattern Critique — Pagination avec filteredRoutines

```tsx
// Remplacer routines par filteredRoutines partout :
const paginatedRoutines = filteredRoutines.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

// Reset page quand filtres changent :
useEffect(() => {
  setPage(1)
}, [filteredRoutines])

// Pagination :
<Pagination
  current={page}
  pageSize={PAGE_SIZE}
  total={filteredRoutines.length}  // ← WAS: routines.length
  onChange={(p) => setPage(p)}
  hideOnSinglePage
  style={{ textAlign: 'center', marginTop: 16 }}
/>
```

### 🔥 Pattern Critique — État vide conditionnel

```tsx
// 3 cas distincts :
// 1. Aucune routine du tout → emptyState original
// 2. Filtres actifs, aucun résultat → noResultsState
// 3. Routines présentes, résultats filtrés → Cards + pagination

const noResultsState = (
  <Empty description="Aucune routine ne correspond à vos critères de recherche">
    <Button
      onClick={() => {
        setSearchInput('')
        setSearchQuery('')
        resetFilters()
      }}
    >
      Réinitialiser la recherche
    </Button>
  </Empty>
)

// Dans le render :
{routines.length === 0 ? (
  <Empty description="Aucune routine créée">
    <Button type="primary" onClick={() => router.visit('/routines/create')}>
      Créer votre première routine
    </Button>
  </Empty>
) : filteredRoutines.length === 0 ? (
  noResultsState
) : (
  <>
    <Row gutter={[16, 16]}>
      {paginatedRoutines.map((r) => (
        // ... cards inchangées
      ))}
    </Row>
    <Pagination ... total={filteredRoutines.length} ... />
  </>
)}
```

### 🔥 Pattern Tests — Debounce avec Fake Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'

// Ajouter un describe dédié pour les tests avec timers :
describe('Recherche par nom', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('filtre par nom après debounce 300ms', async () => {
    render(<RoutinesIndex routines={sampleRoutines} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    await userEvent.type(searchInput, 'Matrix')
    // Avant le debounce : toutes les routines encore affichées
    expect(screen.getByText('Apparition du foulard')).toBeDefined()
    // Avancer le timer
    act(() => vi.advanceTimersByTime(300))
    // Après le debounce : seule la routine "Matrix" reste (si dans sampleRoutines)
    expect(screen.queryByText('Apparition du foulard')).toBeNull()
  })
})
```

**⚠️ `userEvent` est incompatible avec `vi.useFakeTimers()` pour les tests de filtres combinés** → utiliser `fireEvent` pour ces cas. [Source: story 3.7 debug notes]

### 🔥 Pattern Tests — Select Drawer (Catégorie)

```typescript
it('filtre par Catégorie via le Select Drawer', async () => {
  render(<RoutinesIndex routines={sampleRoutines} />)
  // Ouvrir le Drawer
  await userEvent.click(screen.getByText('Filtres'))
  // Ouvrir le Select
  fireEvent.mouseDown(screen.getByLabelText('Catégories'))
  // Sélectionner la catégorie
  const option = await screen.findByTitle('Close-up')
  fireEvent.click(option)
  // Vérifier le filtre
  expect(screen.queryByText('Routine sans catégorie')).toBeNull()
})
```

[Source: pattern identique dans inertia/pages/Materials/Index.test.tsx]

### ⚠️ Points d'Attention

**1. `virtual={false}` sur le Select Catégories (OBLIGATOIRE pour les tests)**
- Sans cette prop, les options ne sont pas dans le DOM avec jsdom
- Code Review de Story 3.7 a ajouté ce fix sur les 3 Selects Materials
- Même obligation ici pour le Select Catégories

**2. `aria-label` sur le Select (OBLIGATOIRE pour les tests)**
- Les tests utilisent `screen.getByLabelText('Catégories')` pour trouver le Select
- Story 3.7 Code Review a ajouté `aria-label` sur tous les contrôles Drawer

**3. Effacement immédiat vs debounce**
- Le `onChange` de l'Input.Search gère l'effacement immediat :
  ```typescript
  onChange={(e) => {
    setSearchInput(e.target.value)
    if (!e.target.value) setSearchQuery('') // effacement immédiat
  }}
  ```
  Alternative : le `allowClear` + `onSearch` gère aussi l'effacement si `onSearch` vide le state immédiatement.

**4. `useEffect` sur `filteredRoutines` pour reset page — éviter les boucles**
- `filteredRoutines` est calculé par `useMemo` → ne change de référence que quand les inputs changent
- `useEffect(() => { setPage(1) }, [filteredRoutines])` est sûr (pas de boucle infinie)
- Pattern identique dans Materials/Index.tsx

**5. Controller déjà prêt — aucune modification**
- `routines_controller.ts` `index()` charge déjà les catégories via `.preload('categories')` (ligne 14)
- La prop `routines` inclut déjà `categories: { id, name }[]` — pas de changement backend

### 📊 Structure des fichiers

```
Fichiers à MODIFIER :
inertia/pages/Routines/Index.tsx         ← Ajout search + Drawer + filteredRoutines
inertia/pages/Routines/Index.test.tsx    ← Nouveaux tests search/filter

Fichiers NON modifiés :
app/controllers/routines_controller.ts   ← index() déjà prêt avec categories
app/models/routine.ts                    ← Pas de changement
start/routes.ts                          ← Pas de changement
database/migrations/*                    ← Pas de migration
inertia/components/Layout.tsx            ← Pas de changement
```

### 📝 Learnings des stories précédentes

**Story 3.7 (recherche matériels — pattern maître) :**
- `virtual={false}` sur les Selects Drawer = OBLIGATOIRE (jsdom + tests)
- `aria-label` sur les contrôles Drawer = OBLIGATOIRE (tests par `getByLabelText`)
- `fireEvent` + `findByTitle` pour les options Select (pas `userEvent`)
- `vi.useFakeTimers()` incompatible avec `userEvent` pour les tests combinés → utiliser `fireEvent`
- Story 3.7 a eu 41 tests (28 anciens + 13 nouveaux) — 0 régression

**Story 4.7 (suppression routines) :**
- Suite actuelle : 226 tests PASS, 0 régression

**Pattern ownership :**
- `routines_controller.ts` filtre déjà par `user_id` dans `index()` → multi-tenancy respectée

### Project Structure Notes

- Filtrage client-side cohérent avec Story 3.7 (même décision MVP)
- Pas de nouvelle route, pas de nouvelle migration, pas de nouveau validator
- Pattern components : l'architecture prévoyait `SearchBar.tsx` + `FilterPanel.tsx` réutilisables — pour ce MVP, inline dans `Index.tsx` (même décision prise en 3.7)
- Seul filtre : Catégorie (vs 4 filtres dans Materials) — implémentation plus simple

### References

- Story 3.7 (pattern maître recherche/filtrage) : [Source: _bmad-output/implementation-artifacts/3-7-recherche-et-filtrage-multi-criteres-inventaire.md]
- Routines/Index.tsx existant : [Source: inertia/pages/Routines/Index.tsx]
- Routines/Index.test.tsx existant : [Source: inertia/pages/Routines/Index.test.tsx]
- Materials/Index.tsx (pattern référence) : [Source: inertia/pages/Materials/Index.tsx]
- Materials/Index.test.tsx (tests référence) : [Source: inertia/pages/Materials/Index.test.tsx]
- routines_controller.ts index() : [Source: app/controllers/routines_controller.ts#11-25]
- Epic 4 Story 4.8 : [Source: _bmad-output/planning-artifacts/epics.md#Story 4.8]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun problème rencontré — implémentation directe en suivant les patterns de Story 3.7.

### Completion Notes List

- Implémenté filtrage client-side 100% in-memory (même décision que Story 3.7)
- Debounce 300ms via deux états séparés `searchInput` / `searchQuery` + `useEffect`
- `filteredRoutines` calculé avec `useMemo` — combinaison AND entre recherche nom et filtre catégories
- `availableCategories` dédupliqué et trié par nom
- Drawer de filtres avec Select multiple catégories (`virtual={false}`, `aria-label="Catégories"`)
- Reset pagination automatique via `useEffect` sur `filteredRoutines`
- 3 états vides distincts : aucune routine / filtres actifs sans résultat / résultats présents
- 237 tests, 0 régression (226 existants + 11 nouveaux)

### File List

inertia/pages/Routines/Index.tsx
inertia/pages/Routines/Index.test.tsx

## Change Log

- 2026-03-22 : Implémentation Story 4.8 — ajout recherche par nom (debounce 300ms) et filtre Catégorie (Drawer, multi-select) dans la page Routines/Index. 11 nouveaux tests. 237 tests total, 0 régression.
