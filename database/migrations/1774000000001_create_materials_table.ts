import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'materials'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.integer('type_id').unsigned().nullable()
        .references('id').inTable('types').onDelete('SET NULL')
      table.integer('storage_location_id').unsigned().nullable()
        .references('id').inTable('storage_locations').onDelete('SET NULL')
      table.string('author', 255).nullable()

      table.index(['user_id'])
      table.index(['name'])
      table.index(['type_id'])
      table.index(['author'])
      table.index(['storage_location_id'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
