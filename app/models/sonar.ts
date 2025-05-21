import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Sonar extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare rule: string

  @column()
  declare severity: string

  @column()
  declare component: string

  @column()
  declare project: string

  @column()
  declare line: number | null

  @column()
  declare hash: string

  @column()
  declare textRange: any | null

  @column()
  declare flows: any | null

  @column()
  declare resolution: string | null

  @column()
  declare status: string

  @column()
  declare message: string

  @column()
  declare effort: string | null

  @column()
  declare debt: string | null

  @column()
  declare author: string | null

  @column()
  declare tags: any | null

  @column.dateTime()
  declare creationDate: DateTime

  @column.dateTime()
  declare updateDate: DateTime

  @column.dateTime()
  declare closeDate: DateTime | null

  @column()
  declare type: string

  @column()
  declare organization: string

  @column()
  declare cleanCodeAttribute: string | null

  @column()
  declare cleanCodeAttributeCategory: string | null

  @column()
  declare impacts: any | null

  @column()
  declare issueStatus: string

  @column()
  declare projectName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
