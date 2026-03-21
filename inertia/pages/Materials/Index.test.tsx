import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
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

  it('affiche l\'auteur en vue Cards', async () => {
    render(<MaterialsIndex materials={mockMaterials} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Dai Vernon')).toBeInTheDocument()
  })

  it('affiche l\'empty state en vue Cards quand aucun matériel', async () => {
    render(<MaterialsIndex materials={[]} />)
    await userEvent.click(screen.getByText('Cards'))
    expect(screen.getByText('Aucun matériel dans votre inventaire')).toBeInTheDocument()
  })
})
