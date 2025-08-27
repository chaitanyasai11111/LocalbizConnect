import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import BusinessCard from "@/components/business-card";
import CategoryFilter from "@/components/category-filter";
import SearchBar from "@/components/search-bar";
import type { BusinessSummary, Category } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "name">("newest");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: businesses = [], isLoading } = useQuery<BusinessSummary[]>({
    queryKey: ["/api/businesses", { 
      search: searchQuery, 
      categoryId: selectedCategory, 
      sortBy 
    }],
    enabled: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6 text-center">
            Find Local Businesses Near You
          </h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </section>

      {/* Business Listings */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {searchQuery ? `Search results for "${searchQuery}"` : "Local Businesses"}
              </h2>
              <p className="text-muted-foreground">
                Found {businesses.length} businesses
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Select value={sortBy} onValueChange={(value: "newest" | "rating" | "name") => setSortBy(value)}>
                <SelectTrigger className="w-[180px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="rating">Sort by: Rating</SelectItem>
                  <SelectItem value="name">Sort by: Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {businesses.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms or browse by category"
                  : "Be the first to add a business in this area!"
                }
              </p>
              <Button data-testid="button-add-first-business">
                Add a Business
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map placeholder */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Explore on Map</h2>
          
          <Card className="overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-xl text-blue-600 font-semibold">Interactive Map View</p>
                <p className="text-blue-500 mt-2">Map integration coming soon</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
