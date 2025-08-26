import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Award, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <div className="text-6xl mb-6">🏛️</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Bella Vista</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Where culinary artistry meets warm hospitality, creating unforgettable dining experiences since 2020
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  Founded in 2020 with a passion for exceptional cuisine and warm hospitality, 
                  Bella Vista has become a beloved destination for food enthusiasts seeking an 
                  extraordinary dining experience.
                </p>
                <p>
                  Our journey began with a simple vision: to create a place where every meal 
                  is a celebration, every dish tells a story, and every guest feels like family. 
                  We combine traditional cooking techniques with modern culinary innovations to 
                  bring you flavors that delight and surprise.
                </p>
                <p>
                  From our carefully sourced ingredients to our meticulously crafted recipes, 
                  every detail at Bella Vista reflects our commitment to excellence and our 
                  love for the culinary arts.
                </p>
              </div>
            </div>
            <div className="lg:order-first">
              <div className="h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center">
                <span className="text-8xl">🍽️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Vision & Mission</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Vision</h3>
              <p className="text-gray-600 text-lg">
                To be the premier dining destination that brings people together through 
                exceptional food, creating lasting memories and fostering a sense of community 
                in every meal we serve.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                We are dedicated to providing an extraordinary culinary experience through 
                innovative dishes, impeccable service, and a welcoming atmosphere that makes 
                every guest feel valued and special.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide everything we do, from the kitchen to your table
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Heart className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Passion</h3>
              <p className="text-gray-600">
                Every dish is prepared with love and dedication to culinary excellence
              </p>
            </div>

            <div className="text-center">
              <Award className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Quality</h3>
              <p className="text-gray-600">
                We use only the finest, freshest ingredients to ensure exceptional taste
              </p>
            </div>

            <div className="text-center">
              <Users className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">
                Building connections and creating a warm, welcoming space for all
              </p>
            </div>

            <div className="text-center">
              <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                Continuously striving to exceed expectations in every aspect of service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chef's Message */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
              <span className="text-8xl">👨‍🍳</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">From Our Chef</h2>
              <blockquote className="text-lg text-gray-600 mb-6 italic">
                "Cooking is not just about feeding the body; it's about nourishing the soul. 
                At Bella Vista, every dish is crafted with the intention to create joy, 
                spark conversation, and bring people closer together. Food has the power 
                to transcend boundaries and create lasting connections."
              </blockquote>
              <div className="border-l-4 border-orange-600 pl-4">
                <p className="font-semibold text-gray-900">Chef Marco Rodriguez</p>
                <p className="text-gray-600">Executive Chef & Co-Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get In Touch</h2>
          <p className="text-xl mb-8 opacity-90">
            Have questions about our story or want to learn more? We'd love to hear from you!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <p className="font-semibold">Call Us</p>
              <p className="opacity-90">+1 (555) 123-4567</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📧</div>
              <p className="font-semibold">Email Us</p>
              <p className="opacity-90">info@bellavista.com</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💬</div>
              <p className="font-semibold">WhatsApp</p>
              <p className="opacity-90">Quick & Easy</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            onClick={() => window.open('https://wa.me/15551234567?text=Hello%20Bella%20Vista!%20I%27d%20like%20to%20know%20more%20about%20your%20restaurant.', '_blank')}
          >
            💬 WhatsApp Us
          </Button>
        </div>
      </section>
    </div>
  );
}