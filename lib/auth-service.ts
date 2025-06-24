import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { RegisterSchema } from "@/schemas"
import type * as z from "zod"

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }

  const { email, password, name } = validatedFields.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (existingUser) {
    return { error: "Email already in use!" }
  }

  await db.user.create({
    data: {
      name,
      email,
      password_hash: hashedPassword,
    },
  })

  return { success: "User created!" }
}

export const checkPassword = async (password: string, user: any) => {
  if (!user) {
    return false
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash)
  return isPasswordCorrect
}
