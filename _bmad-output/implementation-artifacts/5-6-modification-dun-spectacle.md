# Story 5.6: Modification d'un Spectacle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur**,
I want **modifier un spectacle existant**,
so that **je peux corriger ou améliorer mon spectacle** (FR38).

## Acceptance Criteria

**Scenario 1 : Navigation vers la page modification**
- **Given** je suis sur /shows/:id
- **When** je clique sur "Modifier"
- **Then** je suis redirigé vers /shows/:id/edit
- **Note** : Le bouton "Modifier" est déjà en place dans `Show.tsx` — aucune modification de navigation requise.

**Scenario 2 : Formulaire pré-rempli au chargement**
- **Given** je suis sur /shows/:id/edit
- **When** la page se charge
- **Then** le formulaire est pré-rempli avec :
  - Nom actuel
  - Notes actuelles (ou vide si null)
  - Liste des routines liées (avec option d'ajout/retrait)

**Scenario 3 : Validation client en temps réel**
- **Given** le formulaire est pré-rempli
- **When** je vide le champ Nom
- **Then** le message d'erreur "Le nom est requis" s'affiche immédiatement (Ant Design Form validation)
- **And** le bouton "Enregistrer" ne soumet pas le formulaire tant que le Nom est vide

**Scenario 4 : Soumission avec données valides**
- **Given** je modifie le spectacle
- **When** je soumets le formulaire avec des données valides
- **Then** `updateShowValidator` valide côté serveur (Nom requis, Notes optionnelles)
- **And** le spectacle est mis à jour dans la table `shows`
- **And** un message success s'affiche : **"Spectacle modifié avec succès"**
- **And** je suis redirigé vers /shows/:id

**Scenario 5 : Annulation sans sauvegarde**
- **Given** je suis sur la page modification
- **When** je clique sur "Annuler"
- **Then** je suis redirigé vers /shows/:id sans sauvegarder

## Tasks / Subtasks

### Backend — Corrections `update()` (AC: 4, 5)

- [x] Modifier `app/controllers/shows_controller.ts` — méthode `update()`
  - [x] Inverser l'ordre : `firstOrFail()` AVANT `request.validateUsing(...)` (cohérence architecture, pattern code review 4.6)
  - [x] Corriger le message flash : `'Spectacle enregistré avec succès'` → `'Spectacle modifié avec succès'`
  - [x] Corriger la redirection : `toPath(\`/shows/${show.id}/edit\`)` → `toPath(\`/shows/${show.id}\`)`

### Frontend — Correction bouton "Annuler" dans `Edit.tsx` (AC: 5)

- [x] Modifier `inertia/pages/Shows/Edit.tsx`
  - [x] Corriger le bouton "Annuler" : `router.visit('/shows')` → `router.visit(\`/shows/${show.id}\`)`

### Tests — Mise à jour `Edit.test.tsx` (AC: 5)

- [x] Modifier `inertia/pages/Shows/Edit.test.tsx`
  - [x] Corriger le test "appelle router.visit /shows au clic Annuler" : `'/shows'` → `'/shows/1'`
  - [x] Renommer le test : `'appelle router.visit /shows au clic Annuler'` → `'appelle router.visit /shows/1 au clic Annuler'`
- [x] Lancer `npx vitest run` — 309 tests (tous) passent, 0 régression

## Dev Notes

### 🎯 Contexte — Ce que Story 5.6 représente

Story 5.6 **valide** la modification de spectacle de bout en bout. La quasi-totalité de l'implémentation a été faite dans les stories précédentes :
- **Story 5.1** : Création de spectacle — a créé les routes `resource`, `create()`, `store()`, `edit()`, `update()`, `attachRoutine()`, `detachRoutine()`
- **Story 5.2** : Éditeur de notes — a complété `Edit.tsx` avec le champ Notes (TextArea), le formulaire complet, et les 20 tests dans `Edit.test.tsx`

**Ce que Story 5.6 AJOUTE uniquement :**
1. Correction du message flash : `'Spectacle enregistré avec succès'` → `'Spectacle modifié avec succès'`
2. Correction de la redirection post-update : `/shows/${id}/edit` → `/shows/${id}`
3. Correction du bouton "Annuler" : `/shows` → `/shows/${id}`
4. Inversion firstOrFail/validateUsing (best practice code review)

### 🏗️ Backend — Seul changement requis dans `update()`

**AVANT (actuel — 3 problèmes) :**
```typescript
async update({ params, request, auth, session, response }: HttpContext) {
  const data = await request.validateUsing(updateShowValidator)  // ❌ validateUsing avant firstOrFail

  const show = await Show.query()
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  try {
    show.name = data.name
    show.notes = data.notes?.trim() || null
    await show.save()

    session.flash('success', 'Spectacle enregistré avec succès')         // ❌ mauvais message
    return response.redirect().toPath(`/shows/${show.id}/edit`)          // ❌ mauvaise redirection
  } catch (error) {
    logger.error('Failed to update show', { error, data })
    session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
    return response.redirect().back()
  }
}
```

**APRÈS (cible — 3 corrections) :**
```typescript
async update({ params, request, auth, session, response }: HttpContext) {
  const show = await Show.query()                                       // ✓ firstOrFail en premier
    .where('user_id', auth.user!.id)
    .where('id', params.id)
    .firstOrFail()

  const data = await request.validateUsing(updateShowValidator)        // ✓ validateUsing après

  try {
    show.name = data.name
    show.notes = data.notes?.trim() || null
    await show.save()

    session.flash('success', 'Spectacle modifié avec succès')          // ✓ bon message
    return response.redirect().toPath(`/shows/${show.id}`)             // ✓ bonne redirection
  } catch (error) {
    logger.error('Failed to update show', { error, data })
    session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
    return response.redirect().back()
  }
}
```

### 🏗️ Frontend — Seul changement requis dans `Edit.tsx`

**AVANT (ligne 92) :**
```tsx
<Button onClick={() => router.visit('/shows')}>Annuler</Button>
```

**APRÈS :**
```tsx
<Button onClick={() => router.visit(`/shows/${show.id}`)}>Annuler</Button>
```

**Pourquoi** : L'AC dit "redirigé vers /shows/:id sans sauvegarder" — la page détail du spectacle, pas la liste.

### 🏗️ Routes — Déjà configurées

```typescript
// start/routes.ts — DÉJÀ en place depuis Story 5.1 :
router.resource('shows', ShowsController).only(['index', 'create', 'store', 'show', 'edit', 'update'])
// Génère automatiquement :
//   GET  /shows/:id/edit  → edit()
//   PUT  /shows/:id       → update()
```

### 🏗️ Frontend — `Edit.tsx` déjà complet (sauf bouton Annuler)

Le composant `inertia/pages/Shows/Edit.tsx` est complet :
- Pré-remplissage nom + notes via `initialValues` ✓
- Validation client "Le nom est requis" ✓
- `router.put(\`/shows/${show.id}\`, values, ...)` pour soumission ✓
- Section routines (Empty + List + bouton "Retirer" Popconfirm) ✓
- Modal "Ajouter des routines" avec Select multiple ✓
- **Seul bug** : bouton "Annuler" → `/shows` au lieu de `/shows/${show.id}`

### 🏗️ Tests — `Edit.test.tsx` déjà complet (1 correction)

Les 20 tests existants couvrent tous les AC. Seule correction nécessaire :

```typescript
// AVANT (ligne 131–136) :
it('appelle router.visit /shows au clic Annuler', async () => {
  ...
  expect(router.visit).toHaveBeenCalledWith('/shows')
})

// APRÈS :
it('appelle router.visit /shows/1 au clic Annuler', async () => {
  ...
  expect(router.visit).toHaveBeenCalledWith('/shows/1')
})
```

### ⚠️ Points d'Attention

**1. Ordre firstOrFail/validateUsing — Code review best practice**
Pattern établi lors du code review de Story 4.6 : `firstOrFail()` doit précéder `validateUsing()`. Raison : on vérifie d'abord que la ressource existe et appartient à l'utilisateur (IDOR), puis on valide les données d'entrée. Évite de valider des données pour une ressource inexistante.

**2. Redirection post-update — /shows/:id pas /shows/:id/edit**
L'AC dit explicitement "redirigé vers /shows/:id" (page détail). Le comportement actuel qui redirige vers la page édition crée une boucle d'édition. Après une modification réussie, l'utilisateur doit voir le détail du spectacle modifié.

**3. Bouton "Annuler" — /shows/:id pas /shows**
L'AC dit "redirigé vers /shows/:id sans sauvegarder". La liste générale `/shows` est incorrecte — l'utilisateur doit retourner au détail du spectacle qu'il était en train de modifier.

**4. Breadcrumb — Comportement attendu**
`<Layout title="Modifier le spectacle">` génère un breadcrumb : Accueil > Shows > [id] > Modifier le spectacle. Limitation connue du Layout (segment ID s'affiche tel quel). Comportement accepté depuis Story 4.6 — ne pas modifier Layout pour ce point.

**5. message flash backend — Non testé**
Aucun test frontend ne vérifie le contenu du flash message backend. Le changement est non-breaking.

**6. Nombre de tests actuel : 309**
Après Story 5.5 + code review. `npx vitest run` doit afficher 309 tests passants après les corrections.

**7. Ownership IDOR — Déjà en place**
`update()` vérifie `.where('user_id', auth.user!.id)` sur la ressource show. Pas de changement nécessaire sur ce point.

### 📊 Structure des Fichiers

```
Fichiers à MODIFIER :
app/controllers/shows_controller.ts    ← update() : ordre, message flash, redirection (3 lignes)
inertia/pages/Shows/Edit.tsx           ← bouton "Annuler" : /shows → /shows/${show.id} (1 ligne)
inertia/pages/Shows/Edit.test.tsx      ← test "Annuler" : '/shows' → '/shows/1' (2 lignes)

Fichiers à VÉRIFIER (aucune modification attendue) :
start/routes.ts                        ← VÉRIFIER (routes edit + update déjà là via resource)
app/validators/shows/update_show_validator.ts  ← VÉRIFIER (complet — name + notes)
inertia/pages/Shows/Show.tsx           ← VÉRIFIER (bouton "Modifier" → /shows/:id/edit déjà en place)

Fichiers NON modifiés :
app/models/show.ts                     ← Déjà complet
app/models/routine.ts                  ← Déjà complet
inertia/pages/Shows/Checklist.tsx      ← Non concerné
inertia/pages/Shows/Index.tsx          ← Non concerné
```

### 📝 Learnings des Stories Précédentes

**Story 4.6 (modification routine — pattern maître) :**
- Seul vrai delta : message flash + ordre validateUsing/firstOrFail
- `firstOrFail()` AVANT `validateUsing()` (code review best practice)
- Title Layout : `title="Modifier"` pour le breadcrumb propre (le nôtre dit "Modifier le spectacle" — acceptable)

**Story 5.5 (checklist — code review) :**
- 309 tests actuel (après fixes Story 5.5)
- `npx vitest run` pour vérifier 0 régression
- `vi.clearAllMocks()` dans `beforeEach`

**Story 5.2 (éditeur notes — origine Edit.tsx) :**
- `router.put(\`/shows/${show.id}\`, values, { onFinish })` — pattern soumission Inertia
- `Form.useForm()` + `initialValues` pour pré-remplissage
- `autoSize={{ minRows: 10, maxRows: 30 }}` sur TextArea notes

**Story 5.1 (création show — origine controller) :**
- `router.resource('shows', ...).only([...])` génère edit + update routes automatiquement
- `attachRoutine` + `detachRoutine` routes custom séparées

### Project Structure Notes

- Controller : `app/controllers/shows_controller.ts` (modifier — 3 lignes dans `update()`)
- Frontend : `inertia/pages/Shows/Edit.tsx` (modifier — 1 ligne bouton Annuler)
- Tests co-localisés : `inertia/pages/Shows/Edit.test.tsx` (modifier — 1 test)

### References

- Pattern update() + ordre firstOrFail/validateUsing : [Source: _bmad-output/implementation-artifacts/4-6-modification-dune-routine.md#Dev Notes]
- Controller shows complet actuel : [Source: app/controllers/shows_controller.ts#97-117]
- Edit.tsx (bouton Annuler ligne 92) : [Source: inertia/pages/Shows/Edit.tsx#92]
- Edit.test.tsx (test Annuler ligne 131-136) : [Source: inertia/pages/Shows/Edit.test.tsx#131-136]
- updateShowValidator : [Source: app/validators/shows/update_show_validator.ts]
- Routes shows : [Source: start/routes.ts#53]
- Bouton "Modifier" dans Show.tsx : [Source: inertia/pages/Shows/Show.tsx#32]
- Epic 5 Story 5.6 : [Source: _bmad-output/planning-artifacts/epics.md#Story 5.6]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ `update()` : `firstOrFail()` déplacé avant `validateUsing()` (IDOR best practice, pattern code review 4.6)
- ✅ Message flash corrigé : `'Spectacle enregistré avec succès'` → `'Spectacle modifié avec succès'`
- ✅ Redirection post-update corrigée : `/shows/${id}/edit` → `/shows/${id}` (page détail, pas boucle édition)
- ✅ Bouton "Annuler" corrigé : `/shows` → `/shows/${show.id}` (retour au détail du spectacle)
- ✅ Test "Annuler" : renommé + id dynamique (id:42) pour prouver l'usage de `show.id`
- ✅ Code review fixes : onError handler, double trim supprimé, okButtonProps disabled, Change Log
- ✅ 311 tests passants, 0 régression (`npx vitest run`)

### File List

- app/controllers/shows_controller.ts
- inertia/pages/Shows/Edit.tsx
- inertia/pages/Shows/Edit.test.tsx

## Change Log

- 2026-03-22 : Story 5.6 implémentée — correction `update()` (ordre firstOrFail/validateUsing, message flash, redirection), bouton "Annuler" redirige vers `/shows/:id`, test mis à jour avec id dynamique. Code review fixes : `onError` handler dans `router.put()`, suppression double trim notes, modal "Ajouter" désactivé si aucune routine sélectionnée.

## Senior Developer Review (AI)

**Date :** 2026-03-22
**Outcome :** Changes Requested → Fixed (auto-fix appliqué)

### Action Items

- [x] [Med] `Edit.tsx:38-40` — Pas de callback `onError` dans `router.put()` — erreurs serveur non affichées inline
- [x] [Med] `Edit.test.tsx:131` — Test "Annuler" utilisait `mockShow.id=1` ; renommé avec `id:42` pour prouver l'usage dynamique
- [x] [Low] Story sans section `## Change Log` — ajoutée
- [x] [Low] `shows_controller.ts:107` — Double trim sur `data.notes` (VineJS trimme déjà) — supprimé
- [x] [Low] `Edit.tsx` — Modal "Ajouter" actif même si aucune routine sélectionnée — `okButtonProps` ajouté
