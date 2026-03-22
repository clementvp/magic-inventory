import Routine from '#models/routine'
import Category from '#models/category'
import Material from '#models/material'
import { createRoutineValidator } from '#validators/routines/create_routine_validator'
import { updateRoutineValidator } from '#validators/routines/update_routine_validator'
import { attachMaterialValidator } from '#validators/routines/attach_material_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoutinesController {
  async index({ auth, inertia }: HttpContext) {
    const routines = await Routine.query()
      .where('user_id', auth.user!.id)
      .preload('categories')
      .orderBy('created_at', 'desc')

    return inertia.render('Routines/Index', {
      routines: routines.map((r) => ({
        id: r.id,
        name: r.name,
        categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
        createdAt: r.createdAt.toISO() ?? '',
      })),
    })
  }

  async create({ auth, inertia }: HttpContext) {
    const categories = await Category.query()
      .where('user_id', auth.user!.id)
      .orderBy('name', 'asc')

    return inertia.render('Routines/Create', {
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
    })
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createRoutineValidator)

    try {
      const routine = await Routine.create({
        userId: auth.user!.id,
        name: data.name,
        content: null,
      })

      if (data.categoryIds && data.categoryIds.length > 0) {
        await routine.related('categories').attach(data.categoryIds)
      }

      session.flash('success', 'Routine créée avec succès')
      return response.redirect().toPath(`/routines/${routine.id}/edit`)
    } catch (error) {
      logger.error('Failed to create routine', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création de la routine')
      return response.redirect().back()
    }
  }

  async edit({ params, auth, inertia }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('categories')
      .preload('materials', (q) => {
        q.preload('type').preload('storageLocation')
      })
      .firstOrFail()

    const [categories, allMaterials] = await Promise.all([
      Category.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
      Material.query().where('user_id', auth.user!.id).orderBy('name', 'asc'),
    ])

    return inertia.render('Routines/Edit', {
      routine: {
        id: routine.id,
        name: routine.name,
        content: routine.content,
        categoryIds: routine.categories.map((c) => c.id),
        materials: routine.materials.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type ? { id: m.type.id, name: m.type.name } : null,
          storageLocation: m.storageLocation
            ? { id: m.storageLocation.id, name: m.storageLocation.name }
            : null,
        })),
      },
      categories: categories.map((c) => ({ id: c.id, name: c.name })),
      allMaterials: allMaterials.map((m) => ({ id: m.id, name: m.name })),
    })
  }

  async update({ params, request, auth, session, response }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateRoutineValidator)

    try {
      if (data.categoryIds && data.categoryIds.length > 0) {
        const ownedCategories = await Category.query()
          .whereIn('id', data.categoryIds)
          .where('user_id', auth.user!.id)
        if (ownedCategories.length !== data.categoryIds.length) {
          session.flash('error', 'Catégorie(s) invalide(s)')
          return response.redirect().back()
        }
      }

      routine.name = data.name
      routine.content = data.content || null
      await routine.save()

      await routine.related('categories').sync(data.categoryIds ?? [])

      session.flash('success', 'Routine enregistrée avec succès')
      return response.redirect().toPath(`/routines/${routine.id}`)
    } catch (error) {
      logger.error('Failed to update routine', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }

  async attachMaterial({ params, request, auth, session, response }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(attachMaterialValidator)

    // Dédupliquer pour éviter un faux échec de l'ownership check si le client envoie des doublons
    const uniqueMaterialIds = [...new Set(data.materialIds)]

    // Vérification ownership IDOR
    const ownedMaterials = await Material.query()
      .whereIn('id', uniqueMaterialIds)
      .where('user_id', auth.user!.id)
    if (ownedMaterials.length !== uniqueMaterialIds.length) {
      session.flash('error', 'Matériel invalide')
      return response.redirect().back()
    }

    try {
      // sync avec false = attach sans détacher les existants
      await routine.related('materials').sync(uniqueMaterialIds, false)
      session.flash('success', 'Matériel ajouté à la routine')
      return response.redirect().toPath(`/routines/${routine.id}/edit`)
    } catch (error) {
      logger.error('Failed to attach material to routine', { error })
      session.flash('error', "Une erreur est survenue lors de l'ajout du matériel")
      return response.redirect().back()
    }
  }

  async detachMaterial({ params, auth, session, response }: HttpContext) {
    const routine = await Routine.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    // Vérifier que le matériel appartient à l'utilisateur
    await Material.query()
      .where('id', params.materialId)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    try {
      await routine.related('materials').detach([Number(params.materialId)])
      session.flash('success', 'Matériel retiré de la routine')
      return response.redirect().toPath(`/routines/${routine.id}/edit`)
    } catch (error) {
      logger.error('Failed to detach material from routine', { error })
      session.flash('error', 'Une erreur est survenue lors du retrait du matériel')
      return response.redirect().back()
    }
  }
}
