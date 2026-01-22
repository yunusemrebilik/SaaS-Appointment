import { Stat } from './Stat';

export function StatsSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="10k+" label="Appointments Booked" />
          <Stat number="500+" label="Active Barbers" />
          <Stat number="99%" label="Uptime" />
          <Stat number="24/7" label="Support" />
        </div>
      </div>
    </section>
  );
}
