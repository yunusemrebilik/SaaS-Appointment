'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import * as z from 'zod';

const loginFormSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl,
      });

      if (error) {
        // Handle specific error cases
        const errorMessage = error.message?.toLowerCase() || '';

        if (errorMessage.includes('password') || errorMessage.includes('credentials')) {
          form.setError('password', {
            type: 'manual',
            message: 'Invalid email or password',
          });
        } else if (errorMessage.includes('email') || errorMessage.includes('user')) {
          form.setError('email', {
            type: 'manual',
            message: 'No account found with this email',
          });
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        return;
      }

      // Success - redirect to callback URL or dashboard
      toast.success('Welcome back! 👋');

      // Explicitly set the active organization if not set
      const { data: orgs } = await authClient.organization.list();
      if (orgs && orgs.length > 0) {
        await authClient.organization.setActive({
          organizationId: orgs[0].id,
        });
      }

      // Force full page reload to ensure auth state is fresh and bypass Router Cache
      window.location.href = callbackUrl;
    } catch (err) {
      console.error('Unexpected error during login:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your email and password below.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Work Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="bg-background/50"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="bg-background/50"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          form="login-form"
          className="w-full font-semibold shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have a shop yet?{' '}
          <Link
            href={callbackUrl === '/dashboard' ? '/join' : `/join?callbackUrl=${callbackUrl}`}
            className="font-medium text-primary hover:underline"
          >
            Create one here
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
