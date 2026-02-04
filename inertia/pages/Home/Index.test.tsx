import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Index from './Index'

describe('Home/Index (Landing Page)', () => {
  it('renders the application name', () => {
    render(<Index />)
    expect(screen.getByText('magic-inventory')).toBeInTheDocument()
  })

  it('renders the slogan', () => {
    render(<Index />)
    expect(screen.getByText('Organisez la magie')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Index />)
    expect(
      screen.getByText(
        /Centralisez votre inventaire, routines et spectacles en un seul endroit/i
      )
    ).toBeInTheDocument()
  })

  it('renders signup and login buttons', () => {
    render(<Index />)
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('signup button has primary type (colorPrimary)', () => {
    render(<Index />)
    const signupButton = screen.getByRole('button', { name: /s'inscrire/i })
    // Ant Design Button with type="primary" has class "ant-btn-primary"
    expect(signupButton).toHaveClass('ant-btn-primary')
  })

  it('login button has default type (gray)', () => {
    render(<Index />)
    const loginButton = screen.getByRole('button', { name: /se connecter/i })
    // Ant Design Button with type="default" has class "ant-btn-default"
    expect(loginButton).toHaveClass('ant-btn-default')
  })
})
