'use server';

import { db } from '@/db/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { serviceFormSchema, type ServiceFormData } from '@/schemas/service.schema';

async function getActiveOrganizationId(): Promise<string> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.session.activeOrganizationId) {
    throw new Error('No active organization');
  }

  return session.session.activeOrganizationId;
}

export async function getServices() {
  const organizationId = await getActiveOrganizationId();

  const services = await db
    .selectFrom('services')
    .selectAll()
    .where('organizationId', '=', organizationId)
    .where('isActive', '=', true)
    .orderBy('name', 'asc')
    .execute();

  return services;
}

export async function getServiceCount() {
  const organizationId = await getActiveOrganizationId();

  const result = await db
    .selectFrom('services')
    .select(db.fn.count<number>('id').as('count'))
    .where('organizationId', '=', organizationId)
    .where('isActive', '=', true)
    .executeTakeFirst();

  return Number(result?.count || 0);
}

export async function getServiceById(id: string) {
  const organizationId = await getActiveOrganizationId();

  const service = await db
    .selectFrom('services')
    .selectAll()
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .executeTakeFirst();

  return service;
}

export async function createService(data: ServiceFormData) {
  const organizationId = await getActiveOrganizationId();

  // Validate input
  const validated = serviceFormSchema.parse(data);

  const result = await db
    .insertInto('services')
    .values({
      organizationId,
      name: validated.name,
      description: validated.description || null,
      durationMin: validated.durationMin,
      priceCents: validated.priceCents,
      isActive: true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  revalidatePath('/dashboard/owner/services');
  return result;
}

export async function updateService(id: string, data: ServiceFormData) {
  const organizationId = await getActiveOrganizationId();

  // Validate input
  const validated = serviceFormSchema.parse(data);

  const result = await db
    .updateTable('services')
    .set({
      name: validated.name,
      description: validated.description || null,
      durationMin: validated.durationMin,
      priceCents: validated.priceCents,
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .returningAll()
    .executeTakeFirst();

  revalidatePath('/dashboard/owner/services');
  return result;
}

export async function deleteService(id: string) {
  const organizationId = await getActiveOrganizationId();

  // Soft delete - just mark as inactive
  const result = await db
    .updateTable('services')
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where('id', '=', id)
    .where('organizationId', '=', organizationId)
    .returningAll()
    .executeTakeFirst();

  revalidatePath('/dashboard/owner/services');
  return result;
}
