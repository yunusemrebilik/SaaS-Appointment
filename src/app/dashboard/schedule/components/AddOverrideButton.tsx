'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AddOverrideDialog } from './AddOverrideDialog';

export function AddOverrideButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Exception
      </Button>
      <AddOverrideDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
