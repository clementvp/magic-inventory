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
    const link = screen.getByRole('link', { name: 'Tiroir cartes' })
    expect(link).toHaveAttribute('href', '/storage-locations/1')
  })

  it("affiche '—' pour type si non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, type: null }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it("affiche '—' pour catégories si aucune", () => {
    render(<MaterialsShow material={{ ...mockMaterial, categories: [] }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it("affiche '—' pour lieu si non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, storageLocation: null }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it("affiche '—' pour auteur si non défini", () => {
    render(<MaterialsShow material={{ ...mockMaterial, author: null }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche la date formatée en français', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('18 mars 2026')).toBeInTheDocument()
  })

  it('affiche la section routines vide avec le message placeholder', () => {
    render(<MaterialsShow material={mockMaterial} />)
    expect(screen.getByText('Utilisé dans les routines suivantes :')).toBeInTheDocument()
    expect(
      screen.getByText("Ce matériel n'est utilisé dans aucune routine")
    ).toBeInTheDocument()
  })

  it("navigue vers /materials au clic sur 'Retour à l'inventaire'", async () => {
    const { router } = await import('@inertiajs/react')
    render(<MaterialsShow material={mockMaterial} />)
    await userEvent.click(screen.getByRole('button', { name: /retour à l'inventaire/i }))
    expect(router.visit).toHaveBeenCalledWith('/materials')
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

  it("appelle router.delete après confirmation dans le Popconfirm", async () => {
    const { router } = await import('@inertiajs/react')
    render(<MaterialsShow material={mockMaterial} />)
    // Ouvrir le Popconfirm
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    // Cliquer sur le bouton OK du Popconfirm (second bouton "Supprimer" dans le DOM)
    const supprimerButtons = await screen.findAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith(
      '/materials/1',
      expect.objectContaining({ onError: expect.any(Function) })
    )
  })
})
