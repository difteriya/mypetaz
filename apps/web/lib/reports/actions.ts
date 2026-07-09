'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@mypet/db';
import { auth } from '@mypet/auth';

const reportSchema = z.object({
  targetType: z.enum(['LISTING', 'BLOG_POST', 'REVIEW', 'BUSINESS']),
  targetId: z.string().min(1),
  reason: z.string().trim().min(1, 'Səbəb seçin').max(60),
  note: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(500).optional()),
});

export type ReportState = { error?: string; ok?: string } | undefined;

/** Community "Şikayət et" on already-active content (PLAN.md §2.13). */
export async function createReportAction(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Məlumatlar yanlışdır' };

  await prisma.report.create({
    data: {
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
      note: parsed.data.note ?? null,
    },
  });
  return { ok: 'Şikayətiniz göndərildi. Təşəkkürlər!' };
}
