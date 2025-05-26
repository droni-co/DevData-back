import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    orgId: vine.string().uuid(),
    orgSecret: vine.string().trim().minLength(8),
    name: vine.string().trim().minLength(3),
    email: vine.string().trim().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(8).confirmed(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
  })
)
