import { Card } from "@/components/ui/card";
import { Coffee, Hammer, Shirt, Utensils, Wrench, ShoppingBasket } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) {
  const categoryIcons: Record<string, any> = {
    'hair-salons': Hammer,
    'repair-services': Wrench,
    'tailors': Shirt,
    'street-food': Utensils,
    'hardware': Wrench,
    'groceries': ShoppingBasket,
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card
          className={`p-6 text-center cursor-pointer transition-all hover:scale-105 ${
            selectedCategory === "" 
              ? "border-primary bg-accent" 
              : "hover:border-primary hover:bg-accent"
          }`}
          onClick={() => onCategorySelect("")}
          data-testid="card-category-all"
        >
          <Coffee className="w-12 h-12 text-primary mb-3 mx-auto" />
          <p className="font-semibold text-card-foreground">All Categories</p>
          <p className="text-sm text-muted-foreground">See everything</p>
        </Card>

        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] || Coffee;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card
              key={category.id}
              className={`p-6 text-center cursor-pointer transition-all hover:scale-105 ${
                isSelected 
                  ? "border-primary bg-accent" 
                  : "hover:border-primary hover:bg-accent"
              }`}
              onClick={() => onCategorySelect(isSelected ? "" : category.id)}
              data-testid={`card-category-${category.slug}`}
            >
              <Icon className="w-12 h-12 text-primary mb-3 mx-auto" />
              <p className="font-semibold text-card-foreground">{category.name}</p>
              <p className="text-sm text-muted-foreground">Browse category</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
