'use client';

import { useState } from 'react';
import { ServiceSelect } from './ServiceSelect';
import { StaffSelect } from './StaffSelect';
import { DateTimeSelect } from './DateTimeSelect';
import { CustomerForm } from './CustomerForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Service } from '@/actions/public-booking';



interface BookingWizardProps {
  organizationId: string;
  organizationName: string;
  services: Service[];
}

type WizardStep = 'service' | 'staff' | 'datetime' | 'customer' | 'confirmation';

interface BookingData {
  serviceId: string | null;
  serviceName: string | null;
  serviceDuration: number | null;
  servicePrice: number | null;
  memberId: string | null;
  memberName: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  customerName: string | null;
  customerPhone: string | null;
  bookingId: string | null;
}

const STEPS: WizardStep[] = ['service', 'staff', 'datetime', 'customer', 'confirmation'];
const STEP_LABELS: Record<WizardStep, string> = {
  service: 'Select Service',
  staff: 'Choose Staff',
  datetime: 'Pick Date & Time',
  customer: 'Your Details',
  confirmation: 'Confirmed!',
};

export function BookingWizard({ organizationId, organizationName, services }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('service');
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: null,
    serviceName: null,
    serviceDuration: null,
    servicePrice: null,
    memberId: null,
    memberName: null,
    selectedDate: null,
    selectedTime: null,
    customerName: null,
    customerPhone: null,
    bookingId: null,
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setBookingData({
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name,
      serviceDuration: service.durationMin,
      servicePrice: service.priceCents,
      // Reset downstream selections
      memberId: null,
      memberName: null,
      selectedDate: null,
      selectedTime: null,
    });
    setCurrentStep('staff');
  };

  const handleStaffSelect = (memberId: string | null, memberName: string | null) => {
    setBookingData({
      ...bookingData,
      memberId,
      memberName,
      // Reset downstream selections
      selectedDate: null,
      selectedTime: null,
    });
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setBookingData({
      ...bookingData,
      selectedDate: date,
      selectedTime: time,
    });
    setCurrentStep('customer');
  };

  const handleCustomerSubmit = (name: string, phone: string, bookingId: string) => {
    setBookingData({
      ...bookingData,
      customerName: name,
      customerPhone: phone,
      bookingId,
    });
    setCurrentStep('confirmation');
  };

  const handleBookAnother = () => {
    setBookingData({
      serviceId: null,
      serviceName: null,
      serviceDuration: null,
      servicePrice: null,
      memberId: null,
      memberName: null,
      selectedDate: null,
      selectedTime: null,
      customerName: null,
      customerPhone: null,
      bookingId: null,
    });
    setCurrentStep('service');
  };

  return (
    <Card className="shadow-xl">
      <CardContent className="pt-6">
        {/* Progress Indicator */}
        {currentStep !== 'confirmation' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStepIndex + 1} of {STEPS.length - 1}
              </span>
              <span className="text-sm font-medium">
                {STEP_LABELS[currentStep]}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Back Button */}
        {currentStepIndex > 0 && currentStep !== 'confirmation' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-4 -ml-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}

        {/* Step Content */}
        {currentStep === 'service' && (
          <ServiceSelect
            services={services}
            onSelect={handleServiceSelect}
          />
        )}

        {currentStep === 'staff' && bookingData.serviceId && (
          <StaffSelect
            organizationId={organizationId}
            serviceId={bookingData.serviceId}
            onSelect={handleStaffSelect}
          />
        )}

        {currentStep === 'datetime' && bookingData.serviceId && (
          <DateTimeSelect
            organizationId={organizationId}
            serviceId={bookingData.serviceId}
            memberId={bookingData.memberId}
            onSelect={handleDateTimeSelect}
          />
        )}

        {currentStep === 'customer' && bookingData.serviceId && bookingData.selectedDate && bookingData.selectedTime && (
          <CustomerForm
            organizationId={organizationId}
            serviceId={bookingData.serviceId}
            memberId={bookingData.memberId}
            selectedDate={bookingData.selectedDate}
            selectedTime={bookingData.selectedTime}
            onSubmit={handleCustomerSubmit}
          />
        )}

        {currentStep === 'confirmation' && bookingData.bookingId && (
          <BookingConfirmation
            organizationName={organizationName}
            serviceName={bookingData.serviceName!}
            memberName={bookingData.memberName}
            selectedDate={bookingData.selectedDate!}
            selectedTime={bookingData.selectedTime!}
            serviceDuration={bookingData.serviceDuration!}
            servicePrice={bookingData.servicePrice!}
            customerName={bookingData.customerName!}
            onBookAnother={handleBookAnother}
          />
        )}
      </CardContent>
    </Card>
  );
}
