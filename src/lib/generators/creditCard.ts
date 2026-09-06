import { randInt } from "@/lib/random";

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "JCB" | "Discover" | "UnionPay";

export const CARD_BRANDS: CardBrand[] = ["Visa", "Mastercard", "Amex", "JCB", "Discover", "UnionPay"];

interface BrandSpec {
  length: number;
  cvvLength: number;
  prefixes: () => string;
  gaps: number[]; // ตำแหน่งที่เว้นวรรคตอนแสดงผล
}

const BRAND_SPECS: Record<CardBrand, BrandSpec> = {
  Visa: { length: 16, cvvLength: 3, prefixes: () => "4", gaps: [4, 8, 12] },
  Mastercard: {
    length: 16,
    cvvLength: 3,
    prefixes: () => {
      // 51-55 หรือช่วง 2221-2720
      if (Math.random() < 0.5) return String(randInt(51, 55));
      return String(randInt(2221, 2720));
    },
    gaps: [4, 8, 12],
  },
  Amex: { length: 15, cvvLength: 4, prefixes: () => (Math.random() < 0.5 ? "34" : "37"), gaps: [4, 10] },
  JCB: { length: 16, cvvLength: 3, prefixes: () => String(randInt(3528, 3589)), gaps: [4, 8, 12] },
  Discover: { length: 16, cvvLength: 3, prefixes: () => "6011", gaps: [4, 8, 12] },
  UnionPay: { length: 16, cvvLength: 3, prefixes: () => "62", gaps: [4, 8, 12] },
};

function luhnCheckDigit(partial: string): number {
  let sum = 0;
  let alt = true; // digit ขวาสุดของ partial จะกลายเป็นตัวที่สองจากท้ายสุดของเลขเต็ม -> คูณ 2
  for (let i = partial.length - 1; i >= 0; i--) {
    let n = parseInt(partial[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateCardNumber(brand: CardBrand): string {
  const spec = BRAND_SPECS[brand];
  let number = spec.prefixes();
  while (number.length < spec.length - 1) number += randInt(0, 9);
  const check = luhnCheckDigit(number);
  return number + check;
}

export function formatCardNumber(brand: CardBrand, number: string): string {
  const spec = BRAND_SPECS[brand];
  const parts: string[] = [];
  let last = 0;
  for (const gap of spec.gaps) {
    parts.push(number.slice(last, gap));
    last = gap;
  }
  parts.push(number.slice(last));
  return parts.join(" ");
}

export function generateCvv(brand: CardBrand): string {
  const spec = BRAND_SPECS[brand];
  let s = "";
  for (let i = 0; i < spec.cvvLength; i++) s += randInt(0, 9);
  return s;
}

export function generateExpiry(): { month: string; year: string; display: string } {
  const now = new Date();
  const monthsAhead = randInt(3, 48);
  const d = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return { month, year, display: `${month}/${year}` };
}

export function isValidLuhn(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 2) return false;
  return luhnCheckDigit(digits.slice(0, -1)) === parseInt(digits[digits.length - 1], 10);
}
