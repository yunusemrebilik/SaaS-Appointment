import { BRAND_NAME } from '@/lib/constants';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-muted-foreground">
          © {year} {BRAND_NAME} All rights reserved.
        </p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
