import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import crypto from 'node:crypto'

export default class Org extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ serializeAs: null })
  declare secret: string

  @column()
  declare name: string

  @column()
  declare azureOrgUrl: string

  @column()
  declare azurePersonalAccessToken: string

  @column()
  declare azureWorkspaceId: string

  @column()
  declare sonarToken: string

  @column()
  declare sonarOrg: string

  @column()
  declare copilotToken: string

  @column()
  declare invitations: any | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateId(org: Org) {
    org.id = org.id ? org.id : crypto.randomUUID()
  }
}
