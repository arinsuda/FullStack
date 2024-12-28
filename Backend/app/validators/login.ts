import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
    username: vine.string().minLength(5),
    password: vine.string()
    .minLength(10)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,}$/)
})

export const LoginValiator = vine.compile(schema)

vine.messagesProvider = new SimpleMessagesProvider({
    'required': 'The {{ field }} is required',
    'minLength': 'The {{ field }} must have a least {{ min }} length.',
    'username.minLength': 'Username must be at least 5 characters long.',
    'password.regex': 'Password must include one uppercase letter, one lowercase letter, one number, and one special character.',
    'password.minLength': 'Password must be at least 10 characters long.',
  })
