import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotesCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  usePage: () => ({ url: '/notes/create', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe('NotesCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre "Nouvelle note"', () => {
    render(<NotesCreate />)
    expect(screen.getByText('Nouvelle note')).toBeDefined()
  })

  it('affiche le champ Titre', () => {
    render(<NotesCreate />)
    expect(screen.getByRole('textbox', { name: /titre/i })).toBeDefined()
  })

  it('affiche le TextArea pour le contenu', () => {
    render(<NotesCreate />)
    expect(screen.getByPlaceholderText('Écrivez votre note ici...')).toBeDefined()
  })

  it('affiche le bouton "Enregistrer la note"', () => {
    render(<NotesCreate />)
    expect(screen.getByRole('button', { name: /enregistrer la note/i })).toBeDefined()
  })

  it('appelle router.post à la soumission avec le titre saisi', async () => {
    const user = userEvent.setup()
    render(<NotesCreate />)

    await user.type(screen.getByRole('textbox', { name: /titre/i }), 'Mon titre')
    await user.click(screen.getByRole('button', { name: /enregistrer la note/i }))

    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/notes',
        expect.objectContaining({ title: 'Mon titre' }),
        expect.objectContaining({ onFinish: expect.any(Function) })
      )
    })
  })

  it('appelle router.post même si titre vide (champ optionnel)', async () => {
    const user = userEvent.setup()
    render(<NotesCreate />)

    await user.click(screen.getByRole('button', { name: /enregistrer la note/i }))

    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith('/notes', expect.any(Object), expect.any(Object))
    })
  })
})
