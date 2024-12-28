import vine from '@vinejs/vine'

const schema =  vine.object({
    rating: vine.number().min(0).max(10).transform(value => parseFloat(value.toFixed(1))),
    comment: vine.string()
})

export const createReviewValidator = vine.compile(schema)