import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Routine from '#models/routine'

export default class Show extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Routine, {
    pivotTable: 'routine_show',
    localKey: 'id',
    pivotForeignKey: 'show_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'routine_id',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
    pivotColumns: ['order'],
  })
  declare routines: ManyToMany<typeof Routine>
}
