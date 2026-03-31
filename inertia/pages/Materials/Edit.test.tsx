import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import MaterialsEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/materials/1/edit', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const mockMaterial = {
  id: 1,
  name: 'Bicycle Standard',
  typeId: 1,
  categoryIds: [1, 2],
  storageLocationId: 1,
  author: 'Dai Vernon',
}
const mockTypes = [
  { id: 1, name: 'Jeu de cartes' },
  { id: 2, name: 'Accessoire' },
]
const mockCategories = [
  { id: 1, name: 'Cartomagie' },
  { id: 2, name: 'Close-up' },
]
const mockLocations = [{ id: 1, name: 'Tiroir cartes' }]

function renderEdit(materialOverrides = {}) {
  return render(
    <MaterialsEdit
      material={{ ...mockMaterial, ...materialOverrides }}
      types={mockTypes}
      categories={mockCategories}
      storageLocations={mockLocations}
    />
  )
}

describe('MaterialsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier le matériel"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier le matériel/i })).toBeInTheDocument()
  })

  it('affiche les 5 champs du formulaire', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('Lieu de stockage')).toBeInTheDocument()
    expect(screen.getByLabelText('Auteur')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom du matériel', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('Bicycle Standard')
  })

  it('pré-remplit le champ Auteur avec la valeur actuelle', () => {
    renderEdit()
    expect(screen.getByLabelText('Auteur')).toHaveValue('Dai Vernon')
  })

  it('affiche le bouton Enregistrer les modifications', () => {
    renderEdit()
    expect(
      screen.getByRole('button', { name: /enregistrer les modifications/i })
    ).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.put si le Nom est vide", async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.put).not.toHaveBeenCalled()
  })

  it('appelle router.put avec les bonnes données à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.type(nameInput, 'Bicycle 808')
    const submitButton = screen.getByRole('button', { name: /enregistrer les modifications/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/materials/1',
        expect.objectContaining({
          name: 'Bicycle 808',
          typeId: 1,
          categoryIds: [1, 2],
          storageLocationId: 1,
          author: 'Dai Vernon',
        }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('rend correctement un matériel sans type, lieu ni auteur', () => {
    renderEdit({ typeId: null, storageLocationId: null, author: null })
    expect(screen.getByLabelText('Nom')).toHaveValue('Bicycle Standard')
    expect(screen.getByLabelText('Auteur')).toHaveValue('')
    expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
  })

})
