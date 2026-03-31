import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'show_events'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.text('notes').nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('notes')
    })
  }
}
