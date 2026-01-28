import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { type InsertKpiRecord, type KpiRecord } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Type inference from schema
type KpiListResponse = z.infer<typeof api.kpi.list.responses[200]>;
type KpiStatsResponse = z.infer<typeof api.kpi.stats.responses[200]>;
type ValidationErrors = z.infer<typeof errorSchemas.validation>;

interface KpiFilterParams {
  startDate?: string;
  endDate?: string;
  team?: string;
  month?: string;
  year?: string;
}

export function useKpiRecords(filters?: KpiFilterParams) {
  // Construct query string for key uniqueness
  const queryString = new URLSearchParams(filters as Record<string, string>).toString();

  return useQuery({
    queryKey: [api.kpi.list.path, filters],
    queryFn: async () => {
      const url = filters 
        ? `${api.kpi.list.path}?${new URLSearchParams(filters as Record<string, string>)}`
        : api.kpi.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KPI records");
      return api.kpi.list.responses[200].parse(await res.json());
    },
  });
}

export function useKpiStats(filters?: { year?: string; month?: string }) {
  return useQuery({
    queryKey: [api.kpi.stats.path, filters],
    queryFn: async () => {
      const url = filters
        ? `${api.kpi.stats.path}?${new URLSearchParams(filters)}`
        : api.kpi.stats.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KPI stats");
      return api.kpi.stats.responses[200].parse(await res.json());
    },
  });
}

export function useCreateKpiRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertKpiRecord) => {
      const validated = api.kpi.create.input.parse(data);
      const res = await fetch(api.kpi.create.path, {
        method: api.kpi.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create record");
      }

      return api.kpi.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.kpi.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.kpi.stats.path] });
      toast({
        title: "Record Created",
        description: "New KPI record has been successfully added.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateKpiRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertKpiRecord>) => {
      const validated = api.kpi.update.input.parse(updates);
      const url = buildUrl(api.kpi.update.path, { id });
      
      const res = await fetch(url, {
        method: api.kpi.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update record");
      }

      return api.kpi.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.kpi.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.kpi.stats.path] });
      toast({
        title: "Record Updated",
        description: "KPI record has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteKpiRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.kpi.delete.path, { id });
      const res = await fetch(url, { 
        method: api.kpi.delete.method,
        credentials: "include" 
      });

      if (!res.ok) {
        throw new Error("Failed to delete record");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.kpi.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.kpi.stats.path] });
      toast({
        title: "Record Deleted",
        description: "The KPI record has been permanently removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
