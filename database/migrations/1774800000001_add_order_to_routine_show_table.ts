import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'routine_show'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('order').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('order')
    })
  }
}
