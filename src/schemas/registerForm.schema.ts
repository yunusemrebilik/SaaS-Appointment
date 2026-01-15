import * as z from 'zod';

export const registerFormSchema = z.object({
  ownerName: z.string().min(1, 'Name of the shop owner is required'),
  email: z.email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
