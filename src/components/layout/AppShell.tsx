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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PersonGenerator } from "@/components/features/PersonGenerator";
import { SingleToolsHub } from "@/components/features/SingleToolsHub";
import { CreditCardGenerator } from "@/components/features/CreditCardGenerator";
import { FileGenerator } from "@/components/features/FileGenerator";
import { HistoryPanel } from "@/components/features/HistoryPanel";
import { SITE_NAME } from "@/lib/site";

type TabKey = "person" | "single" | "card" | "file" | "history";

// ลำดับแท็บ: หน้าแรกเป็น UI เดิม (ข้อมูลบุคคล) ส่วนสุ่มเฉพาะอันเป็นแท็บที่ 2
const TABS = [
  { key: "person" as const, label: "ข้อมูลบุคคล", Icon: PeopleAltOutlinedIcon },
  { key: "single" as const, label: "สุ่มเฉพาะอัน", Icon: TouchAppOutlinedIcon },
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
          backgroundColor: "rgba(var(--mui-palette-background-paperChannel) / 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
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

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={3} sx={{ width: "100%", mx: "auto" }}>
          <Box role="tabpanel">
            {tab === "person" && <PersonGenerator />}
            {tab === "single" && <SingleToolsHub />}
            {tab === "card" && <CreditCardGenerator />}
            {tab === "file" && <FileGenerator />}
            {tab === "history" && <HistoryPanel />}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
