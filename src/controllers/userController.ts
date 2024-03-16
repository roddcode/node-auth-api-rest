import { Request, Response } from 'express'
import { hashPassword } from '../services/password.service'
import prisma from '../models/user'
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email is required' })
      return
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' })
      return
    }
    const hashedPassword = await hashPassword(password)
    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    })
    res.status(201).json(user)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.findMany()
    res.status(200).json(users)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id)
  try {
    const user = await prisma.findUnique({ where: { id: userId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.status(200).json(user)
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = parseInt(req.params.id)
  const { email, password } = req.body
  try {
    let dataToUpdate: any = {}
    if (email) {
      dataToUpdate.email = email
    }
    if (password) {
      dataToUpdate.password = await hashPassword(password)
    }
    const user = await prisma.update({
      where: { id: userId },
      data: dataToUpdate,
    })
    res.status(200).json(user)
  } catch (error: any) {
    if (error?.code == 'P2002' && error?.meta?.target?.includes('email'))
      res.status(409).json({ error: 'Email already exists' })
    if (error?.code == 'P2025')
      res.status(404).json({ error: 'User not found' })
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

export const deleteUser = async (
  req: Request,
  res: Response
) => {
  const userId = parseInt(req.params.id)
  try {
    const user = await prisma.delete({ where: { id: userId } })
    res.status(200).json(user)
  } catch (error: any) {
    if (error?.code == 'P2025')
      res.status(404).json({ error: 'User not found' })
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}