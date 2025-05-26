import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orgs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('secret', 64).notNullable().unique()
      table.string('name', 100).notNullable()
      table.string('azure_org_url').notNullable()
      table.string('azure_personal_access_token').notNullable()
      table.string('azure_workspace_id').notNullable()
      table.string('sonar_token').notNullable()
      table.string('sonar_org').notNullable()
      table.json('invitations').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
