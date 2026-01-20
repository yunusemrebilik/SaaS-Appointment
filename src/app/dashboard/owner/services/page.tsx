import { getServices } from '@/actions/services';
import { ServicesList } from './components/ServicesList';
import { AddServiceButton } from './components/AddServiceButton';

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage the services your shop offers.
          </p>
        </div>
        <AddServiceButton />
      </div>

      <ServicesList services={services} />
    </div>
  );
}
