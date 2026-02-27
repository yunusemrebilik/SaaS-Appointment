import { BRAND_NAME } from '@/lib/constants';
import { Scissors, Star, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Modernizing the barbershop experience.
            </h2>
            <p className="text-lg text-muted-foreground">
              {BRAND_NAME} was built with a single mission: to free barbers from the
              chaos of ringing phones, paper calendars, and no-shows.
            </p>
            <p className="text-lg text-muted-foreground">
              We believe you should spend your time doing what you do best—mastering
              your craft and serving your clients—not stressing over scheduling conflicts.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl shadow-sm border border-muted-foreground/20">
                <span className="text-3xl font-bold text-primary">10k+</span>
                <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Bookings</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl shadow-sm border border-muted-foreground/20">
                <span className="text-3xl font-bold text-primary">500+</span>
                <span className="text-xs text-muted-foreground font-medium uppercase mt-1">Shops</span>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-background/60 backdrop-blur-sm border-muted-foreground/20">
              <CardContent className="p-6 space-y-2">
                <Scissors className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold">Built for Barbers</h3>
                <p className="text-sm text-muted-foreground">Designed specifically for the unique workflow of barbershops.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-muted-foreground/20 sm:translate-y-6 mt-4 sm:mt-0">
              <CardContent className="p-6 space-y-2">
                <Star className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold">Premium Experience</h3>
                <p className="text-sm text-muted-foreground">Give your clients a booking experience matching your service.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-muted-foreground/20">
              <CardContent className="p-6 space-y-2">
                <Shield className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold">Secure Data</h3>
                <p className="text-sm text-muted-foreground">Your client list and business data are safe and sound.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-muted-foreground/20 sm:translate-y-6 mt-4 sm:mt-0">
              <CardContent className="p-6 space-y-2">
                <Clock className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold">Save Time</h3>
                <p className="text-sm text-muted-foreground">Automate up to 90% of your daily administrative tasks.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
