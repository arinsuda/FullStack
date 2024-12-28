import vine from '@vinejs/vine'

const schema = vine.object({
  title: vine.string(),
  description: vine.string(),
  director: vine.string(),
  release_date: vine.string(),
  rating: vine.number().min(1).max(10),
  categories: vine.number()
})

export const movieValiator = vine.compile(schema)
