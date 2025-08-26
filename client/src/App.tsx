import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Menu, X } from 'lucide-react';

// Import pages
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import AboutPage from './components/AboutPage';
import OrderingPage from './components/OrderingPage';
import ReservationPage from './components/ReservationPage';
import ContactPage from './components/ContactPage';
import TestimonialsPage from './components/TestimonialsPage';

type PageType = 'home' | 'menu' | 'about' | 'ordering' | 'reservation' | 'contact' | 'testimonials';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
      case 'menu': return <MenuPage />;
      case 'about': return <AboutPage />;
      case 'ordering': return <OrderingPage />;
      case 'reservation': return <ReservationPage />;
      case 'contact': return <ContactPage onNavigate={setCurrentPage} />;
      case 'testimonials': return <TestimonialsPage />;
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const navigationItems = [
    { key: 'home' as PageType, label: 'Home' },
    { key: 'menu' as PageType, label: 'Menu' },
    { key: 'about' as PageType, label: 'About Us' },
    { key: 'ordering' as PageType, label: 'Online Ordering' },
    { key: 'reservation' as PageType, label: 'Table Reservation' },
    { key: 'contact' as PageType, label: 'Contact' },
    { key: 'testimonials' as PageType, label: 'Testimonials' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">🍽️ Bella Vista</div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.key}
                    variant={currentPage === item.key ? "default" : "ghost"}
                    onClick={() => setCurrentPage(item.key)}
                    className={currentPage === item.key ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-100"}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigationItems.map((item) => (
                  <Button
                    key={item.key}
                    variant={currentPage === item.key ? "default" : "ghost"}
                    onClick={() => {
                      setCurrentPage(item.key);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start ${
                      currentPage === item.key ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-100"
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="min-h-screen">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-orange-400 mb-4">🍽️ Bella Vista</div>
              <p className="text-gray-300">
                Serving delicious food with love and passion since 2020.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-300">
                <p>📞 +1 (555) 123-4567</p>
                <p>📧 info@bellavista.com</p>
                <p>📍 123 Food Street, Cuisine City, FC 12345</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Opening Hours</h3>
              <div className="space-y-2 text-gray-300">
                <p>Mon - Thu: 11:00 AM - 10:00 PM</p>
                <p>Fri - Sat: 11:00 AM - 11:00 PM</p>
                <p>Sunday: 12:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>&copy; 2024 Bella Vista Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;