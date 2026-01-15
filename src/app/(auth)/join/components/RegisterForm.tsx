'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { toast } from 'sonner';
import { registerFormSchema } from '@/schemas/registerForm.schema';
import type { RegisterFormData } from '@/schemas/registerForm.schema';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';

export function RegisterForm() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      ownerName: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);

    // 1. Create the User Account
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.ownerName,
      callbackURL: callbackUrl,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message ?? 'Failed to create account');
      return;
    }

    // 2. Success!
    // If email verification is OFF: They are logged in.
    // If email verification is ON: They are redirected to a "Check Email" page (handled by authClient usually or manually).
    toast.success('Account created successfully!');
    router.push(callbackUrl);
    setLoading(false);
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="flex flex-col items-center">
        <CardTitle>Create your Account</CardTitle>
        <CardDescription>Join to start managing your barbershop.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Owner Name */}
            <Controller
              name="ownerName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="ownerName">Full Name</FieldLabel>
                  <Input
                    {...field}
                    id="ownerName"
                    placeholder="John Doe"
                    disabled={loading}
                    className="bg-background/50"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Email */}
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

            {/* Password */}
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
                    autoComplete="new-password"
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

      <CardFooter className="flex flex-col gap-4 bg-muted/20 pt-6">
        <Button
          type="submit"
          form="register-form"
          size="lg"
          className="w-full font-semibold shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Get Started'
          )}
        </Button>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <FeatureItem text="No credit card needed" />
          <FeatureItem text="Cancel anytime" />
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{' '}
          <Link
            href={callbackUrl === '/dashboard' ? '/login' : `/login?callbackUrl=${callbackUrl}`}
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <span className="flex gap-1.5 items-center">
      <CheckCircle2 className="h-3 w-3 text-green-600" />
      <span>{text}</span>
    </span>
  );
}
