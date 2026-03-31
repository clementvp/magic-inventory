import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MaterialsCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/materials/create', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockTypes = [
  { id: 1, name: 'Jeu de cartes' },
  { id: 2, name: 'Accessoire' },
]
const mockCategories = [
  { id: 1, name: 'Cartomagie' },
  { id: 2, name: 'Close-up' },
]
const mockLocations = [{ id: 1, name: 'Tiroir cartes' }]

describe('MaterialsCreate', () => {
  it('affiche le formulaire avec les 5 champs', () => {
    render(
      <MaterialsCreate
        types={mockTypes}
        categories={mockCategories}
        storageLocations={mockLocations}
      />
    )
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Lieu de stockage')).toBeInTheDocument()
    expect(screen.getByLabelText('Auteur')).toBeInTheDocument()
  })

  it('affiche le bouton Créer le matériel', () => {
    render(
      <MaterialsCreate
        types={mockTypes}
        categories={mockCategories}
        storageLocations={mockLocations}
      />
    )
    expect(screen.getByRole('button', { name: /Créer le matériel/i })).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    render(
      <MaterialsCreate
        types={mockTypes}
        categories={mockCategories}
        storageLocations={mockLocations}
      />
    )
    const submitButton = screen.getByRole('button', { name: /Créer le matériel/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.post si le Nom est vide", async () => {
    const user = userEvent.setup()
    render(
      <MaterialsCreate
        types={mockTypes}
        categories={mockCategories}
        storageLocations={mockLocations}
      />
    )
    const submitButton = screen.getByRole('button', { name: /Créer le matériel/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.post).not.toHaveBeenCalled()
  })

  it('appelle router.post avec les bonnes données à la soumission', async () => {
    const user = userEvent.setup()
    render(
      <MaterialsCreate
        types={mockTypes}
        categories={mockCategories}
        storageLocations={mockLocations}
      />
    )
    const nameInput = screen.getByLabelText('Nom')
    await user.type(nameInput, 'Bicycle Standard')
    const submitButton = screen.getByRole('button', { name: /Créer le matériel/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/materials',
        expect.objectContaining({ name: 'Bicycle Standard' }),
        expect.objectContaining({ onFinish: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })

})
