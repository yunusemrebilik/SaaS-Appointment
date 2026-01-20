'use client';

import { useState } from 'react';
import { Clock, DollarSign, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { deleteService } from '@/actions/services';
import { ServiceFormDialog } from './ServiceFormDialog';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  isActive: boolean | null;
}

interface ServicesListProps {
  services: Service[];
}

export function ServicesList({ services }: ServicesListProps) {
  const router = useRouter();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setDeletingId(id);
    try {
      await deleteService(id);
      toast.success('Service deleted');
      router.refresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No services yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first service to start accepting bookings.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingService(service)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            {service.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{service.durationMin} min</span>
              </div>
              <div className="flex items-center gap-1 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>{(service.priceCents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <ServiceFormDialog
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          service={editingService}
        />
      )}
    </>
  );
}
