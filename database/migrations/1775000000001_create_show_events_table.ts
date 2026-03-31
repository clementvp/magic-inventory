import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'show_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('show_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('shows')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.string('start_time').nullable()
      table.string('venue').nullable()
      table.string('contact').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
