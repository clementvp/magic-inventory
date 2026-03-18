import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StorageLocationsShow from './Show'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), delete: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/storage-locations/1', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockLocation = { id: 1, name: 'Tiroir cartes', createdAt: '2026-01-01T00:00:00.000Z' }
const mockMaterials = [
  { id: 1, name: 'Bicycle Standard', type: 'Jeu de cartes', categories: ['Cartomagie'], author: 'USPCC' },
  { id: 2, name: 'Thumb Tip', type: 'Accessoire', categories: ['Close-up'], author: 'Vernet' },
]

describe('StorageLocationsShow', () => {
  it('affiche le titre du lieu', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByRole('heading', { name: 'Tiroir cartes' })).toBeInTheDocument()
  })

  it('affiche les boutons Modifier le lieu et Supprimer le lieu', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByText('Modifier le lieu')).toBeInTheDocument()
    expect(screen.getByText('Supprimer le lieu')).toBeInTheDocument()
  })

  it('affiche empty state si aucun matériel', () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    expect(screen.getByText('Aucun matériel dans ce lieu')).toBeInTheDocument()
    expect(screen.getByText('Ajouter un matériel')).toBeInTheDocument()
  })

  it("le bouton Ajouter un matériel pointe vers /materials/create", () => {
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    const link = screen.getByRole('link', { name: 'Ajouter un matériel' })
    expect(link).toHaveAttribute('href', '/materials/create')
  })

  it('affiche la liste des matériels si non vide', async () => {
    render(<StorageLocationsShow location={mockLocation} materials={mockMaterials} />)
    await waitFor(() => {
      expect(screen.getByText('Bicycle Standard')).toBeInTheDocument()
      expect(screen.getByText('Thumb Tip')).toBeInTheDocument()
    })
  })

  it('chaque matériel est un lien vers /materials/:id', async () => {
    render(<StorageLocationsShow location={mockLocation} materials={mockMaterials} />)
    const link = await screen.findByRole('link', { name: /Bicycle Standard/ })
    expect(link).toHaveAttribute('href', '/materials/1')
  })

  it('ouvre le modal de modification au clic Modifier le lieu', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByText('Modifier le lieu'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('pré-remplit le modal avec le nom du lieu', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByText('Modifier le lieu'))
    const dialog = screen.getByRole('dialog')
    const input = within(dialog).getByRole('textbox')
    expect(input).toHaveValue('Tiroir cartes')
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByText('Modifier le lieu'))
    const dialog = screen.getByRole('dialog')
    const submitButton = within(dialog).getByRole('button', { name: 'Modifier' })
    await user.click(submitButton)
    expect(router.put).toHaveBeenCalledWith(
      '/storage-locations/1',
      { name: 'Tiroir cartes' },
      expect.any(Object)
    )
  })

  it('ferme le modal au clic sur le bouton close', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    await user.click(screen.getByRole('button', { name: 'Modifier le lieu' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('appelle router.delete lors de la confirmation suppression', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsShow location={mockLocation} materials={[]} />)
    const deleteButtons = await screen.findAllByRole('button', { name: 'Supprimer le lieu' })
    await user.click(deleteButtons[0])
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Supprimer' }).length).toBeGreaterThan(0)
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Supprimer' })
    await user.click(confirmButtons[confirmButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith(
      '/storage-locations/1',
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
  })
})
