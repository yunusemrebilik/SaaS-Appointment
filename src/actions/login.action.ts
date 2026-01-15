'use server';

import { loginFormSchema } from '@/schemas/loginForm.schema';
import type { LoginFormData } from '@/schemas/loginForm.schema';
import { auth } from '@/lib/auth';

export async function loginAction(data: LoginFormData) {
  const validated = loginFormSchema.safeParse(data);

  if (!validated.success) {
    return { error: 'Invalid format' };
  }

  // Simulate DB/Auth call
  await auth.api.signInEmail({
    body: {
      email: validated.data.email,
      password: validated.data.password,
    },
  });

  if (validated.data.email === 'fail@test.com') {
    return {
      errors: 'Invalid email or password. Please try again.',
    };
  }

  return { success: true };
}
