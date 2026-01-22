import { Calendar, Users, ShieldCheck } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeaturesSection() {
  return (
    <section className="py-16 pt-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <header className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to run your shop</h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            Stop using paper notebooks and messy text messages.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="h-8 w-8 text-primary" />}
            title="Smart Scheduling"
            description="Prevent double bookings with advanced conflict detection."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Staff Management"
            description="Assign services and manage individual schedules."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-primary" />}
            title="No-Show Protection"
            description="Ban repeat offenders by phone number."
          />
        </div>
      </div>
    </section>
  );
}
