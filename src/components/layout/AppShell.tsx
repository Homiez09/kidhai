"use client";

import { useState, type SyntheticEvent } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PersonGenerator } from "@/components/features/PersonGenerator";
import { CreditCardGenerator } from "@/components/features/CreditCardGenerator";
import { FileGenerator } from "@/components/features/FileGenerator";
import { HistoryPanel } from "@/components/features/HistoryPanel";
// โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก (ตัวคอมโพเนนต์ยังอยู่ที่ src/components/ads/AdSlot.tsx)
// import { AdSlot } from "@/components/ads/AdSlot";
// import { AD_SLOTS, SITE_NAME } from "@/lib/site";
import { SITE_NAME } from "@/lib/site";

type TabKey = "person" | "card" | "file" | "history";

// เก็บเป็น component ไม่ใช่ element (ดูเหตุผลใน MarketingHero)
const TABS = [
  { key: "person" as const, label: "ข้อมูลบุคคล", Icon: PeopleAltOutlinedIcon },
  { key: "card" as const, label: "บัตรเครดิต", Icon: CreditCardOutlinedIcon },
  { key: "file" as const, label: "ไฟล์ทดสอบ", Icon: FolderZipOutlinedIcon },
  { key: "history" as const, label: "ประวัติ", Icon: HistoryOutlinedIcon },
];

export function AppShell() {
  const [tab, setTab] = useState<TabKey>("person");

  const handleChange = (_e: SyntheticEvent, value: TabKey) => setTab(value);

  return (
    <Box id="app" sx={{ scrollMarginTop: 8 }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          // โปร่งแสงเล็กน้อยให้เนื้อหาเลื่อนผ่านแล้วยังอ่านหัวข้อออก
          backgroundColor: "rgba(var(--mui-palette-background-paperChannel) / 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1.5, minHeight: { xs: 56, sm: 64 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>
            <Box sx={{ mr: "auto" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {SITE_NAME}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                Mock Data Studio
              </Typography>
            </Box>
            <ThemeToggle />
          </Toolbar>

          <Tabs
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="เครื่องมือสร้างข้อมูลทดสอบ"
          >
            {TABS.map((t) => (
              <Tab key={t.key} value={t.key} label={t.label} icon={<t.Icon />} iconPosition="start" />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={4} sx={{ alignItems: "flex-start" }}>
          <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
            {/* โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก */}
            {/* <AdSlot slotId={AD_SLOTS.topBanner} format="horizontal" minHeight={90} hideOnMobile /> */}

            <Box role="tabpanel">
              {tab === "person" && <PersonGenerator />}
              {tab === "card" && <CreditCardGenerator />}
              {tab === "file" && <FileGenerator />}
              {tab === "history" && <HistoryPanel />}
            </Box>
          </Stack>

          {/* แถบข้างเฉพาะจอกว้าง — วางโฆษณาสี่เหลี่ยมกับข้อความกำกับ */}
          <Stack
            component="aside"
            spacing={2}
            sx={{ display: { xs: "none", lg: "flex" }, width: 300, flexShrink: 0, position: "sticky", top: 152 }}
          >
            {/* โฆษณา AdSense ปิดชั่วคราว — เปิดคืนโดยเอา comment ออก */}
            {/* <AdSlot slotId={AD_SLOTS.sidebar} format="rectangle" minHeight={250} /> */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                ข้อมูลทั้งหมดสร้างขึ้นแบบสุ่มเพื่อใช้ทดสอบระบบเท่านั้น ไม่ใช่ข้อมูลบุคคลหรือบัตรจริง
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
