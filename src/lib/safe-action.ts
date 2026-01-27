import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// ============ Result Types ============

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function err(error: string, code?: string): ActionResult<never> {
  return { success: false, error, code };
}

// ============ Auth Context ============

export interface AuthContext {
  userId: string;
  organizationId: string;
  memberId: string | null;
  role: 'owner' | 'admin' | 'member' | null;
}

async function getAuthContext(): Promise<ActionResult<AuthContext>> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    return err('Not authenticated', 'UNAUTHENTICATED');
  }

  if (!session.session.activeOrganizationId) {
    return err('No active organization', 'NO_ORG');
  }

  const members = await auth.api.listMembers({
    headers: requestHeaders,
    query: { organizationId: session.session.activeOrganizationId },
  });

  const currentMember = members?.members?.find(
    (m: { userId: string }) => m.userId === session.user.id
  );

  return ok({
    userId: session.user.id,
    organizationId: session.session.activeOrganizationId,
    memberId: currentMember?.id || null,
    role: (currentMember?.role as AuthContext['role']) || null,
  });
}

// ============ Safe Action Builder ============

type ActionHandler<TInput, TOutput> = (params: {
  data: TInput;
  ctx: AuthContext;
}) => Promise<ActionResult<TOutput>>;

interface ActionConfig<TInput, TOutput> {
  schema?: z.ZodType<TInput>;
  requireAuth?: boolean;
  requireRole?: ('owner' | 'admin' | 'member')[];
  handler: ActionHandler<TInput, TOutput>;
}

export function createSafeAction<TInput, TOutput>(
  config: ActionConfig<TInput, TOutput>
) {
  const { schema, requireAuth = true, requireRole, handler } = config;

  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Validate input if schema provided
      let validatedInput = input;
      if (schema) {
        const parseResult = schema.safeParse(input);
        if (!parseResult.success) {
          const firstError = parseResult.error.issues[0];
          return err(firstError?.message || 'Validation failed', 'VALIDATION_ERROR');
        }
        validatedInput = parseResult.data;
      }

      // 2. Get auth context if required
      let ctx: AuthContext = {
        userId: '',
        organizationId: '',
        memberId: null,
        role: null,
      };

      if (requireAuth) {
        const authResult = await getAuthContext();
        if (!authResult.success) {
          return authResult;
        }
        ctx = authResult.data;
      }

      // 3. Check role if required
      if (requireRole && requireRole.length > 0) {
        if (!ctx.role || !requireRole.includes(ctx.role)) {
          return err('You do not have permission to perform this action', 'FORBIDDEN');
        }
      }

      // 4. Execute the handler
      return await handler({ data: validatedInput, ctx });
    } catch (error) {
      console.error('[SafeAction Error]', error);
      return err(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'INTERNAL_ERROR'
      );
    }
  };
}
