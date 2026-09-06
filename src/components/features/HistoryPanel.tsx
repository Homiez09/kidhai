"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, FileStack, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getHistory, removeHistoryEntry, clearHistory, HistoryEntry } from "@/lib/history";

const KIND_ICON = { person: Users, card: CreditCard, file: FileStack } as const;
const KIND_LABEL = { person: "ข้อมูลบุคคล", card: "บัตรเครดิต", file: "ไฟล์ทดสอบ" } as const;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export function HistoryPanel() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // อ่านจาก localStorage หลัง mount เท่านั้น เพื่อไม่ให้ชนกับ SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getHistory());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">ประวัติการสร้างข้อมูล</h1>
          <p className="text-sm text-muted mt-1">บันทึกไว้ในเบราว์เซอร์ของคุณเท่านั้น (localStorage)</p>
        </div>
        {entries.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearHistory();
              setEntries([]);
            }}
          >
            <Trash2 size={13} /> ล้างประวัติทั้งหมด
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-5">
          {entries.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">ยังไม่มีประวัติการสร้างข้อมูล</p>
          )}
          {entries.map((e) => {
            const Icon = KIND_ICON[e.kind];
            return (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-muted">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge>{KIND_LABEL[e.kind]}</Badge>
                      <span className="text-[11px] text-muted">{timeAgo(e.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeHistoryEntry(e.id);
                    setEntries((prev) => prev.filter((x) => x.id !== e.id));
                  }}
                  className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
