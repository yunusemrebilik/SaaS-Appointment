import { z } from 'zod';

export const serviceFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  durationMin: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration must be at most 8 hours'),
  priceCents: z.number().min(0, 'Price cannot be negative'),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

// Database row type
export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
