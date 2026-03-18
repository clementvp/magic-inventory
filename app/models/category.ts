import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Material from '#models/material'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Material, {
    pivotTable: 'material_category',
    localKey: 'id',
    pivotForeignKey: 'category_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'material_id',
  })
  declare materials: ManyToMany<typeof Material>
}
