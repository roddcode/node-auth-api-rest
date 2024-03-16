import { User } from "../models/user.interface"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// Generates a JSON Web Token (JWT) using a secret value, user information (id and email), and sets an expiration time of 1 day.
export const generateJWT = (user: User) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' })
}