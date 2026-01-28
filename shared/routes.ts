import { z } from 'zod';
import { insertKpiSchema, kpiRecords } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  kpi: {
    list: {
      method: 'GET' as const,
      path: '/api/kpi',
      input: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        team: z.string().optional(),
        month: z.string().optional(),
        year: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof kpiRecords.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/kpi',
      input: insertKpiSchema,
      responses: {
        201: z.custom<typeof kpiRecords.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/kpi/:id',
      input: insertKpiSchema.partial(),
      responses: {
        200: z.custom<typeof kpiRecords.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/kpi/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    // Dedicated endpoint for aggregated stats if needed, 
    // but frontend can also aggregate from list for flexibility
    stats: {
      method: 'GET' as const,
      path: '/api/kpi/stats',
      input: z.object({
        year: z.string().optional(),
        month: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          totalTarget: z.number(),
          totalShipOk: z.number(),
          teams: z.array(z.object({
            name: z.string(),
            target: z.number(),
            shipOk: z.number(),
            progress: z.number(),
          })),
        }),
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
