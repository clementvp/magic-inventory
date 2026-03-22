import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ShowsCreate from './Create'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn(), visit: vi.fn() },
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({ url: '/shows/create', props: {} }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="layout" data-title={title}>{children}</div>
  ),
}))

describe('ShowsCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passe le titre "Créer un spectacle" au Layout (AC1 breadcrumb)', () => {
    render(<ShowsCreate />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Créer un spectacle')
  })

  it('affiche le titre h1 "Créer un spectacle"', () => {
    render(<ShowsCreate />)
    expect(screen.getByRole('heading', { name: /créer un spectacle/i })).toBeInTheDocument()
  })

  it('affiche le champ Nom (AC2)', () => {
    render(<ShowsCreate />)
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
  })

  it('affiche le bouton "Créer le spectacle"', () => {
    render(<ShowsCreate />)
    expect(screen.getByRole('button', { name: /créer le spectacle/i })).toBeInTheDocument()
  })

  it('affiche le bouton Annuler', () => {
    render(<ShowsCreate />)
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('affiche une erreur si le Nom est vide à la soumission (AC3)', async () => {
    const user = userEvent.setup()
    render(<ShowsCreate />)
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
  })

  it("n'appelle pas router.post si le Nom est vide (AC3)", async () => {
    const user = userEvent.setup()
    render(<ShowsCreate />)
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
    })
    expect(router.post).not.toHaveBeenCalled()
  })

  it('appelle router.post /shows avec le nom à la soumission (AC4)', async () => {
    const user = userEvent.setup()
    render(<ShowsCreate />)
    const nameInput = screen.getByLabelText('Nom')
    await user.type(nameInput, 'Soirée mariage')
    const submitButton = screen.getByRole('button', { name: /créer le spectacle/i })
    await user.click(submitButton)
    await waitFor(() => {
      expect(router.post).toHaveBeenCalledWith(
        '/shows',
        expect.objectContaining({ name: 'Soirée mariage' }),
        expect.objectContaining({ onFinish: expect.any(Function), onError: expect.any(Function) })
      )
    })
  })

  it('appelle router.visit /shows au clic Annuler', async () => {
    const user = userEvent.setup()
    render(<ShowsCreate />)
    const cancelButton = screen.getByRole('button', { name: 'Annuler' })
    await user.click(cancelButton)
    expect(router.visit).toHaveBeenCalledWith('/shows')
  })
})
