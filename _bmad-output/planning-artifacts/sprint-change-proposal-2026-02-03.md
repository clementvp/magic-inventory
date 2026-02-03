# Sprint Change Proposal - Landing Page Publique

**Date:** 2026-02-03
**Project:** magic-inventory
**Epic Affected:** Epic 1 - Authentification et Accès Sécurisé
**Submitted by:** Bob (Scrum Master)
**Status:** Approved by Clement

---

## Section 1: Issue Summary

### Problem Statement

**Absence d'une page d'accueil publique (landing page) dans Epic 1 - Authentification et Accès Sécurisé**

### Discovery Context

- **When:** Lors de la préparation/revue d'Epic 1 avant développement de Story 1-2
- **How:** Constat que les visiteurs non-connectés n'ont pas de point d'entrée clair vers `/register` ou `/login`
- **Category:** Misunderstanding of original requirements (oubli de planification)

### Detailed Description

La planification actuelle d'Epic 1 couvre :
- ✅ Story 1-1 : Initialisation projet + config de base (`done`)
- ✅ Story 1-2 : Layout et navigation pour utilisateurs **connectés** (`ready-for-dev`)
- ✅ Story 1-3 : Pages Register et Login (formulaires d'authentification)
- ✅ Stories 1-4 à 1-6 : Gestion profil, RGPD

**Gap identifié :**
- ❌ **Aucune page d'accueil publique** (`/`) pour visiteurs non-connectés
- ❌ **Pas de point d'entrée** vers Register/Login clairement défini
- ❌ **Pas de présentation** de magic-inventory pour nouveaux visiteurs

### Evidence

**1. PRD (prd.md)**
- Parcours 1 (Onboarding) ne mentionne pas comment Marc accède à Register
- Le parcours assume un point d'entrée mais ne le décrit jamais

**2. Epics (epics.md)**
- Story 1-1 : Initialisation → Auth de base (register, login, logout) du starter
- Story 1-2 : Layout + Navigation → **Pour utilisateurs CONNECTÉS** (Sidebar Inventaire/Routines/Spectacles)
- Story 1-3 : Personnalisation Register/Login → Mais ne dit pas comment on y accède depuis `/`
- **Gap confirmé** : Aucune story ne couvre la page racine `/` pour visiteurs non-connectés

**3. Architecture (architecture.md)**
- Routes définies : `/login`, `/register`, `/dashboard`
- ❌ **Pas de route `/` (root)** explicitement mentionnée ou personnalisée

**4. UX Design (ux-design-specification.md)**
- Principes UX définis pour utilisateurs **connectés** (Sidebar, Breadcrumbs, Cmd+K)
- ❌ **Aucune mention** d'une landing page publique ou d'expérience visiteur non-connecté

**5. Sprint Status (sprint-status.yaml)**
- Epic 1 : `in-progress`
- Story 1-1 : `done` (Initialisation projet)
- Story 1-2 : `ready-for-dev` (Layout pour users connectés, PAS pour visiteurs)

### User Impact

Sans landing page, les nouveaux visiteurs ne peuvent pas :
- Découvrir ce qu'est magic-inventory
- Comprendre la value proposition ("Organisez la magie")
- Accéder facilement aux fonctionnalités Register/Login

---

## Section 2: Impact Analysis

### Epic Impact

**Epic 1 : Authentification et Accès Sécurisé**
- **Status:** `in-progress`
- **Can be completed as planned?** ❌ Non, modification requise
- **Modification needed:** Story 1-2 étendue pour inclure page d'accueil publique

**Story 1-2 - Changes Required:**
- **Current title:** "Layout de Base et Navigation"
- **New title:** "Page d'Accueil Publique, Layout et Navigation"
- **New AC added:**
  - Page racine `/` pour visiteurs non-connectés
  - Présentation magic-inventory (nom, slogan, description)
  - Boutons "S'inscrire" (primary) et "Se connecter" (default)
  - Redirection automatique vers `/dashboard` si user déjà connecté
- **Existing AC:** Inchangés (Layout, Sidebar, Breadcrumbs pour users connectés)

**Future Epics (2-6):**
- ❌ Aucun impact (fonctionnalités internes pour users connectés)

**Epic Order & Priority:**
- ✅ Inchangés

### Artifact Conflicts

#### PRD (prd.md)
- ✅ **No conflict** with objectives or requirements
- ✅ **Improvement:** Fills implicit onboarding gap
- ✅ **MVP achievable** and coherent
- ✅ **No modification** (Clement's decision)

#### Architecture (architecture.md)
- ✅ **No conflict** with stack or patterns
- ⚠️ **Additions required:**
  - Route `/` publique (HomeController.index)
  - HomeController backend
  - Page `Home/Index.tsx` frontend
- ⚠️ **Update required:** Routes section + project structure

**Specific changes:**
1. Add route `/` → HomeController.index
2. Add `app/controllers/home_controller.ts`
3. Add `inertia/pages/Home/Index.tsx` + `Index.test.tsx`

#### UX Design (ux-design-specification.md)
- ✅ **No conflict** with principles or design system
- ✅ **Natural integration** into emotional journey
- ⚠️ **Update required:** Add landing page section (Clement's decision)

**Specific changes:**
- Add landing page specification in "Platform Strategy" section
- Define design principles (sober, professional, Apple-inspired)
- Specify call-to-action and navigation

#### Secondary Artifacts
- ✅ Tests to add: `Home/Index.test.tsx`
- ✅ Deployment, IaC, CI/CD: No impact

### Technical Impact

**Backend:**
- New controller: `HomeController` with `index()` method
- Logic: Render landing page OR redirect to `/dashboard` if authenticated

**Frontend:**
- New page: `Home/Index.tsx` (public landing page)
- Design: Ant Design components with custom tokens
- Layout: No Sidebar (public layout ≠ authenticated layout)

**Tests:**
- `Home/Index.test.tsx`: Component tests
- Navigation tests: Visitor → clicks "S'inscrire" → redirected to `/register`
- Redirect tests: Authenticated user → redirected to `/dashboard`

**Effort Estimate:** 4-6 hours (LOW)

**Risk Level:** LOW (simple public page, standard stack)

---

## Section 3: Recommended Approach

### Selected Path: Option 1 - Direct Adjustment

**Description:**
Modify Story 1-2 (currently `ready-for-dev`) to include public landing page.

### Rationale

#### 1. Implementation Effort & Timeline Impact
- ✅ **LOW effort:** 4-6 hours (simple HomeController + React page)
- ✅ **No delay:** Story 1-2 not started, modification before dev
- ✅ **Logical cohesion:** Landing + Layout naturally go together

#### 2. Technical Risk & Complexity
- ✅ **LOW risk:** Simple public page (presentation + 2 buttons)
- ✅ **Standard stack:** AdonisJS + Inertia + Ant Design (already configured)
- ✅ **No new tech:** Uses existing patterns

#### 3. Team Morale & Momentum
- ✅ **Positive impact:** Proactive gap correction (constructive approach)
- ✅ **Momentum maintained:** No rollback, no massive replan
- ✅ **Story enriched:** Story 1-2 becomes more complete and coherent

#### 4. Long-term Sustainability & Maintainability
- ✅ **Coherent UX:** Clear entry point for app discovery
- ✅ **Maintainable:** Simple code, easy to modify in Phase 2
- ✅ **Scalable:** Foundation for future evolutions (pricing, features, etc.)

#### 5. Stakeholder Expectations & Business Value
- ✅ **Improved onboarding:** Visitors understand app before signup
- ✅ **Professionalism:** Complete application (not just raw /register)
- ✅ **Clear value proposition:** "Organisez la magie" from arrival

### Alternatives Considered & Rejected

**Option 2: Rollback Story 1-1**
- ❌ Unnecessary rollback (Story 1-1 independent of landing page)
- ❌ HIGH effort, HIGH risk, no benefit

**Option 3: Reduce MVP Scope**
- ❌ MVP achievable with landing page (no overload)
- ❌ Reducing scope would be counterproductive (bad UX)

### Trade-offs Accepted
- Story 1-2 slightly larger (+4-6h effort)
- Documents to update (Epics, Architecture, UX Design)
- ✅ **Minor trade-offs largely compensated** by UX improvement

---

## Section 4: Detailed Change Proposals

### Change Proposal #1: epics.md - Story 1.2

**File:** `_bmad-output/planning-artifacts/epics.md`
**Section:** Story 1.2 (lines 344-385)
**Status:** ✅ Approved by Clement

**OLD (Current title):**
```markdown
### Story 1.2: Layout de Base et Navigation
```

**NEW (New title):**
```markdown
### Story 1.2: Page d'Accueil Publique, Layout et Navigation
```

**OLD (Current User Story):**
```markdown
As a **utilisateur**,
I want **une interface claire avec navigation sidebar et breadcrumbs**,
So that **je peux naviguer facilement dans l'application**.
```

**NEW (Extended User Story):**
```markdown
As a **utilisateur**,
I want **une page d'accueil publique claire et une interface avec navigation sidebar et breadcrumbs**,
So that **les visiteurs peuvent découvrir magic-inventory et je peux naviguer facilement dans l'application**.
```

**NEW AC Section (ADD BEFORE existing AC):**
```markdown
**Section 1 : Page d'Accueil Publique (Landing Page)**

**Given** je suis un visiteur non-connecté
**When** j'accède à la route racine (/)
**Then** je vois la page d'accueil publique de magic-inventory
**And** je vois le nom de l'application "magic-inventory"
**And** je vois un sous-titre ou slogan ("Organisez la magie")
**And** je vois une description brève de l'application (1-2 phrases maximum)

**Given** je suis sur la page d'accueil publique
**When** je vois les boutons d'action
**Then** je vois un bouton primaire "S'inscrire" (type primary, colorPrimary #1890ff)
**And** je vois un bouton secondaire "Se connecter" (type default, gris)
**And** les boutons sont bien visibles et clairement identifiables

**Given** je clique sur "S'inscrire"
**When** le bouton est cliqué
**Then** je suis redirigé vers /register (Story 1-3)

**Given** je clique sur "Se connecter"
**When** le bouton est cliqué
**Then** je suis redirigé vers /login (Story 1-3)

**Given** je suis un utilisateur déjà connecté
**When** j'accède à la route racine (/)
**Then** je suis redirigé automatiquement vers /dashboard
**And** je ne vois pas la landing page publique

**Given** la page d'accueil publique est affichée
**When** j'examine le design
**Then** l'interface utilise le design system Ant Design avec tokens personnalisés
**And** les espaces blancs sont généreux (Apple-inspired)
**And** la hiérarchie typographique est claire
**And** l'interface est sobre et professionnelle (Built for Pros)

**Section 2 : Layout de Base et Navigation (Utilisateurs Connectés)**

[Existing AC continue unchanged...]
```

**Justification:** Extends Story 1-2 to include public landing page with clear AC, preserving all existing AC for authenticated layout.

---

### Change Proposal #2: architecture.md - Routes

**File:** `_bmad-output/planning-artifacts/architecture.md`
**Section:** API Boundaries - Routes (lines 1330-1360)
**Status:** ✅ Approved by Clement

**OLD:**
```typescript
// Routes publiques (auth)
Route.get('/login', 'AuthController.showLogin')
Route.post('/login', 'AuthController.login')
Route.get('/register', 'AuthController.showRegister')
Route.post('/register', 'AuthController.register')
```

**NEW:**
```typescript
// Route racine publique (landing page)
Route.get('/', 'HomeController.index')  // Page d'accueil publique

// Routes publiques (auth)
Route.get('/login', 'AuthController.showLogin')
Route.post('/login', 'AuthController.login')
Route.get('/register', 'AuthController.showRegister')
Route.post('/register', 'AuthController.register')
```

**Justification:** Adds public root route handled by HomeController, logical placement before auth routes.

---

### Change Proposal #3: architecture.md - Project Structure

**File:** `_bmad-output/planning-artifacts/architecture.md`
**Section:** Complete Project Directory Structure
**Status:** ✅ Approved by Clement

**OLD (Controllers - line 1122):**
```markdown
├── app/
│   ├── controllers/
│   │   ├── auth_controller.ts
│   │   ├── materials_controller.ts
│   │   ...
```

**NEW (Controllers with HomeController):**
```markdown
├── app/
│   ├── controllers/
│   │   ├── home_controller.ts            # Landing page publique
│   │   ├── auth_controller.ts
│   │   ├── materials_controller.ts
│   │   ...
```

**OLD (Inertia Pages - line 1207):**
```markdown
├── inertia/
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ...
│   │   ├── Dashboard/
│   │   │   ├── Index.tsx
│   │   │   ...
```

**NEW (Inertia Pages with Home):**
```markdown
├── inertia/
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Index.tsx                 # Landing page publique (/)
│   │   │   └── Index.test.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ...
│   │   ├── Dashboard/
│   │   │   ├── Index.tsx
│   │   │   ...
```

**Justification:** Adds HomeController backend and Home/ folder frontend, follows architecture conventions (naming, structure, co-located tests).

---

### Change Proposal #4: ux-design-specification.md - Landing Page

**File:** `_bmad-output/planning-artifacts/ux-design-specification.md`
**Section:** Platform Strategy (lines 74-82)
**Status:** ✅ Approved by Clement

**OLD:**
```markdown
### Platform Strategy

**Plateforme principale :** Application web (desktop/laptop)
- **Interface :** Mouse/keyboard (pas touch-first)
- **Contexte :** Chez soi, préparation tranquille de spectacles et routines
- **Connectivité :** En ligne (pas d'offline nécessaire)

**Responsive mobile (bonus MVP) :**
- Mode "consultation" pour accéder aux routines et checklists en déplacement
```

**NEW:**
```markdown
### Platform Strategy

**Plateforme principale :** Application web (desktop/laptop)
- **Interface :** Mouse/keyboard (pas touch-first)
- **Contexte :** Chez soi, préparation tranquille de spectacles et routines
- **Connectivité :** En ligne (pas d'offline nécessaire)

**Landing page publique (visiteurs non-connectés) :**
- **Page d'accueil (`/`)** : Point d'entrée pour nouveaux visiteurs
- **Présentation value proposition** : "magic-inventory - Organisez la magie"
- **Description brève** : Centraliser inventaire, routines et spectacles (1-2 phrases)
- **Call-to-action clair** :
  - Bouton primaire "S'inscrire" (type primary, bleu #1890ff)
  - Bouton secondaire "Se connecter" (type default, gris)
- **Design sobre et professionnel** : Ant Design avec tokens personnalisés (Built for Pros)
- **Espaces blancs généreux** : Apple-inspired clarity
- **Layout distinct** : Pas de Sidebar navigation (layout public ≠ layout authentifié)
- **Redirection intelligente** : Si utilisateur déjà connecté → automatiquement vers /dashboard

**Responsive mobile (bonus MVP) :**
- Mode "consultation" pour accéder aux routines et checklists en déplacement
```

**Justification:** Adds UX specification for public landing page, defines design principles, integrates naturally into Platform Strategy section.

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Category:** Minor

**Definition:** Direct implementation by development team without fundamental replan.

### Handoff Recipients & Responsibilities

#### 1. Scrum Master (Bob) - Document Updates 📝
**Responsibilities:**
- Update **epics.md**: Story 1.2 title + AC landing page
- Update **architecture.md**: Routes + project structure
- Update **ux-design-specification.md**: Landing page section

**Timeline:** Immediate (after proposal approval)

**Deliverables:**
- ✅ Modified epics.md (Story 1.2 extended)
- ✅ Modified architecture.md (route `/` + structure)
- ✅ Modified ux-design-specification.md (landing page spec)

---

#### 2. Developer Agent (Amelia) - Story Implementation 💻
**Responsibilities:**
- Create/Validate Story 1-2 via `/bmad-bmm-create-story` (if needed)
- Develop Story 1-2 via `/bmad-bmm-dev-story`
- Implement backend: HomeController + route `/`
- Implement frontend: `Home/Index.tsx` with Ant Design
- Write tests: `Home/Index.test.tsx` + navigation tests

**Timeline:** 1 sprint (Story 1-2 complete)

**Deliverables:**
- ✅ HomeController.index() with auth redirect logic
- ✅ Home/Index.tsx landing page (Ant Design, professional design)
- ✅ Tests passing (component + navigation + redirect)

---

#### 3. Developer Agent (Amelia) - Code Review ✅
**Responsibilities:**
- Code review Story 1-2 via `/bmad-bmm-code-review`
- Verify architecture patterns (naming, validation, etc.)
- Verify tests passing

**Timeline:** After Story 1-2 dev

**Deliverables:**
- ✅ Code review report
- ✅ Approval or fixes required

---

#### 4. Scrum Master (Bob) - Next Story 🏃
**Responsibilities:**
- Prepare Story 1-3 via `/bmad-bmm-create-story`
- Continue Epic 1 normally

**Timeline:** After Story 1-2 code review

---

### Success Criteria

Story 1-2 will be considered successful when:
- ✅ Public page `/` functional with magic-inventory presentation
- ✅ "S'inscrire" and "Se connecter" buttons redirect correctly
- ✅ Automatic redirect to `/dashboard` if user authenticated
- ✅ Tests passing (`Home/Index.test.tsx` + navigation)
- ✅ Code review approved
- ✅ Ant Design design coherent with UX Design spec

### Implementation Sequence

```
1. Sprint Change Proposal → Approved by Clement ✅
                ↓
2. Update epics.md (Story 1.2 modified)
                ↓
3. Update architecture.md (routes + structure)
                ↓
4. Update ux-design-specification.md (landing page section)
                ↓
5. Create/Validate Story 1-2 (workflow create-story)
                ↓
6. Develop Story 1-2 (workflow dev-story)
                ↓
7. Code Review (workflow code-review)
                ↓
8. Epic 1 continues normally (Stories 1-3 → 1-6)
```

### Critical Dependencies

- Story 1-2 (modified) MUST be developed before Story 1-3 (auth)
- Reason: Landing page directs to Register/Login (Story 1-3)

### Potential Blockers

- None identified (simple and isolated change)

---

## Approval Record

**Submitted by:** Bob (Scrum Master)
**Date:** 2026-02-03
**Approved by:** Clement
**Approval date:** 2026-02-03

**Change Proposals Approved:**
1. ✅ epics.md - Story 1.2 (title + AC)
2. ✅ architecture.md - Routes
3. ✅ architecture.md - Project Structure
4. ✅ ux-design-specification.md - Landing Page

**Next Actions:**
- ⏭️ Bob: Update planning documents (epics, architecture, ux-design)
- ⏭️ Amelia: Develop Story 1-2 (modified)

---

**End of Sprint Change Proposal**
