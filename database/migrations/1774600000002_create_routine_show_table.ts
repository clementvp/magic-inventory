import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_show'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('routine_id').unsigned().notNullable()
        .references('id').inTable('routines').onDelete('CASCADE')
      table.integer('show_id').unsigned().notNullable()
        .references('id').inTable('shows').onDelete('CASCADE')

      table.unique(['routine_id', 'show_id'])
      table.index(['routine_id'])
      table.index(['show_id'])

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
