import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Star, Phone, Clock, Heart, Hammer, Coffee, Shirt, Utensils, Wrench, ShoppingBasket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category, BusinessSummary } from "@shared/schema";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: businesses = [] } = useQuery<BusinessSummary[]>({
    queryKey: ["/api/businesses"],
  });

  const categoryIcons: Record<string, any> = {
    'hair-salons': Hammer,
    'repair-services': Wrench,
    'tailors': Shirt,
    'street-food': Utensils,
    'hardware': Wrench,
    'groceries': ShoppingBasket,
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary text-2xl" />
              <span className="text-2xl font-bold text-primary">LocalFind</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#discover" className="text-foreground hover:text-primary transition-colors">Discover</a>
              <a href="#categories" className="text-foreground hover:text-primary transition-colors">Categories</a>
              <a href="#add-business" className="text-foreground hover:text-primary transition-colors">Add Business</a>
              <Button
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signin"
              >
                Sign In
              </Button>
            </div>

            <Button variant="ghost" className="md:hidden">
              <span className="sr-only">Menu</span>
              ☰
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Discover Hidden <span className="text-secondary">Local Gems</span>
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Find authentic local businesses that aren't on the map yet. From street vendors to neighborhood tailors, discover your community's best-kept secrets.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="What are you looking for? (e.g., shoe repair, tailor, tea stall)"
                    className="pl-12 py-4 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-business"
                  />
                </div>
                
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Near (location or 'use my location')"
                    className="pl-12 py-4 text-lg"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    data-testid="input-search-location"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    data-testid="button-use-location"
                  >
                    🎯
                  </Button>
                </div>
                
                <Button
                  className="bg-secondary text-secondary-foreground px-8 py-4 hover:opacity-90 text-lg"
                  data-testid="button-search"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Local Businesses
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => {
              const Icon = categoryIcons[category.slug] || Coffee;
              return (
                <Card
                  key={category.id}
                  className="p-6 text-center hover:border-primary hover:bg-accent cursor-pointer group transition-all hover:scale-105"
                  data-testid={`card-category-${category.slug}`}
                >
                  <Icon className="w-12 h-12 text-primary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-card-foreground">{category.name}</p>
                  <p className="text-sm text-muted-foreground">See businesses</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recently Added Businesses</h2>
              <p className="text-muted-foreground">Hidden gems discovered by your neighbors</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.slice(0, 6).map((business) => (
              <Card
                key={business.id}
                className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                data-testid={`card-business-${business.id}`}
              >
                {business.imageUrl && (
                  <img
                    src={business.imageUrl}
                    alt={business.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-card-foreground mb-1" data-testid={`text-business-name-${business.id}`}>
                        {business.name}
                      </h3>
                      <Badge variant="secondary" data-testid={`badge-category-${business.id}`}>
                        {business.category.name}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <StarRating rating={Math.round(Number(business.averageRating))} />
                      <p className="text-sm text-muted-foreground" data-testid={`text-rating-${business.id}`}>
                        {Number(business.averageRating).toFixed(1)} ({business.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                  
                  {business.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`text-description-${business.id}`}>
                      {business.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span data-testid={`text-address-${business.id}`}>{business.address}</span>
                    </div>
                    {business.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2 text-primary" />
                        <span data-testid={`text-phone-${business.id}`}>{business.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      <span>Open now</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid={`button-view-details-${business.id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      data-testid={`button-favorite-${business.id}`}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-load-more"
            >
              <span className="mr-2">+</span>
              Load More Businesses
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-secondary to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-secondary-foreground mb-6">Own a Local Business?</h2>
          <p className="text-xl text-secondary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get discovered by your neighbors! Add your business to our platform and connect with local customers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="bg-card text-card-foreground px-8 py-4 text-lg font-semibold hover:opacity-90"
              data-testid="button-add-business"
            >
              <span className="mr-2">+</span>
              Add Your Business
            </Button>
            <Button
              variant="outline"
              className="border-2 border-secondary-foreground text-secondary-foreground px-8 py-4 text-lg font-semibold hover:bg-secondary-foreground hover:text-secondary"
              data-testid="button-learn-more"
            >
              ℹ Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-primary text-2xl" />
                <span className="text-2xl font-bold text-primary">LocalFind</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Connecting communities with hidden local businesses. Discover, review, and support your neighborhood gems.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Discover</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Browse Categories</a></li>
                <li><a href="#" className="hover:text-primary">Near Me</a></li>
                <li><a href="#" className="hover:text-primary">Top Rated</a></li>
                <li><a href="#" className="hover:text-primary">Recently Added</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Business</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Add Your Business</a></li>
                <li><a href="#" className="hover:text-primary">Business Resources</a></li>
                <li><a href="#" className="hover:text-primary">Advertise</a></li>
                <li><a href="#" className="hover:text-primary">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 LocalFind. All rights reserved. Built with ❤️ for local communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
