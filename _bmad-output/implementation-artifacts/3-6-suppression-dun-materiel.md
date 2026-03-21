# Story 3.6: Suppression d'un Matériel

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **supprimer un matériel de mon inventaire**,
so that **je peux retirer le matériel que je n'ai plus** (FR9).

## Acceptance Criteria

**Scenario 1 : Affichage du Popconfirm**
- **Given** je suis sur `/materials/:id`
- **When** je clique sur "Supprimer"
- **Then** un Popconfirm Ant Design s'affiche
- **And** le message est : "Êtes-vous sûr de vouloir supprimer ce matériel ?"

**Scenario 2 : Suppression réussie (matériel sans routines)**
- **Given** le Popconfirm est affiché
- **When** le matériel n'est utilisé dans aucune routine
- **And** je confirme la suppression
- **Then** le matériel est supprimé de la table `materials`
- **And** toutes ses associations (`material_category`) sont supprimées en cascade (ON DELETE CASCADE DB)
- **And** un message success s'affiche : "Matériel supprimé avec succès"
- **And** je suis redirigé vers `/materials` (liste)

**Scenario 3 : Échec si matériel utilisé dans des routines [DÉFÉRÉ à Epic 4]**
- **Given** le Popconfirm est affiché
- **When** le matériel est utilisé dans des routines
- **And** je confirme la suppression
- **Then** la suppression échoue
- **And** un message error s'affiche : "Ce matériel est utilisé dans des routines et ne peut pas être supprimé. Retirez-le des routines d'abord."
- **And** je reste sur la page détail
- ⚠️ **NOTE** : Cette AC ne peut pas être implémentée en Story 3.6 car la table `material_routine` n'existe pas encore. Elle sera adressée en Epic 4 quand les routines seront créées.

**Scenario 4 : Annulation de la suppression**
- **Given** le Popconfirm est affiché
- **When** j'annule la suppression
- **Then** le Popconfirm se ferme
- **And** aucune action n'est effectuée
- **And** je reste sur la page détail

**Scenario 5 : Isolation multi-tenant**
- **Given** un utilisateur tente de supprimer le matériel d'un autre utilisateur
- **When** la requête DELETE arrive sur le serveur
- **Then** une erreur 404 est retournée automatiquement (`firstOrFail`)
- **And** aucun matériel n'est supprimé

## Tasks / Subtasks

### Backend — Modifier `app/controllers/materials_controller.ts` (AC: 2, 3, 5)

- [x] Ajouter la méthode `destroy({ params, auth, response, session }: HttpContext)` (AC: 2, 5)
  - [x] Récupérer le matériel avec isolation multi-tenant : `.where('user_id', auth.user!.id).where('id', params.id).firstOrFail()`
  - [x] TODO Epic 4 : Vérifier si `material_routine` count > 0 → flash error + redirect back (voir AC 3)
  - [x] `await material.delete()` (les `material_category` sont supprimés automatiquement via ON DELETE CASCADE)
  - [x] `session.flash('success', 'Matériel supprimé avec succès')`
  - [x] `return response.redirect().toRoute('materials.index')`
  - [x] Gérer les erreurs avec `try/catch` : 404 → redirect silencieux vers index, autres → `logger.error` + flash error + redirect index

### Backend — Modifier `start/routes.ts` (AC: 2)

- [x] Ajouter `'destroy'` à la liste des actions resource materials
  - [x] Changer `.only(['index', 'create', 'store', 'show', 'edit', 'update'])` en `.only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])`

### Frontend — Vérification `inertia/pages/Materials/Show.tsx` (AC: 1, 4)

- [x] Vérifier que le Popconfirm et `router.delete` sont déjà présents (implémentés en Story 3.4)
  - [x] **AUCUNE MODIFICATION ATTENDUE** — le frontend est déjà complet
  - [x] S'assurer que `handleDelete` appelle `router.delete('/materials/:id', { onSuccess: ..., onError: ... })`

### Tests — Vérifier `inertia/pages/Materials/Show.test.tsx`

- [x] Vérifier que les tests existants de delete passent toujours (0 régression)
  - [x] Test "affiche le bouton 'Supprimer'" ✅ (déjà présent)
  - [x] Test "appelle router.delete après confirmation dans le Popconfirm" ✅ (déjà présent)
  - [x] Lancer `npx vitest run` — 0 régression

## Dev Notes

### 🎯 Approche Générale

**⚠️ CRITIQUE : Le frontend est déjà implémenté depuis Story 3.4 !**

`inertia/pages/Materials/Show.tsx` contient déjà :
- Le bouton "Supprimer" (danger)
- Le `Popconfirm` avec `title="Êtes-vous sûr de vouloir supprimer ce matériel ?"`
- Le `handleDelete` qui appelle `router.delete('/materials/:id', { onSuccess, onError })`

**Fichiers à modifier :**
```
app/controllers/materials_controller.ts  ← MODIFIER (ajouter destroy())
start/routes.ts                          ← MODIFIER (ajouter 'destroy')
```

**Fichiers SANS modification :**
```
inertia/pages/Materials/Show.tsx         ← INTOUCHER (déjà implémenté Story 3.4)
inertia/pages/Materials/Show.test.tsx    ← INTOUCHER (tests déjà présents Story 3.4)
app/models/material.ts                   ← INTOUCHER (pas de changement de modèle)
database/migrations/                     ← INTOUCHER (ON DELETE CASCADE déjà configuré)
```

### 🔥 Pattern Critique — Méthode `destroy()` dans `MaterialsController`

```typescript
// app/controllers/materials_controller.ts — pattern à suivre
async destroy({ params, auth, response, session }: HttpContext) {
  try {
    const material = await Material.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    // TODO Epic 4: Vérifier material_routine
    // const routineCount = await material.related('routines').query().count('* as total')
    // if (routineCount[0].$extras.total > 0) {
    //   session.flash('error', 'Ce matériel est utilisé dans des routines et ne peut pas être supprimé. Retirez-le des routines d\'abord.')
    //   return response.redirect().back()
    // }

    await material.delete()
    // Note: material_category CASCADE DELETE via ON DELETE CASCADE (migration 1774000000002)
    session.flash('success', 'Matériel supprimé avec succès')
    return response.redirect().toRoute('materials.index')
  } catch (error) {
    if (error.status === 404) {
      // Matériel inexistant ou n'appartenant pas à l'utilisateur → redirect silencieux
      return response.redirect().toRoute('materials.index')
    }
    logger.error('Material deletion failed', { error, userId: auth.user?.id })
    session.flash('error', 'Une erreur est survenue lors de la suppression du matériel')
    return response.redirect().toRoute('materials.index')
  }
}
```

### 🔥 Pattern Critique — Route `destroy`

```typescript
// start/routes.ts — AVANT
router.resource('materials', MaterialsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])

// APRÈS — Ajouter 'destroy'
router.resource('materials', MaterialsController).only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
```

Ceci génère automatiquement :
- `DELETE /materials/:id → materials.destroy`

### 🔥 État actuel du frontend `Show.tsx` (NE PAS MODIFIER)

```tsx
// inertia/pages/Materials/Show.tsx — déjà implémenté
const [deleting, setDeleting] = useState(false)

const handleDelete = () => {
  setDeleting(true)
  router.delete(`/materials/${material.id}`, {
    onSuccess: () => router.visit('/materials'),
    onError: () => setDeleting(false),
  })
}

// Dans le JSX :
<Popconfirm
  title="Êtes-vous sûr de vouloir supprimer ce matériel ?"
  onConfirm={handleDelete}
  okText="Supprimer"
  cancelText="Annuler"
>
  <Button danger loading={deleting}>Supprimer</Button>
</Popconfirm>
```

### 📊 Analyse Base de Données

La table `material_category` a `ON DELETE CASCADE` sur `material_id` :
```sql
-- migration 1774000000002_create_material_category_table.ts
table.integer('material_id').unsigned().notNullable()
  .references('id').inTable('materials').onDelete('CASCADE')
```

Donc `await material.delete()` suffit — les pivots `material_category` sont supprimés automatiquement au niveau DB. **PAS besoin de `material.related('categories').detach()` avant.**

### ⚠️ Scope Story 3.6 vs. Epic 4

**AC3 (routines check) est intentionnellement non implémenté** :
- La table `material_routine` n'existe pas encore (Epic 4)
- Le modèle `Material` n'a pas de relation `routines` encore
- En Epic 4, ajouter : `@manyToMany(() => Routine, { pivotTable: 'material_routine', ... })` dans `Material`
- En Epic 4, ajouter la vérification dans `destroy()` (voir TODO dans le code ci-dessus)
- En Epic 4, corriger le `onSuccess` dans `Show.tsx` pour gérer le cas d'erreur (si redirect back → ne pas naviguer vers /materials)

### Project Structure Notes

- Alignment avec le pattern existant `CategoryController.destroy()` (même try/catch, même redirect silencieux sur 404)
- Alignment avec patterns d'erreur : `logger.error` + `session.flash('error', ...)` + redirect
- Flash messages affichés globalement via `FlashMessages` composant dans `Layout.tsx`

### References

- Pattern destroy existant : [Source: app/controllers/categories_controller.ts#destroy]
- Migration ON DELETE CASCADE : [Source: database/migrations/1774000000002_create_material_category_table.ts]
- Frontend déjà implémenté : [Source: inertia/pages/Materials/Show.tsx]
- Tests existants : [Source: inertia/pages/Materials/Show.test.tsx]
- Routes resource : [Source: start/routes.ts#47]
- Story 3.4 (contexte implémentation frontend) : [Source: _bmad-output/implementation-artifacts/3-4-detail-dun-materiel.md]
- Epic 3 story 3.6 : [Source: _bmad-output/planning-artifacts/epics.md#1036]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage rencontré. Implémentation directe selon les patterns existants.

### Completion Notes List

- ✅ Méthode `destroy()` ajoutée dans `MaterialsController` avec isolation multi-tenant (`.where('user_id', auth.user!.id).firstOrFail()`)
- ✅ Gestion d'erreurs : 404 → redirect silencieux vers index ; autres erreurs → logger.error + flash error + redirect index
- ✅ TODO Epic 4 commenté pour vérification `material_routine`
- ✅ Route `destroy` ajoutée dans `start/routes.ts` : génère `DELETE /materials/:id → materials.destroy`
- ✅ Frontend `Show.tsx` vérifié : Popconfirm + `router.delete` déjà en place depuis Story 3.4
- ✅ Suite de tests complète : 147 tests passent, 0 régression

### File List

- `app/controllers/materials_controller.ts` (modifié — ajout méthode `destroy()` + déplacement après `store()`)
- `start/routes.ts` (modifié — ajout `'destroy'` à la resource materials)
- `inertia/pages/Materials/Show.tsx` (modifié — fix double navigation + feedback erreur réseau)
- `inertia/pages/Materials/Show.test.tsx` (modifié — test mis à jour suite fix `onSuccess` → `onError`)

## Change Log

- 2026-03-21 : Story 3.6 implémentée — ajout `destroy()` dans MaterialsController + route DELETE /materials/:id
- 2026-03-21 : Code review — fix double navigation `router.visit` dans `handleDelete` (Show.tsx), ajout feedback erreur réseau `message.error`, déplacement méthode `destroy()` après `store()` (ordre RESTful)
