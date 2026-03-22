# Story 4.7: Suppression d'une Routine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **supprimer une routine**,
so that **je peux retirer les routines que je ne joue plus** (FR30).

## Acceptance Criteria

**Scenario 1 : Popconfirm affiché au clic "Supprimer"**
- **Given** je suis sur /routines/:id
- **When** je clique sur "Supprimer"
- **Then** un Popconfirm Ant Design s'affiche
- **And** le message est : "Êtes-vous sûr de vouloir supprimer cette routine ?"

**Scenario 2 : Suppression réussie (routine non liée à un spectacle)**
- **Given** le Popconfirm est affiché
- **When** la routine n'est utilisée dans aucun spectacle
- **And** je confirme la suppression
- **Then** la routine est supprimée de la table `routines`
- **And** toutes ses associations (`routine_category`, `material_routine`) sont supprimées en cascade (ON DELETE CASCADE)
- **And** un message success s'affiche : "Routine supprimée avec succès"
- **And** je suis redirigé vers /routines (liste)

**Scenario 3 : Suppression bloquée (routine liée à des spectacles)**
- **Given** le Popconfirm est affiché
- **When** la routine est utilisée dans des spectacles
- **And** je confirme la suppression
- **Then** la suppression échoue
- **And** un message error s'affiche : "Cette routine est utilisée dans des spectacles et ne peut pas être supprimée"
- **Note** : La vérification spectacle est un TODO Epic 5 — le check sera implémenté quand la table `show_routines` existera (cf. Dev Notes)

**Scenario 4 : Annulation de la suppression**
- **Given** le Popconfirm est affiché
- **When** j'annule la suppression
- **Then** le Popconfirm se ferme
- **And** je reste sur la page détail /routines/:id

## Tasks / Subtasks

### Backend — Routes (AC: 1–3)

- [x] Modifier `start/routes.ts`
  - [x] Ajouter `'destroy'` dans `.only([...])` de la resource routines (actuellement manquant)
  - [x] Ligne cible : `router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update'])` → ajouter `'destroy'`

### Backend — Controller destroy() (AC: 2–3)

- [x] Ajouter `destroy()` dans `app/controllers/routines_controller.ts`
  - [x] Vérifier l'ownership : `.where('user_id', auth.user!.id).where('id', params.id).firstOrFail()`
  - [x] Ajouter commentaire `// TODO Epic 5: Vérifier show_routines avant suppression` (même pattern que materials avait `// TODO Epic 4: Vérifier material_routine`)
  - [x] Appeler `await routine.delete()` (cascade automatique DB)
  - [x] Flash success : `'Routine supprimée avec succès'`
  - [x] Rediriger vers `routines.index`
  - [x] Try/catch : 404 → redirect silencieux vers index ; autres erreurs → log + flash error + redirect

### Frontend — Show.tsx (AC: 1, 2, 4)

- [x] Modifier `inertia/pages/Routines/Show.tsx`
  - [x] Ajouter import `{ useState }` depuis `react`
  - [x] Ajouter `Popconfirm` et `message` aux imports antd (déjà `Button, List, Space, Tag, Typography`)
  - [x] Corriger : `message` était manquant — ajouté lors de la code review
  - [x] Ajouter state : `const [deleting, setDeleting] = useState(false)`
  - [x] Ajouter handler `handleDelete` : appelle `router.delete('/routines/${routine.id}', { onError: () => { setDeleting(false); message.error(...) } })`
  - [x] Entourer le `<Button danger>Supprimer</Button>` existant (ligne 34) avec `<Popconfirm>` configuré avec les textes FR
  - [x] Ajouter `loading={deleting}` et `onClick={() => setDeleting(true)}` (ou via onConfirm)

### Tests — Show.test.tsx (AC: 1, 2, 4)

- [x] Modifier `inertia/pages/Routines/Show.test.tsx`
  - [x] Ajouter `delete: vi.fn()` dans le mock `@inertiajs/react` → `router: { visit: vi.fn(), delete: vi.fn() }`
  - [x] Ajouter dans `beforeEach` : `vi.mocked(router.delete).mockClear()`
  - [x] Ajouter test : "ouvre un Popconfirm au clic 'Supprimer'"
  - [x] Ajouter test : "appelle router.delete après confirmation dans le Popconfirm"
  - [x] Ajouter test : "n'appelle pas router.delete après annulation dans le Popconfirm" (AC 4 — ajouté lors de la code review)
  - [x] Lancer `npx vitest run` — tous les tests doivent passer (0 régression)

## Dev Notes

### 🎯 Contexte — Delta de cette story

Story 4.7 ajoute la suppression de routine. Le bouton "Supprimer" dans `Show.tsx` (ligne 34) existe déjà mais est non-fonctionnel (`<Button danger>Supprimer</Button>` sans handler). Cette story le connecte.

### 🏗️ Routes — Modification requise

```typescript
// start/routes.ts — AVANT (ligne ~49) :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update'])

// APRÈS :
router.resource('routines', RoutinesController).only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
// Génère automatiquement : DELETE /routines/:id → destroy()
```

Référence : materials a exactement le même pattern `[..., 'destroy']` [Source: start/routes.ts#48]

### 🏗️ Backend — destroy() à implémenter

Suivre **exactement** le pattern de `materials_controller.ts` destroy() :

```typescript
async destroy({ params, auth, response, session }: HttpContext) {
  try {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    // TODO Epic 5: Vérifier show_routines avant suppression
    // Quand la table show_routines existera (Epic 5), ajouter :
    //   const showCount = await routine.related('shows').query().count('* as total')
    //   if (showCount[0].$extras.total > 0) {
    //     session.flash('error', 'Cette routine est utilisée dans des spectacles et ne peut pas être supprimée')
    //     return response.redirect().toRoute('routines.show', { id: params.id })
    //   }

    await routine.delete()
    // Note: routine_category et material_routine sont supprimés automatiquement (ON DELETE CASCADE)

    session.flash('success', 'Routine supprimée avec succès')
    return response.redirect().toRoute('routines.index')
  } catch (error) {
    if (error.status === 404) {
      return response.redirect().toRoute('routines.index')
    }
    logger.error('Routine deletion failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de la suppression de la routine')
    return response.redirect().toRoute('routines.index')
  }
}
```

**CASCADE automatique :** Supprimer une routine efface automatiquement :
- `routine_category` : `routine_id → routines.id ON DELETE CASCADE` [Source: database/migrations/1774173804063_create_create_routine_categories_table.ts]
- `material_routine` : `routine_id → routines.id ON DELETE CASCADE` [Source: database/migrations/1774500000001_create_material_routine_table.ts]

**Pas de nettoyage manuel des relations nécessaire.**

### 🏗️ Frontend — Show.tsx modifications

Le bouton "Supprimer" actuel (ligne 34) est un stub sans handler. Voici la transformation complète :

```tsx
// AVANT (ligne 34) :
<Button danger>Supprimer</Button>

// APRÈS — ajouter imports en haut :
import { useState } from 'react'
// Ajouter Popconfirm, message aux imports antd existants

// Dans le composant, ajouter :
const [deleting, setDeleting] = useState(false)

const handleDelete = () => {
  setDeleting(true)
  router.delete(`/routines/${routine.id}`, {
    onError: () => {
      setDeleting(false)
    },
  })
}

// Remplacer le bouton :
<Popconfirm
  title="Êtes-vous sûr de vouloir supprimer cette routine ?"
  onConfirm={handleDelete}
  okText="Supprimer"
  cancelText="Annuler"
>
  <Button danger loading={deleting}>Supprimer</Button>
</Popconfirm>
```

Référence : pattern identique dans `inertia/pages/Materials/Show.tsx` [Source: inertia/pages/Materials/Show.tsx#24-52]

### 🏗️ Tests — Show.test.tsx modifications

**1. Mettre à jour le mock `@inertiajs/react`** (ligne 8-11 actuelle) :
```typescript
// AVANT :
vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/routines/1', props: { flash: {} } }),
}))

// APRÈS :
vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/routines/1', props: { flash: {} } }),
}))
```

**2. Mettre à jour `beforeEach`** :
```typescript
beforeEach(() => {
  vi.mocked(router.visit).mockClear()
  vi.mocked(router.delete).mockClear()  // ← ajouter
})
```

**3. Ajouter les tests de suppression** :
```typescript
it("appelle router.delete après confirmation dans le Popconfirm", async () => {
  render(<RoutinesShow routine={sampleRoutine} />)
  // Ouvrir le Popconfirm
  await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
  // Cliquer sur le bouton de confirmation dans le Popconfirm
  const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
  await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
  expect(router.delete).toHaveBeenCalledWith(
    '/routines/1',
    expect.objectContaining({ onError: expect.any(Function) })
  )
})
```

Référence test : pattern identique dans `inertia/pages/Materials/Show.test.tsx` [Source: inertia/pages/Materials/Show.test.tsx#111-123]

### ⚠️ Points d'Attention

**1. TODO Epic 5 — Vérification spectacle**
- L'AC 3 (suppression bloquée si routine liée à des spectacles) **ne peut pas être implémentée maintenant**
- La table `show_routines` n'existe pas encore (Epic 5 = backlog)
- Pattern établi : materials avait `// TODO Epic 4: Vérifier material_routine` dans destroy() lors de Story 3.6
- Ajouter le même TODO commenté pour Epic 5 — ne pas créer de migration ni de modèle Show maintenant

**2. router.delete vs router.visit**
- Utiliser `router.delete()` d'Inertia (pas `router.visit()` avec method override)
- Le mock dans les tests doit inclure `delete: vi.fn()` (actuellement manquant dans le mock Show.test.tsx)

**3. Cascade DB — Aucun appel `.detach()` nécessaire**
- Contrairement à d'autres implémentations qui appellent manuellement `.related().detach()`
- Les migrations ont déjà configuré ON DELETE CASCADE sur `routine_category` et `material_routine`
- `await routine.delete()` suffit — la DB s'occupe du reste

**4. Test du Popconfirm — Pattern Ant Design**
- Le Popconfirm crée un second bouton "Supprimer" dans le DOM (le bouton de confirmation)
- Pour trouver le bon bouton de confirmation : `screen.findAllByRole('button', { name: /supprimer/i })` puis prendre le dernier
- Référence : exact même pattern dans Materials/Show.test.tsx

**5. Bouton "Supprimer" existant dans Show.tsx**
- Le bouton existe déjà à la ligne 34 : `<Button danger>Supprimer</Button>`
- Il suffit de l'entourer avec Popconfirm et d'ajouter les props `loading` et `onConfirm`
- Ne pas déplacer le bouton dans le JSX

### 📊 Structure des fichiers

```
Fichiers à MODIFIER :
start/routes.ts                           ← Ajouter 'destroy' dans .only([...])
app/controllers/routines_controller.ts    ← Ajouter méthode destroy()
inertia/pages/Routines/Show.tsx           ← Ajouter Popconfirm + handler + state
inertia/pages/Routines/Show.test.tsx      ← Ajouter mock delete + tests

Fichiers NON modifiés :
app/models/routine.ts                     ← Modèle OK (CASCADE configuré en DB)
database/migrations/*                     ← Aucune migration nécessaire
```

### 📝 Learnings des stories précédentes (Epic 4)

- **Story 3.6 learnings** (suppression matériel) : pattern destroy() avec try/catch, 404 silencieux, logger.error avec userId, flash messages FR
- **Story 4.6 learnings** : `<Layout title="Modifier">` pour le breadcrumb → ici pas de modification de breadcrumb (on reste sur la page détail qui a déjà `title={routine.name}`)
- **Ownership IDOR** : toujours `.where('user_id', auth.user!.id)` + `.firstOrFail()`
- **router.delete** : `router.delete(url, { onError })` — pas de `onSuccess` nécessaire car l'Inertia redirect géré côté serveur

### References

- Story 3.6 (pattern suppression matériel) : [Source: _bmad-output/implementation-artifacts/3-6-suppression-dun-materiel.md]
- materials_controller.ts destroy() : [Source: app/controllers/materials_controller.ts#216-243]
- Materials/Show.tsx (Popconfirm pattern) : [Source: inertia/pages/Materials/Show.tsx#24-52]
- Materials/Show.test.tsx (tests delete) : [Source: inertia/pages/Materials/Show.test.tsx#106-123]
- Routes routines (actuel) : [Source: start/routes.ts#49]
- Routines Show.tsx (bouton stub ligne 34) : [Source: inertia/pages/Routines/Show.tsx#34]
- Routines Show.test.tsx (mock actuel) : [Source: inertia/pages/Routines/Show.test.tsx#8-11]
- Migration routine_category (CASCADE) : [Source: database/migrations/1774173804063_create_create_routine_categories_table.ts]
- Migration material_routine (CASCADE) : [Source: database/migrations/1774500000001_create_material_routine_table.ts]
- Epic 4 Story 4.7 : [Source: _bmad-output/planning-artifacts/epics.md#Story 4.7]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_Aucun blocage._

### Completion Notes List

- Ajout `'destroy'` dans `start/routes.ts` pour exposer `DELETE /routines/:id`
- Méthode `destroy()` implémentée dans `routines_controller.ts` suivant exactement le pattern de `materials_controller.ts` : ownership check, cascade DB automatique, flash success, redirect vers index, try/catch avec 404 silencieux
- TODO Epic 5 commenté pour la vérification `show_routines` (table inexistante à ce stade)
- `Show.tsx` : import `useState` + `Popconfirm`, state `deleting`, handler `handleDelete` avec `router.delete()`, bouton Supprimer entouré du Popconfirm avec textes FR
- `Show.test.tsx` : mock `router.delete` ajouté, `mockClear` dans `beforeEach`, 2 nouveaux tests (Popconfirm affiché, router.delete appelé après confirmation)
- Suite complète : 226 tests PASS, 0 régression
- Code review fixes : `message` import + `message.error()` dans `onError`, test AC4 annulation, `vi.clearAllMocks()`, `toBeInTheDocument()`, suppression mock `usePage` inutilisé

### File List

- start/routes.ts
- app/controllers/routines_controller.ts
- inertia/pages/Routines/Show.tsx
- inertia/pages/Routines/Show.test.tsx
- _bmad-output/implementation-artifacts/4-7-suppression-dune-routine.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
