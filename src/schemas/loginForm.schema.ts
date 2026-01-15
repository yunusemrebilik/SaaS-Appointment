import * as z from 'zod';

export const loginFormSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
