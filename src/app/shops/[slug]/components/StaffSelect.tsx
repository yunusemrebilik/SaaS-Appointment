'use client';

import { useEffect, useState } from 'react';
import { User, Users, Loader2 } from 'lucide-react';
import { getAvailableStaff } from '@/actions/public-booking';



interface StaffSelectProps {
  organizationId: string;
  serviceId: string;
  onSelect: (memberId: string | null, memberName: string | null) => void;
}

export function StaffSelect({ organizationId, serviceId, onSelect }: StaffSelectProps) {
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof getAvailableStaff>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      try {
        const result = await getAvailableStaff(organizationId, serviceId);
        setStaff(result);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [organizationId, serviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Choose your stylist</h3>

      {/* Any Available Option */}
      <button
        onClick={() => onSelect(null, 'Any Available')}
        className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium group-hover:text-primary transition-colors">
              Any Available
            </h4>
            <p className="text-sm text-muted-foreground">
              We'll assign you to whoever is available
            </p>
          </div>
        </div>
      </button>

      {/* Individual Staff Members */}
      {staff.map((member) => (
        <button
          key={member.memberId}
          onClick={() => onSelect(member.memberId, member.name)}
          className="w-full text-left p-4 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted overflow-hidden">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h4 className="font-medium group-hover:text-primary transition-colors">
                {member.name}
              </h4>
            </div>
          </div>
        </button>
      ))}

      {staff.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No specific stylists available. Click "Any Available" to continue.
        </p>
      )}
    </div>
  );
}
