import StorageLocation from '#models/storage_location'
import { createStorageLocationValidator } from '#validators/storage_locations/create_storage_location_validator'
import { updateStorageLocationValidator } from '#validators/storage_locations/update_storage_location_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

interface MaterialItem {
  id: number
  name: string
  type?: string
  categories?: string[]
  author?: string
}

export default class StorageLocationsController {
  async index({ auth, inertia }: HttpContext) {
    const storageLocations = await StorageLocation.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    const locationsWithCount = storageLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      createdAt: loc.createdAt,
      materialsCount: 0,
    }))

    return inertia.render('StorageLocations/Index', { storageLocations: locationsWithCount })
  }

  async show({ params, auth, inertia }: HttpContext) {
    const location = await StorageLocation.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id) // Isolation multi-tenant CRITIQUE
      .firstOrFail() // 404 automatique si non trouvé ou accès non autorisé

    // ⚠️ materials = [] en Epic 2 (table materials pas encore créée)
    // En Epic 3, remplacer par : await location.related('materials').query().preload('type').preload('categories')
    const materials: MaterialItem[] = []

    return inertia.render('StorageLocations/Show', {
      location: {
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
      },
      materials,
    })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(createStorageLocationValidator)

    try {
      await StorageLocation.create({
        userId: auth.user!.id,
        name: data.name,
      })
      session.flash('success', 'Lieu de stockage créé avec succès')
      return response.redirect().toRoute('storage-locations.index')
    } catch (error) {
      logger.error('StorageLocation creation failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la création du lieu')
      return response.redirect().back()
    }
  }

  async update({ request, auth, response, session, params }: HttpContext) {
    const data = await request.validateUsing(updateStorageLocationValidator)

    try {
      const location = await StorageLocation.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      location.name = data.name
      await location.save()

      session.flash('success', 'Lieu modifié avec succès')
      return response.redirect().back()
    } catch (error) {
      logger.error('StorageLocation update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification du lieu')
      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session, params }: HttpContext) {
    try {
      const location = await StorageLocation.query()
        .where('id', params.id)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      await location.delete()
      session.flash('success', 'Lieu supprimé avec succès')
    } catch (error) {
      logger.error('StorageLocation deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression du lieu')
    }
    return response.redirect().toRoute('storage-locations.index')
  }
}
