import {
  users,
  businesses,
  reviews,
  categories,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type Review,
  type InsertReview,
  type Category,
  type InsertCategory,
  type BusinessWithDetails,
  type BusinessSummary,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql, count, avg } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Business operations
  getBusinesses(options?: {
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'rating' | 'name';
  }): Promise<BusinessSummary[]>;
  getBusinessById(id: string): Promise<BusinessWithDetails | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusinesses(id: string): Promise<boolean>;
  getBusinessesByUser(userId: string): Promise<BusinessSummary[]>;
  
  // Review operations
  getReviewsByBusiness(businessId: string): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  getUserReview(businessId: string, userId: string): Promise<Review | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Business operations
  async getBusinesses(options: {
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'rating' | 'name';
  } = {}): Promise<BusinessSummary[]> {
    const { categoryId, search, limit = 50, offset = 0, sortBy = 'newest' } = options;

    let query = db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        address: businesses.address,
        phone: businesses.phone,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        imageUrl: businesses.imageUrl,
        isVerified: businesses.isVerified,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          slug: categories.slug,
          createdAt: categories.createdAt,
        },
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .leftJoin(reviews, eq(businesses.id, reviews.businessId))
      .where(and(
        eq(businesses.isActive, true),
        categoryId ? eq(businesses.categoryId, categoryId) : undefined,
        search ? like(businesses.name, `%${search}%`) : undefined
      ))
      .groupBy(businesses.id, categories.id)
      .limit(limit)
      .offset(offset);

    const results = await query;

    // Apply sorting after the query
    switch (sortBy) {
      case 'rating':
        return results.sort((a, b) => b.averageRating - a.averageRating);
      case 'name':
        return results.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getBusinessById(id: string): Promise<BusinessWithDetails | undefined> {
    const [business] = await db
      .select()
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .where(and(eq(businesses.id, id), eq(businesses.isActive, true)));

    if (!business) return undefined;

    // Get reviews with user details
    const businessReviews = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, id))
      .orderBy(desc(reviews.createdAt));

    // Calculate average rating
    const ratingResult = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.businessId, id));

    const { averageRating, reviewCount } = ratingResult[0] || { averageRating: 0, reviewCount: 0 };

    return {
      ...business.businesses,
      category: business.categories!,
      owner: business.users || undefined,
      reviews: businessReviews.map(r => ({ ...r.review, user: r.user! })),
      averageRating,
      reviewCount,
    };
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  async deleteBusinesses(id: string): Promise<boolean> {
    const result = await db
      .update(businesses)
      .set({ isActive: false })
      .where(eq(businesses.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getBusinessesByUser(userId: string): Promise<BusinessSummary[]> {
    return await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        address: businesses.address,
        phone: businesses.phone,
        categoryId: businesses.categoryId,
        ownerId: businesses.ownerId,
        latitude: businesses.latitude,
        longitude: businesses.longitude,
        imageUrl: businesses.imageUrl,
        isVerified: businesses.isVerified,
        isActive: businesses.isActive,
        createdAt: businesses.createdAt,
        updatedAt: businesses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          slug: categories.slug,
          createdAt: categories.createdAt,
        },
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(businesses)
      .leftJoin(categories, eq(businesses.categoryId, categories.id))
      .leftJoin(reviews, eq(businesses.id, reviews.businessId))
      .where(eq(businesses.ownerId, userId))
      .groupBy(businesses.id, categories.id)
      .orderBy(desc(businesses.createdAt));
  }

  // Review operations
  async getReviewsByBusiness(businessId: string): Promise<(Review & { user: User })[]> {
    const reviewsWithUsers = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.createdAt));

    return reviewsWithUsers.map(r => ({ ...r.review, user: r.user! }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserReview(businessId: string, userId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.businessId, businessId), eq(reviews.userId, userId)));
    return review;
  }
}

export const storage = new DatabaseStorage();
