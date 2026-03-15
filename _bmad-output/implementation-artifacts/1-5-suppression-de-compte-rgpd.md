# Story 1.5: Suppression de Compte RGPD

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur connecté**,
I want **supprimer mon compte et toutes mes données**,
So that **je peux exercer mon droit à l'effacement RGPD** (FR5).

## Acceptance Criteria

**Scenario 1: Affichage du bouton de suppression**
- **Given** je suis sur la page /profile
- **When** je vois la section "Zone dangereuse"
- **Then** un bouton "Supprimer mon compte" est affiché
- **And** le bouton est de type danger (rouge #ff4d4f)

**Scenario 2: Modal de confirmation**
- **Given** je clique sur "Supprimer mon compte"
- **When** la confirmation s'affiche
- **Then** un Modal Ant Design s'ouvre
- **And** le titre est : "Êtes-vous sûr de vouloir supprimer votre compte ?"
- **And** le message explique : "Cette action est irréversible. Toutes vos données seront supprimées définitivement."

**Scenario 3: Suppression confirmée**
- **Given** le modal de confirmation est ouvert
- **When** je clique sur "Supprimer" pour confirmer
- **Then** mon compte utilisateur est supprimé de la table users
- **And** toutes mes données liées sont supprimées en cascade (Epic 1 : uniquement la table users — les tables futures DOIVENT utiliser FK CASCADE)
- **And** la session est détruite
- **And** je suis redirigé vers /login
- **And** un message info s'affiche : "Votre compte a été supprimé"

**Scenario 4: Annulation**
- **Given** le modal de confirmation est ouvert
- **When** je clique sur "Annuler"
- **Then** le modal se ferme
- **And** aucune action n'est effectuée
- **And** je reste sur la page profil

## Tasks / Subtasks

### Backend — ProfileController + Route (AC: 1, 3)

- [x] Ajouter méthode `destroy()` dans ProfileController (AC: 3)
  - [x] Modifier `app/controllers/profile_controller.ts`
  - [x] Méthode `destroy({ auth, response, session })` :
    - `const user = auth.user!` — sauvegarder référence AVANT logout
    - `await auth.use('web').logout()` — détruire session
    - `await user.delete()` — supprimer compte (Lucid ORM)
    - `session.flash('info', 'Votre compte a été supprimé')`
    - `return response.redirect('/login')`
  - [x] try-catch autour de la logique métier (delete + logout) — PAS autour de la validation
  - [x] `logger.error('Account deletion failed', ...)` en cas d'erreur

- [x] Ajouter route DELETE /profile (AC: 3)
  - [x] Modifier `start/routes.ts`
  - [x] Ajouter dans le groupe auth : `router.delete('/profile', [ProfileController, 'destroy']).as('profile.destroy')`

### Frontend — Zone dangereuse dans Profile Edit (AC: 1, 2, 3, 4)

- [x] Ajouter section "Zone dangereuse" dans `inertia/pages/profile/edit.tsx` (AC: 1, 2, 4)
  - [x] Ajouter état : `const [deleteModalOpen, setDeleteModalOpen] = useState(false)`
  - [x] Ajouter état : `const [deleteLoading, setDeleteLoading] = useState(false)`
  - [x] Ajouter fonction `handleDeleteAccount()` :
    ```typescript
    const handleDeleteAccount = () => {
      setDeleteLoading(true)
      router.delete('/profile', {
        onSuccess: () => setDeleteLoading(false),
        onError: () => setDeleteLoading(false),
      })
    }
    ```
  - [x] Ajouter section sous le formulaire existant :
    - `<Divider />` pour séparer visuellement
    - Titre "Zone dangereuse" (Typography.Title level={4}, couleur danger token.colorError)
    - Bouton `<Button danger type="primary" onClick={() => setDeleteModalOpen(true)}>Supprimer mon compte</Button>`
  - [x] Ajouter Modal Ant Design (AC: 2, 4) :
    ```tsx
    <Modal
      title="Êtes-vous sûr de vouloir supprimer votre compte ?"
      open={deleteModalOpen}
      onOk={handleDeleteAccount}
      onCancel={() => setDeleteModalOpen(false)}
      okText="Supprimer"
      cancelText="Annuler"
      okButtonProps={{ danger: true, loading: deleteLoading }}
    >
      <p>Cette action est irréversible. Toutes vos données seront supprimées définitivement.</p>
    </Modal>
    ```

### Tests (AC: Tous)

- [x] Mettre à jour `inertia/pages/profile/edit.test.tsx` (AC: 1, 2, 3, 4)
  - [x] Test : bouton "Supprimer mon compte" present et de type danger
  - [x] Test : clic ouvre le modal avec titre et message corrects
  - [x] Test : bouton "Supprimer" dans modal appelle `router.delete('/profile', ...)`
  - [x] Test : bouton "Annuler" ferme le modal sans action
  - [x] Ajouter `router: { post: vi.fn(), delete: vi.fn() }` dans le mock Inertia

### Validation Finale (AC: Tous)

- [x] Vérifier flow complet :
  - [x] Accéder à /profile
  - [x] Cliquer "Supprimer mon compte" → modal s'ouvre
  - [x] Confirmer → redirection vers /login + message "Votre compte a été supprimé"
  - [x] Tenter de se reconnecter → connexion impossible (compte supprimé)
  - [x] Annuler → modal se ferme, page profil intacte
- [x] Lancer les tests : `npm run test:front` — tous passent (57/57)

## Dev Notes

### 🔥 Patterns Critiques — NE PAS DÉVIER

**Ordre dans `destroy()` — CRITIQUE :**
```typescript
async destroy({ auth, response, session }: HttpContext) {
  try {
    const user = auth.user!          // 1. Sauvegarder AVANT logout
    await auth.use('web').logout()   // 2. Détruire session
    await user.delete()              // 3. Supprimer de la DB
    session.flash('info', 'Votre compte a été supprimé')
    return response.redirect('/login')
  } catch (error) {
    logger.error('Account deletion failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de la suppression de votre compte')
    return response.redirect().back()
  }
}
```

**⚠️ AUCUNE validation à faire** — destroy() n'a PAS de `request.validateUsing()`.
Le try-catch entoure directement la logique métier (pas de risque de ValidationException).

**Cascade Delete — IMPORTANT pour les futures stories :**
- En Epic 1, seule la table `users` existe → `user.delete()` suffit
- Les migrations des tables futures (materials, routines, shows, notes, etc.) DOIVENT déclarer :
  ```typescript
  table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
  ```
- Ne PAS essayer de supprimer manuellement des tables qui n'existent pas encore

**Inertia router.delete — Syntaxe correcte :**
```typescript
// ✅ CORRECT (Inertia v2 - pas de data pour DELETE)
router.delete('/profile', {
  onSuccess: () => setDeleteLoading(false),
  onError: () => setDeleteLoading(false),
})

// ❌ INCORRECT (ne pas passer de data body comme pour POST)
router.delete('/profile', {}, { onSuccess: ... })
```

**Button danger — Ant Design 6.x :**
```tsx
// ✅ Bouton rouge plein (solid danger)
<Button danger type="primary">Supprimer mon compte</Button>

// ✅ Bouton dans Modal okButtonProps
okButtonProps={{ danger: true, loading: deleteLoading }}
```

**Modal — Utiliser le composant `<Modal>`, PAS `Modal.confirm()` :**
- `Modal.confirm()` statique est déprécié en Ant Design v6 sans contexte `App`
- Utiliser `<Modal open={state} onOk={handler} onCancel={handler}>` avec state React

**Flash message type "info" :**
- `session.flash('info', 'Votre compte a été supprimé')` → affiché en bleu par FlashMessages

### Source Tree — Fichiers Touchés

**Fichiers à MODIFIER (aucun nouveau fichier):**
- `app/controllers/profile_controller.ts` — Ajouter méthode `destroy()`
- `start/routes.ts` — Ajouter `router.delete('/profile', ...)`
- `inertia/pages/profile/edit.tsx` — Ajouter zone dangereuse + Modal
- `inertia/pages/profile/edit.test.tsx` — Ajouter tests nouveaux scénarios

**Fichiers EXISTANTS à NE PAS TOUCHER :**
- `app/models/user.ts` — User model déjà correct (pas de relations déclarées en Epic 1)
- `app/validators/profile_validator.ts` — Aucune validation pour destroy
- `inertia/components/Layout.tsx` — Menu Profil déjà ajouté (Story 1.4)
- `inertia/components/FlashMessages.tsx` — Gère déjà le type "info"

### Mock Inertia dans les Tests — Pattern Mis à Jour

```typescript
vi.mock('@inertiajs/react', () => ({
  router: {
    post: vi.fn(),
    delete: vi.fn(),   // ← AJOUTER pour Story 1.5
  },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/profile', props: {} }),
}))
```

### Pattern de Test Modal Ant Design

```typescript
it('ouvre le modal de confirmation au clic', async () => {
  const user = userEvent.setup()
  render(<ProfileEdit user={mockUser} />)

  await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText('Êtes-vous sûr de vouloir supprimer votre compte ?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Cette action est irréversible. Toutes vos données seront supprimées définitivement.')
    ).toBeInTheDocument()
  })
})

it('appelle router.delete au clic sur Supprimer', async () => {
  const mockDelete = vi.fn()
  vi.mocked(router).delete = mockDelete

  const user = userEvent.setup()
  render(<ProfileEdit user={mockUser} />)

  await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // Clic sur le bouton "Supprimer" du modal (okText)
  await user.click(screen.getByRole('button', { name: /^supprimer$/i }))

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalledWith('/profile', expect.any(Object))
  })
})

it('ferme le modal au clic sur Annuler', async () => {
  const user = userEvent.setup()
  render(<ProfileEdit user={mockUser} />)

  await user.click(screen.getByRole('button', { name: /supprimer mon compte/i }))

  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  await user.click(screen.getByRole('button', { name: /annuler/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

### Learnings des Stories Précédentes

**Story 1.4 — Profile Edit (base de cette story) :**
- ✅ Page `/profile` existe : `inertia/pages/profile/edit.tsx`
- ✅ `ProfileController` existe avec `edit()` et `update()` — ajouter `destroy()`
- ✅ `request.validateUsing` HORS du try-catch (bug identifié en code review 1.4)
- ✅ Pattern flash messages : `session.flash('info'/'success'/'error', '...')`
- ✅ Loading state sur boutons avec `useState(false)` + prop `loading`
- ✅ Mock `~/components/Layout` dans les tests : `vi.mock('~/components/Layout', () => ({ default: ({ children }) => <div>{children}</div> }))`
- ✅ `import type { ReactNode }` (PAS `React.ReactNode` sans import)
- ✅ `vitest.config.ts` a l'alias `~/` configuré (ajouté en Story 1.4)
- ✅ 52 tests existants — NE PAS les casser

**Patterns établis (à continuer) :**
- TypeScript strict — interfaces typées, pas de `any`
- Inertia : `router.post()` / `router.delete()` (pas `<form>` HTML)
- Tokens Ant Design : `const { token } = theme.useToken()`
- Logger : `import logger from '@adonisjs/core/services/logger'`
- Auth : `const user = auth.user!` (middleware garantit non-null)

### Git Intelligence Summary

**Commits récents :**
- `a5485d5`: Story 1.4 implémentée — ProfileController, profile/edit.tsx, validators, tests
- `3c73b17`: Story 1.3 — Auth pages Ant Design (38 tests)
- `2506468`: Story 1.2 — Layout + Navigation (21 tests)

**Pattern story 1.4 établi (à suivre pour destroy) :**
- validation hors try-catch → controller.destroy n'a pas de validation (try-catch direct)
- `await auth.use('web').logout()` pour déconnecter
- `session.flash()` + `response.redirect()`

### Project Structure Notes

**Alignement avec l'architecture :**
- ✅ Controller dans `app/controllers/profile_controller.ts` (existant — à modifier)
- ✅ Route DELETE dans `start/routes.ts` groupe auth
- ✅ Page dans `inertia/pages/profile/edit.tsx` (existant — à modifier)
- ✅ Tests co-localisés `edit.test.tsx` (existant — à compléter)
- ✅ Pas de migration nécessaire (table users déjà créée, pas de nouvelles tables en Epic 1)

**Pas de conflit détecté avec les stories existantes.**

### References

- **[Source: epics.md#Story 1.5]** — User story, 4 scénarios BDD, exigences RGPD (FR5)
- **[Source: architecture.md#Authentication & Security]** — `auth.use('web').logout()`, session cookies HTTP-only
- **[Source: architecture.md#Data Architecture]** — Lucid ORM `model.delete()`, cascade FK strategy
- **[Source: architecture.md#Error Handling]** — Flash messages + redirect pattern
- **[Source: project-context.md#Flash Messages]** — `session.flash('info', ...)` → FlashMessages component
- **[Source: project-context.md#Inertia.js React]** — `router.delete(url, options)`
- **[Source: 1-4-gestion-du-profil-utilisateur.md#Dev Notes]** — ProfileController patterns, loading state, test mocks

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

N/A — Story créée avec analyse exhaustive, prête pour développement

### Completion Notes List

**Phase Planification (2026-03-08):**
- ✅ Story auto-découverte depuis sprint-status.yaml (1-5-suppression-de-compte-rgpd = premier backlog)
- ✅ Epic 1 déjà in-progress (Stories 1.1 → 1.4 done)
- ✅ Analyse epics.md — 4 scénarios BDD extraits
- ✅ Analyse architecture — cascade delete strategy, auth patterns, Lucid ORM delete
- ✅ Analyse story 1.4 — fichiers existants identifiés, patterns critique (validation hors try-catch, bugs code review)
- ✅ Git intelligence — commits récents analysés
- ✅ Pattern critique documenté : `const user = auth.user!` AVANT `auth.use('web').logout()`
- ✅ Avertissement cascade delete pour futures migrations documenté
- ✅ Patterns test Modal Ant Design documentés
- ✅ Mock `router.delete` ajouté dans les instructions de test

**Phase Implémentation (2026-03-08):**
- ✅ `destroy()` ajouté dans ProfileController — ordre correct (save ref → logout → delete)
- ✅ Route DELETE /profile ajoutée dans start/routes.ts groupe auth
- ✅ Section "Zone dangereuse" ajoutée dans inertia/pages/profile/edit.tsx
- ✅ Modal Ant Design (composant React state, PAS Modal.confirm() déprécié)
- ✅ 5 nouveaux tests ajoutés dans edit.test.tsx (Zone dangereuse, modal, delete, annulation)
- ✅ Mock inertia déjà à jour avec `delete: vi.fn()` (fait lors de story 1.4)
- ✅ 57/57 tests passent — 0 régression

**Code Review (2026-03-08) — 3 fixes appliqués :**
- ✅ [M1] Test bouton danger complété : ajout vérification `ant-btn-primary` (solid red validé)
- ✅ [M2] Code mort retiré : `onError` dans `handleDeleteAccount` supprimé (Inertia appelle `onSuccess` pour tous les redirects serveur, jamais `onError`)
- ✅ [L1] Logger `destroy()` : `auth.user?.id` → `user.id` (référence sauvegardée avant logout)

### File List

**Fichiers modifiés :**
- `app/controllers/profile_controller.ts` — Méthode `destroy()` ajoutée (RGPD account deletion)
- `start/routes.ts` — Route `DELETE /profile` ajoutée dans groupe auth
- `inertia/pages/profile/edit.tsx` — Zone dangereuse + Modal de confirmation ajoutés
- `inertia/pages/profile/edit.test.tsx` — 5 nouveaux tests (16 total)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-08 | 1.0 | Story créée par SM agent — planification complète, patterns critiques documentés | SM Agent |
| 2026-03-08 | 1.1 | Implémentation complète — destroy(), route DELETE, zone dangereuse, modal, 57/57 tests | Dev Agent |
