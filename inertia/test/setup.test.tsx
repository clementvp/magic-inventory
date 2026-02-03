import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

/**
 * Test de validation de la configuration Vitest
 * Vérifie que l'environnement de test est correctement configuré
 */
describe('Vitest Configuration', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Vitest</div>

    render(<TestComponent />)

    expect(screen.getByText('Hello Vitest')).toBeInTheDocument()
  })

  it('should have jsdom environment available', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
  })

  it('should support @testing-library/jest-dom matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Test'
    document.body.appendChild(element)

    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Test')
  })
})
