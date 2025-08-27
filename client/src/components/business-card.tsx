import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Heart } from "lucide-react";
import { Link } from "wouter";
import StarRating from "./star-rating";
import type { BusinessSummary } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessSummary;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1" data-testid={`card-business-${business.id}`}>
      {business.imageUrl && (
        <img
          src={business.imageUrl}
          alt={business.name}
          className="w-full h-48 object-cover"
          data-testid={`img-business-${business.id}`}
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
            <StarRating rating={Math.round(business.averageRating)} />
            <p className="text-sm text-muted-foreground" data-testid={`text-rating-${business.id}`}>
              {business.averageRating.toFixed(1)} ({business.reviewCount} reviews)
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
            asChild
            data-testid={`button-view-details-${business.id}`}
          >
            <Link href={`/business/${business.id}`}>
              View Details
            </Link>
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
  );
}
