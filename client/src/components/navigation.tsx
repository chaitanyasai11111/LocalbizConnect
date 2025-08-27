import { Button } from "@/components/ui/button";
import { MapPin, Menu, User, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <MapPin className="text-primary text-2xl" />
            <span className="text-2xl font-bold text-primary">LocalFind</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors" data-testid="link-discover">
              Discover
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" asChild data-testid="button-add-business">
                  <Link href="/add-business">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Link>
                </Button>
                
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                      data-testid="img-user-avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium" data-testid="text-user-name">
                    {user?.firstName || user?.email?.split('@')[0] || "User"}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signin"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
