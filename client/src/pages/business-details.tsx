import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Clock, Star, Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import StarRating from "@/components/star-rating";
import ReviewForm from "@/components/review-form";
import GoogleMap from "@/components/google-map";
import type { BusinessWithDetails, Review } from "@shared/schema";

export default function BusinessDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: business, isLoading, error } = useQuery<BusinessWithDetails>({
    queryKey: ["/api/businesses", id],
    enabled: !!id && isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <div className="h-64 bg-gray-200"></div>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return null;
    }

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Business not found</h3>
            <p className="text-muted-foreground mb-6">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Business not found</h3>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const userReview = business.reviews.find(review => review.userId === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Business Info */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {business.imageUrl && (
                <img
                  src={business.imageUrl}
                  alt={business.name}
                  className="w-full h-64 object-cover"
                  data-testid="img-business"
                />
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-card-foreground mb-2" data-testid="text-business-name">
                      {business.name}
                    </h1>
                    <Badge variant="secondary" data-testid="text-category">
                      {business.category.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <StarRating rating={Math.round(business.averageRating)} />
                    <p className="text-sm text-muted-foreground mt-1" data-testid="text-rating">
                      {business.averageRating.toFixed(1)} ({business.reviewCount} reviews)
                    </p>
                  </div>
                </div>

                {business.description && (
                  <p className="text-muted-foreground mb-6" data-testid="text-description">
                    {business.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <span data-testid="text-address">{business.address}</span>
                  </div>
                  {business.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-primary" />
                      <span data-testid="text-phone">{business.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    <span>Open now</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button data-testid="button-call">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" data-testid="button-save">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reviews ({business.reviewCount})</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(business.averageRating)} />
                    <span className="text-sm text-muted-foreground">
                      {business.averageRating.toFixed(1)} average
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!userReview && (
                  <>
                    <ReviewForm businessId={business.id} />
                    <Separator className="my-6" />
                  </>
                )}

                <div className="space-y-6">
                  {business.reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet. Be the first to review this business!
                    </p>
                  ) : (
                    business.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {review.user.profileImageUrl ? (
                              <img
                                src={review.user.profileImageUrl}
                                alt={review.user.firstName || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                {(review.user.firstName?.[0] || review.user.email?.[0] || "U").toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold" data-testid={`text-reviewer-${review.id}`}>
                                {review.user.firstName || review.user.email?.split('@')[0] || "Anonymous"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground" data-testid={`text-review-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  data-testid="button-get-directions"
                  onClick={() => {
                    if (business.latitude && business.longitude) {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank');
                    } else {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`, '_blank');
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-share">
                  Share Business
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-report">
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Map */}
            {business.latitude && business.longitude && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <GoogleMap 
                    businesses={[business]}
                    center={{ lat: business.latitude, lng: business.longitude }}
                    zoom={15}
                    height="300px"
                  />
                </CardContent>
              </Card>
            )}

            {/* Similar Businesses */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Similar Businesses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Similar businesses in the {business.category.name} category will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
