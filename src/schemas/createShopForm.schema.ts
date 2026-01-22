import * as z from 'zod';

export const createShopFormSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  slug: z
    .string()
    .min(1, 'Shop slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  logo: z.any().optional(),
});

export type CreateShopFormData = z.infer<typeof createShopFormSchema>;
