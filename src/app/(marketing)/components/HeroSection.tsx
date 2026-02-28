import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroVisual } from './HeroVisual';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-[clamp(5rem,8vw,7rem)] bg-background">
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-wrap gap-12 items-center justify-center">
          <div className="flex-1 basis-[min(100%,500px)] space-y-8">
            <div className="space-y-4">
              <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] font-extrabold tracking-tight leading-tight">
                The Modern OS for <br />
                <span className="text-primary">Master Barbers.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Simplify appointments, manage staff, and grow your revenue.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
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
