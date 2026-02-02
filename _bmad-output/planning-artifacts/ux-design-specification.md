---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/architecture.md'
workflowType: 'ux-design'
project_name: 'magic-inventory'
user_name: 'Clement'
date: '2026-02-02'
---

# UX Design Specification magic-inventory

**Author:** Clement
**Date:** 2026-02-02

---

## Executive Summary

### Project Vision

magic-inventory est la première plateforme digitale dédiée aux magiciens professionnels pour centraliser la gestion de leur inventaire, routines et spectacles. L'application remplace le chaos des fichiers Excel, notes papier et mémoire par une solution unique, structurée et intuitive.

**Proposition de valeur UX unique :** Passer d'une vision "micro" (lignes Excel illisibles) à une vision "macro" (vue d'ensemble claire) avec une navigation bidirectionnelle innovante entre matériel, routines et spectacles.

### Target Users

**Magiciens professionnels français de tous styles :**
- Close-up (cartomagie, événements corporate)
- Scène (grandes illusions, théâtre)
- Animation enfants
- Mentalisme

**Persona principal :** Marc, 45 ans, magicien close-up corporate, 200 événements/an, inventaire actuel dans un Excel de 400 lignes illisible. Niveau technique intermédiaire, recherche efficacité et simplicité.

**Contexte d'utilisation :** Chez soi, préparation tranquille de spectacles ou routines. Principalement desktop/laptop, avec bonus responsive mobile pour consultation en déplacement.

### Key Design Challenges

1. **Vision Macro vs Micro :** Créer des vues synthétiques claires (dashboards, cards) tout en permettant l'accès rapide aux détails
2. **Navigation Multi-Niveaux :** Fluidité entre Matériel → Routines → Spectacles avec contexte toujours visible (breadcrumbs, liens bidirectionnels)
3. **Simplicité + Puissance :** Interface épurée pour les actions courantes, fonctions avancées accessibles sans encombrer (progressive disclosure)
4. **Onboarding Optionnel :** Tour guidé non-intrusif disponible au premier lancement et relançable à tout moment
5. **Performance Perçue :** Recherche et filtrage doivent être instantanés (< 500ms selon NFR)

### Design Opportunities

1. **Définir les Standards UX du Domaine :** Première app dédiée aux magiciens = liberté de créer des patterns UX innovants et devenir LA référence
2. **Visualisation Intelligente :** Vues "overview" avec codes couleurs, badges, icônes pour vision d'ensemble immédiate
3. **Navigation Bidirectionnelle Innovante :** Exploiter la traçabilité complète (matériel ↔ routines ↔ spectacles) avec liens contextuels intuitifs
4. **Checklist Interactive :** Génération de checklist visuelle et interactive avec validation progressive (cocher au fur et à mesure)
5. **Responsive Bonus :** Expérience mobile "consultation" pour accéder aux routines et checklists en backstage
6. **Interface Française Premium :** Ant Design 6.2.2 avec personnalisation thème élégant adapté à l'univers magique

## Core User Experience

### Defining Experience

magic-inventory repose sur **3 grands axes d'interaction** :

1. **Gestion d'inventaire (base fondamentale)** : L'action la plus fréquente et la plus critique. Les magiciens doivent pouvoir gérer leur matériel "aux petits oignons" avec une clarté et une rapidité impossibles dans Excel.

2. **Création de routines (parcours principal 1)** : Créer une routine avec liaison fluide du matériel et écriture textuelle (script, mise en scène, déroulé technique). C'est LE moment décisif où l'utilisateur abandonne Excel.

3. **Création de spectacles (parcours principal 2)** : Assembler des routines pour un spectacle, générer une checklist matériel avec emplacements.

**Bonus fréquent :** Notes volantes pour capturer spontanément des idées sans interrompre le flow.

**Le moment "make-or-break" :** La combinaison inventaire clair + création de routine fluide (liaison matériel + écriture) doit être si simple et rapide que l'utilisateur se dit "je ne retournerai jamais à mon Excel".

### Platform Strategy

**Plateforme principale :** Application web (desktop/laptop)
- **Interface :** Mouse/keyboard (pas touch-first)
- **Contexte :** Chez soi, préparation tranquille de spectacles et routines
- **Connectivité :** En ligne (pas d'offline nécessaire)

**Responsive mobile (bonus MVP) :**
- Mode "consultation" pour accéder aux routines et checklists en déplacement ou backstage
- Pas de création complexe sur mobile, mais lecture et validation checklist possibles

### Effortless Interactions

**Ajout de matériel ultra-rapide :**
- Objectif : 30 secondes max par item
- Champs essentiels : Nom, Type, Catégorie, Auteur, Emplacement
- Formulaire épuré, auto-completion où possible

**Recherche & filtrage omniprésents :**
- Barre de recherche accessible **partout, tout le temps**
- Résultats instantanés (< 500ms selon NFR)
- Filtres combinables (type + catégorie + lieu + auteur)
- Pas besoin de "revenir à une page recherche" - c'est universel

**Navigation 1-clic :**
- Sur une routine → clic sur matériel lié → fiche complète du matériel + autres routines l'utilisant
- Sur un matériel → voir instantanément dans quelles routines/spectacles il est utilisé
- Bidirectionnalité fluide sans jamais se perdre

**Notes volantes avec auto-save :**
- Capture spontanée : titre + date suffisent
- Sauvegarde automatique pendant la frappe
- Option de sauvegarde manuelle également disponible
- Aucune idée ne se perd jamais

### Critical Success Moments

1. **Premier ajout de matériel en < 30s :**
   - Marc ajoute "Jeu Hedan" (type cartes, catégorie mentalisme, auteur Hedan, lieu Tiroir cartes) → en 25 secondes
   - Réaction : "C'est plus rapide que mon Excel !"

2. **Première recherche instantanée :**
   - Marc tape "Hedan" → résultats en 300ms affichant tous ses items
   - Réaction : "Enfin, je trouve mes trucs sans scroller 400 lignes !"

3. **Première routine créée avec liaison matériel :**
   - Marc crée "Matrix Coins", lie son matériel, écrit le script → flow fluide
   - **LE MOMENT DÉCISIF** : "L'inventaire clair + la routine fluide = je n'ai plus besoin d'Excel"

4. **Navigation magique 1-clic :**
   - Marc clique sur un matériel dans une routine → voit la fiche + autres routines l'utilisant
   - Réaction : "La traçabilité bidirectionnelle, c'est exactement ce que j'attendais !"

5. **Checklist spectacle instantanée :**
   - Marc prépare "Cocktail Années 20" → clic "Générer checklist" → liste complète avec emplacements
   - Réaction : "Plus jamais je n'oublierai un accessoire !"

6. **Note volante sauvée automatiquement :**
   - Marc a une idée à 2h du matin, tape le titre et quelques mots → auto-save
   - Lendemain, il retrouve sa note intacte
   - Réaction : "Mes idées ne se perdent plus !"

### Experience Principles

**1. Vitesse Chirurgicale**
- Ajout matériel : 30 secondes max
- Recherche/filtrage : < 500ms (instantané perçu)
- Navigation : 1 clic pour accéder aux éléments liés
- Aucun délai, aucune friction, tout est rapide

**2. Clarté Visuelle Immédiate**
- Vue d'ensemble claire de l'inventaire (fini le bordel Excel)
- Cards, badges, codes couleurs, icônes pour comprendre d'un coup d'œil
- Architecture de l'information qui privilégie la vision "macro" tout en permettant l'accès rapide aux détails

**3. Fluidité de Liaison**
- Matériel ↔ Routines ↔ Spectacles : navigation bidirectionnelle sans friction
- Lier du matériel à une routine = simple, évident, immédiat
- Voir où est utilisé un matériel = 1 clic, traçabilité complète

**4. Accessibilité Universelle**
- Recherche/filtrage accessible **partout, tout le temps** (header global)
- Pas besoin de "revenir à la page recherche" - c'est omniprésent
- Shortcuts clavier pour power users

**5. Capture Spontanée**
- Notes volantes avec auto-save : les idées ne se perdent jamais
- Titre + date suffit, pas de formulaire complexe
- Bouton d'accès rapide ou shortcut clavier

## Desired Emotional Response

### Primary Emotional Goals

**Émotions principales recherchées :**

1. **En Contrôle et Organisé** : L'utilisateur doit sentir qu'il maîtrise totalement son inventaire et ses routines. Fini le chaos Excel où on ne sait plus où chercher. La clarté et la structure dominent l'expérience.

2. **Efficace et Productif** : Chaque action doit être rapide (30s ajout matériel, < 500ms recherche). L'utilisateur doit ressentir un gain de temps énorme par rapport à Excel. Aucune friction, juste de l'efficacité.

3. **Soulagement et Maîtrise** : C'est l'émotion "word-of-mouth" qui fait qu'un magicien dit à un collègue "tu DOIS essayer cette app". Le soulagement de ne plus avoir à gérer le bordel, et le sentiment de maîtrise totale de sa pratique.

### Emotional Journey Mapping

**1. Première Découverte (Onboarding)**
- **Émotions :** Espoir ("Enfin une solution ?") et Curiosité ("Voyons si c'est mieux qu'Excel")
- **Design :** Interface vide accueillante avec guidance claire, onboarding optionnel non-intrusif

**2. Action Principale (Gestion Inventaire, Création Routine)**
- **Émotions :** En contrôle, Efficace, Organisé
- **Design :** Vue macro claire, actions ultra-rapides, navigation 1-clic, recherche omniprésente

**3. Après Accomplissement de Tâche**
- **Émotions :** Satisfaction ("Travail bien fait"), Soulagement ("C'est fait proprement")
- **Design :** Messages de succès visuels, feedback immédiat, résultats visibles instantanément

**4. En Cas d'Erreur ou Problème**
- **Émotions :** Guidé ("Je sais quoi faire"), Rassuré ("Pas de panique")
- **Design :** Messages clairs en français, suggestions de correction, validation progressive

**5. Retour Régulier à l'Application**
- **Émotions :** Confort ("Chez moi"), Familiarité ("Je connais")
- **Design :** Interface cohérente et prévisible, patterns UX constants, pas de surprises

### Micro-Emotions

**Confiance (Critical)**
- L'utilisateur sait toujours ce qu'il fait, où il est, et ce qui va se passer
- Labels clairs, boutons explicites ("Ajouter un matériel" pas juste "+")
- Actions prévisibles, pas d'effets de surprise
- Feedback immédiat sur chaque action

**Satisfaction (Critical)**
- Travail bien fait, résultats professionnels
- Qualité visuelle premium (Ant Design 6.2.2 personnalisé)
- Animations fluides mais subtiles
- Interface soignée adaptée aux professionnels

**Trust (Supporting)**
- L'application est fiable, les données sont sécurisées
- Auto-save pour notes volantes, aucune perte de données
- Performance constante (< 500ms recherche garantie)

**Accomplissement (Supporting)**
- Sentiment de progression : inventaire qui grandit, routines créées, spectacles préparés
- Feedback visuel de succès renforcé
- Checklist cochée = satisfaction tangible

### Design Implications

**Pour créer "Contrôle et Organisation" :**
- Vue d'ensemble macro (cards, dashboards, badges)
- Recherche et filtrage accessibles partout, tout le temps
- Breadcrumbs clairs, contexte toujours visible
- Navigation bidirectionnelle 1-clic

**Pour créer "Efficacité et Productivité" :**
- Ajout matériel : 30 secondes max (formulaire épuré)
- Recherche instantanée (< 500ms, résultats immédiats)
- Shortcuts clavier pour power users
- Auto-completion, suggestions intelligentes

**Pour créer "Soulagement et Maîtrise" :**
- Checklist générée instantanément avec emplacements
- Traçabilité complète matériel ↔ routines ↔ spectacles
- Aucun oubli possible (tout est lié et visible)
- Backup automatique, données toujours sécurisées

**Pour créer "Guidance et Réassurance" (erreurs) :**
- Messages d'erreur clairs en français : "Le nom est requis" (pas "Validation error: field_name")
- Validation progressive (erreurs visibles avant soumission)
- Suggestions de correction concrètes
- Pas de jargon technique, ton professionnel mais humain

**Pour créer "Confort" (usage régulier) :**
- Patterns UX cohérents (Ant Design)
- Disposition prévisible et familière
- Pas de changements drastiques entre sessions
- Interface "chez soi"

### Emotional Design Principles

**1. Maîtrise et Contrôle Permanent**
- L'utilisateur doit toujours savoir où il est, ce qu'il peut faire, et ce qui va se passer
- Vue d'ensemble accessible à tout moment (macro vision)
- Aucune action surprise, tout est prévisible
- Contexte toujours visible (breadcrumbs, navigation claire)

**2. Efficacité Ressentie (Speed as a Feature)**
- Tout doit sembler instantané : recherche < 500ms, ajout matériel < 30s
- Pas d'étapes inutiles, optimisation du parcours critique
- Feedback immédiat sur chaque action (pas de délai perçu)
- Shortcuts clavier pour utilisateurs avancés

**3. Guidance Bienveillante (Helpful, Not Intrusive)**
- Messages clairs en français, ton professionnel mais humain
- Aide disponible (tour guidé, tooltips) mais jamais intrusive
- Erreurs = opportunités de guidance, pas de blâme utilisateur
- Validation progressive pour éviter les surprises

**4. Qualité Professionnelle (Built for Pros)**
- Interface soignée, cohérente, élégante (Ant Design premium)
- Adapté à des utilisateurs professionnels (pas de design "jouet")
- Fiabilité et robustesse perçues (auto-save, backup, performance constante)
- Animations fluides mais subtiles (pas de circus)

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Notion : Organisation Claire et Puissante**

Notion excelle dans la création d'expériences à la fois simples et puissantes :

- **Organisation hiérarchique** : Sidebar navigation claire avec pages imbriquées, bases de données structurées
- **Liens bidirectionnels** : Cliquer sur un élément révèle instantanément toutes ses connexions (pages qui le référencent)
- **Vues multiples** : Un même contenu peut être vu en Table, Board, List, Calendar selon le besoin
- **Recherche omniprésente** : Cmd+K (ou Ctrl+K) accessible partout, instantanée, résultats pertinents
- **Progressive disclosure** : Interface épurée par défaut, fonctions avancées accessibles via slash commands et menus contextuels
- **Création rapide** : Shortcuts clavier pour power users, templates pour accélérer

**Ce qui nous inspire pour magic-inventory :**
- La traçabilité bidirectionnelle (notre différenciateur clé) s'inspire directement des liens Notion
- Vues multiples pour l'inventaire (Cards pour macro, Table pour détails/filtrage)
- Recherche Cmd+K omniprésente pour notre principe d'Accessibilité Universelle
- Progressive disclosure pour équilibre Simplicité + Puissance

**Apple UI : Clarté et Élégance**

L'interface Apple (macOS, iOS) définit les standards de clarté et cohérence :

- **Clarté avant tout** : Hiérarchie visuelle immédiate, focus sur le contenu essentiel
- **Espaces blancs généreux** : Respiration visuelle, pas de surcharge cognitive
- **Typographie élégante** : Police système (San Francisco), tailles et poids soigneusement choisis pour lisibilité
- **Animations subtiles** : Transitions fluides mais jamais distrayantes, au service de la compréhension
- **Cohérence des patterns** : Bouton bleu = action primaire, gris = secondaire, rouge = destructive (prévisible)
- **Un bouton = une action** : Pas d'ambiguïté, labels explicites

**Ce qui nous inspire pour magic-inventory :**
- Espaces blancs pour créer une interface aérée et professionnelle (pas le bordel Excel)
- Hiérarchie visuelle claire pour supporter notre principe de Clarté Visuelle Immédiate
- Cohérence des boutons et actions (prévisibilité = Confiance)
- Typographie soignée adaptée aux professionnels (Built for Pros)
- Animations fluides mais discrètes (Ant Design le supporte naturellement)

### Transferable UX Patterns

**Navigation Pattern (Notion-inspired)**
- **Sidebar persistante** : Sections principales toujours visibles (Inventaire, Routines, Spectacles, Notes)
- **Breadcrumbs contextuels** : L'utilisateur sait toujours où il est (Inventaire > Cartomagie > Jeu Hedan)
- **Recherche globale Cmd+K** : Accessible partout, instantanée (< 500ms), cherche dans tout (matériel, routines, spectacles, notes)

**Vues Multiples Pattern (Notion + Airtable-inspired)**
- **Vue Cards (macro)** : Vision d'ensemble avec badges, icônes, couleurs pour scan rapide
- **Vue Table (détaillée)** : Filtrage avancé, tri par colonnes, export
- **Switcher simple** : Toggle entre vues sans perdre le contexte ou les filtres

**Liens Bidirectionnels Pattern (Notion-inspired)**
- **Matériel → Routines/Spectacles** : Cliquer sur un matériel révèle où il est utilisé (1 clic)
- **Routine → Matériel** : Cliquer sur un matériel lié dans une routine ouvre sa fiche complète (1 clic)
- **Contexte toujours visible** : Chaque lien montre le contexte (nombre de routines, nombre de spectacles)

**Progressive Disclosure Pattern (Notion + Apple-inspired)**
- **Actions de base visibles** : Ajouter, Modifier, Supprimer toujours accessibles
- **Filtres avancés cachés** : Bouton "Filtres avancés" révèle options combinables (type + catégorie + lieu + auteur)
- **Shortcuts documentés** : Tooltips ou page d'aide, mais pas imposés à l'utilisateur

**Clarté Visuelle Pattern (Apple-inspired)**
- **Espaces blancs généreux** : Cards avec padding, sections bien séparées
- **Hiérarchie typographique** : Titres (24px bold), sous-titres (18px semibold), texte (14px regular)
- **Cohérence des boutons** :
  - Bleu primaire : Actions principales (Ajouter, Sauvegarder, Générer checklist)
  - Gris secondaire : Actions optionnelles (Annuler, Retour)
  - Rouge danger : Actions destructives (Supprimer)
- **Feedback immédiat** : Messages Ant Design (success, error, warning) visuels et clairs

**Capture Rapide Pattern (Apple Notes + Todoist-inspired)**
- **Notes volantes** : Bouton flottant ou Cmd+N pour capture ultra-rapide
- **Auto-save progressif** : Sauvegarde pendant la frappe (pas de bouton "Enregistrer")
- **Titre + date suffisent** : Pas de formulaire complexe, juste l'essentiel

### Anti-Patterns to Avoid

**Navigation & Structure :**
- ❌ **Hamburger menu qui cache tout** : Contraire à la sidebar Notion persistante et à notre principe d'Accessibilité Universelle
- ❌ **Breadcrumbs absents** : L'utilisateur se perd dans les niveaux (Matériel → Routine → Spectacle)
- ❌ **Recherche cachée dans un menu** : Doit être omniprésente (Cmd+K), pas enterrée

**Visuel & Design :**
- ❌ **Surcharge visuelle** : Trop de couleurs, trop d'infos simultanées (contraire à clarté Apple)
- ❌ **Espaces insuffisants** : Interface étouffante qui rappelle Excel (contraire à espaces blancs Apple)
- ❌ **Design inconsistant** : Boutons différents pour actions similaires (confusion, pas de confiance)
- ❌ **Animations distrayantes** : Effets flashy qui ralentissent et distraient (contraire à subtilité Apple)

**Interaction & UX :**
- ❌ **Fonctions enterrées** : Filtres avancés impossibles à trouver (contraire à progressive disclosure)
- ❌ **Actions ambiguës** : Bouton "+" sans label (que va-t-il ajouter ?) - contraire à clarté Apple
- ❌ **Multi-clics inutiles** : Navigation matériel → routine qui demande 3-4 clics (contraire à notre principe 1-clic)
- ❌ **Pas de feedback** : Action sans confirmation visuelle (utilisateur ne sait pas si ça a marché)

**Performance & Technique :**
- ❌ **Recherche lente** : > 500ms ruine l'expérience d'instantanéité (contraire à NFR)
- ❌ **Pas d'auto-save** : Formulaire perdu si erreur (contraire à notes volantes auto-save)
- ❌ **Vues qui rechargent tout** : Switcher Cards → Table recharge la page (contraire à fluidité Notion)

### Design Inspiration Strategy

**Ce que nous adoptons directement :**

1. **Sidebar navigation Notion** : Sections Inventaire / Routines / Spectacles / Notes toujours visibles
2. **Cmd+K recherche globale** : Accessible partout, instantanée, search-as-you-type
3. **Espaces blancs Apple** : Interface aérée, cards avec padding généreux, sections bien séparées
4. **Cohérence boutons Apple** : Bleu (primaire), Gris (secondaire), Rouge (danger)
5. **Auto-save progressif** : Notes volantes et formulaires sauvegardés pendant la frappe

**Ce que nous adaptons à nos besoins :**

1. **Liens bidirectionnels Notion** → **Traçabilité magic-inventory** :
   - Adapté au contexte magicien : Matériel ↔ Routines ↔ Spectacles
   - Affichage contextuel : "Utilisé dans 3 routines, 2 spectacles" au lieu de simple liste

2. **Vues multiples Notion** → **Cards + Table pour inventaire** :
   - Vue Cards : Vision macro avec badges (type, catégorie), couleurs (lieu)
   - Vue Table : Détails + filtrage avancé combinable
   - Adapté aux magiciens : colonnes spécifiques (Auteur, Emplacement)

3. **Progressive disclosure** → **Filtres avancés accessibles mais non-intrusifs** :
   - Bouton "Filtres" visible mais interface épurée par défaut
   - Filtres combinables : Type + Catégorie + Lieu + Auteur (spécifique magiciens)

4. **Typographie Apple** → **Ant Design System Font adaptée au français** :
   - Police système pour lisibilité
   - Hiérarchie claire : Titres 24px, sous-titres 18px, texte 14px
   - Personnalisation tokens Ant Design

**Ce que nous évitons absolument :**

1. **Hamburger menu** : Contraire à accessibilité et visibilité (Notion sidebar > hamburger)
2. **Surcharge visuelle** : Contraire à clarté Apple et notre principe de Clarté Visuelle Immédiate
3. **Navigation multi-clics** : Contraire à notre principe 1-clic (traçabilité bidirectionnelle)
4. **Recherche cachée** : Contraire à notre principe d'Accessibilité Universelle (Cmd+K partout)
5. **Design "jouet"** : Contraire à notre principe Built for Pros (interface sérieuse et élégante)

**Résumé de la stratégie :**

magic-inventory combine **la puissance organisationnelle de Notion** (liens bidirectionnels, vues multiples, recherche omniprésente) avec **la clarté et l'élégance d'Apple UI** (espaces blancs, hiérarchie visuelle, cohérence) pour créer une expérience **professionnelle, rapide et maîtrisée** adaptée aux magiciens.

L'inspiration guide nos décisions mais reste au service de nos objectifs émotionnels uniques : **Contrôle, Efficacité, Soulagement, Maîtrise**.

## Design System Foundation

### Design System Choice

**Ant Design 6.2.2** (Bibliothèque UI React Enterprise)

Ant Design est un système de design complet et mature développé par Alibaba, spécialement conçu pour des applications d'entreprise professionnelles. Il fournit une bibliothèque complète de composants React de haute qualité avec une excellente documentation et une communauté active.

**Caractéristiques clés :**
- Bibliothèque complète de 50+ composants React prêts à l'emploi
- Token-based theming pour personnalisation flexible
- Support natif TypeScript
- Accessibilité WAI-ARIA intégrée
- Internationalisation native (locale français frFR)
- Performance optimisée (tree-shaking, lazy loading)
- Compatible avec notre stack (React + Vite + Inertia)

### Rationale for Selection

**Alignement avec nos Principes UX :**

**1. Qualité Professionnelle (Built for Pros)**
- Ant Design est conçu pour des applications d'entreprise sérieuses, pas des projets "jouets"
- Interface élégante et cohérente adaptée aux professionnels (magiciens pros)
- Utilisé par Alibaba, Tencent, et des milliers d'applications professionnelles dans le monde

**2. Clarté Visuelle Immédiate (Apple-inspired)**
- Composants avec espaces blancs généreux par défaut
- Hiérarchie typographique claire et lisible
- Design épuré qui supporte notre inspiration Apple UI
- Focus sur le contenu, pas sur la décoration

**3. Efficacité & Rapidité (Speed as a Feature)**
- Développement rapide avec composants prêts à l'emploi (Table, Form, Modal, etc.)
- Patterns UX éprouvés qui accélèrent la mise en œuvre
- Performance optimisée (tree-shaking automatique avec Vite)
- Pas besoin de réinventer les composants de base

**4. Accessibilité Native (NFR12-13)**
- WAI-ARIA intégré sur tous les composants (navigation clavier)
- Contraste suffisant configurable via tokens
- Support lecteurs d'écran
- Conforme aux standards d'accessibilité modernes

**5. Internationalisation (Interface Française)**
- Support natif français avec locale frFR
- Messages d'erreur et labels en français par défaut
- Formatage dates, nombres adaptés au français

**Avantages Techniques :**
- **Compatible stack** : React + Inertia + Vite (architecture définie)
- **Token-based theming** : Personnalisation facile sans toucher aux composants
- **TypeScript natif** : Type-safety complète
- **Documentation excellente** : Exemples, API référence, guides
- **Communauté active** : Support, plugins, mises à jour régulières
- **Stabilité** : Version 6.2.2 (latest stable), pas de breaking changes fréquents

**Pourquoi pas Custom ou Autre Système :**
- **Pas custom** : Projet MVP, besoin de rapidité, pas de budget design system from scratch
- **Pas Material Design** : Trop associé à Google, moins adapté aux pros
- **Pas Tailwind UI** : Utility-first nécessite plus de travail pour cohérence
- **Pas Chakra UI** : Moins mature pour applications d'entreprise complexes

### Implementation Approach

**Configuration Globale (inertia/app.tsx) :**

```typescript
import { ConfigProvider } from 'antd'
import frFR from 'antd/es/locale/fr_FR'
import 'antd/dist/reset.css' // CSS reset

export default function App({ children }) {
  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        token: {
          colorPrimary: '#1890ff',      // Bleu primaire pour actions principales
          colorSuccess: '#52c41a',      // Vert pour succès
          colorWarning: '#faad14',      // Orange pour avertissements
          colorError: '#ff4d4f',        // Rouge pour erreurs/danger
          colorInfo: '#1890ff',         // Bleu pour infos

          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,                 // Taille de base
          borderRadius: 4,              // Coins légèrement arrondis (moderne mais sobre)

          // Espaces (Apple-inspired generous whitespace)
          padding: 16,
          margin: 16,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
```

**Import Pattern (Bonnes Pratiques) :**

```typescript
// ✅ Named imports (tree-shaking optimal)
import { Button, Table, Form, Input, Card, Modal, message } from 'antd'

// ✅ ES modules pour Vite
import frFR from 'antd/es/locale/fr_FR'

// ❌ Éviter default import (pas de tree-shaking)
import antd from 'antd'
```

**Composants Clés pour magic-inventory :**

**Navigation & Structure :**
- `Layout` : Structure globale (Sidebar + Header + Content)
- `Menu` : Navigation sidebar (Inventaire, Routines, Spectacles, Notes)
- `Breadcrumb` : Navigation contextuelle (toujours visible)
- `Affix` : Barre de recherche Cmd+K fixe en header

**Affichage Données :**
- `Table` : Vue Table inventaire (filtrage avancé, tri, pagination)
- `Card` : Vue Cards inventaire (vision macro)
- `Descriptions` : Fiche détail matériel/routine/spectacle
- `Badge` : Labels type, catégorie, statut
- `Tag` : Tags filtres, catégories

**Formulaires & Saisie :**
- `Form` : Ajout/modification matériel, routines, spectacles
- `Input` : Champs texte (nom, auteur, etc.)
- `Select` : Sélection type, catégorie, lieu
- `DatePicker` : Dates (avec locale française)
- `TextArea` : Éditeur routine/spectacle (contenu textuel)

**Actions & Feedback :**
- `Button` : Actions principales (Ajouter, Sauvegarder, Supprimer)
- `Modal` : Confirmations, formulaires secondaires
- `message` : Feedback flash (success, error, warning) - remplace flash messages session
- `Popconfirm` : Confirmation inline actions destructives

**Recherche & Filtrage :**
- `Input.Search` : Barre recherche omniprésente Cmd+K
- `Select` : Filtres combinables (type + catégorie + lieu)
- `Drawer` : Panneau filtres avancés (optionnel, progressive disclosure)

### Customization Strategy

**Tokens de Personnalisation (Theme) :**

**Couleurs (Cohérence Apple-inspired) :**
```typescript
token: {
  // Actions primaires (Ajouter, Sauvegarder, Générer checklist)
  colorPrimary: '#1890ff',        // Bleu - action principale

  // Actions secondaires (Annuler, Retour)
  // Utilise colorBgContainer par défaut (gris clair)

  // Actions destructives (Supprimer)
  colorError: '#ff4d4f',          // Rouge - danger

  // Feedback
  colorSuccess: '#52c41a',        // Vert - succès
  colorWarning: '#faad14',        // Orange - avertissement
  colorInfo: '#1890ff',           // Bleu - information
}
```

**Espaces Blancs (Apple-inspired Generous Whitespace) :**
```typescript
token: {
  padding: 16,                    // Padding cards, sections
  paddingLG: 24,                  // Padding large (modals, drawers)
  paddingSM: 12,                  // Padding small (tags, badges)
  margin: 16,                     // Marges entre sections
  marginLG: 24,                   // Marges grandes
}
```

**Typographie (Hiérarchie Claire) :**
```typescript
token: {
  fontFamily: 'System Font',     // Police système (lisibilité)
  fontSize: 14,                   // Texte normal
  fontSizeHeading1: 24,           // Titres H1 (pages)
  fontSizeHeading2: 20,           // Titres H2 (sections)
  fontSizeHeading3: 16,           // Titres H3 (sous-sections)
  lineHeight: 1.5,                // Lisibilité
}
```

**Coins & Bordures (Moderne mais Sobre) :**
```typescript
token: {
  borderRadius: 4,                // Coins légèrement arrondis
  borderRadiusLG: 8,              // Cards, modals
  borderRadiusSM: 2,              // Petits éléments (tags)
}
```

**Composants Custom (Si Nécessaire) :**

Si Ant Design ne couvre pas un besoin spécifique, nous créerons des composants custom en suivant les tokens :

- **MaterialCard** : Card spécifique inventaire avec badges type/catégorie
- **RoutineEditor** : Éditeur de routine avec liaison matériel
- **ChecklistGenerator** : Génération checklist spectacle avec validation
- **BiDirectionalLink** : Composant de lien bidirectionnel (matériel ↔ routine)

**Règles de Composition :**
- Utiliser les composants Ant Design comme base
- Appliquer les tokens pour cohérence
- Nommer composants custom en PascalCase
- Co-localiser CSS modules si styling custom nécessaire

**Animation & Transitions (Subtiles, Apple-inspired) :**
```typescript
token: {
  motionUnit: 0.1,                // Vitesse animations (rapide mais pas flashy)
  motionBase: 0,                  // Pas d'animation si motion réduite (accessibilité)
  motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Easing naturel
}
```

**Résumé de la Stratégie :**

Ant Design 6.2.2 fournit **la fondation professionnelle et éprouvée** dont magic-inventory a besoin. La personnalisation via tokens garantit :
- **Cohérence visuelle** (Apple-inspired clarity)
- **Efficacité développement** (composants prêts)
- **Qualité professionnelle** (Built for Pros)
- **Performance** (tree-shaking, optimisation Vite)

L'approche "adopt & customize" (pas "build from scratch") permet de **livrer rapidement** tout en maintenant une **identité visuelle propre** adaptée aux magiciens professionnels.
