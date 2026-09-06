"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Download, ClipboardCopy, Eye, EyeOff, LayoutGrid, Table2, Braces } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn, copyToClipboard } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import {
  CARD_BRANDS,
  CardBrand,
  generateCardNumber,
  formatCardNumber,
  generateCvv,
  generateExpiry,
} from "@/lib/generators/creditCard";
import { pick } from "@/lib/random";
import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES } from "@/lib/data/thai-names";
import { addHistoryEntry } from "@/lib/history";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/site";

interface CardRecord {
  brand: CardBrand;
  /** เลขบัตรแบบตัวเลขล้วน ไม่มีวรรค เหมาะสำหรับคัดลอกไปใช้ในฟอร์มทดสอบ */
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
}

const BRAND_GRADIENTS: Record<CardBrand, string> = {
  Visa: "from-[#1a1f71] to-[#3b5bdb]",
  Mastercard: "from-[#232323] to-[#4a4a4a]",
  Amex: "from-[#0f6fa8] to-[#1a8fd1]",
  JCB: "from-[#0b6e4f] to-[#12a26e]",
  Discover: "from-[#7a4600] to-[#e77817]",
  UnionPay: "from-[#7a1f2b] to-[#b5303f]",
};

function randomHolderName(locale: "th" | "en"): string {
  const isMale = Math.random() < 0.5;
  const first = pick(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
  const last = pick(LAST_NAMES);
  if (locale === "th") return `${first.th} ${last.th}`;
  return `${first.en} ${last.en}`.toUpperCase();
}

function generateCard(brandFilter: CardBrand | "All", locale: "th" | "en"): CardRecord {
  const brand = brandFilter === "All" ? pick(CARD_BRANDS) : brandFilter;
  return {
    brand,
    number: generateCardNumber(brand),
    expiry: generateExpiry().display,
    cvv: generateCvv(brand),
    holder: randomHolderName(locale),
  };
}

const COUNT_PRESETS = [1, 4, 8, 20, 50];

export function CreditCardGenerator() {
  const [brandFilter, setBrandFilter] = useState<CardBrand | "All">("All");
  const [locale, setLocale] = useState<"th" | "en">("en");
  const [count, setCount] = useState(4);
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"visual" | "table" | "json">("visual");

  const generate = (n: number = count) => {
    const list = Array.from({ length: n }, () => generateCard(brandFilter, locale));
    setCards(list);
    setRevealed(new Set());
    addHistoryEntry({ kind: "card", title: `บัตรเครดิตทดสอบ ${n} ใบ (${brandFilter})`, count: n });
  };

  useEffect(() => {
    // สร้างตัวอย่างข้อมูลฝั่ง client เท่านั้น เพื่อไม่ให้ค่าสุ่มชนกับ SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jsonOutput = useMemo(() => JSON.stringify(cards, null, 2), [cards]);

  const handleCopyAll = async () => {
    const ok = await copyToClipboard(jsonOutput);
    toast[ok ? "success" : "error"](ok ? "คัดลอก JSON แล้ว" : "คัดลอกไม่สำเร็จ");
  };

  const handleDownloadJson = () => {
    downloadBlob(new Blob([jsonOutput], { type: "application/json" }), `credit-cards-${Date.now()}.json`);
    toast.success("ดาวน์โหลดไฟล์ JSON แล้ว");
  };

  const handleDownloadCsv = () => {
    const header = "brand,number,expiry,cvv,holder";
    const rows = cards.map((c) => `${c.brand},${c.number},${c.expiry},${c.cvv},"${c.holder}"`);
    downloadBlob(new Blob([[header, ...rows].join("\n")], { type: "text/csv" }), `credit-cards-${Date.now()}.csv`);
    toast.success("ดาวน์โหลดไฟล์ CSV แล้ว");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">สร้างเลขบัตรเครดิตสำหรับทดสอบ</h1>
        <p className="text-sm text-muted mt-1">
          เลขบัตรผ่านการตรวจสอบด้วยสูตร Luhn ตามมาตรฐานของแต่ละค่ายบัตร —{" "}
          <span className="font-medium text-danger">สำหรับทดสอบระบบเท่านั้น ไม่ใช่บัตรที่ใช้งานได้จริง</span>
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border p-1">
              {(["All", ...CARD_BRANDS] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBrandFilter(b)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium",
                    brandFilter === b ? "bg-accent text-accent-foreground" : "text-muted"
                  )}
                >
                  {b === "All" ? "ทุกค่าย" : b}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <button
                onClick={() => setLocale("th")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium",
                  locale === "th" ? "bg-surface-2 text-foreground" : "text-muted"
                )}
              >
                ชื่อไทย
              </button>
              <button
                onClick={() => setLocale("en")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium",
                  locale === "en" ? "bg-surface-2 text-foreground" : "text-muted"
                )}
              >
                ชื่ออังกฤษ
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {COUNT_PRESETS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium",
                    count === n ? "bg-surface-2 text-foreground" : "text-muted"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <Button onClick={() => generate()}>
              <RefreshCw size={14} /> สุ่มบัตรใหม่
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <button
                onClick={() => setView("visual")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                  view === "visual" ? "bg-accent text-accent-foreground" : "text-muted"
                )}
              >
                <LayoutGrid size={13} /> การ์ด
              </button>
              <button
                onClick={() => setView("table")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                  view === "table" ? "bg-accent text-accent-foreground" : "text-muted"
                )}
              >
                <Table2 size={13} /> ตาราง
              </button>
              <button
                onClick={() => setView("json")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                  view === "json" ? "bg-accent text-accent-foreground" : "text-muted"
                )}
              >
                <Braces size={13} /> JSON
              </button>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                <ClipboardCopy size={13} /> คัดลอก JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                <Download size={13} /> Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                <Download size={13} /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      {view === "visual" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c, i) => {
            const isRevealed = revealed.has(i);
            const displayNumber = formatCardNumber(c.brand, c.number);
            return (
              <div
                key={i}
                className={cn(
                  "relative flex h-52 flex-col justify-between rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg",
                  BRAND_GRADIENTS[c.brand]
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold tracking-wide opacity-90">{c.brand}</span>
                  <button
                    onClick={() => {
                      setRevealed((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                    className="rounded-md bg-white/15 p-1.5 hover:bg-white/25"
                  >
                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                <div className="font-mono text-lg tracking-widest">
                  {isRevealed ? displayNumber : displayNumber.replace(/\d(?=\d{4})/g, "•")}
                </div>

                <div className="flex items-end justify-between text-xs">
                  <div>
                    <p className="opacity-60 text-[10px] uppercase">Card Holder</p>
                    <p className="font-medium tracking-wide">{c.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-60 text-[10px] uppercase">Exp</p>
                    <p className="font-medium">{c.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-60 text-[10px] uppercase">CVV</p>
                    <p className="font-medium">{isRevealed ? c.cvv : "•••"}</p>
                  </div>
                </div>

                <CopyButton
                  value={JSON.stringify(c, null, 2)}
                  className="absolute bottom-3 right-3 bg-white/15 hover:bg-white/25 text-white"
                />
              </div>
            );
          })}
          {cards.length === 0 && (
            <p className="col-span-full p-6 text-center text-sm text-muted">ยังไม่มีข้อมูล กด &quot;สุ่มบัตรใหม่&quot;</p>
          )}
        </div>
      )}

      {view === "table" && (
        <Card>
          <CardContent className="pt-5 overflow-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2">
                <tr>
                  {["Brand", "Number", "Expiry", "CVV", "Holder", ""].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((c, i) => (
                  <tr key={i} className="border-t border-border hover:bg-surface-2/60">
                    <td className="px-3 py-2">{c.brand}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono">{c.number}</td>
                    <td className="px-3 py-2">{c.expiry}</td>
                    <td className="px-3 py-2">{c.cvv}</td>
                    <td className="whitespace-nowrap px-3 py-2">{c.holder}</td>
                    <td className="px-2 py-2">
                      <CopyButton value={JSON.stringify(c, null, 2)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {view === "json" && (
        <Card>
          <CardContent className="pt-5">
            <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-surface-2 p-4 text-[11px] leading-relaxed scrollbar-thin font-mono">
              {jsonOutput}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
