# Story 1.7: Déconnexion

Status: ready-for-dev

## Story

As a **utilisateur connecté**,
I want **un bouton de déconnexion accessible depuis n'importe quelle page**,
so that **je peux mettre fin à ma session de manière sécurisée**.

## Acceptance Criteria

**Scenario 1: Présence du bouton de déconnexion**
- **Given** je suis connecté et sur n'importe quelle page de l'application
- **When** je regarde la barre latérale (Sider)
- **Then** un bouton ou lien "Se déconnecter" est visible en bas du menu

**Scenario 2: Déconnexion réussie**
- **Given** je clique sur "Se déconnecter"
- **When** la requête `POST /logout` est envoyée
- **Then** ma session est détruite côté serveur
- **And** je suis redirigé vers `/login`
- **And** un flash message "Déconnexion réussie. À bientôt !" s'affiche

**Scenario 3: Accès impossible après déconnexion**
- **Given** je viens de me déconnecter
- **When** je tente d'accéder à `/dashboard` ou toute route protégée
- **Then** je suis redirigé vers `/login` (middleware auth)

## Tasks / Subtasks

### Frontend — Layout.tsx (AC: 1, 2)

- [ ] Ajouter un bouton "Se déconnecter" dans le Sider du `Layout` (AC: 1, 2)
  - [ ] Modifier `inertia/components/Layout.tsx`
  - [ ] Ajouter un `<form method="POST" action="/logout">` avec un `<button type="submit">` en bas du Sider
  - [ ] Icône `LogoutOutlined` de `@ant-design/icons`
  - [ ] Style cohérent avec le menu (fond sombre, texte blanc)
  - [ ] Positionné en bas du Sider (après le Menu, avant ou après le trigger de collapse)

### Tests (AC: 1, 2)

- [ ] Mettre à jour `inertia/components/Layout.test.tsx`
  - [ ] Test : bouton "Se déconnecter" est présent dans le rendu
  - [ ] Test : le form a bien `method="POST"` et `action="/logout"`

### Validation Finale (AC: Tous)

- [ ] Vérifier flow complet :
  - [ ] Se connecter → accéder à n'importe quelle page
  - [ ] Voir le bouton "Se déconnecter" dans la sidebar
  - [ ] Cliquer → redirigé vers `/login`
  - [ ] Flash message "Déconnexion réussie. À bientôt !" visible
  - [ ] Tenter d'aller sur `/dashboard` → redirigé vers `/login`
- [ ] Lancer les tests : `npm run test:front` — tous passent, 0 régression

## Dev Notes

### 🔥 Backend déjà implémenté — NE PAS modifier

Le backend est **complet et fonctionnel** :

```typescript
// app/controllers/auth_controller.ts — DÉJÀ IMPLÉMENTÉ, NE PAS TOUCHER
async logout({ auth, response, session }: HttpContext) {
  await auth.use('web').logout()
  session.flash('info', 'Déconnexion réussie. À bientôt !')
  return response.redirect('/login')
}
```

```typescript
// start/routes.ts — DÉJÀ PRÉSENT, NE PAS TOUCHER
router.post('/logout', [AuthController, 'logout'])
```

**Cette story est 100% frontend.** Ne pas toucher au backend.

---

### ⚠️ CRITIQUE : Utiliser un `<form>` natif, PAS `router.post()` d'Inertia

Inertia.js gère la navigation SPA. Pour une déconnexion, on veut un rechargement complet (pour vider l'état React/Inertia). La méthode correcte est un formulaire HTML natif :

```tsx
// ✅ CORRECT — form natif, rechargement complet, session détruite proprement
<form method="POST" action="/logout">
  <button type="submit" style={{ ... }}>
    <LogoutOutlined /> Se déconnecter
  </button>
</form>

// ❌ INCORRECT — Inertia intercepte, fait une XHR, état client pas totalement vidé
router.post('/logout')
```

---

### Placement dans le Sider

Le bouton doit être en bas du Sider, après le `<Menu>`. Le Sider d'Ant Design accepte n'importe quel children après le Menu. Utiliser `flexDirection: 'column'` et `justifyContent: 'space-between'` pour pousser le bouton en bas :

```tsx
// inertia/components/Layout.tsx — structure cible
<Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}
  style={{ display: 'flex', flexDirection: 'column' }}
>
  {/* Logo */}
  <div style={{ height: 32, margin: 16, color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
    {collapsed ? 'MI' : 'magic-inventory'}
  </div>

  {/* Menu navigation */}
  <Menu theme="dark" mode="inline" selectedKeys={[getSelectedKey()]} items={menuItems} />

  {/* Bouton déconnexion — en bas */}
  <div style={{ marginTop: 'auto', padding: '16px 8px' }}>
    <form method="POST" action="/logout">
      <button
        type="submit"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.65)',
          cursor: 'pointer',
          padding: '8px 16px',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
        }}
      >
        <LogoutOutlined />
        {!collapsed && <span>Se déconnecter</span>}
      </button>
    </form>
  </div>
</Sider>
```

**Comportement collapsed :** Quand la sidebar est réduite (`collapsed=true`), masquer le texte "Se déconnecter" et n'afficher que l'icône `LogoutOutlined`.

---

### Import à ajouter

```tsx
// Ajouter LogoutOutlined aux imports existants de @ant-design/icons
import {
  AppstoreOutlined,
  CalendarOutlined,
  StarOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  LogoutOutlined,  // ← AJOUTER
} from '@ant-design/icons'
```

---

### Pattern de test pour le form de déconnexion

```typescript
// inertia/components/Layout.test.tsx
it('affiche le bouton de déconnexion', () => {
  render(<Layout>contenu</Layout>)
  const logoutBtn = screen.getByRole('button', { name: /se déconnecter/i })
  expect(logoutBtn).toBeInTheDocument()
})

it('le formulaire de déconnexion pointe vers POST /logout', () => {
  render(<Layout>contenu</Layout>)
  const form = screen.getByRole('button', { name: /se déconnecter/i }).closest('form')
  expect(form).toHaveAttribute('action', '/logout')
  expect(form).toHaveAttribute('method', 'POST')
})
```

---

### Fichiers à toucher

**Fichiers à MODIFIER :**
- `inertia/components/Layout.tsx` — Ajouter `LogoutOutlined` import + bouton déconnexion dans Sider
- `inertia/components/Layout.test.tsx` — Ajouter 2 tests

**Fichiers à NE PAS TOUCHER :**
- `app/controllers/auth_controller.ts` — logout() déjà implémenté ✅
- `start/routes.ts` — POST /logout déjà présent ✅
- Tout autre fichier

---

### Learnings des Stories Précédentes

- ✅ `import type { ReactNode }` (PAS `React.ReactNode`)
- ✅ Mock `~/components/Layout` dans les tests des pages (déjà fait, pas de changement)
- ✅ Les tests du Layout mockent `usePage` et `@inertiajs/react`
- ✅ Vérifier les tests existants du Layout avant d'ajouter — ne pas casser

### Project Structure Notes

- Layout dans `inertia/components/Layout.tsx` (existant — à modifier)
- Tests co-localisés `inertia/components/Layout.test.tsx` (existant — à compléter)
- Aucune migration, aucun validator, aucun model à toucher

### References

- `app/controllers/auth_controller.ts:80` — méthode `logout()` existante
- `start/routes.ts:42` — route `POST /logout` existante
- `inertia/components/Layout.tsx` — Sider à modifier
- `project-context.md#Inertia.js React` — comportement XHR vs navigation native

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (claude-sonnet-4-6)

### Debug Log References

### Completion Notes List

### File List
