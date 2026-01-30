'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Store, Upload, RotateCcw } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import * as z from 'zod';

const createShopFormSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  slug: z
    .string()
    .min(1, 'Shop slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  logo: z.any().optional(),
});

type CreateShopFormData = z.infer<typeof createShopFormSchema>;
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useAutoSlug } from '@/hooks/use-auto-slug';

// Helper to slugify text
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function CreateShopForm() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<CreateShopFormData>({
    resolver: zodResolver(createShopFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const autoSlug = useAutoSlug({
    form,
    nameField: 'name',
    slugField: 'slug',
    generateSlug,
    debounceMs: 300,
  });

  async function onSubmit(data: CreateShopFormData) {
    setLoading(true);

    try {
      // Handle Logo Upload (Mocked for now)
      const logoUrl: string | undefined = undefined;
      if (data.logo && data.logo.length > 0) {
        // TODO: Upload `data.logo[0]` to S3/UploadThing here
        console.log('File selected:', data.logo[0].name);
      }

      // Create Organization via Better Auth
      const { data: org, error } = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
        logo: logoUrl,
      });

      if (error) {
        // Handle specific error cases
        const errorMessage = error.message?.toLowerCase() || '';

        if (errorMessage.includes('slug') || errorMessage.includes('url')) {
          form.setError('slug', {
            type: 'manual',
            message: 'This URL is already taken. Try another.',
          });
        } else if (errorMessage.includes('name')) {
          form.setError('name', {
            type: 'manual',
            message: error.message || 'Invalid shop name.',
          });
        } else {
          toast.error(error.message || 'Failed to create shop');
        }
        return;
      }

      // Success - redirect to dashboard
      toast.success('Welcome to your new shop! 🎉');
      router.push('/dashboard');
    } catch (err) {
      console.error('Unexpected error creating shop:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Name your Shop</CardTitle>
        <CardDescription>
          This will be your digital storefront. You can change the name later, but your URL is
          permanent.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form id="create-shop-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Shop Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Shop Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. Ace Barbers"
                    disabled={loading}
                    className="bg-background/50"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      field.onChange(e);
                      autoSlug.onNameChange(e.target.value);
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Shop URL (Slug) */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="slug">Shop URL</FieldLabel>
                    {autoSlug.isManual && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={autoSlug.resetToAuto}
                        className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Reset to auto
                      </Button>
                    )}
                  </div>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      barbersaas.com/
                    </span>
                    <Input
                      {...field}
                      id="slug"
                      placeholder="ace-barbers"
                      disabled={loading}
                      className="rounded-l-none font-mono text-sm bg-background/50"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        field.onChange(e);
                        autoSlug.onSlugChange();
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and dashes.
                  </p>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Logo Upload */}
            <Controller
              name="logo"
              control={form.control}
              render={({ field: { onChange, value, ...field } }) => (
                <Field>
                  <FieldLabel>Shop Logo (optional)</FieldLabel>
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-md cursor-pointer bg-background/50 hover:bg-muted/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground">SVG, PNG, JPG (max 2MB)</p>
                    </div>
                    <Input
                      {...field}
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange([file]);
                      }}
                      disabled={loading}
                    />
                  </label>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 bg-muted/20 pt-6">
        <Button
          type="submit"
          form="create-shop-form"
          size="lg"
          className="w-full font-semibold shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up shop...
            </>
          ) : (
            'Create Shop'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
