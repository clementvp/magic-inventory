/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')

// Page d'accueil
router.on('/').renderInertia('home')

// Routes d'authentification (accessible uniquement aux invités)
router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])
    router.get('/login', [AuthController, 'showLogin'])
    router.post('/login', [AuthController, 'login'])
  })
  .use(middleware.guest())

// Déconnexion (accessible uniquement aux utilisateurs connectés)
router
  .post('/logout', [AuthController, 'logout'])
  .use(middleware.auth())

