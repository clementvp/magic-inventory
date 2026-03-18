import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'material_category'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('material_id').unsigned().notNullable()
        .references('id').inTable('materials').onDelete('CASCADE')
      table.integer('category_id').unsigned().notNullable()
        .references('id').inTable('categories').onDelete('CASCADE')

      table.unique(['material_id', 'category_id'])
      table.index(['material_id'])
      table.index(['category_id'])

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
