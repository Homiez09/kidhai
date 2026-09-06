"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, FileStack, Moon, Sun, Sparkles, History } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { PersonGenerator } from "@/components/features/PersonGenerator";
import { CreditCardGenerator } from "@/components/features/CreditCardGenerator";
import { FileGenerator } from "@/components/features/FileGenerator";
import { HistoryPanel } from "@/components/features/HistoryPanel";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS, SITE_NAME } from "@/lib/site";

type TabKey = "person" | "card" | "file" | "history";

const TABS: { key: TabKey; label: string; icon: typeof Users; description: string }[] = [
  { key: "person", label: "ข้อมูลบุคคล", icon: Users, description: "ชื่อ, บัตรประชาชน, ที่อยู่ ฯลฯ" },
  { key: "card", label: "บัตรเครดิต", icon: CreditCard, description: "เลขบัตรทดสอบทุกค่าย" },
  { key: "file", label: "ไฟล์ทดสอบ", icon: FileStack, description: "ไฟล์ทุกชนิด ทุกขนาด" },
  { key: "history", label: "ประวัติ", icon: History, description: "ชุดข้อมูลที่สร้างล่าสุด" },
];

export function AppShell() {
  const [tab, setTab] = useState<TabKey>("person");
  const { theme, toggle } = useTheme();

  return (
    <div id="app" className="flex w-full items-start scroll-mt-6">
      <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] w-64 shrink-0 flex-col gap-5 self-start overflow-y-auto rounded-r-3xl px-4 py-5 glass md:flex scrollbar-thin">
        <div className="flex items-center gap-2.5 px-2">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground"
            animate={{ boxShadow: ["0 0 0 0 var(--accent)", "0 0 16px 2px var(--accent)", "0 0 0 0 var(--accent)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={18} />
          </motion.div>
          <div>
            <p className="text-sm font-bold leading-tight">{SITE_NAME}</p>
            <p className="text-[11px] text-muted leading-tight">Mock Data Studio</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  active ? "text-accent-foreground" : "text-foreground hover:bg-surface-2"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-accent shadow-sm shadow-accent/30"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={17} className={cn("relative z-10", active ? "opacity-100" : "opacity-70")} />
                <div className="relative z-10">
                  <p className="text-sm font-medium leading-tight">{t.label}</p>
                  <p className={cn("text-[11px] leading-tight", active ? "opacity-80" : "text-muted")}>
                    {t.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        <AdSlot slotId={AD_SLOTS.sidebar} format="rectangle" minHeight={250} className="mt-auto" />

        <div className="flex flex-col gap-3 px-1">
          <div className="glass-2 rounded-xl p-3 text-[11px] text-muted leading-relaxed">
            ข้อมูลทั้งหมดสร้างขึ้นแบบสุ่มเพื่อใช้ทดสอบระบบเท่านั้น ไม่ใช่ข้อมูลบุคคลหรือบัตรจริง
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={toggle}
            className="glass-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
          </motion.button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex md:hidden items-center justify-between rounded-b-2xl px-4 py-3 glass">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles size={16} />
            </div>
            <p className="text-sm font-bold">{SITE_NAME}</p>
          </div>
          <button onClick={toggle} className="glass-2 rounded-lg p-2">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        <nav className="flex md:hidden gap-1 overflow-x-auto px-3 py-2 scrollbar-thin glass">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                  active ? "text-accent-foreground" : "text-muted"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill-mobile"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <AdSlot slotId={AD_SLOTS.topBanner} format="horizontal" minHeight={90} className="hidden sm:flex" />

            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {tab === "person" && <PersonGenerator />}
              {tab === "card" && <CreditCardGenerator />}
              {tab === "file" && <FileGenerator />}
              {tab === "history" && <HistoryPanel />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
