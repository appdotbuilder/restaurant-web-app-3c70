import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Phone, Star } from 'lucide-react';

interface HomePageProps {
  onNavigate?: (page: 'home' | 'menu' | 'about' | 'ordering' | 'reservation' | 'contact' | 'testimonials') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🍽️</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to Bella Vista
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Experience culinary excellence with a touch of elegance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => onNavigate?.('menu')}
            >
              View Our Menu
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-3"
              onClick={() => onNavigate?.('reservation')}
            >
              Make Reservation
            </Button>
          </div>
        </div>
      </section>

      {/* Restaurant Info Cards */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Opening Hours */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Opening Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Mon - Thu:</span> 11:00 AM - 10:00 PM</p>
                <p><span className="font-medium">Fri - Sat:</span> 11:00 AM - 11:00 PM</p>
                <p><span className="font-medium">Sunday:</span> 12:00 PM - 9:00 PM</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Location</h3>
              <div className="text-gray-600">
                <p className="font-medium">123 Food Street</p>
                <p>Cuisine City, FC 12345</p>
                <p className="mt-2">Easy parking available</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Phone:</span> +1 (555) 123-4567</p>
                <p><span className="font-medium">Email:</span> info@bellavista.com</p>
                <Button 
                  className="mt-3 bg-green-600 hover:bg-green-700"
                  onClick={() => window.open('https://wa.me/15551234567', '_blank')}
                >
                  WhatsApp Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="px-4 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Why Choose Bella Vista?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-2">Expert Chefs</h3>
              <p className="text-gray-600">Our experienced chefs craft each dish with passion and precision.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🥘</div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">We use only the freshest, locally-sourced ingredients.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Cozy Atmosphere</h3>
              <p className="text-gray-600">Enjoy your meal in our warm and welcoming environment.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">5-Star Service</h3>
              <p className="text-gray-600">Our attentive staff ensures an exceptional dining experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes Preview */}
      <section className="px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Signature Dishes</h2>
          <p className="text-xl text-gray-600">A taste of what awaits you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
              <span className="text-6xl">🍝</span>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Truffle Pasta</h3>
              <p className="text-gray-600 mb-3">Fresh homemade pasta with truffle cream sauce</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">$24.99</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">4.9</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center">
              <span className="text-6xl">🥩</span>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Grilled Ribeye</h3>
              <p className="text-gray-600 mb-3">Premium ribeye steak with seasonal vegetables</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">$34.99</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">4.8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
              <span className="text-6xl">🐟</span>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">Grilled Salmon</h3>
              <p className="text-gray-600 mb-3">Atlantic salmon with lemon herb butter</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">$28.99</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">4.7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3"
            onClick={() => onNavigate?.('menu')}
          >
            View Full Menu
          </Button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-orange-600 text-white py-16">
        <div className="px-4 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Dine with Us?</h2>
          <p className="text-xl mb-8 opacity-90">
            Reserve your table now or order online for pickup and delivery
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => onNavigate?.('reservation')}
            >
              Make Reservation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-3"
              onClick={() => onNavigate?.('ordering')}
            >
              Order Online
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}