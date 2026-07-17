import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

export const LISTING_TYPES = ['SALE', 'ADOPTION', 'LOST_FOUND', 'MATING'] as const;

// Sentinel value for the pet dropdown's "create a new pet inline" option.
export const NEW_PET = '__new__';

// Create a listing for an existing pet (PLAN.md §2.4). A listing is a pointer
// to a pet profile — data isn't duplicated.
export const listingCreateSchema = z
  .object({
    petId: z.string().min(1, 'Pet seçin'),
    type: z.enum(LISTING_TYPES),
    title: z.string().trim().min(3, 'Başlıq ən azı 3 simvol olmalıdır').max(100),
    description: z.preprocess(emptyToUndefined, z.string().trim().max(4000).optional()),
    price: z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().max(1_000_000).optional()),
    cityId: z.preprocess(emptyToUndefined, z.string().optional()),
    address: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
    phone: z.string().trim().min(7, 'Telefon nömrəsi tələb olunur').max(20),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'SALE' && val.price == null) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Satış üçün qiymət tələb olunur' });
    }
  });

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;

// Public browse filters (PLAN.md §2.4), all optional, read from query params.
export const listingFilterSchema = z.object({
  type: z.enum(LISTING_TYPES).optional(),
  categoryId: z.string().optional(),
  breedId: z.string().optional(),
  cityId: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  ageMin: z.coerce.number().optional(), // years
  ageMax: z.coerce.number().optional(), // years
  q: z.string().trim().optional(),
});

export type ListingFilter = z.infer<typeof listingFilterSchema>;
