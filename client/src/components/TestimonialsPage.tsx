import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { Star, MessageSquare, Plus, Loader2, CheckCircle } from 'lucide-react';
import type { Testimonial, CreateTestimonialInput } from '../../../server/src/schema';

// Sample data for demonstration (since backend handlers are stubs)
const sampleTestimonials: Testimonial[] = [
  { id: 1, customer_name: "Sarah Johnson", review: "Absolutely amazing dining experience! The truffle risotto was perfectly cooked and the service was exceptional. Will definitely be coming back!", rating: 5, date: new Date('2024-01-15'), created_at: new Date('2024-01-15') },
  { id: 2, customer_name: "Michael Chen", review: "Great food and atmosphere. The salmon was cooked to perfection and the staff was very attentive. Highly recommend this place!", rating: 5, date: new Date('2024-01-10'), created_at: new Date('2024-01-10') },
  { id: 3, customer_name: "Emma Davis", review: "Lovely restaurant with delicious food. The beef tenderloin was outstanding and the wine selection is excellent. Perfect for special occasions.", rating: 4, date: new Date('2024-01-08'), created_at: new Date('2024-01-08') },
  { id: 4, customer_name: "James Wilson", review: "Had a wonderful dinner here with my family. The service was friendly and the food was fresh and flavorful. The kids loved the pizza!", rating: 5, date: new Date('2024-01-05'), created_at: new Date('2024-01-05') },
  { id: 5, customer_name: "Lisa Thompson", review: "Beautiful ambiance and fantastic food. The lobster ravioli was incredible. A bit pricey but worth it for the quality.", rating: 4, date: new Date('2024-01-03'), created_at: new Date('2024-01-03') },
  { id: 6, customer_name: "David Rodriguez", review: "Great place for a date night! The staff was professional and the food was delicious. The champagne cocktail was a nice touch.", rating: 5, date: new Date('2023-12-28'), created_at: new Date('2023-12-28') },
  { id: 7, customer_name: "Amanda White", review: "Really enjoyed our business lunch here. The service was quick and efficient, and the food was excellent quality. Will book again.", rating: 4, date: new Date('2023-12-20'), created_at: new Date('2023-12-20') },
  { id: 8, customer_name: "Robert Brown", review: "The chef's tasting menu was an incredible journey of flavors. Each course was beautifully presented and tasted amazing. Five stars!", rating: 5, date: new Date('2023-12-18'), created_at: new Date('2023-12-18') }
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateTestimonialInput, 'date'>>({
    customer_name: '',
    review: '',
    rating: 5
  });

  const loadTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await trpc.getTestimonials.query();
      // Use sample data if API returns empty (since handlers are stubs)
      setTestimonials(data.length > 0 ? data : sampleTestimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      // Use sample data as fallback
      setTestimonials(sampleTestimonials);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.review || formData.rating < 1 || formData.rating > 5) {
      return;
    }

    setIsSubmitting(true);
    try {
      const testimonialData: CreateTestimonialInput = {
        customer_name: formData.customer_name,
        review: formData.review,
        rating: formData.rating
      };

      const newTestimonial = await trpc.createTestimonial.mutate(testimonialData);
      setTestimonials((prev: Testimonial[]) => [newTestimonial, ...prev]);
      
      setSubmitSuccess(true);
      setFormData({
        customer_name: '',
        review: '',
        rating: 5
      });
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsDialogOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to create testimonial:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (testimonials.length === 0) return "0";
    const sum = testimonials.reduce((acc, testimonial) => acc + testimonial.rating, 0);
    return (sum / testimonials.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">💭</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Customer Testimonials
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Hear what our valued customers have to say about their experience at Bella Vista
          </p>

          {/* Overall Rating */}
          {testimonials.length > 0 && (
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-1">{getAverageRating()}</div>
                {renderStars(Math.round(parseFloat(getAverageRating())), 'lg')}
                <p className="text-sm text-gray-600 mt-1">
                  Based on {testimonials.length} {testimonials.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          )}

          {/* Add Review Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Share Your Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
                <DialogDescription>
                  Tell us about your visit to Bella Vista. Your feedback helps us improve!
                </DialogDescription>
              </DialogHeader>
              
              {submitSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">Your Name</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: typeof formData) => ({ ...prev, customer_name: e.target.value }))
                      }
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData((prev: typeof formData) => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="review">Your Review</Label>
                    <Textarea
                      id="review"
                      value={formData.review}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: typeof formData) => ({ ...prev, review: e.target.value }))
                      }
                      placeholder="Share your experience with us..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience at Bella Vista!</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Review
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial: Testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.customer_name}</h3>
                      <p className="text-sm text-gray-500">
                        {testimonial.date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={testimonial.rating >= 4 ? "default" : testimonial.rating >= 3 ? "secondary" : "destructive"}
                      className="flex items-center space-x-1"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{testimonial.rating}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                    <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                  </div>

                  <blockquote className="text-gray-700 italic">
                    "{testimonial.review}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rating Distribution (if there are testimonials) */}
        {testimonials.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Rating Distribution</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = testimonials.filter(t => t.rating === rating).length;
                    const percentage = testimonials.length > 0 ? (count / testimonials.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {count} {count === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Experience Bella Vista Today!
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our satisfied customers and discover what makes Bella Vista special. 
                Make a reservation or order online for pickup and delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Make Reservation
                </Button>
                <Button size="lg" variant="outline" className="hover:bg-orange-50">
                  Order Online
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}