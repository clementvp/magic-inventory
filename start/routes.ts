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
const HomeController = () => import('#controllers/home_controller')
const DashboardController = () => import('#controllers/dashboard_controller')

// Page d'accueil publique avec redirection intelligente
router.get('/', [HomeController, 'index']).as('home')

// Routes d'authentification (accessible uniquement aux invités)
router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister'])
    router.post('/register', [AuthController, 'register'])
    router.get('/login', [AuthController, 'showLogin'])
    router.post('/login', [AuthController, 'login'])
  })
  .use(middleware.guest())

// Routes protégées (accessible uniquement aux utilisateurs connectés)
router
  .group(() => {
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')
    router.post('/logout', [AuthController, 'logout'])
  })
  .use(middleware.auth())

