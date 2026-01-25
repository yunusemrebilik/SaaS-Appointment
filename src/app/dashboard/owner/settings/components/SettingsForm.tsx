'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, Store, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { updateOrganizationSettings } from '@/actions/organization';
import { UploadButton } from '@/lib/uploadthing-components';

const settingsSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'URL must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'URL can only contain lowercase letters, numbers, and hyphens'),
  logo: z.string().nullable().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
}

export function SettingsForm({ organization }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(organization.logo);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    },
  });

  async function onSubmit(data: SettingsFormData) {
    setLoading(true);
    try {
      await updateOrganizationSettings({
        name: data.name,
        slug: data.slug,
        logo: logoUrl,
      });
      toast.success('Settings saved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    form.setValue('logo', null);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Shop Logo</label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
            {logoUrl ? (
              <>
                <Image
                  src={logoUrl}
                  alt="Shop logo"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <Store className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <UploadButton
              endpoint="shopLogo"
              onClientUploadComplete={async (res) => {
                if (res?.[0]?.ufsUrl) {
                  const newLogoUrl = res[0].ufsUrl;
                  setLogoUrl(newLogoUrl);
                  form.setValue('logo', newLogoUrl);

                  // Auto-save logo to database
                  try {
                    await updateOrganizationSettings({
                      name: form.getValues('name'),
                      slug: form.getValues('slug'),
                      logo: newLogoUrl,
                    });
                    toast.success('Logo uploaded and saved!');
                    router.refresh();
                  } catch (error) {
                    console.error('Error saving logo:', error);
                    toast.error('Logo uploaded but failed to save. Please click Save Changes.');
                  }
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button: 'ut-ready:bg-primary ut-uploading:cursor-not-allowed',
                allowedContent: 'text-xs text-muted-foreground',
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
        </div>
      </div>

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
                placeholder="My Barbershop"
                disabled={loading}
                className="bg-background/50"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* URL Slug */}
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Public URL</FieldLabel>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  /shops/
                </span>
                <Input
                  {...field}
                  id="slug"
                  placeholder="my-barbershop"
                  disabled={loading}
                  className="rounded-l-none bg-background/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This is the URL customers will use to book appointments.
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
}
