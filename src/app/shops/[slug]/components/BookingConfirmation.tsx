'use client';

import { CheckCircle, Calendar, Clock, DollarSign, User, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BookingConfirmationProps {
  organizationName: string;
  serviceName: string;
  memberName: string | null;
  selectedDate: Date;
  selectedTime: string;
  serviceDuration: number;
  servicePrice: number;
  customerName: string;
  onBookAnother: () => void;
}

export function BookingConfirmation({
  organizationName,
  serviceName,
  memberName,
  selectedDate,
  selectedTime,
  serviceDuration,
  servicePrice,
  customerName,
  onBookAnother,
}: BookingConfirmationProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Calculate start and end times
  const [hours, minutes] = selectedTime.split(':').map(Number);
  const startDate = new Date(selectedDate);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + serviceDuration);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  // Format for Google Calendar (YYYYMMDDTHHmmss)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Generate Google Calendar URL
  const googleCalendarUrl = () => {
    const title = encodeURIComponent(`${serviceName} at ${organizationName}`);
    const details = encodeURIComponent(
      `Appointment for ${serviceName}${memberName && memberName !== 'Any Available' ? ` with ${memberName}` : ''}\nPrice: ${formatPrice(servicePrice)}`
    );
    const location = encodeURIComponent(organizationName);
    const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Generate ICS file content
  const generateICS = () => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Barbershop SaaS//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${serviceName} at ${organizationName}
DESCRIPTION:Appointment for ${serviceName}${memberName && memberName !== 'Any Available' ? ` with ${memberName}` : ''}\\nPrice: ${formatPrice(servicePrice)}
LOCATION:${organizationName}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${startDate.toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-center py-6">
      {/* Success Icon */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      {/* Success Message */}
      <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
        Booking Confirmed!
      </h3>
      <p className="text-muted-foreground mb-6">
        Thank you, {customerName}! Your appointment has been booked.
      </p>

      {/* Booking Details */}
      <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(selectedDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{selectedTime} - {endTime}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Service</p>
            <p className="font-medium">{serviceName}</p>
            {memberName && memberName !== 'Any Available' && (
              <p className="text-sm text-muted-foreground">with {memberName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">{formatPrice(servicePrice)}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <p className="text-sm text-muted-foreground mb-6">
        at <span className="font-medium text-foreground">{organizationName}</span>
      </p>

      {/* Actions */}
      <div className="space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem asChild>
              <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
                Google Calendar
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={generateICS}>
              Apple Calendar / Outlook (.ics)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onBookAnother} variant="outline" className="w-full">
          Book Another Appointment
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        You'll receive a confirmation message shortly.
      </p>
    </div>
  );
}
