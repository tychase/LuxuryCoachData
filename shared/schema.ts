import { pgTable, text, serial, integer, boolean, varchar, numeric, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model from the original schema, keeping it for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Coach model for storing luxury coach data
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }),
  description: text("description"),
  exteriorColor: text("exterior_color"),
  interiorColor: text("interior_color"),
  mileage: integer("mileage"),
  length: text("length"),
  slideCount: integer("slide_count"),
  bedType: text("bed_type"),
  featuredImage: text("featured_image"),
  status: text("status").default("available"),
  isFeatured: boolean("is_featured").default(false),
  isNewArrival: boolean("is_new_arrival").default(false),
  sourceId: text("source_id").unique(), // ID from prevost-stuff.com
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create the insert schema but modify the price type to accept number
let baseInsertSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Override the price field to accept numeric values
export const insertCoachSchema = baseInsertSchema.extend({
  price: z.number(),
});

export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Coach = typeof coaches.$inferSelect;

// Coach images
export const coachImages = pgTable("coach_images", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").default(false),
  position: integer("position").default(0),
});

export const insertCoachImageSchema = createInsertSchema(coachImages).omit({
  id: true,
});

export type InsertCoachImage = z.infer<typeof insertCoachImageSchema>;
export type CoachImage = typeof coachImages.$inferSelect;

// Coach features/amenities
export const coachFeatures = pgTable("coach_features", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const insertCoachFeatureSchema = createInsertSchema(coachFeatures).omit({
  id: true,
});

export type InsertCoachFeature = z.infer<typeof insertCoachFeatureSchema>;
export type CoachFeature = typeof coachFeatures.$inferSelect;

// Setup relations
export const coachesRelations = relations(coaches, ({ many }) => ({
  images: many(coachImages),
  features: many(coachFeatures),
}));

export const coachImagesRelations = relations(coachImages, ({ one }) => ({
  coach: one(coaches, {
    fields: [coachImages.coachId],
    references: [coaches.id],
  }),
}));

export const coachFeaturesRelations = relations(coachFeatures, ({ one }) => ({
  coach: one(coaches, {
    fields: [coachFeatures.coachId],
    references: [coaches.id],
  }),
}));

// Schema for searching coaches
export const coachSearchSchema = z.object({
  search: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  status: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(6),
  sortBy: z.string().optional().default("newest"),
});

export type CoachSearch = z.infer<typeof coachSearchSchema>;

// Schema for pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type Pagination = z.infer<typeof paginationSchema>;
