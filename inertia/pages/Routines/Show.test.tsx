import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const sampleRoutine = {
  id: 1,
  name: 'Apparition du foulard',
  content: 'Ligne 1\nLigne 2\nLigne 3',
  categories: [{ id: 1, name: 'Close-up' }],
  materials: [
    {
      id: 10,
      name: 'Foulard rouge',
      type: { id: 2, name: 'Accessoire' },
      storageLocation: { id: 3, name: 'Boîte A' },
    },
    {
      id: 11,
      name: 'Pièce de monnaie',
      type: null,
      storageLocation: null,
    },
  ],
  createdAt: '2026-01-15T10:00:00.000Z',
}

describe('RoutinesShow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le nom de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getAllByText('Apparition du foulard').length).toBeGreaterThan(0)
  })

  it('affiche les catégories', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Close-up')).toBeInTheDocument()
  })

  it("n'affiche pas de catégories si aucune", () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, categories: [] }} />)
    expect(screen.queryByText('Close-up')).toBeNull()
  })

  it('affiche le contenu de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Ligne 1\nLigne 2\nLigne 3')
  })

  it('affiche le placeholder "Aucun contenu" si content est null', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, content: null }} />)
    expect(screen.getByPlaceholderText('Aucun contenu')).toBeInTheDocument()
  })

  it('affiche les matériaux liés comme liens', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByRole('link', { name: 'Foulard rouge' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pièce de monnaie' })).toBeInTheDocument()
  })

  it('affiche "Aucun matériel lié à cette routine" si aucun matériel', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, materials: [] }} />)
    expect(screen.getByText('Aucun matériel lié à cette routine')).toBeInTheDocument()
  })

  it('affiche le bouton "Modifier"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument()
  })

  it('affiche le bouton "Supprimer"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument()
  })

  it('clic "Modifier" navigue vers /routines/:id/edit', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByRole('button', { name: /modifier/i }))
    expect(router.visit).toHaveBeenCalledWith('/routines/1/edit')
  })

  it("ouvre le modal de suppression au clic sur 'Supprimer'", async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    expect(await screen.findByText('Supprimer cette routine ?')).toBeInTheDocument()
  })

  it("appelle router.delete après confirmation dans le modal", async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByRole('button', { name: /supprimer/i }))
    await screen.findByText('Supprimer cette routine ?')
    const supprimerButtons = screen.getAllByRole('button', { name: /supprimer/i })
    await userEvent.click(supprimerButtons[supprimerButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith(
      '/routines/1',
      expect.objectContaining({ onError: expect.any(Function) })
    )
  })
})
