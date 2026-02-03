# Story 1.2: Layout de Base et Navigation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **une interface claire avec navigation sidebar et breadcrumbs**,
So that **je peux naviguer facilement dans l'application**.

## Acceptance Criteria

**Given** le projet est initialisé
**When** je crée le Layout de base avec Ant Design
**Then** le composant Layout.tsx existe dans inertia/components/
**And** il utilise Ant Design Layout, Sider, Header, Content, Footer

**Given** le Layout existe
**When** je configure la Sidebar navigation
**Then** le Menu Ant Design est intégré dans Sider
**And** les sections principales sont visibles : Inventaire, Routines, Spectacles, Notes
**And** la Sidebar est persistante (toujours visible)

**Given** la navigation est configurée
**When** j'ajoute les Breadcrumbs contextuels
**Then** le composant Breadcrumb Ant Design est intégré dans Header
**And** le breadcrumb affiche le chemin de navigation actuel

**Given** le Layout est complet
**When** j'ajoute la structure de recherche globale Cmd+K
**Then** un Input.Search Ant Design est présent dans Header
**And** le placeholder indique "Rechercher... (Cmd+K ou Ctrl+K)"
**And** la structure est prête (sans logique de recherche encore)

**Given** le Layout est fonctionnel
**When** j'ajoute le composant FlashMessages
**Then** le composant FlashMessages.tsx utilise message Ant Design
**And** il gère les messages success, error, warning, info
**And** il affiche les flash messages de session Inertia

**Given** le Layout complet est créé
**When** j'applique le Layout à toutes les pages
**Then** toutes les pages Inertia utilisent le Layout
**And** la navigation fonctionne correctement
**And** les messages feedback s'affichent correctement

## Tasks / Subtasks

- [ ] Créer composant Layout.tsx avec Ant Design Layout (AC: 1)
  - [ ] Créer inertia/components/Layout.tsx
  - [ ] Importer Layout, Sider, Header, Content, Footer d'Ant Design
  - [ ] Structurer la page avec zones principales
  - [ ] Appliquer tokens Ant Design (padding: 16, margin: 16)

- [ ] Configurer Sidebar navigation persistante (AC: 2)
  - [ ] Intégrer Menu Ant Design dans Sider
  - [ ] Créer items de menu : Inventaire, Routines, Spectacles, Notes
  - [ ] Utiliser Link d'Inertia pour navigation SPA
  - [ ] Configurer Sider collapsible (optionnel mais recommandé UX)
  - [ ] Appliquer style cohérent (colorPrimary #1890ff)

- [ ] Ajouter Breadcrumbs contextuels (AC: 3)
  - [ ] Intégrer Breadcrumb Ant Design dans Header
  - [ ] Créer logique de génération breadcrumb basée sur route actuelle
  - [ ] Utiliser usePage() d'Inertia pour récupérer route/URL
  - [ ] Rendre breadcrumb cliquable avec navigation

- [ ] Ajouter structure recherche globale (AC: 4)
  - [ ] Intégrer Input.Search Ant Design dans Header
  - [ ] Configurer placeholder : "Rechercher... (Cmd+K ou Ctrl+K)"
  - [ ] Préparer structure pour logique de recherche (à implémenter dans Epic 3)
  - [ ] Positionner à droite du Header (design moderne)

- [ ] Créer composant FlashMessages (AC: 5)
  - [ ] Créer inertia/components/FlashMessages.tsx
  - [ ] Importer message d'Ant Design
  - [ ] Utiliser usePage() pour récupérer flash depuis shared Inertia data
  - [ ] Mapper flash.success, flash.error, flash.warning, flash.info
  - [ ] Utiliser useEffect pour déclencher messages au chargement

- [ ] Appliquer Layout à toutes les pages existantes (AC: 6)
  - [ ] Wrapper pages Auth (Login, Register) avec Layout
  - [ ] Wrapper page Home avec Layout
  - [ ] Tester navigation entre pages
  - [ ] Vérifier affichage breadcrumbs selon route
  - [ ] Vérifier flash messages affichés correctement

- [ ] Tests unitaires Layout et FlashMessages
  - [ ] Créer Layout.test.tsx (render, menu visible, breadcrumb)
  - [ ] Créer FlashMessages.test.tsx (affichage success, error, warning, info)
  - [ ] Lancer npm run test:front pour validation

## Dev Notes

### Architecture Patterns et Contraintes

**Layout Pattern (Architecture Required):**
- ✅ Layout = composant wrapper unique pour toute l'application
- ✅ Ant Design Layout + Sider + Header + Content + Footer
- ✅ Navigation persistante (Sidebar toujours visible)
- ✅ Breadcrumbs contextuels pour orientation utilisateur
- ✅ Header avec recherche globale (structure uniquement, logique en Epic 3)

**Navigation Pattern (Inertia + Ant Design):**
- ✅ Utiliser `Link` d'Inertia (pas `<a href>`) pour navigation SPA
- ✅ Menu Ant Design avec items cliquables
- ✅ Active item highlight automatique basé sur route actuelle
- ✅ Routes principales : /materials, /routines, /shows, /notes

**Flash Messages Pattern (Session → Inertia → Ant Design):**
- Backend (AuthController déjà fait) : `session.flash('success', 'Message')`
- Inertia : Flash messages passés via shared data
- Frontend : Composant FlashMessages utilise `message` d'Ant Design
- Types : success (vert), error (rouge), warning (orange), info (bleu)

**Tokens Ant Design à Respecter:**
- padding: 16 (espaces blancs généreux Apple-inspired)
- margin: 16
- colorPrimary: #1890ff (bleu primaire actions principales)
- borderRadius: 4

### Source Tree Components à Toucher

**Fichiers à créer:**
- `inertia/components/Layout.tsx` - Composant Layout principal
- `inertia/components/Layout.test.tsx` - Tests unitaires Layout
- `inertia/components/FlashMessages.tsx` - Composant flash messages
- `inertia/components/FlashMessages.test.tsx` - Tests flash messages

**Fichiers à modifier:**
- `inertia/pages/auth/login.tsx` - Wrapper avec Layout
- `inertia/pages/auth/register.tsx` - Wrapper avec Layout
- `inertia/pages/home.tsx` - Wrapper avec Layout

### Testing Standards Summary

**Frontend Tests (Vitest + @testing-library/react):**
- Tests co-localisés : `.test.tsx` à côté du fichier source
- Tester : Render composant, éléments visibles, interactions utilisateur
- Coverage minimal : Composants Layout et FlashMessages testés

**Pattern de test:**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Layout', () => {
  it('renders menu items', () => {
    render(<Layout><div>Content</div></Layout>)
    expect(screen.getByText('Inventaire')).toBeInTheDocument()
  })
})
```

### UX Design Principles (Critical for This Story)

**Navigation Sidebar Persistante (UX Design):**
- Sections toujours visibles : Inventaire, Routines, Spectacles, Notes
- Navigation 1-clic pour accès rapide
- Sidebar collapsible optionnel (améliore UX desktop)

**Breadcrumbs Contextuels (UX Design):**
- L'utilisateur sait toujours où il est
- Breadcrumb cliquable pour navigation rapide vers niveaux supérieurs
- Format : Accueil > Inventaire > [Nom matériel]

**Recherche Globale Cmd+K (UX Design):**
- Accessible partout, instantanée (< 500ms selon NFR2)
- Search-as-you-type (à implémenter en Epic 3 Story 3.7)
- Structure uniquement dans cette story (Input.Search visible mais sans logique)

**Espaces Blancs Généreux (UX Design Apple-inspired):**
- padding: 16, margin: 16 (tokens Ant Design)
- Interface aérée, respiration visuelle
- Pas de surcharge, clarté maximale

**Messages Feedback (UX Design):**
- Ant Design message component (success, error, warning, info)
- En français (NFR - validation messages)
- Auto-dismiss après 3 secondes

### Project Structure Notes

**Alignment avec Unified Project Structure:**
- ✅ Components réutilisables dans `inertia/components/`
- ✅ Tests co-localisés (`.test.tsx`)
- ✅ Layout wrapper appliqué à toutes pages
- ✅ Séparation composants (Layout) et pages (Auth, Home)

**Pas de Conflit Détecté:**
- Layout Ant Design s'intègre parfaitement dans inertia/components/
- Navigation Inertia Link compatible avec Menu Ant Design
- Flash messages Inertia → message Ant Design : pattern fluide

### Learnings from Previous Story (1-1)

**Story 1-1 Completion Notes (Critical Context):**
- ✅ Ant Design configuré dans `inertia/app/app.tsx` avec ConfigProvider et thème personnalisé
- ✅ Locale française (frFR) déjà appliquée globalement
- ✅ Tokens thème : colorPrimary #1890ff, padding 16, margin 16, borderRadius 4
- ✅ Navigation SPA via Link d'Inertia (correction de <a href> en review)
- ✅ Flash messages backend déjà implémentés dans AuthController (`session.flash()`)
- ✅ Typage TypeScript strict requis (pas de `any`)
- ✅ Tests Vitest validés avec 3 tests passants (setup.test.tsx)

**Files Created in Story 1-1 (Reference):**
- `app/controllers/auth_controller.ts` - Flash messages déjà utilisés
- `inertia/pages/auth/login.tsx` - À wrapper avec Layout
- `inertia/pages/auth/register.tsx` - À wrapper avec Layout
- `inertia/pages/home.tsx` - À wrapper avec Layout

**Code Patterns Established:**
- TypeScript strict : `interface LoginFormData { email: string; password: string }`
- Link Inertia : `import { Link } from '@inertiajs/react'`
- Tokens Ant Design : `style={{ padding: 16 }}` au lieu de CSS inline

**Problems Encountered & Solutions (Story 1-1):**
- ❌ Utilisation de `<a href>` → ✅ Solution : `Link` d'Inertia pour navigation SPA
- ❌ Typage `any` dans formulaires → ✅ Solution : Interfaces TypeScript strictes
- ❌ CSS inline → ✅ Solution : Tokens Ant Design

**Testing Approaches That Worked:**
- Vitest + @testing-library/react validés
- Tests co-localisés (setup.test.tsx)
- Pattern : render → screen.getByText → expect.toBeInTheDocument()

### Git Intelligence Summary

**Last 5 Commits Context:**
- 3c02ecc: Retire .claude et _bmad de l'index git (nettoyage)
- 9fffa20: Update .gitignore to exclude .claude and _bmad/* debugging files
- b26ddc8: Add base project configuration and initial setup files
- 5bb1107: Add epic breakdown and requirements document
- eaea31e: Add .gitignore and initial architecture documentation

**Recent Work Patterns:**
- Focus sur configuration projet de base (Story 1-1 complétée)
- Documentation planning artifacts (epics, architecture, UX design) tous générés
- Sprint status initialisé avec 1-1 marqué "done", 1-2 "backlog" (next)
- Pas de refactoring majeur récent, base stable pour construction Layout

**Files Modified in Last Commit (3c02ecc):**
- .env.example (corrections DB config)
- 1-1-initialisation-du-projet-et-configuration-de-base.md (story complétée)
- sprint-status.yaml (1-1 marqué done)
- app/controllers/auth_controller.ts (flash messages, validation VineJS)
- inertia/pages/auth/login.tsx, register.tsx (Link Inertia, typage strict)
- inertia/pages/home.tsx (personnalisé avec liens auth)
- package.json, package-lock.json (@ant-design/icons installé)

**Actionable Insights for Current Story:**
- Pages auth et home existent déjà → les wrapper avec Layout
- Flash messages backend prêts → connecter avec composant FlashMessages
- Navigation Inertia Link déjà utilisée → continuer pattern avec Menu
- Typage strict requis → créer interfaces pour props Layout

### Latest Technical Specifics

**Ant Design 6.2.2 (Latest Stable):**
- Layout API : `<Layout>`, `<Sider>`, `<Header>`, `<Content>`, `<Footer>`
- Menu API : `<Menu items={[...]} mode="inline" theme="light" selectedKeys={[currentKey]}/>`
- Breadcrumb API : `<Breadcrumb items={[{ title: 'Accueil' }, { title: 'Inventaire' }]} />`
- Input.Search API : `<Input.Search placeholder="Rechercher..." onSearch={handleSearch} />`
- message API : `message.success('Message')`, `message.error('Message')`, etc.

**Inertia.js (Latest React Adapter):**
- usePage hook : `const { props, url } = usePage()` pour récupérer route/flash
- Link component : `<Link href="/materials">Inventaire</Link>`
- Shared data : Flash messages disponibles via `props.flash`

**React 18 + TypeScript Patterns:**
- Functional components avec TypeScript : `interface LayoutProps { children: ReactNode }`
- useEffect pour side-effects : `useEffect(() => { if (flash.success) message.success(flash.success) }, [flash])`
- Props destructuring typé : `export default function Layout({ children }: LayoutProps) { }`

**Vitest + @testing-library/react (Latest):**
- render : `render(<Layout><div>Test</div></Layout>)`
- screen queries : `screen.getByText()`, `screen.getByRole()`
- Matchers : `expect(...).toBeInTheDocument()` (via @testing-library/jest-dom)

### References

**[Source: epics.md#Story 1.2]**
- Acceptance criteria BDD complets
- Context : Suite de Story 1-1, Layout nécessaire avant toute feature métier

**[Source: architecture.md#Component Architecture]**
- Structure : `inertia/components/Layout.tsx`
- Pattern : Wrapper unique pour toute l'application
- Tests co-localisés : `Layout.test.tsx`

**[Source: architecture.md#Implementation Patterns - Format Patterns]**
- Flash messages : success/error/warning/info types
- Messages en français : "Matériel ajouté avec succès"
- Pattern : `session.flash('success', 'Message')` → Inertia → Ant Design message

**[Source: ux-design-specification.md#Core User Experience]**
- Navigation Sidebar persistante : Sections toujours visibles
- Breadcrumbs contextuels : L'utilisateur sait toujours où il est
- Recherche globale Cmd+K : Accessible partout, instantanée
- Espaces blancs généreux : padding 16, margin 16 (Apple-inspired)

**[Source: ux-design-specification.md#Design System Foundation]**
- Ant Design 6.2.2 : Layout, Menu, Breadcrumb, Input.Search, message
- Tokens personnalisés : colorPrimary #1890ff, padding 16, borderRadius 4
- Locale française : frFR déjà configuré dans app.tsx

**[Source: 1-1-initialisation-du-projet-et-configuration-de-base.md#Dev Notes]**
- Ant Design ConfigProvider configuré dans app.tsx
- Flash messages backend dans AuthController
- Link Inertia pour navigation SPA
- Typage TypeScript strict requis

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story créée, prête pour développement

### Completion Notes List

N/A - Story en statut ready-for-dev

### File List

**Fichiers à créer:**
- inertia/components/Layout.tsx
- inertia/components/Layout.test.tsx
- inertia/components/FlashMessages.tsx
- inertia/components/FlashMessages.test.tsx

**Fichiers à modifier:**
- inertia/pages/auth/login.tsx
- inertia/pages/auth/register.tsx
- inertia/pages/home.tsx
