import { randInt } from "@/lib/random";

export const THAI_ID_TYPES: Record<number, string> = {
  1: "คนไทยที่เกิดและมีสัญชาติไทย แจ้งเกิดตามกำหนดเวลา",
  2: "คนไทยที่เกิดและมีสัญชาติไทย แจ้งเกิดเกินกำหนดเวลา",
  3: "คนไทยหรือคนต่างด้าวที่มีใบสำคัญต่างด้าว มีชื่อในทะเบียนบ้านเดิม (ก่อน 31 พ.ค. 2527)",
  4: "คนไทยหรือคนต่างด้าวที่มีใบสำคัญต่างด้าว แต่แจ้งเพิ่มชื่อเกินกำหนด",
  5: "คนไทยที่ได้รับอนุมัติให้เพิ่มชื่อในทะเบียนบ้าน (กรณีตกสำรวจ)",
  6: "ผู้เข้าเมืองโดยไม่ชอบด้วยกฎหมาย หรือชนกลุ่มน้อย",
  7: "บุตรของบุคคลประเภทที่ 6 ที่เกิดในประเทศไทย",
  8: "คนต่างด้าวที่ได้รับสัญชาติไทย หรือแปลงสัญชาติถูกต้องตามกฎหมาย",
};

/**
 * สร้างเลขบัตรประชาชนไทย 13 หลักแบบสุ่ม พร้อม check digit ที่ถูกต้องตามสูตรราชการ
 * @param firstDigit เลือกระบุประเภทบุคคล (1-8) หรือปล่อยว่างเพื่อสุ่ม
 */
export function generateThaiNationalId(firstDigit?: number): string {
  const digits: number[] = [];
  const d1 = firstDigit && firstDigit >= 1 && firstDigit <= 8 ? firstDigit : randInt(1, 8);
  digits.push(d1);

  for (let i = 1; i < 12; i++) digits.push(randInt(0, 9));

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  digits.push(checkDigit);

  return digits.join("");
}

export function formatThaiNationalId(id: string): string {
  const clean = id.replace(/\D/g, "");
  if (clean.length !== 13) return id;
  return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`;
}

export function isValidThaiNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i], 10) * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(digits[12], 10);
}

export interface ThaiIdExplanation {
  cleanId: string;
  formatted: string;
  isValid: boolean;
  length: number;
  firstDigit: number | null;
  firstDigitMeaning: string;
  actualCheckDigit: number | null;
  expectedCheckDigit: number | null;
  steps: { position: number; digit: number; multiplier: number; product: number }[];
  sum: number;
  mod11: number;
  ruleFormula: string;
}

/**
 * วิเคราะห์และแจกแจงโครงสร้างเลขบัตรประชาชน 13 หลัก พร้อมขั้นตอนการคำนวณ Check Digit
 */
export function explainThaiNationalId(rawInput: string): ThaiIdExplanation {
  const clean = rawInput.replace(/\D/g, "");
  const length = clean.length;

  if (length < 12) {
    return {
      cleanId: clean,
      formatted: clean,
      isValid: false,
      length,
      firstDigit: length > 0 ? parseInt(clean[0], 10) : null,
      firstDigitMeaning: length > 0 ? THAI_ID_TYPES[parseInt(clean[0], 10)] ?? "ไม่ระบุประเภท" : "",
      actualCheckDigit: null,
      expectedCheckDigit: null,
      steps: [],
      sum: 0,
      mod11: 0,
      ruleFormula: "",
    };
  }

  const digits = clean.split("").map((c) => parseInt(c, 10));
  const steps: { position: number; digit: number; multiplier: number; product: number }[] = [];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = digits[i];
    const multiplier = 13 - i;
    const product = digit * multiplier;
    sum += product;
    steps.push({ position: i + 1, digit, multiplier, product });
  }

  const mod11 = sum % 11;
  const expectedCheckDigit = (11 - mod11) % 10;
  const actualCheckDigit = length === 13 ? digits[12] : null;
  const isValid = actualCheckDigit !== null && actualCheckDigit === expectedCheckDigit;
  const firstDigit = digits[0];

  return {
    cleanId: clean,
    formatted: formatThaiNationalId(clean),
    isValid,
    length,
    firstDigit,
    firstDigitMeaning: THAI_ID_TYPES[firstDigit] ?? "รหัสประเภทบุคคลพิเศษ/สำรอง",
    actualCheckDigit,
    expectedCheckDigit,
    steps,
    sum,
    mod11,
    ruleFormula: `(11 - (${sum} % 11)) % 10 = (11 - ${mod11}) % 10 = ${expectedCheckDigit}`,
  };
}

/**
 * เลขประจำตัวผู้เสียภาษี (นิติบุคคล) 13 หลัก ใช้อัลกอริทึมเดียวกับบัตรประชาชนสำหรับความสมจริง
 */
export function generateTaxId(): string {
  const digits: number[] = [randInt(0, 9)];
  for (let i = 1; i < 12; i++) digits.push(randInt(0, 9));
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  digits.push(checkDigit);
  return digits.join("");
}

export function isValidTaxId(id: string): boolean {
  return isValidThaiNationalId(id);
}

export interface TaxIdExplanation {
  cleanId: string;
  isValid: boolean;
  length: number;
  actualCheckDigit: number | null;
  expectedCheckDigit: number | null;
  ruleFormula: string;
}

export function explainTaxId(rawInput: string): TaxIdExplanation {
  const clean = rawInput.replace(/\D/g, "");
  const length = clean.length;
  if (length < 12) {
    return {
      cleanId: clean,
      isValid: false,
      length,
      actualCheckDigit: null,
      expectedCheckDigit: null,
      ruleFormula: "",
    };
  }

  const digits = clean.split("").map((c) => parseInt(c, 10));
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }
  const mod11 = sum % 11;
  const expectedCheckDigit = (11 - mod11) % 10;
  const actualCheckDigit = length === 13 ? digits[12] : null;
  const isValid = actualCheckDigit !== null && actualCheckDigit === expectedCheckDigit;

  return {
    cleanId: clean,
    isValid,
    length,
    actualCheckDigit,
    expectedCheckDigit,
    ruleFormula: `(11 - (${sum} % 11)) % 10 = ${expectedCheckDigit}`,
  };
}
