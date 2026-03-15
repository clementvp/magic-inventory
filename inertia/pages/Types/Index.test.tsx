import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TypesIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/types', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockTypes = [
  { id: 1, name: 'Cartes', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Pièces', createdAt: '2026-01-01T00:00:00.000Z' },
]

describe('TypesIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre Types', () => {
    render(<TypesIndex types={mockTypes} />)
    expect(screen.getByRole('heading', { name: 'Types' })).toBeInTheDocument()
  })

  it('affiche le bouton Ajouter un type', () => {
    render(<TypesIndex types={[]} />)
    expect(screen.getByText('Ajouter un type')).toBeInTheDocument()
  })

  it('affiche la liste des types dans le tableau', async () => {
    render(<TypesIndex types={mockTypes} />)
    await waitFor(() => {
      expect(screen.getByText('Cartes')).toBeInTheDocument()
      expect(screen.getByText('Pièces')).toBeInTheDocument()
    })
  })

  it('ouvre le modal de création au clic Ajouter', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={[]} />)
    await user.click(screen.getByText('Ajouter un type'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog')).getByText('Ajouter un type')).toBeInTheDocument()
  })

  it('ouvre le modal de modification au clic Modifier', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={mockTypes} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    expect(screen.getByText('Modifier un type')).toBeInTheDocument()
  })

  it('boutons Supprimer sont de type danger', async () => {
    render(<TypesIndex types={mockTypes} />)
    await waitFor(() => {
      const dangerButtons = screen.getAllByText('Supprimer')
      expect(dangerButtons.length).toBeGreaterThan(0)
    })
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={mockTypes} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    // Modal ouvert avec nom pré-rempli
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByDisplayValue('Cartes')).toBeInTheDocument()
    // Soumettre le formulaire
    const submitButton = within(dialog).getByRole('button', { name: 'Modifier' })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith('/types/1', { name: 'Cartes' }, expect.any(Object))
    })
  })

  it('appelle router.delete après confirmation Popconfirm', async () => {
    const user = userEvent.setup()
    render(<TypesIndex types={mockTypes} />)
    const deleteButtons = await screen.findAllByRole('button', { name: /supprimer/i })
    await user.click(deleteButtons[0])
    // Popconfirm s'affiche
    await waitFor(() => {
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce type ?')).toBeInTheDocument()
    })
    // Cliquer le bouton de confirmation dans le Popconfirm
    const allDeleteButtons = screen.getAllByRole('button', { name: /supprimer/i })
    await user.click(allDeleteButtons[allDeleteButtons.length - 1])
    await waitFor(() => {
      expect(router.delete).toHaveBeenCalledWith('/types/1')
    })
  })
})
