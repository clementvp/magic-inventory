# Magic Inventory - Project Context

**Ce fichier est automatiquement chargé par tous les agents BMAD pour garantir la cohérence du code.**

## Versions des Packages Critiques

### Backend (AdonisJS v6)

```json
{
  "@adonisjs/core": "^6.18.0",
  "@adonisjs/auth": "^9.4.0",
  "@adonisjs/lucid": "^21.6.1",
  "@adonisjs/inertia": "^3.1.1",
  "@adonisjs/session": "^7.5.1",
  "@vinejs/vine": "^3.0.1"
}
```

### Frontend (React)

```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "@inertiajs/react": "^2.3.13",
  "antd": "^6.2.2",
  "@ant-design/icons": "^6.1.0",
  "dayjs": "^1.11.19"
}
```

### Testing

```json
{
  "vitest": "^4.0.18",
  "@testing-library/react": "^16.3.2",
  "@testing-library/jest-dom": "^6.9.1",
  "jsdom": "^28.0.0"
}
```

---

## APIs Spécifiques à Utiliser

### AdonisJS Auth v9.4.0 ⚠️

**❌ NE PAS UTILISER:** `auth.use('web').attempt(email, password)` (ancienne API)

**✅ UTILISER:**
```typescript
const user = await User.verifyCredentials(email, password)
await auth.use('web').login(user)
```

**Pour logout:**
```typescript
await auth.use('web').logout()
```

**Pour vérifier si connecté:**
```typescript
await auth.use('web').check()
```

---

### VineJS v3.0.1 (Validation)

**Confirmation de champ:**
```typescript
passwordConfirmation: vine
  .string()
  .confirmed({ confirmationField: 'password' })
```

**Unique check:**
```typescript
email: vine
  .string()
  .email()
  .unique(async (db, value) => {
    const user = await db.from('users').where('email', value).first()
    return !user
  })
```

---

### Ant Design 6.2.2

**ConfigProvider (déjà configuré dans app.tsx):**
- Locale: `frFR`
- Tokens personnalisés: colorPrimary #1890ff, padding 16, margin 16

**Composants à privilégier:**
- `Layout`, `Sider`, `Header`, `Content`, `Footer` pour structure
- `Menu` avec `items` array (pas `Menu.Item`)
- `Form` avec `Form.Item` et `rules`
- `message` API pour flash messages (pas `notification`)
- `Link` d'Inertia pour navigation (pas `<a href>`)

---

### Inertia.js React v2.3.13

**Navigation SPA:**
```typescript
import { Link } from '@inertiajs/react'

<Link href="/materials">Matériel</Link>
```

**Form submission:**
```typescript
import { router } from '@inertiajs/react'

router.post('/materials', data, {
  onError: (errors) => {
    // Gérer erreurs serveur
  }
})
```

**Accès aux props:**
```typescript
import { usePage } from '@inertiajs/react'

const { props } = usePage()
const flash = props.flash
```

---

## Patterns à Respecter

### Validation Double

**Client (Ant Design):**
```typescript
<Form.Item
  rules={[
    { required: true, message: 'Le nom est requis' },
    { min: 2, message: 'Minimum 2 caractères' }
  ]}
>
```

**Serveur (VineJS):**
```typescript
export const validator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2)
  })
)
```

### Flash Messages

**Backend:**
```typescript
session.flash('success', 'Opération réussie')
session.flash('error', 'Une erreur est survenue')
session.flash('warning', 'Attention')
session.flash('info', 'Information')
```

**Frontend:**
```typescript
import { message } from 'antd'

useEffect(() => {
  if (flash.success) message.success(flash.success)
  if (flash.error) message.error(flash.error)
  if (flash.warning) message.warning(flash.warning)
  if (flash.info) message.info(flash.info)
}, [flash])
```

### Error Handling

**Try/catch obligatoire:**
```typescript
try {
  await User.create(data)
  session.flash('success', 'Utilisateur créé')
} catch (error) {
  logger.error('User creation failed', { error })
  session.flash('error', 'Une erreur est survenue')
  return response.redirect().back()
}
```

---

## Conventions de Nommage

### Database (snake_case)
- Tables: `materials`, `storage_locations`, `routines`
- Colonnes: `user_id`, `created_at`, `storage_location_id`

### TypeScript (camelCase)
- Variables: `userId`, `materialName`
- Fonctions: `getMaterials()`, `createRoutine()`

### React Components (PascalCase)
- Fichiers: `MaterialCard.tsx`, `Layout.tsx`
- Composants: `<MaterialCard />`, `<Layout />`

### Routes (pluriel strict)
- ✅ `/materials`, `/routines`, `/shows`
- ❌ `/material`, `/routine`, `/show`

---

## Tests

### Pattern Vitest + Testing Library

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
})
```

### Co-localisation obligatoire
- `MaterialCard.tsx` → `MaterialCard.test.tsx` (même dossier)

---

## Logging

```typescript
import logger from '@adonisjs/core/services/logger'

logger.error('Description', { context })
logger.warn('Description', { context })
logger.info('Description', { context })
```

---

**Dernière mise à jour:** 2026-02-03
**Version projet:** Story 1-1 done, Story 1-2 ready-for-dev
