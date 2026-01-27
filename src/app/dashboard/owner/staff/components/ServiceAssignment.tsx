'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getMemberServices, assignServicesToMember } from '@/actions/member-services';

interface Service {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
}

interface ServiceAssignmentProps {
  memberId: string;
  services: Service[];
}

export function ServiceAssignment({ memberId, services }: ServiceAssignmentProps) {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [initialServices, setInitialServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current assignments
  useEffect(() => {
    async function load() {
      const result = await getMemberServices({ memberId });
      setLoading(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSelectedServices(result.data);
      setInitialServices(result.data);
    }
    load();
  }, [memberId]);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const hasChanges =
    JSON.stringify([...selectedServices].sort()) !==
    JSON.stringify([...initialServices].sort());

  async function handleSave() {
    setSaving(true);
    const result = await assignServicesToMember({ memberId, serviceIds: selectedServices });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setInitialServices(selectedServices);
    toast.success('Services updated');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No services available. Add services first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Assigned Services</p>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
              {service.name}
            </button>
          );
        })}
      </div>
      {hasChanges && (
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      )}
    </div>
  );
}
