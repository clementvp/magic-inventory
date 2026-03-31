import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MaterialsShow from './Show'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/materials/1', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockMaterial = {
  id: 1,
  name: 'Bicycle Standard',
  type: { id: 1, name: 'Jeu de cartes' },
  categories: [
    { id: 1, name: 'Cartomagie' },
    { id: 2, name: 'Close-up' },
  ],
  storageLocation: { id: 1, name: 'Tiroir cartes' },
  author: 'Dai Vernon',
  createdAt: '2026-03-18T10:00:00.000Z',
  routines: [],
}

describe('MaterialsShow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le nom du matériel comme titre', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getAllByText('Bicycle Standard').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche le type comme Tag', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('Jeu de cartes')).toBeInTheDocument()
  })

  it('affiche les catégories comme Tags', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('Cartomagie')).toBeInTheDocument()
    expect(screen.getByText('Close-up')).toBeInTheDocument()
  })

  it('affiche un lien vers le lieu de stockage', () => {
    render(<MaterialsShow material={mockMaterial} />)
    const link = screen.getByRole('link', { name: /tiroir cartes/i })
    expect(link).toHaveAttribute('href', '/storage-locations/1')
  })

  it("n'affiche pas le bloc type si non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, type: null }} />)
    expect(screen.queryByText('Jeu de cartes')).toBeNull()
  })

  it("n'affiche pas le bloc catégories si aucune", () => {
    render(<MaterialsShow material={{ ...mockMaterial, categories: [] }} />)
    expect(screen.queryByText('Cartomagie')).toBeNull()
  })

  it("n'affiche pas le lien de stockage si lieu non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, storageLocation: null }} />)
    expect(screen.queryByText('Tiroir cartes')).toBeNull()
  })

  it("n'affiche pas l'auteur si non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, author: null }} />)
    expect(screen.queryByText('Dai Vernon')).toBeNull()
  })

  it('affiche la date formatée en français', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('18 mars 2026')).toBeInTheDocument()
  })

  it('affiche la section routines avec titre et message vide', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('Routines utilisant ce matériel')).toBeInTheDocument()
    expect(screen.getByText("Ce matériel n'est utilisé dans aucune routine")).toBeInTheDocument()
  })

  it("navigue vers /materials/:id/edit au clic sur 'Modifier'", async () => {
    const { router } = await import('@inertiajs/react')
    render(<MaterialsShow material={mockMaterial} />)
    await userEvent.click(screen.getByRole('button', { name: /modifier/i }))
    expect(router.visit).toHaveBeenCalledWith('/materials/1/edit')
  })

  it("affiche le bouton 'Supprimer'", () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it("ouvre le modal de suppression au clic sur 'Supprimer'", async () => {
    render(<MaterialsShow material={mockMaterial} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    expect(await screen.findByText('Supprimer ce matériel ?')).toBeInTheDocument()
  })

  it("appelle router.delete après confirmation dans le modal", async () => {
    const { router } = await import('@inertiajs/react')
    render(<MaterialsShow material={mockMaterial} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    await screen.findByText('Supprimer ce matériel ?')
    const supprimerButtons = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith(
      '/materials/1',
      expect.objectContaining({ onError: expect.any(Function) })
    )
  })
})
