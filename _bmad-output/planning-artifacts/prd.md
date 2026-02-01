---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
projectType: 'greenfield'
classification:
  projectType: 'SaaS B2B - Plateforme web multi-tenant'
  domain: 'Divertissement / Arts du spectacle'
  complexity: 'medium'
  projectContext: 'greenfield'
  platform: 'web'
  userProfiles:
    - 'close-up'
    - 'scene'
    - 'enfants'
    - 'mentalisme'
  keyInsights:
    - 'Support materiel physique ET routines immaterielles'
    - 'Fonctionnalites: inventaire -> routines -> spectacles'
    - 'Besoins avances: historique prestations, maintenance, templates'
---

# Product Requirements Document - magic-inventory

**Organisez la magie**

**Author:** Clement
**Date:** 2026-01-31

## Resume Executif

### Vision

La premiere plateforme digitale dediee aux magiciens professionnels pour gerer leur inventaire, routines et spectacles.

### Probleme

Les magiciens pros jonglent entre plusieurs outils pour gerer leur pratique. magic-inventory centralise inventaire, routines et spectacles en un seul endroit, simple et accessible.

### Utilisateur Cible

Magiciens professionnels de tous styles: close-up, scene, animation enfants, mentalisme.

### Differenciateur Cle

Chaine de valeur integree avec tracabilite bidirectionnelle:
- **Prospective**: Spectacle -> Checklist materiel avec localisation
- **Retrospective**: Retrouver ce qui a ete joue, quand, pour qui

### Classification Projet

| Aspect | Valeur |
|--------|--------|
| Type | SaaS B2B - Plateforme web |
| Domaine | Divertissement / Arts du spectacle |
| Complexite | Moyenne |
| Contexte | Greenfield (nouveau projet) |

## Criteres de Succes

### Succes Utilisateur

- **Gestion d'inventaire fluide**: Ajouter un nouveau materiel (type, categorie, lieu) en moins d'une minute
- **Organisation personnalisee**: Creer et gerer ses propres categories, types et lieux (CRUD complet)
- **Localisation instantanee**: Trouver ou est range un item en quelques clics via filtres
- **Navigation bidirectionnelle**: Voir ou est range un item ET voir le contenu d'un lieu de stockage
- **Creation de routines**: Lier du materiel a une routine, ecrire script/mise en scene/deroule technique
- **Montage de spectacles**: Assembler des routines avec notes et annotations
- **Prise de notes spontanee**: Capturer des idees rapidement via des notes libres

### Succes Technique

- **Rapidite**: Chargement des listes et recherches en < 2 secondes
- **Disponibilite**: Service accessible 24/7 avec maintenance planifiee minimale
- **Fiabilite des donnees**: Backup automatique, aucune perte de donnees utilisateur
- **Isolation securisee**: Donnees completement isolees entre utilisateurs

### Resultats Mesurables

| Metrique | Cible |
|----------|-------|
| Temps d'ajout d'un materiel | < 1 minute |
| Temps de recherche/filtrage | < 5 secondes |
| Disponibilite service | > 99% |
| Perte de donnees | 0 |

## Parcours Utilisateurs

### Parcours 1: Decouverte et Onboarding

**Qui:** Marc, 45 ans, magicien close-up corporate, 200 evenements/an, inventaire dans un Excel de 400 lignes illegible.

**Scene d'ouverture:**
Marc discute avec un collegue magicien apres un congres. "Tu geres comment ton matos toi?" L'autre lui parle de magic-inventory. "C'est gratuit, essaie."

**Action montante:**
Marc cree son compte. Interface vide. Il a le choix: creer directement une routine/spectacle OU commencer par structurer son inventaire. Il choisit de poser les bases:
- Il cree ses premiers lieux: "Tiroir cartes", "Bibliotheque", "Valise close-up"
- Il definit ses categories: "Cartomagie", "Mentalisme", "Pieces"
- Il ajoute son premier materiel: "Jeu Hedan", type cartes, categorie mentalisme, lieu tiroir cartes

**Climax (moment Aha!):**
Apres 20 materiels ajoutes, Marc teste la recherche. Il filtre par categorie "Mentalisme"... 8 resultats. Il cherche par lieu "Valise close-up"... tout ce qu'il doit emporter en deplacement. Il cherche par auteur "Tamariz"... ses 3 livres et 2 jeux apparaissent.

"OK. Ca va vraiment m'aider."

**Resolution:**
Marc a enfin une vue claire de son inventaire. Il sait ou est quoi, peut filtrer, chercher. Le chaos Excel appartient au passe.

### Parcours 2: Preparation d'un Spectacle (Usage Quotidien)

**Qui:** Marc, utilisateur actif avec 50 materiels et 15 routines dans l'app.

**Scene d'ouverture:**
Vendredi 14h. Appel client: "Cocktail corporate ce soir, 1h30 de deambulation, 80 personnes, theme annees 20." Marc doit preparer son set rapidement.

**Action montante:**
Marc ouvre magic-inventory:
1. Il parcourt ses routines, filtre celles adaptees au close-up corporate
2. Il selectionne 6 routines qui collent au theme elegant/vintage
3. Il cree un nouveau spectacle "Cocktail Annees 20 - Client X"
4. Il ajoute les routines selectionnees
5. Il note: "Ambiance feutree, serveurs en costume, eviter les tours trop 'flashy'"

**Climax:**
Marc clique "Generer checklist". L'app affiche:
- Jeu Hedan -> Tiroir cartes
- Pieces anciennes -> Boite pieces
- Carnet prediction -> Valise close-up

Chaque item avec son lieu de rangement. Marc n'a plus qu'a suivre la liste.

**Resolution:**
En 15 minutes, Marc a son spectacle structure et sa checklist de materiel. Il sait exactement quoi prendre et ou le chercher.

### Parcours 3: Gestion d'un Probleme (Cas Limite)

**Qui:** Marc, en preparation de spectacle.

**Scene d'ouverture:**
Marc genere sa checklist pour un gala. L'app indique: "Jeu Invisible Deck -> Tiroir cartes". Il va au tiroir... le jeu n'y est pas.

**Action montante:**
L'app, lors de la generation de checklist, demande systematiquement de valider:
- [ ] Presence confirmee?
- [ ] Bon etat de fonctionnement?

Marc decoche "Jeu Invisible Deck" - il se souvient l'avoir prete a un collegue. Il doit adapter son spectacle ou recuperer le jeu.

**Climax:**
Plus tard, un client rappelle: "C'etait quoi le tour avec les pieces au mariage Dupont l'an dernier?"

Marc ouvre le spectacle "Mariage Dupont - Juin 2025". En un clic:
- Liste des routines jouees
- Liste du materiel utilise

Il retrouve: "Routine: Matrix Coins / Materiel: Set 4 pieces walking liberty"

**Resolution:**
L'app permet la tracabilite dans les deux sens: preparer l'avenir ET retrouver le passe. Rien n'est perdu.

### Resume des Capacites par Parcours

| Parcours | Capacites Revelees |
|----------|-------------------|
| **Onboarding** | Creation compte, lieux, categories, materiel. Recherche/filtrage multi-criteres. |
| **Usage quotidien** | CRUD inventaire/categories/types/lieux, routines, spectacles, generation checklist. |
| **Cas limite** | Validation checklist (presence + etat), tracabilite spectacle -> routines -> materiel. |

## Roadmap Produit

### Strategie MVP

**Approche:** MVP de resolution de probleme
- Resoudre le chaos inventaire/routines/spectacles
- Utilisateur test: vous-meme (dogfooding)
- Validation: si ca vous aide, ca aidera d'autres magiciens

### Phase 1 - MVP

**Fonctionnalites essentielles:**
- Authentification utilisateur
- CRUD inventaire (materiel, livres) avec types, categories, lieux, auteurs
- CRUD lieux de stockage + vue par lieu
- CRUD categories et types personnalisables
- CRUD routines avec editeur + liaison materiel
- CRUD spectacles avec editeur + liaison routines
- Recherche et filtrage multi-criteres
- Generation checklist (materiel + localisation)
- Notes libres

### Phase 2 - Growth

- Historique des prestations (client, date, routines jouees)
- Suivi maintenance materiel (dates revision, alertes)
- Templates de spectacles reutilisables
- Export/Import donnees (backup manuel, migration)

### Phase 3 - Vision

- Application mobile (iOS/Android)
- Partage de routines entre magiciens (optionnel, prive par defaut)
- Statistiques d'utilisation (routines les plus jouees, etc.)

### Risques et Mitigation

| Risque | Mitigation |
|--------|------------|
| Technique | Stack eprouvee, pas de technologie experimentale |
| Marche | Gratuit au depart, dogfooding personnel |
| Ressources | MVP lean, projet solo, hebergement maitrise |
| Adoption lente | Bouche a oreille dans une communaute qui se connait |

## Innovation & Positionnement

### Marche Sous-servi

Le monde de la magie professionnelle manque d'outils numeriques dedies. Il n'existe pas de plateforme SaaS dediee aux magiciens professionnels pour gerer leur pratique.

### Innovation de Workflow

magic-inventory propose une chaine de valeur integree inedite:

```
Inventaire (materiel + livres)
       |
   Routines (scripts + mise en scene)
       |
   Spectacles (assemblage + notes)
       |
   Historique (tracabilite complete)
```

### Avantage Premier Entrant

- Capture d'un marche de niche inexploite
- Potentiel de bouche a oreille dans une communaute qui se connait
- Opportunite de devenir le standard de facto
- Connaissance intime du metier (le createur est magicien)

## Architecture Technique

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Architecture | Monolithe |
| Backend | AdonisJS v6 |
| Frontend | React + Inertia.js |
| ORM | Lucid |
| Database | PostgreSQL |
| UI | Ant Design (latest) |
| Hebergement | CapRover (serveur perso) |

### Modele d'Isolation des Donnees

**Architecture simplifiee:**
- Base de donnees unique
- Chaque ressource porte un `user_id`
- Regles d'acces: un utilisateur ne voit/modifie que ses propres ressources

```
1 compte = 1 magicien = 1 espace prive
```

### Modele de Permissions (MVP)

| Role | Description | Permissions |
|------|-------------|-------------|
| Utilisateur | Magicien proprietaire du compte | Acces total a son espace |

Un compte = une personne = tous les droits sur ses propres donnees.

### Conformite RGPD

**Exigences:**
- Consentement explicite lors de l'inscription
- Droit d'acces aux donnees personnelles
- Droit de rectification
- Droit a l'effacement (suppression de compte)
- Droit a la portabilite (export des donnees)

## Exigences Fonctionnelles

### Gestion des Utilisateurs

- **FR1**: Un visiteur peut creer un compte avec email et mot de passe
- **FR2**: Un utilisateur peut se connecter a son compte
- **FR3**: Un utilisateur peut se deconnecter
- **FR4**: Un utilisateur peut modifier ses informations de profil
- **FR5**: Un utilisateur peut supprimer son compte et toutes ses donnees (RGPD)
- **FR6**: Un utilisateur peut exporter l'ensemble de ses donnees (RGPD)

### Gestion de l'Inventaire

- **FR7**: Un utilisateur peut ajouter un materiel a son inventaire
- **FR8**: Un utilisateur peut modifier un materiel existant
- **FR9**: Un utilisateur peut supprimer un materiel
- **FR10**: Un utilisateur peut associer un type a un materiel
- **FR11**: Un utilisateur peut associer une ou plusieurs categories a un materiel
- **FR12**: Un utilisateur peut associer un lieu de stockage a un materiel
- **FR13**: Un utilisateur peut associer un auteur/createur a un materiel
- **FR14**: Un utilisateur peut voir la liste de tout son inventaire
- **FR15**: Un utilisateur peut voir le detail d'un materiel specifique

### Gestion des Lieux de Stockage

- **FR16**: Un utilisateur peut creer un lieu de stockage
- **FR17**: Un utilisateur peut modifier un lieu de stockage
- **FR18**: Un utilisateur peut supprimer un lieu de stockage
- **FR19**: Un utilisateur peut voir la liste de tous ses lieux de stockage
- **FR20**: Un utilisateur peut voir tout le contenu d'un lieu de stockage donne

### Gestion des Types et Categories

- **FR21**: Un utilisateur peut creer un type personnalise
- **FR22**: Un utilisateur peut modifier un type
- **FR23**: Un utilisateur peut supprimer un type
- **FR24**: Un utilisateur peut creer une categorie personnalisee
- **FR25**: Un utilisateur peut modifier une categorie
- **FR26**: Un utilisateur peut supprimer une categorie
- **FR27**: Un utilisateur dispose de categories par defaut a la creation du compte

### Gestion des Routines

- **FR28**: Un utilisateur peut creer une routine
- **FR29**: Un utilisateur peut modifier une routine
- **FR30**: Un utilisateur peut supprimer une routine
- **FR31**: Un utilisateur peut ecrire/editer le contenu d'une routine (script, mise en scene, deroule)
- **FR32**: Un utilisateur peut lier un ou plusieurs materiels a une routine
- **FR33**: Un utilisateur peut delier un materiel d'une routine
- **FR34**: Un utilisateur peut associer une ou plusieurs categories a une routine
- **FR35**: Un utilisateur peut voir la liste de toutes ses routines
- **FR36**: Un utilisateur peut voir le detail d'une routine avec son contenu et materiels lies

### Gestion des Spectacles

- **FR37**: Un utilisateur peut creer un spectacle
- **FR38**: Un utilisateur peut modifier un spectacle
- **FR39**: Un utilisateur peut supprimer un spectacle
- **FR40**: Un utilisateur peut ecrire/editer des notes pour un spectacle
- **FR41**: Un utilisateur peut lier une ou plusieurs routines a un spectacle
- **FR42**: Un utilisateur peut delier une routine d'un spectacle
- **FR43**: Un utilisateur peut voir la liste de tous ses spectacles
- **FR44**: Un utilisateur peut voir le detail d'un spectacle avec ses routines liees
- **FR45**: Un utilisateur peut generer une checklist de materiel pour un spectacle
- **FR46**: Un utilisateur peut voir pour chaque item de la checklist son lieu de stockage

### Notes Libres

- **FR47**: Un utilisateur peut creer une note libre
- **FR48**: Un utilisateur peut modifier une note libre
- **FR49**: Un utilisateur peut supprimer une note libre
- **FR50**: Un utilisateur peut voir la liste de toutes ses notes libres

### Recherche et Filtrage

- **FR51**: Un utilisateur peut rechercher dans son inventaire par nom
- **FR52**: Un utilisateur peut filtrer son inventaire par type
- **FR53**: Un utilisateur peut filtrer son inventaire par categorie
- **FR54**: Un utilisateur peut filtrer son inventaire par lieu de stockage
- **FR55**: Un utilisateur peut filtrer son inventaire par auteur
- **FR56**: Un utilisateur peut rechercher dans ses routines par nom
- **FR57**: Un utilisateur peut filtrer ses routines par categorie
- **FR58**: Un utilisateur peut rechercher dans ses spectacles par nom

## Exigences Non-Fonctionnelles

### Performance

- **NFR1**: Les pages se chargent en moins de 2 secondes
- **NFR2**: Les recherches et filtrages retournent des resultats en moins de 500ms
- **NFR3**: La generation de checklist se fait en moins de 1 seconde

### Securite

- **NFR4**: Les mots de passe sont hashes (jamais stockes en clair)
- **NFR5**: Les donnees sont isolees par utilisateur (user_id sur chaque ressource)
- **NFR6**: Les sessions expirent apres inactivite prolongee
- **NFR7**: Protection CSRF sur tous les formulaires
- **NFR8**: HTTPS obligatoire en production

### Fiabilite

- **NFR9**: Disponibilite cible de 99% (hors maintenance planifiee)
- **NFR10**: Backup automatique quotidien de la base de donnees
- **NFR11**: Aucune perte de donnees utilisateur en cas de crash

### Accessibilite

- **NFR12**: Navigation possible au clavier
- **NFR13**: Contraste suffisant pour lisibilite
