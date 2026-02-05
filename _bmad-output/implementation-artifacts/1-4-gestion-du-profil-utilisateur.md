# Story 1.4: Gestion du Profil Utilisateur

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **utilisateur connecté** (connected user),
I want **modifier mes informations de profil** (modify my profile information),
So that **je peux maintenir mes données personnelles à jour** (I can keep my personal data up to date) [FR4].

## Acceptance Criteria

**Scenario 1: Profile Page Access**
- **Given** je suis connecté (I am logged in)
- **When** j'accède à la page /profile
- **Then** je vois un formulaire Ant Design pré-rempli avec mes informations actuelles
- **And** les champs disponibles sont : Nom complet, Email
- **And** le breadcrumb affiche : Accueil > Profil

**Scenario 2: Field Validation - Name**
- **Given** je suis sur la page profil
- **When** je modifie mon nom
- **Then** la validation client vérifie que le nom n'est pas vide
- **And** le nom doit contenir au moins 2 caractères
- **And** le bouton "Enregistrer" est de type primary (bleu)

**Scenario 3: Form Submission with Valid Data**
- **Given** je modifie mes informations
- **When** je soumets le formulaire avec données valides
- **Then** le validator AdonisJS UpdateProfileValidator valide côté serveur
- **And** les modifications sont sauvegardées dans la table users
- **And** un message success s'affiche : "Profil mis à jour avec succès"
- **And** les données affichées sont mises à jour

**Scenario 4: Email Validation - Duplicate Email Error**
- **Given** je modifie mon email
- **When** je soumets avec un email déjà utilisé par un autre compte
- **Then** une erreur serveur est retournée
- **And** un message error s'affiche : "Cet email est déjà utilisé"
- **And** le formulaire reste pré-rempli avec mes modifications

## Tasks / Subtasks

### Backend - Controller et Validators (AC: 1-4)

- [ ] Créer ProfileController (AC: 1, 3, 4)
  - [ ] Créer `app/controllers/profile_controller.ts`
  - [ ] Méthode `edit()`:
    - Charger l'utilisateur authentifié via `auth.user!`
    - Retourner la vue Inertia : `inertia.render('profile/edit', { user })`
  - [ ] Méthode `update()`:
    - Valider avec `updateProfileValidator`
    - Mettre à jour User avec `user.email = data.email; user.fullName = data.fullName; await user.save()`
    - Flash success: "Profil mis à jour avec succès"
    - Rediriger vers `/profile`
    - Gestion d'erreurs avec try-catch, logger, flash error messages français

- [ ] Créer validators Vine pour profile (AC: 2, 4)
  - [ ] Créer `app/validators/profile_validator.ts`
  - [ ] Implémenter `updateProfileValidator` avec règles:
    - fullName: string, trim, min 2, max 255
    - email: string, trim, email, normalizeEmail, unique en DB (IMPORTANT: exclure l'utilisateur courant via whereNot)
  - [ ] Tous les messages d'erreur en français avec SimpleMessagesProvider

- [ ] Configurer routes pour profil (AC: 1, 3)
  - [ ] Modifier `start/routes.ts`
  - [ ] Groupe routes protégées (auth middleware):
    - GET /profile → ProfileController.edit
    - POST /profile → ProfileController.update
  - [ ] Middleware `auth()` redirige users non-connectés vers `/login`

### Frontend - Page Profile Edit (AC: 1, 2, 3, 4)

- [ ] Créer page Profile Edit (AC: 1, 2)
  - [ ] Créer `inertia/pages/profile/edit.tsx`
  - [ ] Utiliser Layout component (avec breadcrumb "Accueil > Profil")
  - [ ] Structure: Card avec Form Ant Design layout="vertical"
  - [ ] Champs requis:
    - Full Name: Label "Nom complet", placeholder "Votre nom complet", pré-rempli avec `user.fullName`
    - Email: Label "Email", placeholder "votre@email.com", pré-rempli avec `user.email`
  - [ ] Validation client (Ant Design Form rules):
    - fullName: required "Veuillez saisir votre nom complet", min 2, max 255
    - email: required "Veuillez saisir votre email", type email "Email invalide"
  - [ ] Bouton submit: type="primary", size="large", text "Enregistrer", loading state
  - [ ] Titre page: Typography.Title level={2} "Mon Profil"
  - [ ] Form submission via router.post('/profile', values) avec error handling
  - [ ] Appliquer tokens Ant Design: padding, margin, colorPrimary #1890ff

- [ ] Gestion erreurs serveur (AC: 4)
  - [ ] Pattern error handling dans onFinish:
    ```typescript
    router.post('/profile', values, {
      onError: (errors) => {
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string]
        }))
        form.setFields(formErrors)
      }
    })
    ```
  - [ ] Afficher erreurs inline sur champs concernés (Ant Design Form.Item)
  - [ ] Messages en français (venant du validator backend)

- [ ] Ajouter lien vers Profile dans navigation (AC: 1)
  - [ ] Modifier `inertia/components/Layout.tsx`
  - [ ] Ajouter menu item "Profil" dans Sidebar avec icon UserOutlined
  - [ ] Lien vers `/profile` avec Link Inertia

### Tests (AC: Tous)

- [ ] Tests unitaires page Profile Edit (AC: 1, 2, 3, 4)
  - [ ] Créer `inertia/pages/profile/edit.test.tsx`
  - [ ] Test: Render champs Nom complet et Email pré-remplis
  - [ ] Test: Bouton "Enregistrer" présent avec type primary
  - [ ] Test: Validation client - nom < 2 chars affiche message erreur
  - [ ] Test: Validation client - email invalide affiche "Email invalide"
  - [ ] Test: Form submission avec données valides
  - [ ] Test: Error handling - duplicate email affiche "Cet email est déjà utilisé"
  - [ ] Mock router.post pour tester soumission

- [ ] Tests backend (optionnel mais recommandé)
  - [ ] Tests fonctionnels profile update:
    - GET /profile retourne formulaire avec données user
    - POST /profile avec données valides met à jour user
    - POST /profile avec email duplicate retourne erreur
    - POST /profile nécessite authentification (redirect /login si non-connecté)
  - [ ] Commande: `node ace test` (Japa)

### Validation Finale (AC: Tous)

- [ ] Tester flow complet Profile Update
  - [ ] Se connecter avec un compte existant
  - [ ] Accéder à /profile via navigation ou URL
  - [ ] Modifier le nom complet et sauvegarder
  - [ ] Vérifier flash message "Profil mis à jour avec succès"
  - [ ] Vérifier que le nom est mis à jour dans la page
  - [ ] Modifier l'email avec un email déjà utilisé
  - [ ] Vérifier message erreur "Cet email est déjà utilisé"
  - [ ] Modifier l'email avec un email valide et unique
  - [ ] Vérifier que l'email est mis à jour

- [ ] Vérifier sécurité (AC: 1, 3)
  - [ ] User ne peut modifier QUE son propre profil (auth.user.id)
  - [ ] Middleware auth protège /profile
  - [ ] Email uniqueness vérifié côté serveur (exclude current user)
  - [ ] CSRF protection automatique (Inertia)

- [ ] Lancer tous les tests (AC: Tous)
  - [ ] `npm run test:front` - tous les tests passent
  - [ ] `node ace test` - tests backend passent (optionnels)

## Dev Notes

### 🔥 Architecture Patterns et Contraintes - CRITIQUES

**Double Validation Pattern (Architecture Required):**
- ✅ Validation serveur = source de vérité (Vine validators)
- ✅ Validation client = UX enhancement (Ant Design Form rules)
- ✅ Règles IDENTIQUES client/serveur (éviter divergences)
- ❌ NE JAMAIS faire confiance uniquement à validation client

**Security: Profile Scoping (NFR5 - CRITICAL):**
- ✅ User ne peut modifier QUE son propre profil
- ✅ Utiliser `auth.user!` pour obtenir l'ID utilisateur (jamais depuis request)
- ✅ Query scope: Email uniqueness doit exclure l'utilisateur courant
- ❌ NE JAMAIS accepter userId depuis request parameters ou body

**Email Uniqueness Validation (Critical Pattern):**
```typescript
// Dans updateProfileValidator
email: vine.string().trim().email().normalizeEmail()
  .unique(async (db, value, field) => {
    // CRITIQUE: Exclure l'utilisateur courant pour permettre de garder son email
    const userId = field.meta.userId // Passé depuis le controller
    const user = await db.from('users')
      .where('email', value)
      .whereNot('id', userId)  // Exclure current user
      .first()
    return !user
  })
```

**Controller Pattern (From Architecture + Story 1.3):**
```typescript
export default class ProfileController {
  async edit({ inertia, auth }: HttpContext) {
    const user = auth.user!  // Non-null assertion - garanti par middleware
    return inertia.render('profile/edit', { user })
  }

  async update({ request, auth, response, session }: HttpContext) {
    try {
      // Passer userId au validator pour email uniqueness check
      const data = await request.validateUsing(updateProfileValidator, {
        meta: { userId: auth.user!.id }
      })

      const user = auth.user!

      // Update only allowed fields
      user.email = data.email
      user.fullName = data.fullName
      await user.save()

      session.flash('success', 'Profil mis à jour avec succès')
      return response.redirect('/profile')
    } catch (error) {
      logger.error('Profile update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la mise à jour du profil')
      return response.redirect().back()
    }
  }
}
```

**Flash Messages Pattern (Story 1.2 Established):**
- Backend: `session.flash('success', 'Message français')`
- Frontend: FlashMessages component (déjà créé) affiche via `message` Ant Design
- Types: success (vert), error (rouge), warning (orange), info (bleu)
- Auto-dismiss: 3 secondes

**Form Pre-fill Pattern (Critical for Edit Pages):**
```typescript
// Dans profile/edit.tsx
export default function ProfileEdit({ user }: { user: User }) {
  const [form] = Form.useForm()

  useEffect(() => {
    // Pré-remplir le formulaire avec les données utilisateur
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email
    })
  }, [user, form])

  const onFinish = (values: ProfileFormValues) => {
    router.post('/profile', values, {
      onError: (errors) => {
        const formErrors = Object.entries(errors).map(([field, messages]) => ({
          name: field,
          errors: Array.isArray(messages) ? messages : [messages as string]
        }))
        form.setFields(formErrors)
      }
    })
  }

  return (
    <Layout>
      <Card>
        <Typography.Title level={2}>Mon Profil</Typography.Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Form fields */}
        </Form>
      </Card>
    </Layout>
  )
}
```

**Loading State Pattern (UI Consistency):**
```typescript
const [loading, setLoading] = useState(false)

const onFinish = (values) => {
  setLoading(true)
  router.post('/profile', values, {
    onSuccess: () => setLoading(false),
    onError: () => setLoading(false)
  })
}

<Button type="primary" htmlType="submit" loading={loading}>
  Enregistrer
</Button>
```

### Source Tree Components à Toucher

**Fichiers à CRÉER:**
- `app/controllers/profile_controller.ts` - Controller pour profile edit/update
- `app/validators/profile_validator.ts` - Validator Vine pour update profile
- `inertia/pages/profile/edit.tsx` - Page édition profil avec form pré-rempli
- `inertia/pages/profile/edit.test.tsx` - Tests page Profile Edit

**Fichiers à MODIFIER:**
- `start/routes.ts` - Ajouter routes GET/POST /profile avec middleware auth
- `inertia/components/Layout.tsx` - Ajouter menu item "Profil" dans Sidebar

**Fichiers EXISTANTS à NE PAS TOUCHER:**
- `app/models/user.ts` - Model User déjà configuré avec fullName et email
- `inertia/app/app.tsx` - ConfigProvider Ant Design déjà configuré (Story 1.1)
- `inertia/components/FlashMessages.tsx` - Composant flash messages déjà créé (Story 1.2)
- `database/migrations/*_create_users_table.ts` - Table users déjà créée avec les bons champs

### Database Schema (Existing - No Changes Needed)

**Table `users` (déjà créée en Story 1.1):**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
)
```

**Champs utilisés pour Profile Management:**
- `full_name`: Nom complet de l'utilisateur (nullable, 2-255 chars)
- `email`: Email unique (254 chars max, RFC 5321 standard)
- `updated_at`: Timestamp auto-mis à jour lors de save()

**Pas de migration nécessaire** - tous les champs requis existent déjà.

### Testing Standards Summary

**Frontend Tests (Vitest + @testing-library/react):**
- Pattern établi en Story 1.1, 1.2, 1.3
- Tests co-localisés : `.test.tsx` à côté du fichier source
- Framework: Vitest avec @testing-library/react et @testing-library/jest-dom
- Setup: `inertia/test/setup.ts` déjà configuré avec mock window.matchMedia

**Pattern de test pour Profile Edit (À SUIVRE):**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProfileEdit from './edit'

// Mock Inertia
vi.mock('@inertiajs/react', () => ({
  router: { post: vi.fn() },
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePage: () => ({ url: '/profile', props: {} })
}))

const mockUser = {
  id: 1,
  fullName: 'John Doe',
  email: 'john@example.com'
}

describe('ProfileEdit Page', () => {
  it('renders profile form with pre-filled data', () => {
    render(<ProfileEdit user={mockUser} />)
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument()
  })

  it('displays validation error for name < 2 chars', async () => {
    render(<ProfileEdit user={mockUser} />)
    const nameInput = screen.getByLabelText('Nom complet')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'A')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText(/Le nom doit contenir au moins 2 caractères/i)).toBeInTheDocument()
    })
  })

  it('displays validation error for invalid email', async () => {
    render(<ProfileEdit user={mockUser} />)
    const emailInput = screen.getByLabelText('Email')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockPost = vi.fn()
    vi.mocked(router).post = mockPost

    render(<ProfileEdit user={mockUser} />)

    const nameInput = screen.getByLabelText('Nom complet')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Jane Doe')

    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/profile', expect.objectContaining({
        fullName: 'Jane Doe',
        email: 'john@example.com'
      }), expect.any(Object))
    })
  })

  it('displays server error for duplicate email', async () => {
    const { rerender } = render(<ProfileEdit user={mockUser} />)

    // Simuler erreur serveur retournée
    const formErrors = [
      { name: 'email', errors: ['Cet email est déjà utilisé'] }
    ]

    // Re-render avec erreurs
    // Note: En réalité, les erreurs viennent via Inertia shared data
    // Ce test vérifie que le composant gère correctement setFields()
  })
})
```

**Commandes de test:**
```bash
# Frontend tests
npm run test:front

# Backend tests (si implémentés)
node ace test
```

### UX Design Principles (Critical for This Story)

**Profile Page Design (Consistency with Story 1.2):**
- Utiliser Layout component existant (Sidebar + Header + Breadcrumb)
- Breadcrumb: "Accueil > Profil"
- Content area: Card Ant Design avec form dedans
- Design sobre et professionnel (Apple-inspired)

**Form Layout:**
- Layout vertical: `layout="vertical"` (labels au-dessus des champs)
- Champs full-width avec size="large" (meilleure UX)
- Espacement: margin 16 entre champs (Ant Design Form.Item default)
- Form pré-rempli avec données actuelles de l'utilisateur

**Typography Hierarchy:**
- Titre page: `Typography.Title level={2}` (20px, semibold) "Mon Profil"
- Labels champs: 14px regular (Ant Design default)
- Messages validation: 12px, color-coded (rouge erreur, vert success)

**Boutons et Actions:**
- Bouton principal: `type="primary"` (bleu #1890ff), `size="large"`, texte "Enregistrer"
- Loading state: `loading={loading}` pendant soumission
- Bouton désactivé si form invalide (optionnel, Ant Design gère automatiquement)

**Validation UX:**
- Feedback immédiat (< 100ms) - validation progressive pendant frappe
- Erreurs inline sur champs concernés (Form.Item red border + message)
- Messages clairs en français (pas de jargon technique)
- Success feedback via flash messages (message.success Ant Design)

**Messages Français (MANDATORY):**
- Labels: "Nom complet", "Email"
- Bouton: "Enregistrer"
- Validation: "Veuillez saisir votre nom complet", "Email invalide", "Le nom doit contenir au moins 2 caractères"
- Success: "Profil mis à jour avec succès"
- Error: "Cet email est déjà utilisé", "Une erreur est survenue lors de la mise à jour du profil"

### Project Structure Notes

**Alignment avec Unified Project Structure (architecture.md):**
- ✅ Controllers backend dans `app/controllers/profile_controller.ts`
- ✅ Validators backend dans `app/validators/profile_validator.ts`
- ✅ Pages Inertia dans `inertia/pages/profile/edit.tsx`
- ✅ Tests co-localisés (`edit.test.tsx`)
- ✅ Routes configurées dans `start/routes.ts`
- ✅ Middleware auth appliqué correctement

**Hiérarchie des Fichiers:**
```
app/
├── controllers/
│   ├── auth_controller.ts           # Existant (Story 1.3)
│   └── profile_controller.ts        # CRÉER: edit, update methods
├── models/
│   └── user.ts                      # NE PAS TOUCHER: déjà configuré
└── validators/
    ├── auth_validator.ts            # Existant (Story 1.3)
    └── profile_validator.ts         # CRÉER: updateProfileValidator

inertia/pages/
├── auth/
│   ├── login.tsx                    # Existant (Story 1.3)
│   └── register.tsx                 # Existant (Story 1.3)
└── profile/
    ├── edit.tsx                     # CRÉER: page édition profil
    └── edit.test.tsx                # CRÉER: tests unitaires

inertia/components/
├── Layout.tsx                       # MODIFIER: ajouter menu item Profil
└── FlashMessages.tsx                # NE PAS TOUCHER: déjà créé (Story 1.2)

start/
└── routes.ts                        # MODIFIER: ajouter routes /profile
```

**Pas de Conflit Détecté:**
- Profile page utilise Layout component existant
- Validators nouveaux, pas de conflit avec auth_validator
- Routes nouvelles, pas de conflit avec routes auth existantes
- FlashMessages component prêt à utiliser pour success/error messages

### Learnings from Previous Stories

**Story 1.1 - Configuration de Base:**
- ✅ Ant Design 6.2.2 configuré avec tokens personnalisés
- ✅ Locale française (frFR) appliquée globalement
- ✅ Tests Vitest validés avec setup
- ✅ Typage TypeScript strict requis (pas de `any`)

**Story 1.2 - Layout et Navigation:**
- ✅ Layout component créé avec Sidebar, Breadcrumbs, Content structure
- ✅ FlashMessages component créé et testé (117 lignes de tests)
- ✅ Navigation SPA via Link Inertia (correction de <a href> en review)
- ✅ 21 tests frontend passants

**Story 1.3 - Auth Pages Customization:**
- ✅ Pages auth (login, register) personnalisées avec Ant Design
- ✅ Double validation pattern établi (client + server)
- ✅ Vine validators avec messages français (SimpleMessagesProvider)
- ✅ Error handling pattern: onError callback avec form.setFields()
- ✅ Loading state sur boutons submit
- ✅ 38/38 tests frontend passants (100% success rate)

**Code Patterns Established (À CONTINUER):**
- TypeScript strict: `interface ProfileFormValues { fullName: string; email: string }`
- Link Inertia: `import { Link } from '@inertiajs/react'`
- Tokens usage: `const { token } = theme.useToken()`
- Form submission: `router.post('/profile', values, { onError: ... })`
- Error handling: `form.setFields(formErrors)` pour afficher erreurs serveur
- Loading state: `const [loading, setLoading] = useState(false)`

**Problems Encountered & Solutions (Stories 1.1-1.3):**
- ❌ Utilisation de `<a href>` → ✅ Solution : `Link` d'Inertia pour navigation SPA
- ❌ Typage `any` → ✅ Solution : Interfaces TypeScript strictes
- ❌ CSS inline → ✅ Solution : Tokens Ant Design via theme.useToken()
- ❌ Oubli loading state → ✅ Solution : useState + Button loading prop
- ❌ Email uniqueness sans exclure current user → ✅ Solution : whereNot dans validator

**Testing Approaches That Worked:**
- Vitest + @testing-library/react validés (38 tests Story 1.3)
- Tests co-localisés (`.test.tsx` à côté source)
- Pattern: render → screen.getByLabelText → userEvent → waitFor → expect
- Matchers @testing-library/jest-dom: toBeInTheDocument(), toHaveStyle()
- Mock Inertia router pour tester navigation et soumission
- Mock window.matchMedia pour Ant Design components

### Git Intelligence Summary

**Last 5 Commits Context:**
- 3c73b17: Story 1.3 complétée - Auth pages customization with Ant Design (38 tests passants)
- 2506468: Story 1.2 complétée - Landing page + Layout + Navigation (21 tests)
- f02a79e: Project context et sprint change proposal documents
- bcb0190: Environment config et auth flow enhancement
- 3c02ecc: Retire .claude et _bmad de git (nettoyage)

**Recent Work Patterns (Commit 3c73b17 Analysis):**
- Focus sur UX professionnelle et double validation
- Vine validators avec messages français (SimpleMessagesProvider)
- Error handling robuste avec try-catch et flash messages
- Loading states sur boutons pour empêcher double soumission
- Tests exhaustifs : 38 tests couvrant tous les scénarios

**Actionable Insights for Current Story (1.4):**
- Profile controller doit suivre même pattern qu'AuthController
- Validator doit utiliser SimpleMessagesProvider pour messages français
- Form doit avoir loading state sur bouton submit
- Email uniqueness validator doit exclure current user (whereNot)
- Tests doivent couvrir: render, validation, soumission, erreurs serveur
- Utiliser Layout component pour breadcrumb et navigation

### Latest Technical Specifics

**AdonisJS 6 Auth Layer:**
- Session driver: Cookie (HTTP-only, secure in production)
- Auth usage: `auth.user!` pour obtenir l'utilisateur authentifié
- User Model: `withAuthFinder` mixin pour auth capability
- Password hashing: Scrypt (déjà configuré, pas utilisé dans cette story)

**Vine Validation (AdonisJS Ecosystem):**
- API: `vine.compile(vine.object({ ... }))`
- Rules: `vine.string()`, `.trim()`, `.email()`, `.minLength()`, `.maxLength()`, `.unique()`
- Custom messages: SimpleMessagesProvider (utiliser messages français)
- Meta data: Passer userId via `request.validateUsing(validator, { meta: { userId } })`

**Ant Design 6.2.2 Form API:**
- Form component: `<Form layout="vertical" onFinish={handleSubmit} form={form}>`
- Form.Item: `<Form.Item name="fullName" label="Nom complet" rules={[...]}>`
- Form hooks: `const [form] = Form.useForm()` pour contrôle programmatique
- Validation: `form.validateFields()`, `form.setFields(errors)`, `form.setFieldsValue(values)`
- Pre-fill: `useEffect(() => form.setFieldsValue({ ...user }), [user, form])`

**Inertia.js React Adapter (Latest 1.x):**
- Form submission: `router.post(url, data, { onError: callback, onSuccess: callback })`
- Error handling: `onError: (errors) => { form.setFields(...) }`
- Link component: `<Link href="/path">` pour navigation SPA
- usePage hook: `const { props, url } = usePage()` pour récupérer flash/errors

**React 18 + TypeScript Best Practices:**
- Functional components: `export default function ProfileEdit({ user }: Props) { }`
- TypeScript interfaces: `interface ProfileFormValues { fullName: string; email: string }`
- Hooks: `useState`, `useEffect` pour side-effects et state management
- Props typing: `interface Props { user: { id: number; fullName: string; email: string } }`

**Vitest + @testing-library/react (Latest):**
- render: `render(<ProfileEdit user={mockUser} />)`
- screen queries: `screen.getByLabelText()`, `screen.getByRole()`, `screen.getByDisplayValue()`
- user-event: `await userEvent.type(input, 'text')`, `await userEvent.clear(input)`
- Matchers: `expect(...).toBeInTheDocument()` (via @testing-library/jest-dom)
- waitFor: `await waitFor(() => { expect(...) })` pour assertions async

### References

**[Source: epics.md#Story 1.4 - Gestion du Profil Utilisateur]**
- User story: Utilisateur connecté peut modifier nom et email
- Acceptance criteria: 4 scénarios BDD couvrant affichage, validation, soumission, erreurs
- FR4: Modification des informations de profil utilisateur
- Dépendances: Stories 1.1, 1.2, 1.3 (auth flow établi)

**[Source: architecture.md#User Model]**
- Table users: id, full_name, email, password, timestamps
- Email: unique constraint, 254 chars max (RFC 5321)
- fullName: nullable, 2-255 chars validation
- User.save() auto-met à jour updated_at timestamp

**[Source: architecture.md#Validation Patterns]**
- Double validation: Client (Ant Design) + Server (Vine)
- Server = source de vérité
- Error handling: redirect.back() avec flash errors
- Messages en français mandatory

**[Source: architecture.md#Security - Multi-tenant Isolation]**
- User ne peut modifier QUE son propre profil
- auth.user.id jamais depuis request parameters
- Email uniqueness doit exclure current user (whereNot)
- Middleware auth protège toutes les routes profile

**[Source: architecture.md#Route Configuration]**
- Routes protégées: GET/POST /profile avec middleware auth
- Controller pattern: ProfileController.edit() et .update()
- Flash messages: success/error types

**[Source: ux-design-specification.md#Form UX Patterns]**
- Layout vertical (labels au-dessus)
- Size="large" pour inputs et boutons
- Validation progressive (feedback immédiat)
- Messages français clairs
- Loading state sur boutons submit

**[Source: 1-3-personnalisation-des-pages-dauthentification.md#Dev Notes]**
- Double validation pattern établi
- Vine validators avec SimpleMessagesProvider
- Error handling: onError callback avec form.setFields()
- Loading state pattern: useState + Button loading prop
- Tests pattern: render → userEvent → waitFor → expect

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

N/A - Story créée avec analyse exhaustive via subagents, prête pour développement

### Completion Notes List

**Phase Planification:**
- ✅ Story auto-découverte depuis sprint-status.yaml (Story 1.4 = premier backlog dans Epic 1)
- ✅ Epic 1 status confirmé "in-progress" (Stories 1.1, 1.2, 1.3 déjà done)
- ✅ Analyse exhaustive de tous les artifacts via subagents parallèles:
  - Epic 1 Story 4 complete extraction (user story, AC, tasks, dependencies, business value)
  - Architecture patterns (user model, validation, security, controller patterns, database schema)
  - Previous story intelligence (1.3): auth patterns, double validation, error handling, tests
  - Git intelligence: 5 derniers commits, patterns établis, files modified
- ✅ Latest technical specifics: AdonisJS 6, Vine validators, Ant Design 6.2.2, Inertia 1.x
- ✅ 10+ références précises vers documents sources
- ✅ Tasks/subtasks détaillées (4 tâches principales, ~25 subtasks)
- ✅ Dev Notes exhaustives pour prévenir erreurs de développement
- ✅ CRITICAL patterns documentés: email uniqueness avec whereNot, profile scoping, form pre-fill
- ✅ Ultimate context engine analysis completed - comprehensive developer guide created

### File List

**Fichiers à CRÉER:**
- app/controllers/profile_controller.ts (edit, update methods)
- app/validators/profile_validator.ts (updateProfileValidator avec email uniqueness)
- inertia/pages/profile/edit.tsx (form pré-rempli avec Layout)
- inertia/pages/profile/edit.test.tsx (tests unitaires)

**Fichiers à MODIFIER:**
- start/routes.ts (ajouter routes GET/POST /profile avec middleware auth)
- inertia/components/Layout.tsx (ajouter menu item "Profil" dans Sidebar)

**Fichiers EXISTANTS (ne pas toucher):**
- app/models/user.ts (model User déjà configuré)
- database/migrations/*_create_users_table.ts (table users déjà créée)
- inertia/app/app.tsx (ConfigProvider Ant Design)
- inertia/components/FlashMessages.tsx (flash messages component)
