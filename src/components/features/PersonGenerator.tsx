"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Download, ClipboardCopy, Table2, Braces, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn, copyToClipboard } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import { generatePersonRecords, PersonRecord } from "@/lib/generators/person";
import { FIELD_DEFS, FIELD_GROUPS, DEFAULT_SELECTED_FIELDS, FieldKey } from "@/types/schema";
import { addHistoryEntry } from "@/lib/history";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/site";

const COUNT_PRESETS = [1, 10, 25, 50, 100, 500];

function toCsv(records: PersonRecord[], fields: FieldKey[]): string {
  const header = fields.map((f) => FIELD_DEFS.find((d) => d.key === f)?.label ?? f).join(",");
  const rows = records.map((r) =>
    fields
      .map((f) => {
        const v = String(r[f] ?? "");
        return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export function PersonGenerator() {
  const [selected, setSelected] = useState<Set<FieldKey>>(new Set(DEFAULT_SELECTED_FIELDS));
  const [count, setCount] = useState(10);
  const [records, setRecords] = useState<PersonRecord[]>([]);
  const [view, setView] = useState<"table" | "json">("table");
  const [fieldsOpen, setFieldsOpen] = useState(true);

  const generate = (n: number = count) => {
    const recs = generatePersonRecords(n);
    setRecords(recs);
    addHistoryEntry({ kind: "person", title: `ข้อมูลบุคคล ${n} รายการ`, count: n });
  };

  useEffect(() => {
    // สร้างตัวอย่างข้อมูลฝั่ง client เท่านั้น เพื่อไม่ให้ค่าสุ่มชนกับ SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedFields = useMemo(
    () => FIELD_DEFS.filter((f) => selected.has(f.key)).map((f) => f.key),
    [selected]
  );

  const jsonOutput = useMemo(
    () => JSON.stringify(records.map((r) => Object.fromEntries(selectedFields.map((f) => [f, r[f]]))), null, 2),
    [records, selectedFields]
  );

  const toggleField = (key: FieldKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleGroup = (group: string, allOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      FIELD_DEFS.filter((f) => f.group === group).forEach((f) => {
        if (allOn) next.delete(f.key);
        else next.add(f.key);
      });
      return next;
    });
  };

  const handleCopyAllJson = async () => {
    const ok = await copyToClipboard(jsonOutput);
    toast[ok ? "success" : "error"](ok ? "คัดลอก JSON แล้ว" : "คัดลอกไม่สำเร็จ");
  };

  const handleDownloadJson = () => {
    downloadBlob(new Blob([jsonOutput], { type: "application/json" }), `person-data-${Date.now()}.json`);
    toast.success("ดาวน์โหลดไฟล์ JSON แล้ว");
  };

  const handleDownloadCsv = () => {
    const csv = toCsv(records, selectedFields);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `person-data-${Date.now()}.csv`);
    toast.success("ดาวน์โหลดไฟล์ CSV แล้ว");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">สร้างข้อมูลบุคคลสำหรับทดสอบ</h1>
        <p className="text-sm text-muted mt-1">
          เลือกฟิลด์ที่ต้องการ กำหนดจำนวน แล้วสุ่มข้อมูลได้ทันที — คัดลอกหรือ export เป็น JSON / CSV
        </p>
      </div>

      <Card>
        <button
          className="flex w-full items-center justify-between px-5 py-4"
          onClick={() => setFieldsOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <CardTitle>เลือกฟิลด์ข้อมูล</CardTitle>
            <Badge>{selected.size} ฟิลด์ที่เลือก</Badge>
          </div>
          <ChevronDown size={16} className={cn("transition-transform", fieldsOpen && "rotate-180")} />
        </button>
        {fieldsOpen && (
          <CardContent className="grid grid-cols-1 gap-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_GROUPS.map((group) => {
              const fields = FIELD_DEFS.filter((f) => f.group === group.key);
              const allOn = fields.every((f) => selected.has(f.key));
              return (
                <div key={group.key} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">{group.label}</p>
                    <button
                      className="text-[11px] text-accent hover:underline"
                      onClick={() => toggleGroup(group.key, allOn)}
                    >
                      {allOn ? "ล้าง" : "เลือกทั้งหมด"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {fields.map((f) => (
                      <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selected.has(f.key)}
                          onChange={() => toggleField(f.key)}
                          className="h-3.5 w-3.5 accent-[var(--accent)]"
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      <Card>
        <CardHeader className="flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle>ผลลัพธ์</CardTitle>
            <Badge>{records.length.toLocaleString()} รายการ</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
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
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
              <input
                type="number"
                min={1}
                max={5000}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
                className="w-20 rounded-md border border-border bg-transparent px-2 py-1 text-xs outline-none focus:border-accent"
              />
            </div>
            <Button onClick={() => generate()} size="md">
              <RefreshCw size={14} /> สุ่มข้อมูลใหม่
            </Button>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAllJson}>
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

          {view === "table" ? (
            <div className="overflow-auto rounded-xl border border-border scrollbar-thin max-h-[560px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-2 z-10">
                  <tr>
                    {selectedFields.map((f) => (
                      <th key={f} className="whitespace-nowrap px-3 py-2 font-semibold text-muted">
                        {FIELD_DEFS.find((d) => d.key === f)?.label}
                      </th>
                    ))}
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i} className="border-t border-border hover:bg-surface-2/60">
                      {selectedFields.map((f) => (
                        <td key={f} className="whitespace-nowrap px-3 py-2">
                          {String(r[f])}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <CopyButton
                          value={JSON.stringify(
                            Object.fromEntries(selectedFields.map((f) => [f, r[f]])),
                            null,
                            2
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length === 0 && (
                <p className="p-6 text-center text-sm text-muted">ยังไม่มีข้อมูล กด &quot;สุ่มข้อมูลใหม่&quot;</p>
              )}
            </div>
          ) : (
            <pre className="max-h-[560px] overflow-auto rounded-xl border border-border bg-surface-2 p-4 text-[11px] leading-relaxed scrollbar-thin font-mono">
              {jsonOutput}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
