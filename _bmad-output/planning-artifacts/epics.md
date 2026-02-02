---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'validation-complete']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
validationDate: '2026-02-02'
validationStatus: 'approved'
---

# magic-inventory - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for magic-inventory, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Gestion des Utilisateurs (FR1-FR6) :**
- FR1: Un visiteur peut créer un compte avec email et mot de passe
- FR2: Un utilisateur peut se connecter à son compte
- FR3: Un utilisateur peut se déconnecter
- FR4: Un utilisateur peut modifier ses informations de profil
- FR5: Un utilisateur peut supprimer son compte et toutes ses données (RGPD)
- FR6: Un utilisateur peut exporter l'ensemble de ses données (RGPD)

**Gestion de l'Inventaire (FR7-FR15) :**
- FR7: Un utilisateur peut ajouter un matériel à son inventaire
- FR8: Un utilisateur peut modifier un matériel existant
- FR9: Un utilisateur peut supprimer un matériel
- FR10: Un utilisateur peut associer un type à un matériel
- FR11: Un utilisateur peut associer une ou plusieurs catégories à un matériel
- FR12: Un utilisateur peut associer un lieu de stockage à un matériel
- FR13: Un utilisateur peut associer un auteur/créateur à un matériel
- FR14: Un utilisateur peut voir la liste de tout son inventaire
- FR15: Un utilisateur peut voir le détail d'un matériel spécifique

**Gestion des Lieux de Stockage (FR16-FR20) :**
- FR16: Un utilisateur peut créer un lieu de stockage
- FR17: Un utilisateur peut modifier un lieu de stockage
- FR18: Un utilisateur peut supprimer un lieu de stockage
- FR19: Un utilisateur peut voir la liste de tous ses lieux de stockage
- FR20: Un utilisateur peut voir tout le contenu d'un lieu de stockage donné

**Gestion des Types et Catégories (FR21-FR27) :**
- FR21: Un utilisateur peut créer un type personnalisé
- FR22: Un utilisateur peut modifier un type
- FR23: Un utilisateur peut supprimer un type
- FR24: Un utilisateur peut créer une catégorie personnalisée
- FR25: Un utilisateur peut modifier une catégorie
- FR26: Un utilisateur peut supprimer une catégorie
- FR27: Un utilisateur dispose de catégories par défaut à la création du compte

**Gestion des Routines (FR28-FR36) :**
- FR28: Un utilisateur peut créer une routine
- FR29: Un utilisateur peut modifier une routine
- FR30: Un utilisateur peut supprimer une routine
- FR31: Un utilisateur peut écrire/éditer le contenu d'une routine (script, mise en scène, déroulé)
- FR32: Un utilisateur peut lier un ou plusieurs matériels à une routine
- FR33: Un utilisateur peut délier un matériel d'une routine
- FR34: Un utilisateur peut associer une ou plusieurs catégories à une routine
- FR35: Un utilisateur peut voir la liste de toutes ses routines
- FR36: Un utilisateur peut voir le détail d'une routine avec son contenu et matériels liés

**Gestion des Spectacles (FR37-FR46) :**
- FR37: Un utilisateur peut créer un spectacle
- FR38: Un utilisateur peut modifier un spectacle
- FR39: Un utilisateur peut supprimer un spectacle
- FR40: Un utilisateur peut écrire/éditer des notes pour un spectacle
- FR41: Un utilisateur peut lier une ou plusieurs routines à un spectacle
- FR42: Un utilisateur peut délier une routine d'un spectacle
- FR43: Un utilisateur peut voir la liste de tous ses spectacles
- FR44: Un utilisateur peut voir le détail d'un spectacle avec ses routines liées
- FR45: Un utilisateur peut générer une checklist de matériel pour un spectacle
- FR46: Un utilisateur peut voir pour chaque item de la checklist son lieu de stockage

**Notes Libres (FR47-FR50) :**
- FR47: Un utilisateur peut créer une note libre
- FR48: Un utilisateur peut modifier une note libre
- FR49: Un utilisateur peut supprimer une note libre
- FR50: Un utilisateur peut voir la liste de toutes ses notes libres

**Recherche et Filtrage (FR51-FR58) :**
- FR51: Un utilisateur peut rechercher dans son inventaire par nom
- FR52: Un utilisateur peut filtrer son inventaire par type
- FR53: Un utilisateur peut filtrer son inventaire par catégorie
- FR54: Un utilisateur peut filtrer son inventaire par lieu de stockage
- FR55: Un utilisateur peut filtrer son inventaire par auteur
- FR56: Un utilisateur peut rechercher dans ses routines par nom
- FR57: Un utilisateur peut filtrer ses routines par catégorie
- FR58: Un utilisateur peut rechercher dans ses spectacles par nom

### NonFunctional Requirements

**Performance (NFR1-NFR3) :**
- NFR1: Les pages se chargent en moins de 2 secondes
- NFR2: Les recherches et filtrages retournent des résultats en moins de 500ms
- NFR3: La génération de checklist se fait en moins de 1 seconde

**Sécurité (NFR4-NFR8) :**
- NFR4: Les mots de passe sont hashés (jamais stockés en clair)
- NFR5: Les données sont isolées par utilisateur (user_id sur chaque ressource)
- NFR6: Les sessions expirent après inactivité prolongée
- NFR7: Protection CSRF sur tous les formulaires
- NFR8: HTTPS obligatoire en production

**Fiabilité (NFR9-NFR11) :**
- NFR9: Disponibilité cible de 99% (hors maintenance planifiée)
- NFR10: Backup automatique quotidien de la base de données
- NFR11: Aucune perte de données utilisateur en cas de crash

**Accessibilité (NFR12-NFR13) :**
- NFR12: Navigation possible au clavier
- NFR13: Contraste suffisant pour lisibilité

### Additional Requirements

**Architecture Technique :**
- Starter Template AdonisJS v6 Inertia avec commande : `npm init adonisjs@latest magic-inventory -- -K=inertia --adapter=react --no-ssr`
- Stack : AdonisJS v6 + React + Inertia.js + PostgreSQL 16 + Ant Design 6.2.2
- Isolation multi-tenant : Scoping global automatique par user_id sur tous les modèles Lucid
- Validation double : Client (Ant Design Form rules) + Serveur (AdonisJS Validators)
- Conventions de nommage : snake_case DB (tables, colonnes), camelCase TypeScript (variables, fonctions), PascalCase (composants React, Models), pluriel strict pour routes RESTful
- Error handling unifié : Exceptions AdonisJS + flash messages en français (success/error/warning/info)
- Tests co-localisés : Fichiers .test.tsx à côté des fichiers source frontend
- Backup quotidien PostgreSQL : pg_dump via cron (3h du matin, rotation 7 jours)
- Configuration PostgreSQL Docker : docker-compose.yml avec PostgreSQL 16-alpine
- Dépendances post-installation : pg, antd@6.2.2, dayjs, vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom
- Formatage dates : ISO 8601 backend + dayjs pour affichage français frontend
- Loading states : Utiliser composants Ant Design (Spin, Skeleton, Button.loading, Table.loading)
- Routes RESTful : Resource routes AdonisJS avec pluriel strict (materials, routines, shows, storage-locations en kebab-case)

**UX Design :**
- Navigation Sidebar persistante : Sections toujours visibles (Inventaire, Routines, Spectacles, Notes) via Ant Design Layout + Menu
- Recherche globale Cmd+K : Accessible partout, instantanée (< 500ms), search-as-you-type via Input.Search
- Breadcrumbs contextuels : L'utilisateur sait toujours où il est via Ant Design Breadcrumb
- Vues multiples inventaire : Vue Cards (vision macro avec badges) + Vue Table (détails/filtrage avancé) avec switcher
- Liens bidirectionnels : Navigation 1-clic entre Matériel ↔ Routines ↔ Spectacles (traçabilité complète)
- Progressive disclosure : Filtres avancés accessibles via Drawer ou collapse mais interface épurée par défaut
- Espaces blancs généreux : Interface aérée Apple-inspired via tokens Ant Design (padding: 16, margin: 16)
- Cohérence boutons : Bleu primaire (#1890ff) actions principales, Gris secondaire, Rouge danger (#ff4d4f)
- Auto-save notes volantes : Sauvegarde pendant la frappe (pas de bouton "Enregistrer")
- Messages feedback : Ant Design message component (success, error, warning, info) en français
- Ajout matériel ultra-rapide : Objectif 30 secondes max (formulaire épuré, champs essentiels uniquement)
- Onboarding optionnel : Tour guidé non-intrusif au premier lancement, relançable à tout moment
- Checklist interactive : Génération visuelle avec validation progressive (checkbox cocher au fur et à mesure)
- Responsive mobile bonus : Mode consultation pour routines et checklists en déplacement

### FR Coverage Map

**Epic 1 - Authentification et Accès Sécurisé (6 FR) :**
- FR1: Un visiteur peut créer un compte avec email et mot de passe
- FR2: Un utilisateur peut se connecter à son compte
- FR3: Un utilisateur peut se déconnecter
- FR4: Un utilisateur peut modifier ses informations de profil
- FR5: Un utilisateur peut supprimer son compte et toutes ses données (RGPD)
- FR6: Un utilisateur peut exporter l'ensemble de ses données (RGPD)

**Epic 2 - Organisation et Taxonomie (12 FR) :**
- FR16: Un utilisateur peut créer un lieu de stockage
- FR17: Un utilisateur peut modifier un lieu de stockage
- FR18: Un utilisateur peut supprimer un lieu de stockage
- FR19: Un utilisateur peut voir la liste de tous ses lieux de stockage
- FR20: Un utilisateur peut voir tout le contenu d'un lieu de stockage donné
- FR21: Un utilisateur peut créer un type personnalisé
- FR22: Un utilisateur peut modifier un type
- FR23: Un utilisateur peut supprimer un type
- FR24: Un utilisateur peut créer une catégorie personnalisée
- FR25: Un utilisateur peut modifier une catégorie
- FR26: Un utilisateur peut supprimer une catégorie
- FR27: Un utilisateur dispose de catégories par défaut à la création du compte

**Epic 3 - Gestion de l'Inventaire (14 FR) :**
- FR7: Un utilisateur peut ajouter un matériel à son inventaire
- FR8: Un utilisateur peut modifier un matériel existant
- FR9: Un utilisateur peut supprimer un matériel
- FR10: Un utilisateur peut associer un type à un matériel
- FR11: Un utilisateur peut associer une ou plusieurs catégories à un matériel
- FR12: Un utilisateur peut associer un lieu de stockage à un matériel
- FR13: Un utilisateur peut associer un auteur/créateur à un matériel
- FR14: Un utilisateur peut voir la liste de tout son inventaire
- FR15: Un utilisateur peut voir le détail d'un matériel spécifique
- FR51: Un utilisateur peut rechercher dans son inventaire par nom
- FR52: Un utilisateur peut filtrer son inventaire par type
- FR53: Un utilisateur peut filtrer son inventaire par catégorie
- FR54: Un utilisateur peut filtrer son inventaire par lieu de stockage
- FR55: Un utilisateur peut filtrer son inventaire par auteur

**Epic 4 - Création et Gestion des Routines (11 FR) :**
- FR28: Un utilisateur peut créer une routine
- FR29: Un utilisateur peut modifier une routine
- FR30: Un utilisateur peut supprimer une routine
- FR31: Un utilisateur peut écrire/éditer le contenu d'une routine (script, mise en scène, déroulé)
- FR32: Un utilisateur peut lier un ou plusieurs matériels à une routine
- FR33: Un utilisateur peut délier un matériel d'une routine
- FR34: Un utilisateur peut associer une ou plusieurs catégories à une routine
- FR35: Un utilisateur peut voir la liste de toutes ses routines
- FR36: Un utilisateur peut voir le détail d'une routine avec son contenu et matériels liés
- FR56: Un utilisateur peut rechercher dans ses routines par nom
- FR57: Un utilisateur peut filtrer ses routines par catégorie

**Epic 5 - Spectacles et Préparation de Prestations (11 FR) :**
- FR37: Un utilisateur peut créer un spectacle
- FR38: Un utilisateur peut modifier un spectacle
- FR39: Un utilisateur peut supprimer un spectacle
- FR40: Un utilisateur peut écrire/éditer des notes pour un spectacle
- FR41: Un utilisateur peut lier une ou plusieurs routines à un spectacle
- FR42: Un utilisateur peut délier une routine d'un spectacle
- FR43: Un utilisateur peut voir la liste de tous ses spectacles
- FR44: Un utilisateur peut voir le détail d'un spectacle avec ses routines liées
- FR45: Un utilisateur peut générer une checklist de matériel pour un spectacle
- FR46: Un utilisateur peut voir pour chaque item de la checklist son lieu de stockage
- FR58: Un utilisateur peut rechercher dans ses spectacles par nom

**Epic 6 - Capture Spontanée d'Idées (4 FR) :**
- FR47: Un utilisateur peut créer une note libre
- FR48: Un utilisateur peut modifier une note libre
- FR49: Un utilisateur peut supprimer une note libre
- FR50: Un utilisateur peut voir la liste de toutes ses notes libres

**Couverture Totale : 58 FR / 58 (100%)**

## Epic List

### Epic 1: Authentification et Accès Sécurisé

Les utilisateurs peuvent créer un compte, se connecter de manière sécurisée et gérer leurs données personnelles (RGPD compliant).

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6

**Implementation Notes:**
- Story 1.1 inclura l'initialisation du projet (starter template AdonisJS + config PostgreSQL + Ant Design + Layout de base avec Sidebar navigation)
- Auth session-based avec isolation multi-tenant (user_id scoping)
- Export données et suppression compte pour RGPD

### Epic 2: Organisation et Taxonomie

Les utilisateurs peuvent structurer leur espace avec des lieux de stockage et une taxonomie personnalisée (types et catégories).

**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27

**Implementation Notes:**
- Catégories par défaut créées à l'inscription (FR27)
- Vue contenu d'un lieu (FR20) pour navigation bidirectionnelle
- Fondation nécessaire pour l'inventaire (Epic 3)

### Epic 3: Gestion de l'Inventaire

Les utilisateurs peuvent gérer leur inventaire de matériel magique avec recherche et filtrage multi-critères puissants.

**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR51, FR52, FR53, FR54, FR55

**Implementation Notes:**
- Vues multiples : Cards (vision macro) + Table (détails/filtrage)
- Recherche instantanée < 500ms (NFR2)
- Ajout matériel ultra-rapide < 30s (UX Design)
- Liens avec lieux, types, catégories (Epic 2)

### Epic 4: Création et Gestion des Routines

Les utilisateurs peuvent créer et gérer leurs routines magiques avec liaison au matériel et éditeur de contenu riche.

**FRs covered:** FR28, FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR56, FR57

**Implementation Notes:**
- Éditeur de contenu pour script/mise en scène/déroulé (FR31)
- Liaison matériel avec navigation bidirectionnelle (clic sur matériel → voir routine)
- Recherche et filtrage routines
- Fondation pour spectacles (Epic 5)

### Epic 5: Spectacles et Préparation de Prestations

Les utilisateurs peuvent créer des spectacles et générer automatiquement des checklists de matériel avec emplacements pour leurs prestations.

**FRs covered:** FR37, FR38, FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR58

**Implementation Notes:**
- Génération checklist < 1s (NFR3) avec emplacements des items
- Checklist interactive avec validation progressive (UX Design)
- Navigation bidirectionnelle complète : Spectacle → Routine → Matériel
- Traçabilité complète du matériel utilisé

### Epic 6: Capture Spontanée d'Idées

Les utilisateurs peuvent capturer spontanément des idées et notes libres sans perdre d'information.

**FRs covered:** FR47, FR48, FR49, FR50

**Implementation Notes:**
- Auto-save pendant la frappe (UX Design)
- Accès rapide via bouton flottant ou Cmd+N
- Aucune idée ne se perd jamais

---

## Epic 1: Authentification et Accès Sécurisé

Les utilisateurs peuvent créer un compte, se connecter de manière sécurisée et gérer leurs données personnelles (RGPD compliant).

### Story 1.1: Initialisation du Projet et Configuration de Base

As a **développeur**,
I want **initialiser le projet avec le starter AdonisJS Inertia et configurer toutes les dépendances de base**,
So that **l'environnement de développement est prêt avec l'authentification de base fonctionnelle**.

**Acceptance Criteria:**

**Given** le projet n'existe pas encore
**When** j'exécute la commande d'initialisation
**Then** le projet est créé avec le starter AdonisJS v6 Inertia + React (sans SSR)
**And** l'auth layer de base est inclus (register, login, logout)

**Given** le projet est initialisé
**When** je configure PostgreSQL via Docker
**Then** le fichier docker-compose.yml existe avec PostgreSQL 16-alpine
**And** le fichier .env contient les variables de connexion DB correctes
**And** la connexion à la base de données fonctionne

**Given** PostgreSQL est configuré
**When** j'installe les dépendances complémentaires
**Then** les packages pg, antd@6.2.2, dayjs sont installés
**And** les dépendances dev vitest, @vitejs/plugin-react, jsdom, @testing-library/react sont installées

**Given** les dépendances sont installées
**When** je configure Ant Design dans inertia/app.tsx
**Then** le ConfigProvider est configuré avec locale frFR
**And** le thème personnalisé est appliqué (colorPrimary: #1890ff, borderRadius: 4, etc.)
**And** le CSS reset Ant Design est importé

**Given** Ant Design est configuré
**When** je configure Vitest
**Then** le fichier vitest.config.ts existe
**And** l'environnement jsdom est configuré
**And** la commande npm run test:front fonctionne

**Given** toute la configuration est complète
**When** je lance npm run dev
**Then** le serveur démarre sur http://localhost:3333
**And** les pages register, login, logout de base fonctionnent
**And** le HMR (Hot Module Replacement) fonctionne

### Story 1.2: Layout de Base et Navigation

As a **utilisateur**,
I want **une interface claire avec navigation sidebar et breadcrumbs**,
So that **je peux naviguer facilement dans l'application**.

**Acceptance Criteria:**

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

### Story 1.3: Personnalisation des Pages d'Authentification

As a **visiteur**,
I want **des pages d'inscription et de connexion en français avec design Ant Design personnalisé**,
So that **je peux créer un compte et me connecter avec une interface professionnelle**.

**Acceptance Criteria:**

**Given** l'auth de base du starter existe
**When** je personnalise la page Register
**Then** la page utilise Ant Design Form avec le thème personnalisé
**And** les labels sont en français : "Email", "Mot de passe", "Confirmer le mot de passe"
**And** les messages de validation sont en français
**And** le bouton principal utilise colorPrimary (#1890ff)

**Given** la page Register est personnalisée
**When** je personnalise la page Login
**Then** la page utilise Ant Design Form avec le thème personnalisé
**And** les labels sont en français : "Email", "Mot de passe"
**And** les messages d'erreur sont en français
**And** le lien "Mot de passe oublié ?" est visible

**Given** les pages sont personnalisées
**When** j'ajoute la validation client Ant Design Form
**Then** les règles de validation sont définies (email requis, format email valide, mot de passe min 8 caractères)
**And** les erreurs s'affichent en temps réel
**And** le feedback est immédiat (< 100ms)

**Given** un visiteur remplit le formulaire Register
**When** il soumet avec des données valides (FR1)
**Then** le compte est créé dans la base de données
**And** le mot de passe est hashé avec bcrypt (NFR4)
**And** les catégories par défaut sont créées pour ce user (FR27, sera implémenté dans Epic 2)
**And** un message success s'affiche : "Compte créé avec succès"
**And** l'utilisateur est redirigé vers /login

**Given** un utilisateur avec compte existant remplit Login
**When** il soumet avec credentials valides (FR2)
**Then** une session est créée (cookie HTTP-only)
**And** l'utilisateur est redirigé vers /dashboard
**And** le middleware auth protège les routes

**Given** un utilisateur est connecté
**When** il clique sur Déconnexion (FR3)
**Then** la session est détruite
**And** l'utilisateur est redirigé vers /login
**And** il ne peut plus accéder aux routes protégées

### Story 1.4: Gestion du Profil Utilisateur

As a **utilisateur connecté**,
I want **modifier mes informations de profil**,
So that **je peux maintenir mes données personnelles à jour** (FR4).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page /profile
**Then** je vois un formulaire Ant Design pré-rempli avec mes informations actuelles
**And** les champs disponibles sont : Nom, Email
**And** le breadcrumb affiche : Accueil > Profil

**Given** je suis sur la page profil
**When** je modifie mon nom
**Then** la validation client vérifie que le nom n'est pas vide
**And** le bouton "Enregistrer" est de type primary (bleu)

**Given** je modifie mes informations
**When** je soumets le formulaire avec données valides
**Then** le validator AdonisJS UpdateProfileValidator valide côté serveur
**And** les modifications sont sauvegardées dans la table users
**And** un message success s'affiche : "Profil mis à jour avec succès"
**And** les données affichées sont mises à jour

**Given** je modifie mon email
**When** je soumets avec un email déjà utilisé
**Then** une erreur serveur est retournée
**And** un message error s'affiche : "Cet email est déjà utilisé"
**And** le formulaire reste pré-rempli avec mes modifications

### Story 1.5: Suppression de Compte RGPD

As a **utilisateur connecté**,
I want **supprimer mon compte et toutes mes données**,
So that **je peux exercer mon droit à l'effacement RGPD** (FR5).

**Acceptance Criteria:**

**Given** je suis sur la page /profile
**When** je vois la section "Zone dangereuse"
**Then** un bouton "Supprimer mon compte" est affiché
**And** le bouton est de type danger (rouge #ff4d4f)

**Given** je clique sur "Supprimer mon compte"
**When** la confirmation s'affiche
**Then** un Modal Ant Design s'ouvre
**And** le titre est : "Êtes-vous sûr de vouloir supprimer votre compte ?"
**And** le message explique : "Cette action est irréversible. Toutes vos données seront supprimées définitivement."

**Given** le modal de confirmation est ouvert
**When** je confirme la suppression
**Then** mon compte utilisateur est supprimé de la table users
**And** toutes mes données liées sont supprimées en cascade (matériels, routines, spectacles, notes, lieux, catégories, types)
**And** la session est détruite
**And** je suis redirigé vers /login
**And** un message info s'affiche : "Votre compte a été supprimé"

**Given** le modal de confirmation est ouvert
**When** j'annule la suppression
**Then** le modal se ferme
**And** aucune action n'est effectuée
**And** je reste sur la page profil

### Story 1.6: Export des Données RGPD

As a **utilisateur connecté**,
I want **exporter l'ensemble de mes données au format JSON**,
So that **je peux exercer mon droit à la portabilité RGPD** (FR6).

**Acceptance Criteria:**

**Given** je suis sur la page /profile
**When** je vois la section "Mes données"
**Then** un bouton "Exporter mes données" est affiché
**And** le bouton est de type default (gris)

**Given** je clique sur "Exporter mes données"
**When** la requête est traitée
**Then** le serveur collecte toutes mes données (user, matériels, lieux, catégories, types, routines, spectacles, notes)
**And** les données sont sérialisées en JSON formaté
**And** les timestamps sont en ISO 8601

**Given** les données sont préparées
**When** le fichier est généré
**Then** un fichier JSON est téléchargé
**And** le nom du fichier est : magic-inventory-export-{user_id}-{date}.json
**And** le fichier contient toutes mes données structurées par entité

**Given** je n'ai aucune donnée à part mon compte
**When** j'exporte mes données
**Then** le fichier JSON contient uniquement mes informations utilisateur
**And** les sections vides sont des tableaux vides []
**And** aucune erreur n'est générée

**Given** j'ai beaucoup de données (ex: 500 matériels)
**When** j'exporte mes données
**Then** l'export se termine en moins de 5 secondes
**And** toutes les données sont complètes
**And** aucune limite de taille n'est appliquée

## Epic 2: Organisation et Taxonomie

Les utilisateurs peuvent structurer leur espace avec des lieux de stockage et une taxonomie personnalisée (types et catégories).

### Story 2.1: Gestion des Catégories avec Catégories par Défaut

As a **utilisateur**,
I want **gérer mes catégories personnalisées et bénéficier de catégories par défaut à l'inscription**,
So that **je peux organiser mon inventaire et mes routines dès le premier jour** (FR24-27).

**Acceptance Criteria:**

**Given** je viens de créer mon compte (inscription Story 1.3)
**When** mon compte est créé
**Then** des catégories par défaut sont automatiquement créées pour moi (FR27)
**And** les catégories incluent : "Cartomagie", "Mentalisme", "Pièces", "Close-up", "Scène", "Enfants"
**And** ces catégories sont liées à mon user_id

**Given** je suis connecté
**When** j'accède à la page /categories
**Then** je vois la liste de toutes mes catégories (défaut + personnalisées)
**And** la liste utilise Ant Design Table avec colonnes : Nom, Date de création, Actions
**And** le breadcrumb affiche : Accueil > Catégories

**Given** je suis sur la page catégories
**When** je clique sur "Ajouter une catégorie" (FR24)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire contient un champ "Nom" (Input)
**And** la validation client vérifie que le nom n'est pas vide

**Given** je remplis le formulaire d'ajout
**When** je soumets avec un nom valide
**Then** le validator CreateCategoryValidator valide côté serveur
**And** la catégorie est créée dans la table categories avec mon user_id
**And** un message success s'affiche : "Catégorie créée avec succès"
**And** le modal se ferme
**And** la liste est mise à jour avec la nouvelle catégorie

**Given** une catégorie existe
**When** je clique sur "Modifier" (FR25)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire est pré-rempli avec le nom actuel
**And** je peux modifier le nom

**Given** je modifie une catégorie
**When** je soumets avec un nom valide
**Then** le validator UpdateCategoryValidator valide côté serveur
**And** la catégorie est mise à jour
**And** un message success s'affiche : "Catégorie modifiée avec succès"

**Given** une catégorie existe
**When** je clique sur "Supprimer" (FR26)
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer cette catégorie ?"

**Given** je confirme la suppression
**When** la catégorie n'est utilisée nulle part
**Then** la catégorie est supprimée de la base
**And** un message success s'affiche : "Catégorie supprimée avec succès"

**Given** je confirme la suppression
**When** la catégorie est utilisée par des matériels ou routines
**Then** la suppression échoue
**And** un message error s'affiche : "Cette catégorie est utilisée et ne peut pas être supprimée"

### Story 2.2: Gestion des Types

As a **utilisateur**,
I want **gérer mes types personnalisés de matériel**,
So that **je peux classifier précisément mon inventaire** (FR21-23).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page /types
**Then** je vois la liste de tous mes types
**And** la liste utilise Ant Design Table avec colonnes : Nom, Date de création, Actions
**And** le breadcrumb affiche : Accueil > Types

**Given** je suis sur la page types
**When** je clique sur "Ajouter un type" (FR21)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire contient un champ "Nom" (Input)
**And** la validation client vérifie que le nom n'est pas vide

**Given** je remplis le formulaire d'ajout
**When** je soumets avec un nom valide (ex: "Cartes", "Pièces", "Livre", "Accessoire")
**Then** le validator CreateTypeValidator valide côté serveur
**And** le type est créé dans la table types avec mon user_id
**And** un message success s'affiche : "Type créé avec succès"
**And** le modal se ferme
**And** la liste est mise à jour

**Given** un type existe
**When** je clique sur "Modifier" (FR22)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire est pré-rempli avec le nom actuel
**And** je peux modifier le nom

**Given** je modifie un type
**When** je soumets avec un nom valide
**Then** le validator UpdateTypeValidator valide côté serveur
**And** le type est mis à jour
**And** un message success s'affiche : "Type modifié avec succès"

**Given** un type existe
**When** je clique sur "Supprimer" (FR23)
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer ce type ?"

**Given** je confirme la suppression
**When** le type n'est utilisé par aucun matériel
**Then** le type est supprimé de la base
**And** un message success s'affiche : "Type supprimé avec succès"

**Given** je confirme la suppression
**When** le type est utilisé par des matériels
**Then** la suppression échoue
**And** un message error s'affiche : "Ce type est utilisé et ne peut pas être supprimé"

### Story 2.3: Gestion des Lieux de Stockage

As a **utilisateur**,
I want **gérer mes lieux de stockage**,
So that **je sais toujours où est rangé mon matériel** (FR16-19).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page /storage-locations (FR19)
**Then** je vois la liste de tous mes lieux de stockage
**And** la liste utilise Ant Design Table avec colonnes : Nom, Nombre d'items, Date de création, Actions
**And** le breadcrumb affiche : Accueil > Lieux de Stockage

**Given** je suis sur la page lieux
**When** je clique sur "Ajouter un lieu" (FR16)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire contient un champ "Nom" (Input)
**And** des exemples sont suggérés : "Tiroir cartes", "Bibliothèque", "Valise close-up", "Boîte pièces"
**And** la validation client vérifie que le nom n'est pas vide

**Given** je remplis le formulaire d'ajout
**When** je soumets avec un nom valide
**Then** le validator CreateStorageLocationValidator valide côté serveur
**And** le lieu est créé dans la table storage_locations avec mon user_id
**And** un message success s'affiche : "Lieu de stockage créé avec succès"
**And** le modal se ferme
**And** la liste est mise à jour

**Given** un lieu existe
**When** je clique sur "Modifier" (FR17)
**Then** un Modal Ant Design s'ouvre
**And** le formulaire est pré-rempli avec le nom actuel
**And** je peux modifier le nom

**Given** je modifie un lieu
**When** je soumets avec un nom valide
**Then** le validator UpdateStorageLocationValidator valide côté serveur
**And** le lieu est mis à jour
**And** un message success s'affiche : "Lieu modifié avec succès"

**Given** un lieu existe
**When** je clique sur "Supprimer" (FR18)
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer ce lieu ?"

**Given** je confirme la suppression
**When** le lieu ne contient aucun matériel
**Then** le lieu est supprimé de la base
**And** un message success s'affiche : "Lieu supprimé avec succès"

**Given** je confirme la suppression
**When** le lieu contient du matériel
**Then** la suppression échoue
**And** un message error s'affiche : "Ce lieu contient du matériel et ne peut pas être supprimé"

### Story 2.4: Vue Contenu d'un Lieu de Stockage

As a **utilisateur**,
I want **voir tout le contenu d'un lieu de stockage spécifique**,
So that **je peux rapidement voir ce qui est rangé à un endroit donné** (FR20).

**Acceptance Criteria:**

**Given** je suis sur la page liste lieux (/storage-locations)
**When** je clique sur le nom d'un lieu
**Then** je suis redirigé vers /storage-locations/:id
**And** le breadcrumb affiche : Accueil > Lieux de Stockage > [Nom du lieu]

**Given** je suis sur la page détail d'un lieu
**When** la page se charge
**Then** je vois le nom du lieu en titre (Typography.Title)
**And** je vois la liste de tous les matériels rangés dans ce lieu
**And** la liste utilise Ant Design List ou Cards

**Given** le lieu contient du matériel
**When** j'affiche la liste
**Then** chaque item affiche : Nom, Type, Catégorie(s), Auteur
**And** je peux cliquer sur un matériel pour voir sa fiche complète

**Given** le lieu est vide
**When** j'affiche la page
**Then** un Empty Ant Design s'affiche
**And** le message est : "Aucun matériel dans ce lieu"
**And** un bouton "Ajouter un matériel" est visible

**Given** je suis sur la page détail d'un lieu
**When** je clique sur "Modifier le lieu"
**Then** le Modal de modification s'ouvre (même que Story 2.3)

**Given** je suis sur la page détail d'un lieu
**When** je clique sur "Supprimer le lieu"
**Then** le Popconfirm de suppression s'affiche (même que Story 2.3)

## Epic 3: Gestion de l'Inventaire

Les utilisateurs peuvent gérer leur inventaire de matériel magique avec recherche et filtrage multi-critères puissants.

### Story 3.1: Création de Matériel avec Associations

As a **utilisateur**,
I want **ajouter un matériel à mon inventaire avec toutes ses informations**,
So that **je peux organiser mon inventaire dès le début** (FR7, FR10-13).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page /materials ou je clique sur "Ajouter un matériel"
**Then** je suis redirigé vers /materials/create
**And** le breadcrumb affiche : Accueil > Inventaire > Ajouter un matériel

**Given** je suis sur la page création matériel
**When** la page se charge
**Then** je vois un formulaire Ant Design Form
**And** les champs sont : Nom (Input requis), Type (Select), Catégorie(s) (Select multiple), Lieu de stockage (Select), Auteur (Input)
**And** l'objectif est de remplir le formulaire en moins de 30 secondes (UX Design)

**Given** le formulaire est affiché
**When** je remplis le champ Nom
**Then** la validation client vérifie en temps réel que le nom n'est pas vide

**Given** je remplis le champ Type (FR10)
**When** je clique sur le Select Type
**Then** je vois la liste de tous mes types créés (Epic 2)
**And** je peux en sélectionner un
**And** le champ est optionnel

**Given** je remplis le champ Catégorie (FR11)
**When** je clique sur le Select Catégorie (mode multiple)
**Then** je vois la liste de toutes mes catégories (défaut + personnalisées)
**And** je peux en sélectionner plusieurs
**And** le champ est optionnel

**Given** je remplis le champ Lieu de stockage (FR12)
**When** je clique sur le Select Lieu
**Then** je vois la liste de tous mes lieux créés (Epic 2)
**And** je peux en sélectionner un
**And** le champ est optionnel

**Given** je remplis le champ Auteur (FR13)
**When** je tape un nom d'auteur
**Then** le champ accepte du texte libre
**And** le champ est optionnel

**Given** je remplis le formulaire avec au minimum un nom
**When** je soumets le formulaire (FR7)
**Then** le validator CreateMaterialValidator valide côté serveur
**And** le matériel est créé dans la table materials avec mon user_id
**And** les associations sont créées dans material_category (si catégories sélectionnées)
**And** un message success s'affiche : "Matériel ajouté avec succès"
**And** je suis redirigé vers /materials (liste)

**Given** je soumets le formulaire
**When** le nom est vide
**Then** la validation client affiche : "Le nom est requis"
**And** la validation serveur rejette également
**And** un message error s'affiche avec le champ concerné

**Given** le formulaire est rempli
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /materials sans sauvegarder
**And** aucune donnée n'est créée

### Story 3.2: Liste Inventaire Vue Table

As a **utilisateur**,
I want **voir mon inventaire sous forme de tableau avec tri et filtrage**,
So that **je peux explorer et analyser mon inventaire en détail** (FR14).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /materials
**Then** je vois mon inventaire affiché sous forme de Table Ant Design (vue par défaut)
**And** le breadcrumb affiche : Accueil > Inventaire

**Given** la vue Table est affichée
**When** la page se charge
**Then** les colonnes sont : Nom, Type, Catégorie(s), Lieu, Auteur, Date d'ajout, Actions
**And** toutes les lignes affichent mes matériels filtrés par mon user_id (scoping)
**And** la pagination est active si > 50 items

**Given** la Table est affichée
**When** je clique sur un en-tête de colonne
**Then** le tri s'applique (ascendant ou descendant)
**And** le tri fonctionne pour : Nom (alphabétique), Type (alphabétique), Date (chronologique)

**Given** j'ai beaucoup de matériel (> 50 items)
**When** la Table se charge
**Then** la pagination Ant Design est visible
**And** 50 items par page sont affichés par défaut
**And** je peux changer le nombre d'items par page (25, 50, 100)

**Given** la Table est affichée
**When** je clique sur une ligne de matériel
**Then** je suis redirigé vers /materials/:id (détail du matériel - Story 3.4)

**Given** j'ai 0 matériel
**When** j'accède à /materials
**Then** un Empty Ant Design s'affiche
**And** le message est : "Aucun matériel dans votre inventaire"
**And** un bouton "Ajouter votre premier matériel" est visible

### Story 3.3: Liste Inventaire Vue Cards avec Switcher

As a **utilisateur**,
I want **basculer entre une vue Cards et une vue Table pour mon inventaire**,
So that **je peux choisir la vue la plus adaptée à mon besoin** (FR14 + UX Design).

**Acceptance Criteria:**

**Given** je suis sur /materials
**When** la page se charge
**Then** je vois un Segmented Ant Design (switcher) en haut à droite
**And** les options sont : "Table" et "Cards"
**And** la vue "Table" est sélectionnée par défaut

**Given** je suis en vue Table
**When** je clique sur "Cards"
**Then** la vue bascule vers Cards
**And** mes matériels sont affichés en Cards Ant Design
**And** le contexte (filtres, recherche) est conservé

**Given** la vue Cards est affichée
**When** la page se charge
**Then** chaque matériel est une Card Ant Design avec :
  - Titre : Nom du matériel
  - Badge : Type (si défini)
  - Tags : Catégorie(s) (si définies)
  - Icône lieu : Nom du lieu (si défini)
  - Texte secondaire : Auteur (si défini)
**And** la Card est cliquable pour accéder au détail

**Given** je suis en vue Cards
**When** je clique sur une Card
**Then** je suis redirigé vers /materials/:id (détail - Story 3.4)

**Given** je suis en vue Cards
**When** je survole une Card
**Then** un effet hover s'affiche (shadow, légère élévation)
**And** le curseur change en pointer

**Given** je suis en vue Cards
**When** je clique sur "Table"
**Then** la vue bascule vers Table
**And** le contexte est conservé

**Given** j'ai beaucoup de matériel
**When** la vue Cards est affichée
**Then** la pagination fonctionne également (12 cards par page)
**And** le layout est responsive (grille adaptative)

### Story 3.4: Détail d'un Matériel

As a **utilisateur**,
I want **voir tous les détails d'un matériel spécifique**,
So that **je peux consulter toutes les informations et voir où il est utilisé** (FR15).

**Acceptance Criteria:**

**Given** je clique sur un matériel depuis /materials
**When** je suis redirigé vers /materials/:id
**Then** le breadcrumb affiche : Accueil > Inventaire > [Nom du matériel]

**Given** je suis sur la page détail
**When** la page se charge
**Then** je vois un Descriptions Ant Design affichant :
  - Nom (titre principal)
  - Type (avec Badge si défini)
  - Catégorie(s) (avec Tags si définies)
  - Lieu de stockage (avec icône lieu et lien cliquable vers la vue lieu - Story 2.4)
  - Auteur (si défini)
  - Date d'ajout (formatée avec dayjs en français)

**Given** le matériel a un lieu de stockage défini
**When** je clique sur le nom du lieu
**Then** je suis redirigé vers /storage-locations/:id (vue contenu lieu - Story 2.4)

**Given** le matériel est utilisé dans des routines
**When** je scroll vers le bas de la page
**Then** je vois une section "Utilisé dans les routines suivantes :"
**And** la liste des routines est affichée (Cards ou List)
**And** chaque routine est cliquable pour accéder à sa fiche

**Given** le matériel n'est utilisé dans aucune routine
**When** j'affiche la section routines
**Then** le texte affiche : "Ce matériel n'est utilisé dans aucune routine"

**Given** je suis sur la page détail
**When** je vois les boutons d'action
**Then** les boutons "Modifier" (primary) et "Supprimer" (danger) sont visibles
**And** le bouton "Retour à l'inventaire" est également présent

**Given** je clique sur "Modifier"
**When** le bouton est cliqué
**Then** je suis redirigé vers /materials/:id/edit (Story 3.5)

**Given** je clique sur "Supprimer"
**When** le bouton est cliqué
**Then** le Popconfirm de suppression s'affiche (Story 3.6)

### Story 3.5: Modification d'un Matériel

As a **utilisateur**,
I want **modifier un matériel existant**,
So that **je peux corriger ou mettre à jour ses informations** (FR8).

**Acceptance Criteria:**

**Given** je suis sur /materials/:id
**When** je clique sur "Modifier"
**Then** je suis redirigé vers /materials/:id/edit
**And** le breadcrumb affiche : Accueil > Inventaire > [Nom] > Modifier

**Given** je suis sur la page modification
**When** la page se charge
**Then** je vois le même formulaire que la création (Story 3.1)
**And** tous les champs sont pré-remplis avec les valeurs actuelles
**And** les Selects affichent les valeurs sélectionnées (Type, Catégories, Lieu)

**Given** le formulaire est pré-rempli
**When** je modifie un ou plusieurs champs
**Then** la validation client fonctionne en temps réel
**And** les erreurs s'affichent immédiatement

**Given** je modifie le matériel
**When** je soumets le formulaire avec données valides
**Then** le validator UpdateMaterialValidator valide côté serveur
**And** le matériel est mis à jour dans la table materials
**And** les associations material_category sont mises à jour
**And** un message success s'affiche : "Matériel modifié avec succès"
**And** je suis redirigé vers /materials/:id (détail)

**Given** je modifie le matériel
**When** je vide le champ Nom (requis)
**Then** la validation client affiche : "Le nom est requis"
**And** le bouton "Enregistrer" est désactivé

**Given** je suis sur la page modification
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /materials/:id sans sauvegarder
**And** aucune modification n'est appliquée

### Story 3.6: Suppression d'un Matériel

As a **utilisateur**,
I want **supprimer un matériel de mon inventaire**,
So that **je peux retirer le matériel que je n'ai plus** (FR9).

**Acceptance Criteria:**

**Given** je suis sur /materials/:id
**When** je clique sur "Supprimer"
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer ce matériel ?"

**Given** le Popconfirm est affiché
**When** le matériel n'est utilisé dans aucune routine
**And** je confirme la suppression
**Then** le matériel est supprimé de la table materials
**And** toutes ses associations (material_category, etc.) sont supprimées en cascade
**And** un message success s'affiche : "Matériel supprimé avec succès"
**And** je suis redirigé vers /materials (liste)

**Given** le Popconfirm est affiché
**When** le matériel est utilisé dans des routines
**And** je confirme la suppression
**Then** la suppression échoue
**And** un message error s'affiche : "Ce matériel est utilisé dans des routines et ne peut pas être supprimé. Retirez-le des routines d'abord."
**And** je reste sur la page détail

**Given** le Popconfirm est affiché
**When** j'annule la suppression
**Then** le Popconfirm se ferme
**And** aucune action n'est effectuée
**And** je reste sur la page détail

### Story 3.7: Recherche et Filtrage Multi-Critères Inventaire

As a **utilisateur**,
I want **rechercher et filtrer mon inventaire par nom, type, catégorie, lieu et auteur**,
So that **je peux trouver rapidement n'importe quel matériel** (FR51-55, NFR2).

**Acceptance Criteria:**

**Given** je suis sur /materials
**When** la page se charge
**Then** je vois la barre de recherche globale dans le Header (déjà créée Story 1.2)
**And** un bouton "Filtres" est visible à côté

**Given** je tape dans la barre de recherche (FR51)
**When** je tape "Hedan"
**Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
**And** les résultats s'affichent en moins de 500ms (NFR2)
**And** seuls les matériels dont le nom contient "Hedan" sont affichés
**And** la recherche est case-insensitive

**Given** la recherche est active
**When** j'efface la barre de recherche
**Then** tous les matériels réapparaissent

**Given** je clique sur "Filtres"
**When** le panneau s'ouvre (Drawer Ant Design)
**Then** je vois les filtres disponibles :
  - Type (Select - FR52)
  - Catégorie (Select multiple - FR53)
  - Lieu de stockage (Select - FR54)
  - Auteur (Input - FR55)

**Given** le panneau filtres est ouvert
**When** je sélectionne un Type
**Then** seuls les matériels de ce type sont affichés
**And** le filtre s'applique immédiatement (< 500ms)
**And** le nombre de résultats est affiché

**Given** le panneau filtres est ouvert
**When** je sélectionne plusieurs Catégories
**Then** seuls les matériels ayant au moins une de ces catégories sont affichés
**And** le filtre s'applique immédiatement

**Given** le panneau filtres est ouvert
**When** je sélectionne un Lieu de stockage
**Then** seuls les matériels rangés dans ce lieu sont affichés

**Given** le panneau filtres est ouvert
**When** je tape un nom d'Auteur
**Then** seuls les matériels de cet auteur sont affichés
**And** la recherche est case-insensitive

**Given** plusieurs filtres sont actifs
**When** j'affiche les résultats
**Then** les filtres se combinent (AND logic)
**And** seuls les matériels respectant TOUS les filtres sont affichés

**Given** des filtres sont actifs
**When** je clique sur "Réinitialiser les filtres"
**Then** tous les filtres sont effacés
**And** tous les matériels réapparaissent

**Given** des filtres ou recherche sont actifs
**When** je bascule entre vue Table et vue Cards
**Then** les filtres et recherche sont conservés
**And** les résultats filtrés s'affichent dans la nouvelle vue

## Epic 4: Création et Gestion des Routines

Les utilisateurs peuvent créer et gérer leurs routines magiques avec liaison au matériel et éditeur de contenu riche.

### Story 4.1: Création de Routine avec Catégories

As a **utilisateur**,
I want **créer une routine et lui associer des catégories**,
So that **je peux organiser mes routines par style de magie** (FR28, FR34).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /routines/create
**Then** le breadcrumb affiche : Accueil > Routines > Créer une routine

**Given** je suis sur la page création routine
**When** la page se charge
**Then** je vois un formulaire Ant Design Form
**And** les champs sont : Nom (Input requis), Catégorie(s) (Select multiple)

**Given** je remplis le champ Nom (FR28)
**When** je tape un nom de routine
**Then** la validation client vérifie que le nom n'est pas vide

**Given** je remplis le champ Catégorie (FR34)
**When** je clique sur le Select Catégorie (mode multiple)
**Then** je vois la liste de toutes mes catégories
**And** je peux en sélectionner plusieurs
**And** le champ est optionnel

**Given** je remplis le formulaire avec au minimum un nom
**When** je soumets le formulaire
**Then** le validator CreateRoutineValidator valide côté serveur
**And** la routine est créée dans la table routines avec mon user_id
**And** le champ content est initialisé vide (sera édité dans Story 4.2)
**And** un message success s'affiche : "Routine créée avec succès"
**And** je suis redirigé vers /routines/:id/edit pour continuer l'édition (Story 4.2)

**Given** je soumets le formulaire
**When** le nom est vide
**Then** la validation client affiche : "Le nom est requis"
**And** la validation serveur rejette également

**Given** le formulaire est rempli
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /routines sans créer la routine

### Story 4.2: Éditeur de Contenu pour Routines

As a **utilisateur**,
I want **écrire et éditer le contenu de ma routine (script, mise en scène, déroulé)**,
So that **je peux documenter ma routine complètement** (FR31).

**Acceptance Criteria:**

**Given** je viens de créer une routine (Story 4.1)
**When** je suis redirigé vers /routines/:id/edit
**Then** le breadcrumb affiche : Accueil > Routines > [Nom] > Éditer

**Given** je suis sur la page édition routine
**When** la page se charge
**Then** je vois le formulaire avec :
  - Nom (Input, modifiable)
  - Catégorie(s) (Select multiple, modifiable)
  - Contenu (TextArea Ant Design, grande taille)

**Given** je vois le champ Contenu (FR31)
**When** je clique dedans
**Then** le TextArea s'agrandit (autoSize={{ minRows: 10, maxRows: 30 }})
**And** le placeholder suggère : "Écrivez votre script, mise en scène, déroulé technique..."

**Given** je tape dans le champ Contenu
**When** j'écris mon script/mise en scène
**Then** le texte est sauvegardé lors de la soumission du formulaire
**And** je peux utiliser des retours à la ligne (multiline)
**And** le formatage texte brut est supporté (pas d'éditeur riche pour MVP)

**Given** j'édite le contenu de ma routine
**When** je soumets le formulaire
**Then** le validator UpdateRoutineValidator valide côté serveur
**And** la routine est mise à jour (nom, catégories, contenu)
**And** un message success s'affiche : "Routine enregistrée avec succès"
**And** je reste sur la page édition (ou redirection vers /routines/:id au choix UX)

**Given** je suis sur la page édition
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /routines/:id (détail) sans sauvegarder les modifications

**Given** je suis sur la page édition
**When** je clique sur "Liaison matériel"
**Then** je suis redirigé vers la section liaison matériel (Story 4.3)

### Story 4.3: Liaison Matériel à une Routine

As a **utilisateur**,
I want **lier et délier du matériel à mes routines**,
So that **je sais quel matériel est nécessaire pour chaque routine** (FR32, FR33).

**Acceptance Criteria:**

**Given** je suis sur /routines/:id/edit ou /routines/:id
**When** la page se charge
**Then** je vois une section "Matériel utilisé"
**And** la liste du matériel actuellement lié est affichée (Cards ou List)

**Given** je vois la section "Matériel utilisé"
**When** je clique sur "Ajouter du matériel" (FR32)
**Then** un Modal Ant Design s'ouvre
**And** le modal affiche la liste de tout mon inventaire (Select ou Transfer)
**And** je peux rechercher par nom dans le modal

**Given** le modal d'ajout matériel est ouvert
**When** je sélectionne un ou plusieurs matériels
**And** je clique sur "Ajouter"
**Then** les matériels sont liés à la routine dans material_routine
**And** le modal se ferme
**And** la liste matériel est mise à jour
**And** un message success s'affiche : "Matériel ajouté à la routine"

**Given** du matériel est lié à la routine
**When** j'affiche la liste matériel
**Then** chaque item affiche : Nom, Type, Lieu (si défini)
**And** chaque item a un bouton "Retirer" (icône close)

**Given** je clique sur "Retirer" pour un matériel (FR33)
**When** le bouton est cliqué
**Then** un Popconfirm s'affiche : "Retirer ce matériel de la routine ?"
**And** si je confirme, le matériel est délié (suppression dans material_routine)
**And** la liste est mise à jour
**And** un message success s'affiche : "Matériel retiré de la routine"

**Given** la routine n'a aucun matériel lié
**When** j'affiche la section "Matériel utilisé"
**Then** le texte affiche : "Aucun matériel lié à cette routine"
**And** le bouton "Ajouter du matériel" est visible

**Given** du matériel est lié
**When** je clique sur le nom d'un matériel
**Then** je suis redirigé vers /materials/:id (détail matériel - Story 3.4)
**And** navigation bidirectionnelle fonctionne

### Story 4.4: Liste des Routines

As a **utilisateur**,
I want **voir la liste de toutes mes routines**,
So that **je peux accéder rapidement à n'importe quelle routine** (FR35).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /routines
**Then** le breadcrumb affiche : Accueil > Routines

**Given** je suis sur /routines
**When** la page se charge
**Then** mes routines sont affichées en Cards Ant Design (vue par défaut)
**And** chaque Card affiche : Nom (titre), Catégorie(s) (Tags), Date de création

**Given** les routines sont affichées
**When** je clique sur une Card
**Then** je suis redirigé vers /routines/:id (détail - Story 4.5)

**Given** j'ai beaucoup de routines
**When** la liste se charge
**Then** la pagination est active (12 routines par page)

**Given** j'ai 0 routine
**When** j'accède à /routines
**Then** un Empty Ant Design s'affiche
**And** le message est : "Aucune routine créée"
**And** un bouton "Créer votre première routine" est visible

**Given** je suis sur /routines
**When** je clique sur "Créer une routine"
**Then** je suis redirigé vers /routines/create (Story 4.1)

### Story 4.5: Détail d'une Routine avec Navigation Bidirectionnelle

As a **utilisateur**,
I want **voir tous les détails d'une routine et son matériel lié**,
So that **je peux consulter ma routine et naviguer vers le matériel** (FR36).

**Acceptance Criteria:**

**Given** je clique sur une routine depuis /routines
**When** je suis redirigé vers /routines/:id
**Then** le breadcrumb affiche : Accueil > Routines > [Nom de la routine]

**Given** je suis sur la page détail
**When** la page se charge
**Then** je vois :
  - Nom (titre principal)
  - Catégorie(s) (Tags si définies)
  - Contenu (TextArea ou Paragraph Ant Design, lecture seule)
  - Section "Matériel utilisé" (liste du matériel lié)

**Given** la routine a du contenu (FR36)
**When** j'affiche le contenu
**Then** le texte est affiché avec les retours à la ligne préservés
**And** le contenu est scrollable si très long

**Given** la routine a du matériel lié
**When** j'affiche la section "Matériel utilisé"
**Then** chaque matériel est affiché (Card ou List item)
**And** chaque matériel affiche : Nom, Type, Lieu
**And** chaque matériel est cliquable

**Given** je clique sur un matériel lié
**When** le clic est effectué
**Then** je suis redirigé vers /materials/:id (détail matériel - Story 3.4)
**And** sur la page matériel, je vois que ce matériel est utilisé dans cette routine (navigation bidirectionnelle)

**Given** la routine n'a pas de matériel lié
**When** j'affiche la section
**Then** le texte affiche : "Aucun matériel lié"

**Given** je suis sur la page détail
**When** je vois les boutons d'action
**Then** les boutons "Modifier" (primary) et "Supprimer" (danger) sont visibles

**Given** je clique sur "Modifier"
**When** le bouton est cliqué
**Then** je suis redirigé vers /routines/:id/edit (Story 4.2)

### Story 4.6: Modification d'une Routine

As a **utilisateur**,
I want **modifier une routine existante**,
So that **je peux corriger ou améliorer ma routine** (FR29).

**Acceptance Criteria:**

**Given** je suis sur /routines/:id
**When** je clique sur "Modifier"
**Then** je suis redirigé vers /routines/:id/edit
**And** le breadcrumb affiche : Accueil > Routines > [Nom] > Modifier

**Given** je suis sur la page modification
**When** la page se charge
**Then** le formulaire est pré-rempli avec :
  - Nom actuel
  - Catégorie(s) actuelles
  - Contenu actuel
  - Liste matériel lié (avec option d'ajout/retrait - Story 4.3)

**Given** le formulaire est pré-rempli
**When** je modifie n'importe quel champ
**Then** la validation client fonctionne en temps réel

**Given** je modifie la routine
**When** je soumets le formulaire avec données valides
**Then** le validator UpdateRoutineValidator valide côté serveur
**And** la routine est mise à jour dans la table routines
**And** un message success s'affiche : "Routine modifiée avec succès"
**And** je suis redirigé vers /routines/:id (détail)

**Given** je suis sur la page modification
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /routines/:id sans sauvegarder

### Story 4.7: Suppression d'une Routine

As a **utilisateur**,
I want **supprimer une routine**,
So that **je peux retirer les routines que je ne joue plus** (FR30).

**Acceptance Criteria:**

**Given** je suis sur /routines/:id
**When** je clique sur "Supprimer"
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer cette routine ?"

**Given** le Popconfirm est affiché
**When** la routine n'est utilisée dans aucun spectacle
**And** je confirme la suppression
**Then** la routine est supprimée de la table routines
**And** toutes ses associations (material_routine) sont supprimées en cascade
**And** un message success s'affiche : "Routine supprimée avec succès"
**And** je suis redirigé vers /routines (liste)

**Given** le Popconfirm est affiché
**When** la routine est utilisée dans des spectacles
**And** je confirme la suppression
**Then** la suppression échoue
**And** un message error s'affiche : "Cette routine est utilisée dans des spectacles et ne peut pas être supprimée"

**Given** le Popconfirm est affiché
**When** j'annule la suppression
**Then** le Popconfirm se ferme
**And** je reste sur la page détail

### Story 4.8: Recherche et Filtrage des Routines

As a **utilisateur**,
I want **rechercher et filtrer mes routines par nom et catégorie**,
So that **je peux trouver rapidement n'importe quelle routine** (FR56, FR57).

**Acceptance Criteria:**

**Given** je suis sur /routines
**When** la page se charge
**Then** je vois la barre de recherche globale dans le Header
**And** un bouton "Filtres" est visible

**Given** je tape dans la barre de recherche (FR56)
**When** je tape "Matrix"
**Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
**And** les résultats s'affichent en moins de 500ms
**And** seules les routines dont le nom contient "Matrix" sont affichées
**And** la recherche est case-insensitive

**Given** je clique sur "Filtres"
**When** le Drawer s'ouvre
**Then** je vois le filtre : Catégorie (Select multiple - FR57)

**Given** le panneau filtres est ouvert
**When** je sélectionne une ou plusieurs Catégories
**Then** seules les routines ayant au moins une de ces catégories sont affichées
**And** le filtre s'applique immédiatement (< 500ms)

**Given** des filtres sont actifs
**When** je clique sur "Réinitialiser les filtres"
**Then** tous les filtres sont effacés
**And** toutes les routines réapparaissent

## Epic 5: Spectacles et Préparation de Prestations

Les utilisateurs peuvent créer des spectacles et générer automatiquement des checklists de matériel avec emplacements pour leurs prestations.

### Story 5.1: Création de Spectacle et Liaison Routines

As a **utilisateur**,
I want **créer un spectacle et lui lier des routines**,
So that **je peux structurer mes prestations** (FR37, FR41, FR42).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /shows/create
**Then** le breadcrumb affiche : Accueil > Spectacles > Créer un spectacle

**Given** je suis sur la page création spectacle
**When** la page se charge
**Then** je vois un formulaire avec :
  - Nom (Input requis)
  - Section "Routines du spectacle" (vide initialement)

**Given** je remplis le champ Nom (FR37)
**When** je tape un nom de spectacle
**Then** la validation client vérifie que le nom n'est pas vide

**Given** je remplis le formulaire
**When** je soumets avec au minimum un nom
**Then** le validator CreateShowValidator valide côté serveur
**And** le spectacle est créé dans la table shows avec mon user_id
**And** un message success s'affiche : "Spectacle créé avec succès"
**And** je suis redirigé vers /shows/:id/edit pour ajouter routines et notes

**Given** je suis sur /shows/:id/edit
**When** la page se charge
**Then** je vois la section "Routines du spectacle"
**And** un bouton "Ajouter des routines" est visible (FR41)

**Given** je clique sur "Ajouter des routines"
**When** le Modal s'ouvre
**Then** je vois la liste de toutes mes routines (Select ou Transfer)
**And** je peux rechercher par nom

**Given** le modal d'ajout routines est ouvert
**When** je sélectionne une ou plusieurs routines
**And** je clique sur "Ajouter"
**Then** les routines sont liées au spectacle dans routine_show
**And** le modal se ferme
**And** la liste routines est mise à jour
**And** un message success s'affiche : "Routines ajoutées au spectacle"

**Given** des routines sont liées au spectacle
**When** j'affiche la liste
**Then** chaque routine affiche : Nom, Catégorie(s)
**And** chaque routine a un bouton "Retirer" (FR42)

**Given** je clique sur "Retirer" pour une routine
**When** le bouton est cliqué
**Then** un Popconfirm s'affiche : "Retirer cette routine du spectacle ?"
**And** si je confirme, la routine est déliée (suppression dans routine_show)
**And** la liste est mise à jour
**And** un message success s'affiche : "Routine retirée du spectacle"

**Given** le spectacle n'a aucune routine liée
**When** j'affiche la section
**Then** le texte affiche : "Aucune routine dans ce spectacle"

### Story 5.2: Éditeur de Notes pour Spectacles

As a **utilisateur**,
I want **écrire et éditer des notes pour mes spectacles**,
So that **je peux documenter mes annotations, consignes et détails** (FR40).

**Acceptance Criteria:**

**Given** je suis sur /shows/:id/edit
**When** la page se charge
**Then** je vois un champ "Notes" (TextArea Ant Design)

**Given** je vois le champ Notes (FR40)
**When** je clique dedans
**Then** le TextArea s'agrandit (autoSize={{ minRows: 10, maxRows: 30 }})
**And** le placeholder suggère : "Notes, annotations, consignes pour ce spectacle..."

**Given** je tape dans le champ Notes
**When** j'écris mes notes
**Then** le texte est sauvegardé lors de la soumission du formulaire
**And** je peux utiliser des retours à la ligne (multiline)

**Given** j'édite les notes du spectacle
**When** je soumets le formulaire
**Then** le validator UpdateShowValidator valide côté serveur
**And** le spectacle est mis à jour (notes)
**And** un message success s'affiche : "Spectacle enregistré avec succès"

### Story 5.3: Liste des Spectacles

As a **utilisateur**,
I want **voir la liste de tous mes spectacles**,
So that **je peux accéder rapidement à mes prestations** (FR43).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /shows
**Then** le breadcrumb affiche : Accueil > Spectacles

**Given** je suis sur /shows
**When** la page se charge
**Then** mes spectacles sont affichés en Cards Ant Design
**And** chaque Card affiche : Nom (titre), Nombre de routines, Date de création

**Given** les spectacles sont affichés
**When** je clique sur une Card
**Then** je suis redirigé vers /shows/:id (détail - Story 5.4)

**Given** j'ai beaucoup de spectacles
**When** la liste se charge
**Then** la pagination est active (12 spectacles par page)

**Given** j'ai 0 spectacle
**When** j'accède à /shows
**Then** un Empty Ant Design s'affiche
**And** le message est : "Aucun spectacle créé"
**And** un bouton "Créer votre premier spectacle" est visible

### Story 5.4: Détail d'un Spectacle avec Navigation Bidirectionnelle

As a **utilisateur**,
I want **voir tous les détails d'un spectacle avec ses routines liées**,
So that **je peux consulter mon spectacle et naviguer vers les routines et matériel** (FR44).

**Acceptance Criteria:**

**Given** je clique sur un spectacle depuis /shows
**When** je suis redirigé vers /shows/:id
**Then** le breadcrumb affiche : Accueil > Spectacles > [Nom du spectacle]

**Given** je suis sur la page détail
**When** la page se charge
**Then** je vois :
  - Nom (titre principal)
  - Notes (Paragraph ou TextArea lecture seule, si définies)
  - Section "Routines du spectacle" (liste routines liées)
  - Bouton "Générer checklist" (prominent, primary)

**Given** le spectacle a des notes (FR44)
**When** j'affiche les notes
**Then** le texte est affiché avec retours à la ligne préservés

**Given** le spectacle a des routines liées
**When** j'affiche la section "Routines du spectacle"
**Then** chaque routine est affichée (Card ou List)
**And** chaque routine affiche : Nom, Catégorie(s)
**And** chaque routine est cliquable

**Given** je clique sur une routine liée
**When** le clic est effectué
**Then** je suis redirigé vers /routines/:id (détail routine - Story 4.5)
**And** depuis la routine, je peux voir le matériel lié
**And** navigation bidirectionnelle complète : Spectacle → Routine → Matériel

**Given** le spectacle n'a pas de routines liées
**When** j'affiche la section
**Then** le texte affiche : "Aucune routine dans ce spectacle"

**Given** je suis sur la page détail
**When** je vois les boutons d'action
**Then** les boutons "Générer checklist" (primary), "Modifier", et "Supprimer" (danger) sont visibles

### Story 5.5: Génération de Checklist Interactive

As a **utilisateur**,
I want **générer une checklist de matériel pour mon spectacle avec emplacements**,
So that **je ne jamais oublier d'accessoire en prestation** (FR45, FR46, NFR3).

**Acceptance Criteria:**

**Given** je suis sur /shows/:id
**When** je clique sur "Générer checklist"
**Then** la checklist est générée en moins de 1 seconde (NFR3)
**And** je suis redirigé vers /shows/:id/checklist (ou section checklist sur même page)

**Given** la checklist est générée (FR45)
**When** la page se charge
**Then** je vois la liste complète du matériel nécessaire pour ce spectacle
**And** le matériel est dédupliqué (si utilisé dans plusieurs routines, apparaît une seule fois)
**And** chaque item affiche : Nom du matériel, Type, Lieu de stockage (FR46)

**Given** la checklist est affichée
**When** j'examine un item
**Then** le lieu de stockage est clairement indiqué (icône + nom)
**And** le lieu est cliquable pour accéder à /storage-locations/:id

**Given** la checklist est affichée
**When** je vois les items
**Then** chaque item a une Checkbox Ant Design (non cochée par défaut)
**And** je peux cocher progressivement les items (validation progressive - UX Design)

**Given** je coche un item de la checklist
**When** je clique sur la Checkbox
**Then** l'item est visuellement marqué comme validé (strikethrough ou opacity)
**And** l'état est sauvegardé localement (localStorage ou state React)

**Given** je coche tous les items
**When** tous sont cochés
**Then** un message success s'affiche : "Checklist complète !"
**And** une animation de succès légère peut être affichée

**Given** la checklist est affichée
**When** un matériel n'a pas de lieu défini
**Then** le lieu affiche : "Lieu non défini" (avec style warning)

**Given** le spectacle n'a aucune routine liée
**When** je clique sur "Générer checklist"
**Then** un message warning s'affiche : "Ce spectacle ne contient aucune routine"
**And** aucune checklist n'est générée

**Given** les routines du spectacle n'ont aucun matériel lié
**When** je génère la checklist
**Then** un message info s'affiche : "Aucun matériel nécessaire pour ce spectacle"

### Story 5.6: Modification d'un Spectacle

As a **utilisateur**,
I want **modifier un spectacle existant**,
So that **je peux corriger ou améliorer mon spectacle** (FR38).

**Acceptance Criteria:**

**Given** je suis sur /shows/:id
**When** je clique sur "Modifier"
**Then** je suis redirigé vers /shows/:id/edit

**Given** je suis sur la page modification
**When** la page se charge
**Then** le formulaire est pré-rempli avec :
  - Nom actuel
  - Notes actuelles
  - Liste routines liées (avec option d'ajout/retrait - Story 5.1)

**Given** je modifie le spectacle
**When** je soumets avec données valides
**Then** le validator UpdateShowValidator valide côté serveur
**And** le spectacle est mis à jour dans la table shows
**And** un message success s'affiche : "Spectacle modifié avec succès"
**And** je suis redirigé vers /shows/:id

**Given** je suis sur la page modification
**When** je clique sur "Annuler"
**Then** je suis redirigé vers /shows/:id sans sauvegarder

### Story 5.7: Suppression d'un Spectacle

As a **utilisateur**,
I want **supprimer un spectacle**,
So that **je peux retirer les prestations passées ou annulées** (FR39).

**Acceptance Criteria:**

**Given** je suis sur /shows/:id
**When** je clique sur "Supprimer"
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer ce spectacle ?"

**Given** le Popconfirm est affiché
**When** je confirme la suppression
**Then** le spectacle est supprimé de la table shows
**And** toutes ses associations (routine_show) sont supprimées en cascade
**And** un message success s'affiche : "Spectacle supprimé avec succès"
**And** je suis redirigé vers /shows (liste)

**Given** le Popconfirm est affiché
**When** j'annule la suppression
**Then** le Popconfirm se ferme
**And** je reste sur la page détail

### Story 5.8: Recherche de Spectacles

As a **utilisateur**,
I want **rechercher mes spectacles par nom**,
So that **je peux trouver rapidement n'importe quelle prestation** (FR58).

**Acceptance Criteria:**

**Given** je suis sur /shows
**When** la page se charge
**Then** je vois la barre de recherche globale dans le Header

**Given** je tape dans la barre de recherche (FR58)
**When** je tape "Cocktail"
**Then** la recherche s'exécute en search-as-you-type (debounce 300ms)
**And** les résultats s'affichent en moins de 500ms
**And** seuls les spectacles dont le nom contient "Cocktail" sont affichés
**And** la recherche est case-insensitive

**Given** la recherche est active
**When** j'efface la barre de recherche
**Then** tous les spectacles réapparaissent

## Epic 6: Capture Spontanée d'Idées

Les utilisateurs peuvent capturer spontanément des idées et notes libres sans perdre d'information.

### Story 6.1: Création de Note avec Auto-Save

As a **utilisateur**,
I want **créer une note libre avec sauvegarde automatique**,
So that **je peux capturer mes idées sans jamais les perdre** (FR47 + UX Design).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /notes/create ou je clique sur "Nouvelle note"
**Then** le breadcrumb affiche : Accueil > Notes > Nouvelle note

**Given** je suis sur la page création note
**When** la page se charge
**Then** je vois un formulaire simplifié avec :
  - Titre (Input, focus automatique)
  - Contenu (TextArea grande taille)

**Given** je tape dans le champ Titre (FR47)
**When** je commence à écrire
**Then** un auto-save se déclenche après 2 secondes d'inactivité (debounce)
**And** la note est sauvegardée automatiquement (UX Design)
**And** un indicateur discret affiche : "Sauvegardé" (avec icône check)

**Given** je tape dans le champ Contenu
**When** j'écris mes idées
**Then** l'auto-save se déclenche également après 2 secondes
**And** le contenu est sauvegardé automatiquement
**And** l'indicateur "Sauvegardé" s'affiche

**Given** l'auto-save est actif
**When** je continue à taper
**Then** l'indicateur change en "Sauvegarde en cours..." (avec spinner)
**And** une fois sauvegardé, il affiche "Sauvegardé"

**Given** la note est auto-sauvegardée
**When** je quitte la page (fermeture onglet, navigation)
**Then** aucune donnée n'est perdue
**And** la note est bien enregistrée en base

**Given** je crée une note
**When** je remplis au minimum un titre
**Then** la note est créée dans la table notes avec mon user_id
**And** la date de création est automatiquement enregistrée

**Given** je suis sur la page création
**When** je clique sur "Retour aux notes"
**Then** je suis redirigé vers /notes (liste - Story 6.2)
**And** la note est déjà sauvegardée (pas de perte)

### Story 6.2: Liste des Notes

As a **utilisateur**,
I want **voir la liste de toutes mes notes libres**,
So that **je peux accéder rapidement à mes idées** (FR50).

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à /notes
**Then** le breadcrumb affiche : Accueil > Notes

**Given** je suis sur /notes
**When** la page se charge
**Then** mes notes sont affichées en Cards Ant Design ou List
**And** chaque item affiche : Titre, Extrait du contenu (100 premiers caractères), Date de création

**Given** les notes sont affichées
**When** je clique sur une note
**Then** je suis redirigé vers /notes/:id/edit (modification directe)

**Given** j'ai beaucoup de notes
**When** la liste se charge
**Then** la pagination est active (20 notes par page)

**Given** j'ai 0 note
**When** j'accède à /notes
**Then** un Empty Ant Design s'affiche
**And** le message est : "Aucune note créée"
**And** un bouton "Créer votre première note" est visible

**Given** je suis sur /notes
**When** je clique sur "Nouvelle note"
**Then** je suis redirigé vers /notes/create (Story 6.1)

### Story 6.3: Modification d'une Note

As a **utilisateur**,
I want **modifier une note existante**,
So that **je peux compléter ou corriger mes idées** (FR48).

**Acceptance Criteria:**

**Given** je clique sur une note depuis /notes
**When** je suis redirigé vers /notes/:id/edit
**Then** le breadcrumb affiche : Accueil > Notes > [Titre] > Modifier

**Given** je suis sur la page modification
**When** la page se charge
**Then** le formulaire est pré-rempli avec :
  - Titre actuel
  - Contenu actuel

**Given** le formulaire est pré-rempli
**When** je modifie n'importe quel champ
**Then** l'auto-save se déclenche après 2 secondes (même mécanisme que Story 6.1)
**And** l'indicateur "Sauvegardé" s'affiche

**Given** je modifie la note
**When** l'auto-save fonctionne
**Then** la note est mise à jour dans la table notes
**And** aucune action manuelle n'est nécessaire

**Given** je suis sur la page modification
**When** je clique sur "Retour aux notes"
**Then** je suis redirigé vers /notes
**And** les modifications sont déjà sauvegardées

### Story 6.4: Suppression d'une Note

As a **utilisateur**,
I want **supprimer une note**,
So that **je peux retirer les idées obsolètes** (FR49).

**Acceptance Criteria:**

**Given** je suis sur /notes/:id/edit ou sur la liste /notes
**When** je clique sur "Supprimer" (bouton danger)
**Then** un Popconfirm Ant Design s'affiche
**And** le message est : "Êtes-vous sûr de vouloir supprimer cette note ?"

**Given** le Popconfirm est affiché
**When** je confirme la suppression
**Then** la note est supprimée de la table notes
**And** un message success s'affiche : "Note supprimée avec succès"
**And** je suis redirigé vers /notes (liste)

**Given** le Popconfirm est affiché
**When** j'annule la suppression
**Then** le Popconfirm se ferme
**And** je reste sur la page actuelle

---

**Récapitulatif Final - Version Complète :**
- ✅ 6 Epics créés
- ✅ 37 Stories détaillées avec Acceptance Criteria complets (Given/When/Then)
- ✅ 58 FR couvertes (100%)
- ✅ 13 NFR intégrées dans les stories appropriées
- ✅ Architecture + UX requirements incorporés dans toutes les stories
- ✅ Navigation bidirectionnelle complète : Spectacle ↔ Routine ↔ Matériel ↔ Lieu
- ✅ Tous les patterns architecturaux respectés (validation double, scoping user_id, messages français, etc.)
- ✅ Document complet et prêt pour Phase 4 - Implementation