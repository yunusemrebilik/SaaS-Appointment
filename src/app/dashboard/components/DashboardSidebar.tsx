'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Home,
  Scissors,
  Settings,
  Users,
  Clock,
  ChevronsLeft,
  LogOut,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { OrganizationSelector } from './OrganizationSelector';
import { authClient } from '@/lib/auth-client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

type MemberRole = 'owner' | 'admin' | 'member' | null;

interface DashboardSidebarProps {
  organizations: Organization[];
  activeOrganizationId?: string | null;
  userRole?: MemberRole;
}

const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'My Schedule',
    url: '/dashboard/schedule',
    icon: Calendar,
  },
  {
    title: 'Calendar',
    url: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    title: 'Appointments',
    url: '/dashboard/appointments',
    icon: Clock,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: Users,
  },
];

const managementNavItems = [
  {
    title: 'Services',
    url: '/dashboard/owner/services',
    icon: Scissors,
  },
  {
    title: 'Staff',
    url: '/dashboard/owner/staff',
    icon: Users,
  },
  {
    title: 'Customers',
    url: '/dashboard/owner/customers',
    icon: Ban,
  },
  {
    title: 'Settings',
    url: '/dashboard/owner/settings',
    icon: Settings,
  },
];

export function DashboardSidebar({
  organizations,
  activeOrganizationId,
  userRole,
}: DashboardSidebarProps) {
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
      setLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <OrganizationSelector
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management - Only show for owners/admins */}
        {isOwnerOrAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} disabled={loggingOut} tooltip="Log Out">
              <LogOut />
              <span>{loggingOut ? 'Logging out...' : 'Log Out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} tooltip="Toggle Sidebar">
              <ChevronsLeft />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
