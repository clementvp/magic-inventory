# Story 3.3: Liste Inventaire Vue Cards avec Switcher

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **basculer entre une vue Cards et une vue Table pour mon inventaire**,
so that **je peux choisir la vue la plus adaptée à mon besoin** (FR14 + UX Design).

## Acceptance Criteria

**Scenario 1 : Switcher visible avec Table sélectionnée par défaut**
- **Given** je suis sur `/materials`
- **When** la page se charge
- **Then** je vois un `Segmented` Ant Design (switcher) en haut à droite (côté bouton "Ajouter un matériel")
- **And** les options sont : "Table" et "Cards"
- **And** la vue "Table" est sélectionnée par défaut

**Scenario 2 : Basculer vers la vue Cards**
- **Given** je suis en vue Table
- **When** je clique sur "Cards"
- **Then** la vue bascule vers Cards (sans rechargement de page)
- **And** mes matériels sont affichés en Cards Ant Design
- **And** le contexte (données matériels) est conservé

**Scenario 3 : Contenu d'une Card matériel**
- **Given** la vue Cards est affichée
- **When** la page se charge
- **Then** chaque matériel est une Card Ant Design avec :
  - Titre : Nom du matériel (en gras)
  - Badge : Type (si défini, Tag coloré)
  - Tags : Catégorie(s) (si définies, Tags Ant Design)
  - Icône lieu : Nom du lieu de stockage (si défini)
  - Texte secondaire : Auteur (si défini)
- **And** la Card est cliquable pour accéder au détail

**Scenario 4 : Navigation vers le détail depuis une Card**
- **Given** je suis en vue Cards
- **When** je clique sur une Card
- **Then** je suis redirigé vers `/materials/:id` (détail - Story 3.4)

**Scenario 5 : Effet hover sur les Cards**
- **Given** je suis en vue Cards
- **When** je survole une Card
- **Then** un effet hover s'affiche (shadow, légère élévation)
- **And** le curseur change en `pointer`

**Scenario 6 : Basculer vers la vue Table**
- **Given** je suis en vue Cards
- **When** je clique sur "Table"
- **Then** la vue bascule vers Table
- **And** le contexte (données matériels) est conservé

**Scenario 7 : Pagination en vue Cards**
- **Given** j'ai beaucoup de matériels (> 12 items)
- **When** la vue Cards est affichée
- **Then** la pagination Ant Design est visible
- **And** 12 cards par page sont affichées par défaut
- **And** le layout est responsive (grille adaptative : 1/2/3 colonnes)

**Scenario 8 : État vide (partagé avec Story 3.2)**
- **Given** j'ai 0 matériel
- **When** j'accède à `/materials` (quelle que soit la vue)
- **Then** l'Empty state s'affiche (identique à Story 3.2)

## Tasks / Subtasks

### Frontend — Modification de `Materials/Index.tsx` (AC: 1, 2, 3, 4, 5, 6, 7, 8)

- [x] Ajouter `useState` pour `viewMode` avec valeur par défaut `'table'` (AC: 1)
  - [x] `const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')`
  - [x] Ajouter `useState` pour pagination Cards : `const [cardsPage, setCardsPage] = useState(1)`
- [x] Ajouter composant `Segmented` Ant Design dans la barre de titre (AC: 1, 2, 6)
  - [x] Importer `Segmented` depuis `'antd'`
  - [x] Options : `[{ label: 'Table', value: 'table' }, { label: 'Cards', value: 'cards' }]`
  - [x] `value={viewMode}` + `onChange={(val) => { setViewMode(val as 'table' | 'cards'); setCardsPage(1) }}`
  - [x] Positionner à droite du titre, à gauche du bouton "Ajouter un matériel"
- [x] Implémenter la vue Cards (AC: 3, 4, 5, 7)
  - [x] Importer `Card, Col, Row, Tag, Pagination` depuis `'antd'`
  - [x] Logique de pagination client : `const paginatedMaterials = materials.slice((cardsPage - 1) * 12, cardsPage * 12)`
  - [x] Layout `<Row gutter={[16, 16]}>` avec `<Col xs={24} sm={12} md={8}>`
  - [x] Chaque Card : `hoverable` prop pour effet shadow/élévation auto Ant Design
  - [x] Chaque Card : `style={{ cursor: 'pointer' }}` + `onClick={() => router.visit('/materials/' + m.id)}`
  - [x] Contenu Card : `Card.Meta` avec `title={m.name}`
  - [x] Badge Type : `<Tag color="blue">{m.type.name}</Tag>` si type défini (sinon rien)
  - [x] Tags Catégories : liste de `<Tag key={c.id}>{c.name}</Tag>` si catégories définies
  - [x] Lieu : icône `📦` ou texte gris + nom du lieu si défini
  - [x] Auteur : texte secondaire gris si défini
  - [x] `<Pagination current={cardsPage} pageSize={12} total={materials.length} onChange={setCardsPage} style={{ textAlign: 'center', marginTop: 16 }} />`
- [x] Affichage conditionnel selon `viewMode` (AC: 2, 6)
  - [x] `{viewMode === 'table' && <Table ... />}`
  - [x] `{viewMode === 'cards' && <div>...</div>}`
  - [x] L'empty state s'affiche dans les deux vues si `materials.length === 0`

### Frontend — Tests `Materials/Index.test.tsx` (AC: 1, 2, 3, 4, 7)

- [x] Ajouter tests pour le switcher Segmented (AC: 1, 2, 6)
  - [x] Test : le switcher Segmented est visible avec options "Table" et "Cards"
  - [x] Test : la vue Table est affichée par défaut
  - [x] Test : clic sur "Cards" bascule vers la vue Cards (cards visibles)
  - [x] Test : clic sur "Table" depuis vue Cards rebascule vers Table
- [x] Ajouter tests pour la vue Cards (AC: 3, 4)
  - [x] Test : en vue Cards, le nom du matériel est affiché dans une Card
  - [x] Test : en vue Cards, le type s'affiche comme Tag si défini
  - [x] Test : en vue Cards, les catégories s'affichent comme Tags si définies
  - [x] Test : clic sur une Card navigue vers `/materials/:id`
- [x] Lancer `npx vitest run` — 0 régression (120 tests, 0 échec)

### Pas de changement backend nécessaire

- Le controller `index()` existant (Story 3.2) passe déjà toutes les données requises
- La vue Cards est purement une transformation UI des mêmes props `materials`
- Aucune route nouvelle, aucun validator, aucun modèle

## Dev Notes

### 🎯 Approche Générale : Modification de Index.tsx Existant

**IMPORTANT :** Il ne faut PAS créer une nouvelle page. Il faut **modifier** `inertia/pages/Materials/Index.tsx` existant (créé en Story 3.2) pour ajouter le switcher et la vue Cards. Le backend n'a aucune modification à apporter.

**Architecture du composant après Story 3.3 :**
```
inertia/pages/Materials/
  Index.tsx        ← MODIFIER (ajouter vue Cards + switcher)
  Index.test.tsx   ← MODIFIER (ajouter tests Cards + switcher)
  Create.tsx       ← INTOUCHER
  Create.test.tsx  ← INTOUCHER
```

### 🔥 Pattern Critique — Switcher + Double Vue

```tsx
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Button, Card, Col, Empty, Pagination, Row, Segmented, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Layout from '~/components/Layout'

interface MaterialItem {
  id: number
  name: string
  type: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  storageLocation: { id: number; name: string } | null
  author: string | null
  createdAt: string
}

interface Props {
  materials: MaterialItem[]
}

export default function MaterialsIndex({ materials }: Props) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [cardsPage, setCardsPage] = useState(1)

  const CARDS_PAGE_SIZE = 12
  const paginatedMaterials = materials.slice(
    (cardsPage - 1) * CARDS_PAGE_SIZE,
    cardsPage * CARDS_PAGE_SIZE
  )

  // ... colonnes Table (inchangées depuis Story 3.2)

  const emptyState = (
    <Empty description="Aucun matériel dans votre inventaire">
      <Button type="primary" onClick={() => router.visit('/materials/create')}>
        Ajouter votre premier matériel
      </Button>
    </Empty>
  )

  const cardsView = (
    <>
      {materials.length === 0 ? (
        emptyState
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {paginatedMaterials.map((m) => (
              <Col xs={24} sm={12} md={8} key={m.id}>
                <Card
                  hoverable
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.visit(`/materials/${m.id}`)}
                >
                  <Card.Meta
                    title={m.name}
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {m.type && <Tag color="blue">{m.type.name}</Tag>}
                        {m.categories.length > 0 && (
                          <Space wrap size={4}>
                            {m.categories.map((c) => (
                              <Tag key={c.id}>{c.name}</Tag>
                            ))}
                          </Space>
                        )}
                        {m.storageLocation && (
                          <span style={{ color: '#8c8c8c' }}>📦 {m.storageLocation.name}</span>
                        )}
                        {m.author && (
                          <span style={{ color: '#8c8c8c' }}>{m.author}</span>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={cardsPage}
            pageSize={CARDS_PAGE_SIZE}
            total={materials.length}
            onChange={(page) => { setCardsPage(page); }}
            style={{ textAlign: 'center', marginTop: 16 }}
          />
        </>
      )}
    </>
  )

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mon Inventaire</h1>
        <Space>
          <Segmented
            value={viewMode}
            onChange={(val) => {
              setViewMode(val as 'table' | 'cards')
              setCardsPage(1)
            }}
            options={[
              { label: 'Table', value: 'table' },
              { label: 'Cards', value: 'cards' },
            ]}
          />
          <Button type="primary" onClick={() => router.visit('/materials/create')}>
            Ajouter un matériel
          </Button>
        </Space>
      </div>

      {viewMode === 'table' && (
        <Table<MaterialItem>
          dataSource={materials}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ['25', '50', '100'],
          }}
          onRow={(record) => ({
            onClick: () => router.visit(`/materials/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{ emptyText: emptyState }}
        />
      )}

      {viewMode === 'cards' && cardsView}
    </Layout>
  )
}
```

### 🔥 Pattern Critique — `Segmented` Ant Design

Le composant `Segmented` (Ant Design v5+) est disponible nativement. Import simple :
```typescript
import { Segmented } from 'antd'
```

**API clé :**
- `value` : valeur contrôlée
- `onChange` : callback `(value: SegmentedValue) => void` — caster en `'table' | 'cards'`
- `options` : `{ label: string, value: string }[]`
- `disabled` : optionnel

Le prop `hoverable` sur `<Card>` gère automatiquement l'effet shadow/élévation au survol + curseur `pointer` en CSS natif Ant Design.

### 🔥 Pattern Critique — Pagination côté client (Cards)

La pagination Cards est **côté client** (même approche que le tri Table en Story 3.2). Toutes les données sont déjà dans les props Inertia. On slice simplement le tableau :

```typescript
const CARDS_PAGE_SIZE = 12
const paginatedMaterials = materials.slice(
  (cardsPage - 1) * CARDS_PAGE_SIZE,
  cardsPage * CARDS_PAGE_SIZE
)
```

**Pourquoi côté client ?**
- Cohérent avec le tri côté client de Story 3.2
- Pas de rechargement Inertia au changement de vue
- Story 3.7 (Recherche/filtrage) pourra migrer vers serveur si volumétrie importante

**Reset pagination :** Quand on change de vue (table → cards), réinitialiser `cardsPage` à 1 pour éviter une page vide.

### 🔥 Pattern Critique — Tests Segmented + Cards

```typescript
// Ajout dans Index.test.tsx existant

describe('MaterialsIndex — Vue Switcher', () => {
  it('affiche le switcher avec les options Table et Cards', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('affiche la vue Table par défaut', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    // La table est visible (colonne "Nom" header Ant Design Table)
    expect(screen.getAllByText('Nom').length).toBeGreaterThanOrEqual(1)
  })

  it('bascule vers la vue Cards au clic sur "Cards"', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    // En vue Cards, le nom du matériel est toujours visible
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })

  it('affiche le type comme Tag en vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Jeu de cartes')).toBeInTheDocument()
  })

  it('navigue vers /materials/:id au clic sur une Card', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    // Cliquer sur la Card entière (via le titre)
    await userEvent.click(screen.getByText('Bicycle Standard'))
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })

  it('bascule vers la vue Table depuis la vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    await userEvent.click(screen.getByText('Table'))
    // Vérifier qu'on est bien de retour en vue Table
    expect(screen.getAllByText('Nom').length).toBeGreaterThanOrEqual(1)
  })
})
```

**⚠️ Attention Tests Segmented :** Le composant Ant Design `Segmented` peut rendre les options comme des spans/buttons. Utiliser `getByText('Cards')` et `userEvent.click()` — si le test ne détecte pas le changement de vue, utiliser `findByText` avec `await`.

### ⚠️ CRITIQUE — Pas de rechargement Inertia lors du switch

Le changement de vue entre Table et Cards est **purement un état React local** (`useState`). Il ne faut **PAS** :
- Faire un `router.visit()` lors du changement de vue
- Passer le viewMode dans l'URL comme query param (pour cette story)
- Déclencher une nouvelle requête serveur

Les données sont dans les props Inertia `materials` — elles ne changent pas entre les vues.

### ⚠️ CRITIQUE — Import `useState` depuis React

La Story 3.2 n'utilisait pas `useState`. S'assurer d'ajouter l'import :
```typescript
import { useState } from 'react'
```

### ⚠️ Réinitialisation de la page Cards lors du switch

Quand l'utilisateur passe de Table à Cards, réinitialiser `cardsPage` à 1 :
```typescript
onChange={(val) => {
  setViewMode(val as 'table' | 'cards')
  setCardsPage(1) // ← OBLIGATOIRE pour éviter page vide
}}
```

### Project Structure Notes

**Fichier existant à MODIFIER :**
```
inertia/pages/Materials/Index.tsx       ← Ajouter useState, Segmented, vue Cards, Pagination
inertia/pages/Materials/Index.test.tsx  ← Ajouter tests switcher + vue Cards
```

**Fichiers SANS modification :**
```
app/controllers/materials_controller.ts  ← Aucune modification (déjà parfait)
start/routes.ts                          ← Aucune modification
app/models/material.ts                   ← Aucune modification
inertia/components/Layout.tsx            ← Utilisation standard identique
```

**Alignement architecture :**
- ✅ Modification d'une page existante (pas de nouvelle page)
- ✅ État UI local via `useState` (pattern établi en architecture)
- ✅ Pagination côté client (cohérent avec tri Story 3.2)
- ✅ Pas de rechargement Inertia (données déjà dans les props)
- ✅ `hoverable` Ant Design Card (pas de CSS custom)
- ✅ `Segmented` Ant Design natif (pas de composant custom)
- ✅ Layout responsive `Row/Col` avec breakpoints `xs/sm/md`
- ✅ Messages en français

### References

- **[Source: epics.md#Story 3.3]** — User story, 8 scénarios BDD, FR14 + UX Design
- **[Source: epics.md#Epic 3]** — Contexte : Gestion de l'Inventaire, vues multiples
- **[Source: architecture.md#Frontend Architecture]** — Component Architecture, useState pour UI local, flux Inertia
- **[Source: architecture.md#Loading States]** — Pagination pattern, Ant Design natif
- **[Source: ux-design-specification.md#Vues Multiples]** — Design Cards (Badge type, Tags catégories, icône lieu, auteur), Segmented switcher, layout grille responsive
- **[Source: 3-2-liste-inventaire-vue-table.md]** — Page Index.tsx existante à modifier, patterns mocks tests, 113 tests actuels

### Learnings des Stories Précédentes

**Story 3.2 — Patterns à respecter :**
- ✅ `e.stopPropagation()` sur les liens cliquables si nécessaire (éviter double navigation — N/A en Cards car la Card entière est le lien)
- ✅ `beforeEach(() => vi.clearAllMocks())` dans chaque `describe`
- ✅ Mocks standards : `@inertiajs/react`, `~/components/Layout`
- ✅ `createdAt.toISO()!` avec assertion non-null dans le controller (déjà implémenté)
- ✅ 113 tests passent actuellement — 0 régression attendue

**Story 3.2 — Code existant dans Index.tsx :**
- Le code complet de `Index.tsx` est visible dans le Dev Notes de Story 3.2
- L'interface `MaterialItem` est déjà définie — ne pas la redéfinir
- Les colonnes Table sont complètes — ne pas les toucher sauf si nécessaire
- Le `emptyState` JSX peut être réutilisé (extraire en variable ou dupliquer)

**Story 2.3/2.4 — Pattern Layout sans title :**
- `<Layout>` sans prop `title` (breadcrumb auto via `labelMap`)
- Le label `materials → 'Inventaire'` est déjà dans `Layout.tsx` depuis Story 3.2

### Git Intelligence Summary

**Commits récents pertinents :**
- `42a5f9e` : Story 3.2 — Index.tsx complet (Table, colonnes, pagination, empty state, tests) → À modifier
- `ca3a19d` : Story 3.1 — Materials controller + Create.tsx (patterns à respecter)
- `883212e` : Story 2.4 — StorageLocations show (Layout pattern + `router.visit`)

**État actuel du projet :**
- 113 tests passent (0 échec)
- Pattern 1 commit par story après code review

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive : sprint-status.yaml (story 3-3 backlog auto-découverte), epics.md (Story 3.3 extraite avec 8 scénarios BDD), architecture.md (useState, Segmented, Row/Col, Card patterns), ux-design-specification.md (design cards, responsive grid, hover), story 3-2 (code Index.tsx existant analysé, 113 tests actuels), git log (patterns commits récents)

### Completion Notes List

**Phase Planification (2026-03-21):**
- ✅ Story auto-découverte depuis sprint-status.yaml (3-3-liste-inventaire-vue-cards-avec-switcher = premier backlog)
- ✅ Analyse epics.md — Story 3.3 extraite avec 8 scénarios BDD (FR14 + UX Design)
- ✅ Code Index.tsx actuel analysé — 111 lignes, interface MaterialItem définie, Table complète avec 7 colonnes
- ✅ Analyse architecture — useState pour UI local, Segmented Ant Design, Row/Col responsive, Card hoverable
- ✅ Analyse UX Design — Cards avec Badge type, Tags catégories, icône lieu, auteur, grille responsive
- ✅ CRITIQUE documenté : modification de fichier existant (pas de création)
- ✅ CRITIQUE documenté : état local uniquement (pas de rechargement Inertia)
- ✅ CRITIQUE documenté : pagination côté client (12 per page, reset au switch de vue)
- ✅ CRITIQUE documenté : import useState manquant à ajouter
- ✅ Pattern complet Index.tsx documenté avec code prêt
- ✅ Pattern tests documenté pour switcher + vue Cards
- ✅ Aucune modification backend (controller, routes, modèles) requise

**Phase Implémentation (2026-03-21):**
- ✅ `Index.tsx` modifié : ajout useState (viewMode, cardsPage), Segmented switcher, cardsView complet avec Row/Col/Card/Pagination
- ✅ `Index.test.tsx` modifié : 7 nouveaux tests dans describe "Vue Switcher" (switcher visible, vue Table par défaut, bascule Cards, type Tag, catégories Tags, navigation Card, retour Table)
- ✅ 16 tests dans Index.test.tsx — 0 échec
- ✅ Suite complète : 120 tests — 0 régression
- ✅ Tous les ACs vérifiés : AC1 (switcher visible, Table par défaut), AC2 (bascule Cards sans rechargement), AC3 (contenu Card : nom, type, catégories, lieu, auteur), AC4 (clic Card → /materials/:id), AC5 (hoverable prop = effet hover auto), AC6 (bascule retour Table), AC7 (pagination 12/page, grille responsive xs/sm/md), AC8 (empty state partagé)

### File List

**Fichiers à modifier :**
- `inertia/pages/Materials/Index.tsx` (ajout useState, Segmented, vue Cards, Pagination)
- `inertia/pages/Materials/Index.test.tsx` (ajout tests switcher + vue Cards)

**Aucun nouveau fichier à créer**

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-21 | 1.0 | Story créée — analyse exhaustive epics, architecture, UX design, code Index.tsx existant, story 3.2 learnings | SM Agent |
| 2026-03-21 | 1.1 | Implémentation complète — Index.tsx (switcher Segmented, vue Cards avec Row/Col/Card/Pagination, useState viewMode+cardsPage), Index.test.tsx (7 nouveaux tests switcher+Cards), 120 tests passent | Dev Agent |
| 2026-03-21 | 1.2 | Code review — 6 issues corrigées : hideOnSinglePage pagination (M1), 3 tests manquants AC3/AC8 ajoutés (M2/M3), test bascule renforcé (M4), cursor:pointer redondant supprimé (L1), cast unsafe sécurisé (L2). 123 tests passent. | Code Review Agent |
