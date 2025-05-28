import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// Interfaces para los tipos anidados
export interface CopilotIdeChat {
  editors?: Editor[]
  total_engaged_users: number
}

export interface Editor {
  name: string
  models: Model[]
  total_engaged_users: number
}

export interface Model {
  name: string
  total_chats: number
  is_custom_model: boolean
  total_engaged_users: number
  total_chat_copy_events: number
  total_chat_insertion_events: number
}

export interface CopilotDotcomChat {
  total_engaged_users: number
}

export interface CopilotDotcomPullRequests {
  total_engaged_users: number
}

export interface CopilotIdeCodeCompletions {
  editors: Editor2[]
  languages: Language2[]
  total_engaged_users: number
}

export interface Editor2 {
  name: string
  models: Model2[]
  total_engaged_users: number
}

export interface Model2 {
  name: string
  languages: Language[]
  is_custom_model: boolean
  total_engaged_users: number
}

export interface Language {
  name: string
  total_engaged_users: number
  total_code_acceptances: number
  total_code_suggestions: number
  total_code_lines_accepted: number
  total_code_lines_suggested: number
}

export interface Language2 {
  name: string
  total_engaged_users: number
}

export default class CopilotDay extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.date()
  declare date: DateTime

  @column()
  declare totalActiveUsers: number

  @column()
  declare totalEngagedUsers: number

  @column({
    prepare: (value: CopilotIdeChat | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare copilotIdeChat: CopilotIdeChat | null

  @column({
    prepare: (value: CopilotDotcomChat | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare copilotDotcomChat: CopilotDotcomChat | null

  @column({
    prepare: (value: CopilotDotcomPullRequests | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare copilotDotcomPullRequests: CopilotDotcomPullRequests | null

  @column({
    prepare: (value: CopilotIdeCodeCompletions | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare copilotIdeCodeCompletions: CopilotIdeCodeCompletions | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
