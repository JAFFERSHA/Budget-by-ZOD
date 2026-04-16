import { z } from 'zod'

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const transactionSchema = z.object({
  type:        z.enum(['CREDIT', 'DEBIT']),
  amount:      z.number().positive('Amount must be positive'),
  category:    z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date:        z.string().min(1, 'Date is required'),
})

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount:   z.number().positive('Budget must be positive'),
  month:    z.number().min(1).max(12),
  year:     z.number().min(2020).max(2100),
})

export const userUpdateSchema = z.object({
  name:             z.string().min(2).optional(),
  currency:         z.string().length(3).optional(),
  monthlyIncome:    z.number().positive().optional(),
  lowBalanceAlert:  z.number().positive().optional(),
})

export type RegisterInput      = z.infer<typeof registerSchema>
export type LoginInput          = z.infer<typeof loginSchema>
export type TransactionInput    = z.infer<typeof transactionSchema>
export type BudgetInput         = z.infer<typeof budgetSchema>
export type UserUpdateInput     = z.infer<typeof userUpdateSchema>
