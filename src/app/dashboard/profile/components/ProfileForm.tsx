'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { updateProfile, updateProfileImage } from '@/actions/profile';
import { UploadButton } from '@/lib/uploadthing-components';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(profile.image);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setLoading(true);
    try {
      await updateProfile({ name: data.name });
      toast.success('Profile updated!');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveImage() {
    try {
      await updateProfileImage(null);
      setImageUrl(null);
      toast.success('Profile picture removed');
      router.refresh();
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <UploadButton
              endpoint="shopLogo"
              onClientUploadComplete={async (res) => {
                if (res?.[0]?.ufsUrl) {
                  const newImageUrl = res[0].ufsUrl;
                  setImageUrl(newImageUrl);
                  try {
                    await updateProfileImage(newImageUrl);
                    toast.success('Profile picture updated!');
                    router.refresh();
                  } catch (error) {
                    console.error('Error saving image:', error);
                    toast.error('Failed to save profile picture');
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
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  placeholder="Your name"
                  disabled={loading}
                  className="bg-background/50"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed at this time.
            </p>
          </Field>
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
    </div>
  );
}
