import { z } from 'zod'

// Emails are stored lowercase so "Foo@x.com" and "foo@x.com" are the same account
// (also matches what Google sign-in returns).
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    emailField,
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email:    emailField,
  password: z.string().min(1, 'Password is required'),
})

export const transactionSchema = z.object({
  type:        z.enum(['CREDIT', 'DEBIT']),
  amount:      z.number().positive('Amount must be positive'),
  category:    z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  // An unparsable date used to reach Prisma as "Invalid Date" and return a 500.
  date:        z
    .string()
    .min(1, 'Date is required')
    .refine((d) => !Number.isNaN(new Date(d).getTime()), 'Invalid date'),
})

export const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount:   z.number().positive('Budget must be positive'),
  month:    z.number().int().min(1).max(12),
  year:     z.number().int().min(2020).max(2100),
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
