'use client';

import { Clock, DollarSign } from 'lucide-react';
import { Service } from '@/actions/public-booking';



interface ServiceSelectProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelect({ services, onSelect }: ServiceSelectProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No services available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Choose a service</h3>
      {services.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service)}
          className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium group-hover:text-primary transition-colors">
                {service.name}
              </h4>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <div className="font-semibold text-primary">
                {formatPrice(service.priceCents)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                {service.durationMin} min
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
