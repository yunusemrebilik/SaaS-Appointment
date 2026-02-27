import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <header className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            Choose the plan that's right for your barbershop.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <Card className="flex flex-col border-muted-foreground/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription>Perfect for solo barbers just starting out.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-lg text-muted-foreground font-normal">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Up to 2 staff members</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Basic scheduling</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Email reminders</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Standard support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/join">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-primary/50 shadow-lg shadow-primary/10 relative">
            <div className="absolute top-0 right-0 -mt-3 mr-4">
              <Badge className="bg-primary text-primary-foreground pointer-events-none">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For growing barbershops with teams.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">
                $79<span className="text-lg text-muted-foreground font-normal">/mo</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited staff members</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Advanced scheduling & analytics</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SMS & Email reminders</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority support</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> No-show protection</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/join">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
