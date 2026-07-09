import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import type { SharedPet, SharedFields } from './data';

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');
const FONT_PATH =
  process.env.PASSPORT_FONT ?? path.join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
const BRAND = rgb(0.886, 0.325, 0.121);
const INK = rgb(0.17, 0.14, 0.13);
const MUTED = rgb(0.45, 0.42, 0.4);

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };
const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };

function stemToFile(stem: string, variant = 'card') {
  const rel = stem.replace(/^\/uploads\//, '');
  return path.join(UPLOAD_ROOT, `${rel}-${variant}.webp`);
}

/** Server-side passport PDF honoring the link's field selection (PLAN.md §2.11). */
export async function buildPassportPdf(shared: SharedPet): Promise<Uint8Array> {
  const { pet } = shared;
  const fields = shared.sharedFields as unknown as SharedFields;

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await readFile(FONT_PATH), { subset: true });

  const page = doc.addPage([595, 842]); // A4
  const margin = 50;
  let y = 792;

  const line = (text: string, size: number, color = INK, x = margin) => {
    page.drawText(text, { x, y, size, font, color });
    y -= size + 8;
  };
  const row = (label: string, value: string) => {
    page.drawText(label, { x: margin, y, size: 11, font, color: MUTED });
    page.drawText(value, { x: margin + 140, y, size: 11, font, color: INK });
    y -= 20;
  };

  line('mypet.az — Pet Pasportu', 12, MUTED);
  line(pet.name, 24, BRAND);
  y -= 4;

  // Pet photo — always included when available.
  if (pet.images[0]) {
    try {
      const webp = await readFile(stemToFile(pet.images[0].url, 'card'));
      const png = await sharp(webp).png().toBuffer();
      const img = await doc.embedPng(png);
      const w = 150;
      const h = (img.height / img.width) * w;
      page.drawImage(img, { x: 595 - margin - w, y: y - h + 20, width: w, height: h });
    } catch {
      /* skip image on failure */
    }
  }

  if (fields.basicInfo) {
    row('Kateqoriya', pet.category.name);
    row('Cins/növ', pet.breed?.name ?? pet.breedFreeText ?? '—');
    row('Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex);
    if (pet.birthDate) row('Doğum tarixi', pet.birthDate.toISOString().slice(0, 10));
    if (pet.color) row('Rəng', pet.color);
    if (pet.weight != null) row('Çəki', `${pet.weight} kq`);
  }

  if (fields.passport && pet.passport) {
    y -= 10;
    line('Pasport', 14, BRAND);
    if (pet.passport.documentNo) row('Sənəd №', pet.passport.documentNo);
    if (pet.passport.microchipId) row('Mikroçip', pet.passport.microchipId);
    if (pet.passport.birthPlace) row('Doğulduğu yer', pet.passport.birthPlace);
    if (pet.passport.issueDate) row('Verilmə tarixi', pet.passport.issueDate.toISOString().slice(0, 10));
  }

  if (fields.medicalHistory && pet.healthRecords.length > 0) {
    y -= 10;
    line('Tibbi tarixçə', 14, BRAND);
    for (const r of pet.healthRecords) {
      if (y < 60) break; // single page
      const src = r.source === 'VET' ? 'Baytar' : 'Özüm';
      line(
        `${r.date.toISOString().slice(0, 10)}  ·  ${HEALTH_LABEL[r.type] ?? r.type}  ·  ${r.name}  (${src})`,
        10,
        INK,
      );
    }
  }

  return doc.save();
}
