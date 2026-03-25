import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Type from '#models/type'
import StorageLocation from '#models/storage_location'
import Category from '#models/category'
import Routine from '#models/routine'

export default class Material extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare typeId: number | null

  @column()
  declare storageLocationId: number | null

  @column()
  declare author: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Type, { foreignKey: 'typeId' })
  declare type: BelongsTo<typeof Type>

  @belongsTo(() => StorageLocation, { foreignKey: 'storageLocationId' })
  declare storageLocation: BelongsTo<typeof StorageLocation>

  @manyToMany(() => Category, {
    pivotTable: 'material_category',
    localKey: 'id',
    pivotForeignKey: 'material_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'category_id',
    pivotTimestamps: true,
  })
  declare categories: ManyToMany<typeof Category>

  @manyToMany(() => Routine, {
    pivotTable: 'material_routine',
    localKey: 'id',
    pivotForeignKey: 'material_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'routine_id',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare routines: ManyToMany<typeof Routine>
}
