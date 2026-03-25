import { describe, it, expect, vi, fireEvent } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Layout from './Layout'

// Mock Inertia hooks and components
vi.mock('@inertiajs/react', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePage: () => ({
    url: '/dashboard',
    props: {
      flash: {},
    },
  }),
}))

describe('Layout', () => {
  it('renders menu items correctly', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getByText('Inventaire')).toBeInTheDocument()
      expect(screen.getByText('Routines')).toBeInTheDocument()
      expect(screen.getByText('Spectacles')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })
  })

  it('renders breadcrumb in header', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    })
  })

  it('renders search input with correct placeholder', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument()
    })
  })

  it('renders children content', async () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  it('renders application name in sidebar', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getByText('Arcane Ledger')).toBeInTheDocument()
    })
  })

  it('affiche le bouton de déconnexion avec aria-label', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      const logoutBtn = screen.getByRole('button', { name: /se déconnecter/i })
      expect(logoutBtn).toBeInTheDocument()
      expect(logoutBtn).toHaveAttribute('aria-label', 'Se déconnecter')
    })
  })

  it('le formulaire de déconnexion pointe vers POST /logout', async () => {
    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      const form = container.querySelector('form[action="/logout"]')
      expect(form).toBeInTheDocument()
      expect(form).toHaveAttribute('method', 'POST')
    })
  })

  it('affiche le texte "Se déconnecter" dans la sidebar', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(screen.getByText('Se déconnecter')).toBeInTheDocument()
    })
  })
})
