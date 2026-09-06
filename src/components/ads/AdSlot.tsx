"use client";

import { useEffect, useId, useRef } from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADSENSE_CLIENT_ID, ADSENSE_ENABLED } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical" | "fluid";

interface AdSlotProps {
  /** data-ad-slot id จาก Google AdSense dashboard (ตั้งค่าต่อตำแหน่งโฆษณา) */
  slotId?: string;
  format?: AdFormat;
  layoutKey?: string;
  className?: string;
  /** ความสูงขั้นต่ำของพื้นที่ (กันหน้าเว้ากระโดด/CLS ระหว่างโฆษณาโหลด) */
  minHeight?: number;
  label?: string;
}

/**
 * พื้นที่โฆษณา — แสดงโฆษณา Google AdSense จริงเมื่อตั้งค่า NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * และส่ง slotId มาแล้ว มิฉะนั้นจะแสดง placeholder แบบ glass เพื่อจองพื้นที่ไว้
 * วิธีตั้งค่าแบบละเอียด: docs/google-adsense-setup.md
 */
export function AdSlot({ slotId, format = "auto", layoutKey, className, minHeight = 100, label }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const uid = useId();

  useEffect(() => {
    if (!ADSENSE_ENABLED || !slotId || pushedRef.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // สคริปต์ AdSense อาจยังโหลดไม่เสร็จ หรือถูก ad-blocker บล็อก ไม่ต้องแสดง error ต่อผู้ใช้
    }
  }, [slotId]);

  if (ADSENSE_ENABLED && slotId) {
    return (
      <div className={cn("glass-2 overflow-hidden rounded-2xl", className)} style={{ minHeight }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive="true"
          data-adtest={process.env.NODE_ENV !== "production" ? "on" : undefined}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "glass-2 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-dashed text-center",
        className
      )}
      style={{ minHeight, borderStyle: "dashed" }}
      data-adslot-placeholder={uid}
    >
      <Megaphone size={16} className="text-muted opacity-60" />
      <p className="text-[11px] text-muted opacity-70">{label ?? "พื้นที่โฆษณา (Google AdSense)"}</p>
    </div>
  );
}
