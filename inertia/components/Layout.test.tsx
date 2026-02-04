import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Layout from './Layout'

// Mock Inertia usePage hook
vi.mock('@inertiajs/react', () => ({
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

    // Breadcrumb avec "Accueil" devrait être visible (plusieurs instances possibles)
    await waitFor(() => {
      expect(screen.getAllByText('Accueil').length).toBeGreaterThan(0)
    })
  })

  it('renders search input with correct placeholder', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Rechercher.*Cmd\+K ou Ctrl\+K/i)
      ).toBeInTheDocument()
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

  it('renders footer with copyright', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    const currentYear = new Date().getFullYear()
    await waitFor(() => {
      expect(
        screen.getByText(`magic-inventory ©${currentYear}`)
      ).toBeInTheDocument()
    })
  })

  it('renders application name in sidebar', async () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    )

    // Le nom de l'app devrait être visible dans le Sider
    await waitFor(() => {
      expect(screen.getByText('magic-inventory')).toBeInTheDocument()
    })
  })
})
