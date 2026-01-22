import { notFound } from 'next/navigation';
import { getOrganizationBySlug, getPublicServices } from '@/actions/public-booking';
import { BookingWizard } from './components/BookingWizard';
import { Store } from 'lucide-react';

interface BookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;

  const organization = await getOrganizationBySlug(slug);

  if (!organization) {
    notFound();
  }

  const services = await getPublicServices(organization.id);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Store className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <p className="text-muted-foreground mt-1">Book your appointment</p>
        </div>

        {/* Booking Wizard */}
        <BookingWizard
          organizationId={organization.id}
          organizationName={organization.name}
          services={services}
        />
      </div>
    </div>
  );
}
