import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Index from './Index'

vi.mock('@inertiajs/react', () => ({
  Head: () => null,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Home/Index (Landing Page)', () => {
  it('renders the application name', () => {
    render(<Index />)
    expect(screen.getAllByText('Arcane Ledger').length).toBeGreaterThan(0)
  })

  it('renders a link to /register', () => {
    render(<Index />)
    const registerLinks = screen.getAllByRole('link', { name: /s'inscrire/i })
    expect(registerLinks.length).toBeGreaterThan(0)
    expect(registerLinks[0]).toHaveAttribute('href', '/register')
  })

  it('renders a link to /login', () => {
    render(<Index />)
    const loginLinks = screen.getAllByRole('link', { name: /se connecter/i })
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
  })
})
