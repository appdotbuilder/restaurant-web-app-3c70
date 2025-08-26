import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { trpc } from '@/utils/trpc';
import { CalendarIcon, Clock, Users, Phone, User, CheckCircle, Loader2 } from 'lucide-react';

import type { CreateReservationInput } from '../../../server/src/schema';

export default function ReservationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<Omit<CreateReservationInput, 'date'>>({
    customer_name: '',
    customer_phone: '',
    number_of_people: 1,
    time: ''
  });

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.customer_name || !formData.customer_phone || !formData.time) {
      return;
    }

    setIsSubmitting(true);
    try {
      const reservationData: CreateReservationInput = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        number_of_people: formData.number_of_people,
        date: selectedDate.toISOString().split('T')[0],
        time: formData.time
      };

      await trpc.createReservation.mutate(reservationData);
      setReservationSuccess(true);

      // Generate WhatsApp message
      const formattedDate = selectedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const whatsappMessage = `New Reservation Request\n\nName: ${formData.customer_name}\nPhone: ${formData.customer_phone}\nDate: ${formattedDate}\nTime: ${formData.time}\nParty Size: ${formData.number_of_people} ${formData.number_of_people === 1 ? 'person' : 'people'}\n\nPlease confirm availability.`;
      
      // Open WhatsApp
      window.open(`https://wa.me/15551234567?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        number_of_people: 1,
        time: ''
      });
      setSelectedDate(undefined);
      
      setTimeout(() => setReservationSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to create reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Table Reservation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book your table at Bella Vista and enjoy an unforgettable dining experience
          </p>
        </div>

        {/* Success Message */}
        {reservationSuccess && (
          <div className="mb-8 p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Reservation Request Submitted!</h3>
              <p>WhatsApp has been opened to complete your reservation. We'll confirm availability shortly.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reservation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Make a Reservation</CardTitle>
              <CardDescription>
                Fill out the form below to request a table reservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="customer_name"
                    type="text"
                    value={formData.customer_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: typeof formData) => ({ ...prev, customer_name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="customer_phone" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: typeof formData) => ({ ...prev, customer_phone: e.target.value }))
                    }
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                {/* Number of People */}
                <div className="space-y-2">
                  <Label htmlFor="number_of_people" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Party Size
                  </Label>
                  <Input
                    id="number_of_people"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.number_of_people}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: typeof formData) => ({ ...prev, number_of_people: parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Preferred Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Preferred Time
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={formData.time === time ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setFormData((prev: typeof formData) => ({ ...prev, time }))}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3"
                  disabled={isSubmitting || !selectedDate || !formData.customer_name || !formData.customer_phone || !formData.time}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Reservation...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Reserve Table via WhatsApp
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Restaurant Info & Guidelines */}
          <div className="space-y-6">
            {/* Restaurant Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Restaurant Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Thursday:</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Friday - Saturday:</span>
                  <span>11:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday:</span>
                  <span>12:00 PM - 9:00 PM</span>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Reservation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Reservations are recommended, especially for dinner service and weekends.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Tables are held for 15 minutes past the reservation time.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>For parties of 8 or more, please call us directly to ensure proper seating arrangements.</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Cancellations can be made up to 2 hours before your reservation time.</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Have questions about your reservation or need to make changes?
                  </p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open('tel:+15551234567')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call: +1 (555) 123-4567
                    </Button>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => window.open('https://wa.me/15551234567?text=Hi%20Bella%20Vista!%20I%20have%20a%20question%20about%20reservations.', '_blank')}
                    >
                      💬 WhatsApp Us
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}