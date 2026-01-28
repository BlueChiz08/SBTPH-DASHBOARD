import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // KPI CRUD Routes
  app.get(api.kpi.list.path, async (req, res) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      team: req.query.team as string,
    };
    const records = await storage.getKpiRecords(filters);
    res.json(records);
  });

  app.post(api.kpi.create.path, async (req, res) => {
    try {
      const input = api.kpi.create.input.parse(req.body);
      const record = await storage.createKpiRecord(input);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.kpi.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.kpi.update.input.parse(req.body);
      const record = await storage.updateKpiRecord(id, input);
      if (!record) return res.status(404).json({ message: "Record not found" });
      res.json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.kpi.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteKpiRecord(id);
    res.status(204).send();
  });

  app.get(api.kpi.stats.path, async (req, res) => {
    // This could be optimized to use DB aggregations, 
    // but for now we fetch all and aggregate in memory for simplicity 
    // or rely on the client to aggregate.
    // Implementing a basic aggregation here:
    const records = await storage.getKpiRecords();
    
    // Simple aggregation example
    const totalTarget = records.reduce((sum, r) => sum + Number(r.target), 0);
    const totalShipOk = records.reduce((sum, r) => 
      sum + Number(r.newDepositShipOk) + Number(r.strategic) + Number(r.retention), 0
    );

    res.json({
      totalTarget,
      totalShipOk,
      teams: [] // Populate if needed, or let frontend handle detail
    });
  });
  
  // Seed Data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getKpiRecords();
  if (existing.length === 0) {
    console.log("Seeding database with example KPI data...");
    const teams = ["OCENIA", "CYPRUS", "KENYA", "MOZAMBIQUE", "MALAWI", "JAMAICA", "BAHAMAS/GUYANA", "TRUCKS"];
    const today = new Date();
    
    for (const team of teams) {
      // Create entries for the last 3 months
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        
        await storage.createKpiRecord({
          date: d.toISOString().split('T')[0],
          team,
          target: Math.floor(Math.random() * 40) + 20, // Targets like 20-60 cars
          qualifiedInquiries: Math.floor(Math.random() * 100) + 50,
          newRegister: Math.floor(Math.random() * 50) + 20,
          newDeposit: Math.floor(Math.random() * 30) + 10,
          newDepositShipOk: Math.floor(Math.random() * 15) + 5,
          strategic: Math.floor(Math.random() * 10),
          retention: Math.floor(Math.random() * 5),
          notes: "Auto-generated seed data"
        });
      }
    }
  }
}
