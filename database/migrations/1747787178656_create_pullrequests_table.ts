import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pullrequests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id')
      table.uuid('repository_id').notNullable()
      table.string('repository_name', 200).notNullable()
      table.uuid('project_id').notNullable()
      table.string('project_name', 200).notNullable()
      table.uuid('creator_id').notNullable()
      table.string('creator_name', 200).notNullable()
      table.integer('status').notNullable()
      table.dateTime('creation_date').notNullable()
      table.dateTime('closed_date').nullable()
      table.string('title', 500).notNullable()
      table.string('description', 500).nullable()
      table.string('source_ref_name', 200).notNullable()
      table.string('target_ref_name', 200).notNullable()
      table.integer('merge_status').notNullable()
      table.dateTime('completion_queue_time').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
/*
CREATE TABLE reports_pullrequests (
  id INT PRIMARY KEY,
  repositoryId UNIQUEIDENTIFIER NOT NULL,
  repositoryName NVARCHAR(200) NOT NULL,
  projectId UNIQUEIDENTIFIER NOT NULL,
  projectName NVARCHAR(200) NOT NULL,
  creatorId UNIQUEIDENTIFIER NOT NULL,
  creatorName NVARCHAR(200) NOT NULL,
  status INT NOT NULL,
  creationDate DATETIME2 NOT NULL,
  closedDate DATETIME2 NULL,
  title NVARCHAR(500) NOT NULL,
  description NVARCHAR(MAX) NULL,
  sourceRefName NVARCHAR(200) NOT NULL,
  targetRefName NVARCHAR(200) NOT NULL,
  mergeStatus INT NOT NULL,
  completionQueueTime DATETIME2 NULL
);
*/
