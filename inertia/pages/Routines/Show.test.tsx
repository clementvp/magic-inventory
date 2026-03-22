import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoutinesShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/routines/1', props: { flash: {} } }),
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
    vi.mocked(router.visit).mockClear()
  })

  it('affiche le nom de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getAllByText('Apparition du foulard').length).toBeGreaterThan(0)
  })

  it('affiche les catégories en Tags', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Close-up')).toBeDefined()
  })

  it('affiche le contenu de la routine', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText(/Ligne 1/)).toBeDefined()
  })

  it('affiche le contenu avec white-space pre-wrap', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    const contentDiv = screen.getByText(/Ligne 1/).closest('div')
    expect(contentDiv).toBeDefined()
    expect(contentDiv!.style.whiteSpace).toBe('pre-wrap')
  })

  it('affiche les matériaux liés', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Foulard rouge')).toBeDefined()
    expect(screen.getByText('Pièce de monnaie')).toBeDefined()
  })

  it('clic sur un matériel navigue vers /materials/:id', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    const item = screen.getByText('Foulard rouge').closest('li')
    await userEvent.click(item!)
    expect(router.visit).toHaveBeenCalledWith('/materials/10')
  })

  it('affiche "Aucun matériel lié" si aucun matériel', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, materials: [] }} />)
    expect(screen.getByText('Aucun matériel lié')).toBeDefined()
  })

  it('affiche le bouton "Modifier"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Modifier')).toBeDefined()
  })

  it('affiche le bouton "Supprimer"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Supprimer')).toBeDefined()
  })

  it('affiche le bouton "Retour aux routines"', () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    expect(screen.getByText('Retour aux routines')).toBeDefined()
  })

  it('clic "Modifier" navigue vers /routines/:id/edit', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByText('Modifier'))
    expect(router.visit).toHaveBeenCalledWith('/routines/1/edit')
  })

  it('clic "Retour aux routines" navigue vers /routines', async () => {
    render(<RoutinesShow routine={sampleRoutine} />)
    await userEvent.click(screen.getByText('Retour aux routines'))
    expect(router.visit).toHaveBeenCalledWith('/routines')
  })

  it('affiche "—" si aucune catégorie', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, categories: [] }} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  it('affiche "Aucun contenu" si content est null', () => {
    render(<RoutinesShow routine={{ ...sampleRoutine, content: null }} />)
    expect(screen.getByText('Aucun contenu')).toBeDefined()
  })
})
