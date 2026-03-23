# Story 5.7: Suppression d'un Spectacle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **supprimer un spectacle**,
so that **je peux retirer les prestations passées ou annulées** (FR39).

## Acceptance Criteria

**Scenario 1 : Popconfirm affiché au clic "Supprimer"**
- **Given** je suis sur /shows/:id
- **When** je clique sur "Supprimer"
- **Then** un Popconfirm Ant Design s'affiche
- **And** le message est : "Êtes-vous sûr de vouloir supprimer ce spectacle ?"

**Scenario 2 : Suppression réussie**
- **Given** le Popconfirm est affiché
- **When** je confirme la suppression
- **Then** le spectacle est supprimé de la table `shows`
- **And** toutes ses associations (`routine_show`) sont supprimées en cascade (ON DELETE CASCADE)
- **And** un message success s'affiche : "Spectacle supprimé avec succès"
- **And** je suis redirigé vers /shows (liste)

**Scenario 3 : Annulation de la suppression**
- **Given** le Popconfirm est affiché
- **When** j'annule la suppression
- **Then** le Popconfirm se ferme
- **And** je reste sur la page détail /shows/:id

## Tasks / Subtasks

### Backend — Routes (AC: 1–2)

- [x] Modifier `start/routes.ts`
  - [x] Ajouter `'destroy'` dans `.only([...])` de la resource shows (ligne 53, actuellement manquant)
  - [x] Ligne cible : `router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])` → ajouter `'destroy'`

### Backend — Controller destroy() (AC: 2)

- [x] Ajouter méthode `destroy()` dans `app/controllers/shows_controller.ts`
  - [x] Vérifier l'ownership : `.where('user_id', auth.user!.id).where('id', params.id).firstOrFail()`
  - [x] Appeler `await show.delete()` (cascade automatique DB — `routine_show` supprimé via `show_id → shows.id ON DELETE CASCADE`)
  - [x] Flash success : `'Spectacle supprimé avec succès'`
  - [x] Rediriger vers `shows.index` via `response.redirect().toRoute('shows.index')`
  - [x] Try/catch : 404 → redirect silencieux vers index ; autres erreurs → `logger.error` + flash error + redirect index

### Frontend — Show.tsx (AC: 1, 2, 3)

- [x] Modifier `inertia/pages/Shows/Show.tsx`
  - [x] Ajouter import `{ useState }` depuis `react`
  - [x] Ajouter `Popconfirm` et `message` aux imports antd existants (`Button, List, Space, Tag, Typography`)
  - [x] Ajouter state : `const [deleting, setDeleting] = useState(false)`
  - [x] Ajouter handler `handleDelete` : appelle `router.delete('/shows/${show.id}', { onError: () => { setDeleting(false); message.error('Une erreur est survenue lors de la suppression') } })`
  - [x] Remplacer le `<Button danger disabled>Supprimer</Button>` (ligne 33-35) par un `<Popconfirm>` avec le bouton `loading={deleting}` et sans `disabled`

### Tests — Show.test.tsx (AC: 1, 2, 3)

- [x] Modifier `inertia/pages/Shows/Show.test.tsx`
  - [x] Remplacer le test "le bouton 'Supprimer' est disabled" par les tests Popconfirm ci-dessous
  - [x] Ajouter test : "ouvre un Popconfirm au clic 'Supprimer'"
  - [x] Ajouter test : "appelle router.delete après confirmation dans le Popconfirm"
  - [x] Ajouter test : "n'appelle pas router.delete après annulation dans le Popconfirm" (AC 3)
  - [x] Lancer `npx vitest run` — tous les tests doivent passer (0 régression)

## Dev Notes

### 🎯 Contexte — Ce que Story 5.7 représente

Story 5.7 connecte le bouton "Supprimer" dans `Shows/Show.tsx`. Ce bouton existe déjà à la ligne 33-35 mais est **`disabled`** (stub sans handler). Cette story le connecte exactement comme Story 4.7 l'a fait pour les routines.

**Delta exact :**
1. Ajouter `'destroy'` dans `.only([...])` de la resource shows dans `routes.ts`
2. Implémenter `destroy()` dans `shows_controller.ts`
3. Connecter le bouton "Supprimer" dans `Show.tsx` avec Popconfirm
4. Remplacer le test "disabled" par les tests Popconfirm dans `Show.test.tsx`

### 🏗️ Routes — Modification requise

```typescript
// start/routes.ts — AVANT (ligne 53) :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])

// APRÈS :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
// Génère automatiquement : DELETE /shows/:id → destroy()
```

Note : la route `DELETE /shows/:id/routines/:routineId` (detachRoutine, ligne 55) ne sera PAS impactée — c'est une route custom séparée.

### 🏗️ Backend — destroy() à implémenter

Suivre **exactement** le pattern de `routines_controller.ts` destroy() [Source: app/controllers/routines_controller.ts]:

```typescript
async destroy({ params, auth, response, session }: HttpContext) {
  try {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    await show.delete()
    // Note: routine_show est supprimé automatiquement (show_id → shows.id ON DELETE CASCADE)
    // [Source: database/migrations/1774600000002_create_routine_show_table.ts]

    session.flash('success', 'Spectacle supprimé avec succès')
    return response.redirect().toRoute('shows.index')
  } catch (error) {
    if (error.status === 404) {
      return response.redirect().toRoute('shows.index')
    }
    logger.error('Show deletion failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de la suppression du spectacle')
    return response.redirect().toRoute('shows.index')
  }
}
```

**CASCADE automatique :** Supprimer un spectacle efface automatiquement :
- `routine_show` : `show_id → shows.id ON DELETE CASCADE` [Source: database/migrations/1774600000002_create_routine_show_table.ts]

**Pas de nettoyage manuel des relations nécessaire** (pas de `.related('routines').detach()`).

### 🏗️ Frontend — Show.tsx modifications

Le bouton "Supprimer" actuel (lignes 33-35) est un stub `disabled`. Voici la transformation complète :

```tsx
// AVANT (lignes 33-35) :
<Button danger disabled>
  Supprimer
</Button>

// APRÈS — ajouter imports en haut :
import { useState } from 'react'
// Ajouter Popconfirm, message aux imports antd existants

// Dans le composant ShowsShow, ajouter :
const [deleting, setDeleting] = useState(false)

const handleDelete = () => {
  setDeleting(true)
  router.delete(`/shows/${show.id}`, {
    onError: () => {
      setDeleting(false)
      message.error('Une erreur est survenue lors de la suppression')
    },
  })
}

// Remplacer le bouton dans le JSX :
<Popconfirm
  title="Êtes-vous sûr de vouloir supprimer ce spectacle ?"
  onConfirm={handleDelete}
  okText="Supprimer"
  cancelText="Annuler"
>
  <Button danger loading={deleting}>Supprimer</Button>
</Popconfirm>
```

Référence : pattern identique dans `inertia/pages/Routines/Show.tsx` (Story 4.7).

### 🏗️ Tests — Show.test.tsx modifications

**⚠️ Important :** Le mock `@inertiajs/react` a **déjà** `router: { visit: vi.fn(), delete: vi.fn() }` (ligne 9) et `vi.clearAllMocks()` dans `beforeEach` (ligne 42) — aucune modification du mock ou du beforeEach nécessaire.

**1. Remplacer le test "disabled"** (lignes 118-122) :
```typescript
// SUPPRIMER ce test :
it('le bouton "Supprimer" est disabled', () => {
  render(<ShowsShow show={sampleShow} />)
  const supprimerBtn = screen.getByRole('button', { name: /supprimer/i })
  expect(supprimerBtn).toBeDisabled()
})

// REMPLACER par ces 3 tests :
it("ouvre un Popconfirm au clic 'Supprimer'", async () => {
  render(<ShowsShow show={sampleShow} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  expect(await screen.findByText("Êtes-vous sûr de vouloir supprimer ce spectacle ?")).toBeInTheDocument()
})

it("appelle router.delete après confirmation dans le Popconfirm", async () => {
  render(<ShowsShow show={sampleShow} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
  expect(router.delete).toHaveBeenCalledWith(
    '/shows/1',
    expect.objectContaining({ onError: expect.any(Function) })
  )
})

it("n'appelle pas router.delete après annulation dans le Popconfirm", async () => {
  render(<ShowsShow show={sampleShow} />)
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  const annulerButton = await screen.findByRole('button', { name: /annuler/i })
  await userEvent.click(annulerButton)
  expect(router.delete).not.toHaveBeenCalled()
})
```

**Nombre de tests après :** 311 (base) - 1 (test disabled supprimé) + 3 (nouveaux tests Popconfirm) = **313 tests**.

### ⚠️ Points d'Attention

**1. Bouton "Supprimer" actuellement `disabled`**
Le bouton ligne 33-35 a l'attribut `disabled`. Il FAUT le retirer quand on ajoute le Popconfirm — sinon le Popconfirm ne s'ouvre pas. Le test actuel "le bouton 'Supprimer' est disabled" doit être remplacé.

**2. router.delete vs router.visit**
Utiliser `router.delete()` d'Inertia (pas `router.visit()` avec method override). Le mock est déjà configuré avec `delete: vi.fn()` en ligne 9 de `Show.test.tsx`.

**3. Cascade DB — Aucun appel `.detach()` nécessaire**
La migration `routine_show` a `show_id → shows.id ON DELETE CASCADE`. `await show.delete()` suffit.

**4. Test du Popconfirm — Pattern Ant Design**
Le Popconfirm crée un second bouton "Supprimer" dans le DOM (le bouton de confirmation). Pour le test de confirmation : `screen.findAllByRole('button', { name: /supprimer/i })` puis prendre le dernier. Pattern identique à Materials/Show.test.tsx [Source: inertia/pages/Materials/Show.test.tsx] et Routines/Show.test.tsx [Source: inertia/pages/Routines/Show.test.tsx].

**5. message import — Ne pas oublier**
Story 4.7 a eu un fix code review pour ajouter `message` import et `message.error()` dans `onError`. L'inclure directement dès l'implémentation.

**6. Ownership IDOR — Toujours en place**
`destroy()` doit vérifier `.where('user_id', auth.user!.id)` avant de supprimer.

**7. Route `shows.index` — Vérifier le nom de route**
Le pattern routines utilise `response.redirect().toRoute('routines.index')`. Pour shows, utiliser `response.redirect().toRoute('shows.index')`. Alternative possible : `response.redirect().toPath('/shows')`.

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
start/routes.ts                          ← Ajouter 'destroy' dans .only([...]) (ligne 53)
app/controllers/shows_controller.ts      ← Ajouter méthode destroy() après detachRoutine()
inertia/pages/Shows/Show.tsx             ← Ajouter Popconfirm + useState + handleDelete
inertia/pages/Shows/Show.test.tsx        ← Remplacer test "disabled" par 3 tests Popconfirm

Fichiers à VÉRIFIER (aucune modification attendue) :
app/models/show.ts                       ← VÉRIFIER (modèle complet, pivot routine_show déjà défini)
database/migrations/1774600000002_*      ← VÉRIFIER (CASCADE déjà configuré sur show_id)

Fichiers NON modifiés :
app/models/routine.ts                    ← Non concerné
inertia/pages/Shows/Edit.tsx             ← Non concerné
inertia/pages/Shows/Index.tsx            ← Non concerné
inertia/pages/Shows/Checklist.tsx        ← Non concerné
```

### 📝 Learnings des Stories Précédentes

**Story 4.7 (suppression routine — pattern maître) :**
- Même delta exact : routes + destroy() + Popconfirm + tests
- `firstOrFail()` AVANT tout autre appel (IDOR ownership check)
- Pattern try/catch avec 404 silencieux → redirect index
- `logger.error('Show deletion failed', { error, userId: auth.user?.id })`
- `message.error(...)` dans `onError` du `router.delete()` (fix code review 4.7)
- Test Popconfirm : `findAllByRole('button', { name: /supprimer/i })` → prendre le dernier

**Story 3.6 (suppression matériel — pattern original) :**
- Flash message FR : `'Spectacle supprimé avec succès'`
- Même structure destroy() — validé par plusieurs code reviews

**Story 5.6 (modification spectacle — dernier état) :**
- 311 tests passants après code review
- `vi.clearAllMocks()` dans `beforeEach` (déjà en place dans Show.test.tsx)
- Mock `router.delete: vi.fn()` déjà présent dans Show.test.tsx ligne 9

### Project Structure Notes

- Controller : `app/controllers/shows_controller.ts` (ajouter destroy() après `detachRoutine()`)
- Routes : `start/routes.ts` ligne 53 (ajouter 'destroy')
- Frontend : `inertia/pages/Shows/Show.tsx` (bouton Supprimer stub → Popconfirm)
- Tests co-localisés : `inertia/pages/Shows/Show.test.tsx` (remplacer 1 test + ajouter 3)

### References

- Pattern destroy() + Popconfirm (routines) : [Source: _bmad-output/implementation-artifacts/4-7-suppression-dune-routine.md]
- Pattern destroy() original (matériels) : [Source: app/controllers/materials_controller.ts]
- Bouton Supprimer stub (ligne 33-35) : [Source: inertia/pages/Shows/Show.tsx#33]
- Mock router.delete déjà présent (ligne 9) : [Source: inertia/pages/Shows/Show.test.tsx#9]
- Test disabled à remplacer (lignes 118-122) : [Source: inertia/pages/Shows/Show.test.tsx#118]
- CASCADE routine_show : [Source: database/migrations/1774600000002_create_routine_show_table.ts]
- Routes shows actuel (ligne 53) : [Source: start/routes.ts#53]
- Epic 5 Story 5.7 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.7]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun problème rencontré. Implémentation directe suivant le pattern 4.7.

### Completion Notes List

- Ajouté `'destroy'` dans `.only([...])` de la resource shows dans `start/routes.ts`
- Implémenté `destroy()` dans `shows_controller.ts` : ownership check, `show.delete()`, flash success, redirect `shows.index`, try/catch avec 404 silencieux et logger.error pour autres erreurs
- Modifié `Show.tsx` : ajout `useState`, `Popconfirm`, `message`, handler `handleDelete`, bouton stub `disabled` remplacé par Popconfirm avec `loading={deleting}`
- Modifié `Show.test.tsx` : test "disabled" remplacé par 3 tests Popconfirm (ouverture, confirmation, annulation)
- 313 tests passants (311 + 3 nouveaux - 1 supprimé), 0 régression

### File List

- start/routes.ts
- app/controllers/shows_controller.ts
- inertia/pages/Shows/Show.tsx
- inertia/pages/Shows/Show.test.tsx

## Change Log

- 2026-03-23 : Story 5.7 créée — suppression de spectacle via Popconfirm, destroy() dans controller, cascade routine_show automatique, 4 fichiers à modifier.
- 2026-03-23 : Story 5.7 implémentée — 4 fichiers modifiés, 313 tests passants (0 régression).
- 2026-03-23 : Code review — 3 fixes appliqués : `onFinish` callback ajouté, message d'erreur complet, `okText` clarifié, test `onError` ajouté (314 tests).
