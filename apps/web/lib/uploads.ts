import 'server-only';
import { randomBytes } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { slugify } from '@mypet/db';
import { IMAGE_VARIANTS, type ImageVariant } from './images';

// Image pipeline (PLAN.md §3.1): validate → WebP variants → SEO slug filename.
// In dev, files land in apps/web/public/uploads (Next serves /public). In prod,
// point UPLOAD_DIR at the Nginx-served /uploads path.

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_PREFIX = '/uploads';
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const WEBP_QUALITY = 80;

type Sniffed = 'jpeg' | 'png' | 'webp' | 'gif';

/** Magic-byte sniff — never trust the file extension. */
function sniff(buf: Buffer): Sniffed | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return 'webp';
  return null;
}

export interface ProcessedImage {
  /** Web path stem (no variant suffix), stored in the DB `url` column. */
  stem: string;
}

/**
 * Validate + convert an uploaded image into responsive WebP variants.
 * @param file       the uploaded File
 * @param subdir     bucket under /uploads (e.g. "pets", "listings")
 * @param slugBase   text used for the SEO-friendly filename (e.g. pet name/breed)
 */
export async function processImage(
  file: File,
  subdir: string,
  slugBase: string,
): Promise<ProcessedImage> {
  if (file.size > MAX_BYTES) {
    throw new Error('Şəkil çox böyükdür (maksimum 10 MB)');
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniff(buf)) {
    throw new Error('Yalnız JPEG, PNG, WebP və ya GIF şəkillər qəbul olunur');
  }

  const hash = randomBytes(4).toString('hex');
  const stemName = `${slugify(slugBase) || 'sekil'}-${hash}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  // .rotate() applies EXIF orientation; sharp drops metadata by default (privacy).
  const pipeline = sharp(buf, { failOn: 'none' }).rotate();

  await Promise.all(
    (Object.entries(IMAGE_VARIANTS) as [ImageVariant, number][]).map(([variant, width]) =>
      pipeline
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(path.join(dir, `${stemName}-${variant}.webp`)),
    ),
  );

  return { stem: `${PUBLIC_PREFIX}/${subdir}/${stemName}` };
}

/** Remove every variant file for a stored stem (cleanup on delete, §3.1). */
export async function removeImage(stem: string): Promise<void> {
  if (!stem.startsWith(PUBLIC_PREFIX)) return;
  const rel = stem.slice(PUBLIC_PREFIX.length + 1); // drop "/uploads/"
  await Promise.all(
    Object.keys(IMAGE_VARIANTS).map((variant) =>
      unlink(path.join(UPLOAD_ROOT, `${rel}-${variant}.webp`)).catch(() => {}),
    ),
  );
}
