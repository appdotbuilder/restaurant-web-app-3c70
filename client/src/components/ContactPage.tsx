import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (page: 'home' | 'menu' | 'about' | 'ordering' | 'reservation' | 'contact' | 'testimonials') => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📍</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact & Location
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visit us, call us, or connect with us on social media. We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Main Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                <CardDescription>
                  Reach out to us for reservations, inquiries, or just to say hello!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open('tel:+15551234567')}
                    >
                      Call Now
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@bellavista.com</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open('mailto:info@bellavista.com')}
                    >
                      Send Email
                    </Button>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">Quick responses guaranteed</p>
                    <Button 
                      size="sm" 
                      className="mt-2 bg-green-600 hover:bg-green-700"
                      onClick={() => window.open('https://wa.me/15551234567?text=Hello%20Bella%20Vista!', '_blank')}
                    >
                      💬 Chat with Us
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address & Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">
                    123 Food Street<br />
                    Cuisine City, FC 12345<br />
                    United States
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open('https://maps.google.com/?q=123+Food+Street,+Cuisine+City,+FC+12345', '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Opening Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Mon - Thu:</span>
                      <span className="text-gray-600">11:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fri - Sat:</span>
                      <span className="text-gray-600">11:00 AM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span className="text-gray-600">12:00 PM - 9:00 PM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  Stay connected and see what's happening at Bella Vista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-pink-50 hover:border-pink-300"
                    onClick={() => window.open('https://instagram.com/bellavista', '_blank')}
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <span className="text-sm">Instagram</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 hover:bg-black hover:text-white"
                    onClick={() => window.open('https://tiktok.com/@bellavista', '_blank')}
                  >
                    <div className="w-6 h-6 text-black flex items-center justify-center font-bold">
                      TT
                    </div>
                    <span className="text-sm">TikTok</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Google Maps */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
                <CardDescription>
                  Located in the heart of Cuisine City with easy parking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Embedded Google Maps */}
                <div className="relative h-96 w-full bg-gray-200 rounded-b-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder for Google Maps */}
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Bella Vista Restaurant</h3>
                      <p className="text-gray-500 mb-4">123 Food Street, Cuisine City</p>
                      <Button
                        onClick={() => window.open('https://maps.google.com/?q=123+Food+Street,+Cuisine+City,+FC+12345', '_blank')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Open in Google Maps
                      </Button>
                    </div>
                  </div>
                  
                  {/* If you want to embed actual Google Maps, replace the above with an iframe */}
                  {/* 
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  */}
                </div>
              </CardContent>
            </Card>

            {/* Parking & Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle>Parking & Accessibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Free Parking Available</p>
                    <p className="text-sm text-gray-600">Complimentary parking in our lot and street parking nearby</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Wheelchair Accessible</p>
                    <p className="text-sm text-gray-600">Full accessibility with ramp entrance and accessible restrooms</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Public Transportation</p>
                    <p className="text-sm text-gray-600">Bus stops within 2 blocks, Metro station 0.5 miles away</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 py-8 flex-col space-y-2"
                onClick={() => onNavigate?.('reservation')}
              >
                <span className="text-2xl">🍽️</span>
                <span>Make Reservation</span>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="py-8 flex-col space-y-2 hover:bg-orange-50"
                onClick={() => onNavigate?.('ordering')}
              >
                <span className="text-2xl">🛍️</span>
                <span>Order Online</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-12">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Immediate Assistance?</h3>
              <p className="text-gray-600 mb-4">
                For urgent matters, lost items, or immediate assistance, contact us directly:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.open('tel:+15551234567')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  onClick={() => window.open('https://wa.me/15551234567?text=URGENT:%20I%20need%20immediate%20assistance%20from%20Bella%20Vista', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}