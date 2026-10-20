import { pick, randomDigits } from "@/lib/random";

export type PhoneFormat = "raw" | "hyphen" | "inter";

const MOBILE_PREFIXES = [
  "061", "062", "063", "064", "065",
  "080", "081", "082", "083", "084", "085", "086", "087", "088", "089",
  "090", "091", "092", "093", "094", "095", "096", "097", "098", "099",
] as const;

const LANDLINE_PREFIXES: Record<string, string[]> = {
  bkk: ["02"],
  north: ["052", "053", "054", "055", "056"],
  northeast: ["042", "043", "044", "045"],
  central: ["032", "034", "035", "036", "037", "038", "039"],
  south: ["073", "074", "075", "076", "077"],
};

export function generateThaiMobile(format: PhoneFormat = "raw"): string {
  const prefix = pick(MOBILE_PREFIXES);
  const mid = randomDigits(3);
  const last = randomDigits(4);
  const raw = `${prefix}${mid}${last}`;

  if (format === "hyphen") {
    return `${prefix}-${mid}-${last}`;
  }
  if (format === "inter") {
    return `+66${raw.slice(1)}`;
  }
  return raw;
}

export function generateThaiLandline(
  region: "bkk" | "upcountry" = "bkk",
  format: PhoneFormat = "raw"
): string {
  if (region === "bkk") {
    const mid = randomDigits(3);
    const last = randomDigits(4);
    const raw = `02${mid}${last}`;
    if (format === "hyphen") return `02-${mid}-${last}`;
    if (format === "inter") return `+662${mid}${last}`;
    return raw;
  }

  const allUpcountry = [
    ...LANDLINE_PREFIXES.north,
    ...LANDLINE_PREFIXES.northeast,
    ...LANDLINE_PREFIXES.central,
    ...LANDLINE_PREFIXES.south,
  ];
  const prefix = pick(allUpcountry);
  const mid = randomDigits(3);
  const last = randomDigits(3);
  const raw = `${prefix}${mid}${last}`;
  if (format === "hyphen") return `${prefix}-${mid}-${last}`;
  if (format === "inter") return `+66${raw.slice(1)}`;
  return raw;
}

export interface PhoneValidation {
  cleanPhone: string;
  isValid: boolean;
  length: number;
  type: "mobile" | "landline_bkk" | "landline_upcountry" | "unknown";
  typeName: string;
  formatted: string;
}

export function validateThaiPhone(raw: string): PhoneValidation {
  const clean = raw.replace(/\D/g, "");
  const length = clean.length;

  if (length === 10 && ["06", "08", "09"].some((p) => clean.startsWith(p))) {
    return {
      cleanPhone: clean,
      isValid: true,
      length,
      type: "mobile",
      typeName: "เบอร์โทรศัพท์มือถือ (10 หลัก)",
      formatted: `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`,
    };
  }

  if (length === 9 && clean.startsWith("02")) {
    return {
      cleanPhone: clean,
      isValid: true,
      length,
      type: "landline_bkk",
      typeName: "เบอร์บ้าน/สำนักงาน กรุงเทพและปริมณฑล (9 หลัก)",
      formatted: `02-${clean.slice(2, 5)}-${clean.slice(5)}`,
    };
  }

  if (length === 9 && ["03", "04", "05", "07"].some((p) => clean.startsWith(p))) {
    return {
      cleanPhone: clean,
      isValid: true,
      length,
      type: "landline_upcountry",
      typeName: "เบอร์บ้าน/สำนักงาน ต่างจังหวัด (9 หลัก)",
      formatted: `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`,
    };
  }

  return {
    cleanPhone: clean,
    isValid: false,
    length,
    type: "unknown",
    typeName: length > 0 ? "หมายเลขไม่ตรงกับรูปแบบเบอร์โทรศัพท์ไทย" : "",
    formatted: clean,
  };
}
