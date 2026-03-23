# Story 5.8: Recherche de Spectacles

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **rechercher mes spectacles par nom**,
so that **je peux trouver rapidement n'importe quelle prestation** (FR58).

## Acceptance Criteria

**Scenario 1 : Affichage de la barre de recherche**
- **Given** je suis sur /shows
- **When** la page se charge
- **Then** je vois la barre de recherche dans le toolbar

**Scenario 2 : Recherche par nom (search-as-you-type)**
- **Given** je tape dans la barre de recherche (FR58)
- **When** je tape "Cocktail"
- **Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
- **And** les résultats s'affichent en moins de 500ms
- **And** seuls les spectacles dont le nom contient "Cocktail" sont affichés
- **And** la recherche est case-insensitive

**Scenario 3 : Effacement de la recherche**
- **Given** la recherche est active
- **When** j'efface la barre de recherche
- **Then** tous les spectacles réapparaissent

## Tasks / Subtasks

### Frontend — Modifier `inertia/pages/Shows/Index.tsx` (AC: 1-3)

- [x] Ajouter les imports nécessaires (AC: 1-3)
  - [x] Ajouter `useMemo, useEffect` depuis `react` (en plus de `useState` existant)
  - [x] Ajouter `Input` depuis `antd` (en plus des imports existants : `Button, Card, Col, Empty, Pagination, Row, Space`)
- [x] Ajouter les états de recherche (AC: 2, 3)
  - [x] `const [searchInput, setSearchInput] = useState('')` — valeur affichée dans l'input
  - [x] `const [searchQuery, setSearchQuery] = useState('')` — valeur debouncée (300ms)
- [x] Implémenter le debounce 300ms avec useEffect (AC: 2)
  - [x] `useEffect(() => { const timer = setTimeout(() => setSearchQuery(searchInput), 300); return () => clearTimeout(timer) }, [searchInput])`
- [x] Implémenter `filteredShows` avec useMemo (AC: 2, 3)
  - [x] Filtrer par `searchQuery` : `s.name.toLowerCase().includes(q)` (case-insensitive)
  - [x] Retourner `shows` inchangé si `searchQuery` vide
- [x] Calculer `hasActiveSearch` (AC: 1)
  - [x] `const hasActiveSearch = searchQuery.trim() !== ''`
- [x] Mettre à jour le toolbar (AC: 1)
  - [x] Ajouter `Input.Search` dans le toolbar (à gauche du bouton "Créer un spectacle")
  - [x] Afficher le nombre de résultats quand la recherche est active
- [x] Mettre à jour la pagination (AC: 3, reset)
  - [x] Utiliser `filteredShows` pour le slice et le total : `filteredShows.slice(...)`, `total={filteredShows.length}`
  - [x] Ajouter `useEffect(() => { setPage(1) }, [filteredShows])` pour reset la pagination
- [x] Gérer l'état vide conditionnel (AC: 2, 3)
  - [x] Distinguer "aucun spectacle du tout" (`shows.length === 0`) vs "aucun résultat pour la recherche" (`filteredShows.length === 0 && shows.length > 0`)
  - [x] Ajouter `noResultsState` avec `Empty description="Aucun spectacle ne correspond à votre recherche"` et bouton "Réinitialiser la recherche"

### Tests — Modifier `inertia/pages/Shows/Index.test.tsx` (AC: 1-3)

- [x] Vérifier 0 régression sur les 13 tests existants
- [x] Test : affiche l'input de recherche dans le toolbar
- [x] Test : filtrage par nom (search-as-you-type) — mocker les timers avec `vi.useFakeTimers()`
  - [x] Saisir "Cocktail" → avancer le timer 300ms → seul "Spectacle Cocktail" affiché, "Soirée Mariage" absent
  - [x] Effacer → tous les spectacles réapparaissent
- [x] Test : Empty state "Aucun spectacle ne correspond" quand aucun résultat filtré
- [x] Test : reset pagination à la page 1 quand la recherche change (si manyShows)
- [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Approche Générale : Filtrage Client-Side (nom uniquement)

**⚠️ DÉCISION ARCHITECTURE MVP : Filtrage 100% côté frontend (in-memory)**

Même décision que Stories 3.7, 4.8 :
- Tous les spectacles sont déjà chargés en mémoire dans la prop `shows` (limite 200 en controller)
- Le filtrage in-memory est instantané (< 1ms pour des centaines d'items)
- Pas de modification backend nécessaire
- NFR2 (< 500ms) est largement respecté

**Story 5.8 est plus SIMPLE que 4.8 :** Uniquement recherche par nom — pas de Drawer, pas de filtre par catégorie (la prop `ShowItem` dans l'index ne contient pas de catégories).

**Fichiers à modifier :**
```
inertia/pages/Shows/Index.tsx        ← MODIFIER (ajout search + filteredShows)
inertia/pages/Shows/Index.test.tsx   ← MODIFIER (nouveaux tests search)
```

**Fichiers SANS modification :**
```
app/controllers/shows_controller.ts  ← INTOUCHER (index() déjà correct, .limit(200))
app/models/show.ts                   ← INTOUCHER
start/routes.ts                      ← INTOUCHER
inertia/components/Layout.tsx        ← INTOUCHER
database/migrations/*                ← INTOUCHER (pas de migration)
```

### 🏗️ Structure actuelle de `Index.tsx` (à comprendre avant de modifier)

Le composant actuel (84 lignes) :
- Props : `shows: ShowItem[]` avec `{ id, name, routinesCount, createdAt }`
- Un seul état : `const [page, setPage] = useState(1)` pour la pagination
- Vue Cards seulement
- `PAGE_SIZE = 12` → pagination `hideOnSinglePage`
- Toolbar actuel : `<h1>Mes Spectacles</h1>` + `<Button>Créer un spectacle</Button>`

[Source: inertia/pages/Shows/Index.tsx]

### 🔥 Pattern Critique — Debounce 300ms

Copier exactement de Stories 3.7 et 4.8 :

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

[Source: inertia/pages/Routines/Index.tsx — pattern identique (Story 4.8)]
[Source: inertia/pages/Materials/Index.tsx — pattern original (Story 3.7)]

### 🔥 Pattern Critique — `filteredShows` avec useMemo

Story 5.8 est encore plus simple que 4.8 (un seul critère) :

```typescript
const filteredShows = useMemo(() => {
  if (!searchQuery.trim()) return shows

  const q = searchQuery.toLowerCase()
  return shows.filter((s) => s.name.toLowerCase().includes(q))
}, [shows, searchQuery])
```

### 🔥 Pattern Critique — Toolbar avec Search + Compteur

```tsx
const hasActiveSearch = searchQuery.trim() !== ''

// Dans le render, remplacer le toolbar actuel :
<div
  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
>
  <Space>
    <h1 style={{ margin: 0 }}>Mes Spectacles</h1>
    {hasActiveSearch && (
      <span style={{ color: '#8c8c8c', fontSize: 14 }}>
        {filteredShows.length} résultat(s)
      </span>
    )}
  </Space>
  <Space>
    <Input.Search
      placeholder="Rechercher par nom..."
      value={searchInput}
      onChange={(e) => {
        setSearchInput(e.target.value)
        if (!e.target.value) setSearchQuery('') // effacement immédiat
      }}
      onSearch={(val) => { setSearchInput(val); setSearchQuery(val) }}
      allowClear
      style={{ width: 220 }}
    />
    <Button type="primary" onClick={() => router.visit('/shows/create')}>
      Créer un spectacle
    </Button>
  </Space>
</div>
```

### 🔥 Pattern Critique — Pagination avec filteredShows

```tsx
// Remplacer shows par filteredShows partout :
const paginatedShows = filteredShows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

// Reset page quand filtres changent :
useEffect(() => {
  setPage(1)
}, [filteredShows])

// Pagination :
<Pagination
  current={page}
  pageSize={PAGE_SIZE}
  total={filteredShows.length}  // ← WAS: shows.length
  onChange={(p) => setPage(p)}
  hideOnSinglePage
  style={{ textAlign: 'center', marginTop: 16 }}
/>
```

### 🔥 Pattern Critique — État vide conditionnel

```tsx
// 3 cas distincts :
// 1. Aucun spectacle du tout → emptyState original
// 2. Recherche active, aucun résultat → noResultsState
// 3. Spectacles présents, résultats filtrés → Cards + pagination

const noResultsState = (
  <Empty description="Aucun spectacle ne correspond à votre recherche">
    <Button
      onClick={() => {
        setSearchInput('')
        setSearchQuery('')
      }}
    >
      Réinitialiser la recherche
    </Button>
  </Empty>
)

// Dans le render :
{shows.length === 0 ? (
  <Empty description="Aucun spectacle créé">
    <Button type="primary" onClick={() => router.visit('/shows/create')}>
      Créer votre premier spectacle
    </Button>
  </Empty>
) : filteredShows.length === 0 ? (
  noResultsState
) : (
  <>
    <Row gutter={[16, 16]}>
      {paginatedShows.map((s) => (
        // ... cards inchangées
      ))}
    </Row>
    <Pagination ... total={filteredShows.length} ... />
  </>
)}
```

### 🔥 Pattern Tests — Debounce avec Fake Timers

```typescript
import { vi, describe, it, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'

describe('Recherche par nom', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('filtre par nom après debounce 300ms', async () => {
    render(<ShowsIndex shows={sampleShows} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
    // Avant le debounce : tous les spectacles encore affichés
    expect(screen.getByText('Soirée Mariage')).toBeDefined()
    // Avancer le timer
    act(() => vi.advanceTimersByTime(300))
    // Après le debounce : seul "Spectacle Cocktail" reste
    expect(screen.queryByText('Soirée Mariage')).toBeNull()
    expect(screen.getByText('Spectacle Cocktail')).toBeDefined()
  })

  it('efface la recherche → tous les spectacles réapparaissent', async () => {
    render(<ShowsIndex shows={sampleShows} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'Cocktail' } })
    act(() => vi.advanceTimersByTime(300))
    expect(screen.queryByText('Soirée Mariage')).toBeNull()
    // Effacer
    fireEvent.change(searchInput, { target: { value: '' } })
    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByText('Soirée Mariage')).toBeDefined()
  })
})
```

**⚠️ Utiliser `fireEvent` (pas `userEvent`) avec `vi.useFakeTimers()`** — `userEvent` est incompatible avec les fake timers. [Source: story 3.7 + 4.8 debug notes]

### ⚠️ Points d'Attention

**1. Pas de Drawer ni filtre par catégorie**
Story 5.8 (epics.md) n'inclut que la recherche par nom. La prop `ShowItem` dans `Index.tsx` ne contient pas de catégories (`{ id, name, routinesCount, createdAt }`). Pas de Drawer à ajouter.

**2. Effacement immédiat de la recherche**
Ajouter dans `onChange` :
```typescript
if (!e.target.value) setSearchQuery('') // effacement immédiat sans attendre 300ms
```
Alternative équivalente : `onSearch` avec `allowClear` efface aussi immédiatement si `setSearchQuery('')` est dans `onSearch`.

**3. `useEffect` sur `filteredShows` pour reset page — sûr car useMemo**
`filteredShows` est calculé par `useMemo` → ne change de référence que quand `shows` ou `searchQuery` changent. Pas de boucle infinie.

**4. Controller `index()` déjà prêt — aucune modification**
`shows_controller.ts` `index()` charge toutes les shows avec `.limit(200)` et les sérialise avec `id, name, routinesCount, createdAt`. Pas de changement backend. [Source: app/controllers/shows_controller.ts#10-25]

**5. Nombre de tests attendus après implémentation**
Base actuelle : 314 tests (post-Story 5.7 + code review).
Shows/Index.test.tsx actuel : 13 tests.
Nouveaux tests à ajouter : ~5 (input présent, filtre debounce, efface, no results empty state, reset pagination).
Total attendu : environ **319 tests** (314 + 5), 0 régression.

**6. `sampleShows` existant dans les tests est déjà bien nommé**
`sampleShows` contient "Spectacle Cocktail" (id: 1) et "Soirée Mariage" (id: 2) — parfait pour tester la recherche "Cocktail".

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
inertia/pages/Shows/Index.tsx        ← Ajout search + filteredShows + noResultsState
inertia/pages/Shows/Index.test.tsx   ← Nouveaux tests search

Fichiers NON modifiés :
app/controllers/shows_controller.ts  ← INTOUCHER (index() déjà prêt)
app/models/show.ts                   ← INTOUCHER
start/routes.ts                      ← INTOUCHER
inertia/components/Layout.tsx        ← INTOUCHER
database/migrations/*                ← INTOUCHER (pas de migration)
```

### 📝 Learnings des Stories Précédentes

**Story 4.8 (recherche routines — pattern maître) :**
- Debounce 300ms : 2 états séparés `searchInput` / `searchQuery` + `useEffect`
- `filteredRoutines` avec `useMemo` (AND entre critères)
- Reset pagination via `useEffect([filteredRoutines])`
- `fireEvent` (pas `userEvent`) avec `vi.useFakeTimers()`
- Pattern emprunté de Story 3.7 (recherche matériels)

**Story 3.7 (recherche matériels — pattern original) :**
- `virtual={false}` sur les Selects Drawer = OBLIGATOIRE (jsdom) — non pertinent pour 5.8 (pas de Drawer)
- 41 tests dont 13 nouveaux pour la recherche/filtrage

**Story 5.7 (suppression spectacle — dernier état) :**
- 314 tests passants (post code review)
- `vi.clearAllMocks()` dans `beforeEach` déjà en place dans Show.test.tsx (et dans Index.test.tsx ligne 30)

### Project Structure Notes

- Filtrage client-side cohérent avec Stories 3.7 et 4.8 (même décision MVP)
- Pas de nouvelle route, pas de nouvelle migration, pas de nouveau validator
- Approche la plus simple possible : 1 seul critère de filtrage (nom)
- Pas de Drawer ni badge filtre (contrairement à 4.8) — confirme l'implémentation minimaliste

### References

- Story 4.8 (pattern maître recherche routines) : [Source: _bmad-output/implementation-artifacts/4-8-recherche-et-filtrage-des-routines.md]
- Story 3.7 (pattern original recherche matériels) : [Source: _bmad-output/implementation-artifacts/3-7-recherche-et-filtrage-multi-criteres-inventaire.md]
- Shows/Index.tsx existant : [Source: inertia/pages/Shows/Index.tsx]
- Shows/Index.test.tsx existant (13 tests) : [Source: inertia/pages/Shows/Index.test.tsx]
- shows_controller.ts index() : [Source: app/controllers/shows_controller.ts#10-25]
- Epic 5 Story 5.8 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.8 (ligne 1741)]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage rencontré. Pattern debounce/useMemo identique aux stories 3.7 et 4.8.

### Completion Notes List

- Implémenté la recherche client-side par nom dans `Shows/Index.tsx` : 2 états séparés (`searchInput` / `searchQuery`), debounce 300ms via useEffect, `filteredShows` via useMemo, reset pagination via useEffect.
- Toolbar mis à jour avec `Input.Search` + compteur de résultats conditionnel (`hasActiveSearch`).
- État vide conditionnel : 3 cas distincts (aucun spectacle, aucun résultat filtré, résultats présents).
- 7 nouveaux tests ajoutés dans `Index.test.tsx` (total 19 tests shows) ; `fireEvent` utilisé (pas `userEvent`) avec `vi.useFakeTimers()`.
- Code review fixes : test pagination reset corrigé (single render + navigation page 2), effacement immédiat validé sans timer, compteur résultats testé, `noResultsState` inliné.
- Suite complète : 321 tests passent, 0 régression.

### File List

- inertia/pages/Shows/Index.tsx
- inertia/pages/Shows/Index.test.tsx

## Senior Developer Review (AI)

**Date:** 2026-03-23
**Outcome:** Approve (après corrections)
**Action Items:** 5 trouvés, 5 résolus

### Action Items

- [x] [High] Test "reset pagination" double render — test fantôme vacueux (Index.test.tsx:147)
- [x] [Medium] Effacement immédiat non validé — test avançait le timer même après clear (Index.test.tsx:126)
- [x] [Medium] Compteur résultats non testé — `{filteredShows.length} résultat(s)` sans couverture (Index.tsx:67)
- [x] [Low] `noResultsState` défini inline dans le corps — recréé à chaque render (Index.tsx:46)
- [x] [Low] `onSearch` / `allowClear` non testés (Index.tsx:78)

## Change Log

- 2026-03-23 : Story 5.8 implémentée — ajout recherche par nom (search-as-you-type, debounce 300ms, filteredShows useMemo, pagination reset, empty state conditionnel) dans Shows/Index.tsx + 5 nouveaux tests dans Index.test.tsx (319 tests total, 0 régression).
- 2026-03-23 : Code review fixes — 5 problèmes corrigés : test pagination reset réécrit, test effacement immédiat, test compteur résultats, `noResultsState` inliné (321 tests, 0 régression).
