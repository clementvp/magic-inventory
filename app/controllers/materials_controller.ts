import Material from '#models/material'
import Type from '#models/type'
import Category from '#models/category'
import StorageLocation from '#models/storage_location'
import { createMaterialValidator } from '#validators/materials/create_material_validator'
import { updateMaterialValidator } from '#validators/materials/update_material_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class MaterialsController {
  async index({ auth, inertia }: HttpContext) {
    const materials = await Material.query()
      .where('user_id', auth.user!.id)
      .preload('type')
      .preload('categories')
      .preload('storageLocation')
      .orderBy('created_at', 'desc')

    return inertia.render('Materials/Index', {
      materials: materials.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type ? { id: m.type.id, name: m.type.name } : null,
        categories: m.categories.map((c) => ({ id: c.id, name: c.name })),
        storageLocation: m.storageLocation
          ? { id: m.storageLocation.id, name: m.storageLocation.name }
          : null,
        author: m.author,
        createdAt: m.createdAt.toISO()!,
      })),
    })
  }

  async show({ params, auth, inertia }: HttpContext) {
    const material = await Material.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('type')
      .preload('categories')
      .preload('storageLocation')
      .firstOrFail()

    return inertia.render('Materials/Show', {
      material: {
        id: material.id,
        name: material.name,
        type: material.type ? { id: material.type.id, name: material.type.name } : null,
        categories: material.categories.map((c) => ({ id: c.id, name: c.name })),
        storageLocation: material.storageLocation
          ? { id: material.storageLocation.id, name: material.storageLocation.name }
          : null,
        author: material.author,
        createdAt: material.createdAt.toISO()!,
      },
    })
  }

  async create({ auth, inertia }: HttpContext) {
    const [types, categories, storageLocations] = await Promise.all([
      Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
      Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
      StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    ])

    return inertia.render('Materials/Create', {
      types: types.map((t) => ({ id: t.id, name: t.name })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      storageLocations: storageLocations.map((l) => ({ id: l.id, name: l.name })),
    })
  }

  async edit({ params, auth, inertia }: HttpContext) {
    const material = await Material.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('categories')
      .firstOrFail()

    const [types, categories, storageLocations] = await Promise.all([
      Type.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
      Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
      StorageLocation.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    ])

    return inertia.render('Materials/Edit', {
      material: {
        id: material.id,
        name: material.name,
        typeId: material.typeId,
        categoryIds: material.categories.map((c) => c.id),
        storageLocationId: material.storageLocationId,
        author: material.author,
      },
      types: types.map((t) => ({ id: t.id, name: t.name })),
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      storageLocations: storageLocations.map((l) => ({ id: l.id, name: l.name })),
    })
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const material = await Material.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('categories')
      .firstOrFail()

    const data = await request.validateUsing(updateMaterialValidator)

    try {
      if (data.typeId) {
        const ownedType = await Type.query()
          .where('id', data.typeId)
          .where('user_id', auth.user!.id)
          .first()
        if (!ownedType) {
          session.flash('error', 'Type invalide')
          return response.redirect().back()
        }
      }

      if (data.storageLocationId) {
        const ownedLocation = await StorageLocation.query()
          .where('id', data.storageLocationId)
          .where('user_id', auth.user!.id)
          .first()
        if (!ownedLocation) {
          session.flash('error', 'Lieu de stockage invalide')
          return response.redirect().back()
        }
      }

      if (data.categoryIds && data.categoryIds.length > 0) {
        const ownedCategories = await Category.query()
          .whereIn('id', data.categoryIds)
          .where('user_id', auth.user!.id)
        if (ownedCategories.length !== data.categoryIds.length) {
          session.flash('error', 'Catégorie(s) invalide(s)')
          return response.redirect().back()
        }
      }

      material.name = data.name
      material.typeId = data.typeId ?? null
      material.storageLocationId = data.storageLocationId ?? null
      material.author = data.author ?? null
      await material.save()

      await material.related('categories').sync(data.categoryIds ?? [])

      session.flash('success', 'Matériel modifié avec succès')
      return response.redirect().toRoute('materials.show', { id: material.id })
    } catch (error) {
      logger.error('Material update failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la modification du matériel')
      return response.redirect().back()
    }
  }

  async store({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(createMaterialValidator)

    try {
      if (data.typeId) {
        const ownedType = await Type.query()
          .where('id', data.typeId)
          .where('user_id', auth.user!.id)
          .first()
        if (!ownedType) {
          session.flash('error', 'Type invalide')
          return response.redirect().back()
        }
      }

      if (data.storageLocationId) {
        const ownedLocation = await StorageLocation.query()
          .where('id', data.storageLocationId)
          .where('user_id', auth.user!.id)
          .first()
        if (!ownedLocation) {
          session.flash('error', 'Lieu de stockage invalide')
          return response.redirect().back()
        }
      }

      if (data.categoryIds && data.categoryIds.length > 0) {
        const ownedCategories = await Category.query()
          .whereIn('id', data.categoryIds)
          .where('user_id', auth.user!.id)
        if (ownedCategories.length !== data.categoryIds.length) {
          session.flash('error', 'Catégorie(s) invalide(s)')
          return response.redirect().back()
        }
      }

      const material = await Material.create({
        userId: auth.user!.id,
        name: data.name,
        typeId: data.typeId ?? null,
        storageLocationId: data.storageLocationId ?? null,
        author: data.author ?? null,
      })

      if (data.categoryIds !== undefined) {
        await material.related('categories').sync(data.categoryIds)
      }

      session.flash('success', 'Matériel ajouté avec succès')
      return response.redirect().toRoute('materials.index')
    } catch (error) {
      logger.error('Material creation failed', { error, userId: auth.user?.id })
      session.flash('error', "Une erreur est survenue lors de l'ajout du matériel")
      return response.redirect().back()
    }
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    try {
      const material = await Material.query()
        .where('user_id', auth.user!.id)
        .where('id', params.id)
        .firstOrFail()

      // TODO Epic 4: Vérifier material_routine
      // const routineCount = await material.related('routines').query().count('* as total')
      // if (routineCount[0].$extras.total > 0) {
      //   session.flash('error', 'Ce matériel est utilisé dans des routines et ne peut pas être supprimé. Retirez-le des routines d\'abord.')
      //   return response.redirect().back()
      // }

      await material.delete()
      // Note: material_category CASCADE DELETE via ON DELETE CASCADE (migration 1774000000002)
      session.flash('success', 'Matériel supprimé avec succès')
      return response.redirect().toRoute('materials.index')
    } catch (error) {
      if (error.status === 404) {
        // Matériel inexistant ou n'appartenant pas à l'utilisateur → redirect silencieux
        return response.redirect().toRoute('materials.index')
      }
      logger.error('Material deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression du matériel')
      return response.redirect().toRoute('materials.index')
    }
  }
}
