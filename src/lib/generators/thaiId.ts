import { randInt } from "@/lib/random";

/**
 * สร้างเลขบัตรประชาชนไทย 13 หลักแบบสุ่ม พร้อม check digit ที่ถูกต้องตามสูตรราชการ
 * (ใช้สำหรับทดสอบระบบเท่านั้น ไม่ใช่เลขบัตรของบุคคลจริง)
 */
export function generateThaiNationalId(): string {
  const digits: number[] = [];
  digits.push(randInt(1, 8)); // หลักแรกตามหลักจริงมักไม่ใช้ 0/9 แบบสุ่มเต็ม
  for (let i = 1; i < 12; i++) digits.push(randInt(0, 9));

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  digits.push(checkDigit);

  return digits.join("");
}

export function formatThaiNationalId(id: string): string {
  if (id.length !== 13) return id;
  return `${id[0]}-${id.slice(1, 5)}-${id.slice(5, 10)}-${id.slice(10, 12)}-${id[12]}`;
}

export function isValidThaiNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i], 10) * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(digits[12], 10);
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
