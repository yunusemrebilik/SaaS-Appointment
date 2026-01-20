'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ServiceFormDialog } from './ServiceFormDialog';

export function AddServiceButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Service
      </Button>
      <ServiceFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
