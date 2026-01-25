'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

export function MobileHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="-ml-2"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <span className="font-semibold">Dashboard</span>
    </header>
  );
}
