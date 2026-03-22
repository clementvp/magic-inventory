import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import RoutinesEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn(), post: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/routines/1/edit', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="layout" data-title={title}>{children}</div>
  ),
}))

const mockRoutine = {
  id: 1,
  name: 'La pièce voyageuse',
  content: 'Acte 1 : Le magicien présente une pièce...',
  categoryIds: [1, 2],
  materials: [],
}

const mockRoutineWithMaterials = {
  id: 1,
  name: 'La pièce voyageuse',
  content: null,
  categoryIds: [],
  materials: [
    {
      id: 2,
      name: 'Jeu de cartes',
      type: { id: 1, name: 'Cartes' },
      storageLocation: { id: 1, name: 'Sac principal' },
    },
  ],
}

const mockRoutineNoContent = {
  id: 1,
  name: 'La pièce voyageuse',
  content: null,
  categoryIds: [],
  materials: [],
}

const mockCategories = [
  { id: 1, name: 'Close-up' },
  { id: 2, name: 'Mentalisme' },
]

const mockAllMaterials = [
  { id: 1, name: 'Jeu de cartes' },
  { id: 2, name: 'Corde' },
]

function renderEdit(routineOverrides = {}) {
  return render(
    <RoutinesEdit
      routine={{ ...mockRoutine, ...routineOverrides }}
      categories={mockCategories}
      allMaterials={mockAllMaterials}
    />
  )
}

describe('RoutinesEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier la routine"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier la routine/i })).toBeInTheDocument()
  })

  it('affiche les 3 champs (Nom, Catégorie(s), Contenu)', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Catégorie(s)')).toBeInTheDocument()
    expect(screen.getByText('Contenu')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom de la routine', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('La pièce voyageuse')
  })

  it('pré-remplit le champ Contenu avec le contenu existant', () => {
    renderEdit()
    expect(
      screen.getByPlaceholderText('Écrivez votre script, mise en scène, déroulé technique...')
    ).toHaveValue('Acte 1 : Le magicien présente une pièce...')
  })

  it('affiche le champ Contenu vide si content est null', () => {
    render(
      <RoutinesEdit
        routine={mockRoutineNoContent}
        categories={mockCategories}
        allMaterials={mockAllMaterials}
      />
    )
    expect(
      screen.getByPlaceholderText('Écrivez votre script, mise en scène, déroulé technique...')
    ).toHaveValue('')
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
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
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
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
    await user.type(nameInput, 'Le détective')
    const submitButton = screen.getByRole('button', { name: /enregistrer/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/routines/1',
        expect.objectContaining({
          name: 'Le détective',
          content: 'Acte 1 : Le magicien présente une pièce...',
          categoryIds: [1, 2],
        }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('appelle router.visit vers /routines/1 au clic Annuler', async () => {
    const user = userEvent.setup()
    renderEdit()
    const cancelButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(cancelButton)
    expect(router.visit).toHaveBeenCalledWith('/routines/1')
  })

  // AC: 1 — Section "Matériel utilisé" visible
  it('affiche la section "Matériel utilisé"', () => {
    renderEdit()
    expect(screen.getByText('Matériel utilisé')).toBeInTheDocument()
  })

  // AC: 6 — État vide
  it('affiche "Aucun matériel lié à cette routine" si materials est vide', () => {
    renderEdit()
    expect(screen.getByText('Aucun matériel lié à cette routine')).toBeInTheDocument()
  })

  // AC: 2 — Bouton "Ajouter du matériel" visible
  it('affiche le bouton "Ajouter du matériel"', () => {
    renderEdit()
    expect(screen.getByRole('button', { name: /ajouter du matériel/i })).toBeInTheDocument()
  })

  // AC: 2 — Clic "Ajouter du matériel" ouvre le modal
  it('ouvre le modal au clic sur "Ajouter du matériel"', async () => {
    const user = userEvent.setup()
    renderEdit()
    await user.click(screen.getByRole('button', { name: /ajouter du matériel/i }))
    await waitFor(() => {
      // Le modal est ouvert si le bouton "Ajouter" (okText du Modal) est visible
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeInTheDocument()
    })
  })

  // AC: 4, 7 — Nom du matériel lié affiché avec lien /materials/:id
  it('affiche les matériels liés avec lien vers /materials/:id', () => {
    render(
      <RoutinesEdit
        routine={mockRoutineWithMaterials}
        categories={mockCategories}
        allMaterials={mockAllMaterials}
      />
    )
    const link = screen.getByRole('link', { name: 'Jeu de cartes' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/materials/2')
  })

  // AC: 5 — Bouton "Retirer" déclenche Popconfirm
  it('affiche le bouton "Retirer" pour chaque matériel lié', () => {
    render(
      <RoutinesEdit
        routine={mockRoutineWithMaterials}
        categories={mockCategories}
        allMaterials={mockAllMaterials}
      />
    )
    expect(screen.getByRole('button', { name: /retirer/i })).toBeInTheDocument()
  })

  // AC: 5 — Confirmation Popconfirm appelle router.delete
  it('appelle router.delete après confirmation du Popconfirm', async () => {
    const user = userEvent.setup()
    render(
      <RoutinesEdit
        routine={mockRoutineWithMaterials}
        categories={mockCategories}
        allMaterials={mockAllMaterials}
      />
    )
    await user.click(screen.getByRole('button', { name: /retirer/i }))
    await waitFor(() => {
      expect(screen.getByText('Retirer ce matériel de la routine ?')).toBeInTheDocument()
    })
    // Cliquer sur le bouton OK du Popconfirm
    const confirmButton = screen.getAllByRole('button', { name: /retirer/i }).find(
      (btn) => btn.closest('.ant-popover')
    )
    expect(confirmButton).toBeDefined()
    await user.click(confirmButton!)
    await waitFor(() => {
      expect(router.delete).toHaveBeenCalledWith('/routines/1/materials/2')
    })
  })

  // AC: 3 — Le modal affiche le bouton Ajouter (onOk=handleAttach)
  it('le modal affiche le bouton Ajouter pour confirmer la liaison', async () => {
    const user = userEvent.setup()
    renderEdit()
    await user.click(screen.getByRole('button', { name: /ajouter du matériel/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeInTheDocument()
    })
  })

  // AC: 3 — handleAttach appelle router.post avec les materialIds sélectionnés
  it('handleAttach appelle router.post avec les materialIds sélectionnés', async () => {
    const user = userEvent.setup()
    renderEdit()

    // Ouvrir le modal
    await user.click(screen.getByRole('button', { name: /ajouter du matériel/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeInTheDocument()
    })

    // Ouvrir le Select dans le modal et sélectionner "Jeu de cartes"
    const modalBody = document.querySelector('.ant-modal-body')!
    const materialSelect = within(modalBody).getByRole('combobox')
    await user.click(materialSelect)
    await waitFor(() => {
      expect(screen.getByTitle('Jeu de cartes')).toBeInTheDocument()
    })
    await user.click(screen.getByTitle('Jeu de cartes'))

    // Cliquer "Ajouter" pour déclencher handleAttach
    await user.click(screen.getByRole('button', { name: /^ajouter$/i }))

    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/routines/1/materials',
        { materialIds: [1] },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onFinish: expect.any(Function),
        })
      )
    })
  })

  // AC: 1 — breadcrumb : dernier segment = "Modifier"
  it('passe title="Modifier" à Layout pour le breadcrumb', () => {
    renderEdit()
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Modifier')
  })
})
