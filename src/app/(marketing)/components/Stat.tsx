export function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-4xl font-black tracking-tighter">{number}</h3>
      <p className="text-primary-foreground/80 font-medium">{label}</p>
    </div>
  );
}
