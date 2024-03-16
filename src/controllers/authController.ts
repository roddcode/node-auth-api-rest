import { Request, Response } from 'express'
import { comparePassword, hashPassword } from '../services/password.service'
import prisma from '../models/user'
import { generateJWT } from '../services/auth.service'

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body
  try {
    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' })
      return
    }

    const hashedPassword = await hashPassword(password)
    console.log(hashedPassword)
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    const token = generateJWT(user)
    res.status(201).json({ token })
  } catch (error: any) {
    if (error?.code == 'P2002' && error?.meta?.target?.includes('email'))
      res.status(409).json({ error: 'Email already exists' })
    console.log(error)

    res.status(500).json({ error: error.message })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body

  try {
    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' })
    }
    const user = await prisma.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'User and password do not match' })
      return
    }
    const passwordMatch = await comparePassword(password, user.password)
    if (!passwordMatch) {
      res.status(401).json({ error: 'User and password do not match' })
      return
    }
    const token = generateJWT(user)
    res.status(200).json({ token })
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}
