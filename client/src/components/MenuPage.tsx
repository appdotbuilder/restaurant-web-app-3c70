import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { Loader2, Star } from 'lucide-react';
import type { MenuItem } from '../../../server/src/schema';

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

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('food');

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

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const getPlaceholderImage = (category: CategoryType, index: number) => {
    const colors = ['orange', 'red', 'blue', 'green', 'purple', 'pink'];
    const color = colors[index % colors.length];
    return (
      <div className={`h-48 bg-gradient-to-br from-${color}-200 to-${color}-300 flex items-center justify-center`}>
        <span className="text-6xl">{categoryEmojis[category]}</span>
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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Menu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients
          </p>
        </div>

        {/* Category Tabs */}
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
            <MenuItemsGrid items={filteredItems} category="food" getPlaceholderImage={getPlaceholderImage} />
          </TabsContent>
          
          <TabsContent value="drinks">
            <MenuItemsGrid items={filteredItems} category="drinks" getPlaceholderImage={getPlaceholderImage} />
          </TabsContent>
          
          <TabsContent value="packages">
            <MenuItemsGrid items={filteredItems} category="packages" getPlaceholderImage={getPlaceholderImage} />
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
  getPlaceholderImage: (category: CategoryType, index: number) => React.JSX.Element;
}

function MenuItemsGrid({ items, category, getPlaceholderImage }: MenuItemsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item: MenuItem, index: number) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          {/* Image */}
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="h-48 w-full object-cover"
            />
          ) : (
            getPlaceholderImage(category, index)
          )}
          
          {/* Content */}
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {item.name}
              </h3>
              <Badge variant="secondary" className="ml-2">
                {categoryNames[item.category]}
              </Badge>
            </div>
            
            {item.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">
                ${item.price.toFixed(2)}
              </span>
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm text-gray-600">
                  {(Math.random() * 1 + 4).toFixed(1)}
                </span>
              </div>
            </div>
            
            <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
              Add to Order
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}