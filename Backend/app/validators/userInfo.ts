import vine from "@vinejs/vine";

const schema = vine.object({
    username: vine.string().minLength(5).maxLength(15).optional(),
    email: vine.string().email().optional(),
    bio: vine.string().maxLength(1000).optional(),
    profile_picture: vine.string().optional()
})

export const UserInformation = vine.compile(schema)