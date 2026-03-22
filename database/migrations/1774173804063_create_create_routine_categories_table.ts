import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_category'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('routine_id').unsigned().notNullable()
        .references('id').inTable('routines').onDelete('CASCADE')
      table.integer('category_id').unsigned().notNullable()
        .references('id').inTable('categories').onDelete('CASCADE')

      table.unique(['routine_id', 'category_id'])
      table.index(['routine_id'])
      table.index(['category_id'])

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
