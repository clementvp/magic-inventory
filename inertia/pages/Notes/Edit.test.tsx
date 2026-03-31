import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesEdit from './Edit'
import { router } from '@inertiajs/react'
import Layout from '~/components/Layout'

vi.mock('@inertiajs/react', () => ({
  router: { put: vi.fn(), visit: vi.fn(), delete: vi.fn() },
  usePage: () => ({ url: '/notes/1/edit', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: vi.fn(({ children }: { children: ReactNode }) => <div>{children}</div>),
}))

const MockLayout = vi.mocked(Layout)

const sampleNote = {
  id: 1,
  title: 'Mon idée magique',
  content: 'Description du tour',
}

const emptyNote = { id: 2, title: null, content: null }

describe('NotesEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('le formulaire est pré-rempli avec le titre de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    const titleInput = screen.getByRole('textbox', { name: /titre/i }) as HTMLInputElement
    expect(titleInput.value).toBe('Mon idée magique')
  })

  it('le formulaire est pré-rempli avec le contenu de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    const contentArea = screen.getByPlaceholderText('Écrivez votre note ici...') as HTMLTextAreaElement
    expect(contentArea.value).toBe('Description du tour')
  })

  it('le formulaire est pré-rempli avec des chaînes vides si la note a des valeurs nulles', () => {
    render(<NotesEdit note={emptyNote} />)
    const titleInput = screen.getByRole('textbox', { name: /titre/i }) as HTMLInputElement
    const contentArea = screen.getByPlaceholderText('Écrivez votre note ici...') as HTMLTextAreaElement
    expect(titleInput.value).toBe('')
    expect(contentArea.value).toBe('')
  })

  it('le Layout reçoit title="Modifier la note" (breadcrumb correct)', () => {
    render(<NotesEdit note={sampleNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Modifier la note' }),
      undefined
    )
  })

  it('le Layout reçoit breadcrumbLabels avec le titre de la note', () => {
    render(<NotesEdit note={sampleNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbLabels: { '1': 'Mon idée magique' },
      }),
      undefined
    )
  })

  it('le Layout reçoit breadcrumbLabels avec "Note sans titre" quand le titre est null', () => {
    render(<NotesEdit note={emptyNote} />)
    expect(MockLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumbLabels: { '2': 'Note sans titre' },
      }),
      undefined
    )
  })

  it('appelle router.put à la soumission', async () => {
    const user = userEvent.setup()
    render(<NotesEdit note={sampleNote} />)

    await user.click(screen.getByRole('button', { name: /enregistrer les modifications/i }))

    await waitFor(() => {
      expect(router.put).toHaveBeenCalledWith(
        '/notes/1',
        expect.objectContaining({ title: 'Mon idée magique', content: 'Description du tour' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('affiche le bouton "Enregistrer les modifications"', () => {
    render(<NotesEdit note={sampleNote} />)
    expect(screen.getByRole('button', { name: /enregistrer les modifications/i })).toBeInTheDocument()
  })
})
