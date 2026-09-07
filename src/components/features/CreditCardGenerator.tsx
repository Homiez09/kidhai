"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { CopyButton } from "@/components/ui/CopyButton";
import { copyToClipboard } from "@/lib/utils";
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
  Visa: "linear-gradient(135deg, #1a1f71, #3b5bdb)",
  Mastercard: "linear-gradient(135deg, #232323, #4a4a4a)",
  Amex: "linear-gradient(135deg, #0f6fa8, #1a8fd1)",
  JCB: "linear-gradient(135deg, #0b6e4f, #12a26e)",
  Discover: "linear-gradient(135deg, #7a4600, #e77817)",
  UnionPay: "linear-gradient(135deg, #7a1f2b, #b5303f)",
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
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          สร้างเลขบัตรเครดิตสำหรับทดสอบ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เลขบัตรผ่านการตรวจสอบด้วยสูตร Luhn ตามมาตรฐานของแต่ละค่ายบัตร —{" "}
          <Typography component="span" variant="body2" color="error" sx={{ fontWeight: 600 }}>
            สำหรับทดสอบระบบเท่านั้น ไม่ใช่บัตรที่ใช้งานได้จริง
          </Typography>
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={brandFilter}
                onChange={(_e, v) => v && setBrandFilter(v)}
                aria-label="ค่ายบัตร"
              >
                {(["All", ...CARD_BRANDS] as const).map((b) => (
                  <ToggleButton key={b} value={b}>
                    {b === "All" ? "ทุกค่าย" : b}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={locale}
                onChange={(_e, v) => v && setLocale(v)}
                aria-label="ภาษาของชื่อผู้ถือบัตร"
              >
                <ToggleButton value="th">ชื่อไทย</ToggleButton>
                <ToggleButton value="en">ชื่ออังกฤษ</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={count}
                onChange={(_e, v) => v && setCount(v)}
                aria-label="จำนวนบัตร"
              >
                {COUNT_PRESETS.map((n) => (
                  <ToggleButton key={n} value={n}>
                    {n}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => generate()}>
                สุ่มบัตรใหม่
              </Button>
            </Stack>

            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={view}
                onChange={(_e, v) => v && setView(v)}
                aria-label="รูปแบบการแสดงผล"
              >
                <ToggleButton value="visual">
                  <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} /> การ์ด
                </ToggleButton>
                <ToggleButton value="table">
                  <TableChartOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> ตาราง
                </ToggleButton>
                <ToggleButton value="json">
                  <DataObjectIcon fontSize="small" sx={{ mr: 0.5 }} /> JSON
                </ToggleButton>
              </ToggleButtonGroup>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", ml: { sm: "auto" } }}>
                <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyAll}>
                  คัดลอก JSON
                </Button>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadJson}>
                  Export JSON
                </Button>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCsv}>
                  Export CSV
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      {view === "visual" && (
        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
          }}
        >
          {cards.map((c, i) => {
            const isRevealed = revealed.has(i);
            const displayNumber = formatCardNumber(c.brand, c.number);
            return (
              <Paper
                key={i}
                elevation={4}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 208,
                  p: 2.5,
                  borderRadius: 3,
                  color: "#fff",
                  background: BRAND_GRADIENTS[c.brand],
                }}
              >
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                    {c.brand}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={isRevealed ? "ซ่อนเลขบัตร" : "แสดงเลขบัตร"}
                    sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
                    onClick={() => {
                      setRevealed((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      });
                    }}
                  >
                    {isRevealed ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </Stack>

                <Typography
                  sx={{ fontFamily: "var(--font-google-sans-code), monospace", fontSize: 20, letterSpacing: 3 }}
                >
                  {isRevealed ? displayNumber : displayNumber.replace(/\d(?=\d{4})/g, "•")}
                </Typography>

                <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.6, textTransform: "uppercase", fontSize: 10 }}>
                      Card Holder
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {c.holder}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, textTransform: "uppercase", fontSize: 10 }}>
                      Exp
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {c.expiry}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", mr: 4 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6, textTransform: "uppercase", fontSize: 10 }}>
                      CVV
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {isRevealed ? c.cvv : "•••"}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ position: "absolute", bottom: 8, right: 8, color: "#fff" }}>
                  <CopyButton value={JSON.stringify(c, null, 2)} />
                </Box>
              </Paper>
            );
          })}
          {cards.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 5, gridColumn: "1 / -1" }}>
              ยังไม่มีข้อมูล กด &quot;สุ่มบัตรใหม่&quot;
            </Typography>
          )}
        </Box>
      )}

      {view === "table" && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Brand", "Number", "Expiry", "CVV", "Holder", ""].map((h, i) => (
                  <TableCell key={i} sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map((c, i) => (
                <TableRow key={i} hover>
                  <TableCell>{c.brand}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "var(--font-google-sans-code), monospace" }}>
                    {c.number}
                  </TableCell>
                  <TableCell>{c.expiry}</TableCell>
                  <TableCell>{c.cvv}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{c.holder}</TableCell>
                  <TableCell padding="none">
                    <CopyButton value={JSON.stringify(c, null, 2)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {view === "json" && (
        <Paper
          variant="outlined"
          component="pre"
          sx={{
            m: 0,
            p: 2,
            maxHeight: 560,
            overflow: "auto",
            fontFamily: "var(--font-google-sans-code), monospace",
            fontSize: 12,
            lineHeight: 1.7,
            bgcolor: "action.hover",
          }}
        >
          {jsonOutput}
        </Paper>
      )}
    </Stack>
  );
}
