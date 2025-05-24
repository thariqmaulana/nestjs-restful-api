import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    contact_id: z.number().min(1).positive().safe(),
    street: z.string().min(3).max(255).optional(),
    city: z.string().min(3).max(100).optional(),
    country: z.string().min(3).max(100),
    province: z.string().min(3).max(100).optional(),
    postal_code: z.string().min(3).max(10).optional(),
  });

  static readonly GET: ZodType = z.object({
    contact_id: z.number().min(1).positive().safe(),
    address_id: z.number().min(1).positive().safe(),
  });

  static readonly UPDATE: ZodType = z.object({
    address_id: z.number().min(1).positive().safe(),
    contact_id: z.number().min(1).positive().safe(),
    street: z.string().min(3).max(255).optional(),
    city: z.string().min(3).max(100).optional(),
    country: z.string().min(3).max(100),
    province: z.string().min(3).max(100).optional(),
    postal_code: z.string().min(3).max(10).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    contact_id: z.number().min(1).positive().safe(),
    address_id: z.number().min(1).positive().safe(),
  });
}
