import vine from "@vinejs/vine";
import Role from "../contact/role.js";

const schema = vine.object({
    username: vine.string().minLength(5).unique( async(db, value) => {
        const user = await db.from('users').where('username', value).first()
        return !user
    }),
    email: vine.string().email(),
    password: vine.string()
    .minLength(10)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,}$/)
    .confirmed(),
    role: vine.enum(Object.values(Role)).optional()
})

export const registerUserValiator = vine.compile(schema)