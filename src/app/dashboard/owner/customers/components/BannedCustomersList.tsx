'use client';

import { useRouter } from 'next/navigation';
import { Phone, Ban, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { unbanCustomer, BannedCustomer } from '@/actions/banned-customers';

interface BannedCustomersListProps {
  bannedCustomers: BannedCustomer[];
}

export function BannedCustomersList({ bannedCustomers }: BannedCustomersListProps) {
  const router = useRouter();

  async function handleUnban(id: string, phone: string) {
    if (!confirm(`Are you sure you want to unban ${phone}?`)) {
      return;
    }

    const result = await unbanCustomer({ id });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Customer unbanned successfully');
    router.refresh();
  }

  if (bannedCustomers.length === 0) {
    return (
      <div className="p-12 text-center">
        <Ban className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No banned customers</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers you ban will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {bannedCustomers.map((customer) => (
        <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{customer.customerPhone}</span>
              </div>
              {customer.reason && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Reason: {customer.reason}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Banned: {new Date(customer.bannedAt).toLocaleDateString()}
                </span>
                {customer.bannedUntil && (
                  <span>
                    Until: {new Date(customer.bannedUntil).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUnban(customer.id, customer.customerPhone)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Unban
          </Button>
        </div>
      ))}
    </div>
  );
}
