import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'copilot_days'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('org_id').notNullable().references('id').inTable('orgs').onDelete('CASCADE')
      table.date('date').notNullable().unique()
      table.unique(['date', 'org_id'])
      table.integer('total_active_users').defaultTo(0)
      table.integer('total_engaged_users').defaultTo(0)
      table.json('copilot_ide_chat').nullable()
      table.json('copilot_dotcom_chat').nullable()
      table.json('copilot_dotcom_pull_requests').nullable()
      table.json('copilot_ide_code_completions').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
