import { 
  coaches, type Coach, type InsertCoach, 
  coachImages, type CoachImage, type InsertCoachImage,
  coachFeatures, type CoachFeature, type InsertCoachFeature,
  type CoachSearch, users, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (from original schema)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Coach operations
  getCoaches(search?: CoachSearch): Promise<{ coaches: Coach[], total: number }>;
  getCoachById(id: number): Promise<Coach | undefined>;
  getCoachBySourceId(sourceId: string): Promise<Coach | undefined>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, coach: Partial<InsertCoach>): Promise<Coach | undefined>;
  deleteCoach(id: number): Promise<boolean>;
  
  // Coach images operations
  getCoachImages(coachId: number): Promise<CoachImage[]>;
  createCoachImage(image: InsertCoachImage): Promise<CoachImage>;
  deleteCoachImage(id: number): Promise<boolean>;
  
  // Coach features operations
  getCoachFeatures(coachId: number): Promise<CoachFeature[]>;
  createCoachFeature(feature: InsertCoachFeature): Promise<CoachFeature>;
  deleteCoachFeature(id: number): Promise<boolean>;
  
  // Metadata operations
  getCoachMakes(): Promise<string[]>;
  getCoachModels(): Promise<string[]>;
  getCoachYears(): Promise<number[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (from original code)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Coach operations
  async getCoaches(search?: CoachSearch): Promise<{ coaches: Coach[], total: number }> {
    const page = search?.page || 1;
    const limit = search?.limit || 6;
    const offset = (page - 1) * limit;
    
    // Build the query conditions
    let conditions = [];
    
    if (search?.search) {
      conditions.push(
        like(coaches.title, `%${search.search}%`)
      );
    }
    
    if (search?.make) {
      conditions.push(
        eq(coaches.make, search.make)
      );
    }
    
    if (search?.model) {
      conditions.push(
        eq(coaches.model, search.model)
      );
    }
    
    if (search?.year) {
      conditions.push(
        eq(coaches.year, parseInt(search.year))
      );
    }
    
    if (search?.minPrice) {
      conditions.push(
        gte(coaches.price, parseFloat(search.minPrice))
      );
    }
    
    if (search?.maxPrice) {
      conditions.push(
        lte(coaches.price, parseFloat(search.maxPrice))
      );
    }
    
    if (search?.status) {
      conditions.push(
        eq(coaches.status, search.status)
      );
    }
    
    // Create the base query
    const baseQuery = conditions.length > 0 
      ? db.select().from(coaches).where(and(...conditions))
      : db.select().from(coaches);
    
    // Sort
    let query = baseQuery;
    if (search?.sortBy) {
      switch (search.sortBy) {
        case 'newest':
          query = query.orderBy(desc(coaches.year), desc(coaches.id));
          break;
        case 'price_high_low':
          query = query.orderBy(desc(coaches.price));
          break;
        case 'price_low_high':
          query = query.orderBy(asc(coaches.price));
          break;
        default:
          query = query.orderBy(desc(coaches.id));
      }
    } else {
      query = query.orderBy(desc(coaches.id));
    }
    
    // Get total count
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(coaches)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    // Get paginated coaches
    const coachList = await query.limit(limit).offset(offset);
    
    return { 
      coaches: coachList,
      total: Number(total)
    };
  }

  async getCoachById(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async getCoachBySourceId(sourceId: string): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.sourceId, sourceId));
    return coach;
  }

  async createCoach(insertCoach: InsertCoach): Promise<Coach> {
    const [coach] = await db
      .insert(coaches)
      .values(insertCoach)
      .returning();
    return coach;
  }

  async updateCoach(id: number, coachData: Partial<InsertCoach>): Promise<Coach | undefined> {
    // First check if coach exists
    const exists = await this.getCoachById(id);
    if (!exists) return undefined;
    
    // Update the coach
    const [coach] = await db
      .update(coaches)
      .set({
        ...coachData,
        updatedAt: new Date()
      })
      .where(eq(coaches.id, id))
      .returning();
    
    return coach;
  }

  async deleteCoach(id: number): Promise<boolean> {
    const result = await db
      .delete(coaches)
      .where(eq(coaches.id, id))
      .returning({ id: coaches.id });
    
    return result.length > 0;
  }
  
  // Coach images operations
  async getCoachImages(coachId: number): Promise<CoachImage[]> {
    return db
      .select()
      .from(coachImages)
      .where(eq(coachImages.coachId, coachId))
      .orderBy(asc(coachImages.sortOrder));
  }

  async createCoachImage(image: InsertCoachImage): Promise<CoachImage> {
    const [coachImage] = await db
      .insert(coachImages)
      .values(image)
      .returning();
    return coachImage;
  }

  async deleteCoachImage(id: number): Promise<boolean> {
    const result = await db
      .delete(coachImages)
      .where(eq(coachImages.id, id))
      .returning({ id: coachImages.id });
    
    return result.length > 0;
  }
  
  // Coach features operations
  async getCoachFeatures(coachId: number): Promise<CoachFeature[]> {
    return db
      .select()
      .from(coachFeatures)
      .where(eq(coachFeatures.coachId, coachId));
  }

  async createCoachFeature(feature: InsertCoachFeature): Promise<CoachFeature> {
    const [coachFeature] = await db
      .insert(coachFeatures)
      .values(feature)
      .returning();
    return coachFeature;
  }

  async deleteCoachFeature(id: number): Promise<boolean> {
    const result = await db
      .delete(coachFeatures)
      .where(eq(coachFeatures.id, id))
      .returning({ id: coachFeatures.id });
    
    return result.length > 0;
  }
  
  // Metadata operations
  async getCoachMakes(): Promise<string[]> {
    const result = await db
      .select({ make: coaches.make })
      .from(coaches)
      .groupBy(coaches.make)
      .orderBy(coaches.make);
    
    return result.map(row => row.make);
  }

  async getCoachModels(): Promise<string[]> {
    const result = await db
      .select({ model: coaches.model })
      .from(coaches)
      .groupBy(coaches.model)
      .orderBy(coaches.model);
    
    return result.map(row => row.model);
  }

  async getCoachYears(): Promise<number[]> {
    const result = await db
      .select({ year: coaches.year })
      .from(coaches)
      .groupBy(coaches.year)
      .orderBy(desc(coaches.year));
    
    return result.map(row => row.year);
  }
}

export const storage = new DatabaseStorage();
