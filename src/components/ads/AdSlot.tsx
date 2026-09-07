"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
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
  /** ความสูงขั้นต่ำของพื้นที่ (กันหน้าเว้ากระโดด/CLS ระหว่างโฆษณาโหลด) */
  minHeight?: number;
  label?: string;
  /** ซ่อนบนจอเล็ก — โฆษณาแนวนอนไม่เหมาะกับความกว้างระดับมือถือ */
  hideOnMobile?: boolean;
}

/**
 * พื้นที่โฆษณา — แสดงโฆษณา Google AdSense จริงเมื่อตั้งค่า NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * และส่ง slotId มาแล้ว มิฉะนั้นจะแสดง placeholder กรอบประเพื่อจองพื้นที่ไว้
 * วิธีตั้งค่าแบบละเอียด: docs/google-adsense-setup.md
 */
export function AdSlot({
  slotId,
  format = "auto",
  layoutKey,
  minHeight = 100,
  label,
  hideOnMobile = false,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

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

  const display = hideOnMobile ? { xs: "none", sm: "block" } : "block";

  if (ADSENSE_ENABLED && slotId) {
    return (
      <Box sx={{ display, minHeight, overflow: "hidden", borderRadius: 2 }}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          // ต้องกำหนดความกว้างเสมอ ไม่งั้น AdSense จะโยน
          // "No slot size for availableWidth=0" แล้วโฆษณาจะไม่ขึ้น
          style={{ display: "block", width: "100%" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-ad-layout-key={layoutKey}
          data-full-width-responsive="true"
          data-adtest={process.env.NODE_ENV !== "production" ? "on" : undefined}
        />
      </Box>
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        display: hideOnMobile ? { xs: "none", sm: "flex" } : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        minHeight,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        color: "text.disabled",
      }}
    >
      <CampaignOutlinedIcon fontSize="small" />
      <Typography variant="caption">{label ?? "พื้นที่โฆษณา (Google AdSense)"}</Typography>
    </Box>
  );
}
