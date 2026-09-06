import { Users, CreditCard, FileStack, ArrowDown } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const FEATURES = [
  { icon: Users, label: "ข้อมูลบุคคลไทย/อังกฤษ 30+ ฟิลด์" },
  { icon: CreditCard, label: "เลขบัตรเครดิตทดสอบทุกค่าย (Luhn valid)" },
  { icon: FileStack, label: "ไฟล์ทดสอบทุกชนิด ทุกขนาด" },
];

export function MarketingHero() {
  return (
    <section className="px-4 pt-10 pb-4 md:px-8 md:pt-14">
      <div className="mx-auto max-w-4xl text-center">
        <span className="glass-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-muted">
          ฟรี 100% • ไม่ต้องสมัครสมาชิก
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          {SITE_NAME} — {SITE_TAGLINE}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
          เว็บแอปสำหรับสุ่มสร้างข้อมูลทดสอบ (mock data / test data generator) ครบวงจร ทั้งชื่อ-นามสกุลไทย,
          เลขบัตรประชาชน, เลขบัตรเครดิตทดสอบ, ที่อยู่, อีเมล และไฟล์ทดสอบขนาดต่างๆ (TXT, CSV, JSON, รูปภาพ, PDF)
          พร้อม export เป็น JSON/CSV ได้ทันที — เหมาะสำหรับนักพัฒนา, QA และทีมทดสอบระบบที่ต้องการ temp data
          จำนวนมากอย่างรวดเร็วและปลอดภัย โดยไม่ใช้ข้อมูลบุคคลจริง
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="glass-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground"
            >
              <f.icon size={13} className="text-accent" />
              {f.label}
            </span>
          ))}
        </div>

        <a
          href="#app"
          className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/25 transition-transform hover:scale-[1.02] active:scale-95"
        >
          เริ่มสร้างข้อมูลทดสอบ
          <ArrowDown size={15} />
        </a>
      </div>
    </section>
  );
}
