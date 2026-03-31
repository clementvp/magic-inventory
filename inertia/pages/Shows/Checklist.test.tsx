import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShowsChecklist from './Checklist'
import { router } from '@inertiajs/react'

vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn() },
  usePage: () => ({ url: '/shows/1/checklist', props: { flash: {} } }),
}))

vi.mock('~/components/Layout', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}))

const sampleProps = {
  show: { id: 1, name: 'Spectacle Cocktail' },
  hasRoutines: true,
  materials: [
    {
      id: 10,
      name: 'Jeu de cartes',
      type: { id: 1, name: 'Cartes' },
      storageLocation: { id: 5, name: 'Tiroir cartes' },
    },
    {
      id: 11,
      name: 'Foulard rouge',
      type: { id: 2, name: 'Accessoire' },
      storageLocation: null,
    },
    {
      id: 12,
      name: 'Pièce truquée',
      type: null,
      storageLocation: { id: 6, name: 'Boîte pièces' },
    },
  ],
}

const noRoutinesProps = {
  show: { id: 2, name: 'Show vide' },
  hasRoutines: false,
  materials: [],
}

const noMaterialsProps = {
  show: { id: 3, name: 'Show sans matériel' },
  hasRoutines: true,
  materials: [],
}

describe('ShowsChecklist', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche warning "Aucune routine dans ce spectacle" si !hasRoutines', () => {
    render(<ShowsChecklist {...noRoutinesProps} />)
    expect(screen.getByText('Aucune routine dans ce spectacle')).toBeInTheDocument()
  })

  it('affiche info "Aucun matériel associé aux routines" si hasRoutines && materials vide', () => {
    render(<ShowsChecklist {...noMaterialsProps} />)
    expect(screen.getByText('Aucun matériel associé aux routines de ce spectacle.')).toBeInTheDocument()
  })

  it('affiche les noms des matériaux', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Jeu de cartes')).toBeInTheDocument()
    expect(screen.getByText('Foulard rouge')).toBeInTheDocument()
    expect(screen.getByText('Pièce truquée')).toBeInTheDocument()
  })

  it('affiche le type', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Cartes')).toBeInTheDocument()
    expect(screen.getByText('Accessoire')).toBeInTheDocument()
  })

  it("n'affiche pas de type si null", () => {
    render(<ShowsChecklist {...sampleProps} />)
    // Pièce truquée a type null → pas de type affiché pour elle
    const itemButtons = screen.getAllByRole('button', { name: /^Cocher/ })
    expect(itemButtons.length).toBe(3)
  })

  it('affiche le lieu de stockage cliquable', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Tiroir cartes')).toBeInTheDocument()
    expect(screen.getByText('Boîte pièces')).toBeInTheDocument()
  })

  it('clic sur le lieu de stockage navigue vers /storage-locations/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    await userEvent.click(screen.getByText('Tiroir cartes'))
    expect(router.visit).toHaveBeenCalledWith('/storage-locations/5')
  })

  it('affiche "Lieu non défini" si storageLocation est null', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Lieu non défini')).toBeInTheDocument()
  })

  it('coche un item → texte barré', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const itemButton = screen.getByRole('button', { name: /Cocher Jeu de cartes/i })
    await userEvent.click(itemButton)
    const nom = screen.getByText('Jeu de cartes')
    expect(nom.style.textDecoration).toBe('line-through')
  })

  it('coche un item → opacité réduite sur le conteneur', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const itemButton = screen.getByRole('button', { name: /Cocher Jeu de cartes/i })
    await userEvent.click(itemButton)
    expect((itemButton as HTMLElement).style.opacity).toBe('0.75')
  })

  it('"Tout est prêt !" absent si pas tous cochés', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.queryByText('Tout est prêt !')).toBeNull()
  })

  it('"Tout est prêt !" visible quand tous les items sont cochés', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const itemButtons = screen.getAllByRole('button', { name: /^Cocher/ })
    for (const btn of itemButtons) {
      await userEvent.click(btn)
    }
    expect(screen.getByText('Tout est prêt !')).toBeInTheDocument()
  })

  it('bouton "Retour au spectacle" navigue vers /shows/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    await userEvent.click(screen.getByRole('button', { name: /retour au spectacle/i }))
    expect(router.visit).toHaveBeenCalledWith('/shows/1')
  })

  it('affiche le titre h1 avec le nom du spectacle', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByRole('heading', { level: 1, name: /spectacle cocktail/i })).toBeInTheDocument()
  })

  it('passe title="Checklist" au Layout', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Checklist')
  })

  it('entrée clavier sur le lieu navigue vers /storage-locations/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const lieu = screen.getByTestId('storage-location-10')
    lieu.focus()
    await userEvent.keyboard('{Enter}')
    expect(router.visit).toHaveBeenCalledWith('/storage-locations/5')
  })
})
