import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import Routine from '#models/routine'
import Material from '#models/material'
import Show from '#models/show'
import Note from '#models/note'

export default class DashboardController {
  /**
   * Affiche le tableau de bord de l'utilisateur connecté
   */
  async index({ inertia, auth }: HttpContext) {
    const [categoryCounts, routineCounts, materialCounts, showCounts, noteCounts] = await Promise.all([
      Category.query().where('user_id', auth.user!.id).count('* as total'),
      Routine.query().where('user_id', auth.user!.id).count('* as total'),
      Material.query().where('user_id', auth.user!.id).count('* as total'),
      Show.query().where('user_id', auth.user!.id).count('* as total'),
      Note.query().where('user_id', auth.user!.id).count('* as total'),
    ])

    return inertia.render('Dashboard/Index', {
      counts: {
        categories: Number(categoryCounts[0]?.$extras.total ?? 0),
        routines: Number(routineCounts[0]?.$extras.total ?? 0),
        materials: Number(materialCounts[0]?.$extras.total ?? 0),
        shows: Number(showCounts[0]?.$extras.total ?? 0),
        notes: Number(noteCounts[0]?.$extras.total ?? 0),
      },
    })
  }
}
