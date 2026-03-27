import Show from '#models/show'
import Routine from '#models/routine'
import { createShowValidator } from '#validators/shows/create_show_validator'
import { updateShowValidator } from '#validators/shows/update_show_validator'
import { attachRoutineValidator } from '#validators/shows/attach_routine_validator'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'

export default class ShowsController {
  async index({ auth, inertia }: HttpContext) {
    const shows = await Show.query()
      .where('user_id', auth.user!.id)
      .withCount('routines')
      .orderBy('created_at', 'desc')
      .limit(200)

    return inertia.render('Shows/Index', {
      shows: shows.map((s) => ({
        id: s.id,
        name: s.name,
        routinesCount: Number(s.$extras.routines_count ?? 0),
        createdAt: s.createdAt.toISO() ?? '',
      })),
    })
  }

  async show({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) => q.preload('categories').orderBy('routine_show.order', 'asc'))
      .firstOrFail()

    return inertia.render('Shows/Show', {
      show: {
        id: show.id,
        name: show.name,
        notes: show.notes,
        createdAt: show.createdAt.toISO() ?? '',
        routines: show.routines.map((r, index) => ({
          id: r.id,
          name: r.name,
          order: r.$extras.pivot_order ?? index,
          categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
        })),
      },
    })
  }

  async create({ auth, inertia }: HttpContext) {
    const allRoutines = await Routine.query()
      .where('user_id', auth.user!.id)
      .preload('categories')
      .orderBy('name', 'asc')

    return inertia.render('Shows/Create', {
      allRoutines: allRoutines.map((r) => ({
        id: r.id,
        name: r.name,
        categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
      })),
    })
  }

  async store({ auth, request, session, response }: HttpContext) {
    const data = await request.validateUsing(createShowValidator)

    try {
      const show = await Show.create({
        userId: auth.user!.id,
        name: data.name,
        notes: data.notes || null,
      })

      if (data.routineIds && data.routineIds.length > 0) {
        const uniqueRoutineIds = [...new Set(data.routineIds)]
        const ownedRoutines = await Routine.query()
          .whereIn('id', uniqueRoutineIds)
          .where('user_id', auth.user!.id)

        if (ownedRoutines.length === uniqueRoutineIds.length) {
          const syncData: Record<number, { order: number }> = {}
          uniqueRoutineIds.forEach((id, index) => {
            syncData[id] = { order: index }
          })
          await show.related('routines').sync(syncData)
        }
      }

      session.flash('success', 'Spectacle créé avec succès')
      return response.redirect().toPath(`/shows/${show.id}`)
    } catch (error) {
      logger.error('Failed to create show', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la création du spectacle')
      return response.redirect().back()
    }
  }

  async edit({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) => q.preload('categories').orderBy('routine_show.order', 'asc'))
      .firstOrFail()

    const allRoutines = await Routine.query()
      .where('user_id', auth.user!.id)
      .preload('categories')
      .orderBy('name', 'asc')

    return inertia.render('Shows/Edit', {
      show: {
        id: show.id,
        name: show.name,
        notes: show.notes,
        routineIds: show.routines.map((r) => r.id),
        routines: show.routines.map((r) => ({
          id: r.id,
          name: r.name,
          categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
        })),
      },
      allRoutines: allRoutines.map((r) => ({
        id: r.id,
        name: r.name,
        categories: r.categories.map((c) => ({ id: c.id, name: c.name })),
      })),
    })
  }

  async update({ params, request, auth, session, response }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(updateShowValidator)

    try {
      show.name = data.name
      show.notes = data.notes || null
      await show.save()

      const routineIds = data.routineIds ?? []
      if (routineIds.length > 0) {
        const uniqueRoutineIds = [...new Set(routineIds)]
        const ownedRoutines = await Routine.query()
          .whereIn('id', uniqueRoutineIds)
          .where('user_id', auth.user!.id)

        if (ownedRoutines.length === uniqueRoutineIds.length) {
          const syncData: Record<number, { order: number }> = {}
          uniqueRoutineIds.forEach((id, index) => {
            syncData[id] = { order: index }
          })
          await show.related('routines').sync(syncData)
        }
      } else {
        await show.related('routines').sync([])
      }

      session.flash('success', 'Spectacle modifié avec succès')
      return response.redirect().toPath(`/shows/${show.id}`)
    } catch (error) {
      logger.error('Failed to update show', { error, data })
      session.flash('error', 'Une erreur est survenue lors de la sauvegarde')
      return response.redirect().back()
    }
  }

  async checklist({ params, auth, inertia }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .preload('routines', (q) =>
        q
          .preload('materials', (mq) => mq.preload('type').preload('storageLocation'))
          .orderBy('routine_show.order', 'asc')
      )
      .firstOrFail()

    const materialsMap = new Map<
      number,
      {
        id: number
        name: string
        type: { id: number; name: string } | null
        storageLocation: { id: number; name: string } | null
      }
    >()

    for (const routine of show.routines) {
      for (const material of routine.materials) {
        if (!materialsMap.has(material.id)) {
          materialsMap.set(material.id, {
            id: material.id,
            name: material.name,
            type: material.type ? { id: material.type.id, name: material.type.name } : null,
            storageLocation: material.storageLocation
              ? { id: material.storageLocation.id, name: material.storageLocation.name }
              : null,
          })
        }
      }
    }

    return inertia.render('Shows/Checklist', {
      show: { id: show.id, name: show.name },
      materials: [...materialsMap.values()],
      hasRoutines: show.routines.length > 0,
    })
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    try {
      const show = await Show.query()
        .where('user_id', auth.user!.id)
        .where('id', params.id)
        .firstOrFail()

      await show.delete()

      session.flash('success', 'Spectacle supprimé avec succès')
      return response.redirect().toRoute('shows.index')
    } catch (error) {
      if (error.status === 404) {
        return response.redirect().toRoute('shows.index')
      }
      logger.error('Show deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression du spectacle')
      return response.redirect().toRoute('shows.index')
    }
  }

  async attachRoutine({ params, request, auth, session, response }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    const data = await request.validateUsing(attachRoutineValidator)

    const uniqueRoutineIds = [...new Set(data.routineIds)]

    // Vérification ownership IDOR
    const ownedRoutines = await Routine.query()
      .whereIn('id', uniqueRoutineIds)
      .where('user_id', auth.user!.id)
    if (ownedRoutines.length !== uniqueRoutineIds.length) {
      session.flash('error', 'Routine invalide')
      return response.redirect().back()
    }

    try {
      await show.related('routines').sync(uniqueRoutineIds, false)
      session.flash('success', 'Routines ajoutées au spectacle')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to attach routine to show', { error })
      session.flash('error', "Une erreur est survenue lors de l'ajout des routines")
      return response.redirect().back()
    }
  }

  async detachRoutine({ params, auth, session, response }: HttpContext) {
    const show = await Show.query()
      .where('user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()

    // Vérifier que la routine appartient à l'utilisateur et est bien liée à ce spectacle
    await Routine.query()
      .where('id', params.routineId)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    const linked = await show.related('routines').query().where('id', params.routineId).first()
    if (!linked) {
      session.flash('error', "Cette routine n'est pas liée à ce spectacle")
      return response.redirect().back()
    }

    try {
      await show.related('routines').detach([parseInt(params.routineId, 10)])
      session.flash('success', 'Routine retirée du spectacle')
      return response.redirect().toPath(`/shows/${show.id}/edit`)
    } catch (error) {
      logger.error('Failed to detach routine from show', { error })
      session.flash('error', 'Une erreur est survenue lors du retrait de la routine')
      return response.redirect().back()
    }
  }
}
