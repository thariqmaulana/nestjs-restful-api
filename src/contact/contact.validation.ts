import { z, ZodType } from "zod";

export class ContactValidation {
  static readonly CREATE: ZodType = z.object({
    first_name: z.string().min(3).max(100),
    last_name: z.string().min(3).max(100).optional(),
    email: z.string().min(3).max(100).email().optional(),
    phone: z.string().min(3).max(20).optional(),
  });

  // static readonly GET: ZodType = z.coerce.number().int().positive().safe();

  static readonly UPDATE: ZodType = z.object({
    id: z.number().int().positive().safe(),
    first_name: z.string().min(3).max(100),
    last_name: z.string().min(3).max(100).optional(),
    email: z.string().min(3).max(100).email().optional(),
    phone: z.string().min(3).max(20).optional(),
  });

  static readonly SEARCH: ZodType = z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.string().min(3).max(100).email().optional(),
    phone: z.string().min(3).max(20).optional(),
    page: z.number().int().positive().safe(),
    size: z.number().int().positive().safe(),
  });
}