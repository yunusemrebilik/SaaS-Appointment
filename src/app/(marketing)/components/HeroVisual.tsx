import Image from 'next/image';
import { Sparkles, TrendingUp, Users, CalendarClock, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HeroVisual() {
  return (
    <div className="relative w-full flex-1 basis-[min(100%,550px)] flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Decorative Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[120%] rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[100px] -z-10" />

      {/* Main Dashboard Mockup Card */}
      <Card className="bg-background/80 backdrop-blur-xl border-border/50 overflow-hidden shadow-2xl relative w-full rounded-2xl sm:rounded-[2rem] flex flex-col h-full transform transition-all hover:scale-[1.01] duration-500">

        {/* Mock Topbar */}
        <div className="border-b border-border/50 bg-muted/20 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">The Fade Lab</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex bg-background/50 text-[10px]">Pro Plan</Badge>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
              <Image src="/testimonials/avatar1.png" alt="User" width={32} height={32} className="object-cover" />
            </div>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 flex flex-col gap-6 flex-1 bg-gradient-to-b from-transparent to-muted/10">

          {/* Mock Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-background/60 border-border/50 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Today's Revenue</p>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">$420.00</div>
                <p className="text-[9px] sm:text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-2 w-2" /> +12% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/60 border-border/50 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Appointments</p>
                  <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">14</div>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                  3 slots remaining
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/60 border-border/50 shadow-sm hidden lg:block">
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-medium text-muted-foreground">New Clients</p>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">4</div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Joined this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments List Mock */}
          <Card className="flex-1 bg-background/60 border-border/50 shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Upcoming Next</CardTitle>
                  <CardDescription className="text-xs">Your immediate schedule</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 text-sm">

                {/* Appointment 1 */}
                <div className="flex items-center justify-between p-4 bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">Skin Fade & Beard</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-medium text-foreground/80">Alex M.</span> • 45 mins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-xs sm:text-sm">10:00 AM</p>
                    <Badge variant="outline" className="mt-1 text-[9px] sm:text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</Badge>
                  </div>
                </div>

                {/* Appointment 2 */}
                <div className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-muted rounded-full"></div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">Classic Scissor Cut</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-medium text-foreground/80">David S.</span> • 30 mins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-muted-foreground text-xs sm:text-sm">11:00 AM</p>
                    <Badge variant="secondary" className="mt-1 text-[9px] sm:text-[10px]">Pending</Badge>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
