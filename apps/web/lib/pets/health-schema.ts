import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

// Passport (PLAN.md §2.3). The document image is handled separately as a File.
export const passportSchema = z.object({
  petId: z.string().min(1),
  documentNo: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  issueDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  microchipId: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  birthPlace: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
});

// Vaccination / medical history record (PLAN.md §2.3). Owner-added records are
// source=SELF; vet-added records (source=VET) arrive from the vet platform.
export const healthRecordSchema = z.object({
  petId: z.string().min(1),
  type: z.enum(['VACCINE', 'EXAM', 'SURGERY']),
  name: z.string().trim().min(1, 'Ad tələb olunur').max(120),
  date: z.coerce.date(),
  nextDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  note: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});

export type PassportInput = z.infer<typeof passportSchema>;
export type HealthRecordInput = z.infer<typeof healthRecordSchema>;
