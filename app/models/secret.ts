import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Secret extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orgId: string

  @column()
  declare keyvault: string

  @column()
  declare name: string

  @column()
  declare value: string | null

  @column()
  declare updatedOn: Date

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
