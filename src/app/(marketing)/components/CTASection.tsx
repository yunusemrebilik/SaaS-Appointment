import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/5 via-muted/50 to-secondary/30 px-6 py-16 md:px-16 md:py-24 text-center border overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 bg-primary/20 rounded-full blur-3xl" />

          <h2 className="text-3xl font-bold md:text-4xl mb-6 relative">Ready to upgrade your shop?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 relative">
            Create your account today and take your first booking in minutes.
          </p>
          <Link href="/join" className="relative">
            <Button size="lg" className="h-14 px-8 text-lg shadow-lg hover:shadow-primary/20">
              Create My Shop
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
