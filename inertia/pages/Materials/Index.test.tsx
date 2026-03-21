import type { ReactNode } from 'react'
import { act, render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import MaterialsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/materials', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockMaterials = [
  {
    id: 1,
    name: 'Bicycle Standard',
    type: { id: 1, name: 'Jeu de cartes' },
    categories: [{ id: 1, name: 'Cartomagie' }],
    storageLocation: { id: 1, name: 'Tiroir cartes' },
    author: 'Dai Vernon',
    createdAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Thumb Tip',
    type: null,
    categories: [],
    storageLocation: null,
    author: null,
    createdAt: '2026-03-17T10:00:00.000Z',
  },
]

describe('MaterialsIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche la table avec les colonnes correctes', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Catégorie(s)')).toBeInTheDocument()
    expect(screen.getByText('Lieu')).toBeInTheDocument()
    expect(screen.getByText('Auteur')).toBeInTheDocument()
    expect(screen.getByText("Date d'ajout")).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('affiche les matériels dans la table', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
    expect(screen.getByText('Jeu de cartes')).toBeInTheDocument()
    expect(screen.getByText('Cartomagie')).toBeInTheDocument()
    expect(screen.getByText('Tiroir cartes')).toBeInTheDocument()
    expect(screen.getByText('Dai Vernon')).toBeInTheDocument()
    expect(screen.getByText('18/03/2026')).toBeInTheDocument()
  })

  it('affiche "—" pour les champs null', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    // Thumb Tip a : type=null, categories=[], storageLocation=null, author=null → 4 "—"
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(4)
  })

  it('affiche le bouton "Ajouter un matériel"', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Ajouter un matériel')).toBeInTheDocument()
  })

  it('navigue vers /materials/create au clic "Ajouter un matériel"', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Ajouter un matériel'))
    expect(router.visit).toHaveBeenCalledWith('/materials/create')
  })

  it('affiche empty state quand aucun matériel', () => {
    render(<MaterialsIndex materials={[]} />)
    expect(screen.getByText('Aucun matériel dans votre inventaire')).toBeInTheDocument()
    expect(screen.getByText('Ajouter votre premier matériel')).toBeInTheDocument()
  })

  it('navigue vers /materials/create depuis empty state', async () => {
    render(<MaterialsIndex materials={[]} />)
    await userEvent.click(screen.getByText('Ajouter votre premier matériel'))
    expect(router.visit).toHaveBeenCalledWith('/materials/create')
  })

  it('navigue vers /materials/:id au clic sur le nom', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Bicycle Standard'))
    expect(router.visit).toHaveBeenCalledTimes(1)
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })

  it('navigue vers /materials/:id au clic sur la ligne (hors nom)', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Jeu de cartes'))
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })
})

describe('MaterialsIndex — Vue Switcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le switcher avec les options Table et Cards', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Cards')).toBeInTheDocument()
  })

  it('affiche la vue Table par défaut', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    // La table est visible (colonne "Nom" header Ant Design Table)
    expect(screen.getAllByText('Nom').length).toBeGreaterThanOrEqual(1)
  })

  it('bascule vers la vue Cards au clic sur "Cards"', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    // En vue Cards, les colonnes Table ont disparu
    expect(screen.queryByText("Date d'ajout")).not.toBeInTheDocument()
    // Et le contenu Cards est visible
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })

  it('affiche le type comme Tag en vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Jeu de cartes')).toBeInTheDocument()
  })

  it('affiche les catégories comme Tags en vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Cartomagie')).toBeInTheDocument()
  })

  it('navigue vers /materials/:id au clic sur une Card', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    // Cliquer sur la Card entière (via le titre)
    await userEvent.click(screen.getByText('Bicycle Standard'))
    expect(router.visit).toHaveBeenCalledWith('/materials/1')
  })

  it('bascule vers la vue Table depuis la vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    await userEvent.click(screen.getByText('Table'))
    // Vérifier qu'on est bien de retour en vue Table
    expect(screen.getAllByText('Nom').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le lieu de stockage en vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText(/Tiroir cartes/)).toBeInTheDocument()
  })

  it("affiche l'auteur en vue Cards", async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Dai Vernon')).toBeInTheDocument()
  })

  it("affiche l'empty state en vue Cards quand aucun matériel", async () => {
    render(<MaterialsIndex materials={[]} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Aucun matériel dans votre inventaire')).toBeInTheDocument()
  })
})

describe('MaterialsIndex — Recherche', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche le champ de recherche par nom', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByPlaceholderText('Rechercher par nom...')).toBeInTheDocument()
  })

  it('filtre par nom après debounce 300ms', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    // Saisir "Bicycle"
    fireEvent.change(searchInput, { target: { value: 'Bicycle' } })

    // Avant le debounce : les 2 matériels sont encore dans le DOM
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()

    // Avancer le timer de 300ms
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Après le debounce : seul Bicycle Standard reste
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })

  it('la recherche est case-insensitive', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    fireEvent.change(searchInput, { target: { value: 'bicycle' } })
    act(() => { vi.advanceTimersByTime(300) })

    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })

  it('affiche tous les matériels après effacement de la recherche', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    // Filtrer d'abord
    fireEvent.change(searchInput, { target: { value: 'Bicycle' } })
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()

    // Effacer → immediate clear (onChange avec valeur vide)
    fireEvent.change(searchInput, { target: { value: '' } })
    act(() => { vi.advanceTimersByTime(300) })

    // Les 2 matériels réapparaissent
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
  })

  it('affiche le compteur de résultats quand la recherche est active', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    fireEvent.change(searchInput, { target: { value: 'Bicycle' } })
    act(() => { vi.advanceTimersByTime(300) })

    expect(screen.getByText('1 résultat(s)')).toBeInTheDocument()
  })

  it("n'affiche pas le compteur quand aucun filtre actif", () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.queryByText(/résultat/)).not.toBeInTheDocument()
  })

  it('affiche no-results state quand la recherche ne trouve rien', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    fireEvent.change(searchInput, { target: { value: 'xxxxnotfound' } })
    act(() => { vi.advanceTimersByTime(300) })

    expect(
      screen.getByText('Aucun matériel ne correspond à vos critères de recherche')
    ).toBeInTheDocument()
  })

  it('onSearch (touche Entrée) déclenche le filtre immédiatement sans attendre le debounce', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')

    // Changer la valeur → démarre le debounce (300ms pas encore écoulés)
    fireEvent.change(searchInput, { target: { value: 'Bicycle' } })

    // Avant le debounce : Thumb Tip toujours présent
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()

    // Simuler Entrée → onSearch bypass le debounce et applique le filtre immédiatement
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter', keyCode: 13 })

    // Sans avancer les timers : Thumb Tip a disparu grâce à onSearch
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })
})

describe('MaterialsIndex — Filtres (Drawer)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le bouton "Filtres"', () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    expect(screen.getByRole('button', { name: 'Filtres' })).toBeInTheDocument()
  })

  it("ouvre le Drawer au clic sur 'Filtres'", async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    expect(screen.getByText('Réinitialiser les filtres')).toBeInTheDocument()
  })

  it('affiche les 4 sections de filtres dans le Drawer', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    // Utiliser les placeholders des Select pour éviter le conflit avec la colonne "Type" de la Table
    expect(screen.getByText('Tous les types')).toBeInTheDocument()
    expect(screen.getByText('Toutes les catégories')).toBeInTheDocument()
    expect(screen.getByText('Tous les lieux')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filtrer par auteur...')).toBeInTheDocument()
  })

  it('filtre par auteur (case-insensitive)', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    await userEvent.type(authorInput, 'dai')

    // Seul Bicycle Standard (auteur: Dai Vernon) devrait être affiché
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })

  it('affiche le compteur de résultats avec filtre auteur actif', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    await userEvent.type(authorInput, 'Vernon')

    expect(screen.getByText('1 résultat(s)')).toBeInTheDocument()
  })

  it('réinitialise les filtres du Drawer', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    // Appliquer un filtre auteur
    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    await userEvent.type(authorInput, 'Vernon')
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()

    // Réinitialiser
    await userEvent.click(screen.getByText('Réinitialiser les filtres'))

    // Les 2 matériels réapparaissent
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
  })

  it('le bouton "Réinitialiser les filtres" est désactivé quand aucun filtre actif', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    const resetBtn = screen.getByText('Réinitialiser les filtres')
    expect(resetBtn.closest('button')).toBeDisabled()
  })

  it('affiche no-results state quand le filtre auteur ne trouve rien', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    await userEvent.type(authorInput, 'xxxxnotfound')

    expect(
      screen.getByText('Aucun matériel ne correspond à vos critères de recherche')
    ).toBeInTheDocument()
  })

  it('filtre par Type via le Select Drawer', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    // Ouvrir le Select Type (virtual={false} → dropdown rendu normalement)
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filtrer par type' }))
    await userEvent.click(await screen.findByTitle('Jeu de cartes'))

    // Seul Bicycle Standard (type: Jeu de cartes) est affiché
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })

  it('filtre par Catégorie (multi-select) via le Select Drawer', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    // Ouvrir le Select Catégorie
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filtrer par catégorie' }))
    await userEvent.click(await screen.findByTitle('Cartomagie'))

    // Seul Bicycle Standard (catégorie: Cartomagie) est affiché
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })

  it('filtre par Lieu de stockage via le Select Drawer', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    // Ouvrir le Select Lieu de stockage
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filtrer par lieu de stockage' }))
    await userEvent.click(await screen.findByTitle('Tiroir cartes'))

    // Seul Bicycle Standard (lieu: Tiroir cartes) est affiché
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })

  it('combinaison de 2 filtres Drawer — AND logic (type + auteur)', async () => {
    // Matériel supplémentaire : même type que Bicycle Standard, auteur différent
    const extendedMaterials = [
      ...mockMaterials,
      {
        id: 3,
        name: 'Multiplying Bottles',
        type: { id: 1, name: 'Jeu de cartes' },
        categories: [],
        storageLocation: null,
        author: 'Paul Harris',
        createdAt: '2026-03-16T10:00:00.000Z',
      },
    ]
    render(<MaterialsIndex materials={extendedMaterials} />)
    await userEvent.click(screen.getByRole('button', { name: 'Filtres' }))

    // Filtre Type = "Jeu de cartes" → Bicycle + Multiplying Bottles (sans Thumb Tip)
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filtrer par type' }))
    await userEvent.click(await screen.findByTitle('Jeu de cartes'))
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.getByText('Multiplying Bottles')).toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()

    // Ajout filtre Auteur = "Dai Vernon" → AND : seulement Bicycle Standard reste
    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    await userEvent.type(authorInput, 'Dai Vernon')
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
    expect(screen.queryByText('Multiplying Bottles')).not.toBeInTheDocument()
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
  })
})

describe('MaterialsIndex — Combinaison filtres + vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('les filtres sont préservés lors du basculement Table → Cards', () => {
    render(<MaterialsIndex materials={mockMaterials} />)

    // Appliquer une recherche
    const searchInput = screen.getByPlaceholderText('Rechercher par nom...')
    fireEvent.change(searchInput, { target: { value: 'Bicycle' } })
    act(() => { vi.advanceTimersByTime(300) })

    // Vérifier filtre actif en Table
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()

    // Basculer vers Cards via fireEvent (compatible fake timers)
    fireEvent.click(screen.getByText('Cards'))

    // Le filtre est préservé en Cards
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })

  it('les filtres sont préservés lors du basculement Cards → Table', () => {
    render(<MaterialsIndex materials={mockMaterials} />)

    // Aller en Cards d'abord via fireEvent
    fireEvent.click(screen.getByText('Cards'))

    // Appliquer filtre auteur via Drawer
    fireEvent.click(screen.getByRole('button', { name: 'Filtres' }))
    const authorInput = screen.getByPlaceholderText('Filtrer par auteur...')
    fireEvent.change(authorInput, { target: { value: 'Dai Vernon' } })
    act(() => { vi.advanceTimersByTime(0) })

    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()

    // Revenir en Table via fireEvent
    fireEvent.click(screen.getByText('Table'))

    // Le filtre reste actif
    expect(screen.queryByText('Thumb Tip')).not.toBeInTheDocument()
    expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
  })
})
