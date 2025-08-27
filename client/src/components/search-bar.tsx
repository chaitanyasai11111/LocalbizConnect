import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
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
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              data-testid="button-use-location"
            >
              🎯
            </Button>
          </div>
          
          <Button
            type="submit"
            className="bg-secondary text-secondary-foreground px-8 py-4 hover:opacity-90 text-lg"
            data-testid="button-search"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </Card>
  );
}
