import { db } from "./db";
import { kpiRecords, type InsertKpiRecord, type KpiRecord } from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // KPI Operations
  getKpiRecords(filters?: { 
    startDate?: string; 
    endDate?: string; 
    team?: string;
  }): Promise<KpiRecord[]>;
  
  getKpiRecord(id: number): Promise<KpiRecord | undefined>;
  createKpiRecord(record: InsertKpiRecord): Promise<KpiRecord>;
  updateKpiRecord(id: number, updates: Partial<InsertKpiRecord>): Promise<KpiRecord>;
  deleteKpiRecord(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getKpiRecords(filters?: { startDate?: string; endDate?: string; team?: string }): Promise<KpiRecord[]> {
    let query = db.select().from(kpiRecords).orderBy(desc(kpiRecords.date));
    
    const conditions = [];
    if (filters?.startDate) conditions.push(gte(kpiRecords.date, filters.startDate));
    if (filters?.endDate) conditions.push(lte(kpiRecords.date, filters.endDate));
    if (filters?.team) conditions.push(eq(kpiRecords.team, filters.team));
    
    if (conditions.length > 0) {
      // @ts-ignore - Drizzle types can be tricky with dynamic where
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getKpiRecord(id: number): Promise<KpiRecord | undefined> {
    const [record] = await db.select().from(kpiRecords).where(eq(kpiRecords.id, id));
    return record;
  }

  async createKpiRecord(record: InsertKpiRecord): Promise<KpiRecord> {
    const [newRecord] = await db.insert(kpiRecords).values(record).returning();
    return newRecord;
  }

  async updateKpiRecord(id: number, updates: Partial<InsertKpiRecord>): Promise<KpiRecord> {
    const [updated] = await db
      .update(kpiRecords)
      .set(updates)
      .where(eq(kpiRecords.id, id))
      .returning();
    return updated;
  }

  async deleteKpiRecord(id: number): Promise<void> {
    await db.delete(kpiRecords).where(eq(kpiRecords.id, id));
  }
}

export const storage = new DatabaseStorage();
