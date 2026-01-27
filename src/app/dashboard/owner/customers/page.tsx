import { getBannedCustomers } from '@/actions/banned-customers';
import { BannedCustomersList } from './components/BannedCustomersList';
import { BanCustomerButton } from './components/BanCustomerButton';

export default async function CustomersPage() {
  const result = await getBannedCustomers({});

  if (!result.success) {
    return <div className="p-4 text-destructive">{result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer bans and restrictions.
          </p>
        </div>
        <BanCustomerButton />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Banned Customers</h2>
          <p className="text-sm text-muted-foreground">
            Customers who are currently banned from making bookings.
          </p>
        </div>
        <BannedCustomersList bannedCustomers={result.data} />
      </div>
    </div>
  );
}
