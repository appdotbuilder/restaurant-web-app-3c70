import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { trpc } from '@/utils/trpc';
import { ShoppingCart, Plus, Minus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import type { MenuItem, CreateOrderInput } from '../../../server/src/schema';

interface CartItem extends MenuItem {
  quantity: number;
}

type CategoryType = 'food' | 'drinks' | 'packages';

const categoryEmojis = {
  food: '🍽️',
  drinks: '🥤',
  packages: '📦'
};

const categoryNames = {
  food: 'Food',
  drinks: 'Drinks',
  packages: 'Packages'
};

// Sample data for demonstration (since backend handlers are stubs)
const sampleMenuItems: MenuItem[] = [
  // Food Items
  { id: 1, name: "Truffle Risotto", description: "Creamy arborio rice with black truffle, parmesan, and fresh herbs", category: "food" as const, price: 28.99, image_url: null, created_at: new Date() },
  { id: 2, name: "Grilled Salmon", description: "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables", category: "food" as const, price: 32.99, image_url: null, created_at: new Date() },
  { id: 3, name: "Beef Tenderloin", description: "Prime beef tenderloin with red wine reduction and roasted potatoes", category: "food" as const, price: 45.99, image_url: null, created_at: new Date() },
  { id: 4, name: "Margherita Pizza", description: "Traditional pizza with fresh mozzarella, basil, and San Marzano tomatoes", category: "food" as const, price: 18.99, image_url: null, created_at: new Date() },
  { id: 5, name: "Caesar Salad", description: "Crisp romaine lettuce with house-made Caesar dressing and croutons", category: "food" as const, price: 14.99, image_url: null, created_at: new Date() },
  { id: 6, name: "Lobster Ravioli", description: "House-made ravioli filled with lobster meat in a light cream sauce", category: "food" as const, price: 36.99, image_url: null, created_at: new Date() },

  // Drinks
  { id: 7, name: "House Red Wine", description: "Carefully selected red wine blend with rich, full-bodied flavor", category: "drinks" as const, price: 12.99, image_url: null, created_at: new Date() },
  { id: 8, name: "Craft Beer Selection", description: "Rotating selection of local and international craft beers", category: "drinks" as const, price: 7.99, image_url: null, created_at: new Date() },
  { id: 9, name: "Fresh Lemonade", description: "House-made lemonade with fresh lemons and mint", category: "drinks" as const, price: 5.99, image_url: null, created_at: new Date() },
  { id: 10, name: "Espresso Martini", description: "Premium vodka, fresh espresso, and coffee liqueur", category: "drinks" as const, price: 14.99, image_url: null, created_at: new Date() },
  { id: 11, name: "Champagne Cocktail", description: "Classic cocktail with champagne, sugar cube, and bitters", category: "drinks" as const, price: 16.99, image_url: null, created_at: new Date() },

  // Packages
  { id: 12, name: "Date Night Package", description: "Three-course meal for two with a bottle of wine and dessert", category: "packages" as const, price: 89.99, image_url: null, created_at: new Date() },
  { id: 13, name: "Family Feast", description: "Complete meal for four with appetizers, mains, sides, and dessert", category: "packages" as const, price: 129.99, image_url: null, created_at: new Date() },
  { id: 14, name: "Business Lunch", description: "Quick two-course lunch with coffee or tea, perfect for business meetings", category: "packages" as const, price: 24.99, image_url: null, created_at: new Date() },
  { id: 15, name: "Chef's Tasting Menu", description: "Five-course tasting menu featuring seasonal specialties", category: "packages" as const, price: 75.99, image_url: null, created_at: new Date() }
];

export default function OrderingPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('food');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });

  const loadMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await trpc.getMenuItems.query();
      // Use sample data if API returns empty (since handlers are stubs)
      setMenuItems(items.length > 0 ? items : sampleMenuItems);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      // Use sample data as fallback
      setMenuItems(sampleMenuItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  const addToCart = (item: MenuItem) => {
    setCartItems((prev: CartItem[]) => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev: CartItem[]) => prev.filter(item => item.id !== id));
    } else {
      setCartItems((prev: CartItem[]) =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev: CartItem[]) => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0 || !customerInfo.name || !customerInfo.phone) {
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData: CreateOrderInput = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        })),
        total_amount: getTotalPrice()
      };

      await trpc.createOrder.mutate(orderData);
      setOrderSuccess(true);
      
      // Generate WhatsApp message
      const orderText = cartItems.map(item => 
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');
      
      const whatsappMessage = `New Order from ${customerInfo.name}\nPhone: ${customerInfo.phone}\n\nOrder Details:\n${orderText}\n\nTotal: $${getTotalPrice().toFixed(2)}`;
      
      // Open WhatsApp
      window.open(`https://wa.me/15551234567?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      
      // Reset form
      setCartItems([]);
      setCustomerInfo({ name: '', phone: '' });
      
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const getPlaceholderImage = (category: CategoryType, index: number) => {
    const colors = ['orange', 'red', 'blue', 'green', 'purple', 'pink'];
    const color = colors[index % colors.length];
    return (
      <div className={`h-40 bg-gradient-to-br from-${color}-200 to-${color}-300 flex items-center justify-center`}>
        <span className="text-4xl">{categoryEmojis[category]}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cart */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Online Ordering
            </h1>
            <p className="text-xl text-gray-600">
              Select your favorite dishes and place your order
            </p>
          </div>

          {/* Shopping Cart Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="relative bg-orange-600 hover:bg-orange-700 text-lg px-6 py-3">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({getTotalItems()})
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Your Order</SheetTitle>
                <SheetDescription>
                  Review your items and complete your order
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cartItems.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold mb-4">
                        <span>Total:</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-4 mb-4">
                        <div>
                          <Label htmlFor="customer-name">Your Name</Label>
                          <Input
                            id="customer-name"
                            value={customerInfo.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setCustomerInfo((prev: typeof customerInfo) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer-phone">Phone Number</Label>
                          <Input
                            id="customer-phone"
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setCustomerInfo((prev: typeof customerInfo) => ({ ...prev, phone: e.target.value }))
                            }
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                      </div>

                      {/* Order Button */}
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting || !customerInfo.name || !customerInfo.phone}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order via WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Success Message */}
        {orderSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Order placed successfully! WhatsApp has been opened to complete your order.
          </div>
        )}

        {/* Menu Categories */}
        <Tabs value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value as CategoryType)}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="food" className="text-lg">
              {categoryEmojis.food} {categoryNames.food}
            </TabsTrigger>
            <TabsTrigger value="drinks" className="text-lg">
              {categoryEmojis.drinks} {categoryNames.drinks}
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-lg">
              {categoryEmojis.packages} {categoryNames.packages}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food">
            <MenuItemsGrid items={filteredItems} category="food" onAddToCart={addToCart} getPlaceholderImage={getPlaceholderImage} />
          </TabsContent>
          
          <TabsContent value="drinks">
            <MenuItemsGrid items={filteredItems} category="drinks" onAddToCart={addToCart} getPlaceholderImage={getPlaceholderImage} />
          </TabsContent>
          
          <TabsContent value="packages">
            <MenuItemsGrid items={filteredItems} category="packages" onAddToCart={addToCart} getPlaceholderImage={getPlaceholderImage} />
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryEmojis[selectedCategory]}</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No {categoryNames[selectedCategory].toLowerCase()} items available
            </h3>
            <p className="text-gray-600">
              Check back soon for new additions to our menu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface MenuItemsGridProps {
  items: MenuItem[];
  category: CategoryType;
  onAddToCart: (item: MenuItem) => void;
  getPlaceholderImage: (category: CategoryType, index: number) => React.JSX.Element;
}

function MenuItemsGrid({ items, category, onAddToCart, getPlaceholderImage }: MenuItemsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item: MenuItem, index: number) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
          {/* Image */}
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="h-40 w-full object-cover"
            />
          ) : (
            getPlaceholderImage(category, index)
          )}
          
          {/* Content */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {item.name}
              </h3>
              <Badge variant="secondary" className="ml-2 text-xs">
                {categoryNames[item.category]}
              </Badge>
            </div>
            
            {item.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-orange-600">
                ${item.price.toFixed(2)}
              </span>
            </div>
            
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => onAddToCart(item)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}