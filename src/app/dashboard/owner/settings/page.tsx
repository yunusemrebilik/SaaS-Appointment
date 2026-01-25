import { getOrganizationSettings } from '@/actions/organization';
import { redirect } from 'next/navigation';
import { SettingsForm } from './components/SettingsForm';

export default async function SettingsPage() {
  const organization = await getOrganizationSettings();

  if (!organization) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your shop profile and preferences.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Shop Profile</h2>
        <SettingsForm organization={organization} />
      </div>
    </div>
  );
}
