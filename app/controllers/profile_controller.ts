import { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator, changePasswordValidator } from '#validators/profile_validator'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import Material from '#models/material'
import StorageLocation from '#models/storage_location'
import Category from '#models/category'
import Type from '#models/type'
import Routine from '#models/routine'
import Show from '#models/show'
import Note from '#models/note'

export default class ProfileController {
  /**
   * Afficher le formulaire de modification du profil
   */
  async edit({ inertia, auth }: HttpContext) {
    const user = auth.user!
    return inertia.render('profile/edit', { user })
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async update({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator, {
      meta: { userId: auth.user!.id },
    })

    try {
      const user = auth.user!
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

  /**
   * Changer le mot de passe utilisateur
   */
  async changePassword({ request, auth, response, session }: HttpContext) {
    const data = await request.validateUsing(changePasswordValidator)

    const user = auth.user!
    const isValid = await hash.verify(user.password, data.currentPassword)
    if (!isValid) {
      session.flash('errors', { currentPassword: 'Mot de passe actuel incorrect' })
      return response.redirect().back()
    }

    try {
      user.password = data.newPassword
      await user.save()

      session.flash('success', 'Mot de passe modifié avec succès')
      return response.redirect('/profile')
    } catch (error) {
      logger.error('Password change failed', { error, userId: user.id })
      session.flash('error', 'Une erreur est survenue lors du changement de mot de passe')
      return response.redirect().back()
    }
  }

  /**
   * Exporter les données utilisateur (RGPD - droit à la portabilité)
   */
  async export({ auth, response, session }: HttpContext) {
    try {
      const user = auth.user!
      const userId = user.id

      const [materials, storageLocations, categories, materialTypes, routines, shows, notes] =
        await Promise.all([
          Material.query().where('userId', userId).preload('categories').preload('routines'),
          StorageLocation.query().where('userId', userId),
          Category.query().where('userId', userId),
          Type.query().where('userId', userId),
          Routine.query().where('userId', userId).preload('categories').preload('materials'),
          Show.query().where('userId', userId).preload('routines'),
          Note.query().where('userId', userId),
        ])

      const now = new Date()
      const exportData = {
        exportedAt: now.toISOString(),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        materialTypes: materialTypes.map((t) => ({ id: t.id, name: t.name })),
        storageLocations: storageLocations.map((s) => ({ id: s.id, name: s.name })),
        materials: materials.map((m) => ({
          id: m.id,
          name: m.name,
          typeId: m.typeId,
          storageLocationId: m.storageLocationId,
          author: m.author,
          categoryIds: m.categories.map((c) => c.id),
          routineIds: m.routines.map((r) => r.id),
        })),
        routines: routines.map((r) => ({
          id: r.id,
          name: r.name,
          content: r.content,
          categoryIds: r.categories.map((c) => c.id),
          materialIds: r.materials.map((m) => m.id),
        })),
        shows: shows.map((s) => ({
          id: s.id,
          name: s.name,
          notes: s.notes,
          routines: s.routines.map((r) => ({
            routineId: r.id,
            order: r.$extras.pivot_order ?? 0,
          })),
        })),
        notes: notes.map((n) => ({ id: n.id, title: n.title, content: n.content })),
      }

      const json = JSON.stringify(exportData, null, 2)
      const date = now.toISOString().split('T')[0]
      const fileName = `magic-inventory-export-${user.id}-${date}.json`

      response.header('Content-Type', 'application/json; charset=utf-8')
      response.header('Content-Disposition', `attachment; filename="${fileName}"`)
      return response.send(json)
    } catch (error) {
      logger.error('Data export failed', { error, userId: auth.user?.id })
      session.flash('error', "Une erreur est survenue lors de l'export de vos données")
      return response.redirect().back()
    }
  }

  /**
   * Importer les données utilisateur (remplace les données existantes)
   */
  async import({ auth, request, response, session }: HttpContext) {
    try {
      const user = auth.user!
      const userId = user.id
      const data = request.input('data')

      if (!data || typeof data !== 'object') {
        session.flash('error', 'Fichier invalide ou format non reconnu')
        return response.redirect().back()
      }

      await db.transaction(async (trx) => {
        // 1. Supprimer toutes les données existantes (les pivots sont nettoyés par CASCADE)
        await Show.query({ client: trx }).where('userId', userId).delete()
        await Routine.query({ client: trx }).where('userId', userId).delete()
        await Material.query({ client: trx }).where('userId', userId).delete()
        await Note.query({ client: trx }).where('userId', userId).delete()
        await Category.query({ client: trx }).where('userId', userId).delete()
        await Type.query({ client: trx }).where('userId', userId).delete()
        await StorageLocation.query({ client: trx }).where('userId', userId).delete()

        // Tables de mapping ancien ID → nouvel ID
        const categoryMap = new Map<number, number>()
        const typeMap = new Map<number, number>()
        const locationMap = new Map<number, number>()
        const materialMap = new Map<number, number>()
        const routineMap = new Map<number, number>()

        // 2. Importer les catégories
        for (const cat of data.categories ?? []) {
          const newCat = await Category.create({ userId, name: cat.name }, { client: trx })
          categoryMap.set(cat.id, newCat.id)
        }

        // 3. Importer les types de matériel
        for (const t of data.materialTypes ?? []) {
          const newType = await Type.create({ userId, name: t.name }, { client: trx })
          typeMap.set(t.id, newType.id)
        }

        // 4. Importer les emplacements de rangement
        for (const loc of data.storageLocations ?? []) {
          const newLoc = await StorageLocation.create({ userId, name: loc.name }, { client: trx })
          locationMap.set(loc.id, newLoc.id)
        }

        // 5. Importer les matériels
        for (const mat of data.materials ?? []) {
          const newMat = await Material.create(
            {
              userId,
              name: mat.name,
              typeId: mat.typeId != null ? (typeMap.get(mat.typeId) ?? null) : null,
              storageLocationId:
                mat.storageLocationId != null
                  ? (locationMap.get(mat.storageLocationId) ?? null)
                  : null,
              author: mat.author ?? null,
            },
            { client: trx }
          )
          materialMap.set(mat.id, newMat.id)

          const catIds = (mat.categoryIds ?? [])
            .map((id: number) => categoryMap.get(id))
            .filter((id): id is number => id !== undefined)
          if (catIds.length > 0) {
            await newMat.related('categories').attach(catIds)
          }
        }

        // 6. Importer les routines
        for (const routine of data.routines ?? []) {
          const newRoutine = await Routine.create(
            { userId, name: routine.name, content: routine.content ?? null },
            { client: trx }
          )
          routineMap.set(routine.id, newRoutine.id)

          const catIds = (routine.categoryIds ?? [])
            .map((id: number) => categoryMap.get(id))
            .filter((id): id is number => id !== undefined)
          if (catIds.length > 0) {
            await newRoutine.related('categories').attach(catIds)
          }

          const matIds = (routine.materialIds ?? [])
            .map((id: number) => materialMap.get(id))
            .filter((id): id is number => id !== undefined)
          if (matIds.length > 0) {
            await newRoutine.related('materials').attach(matIds)
          }
        }

        // 7. Importer les spectacles
        for (const show of data.shows ?? []) {
          const newShow = await Show.create(
            { userId, name: show.name, notes: show.notes ?? null },
            { client: trx }
          )

          const syncData: Record<number, { order: number }> = {}
          for (const r of show.routines ?? []) {
            const newRoutineId = routineMap.get(r.routineId)
            if (newRoutineId !== undefined) {
              syncData[newRoutineId] = { order: r.order ?? 0 }
            }
          }
          if (Object.keys(syncData).length > 0) {
            await newShow.related('routines').sync(syncData)
          }
        }

        // 8. Importer les notes
        for (const note of data.notes ?? []) {
          await Note.create(
            { userId, title: note.title ?? null, content: note.content ?? null },
            { client: trx }
          )
        }
      })

      session.flash('success', 'Données importées avec succès')
      return response.redirect('/profile')
    } catch (error) {
      logger.error('Data import failed', { error, userId: auth.user?.id })
      session.flash('error', "Une erreur est survenue lors de l'import de vos données")
      return response.redirect().back()
    }
  }

  /**
   * Supprimer le compte utilisateur (RGPD - droit à l'effacement)
   */
  async destroy({ auth, response, session }: HttpContext) {
    try {
      const user = auth.user!
      await auth.use('web').logout()
      await user.delete()

      session.flash('info', 'Votre compte a été supprimé')
      return response.redirect('/login')
    } catch (error) {
      logger.error('Account deletion failed', { error, userId: auth.user?.id })
      session.flash('error', 'Une erreur est survenue lors de la suppression de votre compte')
      return response.redirect().back()
    }
  }
}
