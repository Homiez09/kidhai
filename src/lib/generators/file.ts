import { faker } from "@faker-js/faker";
import { generatePersonRecords, PersonRecord } from "@/lib/generators/person";
import { FieldKey } from "@/types/schema";

const encoder = new TextEncoder();

function byteLength(s: string): number {
  return encoder.encode(s).length;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

/** สร้างไฟล์ข้อความ .txt ขนาดตามที่กำหนดแบบเป๊ะๆ (ไบต์) ด้วยข้อความ lorem แบบ ASCII */
export function createTextBlob(sizeBytes: number): Blob {
  const chunk = faker.lorem.paragraphs(3, "\n\n") + "\n\n";
  let text = "";
  while (byteLength(text) < sizeBytes) text += chunk;
  // เนื้อหาเป็น ASCII ล้วน จึงตัดตามความยาว string ได้ตรงกับจำนวนไบต์
  text = text.slice(0, sizeBytes);
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}

/** สร้างไฟล์ binary .bin ขนาดตามที่กำหนดแบบเป๊ะๆ ด้วยไบต์สุ่ม */
export function createBinaryBlob(sizeBytes: number): Blob {
  const bytes = new Uint8Array(sizeBytes);
  const CHUNK = 65536;
  for (let offset = 0; offset < sizeBytes; offset += CHUNK) {
    const view = bytes.subarray(offset, Math.min(offset + CHUNK, sizeBytes));
    crypto.getRandomValues(view);
  }
  return new Blob([toArrayBuffer(bytes)], { type: "application/octet-stream" });
}

const CSV_FIELDS: FieldKey[] = [
  "id",
  "fullNameTh",
  "gender",
  "thaiNationalId",
  "phone",
  "email",
  "province",
  "jobTitle",
];

function recordToCsvRow(record: PersonRecord, fields: FieldKey[]): string {
  return fields
    .map((f) => {
      const v = String(record[f] ?? "");
      return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    })
    .join(",");
}

/** สร้างไฟล์ .csv ขนาดตามที่กำหนดแบบเป๊ะๆ โดยเติมข้อมูลบุคคลจริงจนเกือบเต็ม แล้วเติมบรรทัดว่างปิดท้ายให้ครบไบต์ */
export function createCsvBlob(sizeBytes: number): Blob {
  const header = CSV_FIELDS.join(",") + "\n";
  let content = header;
  let index = 0;
  while (byteLength(content) < sizeBytes) {
    const row = recordToCsvRow(generatePersonRecords(1).map((r) => ({ ...r, id: index + 1 }))[0], CSV_FIELDS);
    const candidate = content + row + "\n";
    if (byteLength(candidate) > sizeBytes) break;
    content = candidate;
    index++;
  }
  const remaining = sizeBytes - byteLength(content);
  if (remaining > 0) content += "\n".repeat(remaining);
  return new Blob([content], { type: "text/csv;charset=utf-8" });
}

/** สร้างไฟล์ .json ขนาดตามที่กำหนดแบบเป๊ะๆ (ยังคงเป็น JSON ที่ valid) โดยเติม field ปิดท้ายให้ครบไบต์ */
export function createJsonBlob(sizeBytes: number): Blob {
  const records: PersonRecord[] = [];
  while (true) {
    const candidateRecords = [...records, generatePersonRecords(1)[0]];
    const json = JSON.stringify(candidateRecords);
    if (byteLength(json) > sizeBytes - 30) break;
    records.push(candidateRecords[candidateRecords.length - 1]);
  }

  const base = JSON.stringify(records);
  const withoutContent = records.length > 0 ? base.slice(0, -1) + ',{"_pad":""}]' : '[{"_pad":""}]';
  const overheadBytes = byteLength(withoutContent);
  const remaining = Math.max(0, sizeBytes - overheadBytes);
  const padding = "x".repeat(remaining);
  const finalJson = records.length > 0 ? base.slice(0, -1) + `,{"_pad":"${padding}"}]` : `[{"_pad":"${padding}"}]`;
  return new Blob([finalJson], { type: "application/json;charset=utf-8" });
}

export type ImageFormat = "png" | "jpeg";

/** สร้างไฟล์ภาพ placeholder ตามขนาด (พิกเซล) และเติม padding ท้ายไฟล์ให้ได้ขนาดไบต์ตามต้องการ (ยังเปิดดูรูปได้ปกติ) */
export async function createImageBlob(opts: {
  width: number;
  height: number;
  format: ImageFormat;
  quality?: number;
  targetSizeBytes?: number;
}): Promise<{ blob: Blob; actualSize: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext("2d")!;

  const c1 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  const c2 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;
  const gradient = ctx.createLinearGradient(0, 0, opts.width, opts.height);
  gradient.addColorStop(0, c1);
  gradient.addColorStop(1, c2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, opts.width, opts.height);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `${Math.max(14, Math.floor(opts.width / 12))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${opts.width} x ${opts.height}`, opts.width / 2, opts.height / 2);

  const mime = opts.format === "png" ? "image/png" : "image/jpeg";
  const baseBlob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), mime, opts.quality ?? 0.9)
  );

  if (!opts.targetSizeBytes || opts.targetSizeBytes <= baseBlob.size) {
    return { blob: baseBlob, actualSize: baseBlob.size };
  }

  const baseBytes = new Uint8Array(await baseBlob.arrayBuffer());
  const paddingSize = opts.targetSizeBytes - baseBytes.length;
  const combined = new Uint8Array(opts.targetSizeBytes);
  combined.set(baseBytes, 0);
  const CHUNK = 65536;
  for (let offset = 0; offset < paddingSize; offset += CHUNK) {
    const view = combined.subarray(baseBytes.length + offset, baseBytes.length + Math.min(offset + CHUNK, paddingSize));
    crypto.getRandomValues(view);
  }
  const finalBlob = new Blob([toArrayBuffer(combined)], { type: mime });
  return { blob: finalBlob, actualSize: finalBlob.size };
}

/**
 * สร้างไฟล์ PDF โดยประมาณขนาดที่กำหนด (เพิ่มจำนวนหน้าจนใกล้เคียงเป้าหมาย)
 *
 * หมายเหตุ: pdf-lib ใช้เวลา save() นานขึ้นอย่างรวดเร็วเมื่อจำนวนหน้าเยอะขึ้น (ทดสอบแล้วพบว่า
 * ~390 หน้าใช้เวลา save() เพียงอย่างเดียวเกือบ 15 วินาที) จึงจำกัดขนาดสูงสุดของ PDF ไว้ที่
 * ระดับที่ยังตอบสนองเร็ว (ดู MAX_BYTES.pdf ใน FileGenerator) และประเมินจำนวนหน้าจากตัวอย่าง
 * ก่อนเพิ่มเป็นชุดใหญ่ เพื่อลดจำนวนครั้งที่ต้อง save() เอกสารทั้งหมด
 */
export async function createPdfBlob(targetSizeBytes: number): Promise<{ blob: Blob; actualSize: number }> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const MAX_PAGES = 120;

  function fillPage(page: import("pdf-lib").PDFPage, pageIndex: number) {
    let y = 800;
    while (y >= 60) {
      // ใช้ font มาตรฐาน (WinAnsi) ซึ่งรองรับเฉพาะอักษรละติน จึงใช้ข้อความ filler ภาษาอังกฤษ
      page.drawText(`Test document page ${pageIndex} - ${faker.lorem.words(8)}`, {
        x: 40,
        y,
        size: 11,
        font,
        color: rgb(0.15, 0.15, 0.2),
      });
      y -= 18;
    }
  }

  let pageCount = 0;
  let bytes = await pdfDoc.save();
  let lastBytes = bytes.length;

  while (bytes.length < targetSizeBytes && pageCount < MAX_PAGES) {
    pageCount++;
    fillPage(pdfDoc.addPage([595, 842]), pageCount);
    bytes = await pdfDoc.save();
    const perPage = bytes.length - lastBytes;
    lastBytes = bytes.length;
    if (perPage <= 0) break;

    const remaining = targetSizeBytes - bytes.length;
    if (remaining <= 0) break;

    const bulkPages = Math.min(MAX_PAGES - pageCount, Math.max(0, Math.floor(remaining / perPage) - 1));
    for (let i = 0; i < bulkPages; i++) {
      pageCount++;
      fillPage(pdfDoc.addPage([595, 842]), pageCount);
    }
    if (bulkPages > 0) {
      bytes = await pdfDoc.save();
      lastBytes = bytes.length;
    }
  }

  const blob = new Blob([toArrayBuffer(bytes)], { type: "application/pdf" });
  return { blob, actualSize: blob.size };
}

export function bundleFilesAsZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  return import("jszip").then(({ default: JSZip }) => {
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f.blob);
    return zip.generateAsync({ type: "blob" });
  });
}
