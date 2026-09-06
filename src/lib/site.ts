export const SITE_NAME = "KidHai";
export const SITE_URL = "https://kidhai.phumrapee.com";
export const SITE_TAGLINE = "เครื่องมือสร้างข้อมูลทดสอบ (Mock Data Generator) สำหรับนักพัฒนาและ QA";
export const SITE_DESCRIPTION =
  "KidHai คือเว็บแอปสร้างข้อมูลทดสอบ (test data / mock data generator) ฟรี ใช้สุ่มชื่อ-นามสกุลไทย, เลขบัตรประชาชน, เลขบัตรเครดิตทดสอบ, ที่อยู่, อีเมล และไฟล์ทดสอบทุกขนาด (TXT, CSV, JSON, รูปภาพ, PDF) พร้อม export เป็น JSON/CSV และดาวน์โหลดได้ทันที เหมาะสำหรับทดสอบระบบ ทำ QA และพัฒนาแอปพลิเคชัน";
export const SITE_KEYWORDS = [
  "สร้างข้อมูลทดสอบ",
  "mock data generator",
  "test data generator ภาษาไทย",
  "สุ่มเลขบัตรประชาชน",
  "เลขบัตรประชาชนปลอมสำหรับทดสอบ",
  "สุ่มเลขบัตรเครดิตทดสอบ",
  "fake data generator",
  "generate ข้อมูลทดสอบ",
  "สร้างไฟล์ทดสอบขนาดต่างๆ",
  "KidHai",
  "kidhai",
];

// ตั้งค่า NEXT_PUBLIC_ADSENSE_CLIENT_ID ใน .env.local เพื่อเปิดใช้งานโฆษณา Google AdSense จริง
// ดูวิธีตั้งค่าแบบละเอียดได้ที่ docs/google-adsense-setup.md
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
export const ADSENSE_ENABLED = ADSENSE_CLIENT_ID.length > 0;

// ใส่ ad slot ID ที่ได้จาก AdSense dashboard ต่อ .env.local ทีละตำแหน่ง (ดู docs/google-adsense-setup.md)
// ถ้าไม่ตั้งค่า ตำแหน่งนั้นจะแสดง placeholder แทนโฆษณาจริงโดยอัตโนมัติ
export const AD_SLOTS = {
  topBanner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT,
} as const;
