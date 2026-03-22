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
const ProfileController = () => import('#controllers/profile_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const TypesController = () => import('#controllers/types_controller')
const StorageLocationsController = () => import('#controllers/storage_locations_controller')
const MaterialsController = () => import('#controllers/materials_controller')
const RoutinesController = () => import('#controllers/routines_controller')

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
    router.get('/profile', [ProfileController, 'edit']).as('profile.edit')
    router.get('/profile/export', [ProfileController, 'export']).as('profile.export')
    router.post('/profile', [ProfileController, 'update']).as('profile.update')
    router.delete('/profile', [ProfileController, 'destroy']).as('profile.destroy')
    router.resource('categories', CategoriesController).only(['index', 'store', 'update', 'destroy'])
    router.resource('types', TypesController).only(['index', 'store', 'update', 'destroy'])
    router.resource('storage-locations', StorageLocationsController).only(['index', 'show', 'store', 'update', 'destroy'])
    router.resource('materials', MaterialsController).only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'])
    router.resource('routines', RoutinesController).only(['create', 'store', 'edit', 'update'])
    router.post('/routines/:id/materials', [RoutinesController, 'attachMaterial'])
    router.delete('/routines/:id/materials/:materialId', [RoutinesController, 'detachMaterial'])
  })
  .use(middleware.auth())

