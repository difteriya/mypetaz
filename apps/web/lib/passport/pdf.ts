import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, type PDFDocument as PDFDoc, type PDFFont, type PDFImage, type PDFPage, type RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import QRCode from 'qrcode';
import type { SharedPet, SharedFields } from './data';
import { healthSourceLabel } from '@/lib/pets/health-label';

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');
const FONT_PATH =
  process.env.PASSPORT_FONT ?? path.join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf');
const APP_URL = process.env.APP_URL ?? 'https://mypet.az';

// --- Brand palette (mirrors packages/config/tailwind/tokens.css) ---
const CORAL = rgb(0.957, 0.384, 0.184); // brand-500  #f4622f
const CORAL_DARK = rgb(0.714, 0.235, 0.086); // brand-700  #b63c16
const CORAL_400 = rgb(1, 0.478, 0.302); // brand-400  #ff7a4d
const CORAL_300 = rgb(1, 0.616, 0.471); // brand-300  #ff9d78
const CORAL_50 = rgb(1, 0.957, 0.937); // brand-50   #fff4ef
const INK = rgb(0.169, 0.149, 0.133); // ink        #2b2622
const MUTED = rgb(0.541, 0.506, 0.482); // warm gray  #8a817b
const CREAM_100 = rgb(0.984, 0.965, 0.937); // #fbf6ef
const CREAM_200 = rgb(0.953, 0.914, 0.863); // #f3e9dc
const CARD_BG = rgb(0.999, 0.988, 0.976);
const WHITE = rgb(1, 1, 1);

const HEALTH_COLOR: Record<string, RGB> = {
  VACCINE: rgb(0.09, 0.69, 0.655), // teal
  EXAM: rgb(0.949, 0.482, 0.639), // pink
  SURGERY: rgb(0.545, 0.361, 0.965), // purple
};

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };
const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };

function stemToFile(stem: string, variant = 'card') {
  const rel = stem.replace(/^\/uploads\//, '');
  return path.join(UPLOAD_ROOT, `${rel}-${variant}.webp`);
}

/** SVG path for a rounded rectangle anchored at its top-left corner. */
function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${rr} 0`,
    `H ${w - rr}`,
    `Q ${w} 0 ${w} ${rr}`,
    `V ${h - rr}`,
    `Q ${w} ${h} ${w - rr} ${h}`,
    `H ${rr}`,
    `Q 0 ${h} 0 ${h - rr}`,
    `V ${rr}`,
    `Q 0 0 ${rr} 0`,
    'Z',
  ].join(' ');
}

/** A circular (masked) PNG of the pet's cover photo, or null on failure. */
async function circlePhoto(doc: PDFDoc, stem: string, px = 200): Promise<PDFImage | null> {
  try {
    const webp = await readFile(stemToFile(stem, 'card'));
    const mask = Buffer.from(
      `<svg width="${px}" height="${px}"><circle cx="${px / 2}" cy="${px / 2}" r="${px / 2}" fill="#fff"/></svg>`,
    );
    const png = await sharp(webp)
      .resize(px, px, { fit: 'cover' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    return await doc.embedPng(png);
  } catch {
    return null;
  }
}

/** QR code linking to a URL, as an embedded PNG. */
async function qrImage(doc: PDFDoc, url: string, px = 320): Promise<PDFImage> {
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: px,
    color: { dark: '#2b2622', light: '#ffffff' },
  });
  const png = Buffer.from(dataUrl.split(',')[1]!, 'base64');
  return doc.embedPng(png);
}

/** Drawing helpers bound to a page + font. */
function helpers(page: PDFPage, font: PDFFont) {
  const text = (s: string, x: number, baseline: number, size: number, color: RGB = INK, bold = false) => {
    page.drawText(s, { x, y: baseline, size, font, color });
    if (bold) page.drawText(s, { x: x + 0.35, y: baseline, size, font, color });
  };

  const roundedRect = (
    x: number,
    top: number,
    w: number,
    h: number,
    r: number,
    opts: { color?: RGB; borderColor?: RGB; borderWidth?: number; opacity?: number } = {},
  ) => {
    page.drawSvgPath(roundedRectPath(w, h, r), {
      x,
      y: top,
      color: opts.color,
      borderColor: opts.borderColor,
      borderWidth: opts.borderWidth,
      opacity: opts.opacity,
      borderOpacity: opts.opacity,
    });
  };

  const truncate = (s: string, size: number, maxW: number): string => {
    if (font.widthOfTextAtSize(s, size) <= maxW) return s;
    let t = s;
    while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > maxW) t = t.slice(0, -1);
    return `${t}…`;
  };

  /** Rounded pill with its label on the given text baseline; returns pill width. */
  const pill = (x: number, baseline: number, label: string, bg: RGB, fg: RGB, size = 9): number => {
    const padX = 9;
    const h = size + 10;
    const w = font.widthOfTextAtSize(label, size) + padX * 2;
    // pill text baseline = top - size - 4  →  top = baseline + size + 4
    roundedRect(x, baseline + size + 4, w, h, h / 2, { color: bg });
    text(label, x + padX, baseline, size, fg);
    return w;
  };

  return { text, roundedRect, truncate, pill };
}

/** Full A4 passport with brand design + QR to the online passport (PLAN.md §2.11). */
export async function buildPassportPdf(shared: SharedPet): Promise<Uint8Array> {
  const { pet } = shared;
  const fields = shared.sharedFields as unknown as SharedFields;
  const shareUrl = `${APP_URL}/p/${shared.token}`;

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await readFile(FONT_PATH), { subset: true });
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { text, roundedRect, truncate, pill } = helpers(page, font);

  // ===== Header band =====
  const headerH = 150;
  page.drawRectangle({ x: 0, y: PAGE_H - headerH, width: PAGE_W, height: headerH, color: CORAL });
  page.drawEllipse({ x: 545, y: 812, xScale: 62, yScale: 62, color: CORAL_400, opacity: 0.4 });
  page.drawEllipse({ x: 612, y: 738, xScale: 46, yScale: 46, color: CORAL_300, opacity: 0.35 });
  page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: CORAL_DARK });
  text('mypet.az', MARGIN, PAGE_H - 58, 24, WHITE, true);
  text('PET PASPORTU', MARGIN, PAGE_H - 80, 10.5, WHITE);
  page.drawRectangle({ x: MARGIN, y: PAGE_H - 90, width: 74, height: 2, color: WHITE, opacity: 0.85 });

  // ===== Identity card =====
  const idTop = PAGE_H - 116;
  const idH = 128;
  const idBottom = idTop - idH;
  roundedRect(MARGIN + 2, idTop - 4, CONTENT_W, idH, 20, { color: CORAL_DARK, opacity: 0.1 });
  roundedRect(MARGIN, idTop, CONTENT_W, idH, 20, { color: WHITE, borderColor: CREAM_200, borderWidth: 1 });

  // photo
  const photoR = 48;
  const photoCx = MARGIN + 30 + photoR;
  const photoCy = idBottom + idH / 2;
  page.drawEllipse({ x: photoCx, y: photoCy, xScale: photoR + 5, yScale: photoR + 5, color: CORAL_50 });
  const photo = pet.images[0] ? await circlePhoto(doc, pet.images[0].url) : null;
  if (photo) {
    page.drawImage(photo, { x: photoCx - photoR, y: photoCy - photoR, width: photoR * 2, height: photoR * 2 });
  } else {
    const initial = (pet.name.trim()[0] ?? '?').toUpperCase();
    text(initial, photoCx - font.widthOfTextAtSize(initial, 40) / 2, photoCy - 20 + 3, 40, CORAL, true);
  }

  // QR (top-right of the identity card)
  const qrSize = 76;
  const qrX = MARGIN + CONTENT_W - qrSize - 18;
  const qrTop = idTop - 20;
  roundedRect(qrX - 6, qrTop + 6, qrSize + 12, qrSize + 24, 8, { color: WHITE, borderColor: CREAM_200, borderWidth: 1 });
  const qr = await qrImage(doc, shareUrl);
  page.drawImage(qr, { x: qrX, y: qrTop - qrSize, width: qrSize, height: qrSize });
  text('Onlayn pasport', qrX + (qrSize - font.widthOfTextAtSize('Onlayn pasport', 7)) / 2, qrTop - qrSize - 10, 7, MUTED);

  // name + meta pills
  const infoX = photoCx + photoR + 22;
  const infoMaxW = qrX - infoX - 18;
  text(truncate(pet.name, 24, infoMaxW), infoX, photoCy + 20, 24, CORAL_DARK, true);
  const breedText = pet.breed?.name ?? pet.breedFreeText ?? null;
  let px = infoX;
  const pillBaseline = photoCy - 12;
  px += pill(px, pillBaseline, pet.category.name, CREAM_100, INK) + 6;
  if (breedText) px += pill(px, pillBaseline, truncate(breedText, 9, 120), CREAM_100, INK) + 6;
  pill(px, pillBaseline, SEX_LABEL[pet.sex] ?? pet.sex, CORAL_50, CORAL_DARK);

  // ===== Section cards =====
  let cursor = idBottom - 22;

  const sectionCard = (title: string, rows: [string, string][]) => {
    if (rows.length === 0) return;
    const pad = 16;
    const titleH = 24;
    const rowH = 22;
    const h = pad + titleH + rows.length * rowH + pad - 6;
    const top = cursor;
    roundedRect(MARGIN, top, CONTENT_W, h, 16, { color: CARD_BG, borderColor: CREAM_200, borderWidth: 1 });
    page.drawRectangle({ x: MARGIN + pad, y: top - pad - 11, width: 4, height: 15, color: CORAL });
    text(title, MARGIN + pad + 12, top - pad - 9, 13, CORAL_DARK, true);
    let ry = top - pad - titleH - 6;
    rows.forEach(([label, value], i) => {
      if (i > 0) {
        page.drawRectangle({ x: MARGIN + pad, y: ry + rowH - 5, width: CONTENT_W - pad * 2, height: 0.6, color: CREAM_200 });
      }
      text(label, MARGIN + pad, ry, 10.5, MUTED);
      const vx = MARGIN + 160;
      text(truncate(value, 10.5, MARGIN + CONTENT_W - pad - vx), vx, ry, 10.5, INK);
      ry -= rowH;
    });
    cursor = top - h - 16;
  };

  if (fields.basicInfo) {
    const rows: [string, string][] = [
      ['Kateqoriya', pet.category.name],
      ['Cins / növ', breedText ?? '—'],
      ['Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex],
    ];
    if (pet.birthDate) rows.push(['Doğum tarixi', pet.birthDate.toISOString().slice(0, 10)]);
    if (pet.color) rows.push(['Rəng', pet.color]);
    if (pet.weight != null) rows.push(['Çəki', `${pet.weight} kq`]);
    sectionCard('Əsas məlumatlar', rows);
  }

  if (fields.passport && pet.passport) {
    const rows: [string, string][] = [];
    if (pet.passport.documentNo) rows.push(['Sənəd №', pet.passport.documentNo]);
    if (pet.passport.microchipId) rows.push(['Mikroçip', pet.passport.microchipId]);
    if (pet.passport.birthPlace) rows.push(['Doğulduğu yer', pet.passport.birthPlace]);
    if (pet.passport.issueDate) rows.push(['Verilmə tarixi', pet.passport.issueDate.toISOString().slice(0, 10)]);
    sectionCard('Pasport', rows);
  }

  if (fields.medicalHistory && pet.healthRecords.length > 0) {
    const pad = 16;
    const titleH = 24;
    const rowH = 26;
    const maxRows = Math.max(0, Math.floor((cursor - 70 - pad - titleH) / rowH));
    const shown = pet.healthRecords.slice(0, Math.max(1, maxRows));
    const hidden = pet.healthRecords.length - shown.length;
    const h = pad + titleH + shown.length * rowH + (hidden > 0 ? 16 : 0) + pad - 6;
    const top = cursor;
    roundedRect(MARGIN, top, CONTENT_W, h, 16, { color: CARD_BG, borderColor: CREAM_200, borderWidth: 1 });
    page.drawRectangle({ x: MARGIN + pad, y: top - pad - 11, width: 4, height: 15, color: CORAL });
    text('Tibbi tarixçə', MARGIN + pad + 12, top - pad - 9, 13, CORAL_DARK, true);

    let ry = top - pad - titleH - 4;
    shown.forEach((r, i) => {
      if (i % 2 === 1) {
        roundedRect(MARGIN + pad - 4, ry + rowH - 7, CONTENT_W - pad * 2 + 8, rowH, 6, { color: CREAM_100 });
      }
      const src = healthSourceLabel({
        source: r.source,
        ownerId: pet.ownerId,
        addedById: r.addedById,
        addedByName: r.addedBy?.name,
        vetName: r.vetAppointment?.vet?.clinicName,
      });
      const baseline = ry;
      text(r.date.toISOString().slice(0, 10), MARGIN + pad, baseline, 9.5, MUTED);
      const badgeColor = HEALTH_COLOR[r.type] ?? CORAL;
      const badgeW = pill(MARGIN + pad + 66, baseline, HEALTH_LABEL[r.type] ?? r.type, badgeColor, WHITE, 8.5);
      const nameX = MARGIN + pad + 66 + badgeW + 8;
      const nameMaxW = MARGIN + CONTENT_W - pad - nameX - 4;
      text(truncate(`${r.name}  ·  ${src}`, 9.5, nameMaxW), nameX, baseline, 9.5, INK);
      ry -= rowH;
    });
    if (hidden > 0) text(`+ daha ${hidden} qeyd`, MARGIN + pad, ry + 2, 9, MUTED);
    cursor = top - h - 16;
  }

  // ===== Footer =====
  const footY = 44;
  page.drawRectangle({ x: MARGIN, y: footY + 14, width: CONTENT_W, height: 1.5, color: CORAL, opacity: 0.5 });
  const today = new Date().toISOString().slice(0, 10);
  text(`mypet.az · Bu pasport ${today} tarixində yaradıldı`, MARGIN, footY, 9, MUTED);
  const mark = 'mypet.az';
  text(mark, MARGIN + CONTENT_W - font.widthOfTextAtSize(mark, 9), footY, 9, CORAL_DARK, true);

  return doc.save();
}

/** Wallet-sized mini passport card with a QR to the online passport. */
export async function buildMiniPassportPdf(shared: SharedPet): Promise<Uint8Array> {
  const { pet } = shared;
  const shareUrl = `${APP_URL}/p/${shared.token}`;

  const W = 340;
  const H = 214;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(await readFile(FONT_PATH), { subset: true });
  const page = doc.addPage([W, H]);
  const { text, roundedRect, truncate } = helpers(page, font);

  // card background + border
  roundedRect(0.5, H - 0.5, W - 1, H - 1, 14, { color: WHITE, borderColor: CREAM_200, borderWidth: 1 });

  // header strip
  const barH = 40;
  page.drawRectangle({ x: 0, y: H - barH, width: W, height: barH, color: CORAL });
  page.drawRectangle({ x: 0, y: H - 4, width: W, height: 4, color: CORAL_DARK });
  page.drawEllipse({ x: W - 20, y: H - 12, xScale: 26, yScale: 26, color: CORAL_400, opacity: 0.4 });
  text('mypet.az', 16, H - 20, 14, WHITE, true);
  text('PET PASPORTU', 16, H - 32, 6.5, WHITE);

  // photo
  const r = 30;
  const cx = 16 + r;
  const cy = H - barH - 40;
  page.drawEllipse({ x: cx, y: cy, xScale: r + 3, yScale: r + 3, color: CORAL_50 });
  const photo = pet.images[0] ? await circlePhoto(doc, pet.images[0].url, 140) : null;
  if (photo) {
    page.drawImage(photo, { x: cx - r, y: cy - r, width: r * 2, height: r * 2 });
  } else {
    const initial = (pet.name.trim()[0] ?? '?').toUpperCase();
    text(initial, cx - font.widthOfTextAtSize(initial, 26) / 2, cy - 13 + 2, 26, CORAL, true);
  }

  // name + breed
  const tx = cx + r + 14;
  const breedText = pet.breed?.name ?? pet.breedFreeText ?? pet.category.name;
  const textMaxW = W - 90 - tx;
  text(truncate(pet.name, 15, textMaxW), tx, cy + 12, 15, CORAL_DARK, true);
  text(truncate(breedText, 8.5, textMaxW), tx, cy - 2, 8.5, MUTED);

  // key facts
  const facts: [string, string][] = [['Cinsiyyət', SEX_LABEL[pet.sex] ?? pet.sex]];
  if (pet.birthDate) facts.push(['Doğum', pet.birthDate.toISOString().slice(0, 10)]);
  const chip = pet.passport?.microchipId ?? pet.microchipNo;
  if (chip) facts.push(['Mikroçip', chip]);
  let fy = cy - 20;
  for (const [label, value] of facts) {
    text(`${label}: `, tx, fy, 8, MUTED);
    text(truncate(value, 8, textMaxW - font.widthOfTextAtSize(`${label}: `, 8)), tx + font.widthOfTextAtSize(`${label}: `, 8), fy, 8, INK);
    fy -= 13;
  }

  // QR
  const qs = 66;
  const qx = W - qs - 16;
  const qTop = H - barH - 14;
  const qr = await qrImage(doc, shareUrl, 300);
  page.drawImage(qr, { x: qx, y: qTop - qs, width: qs, height: qs });
  text('Skan et', qx + (qs - font.widthOfTextAtSize('Skan et', 6.5)) / 2, qTop - qs - 9, 6.5, MUTED);

  // footer
  page.drawRectangle({ x: 16, y: 26, width: W - 32, height: 1, color: CREAM_200 });
  const doc_no = pet.passport?.documentNo ? `Sənəd: ${pet.passport.documentNo}` : 'mypet.az';
  text(truncate(doc_no, 7.5, W - 90), 16, 15, 7.5, MUTED);
  const mark = 'mypet.az';
  text(mark, W - 16 - font.widthOfTextAtSize(mark, 7.5), 15, 7.5, CORAL_DARK, true);

  return doc.save();
}
