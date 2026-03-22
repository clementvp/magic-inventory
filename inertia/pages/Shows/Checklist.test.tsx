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

  it('affiche warning "Ce spectacle ne contient aucune routine" si !hasRoutines', () => {
    render(<ShowsChecklist {...noRoutinesProps} />)
    expect(screen.getByText('Ce spectacle ne contient aucune routine')).toBeDefined()
  })

  it('affiche info "Aucun matériel nécessaire pour ce spectacle" si hasRoutines && materials vide', () => {
    render(<ShowsChecklist {...noMaterialsProps} />)
    expect(screen.getByText('Aucun matériel nécessaire pour ce spectacle')).toBeDefined()
  })

  it('affiche les noms des matériaux', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Jeu de cartes')).toBeDefined()
    expect(screen.getByText('Foulard rouge')).toBeDefined()
    expect(screen.getByText('Pièce truquée')).toBeDefined()
  })

  it('affiche le type en Tag', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Cartes')).toBeDefined()
    expect(screen.getByText('Accessoire')).toBeDefined()
  })

  it('affiche "—" si type est null', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('—')).toBeDefined()
  })

  it('affiche le lieu de stockage cliquable', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByText('Tiroir cartes')).toBeDefined()
    expect(screen.getByText('Boîte pièces')).toBeDefined()
  })

  it('clic sur le lieu de stockage navigue vers /storage-locations/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    await userEvent.click(screen.getByText('Tiroir cartes'))
    expect(router.visit).toHaveBeenCalledWith('/storage-locations/5')
  })

  it('affiche "Lieu non défini" en orange si storageLocation est null', () => {
    render(<ShowsChecklist {...sampleProps} />)
    const lieuNonDefini = screen.getByText('Lieu non défini')
    expect(lieuNonDefini).toBeDefined()
    expect((lieuNonDefini as HTMLElement).style.color).toBe('orange')
  })

  it('coche un item → texte barré + opacité réduite', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const checkbox = screen.getByRole('checkbox', { name: /Cocher Jeu de cartes/i })
    await userEvent.click(checkbox)
    const nom = screen.getByText('Jeu de cartes')
    expect(nom.style.textDecoration).toBe('line-through')
  })

  it('"Checklist complète !" absent si pas tous cochés', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.queryByText('Checklist complète !')).toBeNull()
  })

  it('"Checklist complète !" visible quand tous les items sont cochés', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const checkboxes = screen.getAllByRole('checkbox')
    for (const cb of checkboxes) {
      await userEvent.click(cb)
    }
    expect(screen.getByText('Checklist complète !')).toBeDefined()
  })

  it('bouton "Retour au spectacle" navigue vers /shows/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    await userEvent.click(screen.getByRole('button', { name: /retour au spectacle/i }))
    expect(router.visit).toHaveBeenCalledWith('/shows/1')
  })

  it('affiche le titre h1 "Checklist — [nom du spectacle]"', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByRole('heading', { level: 1, name: /Checklist — Spectacle Cocktail/i })).toBeDefined()
  })

  it('passe title="Checklist" au Layout', () => {
    render(<ShowsChecklist {...sampleProps} />)
    expect(screen.getByTestId('layout')).toHaveAttribute('data-title', 'Checklist')
  })

  it('coche un item → opacité réduite sur le conteneur', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const checkbox = screen.getByRole('checkbox', { name: /Cocher Jeu de cartes/i })
    await userEvent.click(checkbox)
    const nom = screen.getByText('Jeu de cartes')
    const conteneur = nom.parentElement as HTMLElement
    expect(conteneur.style.opacity).toBe('0.5')
  })

  it('entrée clavier sur le lieu navigue vers /storage-locations/:id', async () => {
    render(<ShowsChecklist {...sampleProps} />)
    const lieu = screen.getByTestId('storage-location-10')
    lieu.focus()
    await userEvent.keyboard('{Enter}')
    expect(router.visit).toHaveBeenCalledWith('/storage-locations/5')
  })
})
