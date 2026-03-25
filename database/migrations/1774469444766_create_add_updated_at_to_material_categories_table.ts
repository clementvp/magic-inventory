import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'material_category'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at').nullable().alter()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('created_at').notNullable().alter()
      table.dropColumn('updated_at')
    })
  }
}
