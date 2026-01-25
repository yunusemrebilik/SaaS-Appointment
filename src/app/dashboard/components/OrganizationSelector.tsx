'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Store, ChevronsUpDown } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface OrganizationSelectorProps {
  organizations: Organization[];
  activeOrganizationId?: string | null;
}

export function OrganizationSelector({
  organizations,
  activeOrganizationId,
}: OrganizationSelectorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  // Default to first org if no active org
  const currentOrgId = activeOrganizationId || organizations[0]?.id;

  async function handleOrganizationChange(organizationId: string) {
    if (organizationId === currentOrgId) return;

    setIsPending(true);
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      // Refresh to update server-side data
      router.refresh();
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setIsPending(false);
    }
  }

  if (organizations.length === 0) {
    return null;
  }

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  return (
    <Select
      value={currentOrgId}
      onValueChange={handleOrganizationChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-full justify-between gap-2 border-0 bg-transparent px-3 shadow-none hover:bg-muted/50 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:hidden">
        <SelectValue>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {currentOrg?.logo ? (
                <img
                  src={currentOrg.logo}
                  alt={currentOrg.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <Store className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-semibold text-sm truncate max-w-[140px]">
                {currentOrg?.name || 'Select shop'}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {currentOrg?.slug}
              </span>
            </div>
          </div>
        </SelectValue>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Shops</SelectLabel>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id} className="py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <Store className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium truncate max-w-[140px]">{org.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {org.slug}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
