import { getProfile } from '@/actions/profile';
import { redirect } from 'next/navigation';
import { ProfileForm } from './components/ProfileForm';
import { PasswordForm } from './components/PasswordForm';

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <ProfileForm profile={profile} />
        </div>

        {/* Change Password */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <PasswordForm />
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{profile.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
