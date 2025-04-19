import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runScraper } from "./scraper";
import { z } from "zod";
import { coachSearchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Coach search/filter endpoint
  app.get("/api/coaches", async (req, res) => {
    try {
      const searchParams = coachSearchSchema.parse({
        search: req.query.search as string | undefined,
        make: req.query.make as string | undefined,
        model: req.query.model as string | undefined,
        year: req.query.year as string | undefined,
        minPrice: req.query.minPrice as string | undefined,
        maxPrice: req.query.maxPrice as string | undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 6,
        sortBy: req.query.sortBy as string | undefined,
      });
      
      const result = await storage.getCoaches(searchParams);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid query parameters", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to get coaches" });
      }
    }
  });

  // Get single coach by ID
  app.get("/api/coaches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid coach ID" });
      }

      const coach = await storage.getCoachById(id);
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      // Get images and features for the coach
      const images = await storage.getCoachImages(id);
      const features = await storage.getCoachFeatures(id);

      res.json({
        ...coach,
        images,
        features,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get coach details" });
    }
  });

  // Get coach makes for filters
  app.get("/api/makes", async (_req, res) => {
    try {
      const makes = await storage.getCoachMakes();
      res.json(makes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get coach makes" });
    }
  });

  // Get coach models for filters
  app.get("/api/models", async (_req, res) => {
    try {
      const models = await storage.getCoachModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to get coach models" });
    }
  });

  // Get coach years for filters
  app.get("/api/years", async (_req, res) => {
    try {
      const years = await storage.getCoachYears();
      res.json(years);
    } catch (error) {
      res.status(500).json({ message: "Failed to get coach years" });
    }
  });

  // Trigger scraper manually
  app.post("/api/scrape", async (_req, res) => {
    try {
      // Run scraper in the background
      runScraper().catch(err => {
        console.error("Scraper failed:", err);
      });
      
      res.json({ message: "Scraper started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start scraper" });
    }
  });

  const httpServer = createServer(app);
  
  // Start the initial scraper run when the server starts
  setTimeout(() => {
    runScraper().catch(err => {
      console.error("Initial scraper run failed:", err);
    });
  }, 5000); // Wait 5 seconds after server starts
  
  return httpServer;
}
