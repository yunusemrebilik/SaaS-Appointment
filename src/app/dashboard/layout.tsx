import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from './components/DashboardSidebar';
import { MobileHeader } from './components/MobileHeader';
import { getMemberRole } from '@/lib/get-member-role';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect('/login');
  }

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  if (!organizations || organizations.length === 0) {
    redirect('/onboarding/create-shop');
  }

  // Set first org as active if no active org
  if (!session.session.activeOrganizationId) {
    const firstOrgId = organizations[0].id;

    await auth.api.setActiveOrganization({
      headers: requestHeaders,
      body: {
        organizationId: firstOrgId,
      },
    });
  }

  const activeOrgId = session.session.activeOrganizationId || organizations[0].id;

  // Get user's role in the active organization
  const userRole = await getMemberRole();

  return (
    <SidebarProvider>
      <DashboardSidebar
        organizations={organizations}
        activeOrganizationId={activeOrgId}
        userRole={userRole}
      />
      <SidebarInset>
        <MobileHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
