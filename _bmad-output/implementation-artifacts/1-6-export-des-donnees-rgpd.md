# Story 1.6: Export des Données RGPD

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur connecté**,
I want **exporter l'ensemble de mes données au format JSON**,
So that **je peux exercer mon droit à la portabilité RGPD** (FR6).

## Acceptance Criteria

**Scenario 1: Affichage du bouton d'export**
- **Given** je suis sur la page /profile
- **When** je vois la section "Mes données"
- **Then** un bouton "Exporter mes données" est affiché
- **And** le bouton est de type default (gris, PAS rouge ni bleu)

**Scenario 2: Collecte et structure des données**
- **Given** je clique sur "Exporter mes données"
- **When** la requête est traitée
- **Then** le serveur collecte toutes mes données (user + tableaux vides pour les entités futures)
- **And** les données sont sérialisées en JSON formaté (JSON.stringify avec indent 2)
- **And** les timestamps sont en ISO 8601

**Scenario 3: Téléchargement du fichier**
- **Given** les données sont préparées
- **When** le fichier est généré
- **Then** un fichier JSON est téléchargé automatiquement par le navigateur
- **And** le nom du fichier est : `magic-inventory-export-{user_id}-{YYYY-MM-DD}.json`
- **And** le fichier contient les données structurées par entité

**Scenario 4: Utilisateur sans données complémentaires (Epic 1)**
- **Given** je n'ai aucune donnée à part mon compte (Epic 1 — seule la table users existe)
- **When** j'exporte mes données
- **Then** le fichier JSON contient mes informations utilisateur
- **And** les sections futures (materials, routines, etc.) sont des tableaux vides `[]`
- **And** aucune erreur n'est générée

## Tasks / Subtasks

### Backend — ProfileController + Route (AC: 2, 3, 4)

- [x] Ajouter méthode `export()` dans ProfileController (AC: 2, 3, 4)
  - [x] Modifier `app/controllers/profile_controller.ts`
  - [x] Méthode `export({ auth, response, session }: HttpContext)` avec structure JSON complète
  - [x] try-catch autour de la logique métier
  - [x] `logger.error('Data export failed', { error, userId: auth.user?.id })` en cas d'erreur
  - [x] En cas d'erreur : `session.flash('error', ...)` + `response.redirect().back()`

- [x] Ajouter route GET /profile/export (AC: 2, 3)
  - [x] Modifier `start/routes.ts`
  - [x] `router.get('/profile/export', [ProfileController, 'export']).as('profile.export')` dans groupe auth

### Frontend — Section "Mes données" dans Profile Edit (AC: 1, 3)

- [x] Ajouter section "Mes données" dans `inertia/pages/profile/edit.tsx` (AC: 1, 3)
  - [x] Ajoutée AVANT "Zone dangereuse" (UX progressif : inoffensif avant destructif)
  - [x] `<Divider />` pour séparer visuellement
  - [x] Titre "Mes données" (`Typography.Title level={4}`)
  - [x] Texte explicatif
  - [x] `<Button type="default" onClick={handleExport}>Exporter mes données</Button>`
  - [x] Fonction `handleExport()` : `window.location.href = '/profile/export'` (navigation native)

### Tests (AC: 1, 3)

- [x] Mettre à jour `inertia/pages/profile/edit.test.tsx` (AC: 1, 3)
  - [x] Test : section "Mes données" présente (heading)
  - [x] Test : bouton "Exporter mes données" présent
  - [x] Test : bouton est de type default (`ant-btn-default`, PAS `ant-btn-primary`, PAS `ant-btn-dangerous`)
  - [x] Test : clic sur bouton déclenche `window.location.href = '/profile/export'` (via `vi.stubGlobal`)

### Validation Finale (AC: Tous)

- [x] Vérifier flow complet :
  - [x] Accéder à /profile
  - [x] Voir section "Mes données" avec bouton gris
  - [x] Cliquer "Exporter mes données" → fichier JSON téléchargé
  - [x] Vérifier nom fichier : `magic-inventory-export-{id}-{date}.json`
  - [x] Ouvrir le fichier — vérifier structure JSON valide avec données user
  - [x] Vérifier timestamps ISO 8601
- [x] Lancer les tests : `npm run test:front` — 60/60 passent (3 nouveaux, 0 régression)

## Dev Notes

### 🔥 Patterns Critiques — NE PAS DÉVIER

**Structure JSON de l'export — CRITIQUE Epic 1 :**
```typescript
// ⚠️ Epic 1 : SEULE la table users existe
// Les autres tables n'existent PAS encore → tableaux vides
const exportData = {
  exportedAt: new Date().toISOString(),
  user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  },
  // Tables futures (Epic 2+) — NE PAS tenter de les requêter
  materials: [],
  storageLocations: [],
  categories: [],
  materialTypes: [],
  routines: [],
  shows: [],
  notes: [],
}
```

**⚠️ CRITIQUE : Ne PAS requêter les tables qui n'existent pas encore.**
Les Epics 2+ devront ajouter leurs entités dans cet export. En Epic 1, seul `user` a des données réelles.

**Response pour file download — PAS response.download() :**
```typescript
// ❌ INCORRECT — response.download() prend un chemin fichier sur disque
return response.download('/path/to/file.json')

// ✅ CORRECT — headers manuels + response.send() pour contenu in-memory
async export({ auth, response, session }: HttpContext) {
  try {
    const user = auth.user!
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      materials: [],
      storageLocations: [],
      categories: [],
      materialTypes: [],
      routines: [],
      shows: [],
      notes: [],
    }

    const json = JSON.stringify(exportData, null, 2)
    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const fileName = `magic-inventory-export-${user.id}-${date}.json`

    response.header('Content-Type', 'application/json; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(json)
  } catch (error) {
    logger.error('Data export failed', { error, userId: auth.user?.id })
    session.flash('error', "Une erreur est survenue lors de l'export de vos données")
    return response.redirect().back()
  }
}
```

**⚠️ Signature `export()` inclut `session` pour le cas d'erreur :**
```typescript
async export({ auth, response, session }: HttpContext) { ... }
```

**Frontend — window.location.href, PAS Inertia router :**
```typescript
// ❌ INCORRECT — Inertia intercepte le clic et fait XHR → XHR ne peut pas déclencher un download
router.get('/profile/export')

// ❌ INCORRECT — Link Inertia fait une navigation SPA, pas un download
<Link href="/profile/export">Exporter</Link>

// ✅ CORRECT — Navigation navigateur native → déclenche le download
const handleExport = () => {
  setExportLoading(true)
  window.location.href = '/profile/export'
  // Le navigateur télécharge et reste sur la page (Content-Disposition: attachment)
  setTimeout(() => setExportLoading(false), 2000)
}
```

**Route — Ordre dans routes.ts IMPORTANT :**
```typescript
// ✅ CORRECT — export AVANT la route générale /profile si nécessaire
// (En réalité AdonisJS distingue GET /profile et GET /profile/export, pas de conflit)
router.get('/profile', [ProfileController, 'edit']).as('profile.edit')
router.post('/profile', [ProfileController, 'update']).as('profile.update')
router.delete('/profile', [ProfileController, 'destroy']).as('profile.destroy')
router.get('/profile/export', [ProfileController, 'export']).as('profile.export')  // ← Ajouter
```

**Nom du fichier — Format date YYYY-MM-DD (PAS DD/MM/YYYY) :**
```typescript
// ✅ CORRECT
const date = new Date().toISOString().split('T')[0]  // "2026-03-08"
const fileName = `magic-inventory-export-${user.id}-${date}.json`
// → magic-inventory-export-42-2026-03-08.json

// ❌ INCORRECT
const date = new Date().toLocaleDateString('fr-FR')  // "08/03/2026" — slashes invalides dans nom fichier
```

**Button type="default" (AC1 exige gris, PAS rouge ni bleu) :**
```tsx
// ✅ Bouton gris (action secondaire / inoffensive)
<Button type="default" onClick={handleExport} loading={exportLoading}>
  Exporter mes données
</Button>

// ❌ Bouton rouge — réservé aux actions destructives (Story 1.5)
<Button danger type="primary">...</Button>

// ❌ Bouton bleu — réservé à l'action principale (Enregistrer)
<Button type="primary">...</Button>
```

**Pattern test window.location.href :**
```typescript
it('déclenche le téléchargement au clic sur "Exporter mes données"', async () => {
  // Mock window.location.href
  const mockAssign = vi.fn()
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  })
  const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...window.location,
    href: '',
  } as Location)

  // Méthode plus simple et fiable :
  let hrefValue = ''
  Object.defineProperty(window, 'location', {
    get() { return { set href(v: string) { hrefValue = v } } },
    configurable: true,
  })

  const user = userEvent.setup()
  render(<ProfileEdit user={mockUser} />)

  await user.click(screen.getByRole('button', { name: /exporter mes données/i }))

  expect(hrefValue).toBe('/profile/export')
})
```

**⚠️ Note sur le test `window.location.href` :** Les tests jsdom (utilisé par Vitest) peuvent avoir des limitations avec `window.location`. Si le test est trop complexe, le simplifier en vérifiant uniquement que le bouton est présent et de type default (ce qui est l'essentiel pour AC1). Le flow complet de téléchargement est validé manuellement.

### Section UI — Ordre dans le composant

```tsx
// Ordre dans ProfileEdit
<Card>
  <Title>Mon Profil</Title>

  <Form>...</Form>        {/* Formulaire profil (Story 1.4) */}

  <Divider />

  {/* Section "Mes données" (Story 1.6) — AVANT Zone dangereuse */}
  <div>
    <Title level={4}>Mes données</Title>
    <p>Téléchargez une copie complète de vos données personnelles au format JSON.</p>
    <Button type="default" onClick={handleExport} loading={exportLoading}>
      Exporter mes données
    </Button>
  </div>

  <Divider />

  <div>                  {/* Zone dangereuse (Story 1.5) */}
    <Title level={4} style={{ color: token.colorError }}>Zone dangereuse</Title>
    <Button danger type="primary" onClick={() => setDeleteModalOpen(true)}>
      Supprimer mon compte
    </Button>
  </div>

  <Modal>...</Modal>      {/* Modal suppression (Story 1.5) */}
</Card>
```

**Justification ordre :** "Mes données" (inoffensif) AVANT "Zone dangereuse" (destructif) — UX progressif.

### Source Tree — Fichiers Touchés

**Fichiers à MODIFIER (aucun nouveau fichier) :**
- `app/controllers/profile_controller.ts` — Ajouter méthode `export()`
- `start/routes.ts` — Ajouter `router.get('/profile/export', ...)`
- `inertia/pages/profile/edit.tsx` — Ajouter section "Mes données" + bouton
- `inertia/pages/profile/edit.test.tsx` — Ajouter tests nouveaux scénarios

**Fichiers EXISTANTS à NE PAS TOUCHER :**
- `app/models/user.ts` — User model déjà correct
- `app/validators/profile_validator.ts` — Aucune validation pour export
- `inertia/components/Layout.tsx` — Menu Profil déjà ajouté (Story 1.4)
- `inertia/components/FlashMessages.tsx` — Gère déjà le type "error"
- `vitest.config.ts` — Alias `~/` déjà configuré (Story 1.4)

### Learnings des Stories Précédentes

**Story 1.5 — Patterns établis (à continuer) :**
- ✅ `const user = auth.user!` — middleware garantit non-null
- ✅ try-catch entoure la logique métier (pas la validation)
- ✅ `logger.error('...', { error, userId: user.id })` — utiliser la référence sauvegardée (PAS `auth.user?.id`)
- ✅ `session.flash('error', '...')` + `response.redirect().back()` en cas d'erreur
- ✅ Pas de `request.validateUsing()` pour les opérations sans input utilisateur
- ✅ Mock `~/components/Layout` dans les tests
- ✅ `import type { ReactNode }` (PAS `React.ReactNode`)
- ✅ 57 tests existants — NE PAS les casser

**Story 1.4 — Code review fixes (à ne pas répéter) :**
- ✅ `request.validateUsing` HORS du try-catch (N/A pour story 1.6 — pas de validation)
- ✅ Vérifier classes Ant Design dans les tests : `ant-btn-default`, `ant-btn-primary`, `ant-btn-dangerous`

**⚠️ Attention : Inertia intercepte les clics sur les éléments DOM**
Inertia.js attache un event listener global sur `click`. Pour déclencher un vrai download, il faut court-circuiter Inertia avec `window.location.href` (navigation navigateur native) plutôt que tout mécanisme passant par Inertia router ou `<Link>`.

### Git Intelligence Summary

**Commits récents :**
- `a5485d5` : Story 1.4 implémentée — ProfileController, profile/edit.tsx, validators, tests
- `3c73b17` : Story 1.3 — Auth pages Ant Design (38 tests)
- Nombreux fichiers non committés (stories 1.4 + 1.5)

**Pattern story 1.5 établi (à suivre pour export) :**
- Controller method → try-catch → response directe (pas de flash en succès pour download)
- Frontend → état loading + action simple
- Tests → vérifier présence + classes CSS Ant Design

### Project Structure Notes

**Alignement avec l'architecture :**
- ✅ Controller dans `app/controllers/profile_controller.ts` (existant — à modifier)
- ✅ Route GET dans `start/routes.ts` groupe auth
- ✅ Page dans `inertia/pages/profile/edit.tsx` (existant — à modifier)
- ✅ Tests co-localisés `edit.test.tsx` (existant — à compléter)
- ✅ Pas de migration nécessaire (seule la table users est requise en Epic 1)

**Pas de conflit détecté avec les stories existantes.**

### References

- **[Source: epics.md#Story 1.6]** — User story, 5 scénarios BDD, exigences RGPD (FR6)
- **[Source: architecture.md#Authentication & Security]** — `auth.user!`, session middleware
- **[Source: architecture.md#Data Architecture]** — Lucid ORM, cascade strategy
- **[Source: architecture.md#Error Handling]** — Flash messages + redirect pattern
- **[Source: architecture.md#Routes FR6]** — `Route.get('/profile/export', 'ProfileController.export')`
- **[Source: project-context.md#Inertia.js React]** — Comportement XHR vs navigation native
- **[Source: 1-5-suppression-de-compte-rgpd.md#Dev Notes]** — ProfileController patterns, try-catch, logger
- **[Source: 1-5-suppression-de-compte-rgpd.md#Dev Agent Record]** — `user.id` vs `auth.user?.id` dans catch

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive, prête pour développement

### Completion Notes List

**Phase Planification (2026-03-08):**
- ✅ Story auto-découverte depuis sprint-status.yaml (1-6-export-des-donnees-rgpd = premier backlog)
- ✅ Epic 1 déjà in-progress (Stories 1.1 → 1.5 done)
- ✅ Analyse epics.md — 5 scénarios BDD extraits
- ✅ Analyse architecture — route GET /profile/export, ProfileController.export(), file download patterns
- ✅ CRITIQUE documenté : `response.download()` prend un path, PAS un buffer → utiliser headers + `response.send()`
- ✅ CRITIQUE documenté : Inertia intercepte les clics → utiliser `window.location.href` pour download
- ✅ CRITIQUE documenté : Epic 1 scope — seule table users existe → autres sections = []
- ✅ Patterns story 1.5 appliqués (try-catch, logger avec `auth.user?.id`, session flash en erreur)
- ✅ Ordre UI documenté : "Mes données" AVANT "Zone dangereuse"
- ✅ Pattern test window.location.href documenté

**Phase Implémentation (2026-03-08):**
- ✅ `export()` ajouté dans ProfileController — headers manuels + `response.send(json)` (PAS `response.download()`)
- ✅ Structure JSON : `exportedAt` + `user` + 7 tableaux vides (Epic 1 scope)
- ✅ Nom fichier : `magic-inventory-export-{userId}-{YYYY-MM-DD}.json`
- ✅ Route `GET /profile/export` ajoutée dans start/routes.ts groupe auth
- ✅ Section "Mes données" ajoutée dans edit.tsx AVANT "Zone dangereuse"
- ✅ `handleExport()` utilise `window.location.href` (navigation native, bypass Inertia)
- ✅ 3 nouveaux tests ajoutés (60/60 total, 0 régression)
- ✅ `vi.stubGlobal('location', ...)` pour mocker window.location.href dans les tests

**Code Review (2026-03-08) — 3 fixes appliqués :**
- ✅ [H1] `destroy()` catch block : `user.id` → `auth.user?.id` (user est block-scoped au try block, inaccessible dans catch → ReferenceError runtime)
- ✅ [M1] `vi.stubGlobal` nettoyage : `afterEach(() => vi.unstubAllGlobals())` ajouté + `afterEach` importé + call redondant retiré du test
- ✅ [M2] `new Date()` doublon : `const now = new Date()` unique, `exportedAt` et `date` dérivés de la même instance

### File List

**Fichiers modifiés :**
- `app/controllers/profile_controller.ts` — Méthode `export()` ajoutée (RGPD data export)
- `start/routes.ts` — Route `GET /profile/export` ajoutée dans groupe auth
- `inertia/pages/profile/edit.tsx` — Section "Mes données" + bouton export ajoutés
- `inertia/pages/profile/edit.test.tsx` — 3 nouveaux tests (60 total)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-08 | 1.0 | Story créée par SM agent — analyse exhaustive, patterns critiques documentés | SM Agent |
| 2026-03-08 | 1.1 | Implémentation complète — export(), route GET, section "Mes données", 60/60 tests | Dev Agent |
