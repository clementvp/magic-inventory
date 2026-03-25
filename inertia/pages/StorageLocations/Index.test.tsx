import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StorageLocationsIndex from './Index'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/storage-locations', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockLocations = [
  { id: 1, name: 'Tiroir cartes', materialsCount: 0, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Bibliothèque', materialsCount: 0, createdAt: '2026-01-01T00:00:00.000Z' },
]

describe('StorageLocationsIndex', () => {
  it('affiche le titre Lieux de Stockage', () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    expect(screen.getByRole('heading', { name: 'Lieux de Stockage' })).toBeInTheDocument()
  })

  it('affiche le bouton Ajouter un lieu', () => {
    render(<StorageLocationsIndex storageLocations={[]} />)
    expect(screen.getByText('Ajouter un lieu')).toBeInTheDocument()
  })

  it('affiche la liste des lieux dans le tableau', async () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    await waitFor(() => {
      expect(screen.getByText('Tiroir cartes')).toBeInTheDocument()
      expect(screen.getByText('Bibliothèque')).toBeInTheDocument()
    })
  })

  it('ouvre le modal de création au clic Ajouter', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={[]} />)
    await user.click(screen.getByText('Ajouter un lieu'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('ouvre le modal de modification au clic Modifier', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    expect(screen.getByText('Modifier un lieu')).toBeInTheDocument()
  })

  it('boutons Supprimer sont présents', async () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    await waitFor(() => {
      const dangerButtons = screen.getAllByText('Supprimer')
      expect(dangerButtons.length).toBe(2)
    })
  })

  it('appelle router.post lors de la soumission création', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={[]} />)
    await user.click(screen.getByText('Ajouter un lieu'))
    const dialog = screen.getByRole('dialog')
    const nameInput = within(dialog).getByLabelText('Nom')
    await user.type(nameInput, 'Mon nouveau lieu')
    const submitButton = within(dialog).getByRole('button', { name: 'Créer' })
    await user.click(submitButton)
    expect(router.post).toHaveBeenCalledWith(
      '/storage-locations',
      { name: 'Mon nouveau lieu' },
      expect.any(Object)
    )
  })

  it('appelle router.delete lors de la confirmation suppression', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const deleteButtons = await screen.findAllByRole('button', { name: 'Supprimer' })
    await user.click(deleteButtons[0])
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Supprimer' }).length).toBeGreaterThan(
        deleteButtons.length
      )
    })
    const allDeleteButtons = screen.getAllByRole('button', { name: 'Supprimer' })
    await user.click(allDeleteButtons[allDeleteButtons.length - 1])
    expect(router.delete).toHaveBeenCalledWith('/storage-locations/1', expect.any(Object))
  })

  it('appelle router.put lors de la soumission modification', async () => {
    const user = userEvent.setup()
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const modifierButtons = await screen.findAllByText('Modifier')
    await user.click(modifierButtons[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const submitButton = within(dialog).getByRole('button', { name: 'Modifier' })
    await user.click(submitButton)
    expect(router.put).toHaveBeenCalledWith(
      '/storage-locations/1',
      { name: 'Tiroir cartes' },
      expect.any(Object)
    )
  })

  it('renders title and button as siblings in the same flex container', () => {
    render(<StorageLocationsIndex storageLocations={mockLocations} />)
    const heading = screen.getByRole('heading', { name: /lieux de stockage/i })
    const button = screen.getByRole('button', { name: /ajouter un lieu/i })
    expect(heading.parentElement).toBe(button.parentElement)
  })
})
