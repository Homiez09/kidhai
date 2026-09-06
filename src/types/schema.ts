export type FieldKey =
  | "id"
  | "titleTh"
  | "firstNameTh"
  | "lastNameTh"
  | "fullNameTh"
  | "firstNameEn"
  | "lastNameEn"
  | "fullNameEn"
  | "gender"
  | "dob"
  | "age"
  | "thaiNationalId"
  | "phone"
  | "email"
  | "username"
  | "password"
  | "addressTh"
  | "province"
  | "district"
  | "postalCode"
  | "companyName"
  | "taxId"
  | "jobTitle"
  | "bankName"
  | "bankAccountNumber"
  | "creditCardBrand"
  | "creditCardNumber"
  | "creditCardExpiry"
  | "creditCardCvv"
  | "uuid"
  | "ipAddress"
  | "macAddress"
  | "userAgent"
  | "avatarUrl"
  | "createdAt"
  | "loremText";

export interface FieldDef {
  key: FieldKey;
  label: string;
  group: FieldGroup;
  defaultOn?: boolean;
}

export type FieldGroup = "identity" | "contact" | "business" | "finance" | "technical" | "misc";

export const FIELD_GROUPS: { key: FieldGroup; label: string }[] = [
  { key: "identity", label: "ข้อมูลส่วนบุคคล" },
  { key: "contact", label: "ที่อยู่ & การติดต่อ" },
  { key: "business", label: "ธุรกิจ & อาชีพ" },
  { key: "finance", label: "การเงิน & ธนาคาร" },
  { key: "technical", label: "ข้อมูลทางเทคนิค" },
  { key: "misc", label: "อื่นๆ" },
];

export const FIELD_DEFS: FieldDef[] = [
  { key: "id", label: "ลำดับ (ID)", group: "identity", defaultOn: true },
  { key: "titleTh", label: "คำนำหน้า", group: "identity", defaultOn: true },
  { key: "firstNameTh", label: "ชื่อจริง (ไทย)", group: "identity", defaultOn: true },
  { key: "lastNameTh", label: "นามสกุล (ไทย)", group: "identity", defaultOn: true },
  { key: "fullNameTh", label: "ชื่อ-นามสกุล (ไทย)", group: "identity" },
  { key: "firstNameEn", label: "First Name (EN)", group: "identity" },
  { key: "lastNameEn", label: "Last Name (EN)", group: "identity" },
  { key: "fullNameEn", label: "Full Name (EN)", group: "identity" },
  { key: "gender", label: "เพศ", group: "identity" },
  { key: "dob", label: "วันเกิด", group: "identity" },
  { key: "age", label: "อายุ", group: "identity" },
  { key: "thaiNationalId", label: "เลขบัตรประชาชน", group: "identity", defaultOn: true },

  { key: "phone", label: "เบอร์โทรศัพท์", group: "contact", defaultOn: true },
  { key: "email", label: "อีเมล", group: "contact", defaultOn: true },
  { key: "username", label: "ชื่อผู้ใช้", group: "contact" },
  { key: "password", label: "รหัสผ่านทดสอบ", group: "contact" },
  { key: "addressTh", label: "ที่อยู่ (บ้านเลขที่/ถนน)", group: "contact" },
  { key: "province", label: "จังหวัด", group: "contact" },
  { key: "district", label: "อำเภอ/เขต", group: "contact" },
  { key: "postalCode", label: "รหัสไปรษณีย์", group: "contact" },

  { key: "companyName", label: "ชื่อบริษัท", group: "business" },
  { key: "taxId", label: "เลขผู้เสียภาษี", group: "business" },
  { key: "jobTitle", label: "ตำแหน่งงาน", group: "business" },

  { key: "bankName", label: "ธนาคาร", group: "finance" },
  { key: "bankAccountNumber", label: "เลขบัญชีธนาคาร", group: "finance" },
  { key: "creditCardBrand", label: "ประเภทบัตร", group: "finance" },
  { key: "creditCardNumber", label: "เลขบัตรเครดิต", group: "finance" },
  { key: "creditCardExpiry", label: "วันหมดอายุบัตร", group: "finance" },
  { key: "creditCardCvv", label: "CVV", group: "finance" },

  { key: "uuid", label: "UUID", group: "technical" },
  { key: "ipAddress", label: "IP Address", group: "technical" },
  { key: "macAddress", label: "MAC Address", group: "technical" },
  { key: "userAgent", label: "User Agent", group: "technical" },
  { key: "avatarUrl", label: "Avatar URL", group: "technical" },
  { key: "createdAt", label: "วันที่สร้าง (timestamp)", group: "technical" },

  { key: "loremText", label: "ข้อความสุ่ม (Lorem)", group: "misc" },
];

export const DEFAULT_SELECTED_FIELDS: FieldKey[] = FIELD_DEFS.filter((f) => f.defaultOn).map((f) => f.key);
