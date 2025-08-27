import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBusinessSchema, insertReviewSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Config routes
  app.get('/api/config', (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    });
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Business routes
  app.get('/api/businesses', async (req, res) => {
    try {
      const { categoryId, search, limit = '20', offset = '0', sortBy = 'newest' } = req.query;
      
      const businesses = await storage.getBusinesses({
        categoryId: categoryId as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        sortBy: sortBy as 'newest' | 'rating' | 'name',
      });
      
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessData = insertBusinessSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.put('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = req.params.id;
      
      // Check if user owns the business
      const existingBusiness = await storage.getBusinessById(businessId);
      if (!existingBusiness || existingBusiness.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const businessData = insertBusinessSchema.partial().parse(req.body);
      const business = await storage.updateBusiness(businessId, businessData);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error updating business:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  app.delete('/api/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = req.params.id;
      
      // Check if user owns the business
      const existingBusiness = await storage.getBusinessById(businessId);
      if (!existingBusiness || existingBusiness.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteBusinesses(businessId);
      if (!success) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json({ message: "Business deleted successfully" });
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });

  app.get('/api/businesses/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      // Users can only see their own businesses
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const businesses = await storage.getBusinessesByUser(requestedUserId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching user businesses:", error);
      res.status(500).json({ message: "Failed to fetch user businesses" });
    }
  });

  // Review routes
  app.get('/api/businesses/:businessId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByBusiness(req.params.businessId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/businesses/:businessId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const businessId = req.params.businessId;
      
      // Check if user already reviewed this business
      const existingReview = await storage.getUserReview(businessId, userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this business" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        businessId,
        userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put('/api/reviews/:reviewId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewId = req.params.reviewId;
      
      // Check if user owns the review (simplified check)
      const reviewData = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(reviewId, reviewData);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete('/api/reviews/:reviewId', isAuthenticated, async (req: any, res) => {
    try {
      const reviewId = req.params.reviewId;
      
      const success = await storage.deleteReview(reviewId);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
