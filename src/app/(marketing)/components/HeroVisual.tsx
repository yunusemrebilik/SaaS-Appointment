import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
      <div className="aspect-square overflow-hidden rounded-3xl bg-neutral-900/5 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] backdrop-blur-sm">
        <div className="h-full w-full bg-gradient-to-br from-white/10 via-transparent to-black/20 p-8 flex flex-col gap-6">
          {/* Header Mockup */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
            <div className="flex gap-2">
              <div className="h-2 w-12 bg-muted rounded-full" />
              <div className="h-2 w-8 bg-muted rounded-full" />
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            {/* Testimonial Card 1 */}
            <div className="group relative w-1/2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                  <Image
                    src="/testimonials/avatar1.png"
                    alt="Marcus Chen"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">Marcus Chen</h4>
                  <p className="text-[10px] text-muted-foreground">The Fade Lab</p>
                </div>
              </div>
              <p className="text-xs text-foreground/80 italic leading-relaxed mb-3">
                "Clipper & Co transformed how I run my shop. No more missed calls or double bookings."
              </p>
              <div className="flex gap-0.5 text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="group relative w-1/2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-secondary/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-secondary/20">
                  <Image
                    src="/testimonials/avatar2.png"
                    alt="Sarah Jenkins"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">Sarah Jenkins</h4>
                  <p className="text-[10px] text-muted-foreground">Velvet Hair Lab</p>
                </div>
              </div>
              <p className="text-xs text-foreground/80 italic leading-relaxed mb-3">
                "Simple, sleek, and my clients love it. The automated reminders are a game changer."
              </p>
              <div className="flex gap-0.5 text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Card Mockup */}
          <div className="flex-1 bg-white/60 dark:bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-6 flex flex-col justify-center items-center text-center shadow-lg">
            <Quote className="text-primary/60 mb-3" size={32} />
            <h3 className="text-lg font-bold text-foreground mb-1">Join 500+ Top Shops</h3>
            <p className="text-sm text-foreground/70 max-w-[280px]">
              The only platform built specifically for the modern barbering industry.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Blur Blobs */}
      <div className="absolute -top-12 -right-12 h-64 w-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
      <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-secondary/20 rounded-full blur-[80px] -z-10" />
    </div>
  );
}

