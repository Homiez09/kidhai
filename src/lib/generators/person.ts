import { faker } from "@faker-js/faker";
import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  THAI_PROVINCES,
  THAI_DISTRICT_PREFIXES,
  THAI_DISTRICT_SUFFIXES,
  COMPANY_SUFFIXES_TH,
  COMPANY_WORDS_TH,
  JOB_TITLES_TH,
  BANK_NAMES_TH,
} from "@/lib/data/thai-names";
import { generateThaiNationalId, generateTaxId } from "@/lib/generators/thaiId";
import { generateCardNumber, generateCvv, generateExpiry, CARD_BRANDS, CardBrand } from "@/lib/generators/creditCard";
import { randInt, pick, randomDigits, randomAlphaNumeric, uuidV4, randomDate, pad } from "@/lib/random";
import type { FieldKey } from "@/types/schema";

export type PersonRecord = Record<FieldKey, string | number>;

function thaiPhoneNumber(): string {
  const prefixes = ["06", "08", "09"];
  return `${pick(prefixes)}${randomDigits(8)}`;
}

function thaiPostalCode(): string {
  return String(randInt(10000, 96999));
}

function bankAccountNumber(): string {
  return randomDigits(10);
}

function ipAddress(): string {
  return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function macAddress(): string {
  const parts = [];
  for (let i = 0; i < 6; i++) parts.push(Math.floor(Math.random() * 256).toString(16).padStart(2, "0"));
  return parts.join(":").toUpperCase();
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
];

export function generatePersonRecord(index: number): PersonRecord {
  const isMale = Math.random() < 0.5;
  const gender = isMale ? "ชาย" : "หญิง";
  const titleTh = isMale ? "นาย" : pick(["นาง", "นางสาว"]);
  // เลือกชื่อ/นามสกุลเป็นคู่เดียวกันทั้งไทย-อังกฤษ (en เป็นคำทับศัพท์ของ th) เพื่อไม่ให้ชื่อสองภาษาไม่ตรงกัน
  const firstName = pick(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const firstNameTh = firstName.th;
  const lastNameTh = lastName.th;
  const firstNameEn = firstName.en;
  const lastNameEn = lastName.en;

  const dob = randomDate(new Date(1955, 0, 1), new Date(2008, 11, 31));
  const age = Math.max(0, new Date().getFullYear() - dob.getFullYear());

  const province = pick(THAI_PROVINCES);
  const district = `${pick(THAI_DISTRICT_PREFIXES)}${pick(THAI_DISTRICT_SUFFIXES)}`;

  const brand: CardBrand = pick(CARD_BRANDS);
  const expiry = generateExpiry();

  const emailHandle = `${firstNameEn}.${lastNameEn}${randInt(1, 999)}`.toLowerCase();

  const record: PersonRecord = {
    id: index + 1,
    titleTh,
    firstNameTh,
    lastNameTh,
    fullNameTh: `${titleTh}${firstNameTh} ${lastNameTh}`,
    firstNameEn,
    lastNameEn,
    fullNameEn: `${firstNameEn} ${lastNameEn}`,
    gender,
    dob: `${pad(dob.getDate(), 2)}/${pad(dob.getMonth() + 1, 2)}/${dob.getFullYear() + 543}`,
    age,
    // เลขทั้งหมดด้านล่างเป็นตัวเลขล้วน ไม่มีขีด/วรรค เพื่อให้คัดลอกไปใช้ในฟอร์มได้ทันที
    thaiNationalId: generateThaiNationalId(),
    phone: thaiPhoneNumber(),
    email: `${emailHandle}@${pick(["example.com", "mail.test", "testmail.dev"])}`,
    username: `${firstNameEn.toLowerCase()}${randInt(10, 999)}`,
    password: randomAlphaNumeric(12),
    addressTh: `${randInt(1, 399)}/${randInt(1, 99)} หมู่ ${randInt(1, 15)} ถนน${pick(LAST_NAMES).th}`,
    province,
    district,
    postalCode: thaiPostalCode(),
    companyName: `บริษัท ${pick(COMPANY_WORDS_TH)} ${pick(COMPANY_SUFFIXES_TH)}`,
    taxId: generateTaxId(),
    jobTitle: pick(JOB_TITLES_TH),
    bankName: pick(BANK_NAMES_TH),
    bankAccountNumber: bankAccountNumber(),
    creditCardBrand: brand,
    creditCardNumber: generateCardNumber(brand),
    creditCardExpiry: expiry.display,
    creditCardCvv: generateCvv(brand),
    uuid: uuidV4(),
    ipAddress: ipAddress(),
    macAddress: macAddress(),
    userAgent: pick(USER_AGENTS),
    avatarUrl: `https://i.pravatar.cc/150?u=${uuidV4()}`,
    createdAt: new Date().toISOString(),
    loremText: faker.lorem.sentence(randInt(6, 14)),
  };

  return record;
}

export function generatePersonRecords(count: number): PersonRecord[] {
  return Array.from({ length: count }, (_, i) => generatePersonRecord(i));
}
