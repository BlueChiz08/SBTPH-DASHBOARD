import { pgTable, text, serial, numeric, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const kpiRecords = pgTable("kpi_records", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  team: text("team").notNull(),
  
  // Metrics
  target: numeric("target").notNull(),
  ytdTarget: numeric("ytd_target").default("0"),
  qualifiedInquiries: numeric("qualified_inquiries").default("0"),
  newRegister: numeric("new_register").default("0"),
  newDeposit: numeric("new_deposit").default("0"),
  
  // Ship OK Components
  newDepositShipOk: numeric("new_deposit_ship_ok").default("0"),
  strategic: numeric("strategic").default("0"),
  retention: numeric("retention").default("0"),
  upsell: numeric("upsell").default("0"),
  
  // Metadata
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertKpiSchema = createInsertSchema(kpiRecords).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  target: z.coerce.number().min(0, "Target must be positive"),
  ytdTarget: z.coerce.number().min(0).optional(),
  qualifiedInquiries: z.coerce.number().min(0),
  newRegister: z.coerce.number().min(0),
  newDeposit: z.coerce.number().min(0),
  newDepositShipOk: z.coerce.number().min(0),
  strategic: z.coerce.number().min(0),
  retention: z.coerce.number().min(0),
  upsell: z.coerce.number().min(0),
});

export type KpiRecord = typeof kpiRecords.$inferSelect;
export type InsertKpiRecord = z.infer<typeof insertKpiSchema>;

// For Analytics
export interface KpiSummary {
  team: string;
  totalTarget: number;
  totalShipOk: number;
  progress: number;
  upsellRate: number; // ShipOK / NewDeposit
  conversionRate: number; // NewDeposit / QualifiedInquiries
}
