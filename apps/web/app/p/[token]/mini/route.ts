import { getSharedByToken } from '@/lib/passport/data';
import { buildMiniPassportPdf } from '@/lib/passport/pdf';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await getSharedByToken(token);
  if (!shared) return new Response('Not found', { status: 404 });

  const pdf = await buildMiniPassportPdf(shared);
  const filename = `${shared.pet.name.replace(/[^a-zA-Z0-9]/g, '_') || 'passport'}-mini.pdf`;

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
