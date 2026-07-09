import { z } from 'zod';
import type { PetCategoryField } from '@mypet/db';

// The "schema-from-data" engine (PLAN.md §4.1): PetCategoryField rows drive
// BOTH the rendered form and the validator. Build once here, reuse on the
// client (instant feedback) and the server (source of truth).

export type PetFieldDef = Pick<
  PetCategoryField,
  'fieldName' | 'label' | 'type' | 'options' | 'required' | 'order'
>;

/** Safely read a SELECT field's options (stored as JSON). */
export function fieldOptions(field: PetFieldDef): string[] {
  return Array.isArray(field.options) ? (field.options as string[]) : [];
}

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v);

function ruleFor(field: PetFieldDef): z.ZodTypeAny {
  switch (field.type) {
    case 'TEXT': {
      const base = z.string().trim();
      return field.required ? base.min(1, `${field.label} tələb olunur`) : base.optional();
    }
    case 'NUMBER': {
      const num = z.coerce.number();
      return z.preprocess(emptyToUndefined, field.required ? num : num.optional());
    }
    case 'SELECT': {
      const opts = fieldOptions(field);
      const base = opts.length ? z.enum(opts as [string, ...string[]]) : z.string();
      return z.preprocess(emptyToUndefined, field.required ? base : base.optional());
    }
    case 'BOOL': {
      // Checkboxes may arrive as boolean, 'on', 'true', or '1'.
      return z.preprocess(
        (v) => v === true || v === 'true' || v === 'on' || v === '1',
        z.boolean(),
      );
    }
    default:
      return z.unknown();
  }
}

/**
 * Build the Zod object schema for a category's dynamic fields.
 * Unknown keys are stripped (zod default) — this is how historical values for
 * fields an admin later removed are ignored gracefully (PLAN.md §4.1).
 */
export function buildStaticFieldsSchema(fields: PetFieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.fieldName] = ruleFor(field);
  }
  return z.object(shape);
}

/** RHF defaultValues for a category's dynamic fields. */
export function defaultStaticValues(fields: PetFieldDef[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const field of fields) {
    out[field.fieldName] = field.type === 'BOOL' ? false : '';
  }
  return out;
}
