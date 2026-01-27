'use server';

import { z } from 'zod';
import { db } from '@/db/db';
import { revalidatePath } from 'next/cache';
import { createSafeAction, ok, err, type ActionResult } from '@/lib/safe-action';
import { serviceFormSchema, type ServiceFormData } from '@/schemas/service.schema';
import type { Service } from '@/schemas/service.schema';

// ============ Read Operations ============

export const getServices = createSafeAction({
  handler: async ({ ctx }) => {
    const services = await db
      .selectFrom('services')
      .selectAll()
      .where('organizationId', '=', ctx.organizationId)
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .execute();

    return ok(services as Service[]);
  },
});

export const getServiceCount = createSafeAction({
  handler: async ({ ctx }) => {
    const result = await db
      .selectFrom('services')
      .select(db.fn.count<number>('id').as('count'))
      .where('organizationId', '=', ctx.organizationId)
      .where('isActive', '=', true)
      .executeTakeFirst();

    return ok(Number(result?.count || 0));
  },
});

const getServiceByIdSchema = z.object({ id: z.uuid() });

export const getServiceById = createSafeAction({
  schema: getServiceByIdSchema,
  handler: async ({ data, ctx }) => {
    const service = await db
      .selectFrom('services')
      .selectAll()
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .executeTakeFirst();

    if (!service) {
      return err('Service not found', 'NOT_FOUND');
    }

    return ok(service as Service);
  },
});

// ============ Write Operations ============

export const createService = createSafeAction({
  schema: serviceFormSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    const result = await db
      .insertInto('services')
      .values({
        organizationId: ctx.organizationId,
        name: data.name,
        description: data.description || null,
        durationMin: data.durationMin,
        priceCents: data.priceCents,
        isActive: true,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    revalidatePath('/dashboard/owner/services');
    return ok(result as Service);
  },
});

const updateServiceSchema = z.object({
  id: z.uuid(),
  data: serviceFormSchema,
});

export const updateService = createSafeAction({
  schema: updateServiceSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    const result = await db
      .updateTable('services')
      .set({
        name: data.data.name,
        description: data.data.description || null,
        durationMin: data.data.durationMin,
        priceCents: data.data.priceCents,
        updatedAt: new Date(),
      })
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return err('Service not found', 'NOT_FOUND');
    }

    revalidatePath('/dashboard/owner/services');
    return ok(result as Service);
  },
});

const deleteServiceSchema = z.object({ id: z.uuid() });

export const deleteService = createSafeAction({
  schema: deleteServiceSchema,
  requireRole: ['owner', 'admin'],
  handler: async ({ data, ctx }) => {
    // Soft delete - just mark as inactive
    const result = await db
      .updateTable('services')
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where('id', '=', data.id)
      .where('organizationId', '=', ctx.organizationId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return err('Service not found', 'NOT_FOUND');
    }

    revalidatePath('/dashboard/owner/services');
    return ok(result as Service);
  },
});
