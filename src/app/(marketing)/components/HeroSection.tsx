import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroVisual } from './HeroVisual';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-background">
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
                The Modern OS for <br />
                <span className="text-primary">Master Barbers.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Simplify appointments, manage staff, and grow your revenue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/join">
                <Button size="lg" className="h-12 px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/#demo">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  View Demo Shop
                </Button>
              </Link>
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
