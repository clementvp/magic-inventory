import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ShowsEdit from './Edit'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn(), post: vi.fn(), delete: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/shows/1/edit', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="layout" data-title={title}>{children}</div>
  ),
}))

const mockShow = {
  id: 1,
  name: 'Soirée mariage',
  notes: null,
  routines: [],
}

const mockShowWithRoutines = {
  id: 1,
  name: 'Soirée mariage',
  notes: null,
  routines: [
    {
      id: 10,
      name: 'La pièce voyageuse',
      categories: [{ id: 1, name: 'Close-up' }],
    },
    {
      id: 11,
      name: 'Le détective',
      categories: [],
    },
  ],
}

const mockAllRoutines = [
  { id: 10, name: 'La pièce voyageuse' },
  { id: 11, name: 'Le détective' },
  { id: 12, name: 'Ambitious Card' },
]

function renderEdit(showOverrides = {}) {
  return render(
    <ShowsEdit
      show={{ ...mockShow, ...showOverrides }}
      allRoutines={mockAllRoutines}
    />
  )
}

describe('ShowsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Modifier le spectacle"', () => {
    renderEdit()
    expect(screen.getByRole('heading', { name: /modifier le spectacle/i })).toBeInTheDocument()
  })

  it('affiche le champ Nom (AC5)', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
  })

  it('pré-remplit le champ Nom avec le nom du spectacle (AC5)', () => {
    renderEdit()
    expect(screen.getByLabelText('Nom')).toHaveValue('Soirée mariage')
  })

  it('affiche le bouton "Ajouter des routines" (AC5)', () => {
    renderEdit()
    expect(screen.getByRole('button', { name: /ajouter des routines/i })).toBeInTheDocument()
  })

  it('affiche "Aucune routine dans ce spectacle" si routines vide (AC10)', () => {
    renderEdit()
    expect(screen.getByText('Aucune routine dans ce spectacle')).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.put si le Nom est vide", async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.put).not.toHaveBeenCalled()
  })

  it('appelle router.put /shows/1 avec le nom à la soumission', async () => {
    const user = userEvent.setup()
    renderEdit()
    const nameInput = screen.getByLabelText('Nom')
    await user.clear(nameInput)
    await user.type(nameInput, 'Festival été')
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ name: 'Festival été' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('appelle router.visit /shows/:id dynamiquement au clic Annuler', async () => {
    const user = userEvent.setup()
    render(<ShowsEdit show={{ ...mockShow, id: 42 }} allRoutines={mockAllRoutines} />)
    await user.click(screen.getByRole('button', { name: /annuler/i }))
    expect(router.visit).toHaveBeenCalledWith('/shows/42')
  })

  it('affiche les erreurs serveur via onError dans router.put', async () => {
    const user = userEvent.setup()
    vi.mocked(router.put).mockImplementationOnce((_url: string, _data: unknown, options: any) => {
      options?.onError?.({ name: 'Le nom est déjà utilisé' })
      options?.onFinish?.()
    })
    renderEdit()
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(screen.getByText('Le nom est déjà utilisé')).toBeInTheDocument()
    })
  })

  it('le bouton "Ajouter" du modal est désactivé si aucune routine sélectionnée', async () => {
    const user = userEvent.setup()
    renderEdit()
    await user.click(screen.getByRole('button', { name: /ajouter des routines/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeDisabled()
    })
  })

  it('ouvre le Modal au clic "Ajouter des routines" (AC6)', async () => {
    const user = userEvent.setup()
    renderEdit()
    await user.click(screen.getByRole('button', { name: /ajouter des routines/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeInTheDocument()
    })
  })

  it('appelle router.post /shows/1/routines avec les routineIds sélectionnés (AC7)', async () => {
    const user = userEvent.setup()
    renderEdit()

    // Ouvrir le modal
    await user.click(screen.getByRole('button', { name: /ajouter des routines/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^ajouter$/i })).toBeInTheDocument()
    })

    // Ouvrir le Select dans le modal et sélectionner une routine
    const modalBody = document.querySelector('.ant-modal-body')!
    const routineSelect = within(modalBody).getByRole('combobox')
    await user.click(routineSelect)
    await waitFor(() => {
      expect(screen.getByTitle('La pièce voyageuse')).toBeInTheDocument()
    })
    await user.click(screen.getByTitle('La pièce voyageuse'))

    // Cliquer "Ajouter"
    await user.click(screen.getByRole('button', { name: /^ajouter$/i }))

    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/shows/1/routines',
        { routineIds: [10] },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onFinish: expect.any(Function),
        })
      )
    })
  })

  it('affiche les routines liées avec leur nom et catégories (AC8)', () => {
    render(<ShowsEdit show={mockShowWithRoutines} allRoutines={mockAllRoutines} />)
    expect(screen.getByText('La pièce voyageuse')).toBeInTheDocument()
    expect(screen.getByText('Le détective')).toBeInTheDocument()
    expect(screen.getByText('Close-up')).toBeInTheDocument()
  })

  it('affiche le bouton "Retirer" pour chaque routine liée (AC8)', () => {
    render(<ShowsEdit show={mockShowWithRoutines} allRoutines={mockAllRoutines} />)
    const retirerButtons = screen.getAllByRole('button', { name: /retirer/i })
    expect(retirerButtons).toHaveLength(2)
  })

  it('affiche le Popconfirm "Retirer cette routine du spectacle ?" au clic Retirer (AC9)', async () => {
    const user = userEvent.setup()
    render(<ShowsEdit show={mockShowWithRoutines} allRoutines={mockAllRoutines} />)
    const retirerButtons = screen.getAllByRole('button', { name: /retirer/i })
    await user.click(retirerButtons[0])
    await waitFor(() => {
      expect(screen.getByText('Retirer cette routine du spectacle ?')).toBeInTheDocument()
    })
  })

  it('affiche le champ "Notes" (AC1)', () => {
    renderEdit()
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('pré-remplit le TextArea si notes non null (AC5)', () => {
    renderEdit({ notes: 'Mes notes de spectacle' })
    expect(screen.getByLabelText('Notes')).toHaveValue('Mes notes de spectacle')
  })

  it('affiche le TextArea vide si notes est null (AC6)', () => {
    renderEdit({ notes: null })
    expect(screen.getByLabelText('Notes')).toHaveValue('')
  })

  it('affiche le placeholder du champ Notes (AC2)', () => {
    renderEdit()
    expect(
      screen.getByPlaceholderText('Notes, annotations, consignes pour ce spectacle...')
    ).toBeInTheDocument()
  })

  it('envoie notes vide comme chaîne vide à la soumission (AC6)', async () => {
    const user = userEvent.setup()
    renderEdit({ notes: null })
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ notes: '' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('inclut notes dans router.put à la soumission (AC3, AC4)', async () => {
    const user = userEvent.setup()
    render(<ShowsEdit show={{ ...mockShow, notes: 'Mes notes de spectacle' }} allRoutines={mockAllRoutines} />)
    await user.click(screen.getByRole('button', { name: /enregistrer/i }))
    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/shows/1',
        expect.objectContaining({ notes: 'Mes notes de spectacle' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('appelle router.delete /shows/1/routines/:id après confirmation (AC9)', async () => {
    const user = userEvent.setup()
    render(<ShowsEdit show={mockShowWithRoutines} allRoutines={mockAllRoutines} />)
    const retirerButtons = screen.getAllByRole('button', { name: /retirer/i })
    await user.click(retirerButtons[0])
    await waitFor(() => {
      expect(screen.getByText('Retirer cette routine du spectacle ?')).toBeInTheDocument()
    })
    // Trouver le bouton de confirmation dans le Popconfirm
    const confirmButton = screen.getAllByRole('button', { name: /retirer/i }).find(
      (btn) => btn.closest('.ant-popover')
    )
    expect(confirmButton).toBeDefined()
    await user.click(confirmButton!)
    await waitFor(() => {
      expect(router.delete).toHaveBeenCalledWith('/shows/1/routines/10')
    })
  })
})
