import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Category from '#models/category'
import Type from '#models/type'
import StorageLocation from '#models/storage_location'
import Material from '#models/material'
import Routine from '#models/routine'
import Show from '#models/show'
import Note from '#models/note'

/**
 * Seeder de données de développement pour dev@magic-inventory.com
 * Peuple : types, lieux de rangement, matériels, routines, spectacles, notes
 *
 * Prérequis : node ace db:seed (main_seeder doit avoir été exécuté avant)
 */
export default class DevDataSeeder extends BaseSeeder {
  async run() {
    const user = await User.findByOrFail('email', 'dev@magic-inventory.com')

    // ── 1. Types ────────────────────────────────────────────────────────────────
    const typeNames = [
      'Jeu de cartes',
      'Pièces de monnaie',
      'Cordes',
      'Bagues & anneaux',
      'Dés',
      'Foulards',
      'Gobelets',
      'Livres & publications',
      'Accessoires divers',
    ]
    const types = await Type.createMany(typeNames.map((name) => ({ userId: user.id, name })))
    const typeByName = Object.fromEntries(types.map((t) => [t.name, t]))
    console.log(`✅ ${types.length} types créés`)

    // ── 2. Lieux de rangement ───────────────────────────────────────────────────
    const locationNames = [
      'Mallette close-up',
      'Valise de scène',
      'Bibliothèque du bureau',
      'Tiroir du bureau',
      'Boîte à souvenirs',
      'Étui de voyage',
    ]
    const locations = await StorageLocation.createMany(
      locationNames.map((name) => ({ userId: user.id, name }))
    )
    const locByName = Object.fromEntries(locations.map((l) => [l.name, l]))
    console.log(`✅ ${locations.length} lieux de rangement créés`)

    // ── 3. Catégories (déjà créées par main_seeder, on les récupère) ────────────
    const categories = await Category.query().where('user_id', user.id)
    const catByName = Object.fromEntries(categories.map((c) => [c.name, c]))

    // ── 4. Matériels ─────────────────────────────────────────────────────────────
    const materialsData: {
      name: string
      author?: string
      type: string
      location: string
      categories: string[]
    }[] = [
      {
        name: 'Jeu Bicycle (Standard)',
        type: 'Jeu de cartes',
        location: 'Mallette close-up',
        categories: ['Cartomagie', 'Close-up'],
      },
      {
        name: 'Jeu Tally-Ho (Fan Back)',
        type: 'Jeu de cartes',
        location: 'Mallette close-up',
        categories: ['Cartomagie', 'Close-up'],
      },
      {
        name: "Jeu Expert at the Card Table (Erdnase)",
        type: 'Jeu de cartes',
        location: 'Bibliothèque du bureau',
        categories: ['Cartomagie'],
      },
      {
        name: 'Jeu Invisible Deck',
        type: 'Jeu de cartes',
        location: 'Mallette close-up',
        categories: ['Cartomagie', 'Mentalisme'],
      },
      {
        name: 'Half Dollar (Kennedy)',
        type: 'Pièces de monnaie',
        location: 'Mallette close-up',
        categories: ['Pièces', 'Close-up'],
      },
      {
        name: 'Pièces de 2€ (lot de 4)',
        type: 'Pièces de monnaie',
        location: 'Tiroir du bureau',
        categories: ['Pièces', 'Close-up'],
      },
      {
        name: 'Palming Coin (Morgan Dollar)',
        type: 'Pièces de monnaie',
        location: 'Mallette close-up',
        categories: ['Pièces'],
      },
      {
        name: 'Ring O (taille 18)',
        type: 'Bagues & anneaux',
        location: 'Mallette close-up',
        categories: ['Close-up'],
      },
      {
        name: 'Anneaux chinois (set de 8)',
        type: 'Bagues & anneaux',
        location: 'Valise de scène',
        categories: ['Scène'],
      },
      {
        name: 'Corde magique blanche (3m)',
        type: 'Cordes',
        location: 'Valise de scène',
        categories: ['Scène', 'Close-up'],
      },
      {
        name: 'Foulard de scène rouge (90cm)',
        type: 'Foulards',
        location: 'Valise de scène',
        categories: ['Scène'],
      },
      {
        name: 'Foulard en soie multicolore',
        type: 'Foulards',
        location: 'Mallette close-up',
        categories: ['Close-up', 'Enfants'],
      },
      {
        name: 'Gobelets en aluminium (set de 3)',
        type: 'Gobelets',
        location: 'Valise de scène',
        categories: ['Scène', 'Enfants'],
      },
      {
        name: 'Dés truqués — 6 faces identiques (lot de 6)',
        type: 'Dés',
        location: 'Mallette close-up',
        categories: ['Close-up', 'Enfants'],
      },
      {
        name: 'Card College Vol. 1',
        author: 'Roberto Giobbi',
        type: 'Livres & publications',
        location: 'Bibliothèque du bureau',
        categories: ['Cartomagie'],
      },
      {
        name: 'The Expert at the Card Table',
        author: 'S.W. Erdnase',
        type: 'Livres & publications',
        location: 'Bibliothèque du bureau',
        categories: ['Cartomagie'],
      },
      {
        name: 'Boîte de chapeaux (foulards)',
        type: 'Accessoires divers',
        location: 'Boîte à souvenirs',
        categories: ['Scène'],
      },
      {
        name: 'Chapeau haut de forme pliable',
        type: 'Accessoires divers',
        location: 'Étui de voyage',
        categories: ['Scène', 'Enfants'],
      },
    ]

    const materials: Material[] = []
    for (const m of materialsData) {
      const material = await Material.create({
        userId: user.id,
        name: m.name,
        author: m.author ?? null,
        typeId: typeByName[m.type]?.id ?? null,
        storageLocationId: locByName[m.location]?.id ?? null,
      })
      const cats = m.categories.map((c) => catByName[c]).filter(Boolean)
      if (cats.length) await material.related('categories').sync(cats.map((c) => c.id))
      materials.push(material)
    }
    const matByName = Object.fromEntries(materials.map((m) => [m.name, m]))
    console.log(`✅ ${materials.length} matériels créés`)

    // ── 5. Routines ──────────────────────────────────────────────────────────────
    const routinesData: {
      name: string
      content: string
      categories: string[]
      materials: string[]
    }[] = [
      {
        name: 'Ambitious Card',
        content: `La routine classique par excellence. La carte signée du spectateur remonte systématiquement au-dessus du jeu, quelles que soient les conditions.

Déroulé :
1. Faire signer la carte par le spectateur (sharpie)
2. Placer la carte au milieu du jeu, face à face avec une autre carte
3. Snap du jeu — la carte remonte
4. Variante : carte placée dans la poche du spectateur, elle revient quand même
5. Final : carte coincée entre deux jokers face visible — elle remonte encore

Rythme : soutenu mais pas précipité. Laisser les moments de surprise respirer.
Temps estimé : 5-7 minutes.`,
        categories: ['Cartomagie', 'Close-up'],
        materials: ['Jeu Bicycle (Standard)'],
      },
      {
        name: 'ACAAN — Any Card At Any Number',
        content: `Version mentalisme de l'ACAAN. Le spectateur pense à une carte et à un nombre. Sans toucher le jeu, sa carte se trouve exactement à ce numéro.

Notes :
- Utiliser l'Invisible Deck pour la version impromptu
- Version "clean" : jeu posé sur la table depuis le début
- Attention à bien gérer le moment où le spectateur annonce son choix — ne pas réagir trop vite

Timing : 4-6 minutes.`,
        categories: ['Cartomagie', 'Mentalisme'],
        materials: ['Jeu Bicycle (Standard)', 'Jeu Invisible Deck'],
      },
      {
        name: 'La Pièce Voyageuse',
        content: `Quatre pièces de 2€. Une disparaît de la main gauche et réapparaît dans la main droite, une par une, jusqu'à ce que toutes les pièces soient réunies.

Technique : retenue classique + French drop
Variante finale : les 4 pièces disparaissent d'un coup et tombent dans le verre

Attention aux angles — cette routine est pour du close-up assis ou debout avec peu de monde autour (max 4 personnes).
Temps : 3-4 minutes.`,
        categories: ['Pièces', 'Close-up'],
        materials: ['Pièces de 2€ (lot de 4)'],
      },
      {
        name: 'Ring on String',
        content: `L'anneau du magicien s'accroche et se décroche de la corde de façon inexplicable, puis est prêté au spectateur pour examen.

Points clés :
- Utiliser l'anneau avec le bon grip
- Toujours finir clean (anneau et corde examinés)
- Peut se faire en impromptu avec une alliance et un lacet de chaussure

Durée : 3 minutes. Idéal pour ouvrir ou fermer un set close-up.`,
        categories: ['Close-up'],
        materials: ['Ring O (taille 18)', 'Corde magique blanche (3m)'],
      },
      {
        name: 'Les Anneaux Chinois',
        content: `Routine complète de 8 anneaux. Les anneaux solides s'entrelacent et se séparent, formant des chaînes et des figures géométriques.

Structure :
1. Présentation des anneaux (examen public)
2. Duo — 2 anneaux s'entrelacent
3. Trio — chaîne de 3
4. Séparation spectaculaire
5. Figure finale en étoile à 8 branches

Notes de mise en scène : fond musical lent, éclairage chaud. Silences = magie.
Durée : 7-10 minutes selon la version.`,
        categories: ['Scène'],
        materials: ['Anneaux chinois (set de 8)', 'Foulard de scène rouge (90cm)'],
      },
      {
        name: 'La Corde Coupée et Restaurée',
        content: `La corde est coupée en deux devant les yeux du public, puis restaurée instantanément.

Variantes incluses dans le set :
- Version "nœud coulant" (pour enfants)
- Version "professeur" avec plusieurs spectateurs sur scène
- Version finale avec examen de la corde

Adapté à tous publics. Durée : 2-4 minutes selon variante.`,
        categories: ['Scène', 'Close-up'],
        materials: ['Corde magique blanche (3m)'],
      },
      {
        name: 'Le Détective',
        content: `Routine mentalisme avec un jeu ordinaire. Le magicien identifie la carte pensée par le spectateur grâce à des indices comportementaux.

Script :
"Je suis un détective. Mon travail n'est pas de faire de la magie, mais de lire les gens. Pensez à une carte, n'importe laquelle..."

Technique : Forcing subtil + lecture
Ne pas révéler immédiatement — construire la tension.

Durée : 5-8 minutes. Fort pour clôturer un set.`,
        categories: ['Cartomagie', 'Mentalisme'],
        materials: ['Jeu Tally-Ho (Fan Back)'],
      },
      {
        name: 'Gobelets et Balles',
        content: `Routine classique de gobelets avec 3 phases distinctes.

Phase 1 — Disparitions simples (tempo rapide)
Phase 2 — Transpositions (spectateur impliqué)
Phase 3 — Final surprise avec objets impossibles (orange ou pomme)

Accessoires : 3 gobelets en aluminium + 4 billes + 3 fruits
La routine dure 8-12 minutes selon le public.

Note : Toujours tester les gobelets avant le spectacle — ils se déforment dans les valises.`,
        categories: ['Scène', 'Enfants'],
        materials: ['Gobelets en aluminium (set de 3)'],
      },
      {
        name: 'Le Dé Prophète',
        content: `Le magicien prédit à l'avance la face qui sera choisie par le spectateur après une série de lancers libres.

Version 1 (close-up) : prédiction écrite sur une carte avant le jeu
Version 2 (scène) : prédiction dans une enveloppe scellée au début du spectacle

Utilisable aussi avec des enfants — attire l'attention et facile à suivre.
Durée : 2-3 minutes.`,
        categories: ['Close-up', 'Enfants'],
        materials: ['Dés truqués — 6 faces identiques (lot de 6)'],
      },
    ]

    const routines: Routine[] = []
    for (const r of routinesData) {
      const routine = await Routine.create({ userId: user.id, name: r.name, content: r.content })
      const cats = r.categories.map((c) => catByName[c]).filter(Boolean)
      if (cats.length) await routine.related('categories').sync(cats.map((c) => c.id))
      const mats = r.materials.map((m) => matByName[m]).filter(Boolean)
      if (mats.length) await routine.related('materials').sync(mats.map((m) => m.id))
      routines.push(routine)
    }
    const routineByName = Object.fromEntries(routines.map((r) => [r.name, r]))
    console.log(`✅ ${routines.length} routines créées`)

    // ── 6. Spectacles ────────────────────────────────────────────────────────────
    const showsData: {
      name: string
      notes: string
      routines: string[]
    }[] = [
      {
        name: 'Soirée Mariage — Château de Fontblanche',
        notes: `Contexte : cocktail dînatoire, 80 personnes, jardin extérieur.
Public : mélange adultes + quelques enfants (8-12 ans).
Durée demandée : 1h30 de déambulation + 20 min de spectacle assis.

Contraintes :
- Pas de micro (jardin, vent)
- Lumière naturelle jusqu'à 21h, puis projecteurs orientables
- Table de close-up réservée près de la fontaine

Contact : Marie & Thomas, 06 XX XX XX XX
Cachet : 800€ + déplacements`,
        routines: [
          'Ambitious Card',
          'La Pièce Voyageuse',
          'Ring on String',
          'Les Anneaux Chinois',
        ],
      },
      {
        name: 'Festival des Arts de Rue — Avignon',
        notes: `Stand de 40 minutes, 3 représentations par jour pendant 3 jours.
Public de rue, très varié, rotation rapide.

Programme adapté pour forte rotation — routines courtes et visuelles.
Préférer les routines sans carte (vent, plein soleil).

Logistique : prévoir tapis de close-up lesté, mallette sécurisée dans la camionnette.`,
        routines: [
          'Gobelets et Balles',
          'Les Anneaux Chinois',
          'La Corde Coupée et Restaurée',
          'Le Dé Prophète',
        ],
      },
      {
        name: 'Soirée Corporate — Lyon Confluence',
        notes: `Événement d'entreprise, 120 personnes, cocktail 19h-22h.
Public : cadres supérieurs, internationale (quelques non-francophones).

Ambiance chic — tenue de soirée obligatoire.
Pas d'effets enfantins. Miser sur le mentalisme et l'élégance.

Prévoir des routines silencieuses ou avec peu de texte pour les tables anglophones.
Budget matériel inclus dans le cachet.`,
        routines: [
          'ACAAN — Any Card At Any Number',
          'Le Détective',
          'Ambitious Card',
          'La Pièce Voyageuse',
        ],
      },
      {
        name: 'Spectacle Enfants — École Primaire Montessori',
        notes: `Spectacle de Noël, 45 minutes, 60 enfants (6-10 ans).
Salle polyvalente avec estrade.

Impliquer un maximum d'enfants sur scène.
Finir sur une note festive avec des confettis ou un effet de surprise.

Consigne direction : pas d'effets avec feu, pas de couteaux même faux.`,
        routines: [
          'Gobelets et Balles',
          'La Corde Coupée et Restaurée',
          'Le Dé Prophète',
          'Ring on String',
        ],
      },
    ]

    for (const s of showsData) {
      const show = await Show.create({ userId: user.id, name: s.name, notes: s.notes })
      const showRoutines = s.routines.map((name) => routineByName[name]).filter(Boolean)
      if (showRoutines.length) {
        const syncData: Record<number, { order: number }> = {}
        showRoutines.forEach((r, i) => {
          syncData[r.id] = { order: i }
        })
        await show.related('routines').sync(syncData)
      }
    }
    console.log(`✅ ${showsData.length} spectacles créés`)

    // ── 7. Notes ─────────────────────────────────────────────────────────────────
    const notesData: { title: string; content: string }[] = [
      {
        title: 'Routines à développer',
        content: `Idées en vrac à travailler cette année :

→ ACR (Any Card to Reverse) — voir la méthode de Dani DaOrtiz
→ Triumph avec jeu mélangé face/face
→ Cups & Balls version intimiste (3 personnes max)
→ Un numéro de mentalisme "No Props" — juste la parole
→ Adapter l'Ambitious Card pour un contexte Stand-Up (angles larges)

Priorité : ACR d'abord — c'est la plus polyvalente.`,
      },
      {
        title: 'Notes de timing — Spectacle Mariage',
        content: `Timing testé lors de la répétition du 12 mars :

19h00 — Arrivée, installation close-up table (15 min)
19h15 — Début déambulation cocktail
  → Séquence A (Ambitious + Pièce) : ~12 min par table
  → Pause entre les tables : 3-5 min max
20h30 — Pause obligatoire (entrée des mariés)
21h00 — Reprise déambulation
22h00 — Spectacle assis (20 min)
  → Anneaux Chinois : 8 min
  → Ring on String : 3 min
  → Final impromptu au choix selon ambiance
22h20 — Fin officielle

Marge de sécurité : 10 min. Ne pas improviser trop long sur les tables du fond.`,
      },
      {
        title: 'Lecture — Card College Vol.1',
        content: `Avancement chapitre par chapitre :

[x] Chap. 1 — Tenue du jeu, le deal
[x] Chap. 2 — L'overhand shuffle
[x] Chap. 3 — Le break et le contrôle de carte
[ ] Chap. 4 — La passe (à retravailler)
[ ] Chap. 5 — Double lift
[ ] Chap. 6 — Forces

Notes sur la passe :
Problème récurrent : la main gauche bouge trop visiblement. Filmer la pratique pour identifier.
Référence vidéo : voir la version de Jason England sur Theory11.`,
      },
      {
        title: 'Répertoire public enfants',
        content: `Ce qui marche très bien avec les enfants (6-10 ans) :

✓ Gobelets et balles — toujours une réussite, surtout le final
✓ Dé prophète — interaction forte, ils adorent lancer les dés
✓ Corde coupée — rapide et visuel, parfait pour tenir l'attention
✓ Foulard disparaissant — simple mais efficace pour les plus petits

À éviter :
✗ Mentalisme (trop abstrait)
✗ Routines longues (> 5 min)
✗ Scripts complexes — aller à l'essentiel

Conseil : toujours finir par distribuer un petit cadeau (carte signée, foulard en soie).`,
      },
      {
        title: 'Matériel à commander',
        content: `Liste de courses magie :

Urgent :
- 2 Jeux Bicycle (remplacer les jeux usés)
- Nouvelles billes pour gobelets (les rouges sont perdues)

Quand budget disponible :
- Jeu Fontaine Playing Cards (pour les photos / réseaux)
- Dye Tube pour routine foulard
- Bag of Tricks n°2 (Alexander)

À évaluer :
- Nouveau jeu de mentalisme (voir "Mindbender" de Marc Spelmann)
- Mettre à jour l'assurance matériel (valise de scène non couverte)`,
      },
    ]

    await Note.createMany(notesData.map((n) => ({ userId: user.id, ...n })))
    console.log(`✅ ${notesData.length} notes créées`)

    console.log('\n🎩 Données de dev créées avec succès pour dev@magic-inventory.com')
  }
}
