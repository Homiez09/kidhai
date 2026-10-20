"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";

import { copyToClipboard } from "@/lib/utils";
import {
  generateThaiNationalId,
  formatThaiNationalId,
  explainThaiNationalId,
  generateTaxId,
  explainTaxId,
  THAI_ID_TYPES,
} from "@/lib/generators/thaiId";
import {
  generateThaiMobile,
  generateThaiLandline,
  validateThaiPhone,
  PhoneFormat,
} from "@/lib/generators/phone";
import { uuidV4, randomAlphaNumeric, randInt, pick } from "@/lib/random";
import { COMPANY_WORDS_TH, COMPANY_SUFFIXES_TH } from "@/lib/data/thai-names";
import { addHistoryEntry } from "@/lib/history";

type SingleMode = "hub" | "thai-id" | "phone" | "tax-id" | "dev-tokens";

const COUNT_PRESETS = [1, 5, 10, 20, 50];

const MODES = [
  {
    key: "thai-id" as const,
    title: "เลขบัตรประชาชนไทย (Thai National ID)",
    shortTitle: "บัตรประชาชน",
    description: "สุ่มเลขบัตร 13 หลักตามสูตรราชการไทย (Check digit mod 11) พร้อมตัวตรวจความถูกต้องและวิเคราะห์โครงสร้างเลข",
    icon: BadgeOutlinedIcon,
    badges: ["สุ่ม 13 หลัก", "ตรวจสูตร Check Digit", "กรองประเภทบุคคล"],
  },
  {
    key: "phone" as const,
    title: "เบอร์โทรศัพท์ไทย (Phone Numbers)",
    shortTitle: "เบอร์โทรศัพท์",
    description: "สุ่มเบอร์มือถือ (06, 08, 09) และเบอร์บ้าน/สำนักงาน (02) พร้อมฟอร์แมตมีขีด เลขล้วน หรือรหัสสากล +66",
    icon: PhoneIphoneOutlinedIcon,
    badges: ["มือถือ 08x", "เบอร์บ้าน 02", "รหัสสากล +66"],
  },
  {
    key: "tax-id" as const,
    title: "เลขนิติบุคคล / ผู้เสียภาษี (Tax ID & Company)",
    shortTitle: "เลขนิติบุคคล / ภาษี",
    description: "สุ่มเลขประจำตัวผู้เสียภาษี 13 หลัก พร้อมจับคู่ชื่อบริษัทและรหัสสาขาจำลอง สำหรับเทสระบบ e-Tax, ERP, B2B",
    icon: BusinessOutlinedIcon,
    badges: ["13 หลัก", "ชื่อบริษัทไทย", "รหัสสาขา"],
  },
  {
    key: "dev-tokens" as const,
    title: "Developer Tokens & OTP",
    shortTitle: "Tokens / OTP",
    description: "สุ่ม UUID v4 (RFC 4122), รหัส OTP 6 หลักพร้อม Ref code, และ Dummy Secret API Key",
    icon: KeyOutlinedIcon,
    badges: ["UUID v4", "OTP 6 หลัก + Ref", "Secret API Key"],
  },
];

export function SingleToolsHub() {
  const [mode, setMode] = useState<SingleMode>("hub");

  // =================== Thai ID States ===================
  const [thaiIdCount, setThaiIdCount] = useState<number>(5);
  const [thaiIdType, setThaiIdType] = useState<number>(0);
  const [thaiIdHyphen, setThaiIdHyphen] = useState<boolean>(true);
  const [generatedThaiIds, setGeneratedThaiIds] = useState<string[]>([]);
  const [verifyInput, setVerifyInput] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // =================== Phone States ===================
  const [phoneCount, setPhoneCount] = useState<number>(5);
  const [phoneType, setPhoneType] = useState<"mobile" | "landline">("mobile");
  const [phoneFormat, setPhoneFormat] = useState<PhoneFormat>("hyphen");
  const [generatedPhones, setGeneratedPhones] = useState<string[]>([]);
  const [phoneVerifyInput, setPhoneVerifyInput] = useState<string>("");

  // =================== Tax ID States ===================
  const [taxIdCount, setTaxIdCount] = useState<number>(5);
  const [generatedTaxList, setGeneratedTaxList] = useState<
    { taxId: string; company: string; branch: string }[]
  >([]);
  const [taxVerifyInput, setTaxVerifyInput] = useState<string>("");

  // =================== Dev Tokens States ===================
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [mockOtp, setMockOtp] = useState<{ otp: string; ref: string }>({ otp: "", ref: "" });
  const [mockApiKey, setMockApiKey] = useState<string>("");

  const handleGenerateThaiIds = (count = thaiIdCount) => {
    const list = Array.from({ length: count }, () =>
      generateThaiNationalId(thaiIdType === 0 ? undefined : thaiIdType)
    );
    setGeneratedThaiIds(list);
    if (list[0]) {
      setVerifyInput(list[0]);
    }
    addHistoryEntry({ kind: "person", title: `สุ่มบัตรประชาชน ${count} รายการ`, count });
  };

  const handleGeneratePhones = (count = phoneCount) => {
    const list = Array.from({ length: count }, () =>
      phoneType === "mobile"
        ? generateThaiMobile(phoneFormat)
        : generateThaiLandline("bkk", phoneFormat)
    );
    setGeneratedPhones(list);
    if (list[0]) {
      setPhoneVerifyInput(list[0].replace(/\D/g, ""));
    }
    addHistoryEntry({ kind: "person", title: `สุ่มเบอร์โทรศัพท์ ${count} รายการ`, count });
  };

  const handleGenerateTaxList = (count = taxIdCount) => {
    const list = Array.from({ length: count }, () => ({
      taxId: generateTaxId(),
      company: `บริษัท ${pick(COMPANY_WORDS_TH)} ${pick(COMPANY_SUFFIXES_TH)}`,
      branch: pick(["สำนักงานใหญ่ (00000)", "สาขาที่ 00001", "สาขาที่ 00002"]),
    }));
    setGeneratedTaxList(list);
    if (list[0]) {
      setTaxVerifyInput(list[0].taxId);
    }
    addHistoryEntry({ kind: "person", title: `สุ่มเลขนิติบุคคล ${count} รายการ`, count });
  };

  const handleGenerateDevTokens = (count = uuidCount) => {
    setGeneratedUuids(Array.from({ length: count }, () => uuidV4()));
    setMockOtp({
      otp: String(randInt(100000, 999999)),
      ref: randomAlphaNumeric(4, true),
    });
    setMockApiKey(`sk_test_${randomAlphaNumeric(32)}`);
  };

  useEffect(() => {
    // Generate ค่าเริ่มต้นฝั่ง client เท่านั้น
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleGenerateThaiIds(5);
    handleGeneratePhones(5);
    handleGenerateTaxList(5);
    handleGenerateDevTokens(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyValue = async (val: string, label: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      toast.success(`คัดลอก ${label} "${val}" เรียบร้อยแล้ว`, { id: "single-tool-copy" });
    } else {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleCopyAllThaiIds = async () => {
    const text = generatedThaiIds
      .map((id) => (thaiIdHyphen ? formatThaiNationalId(id) : id))
      .join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success(`คัดลอกเลขบัตรประชาชนทั้งหมด (${generatedThaiIds.length} รายการ) แล้ว`);
    } else {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleCopyAllPhones = async () => {
    const text = generatedPhones.join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success(`คัดลอกเบอร์โทรศัพท์ทั้งหมด (${generatedPhones.length} รายการ) แล้ว`);
    } else {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleCopyAllTaxIds = async () => {
    const text = generatedTaxList.map((t) => `${t.taxId} ${t.company}`).join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success(`คัดลอกเลขนิติบุคคลทั้งหมด (${generatedTaxList.length} รายการ) แล้ว`);
    } else {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const handleCopyAllUuids = async () => {
    const text = generatedUuids.join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success(`คัดลอก UUID ทั้งหมด (${generatedUuids.length} รายการ) แล้ว`);
    } else {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  };

  const explanation = explainThaiNationalId(verifyInput);
  const taxExplanation = explainTaxId(taxVerifyInput);
  const phoneValidation = validateThaiPhone(phoneVerifyInput);
  const currentModeInfo = MODES.find((m) => m.key === mode);

  // =========================================================================
  // 1. หน้าเลือกโหมด (MODE SELECTION HUB)
  // =========================================================================
  if (mode === "hub") {
    return (
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h1">
            สุ่มเฉพาะอัน (Single Item Generators)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เลือกโหมดข้อมูลที่ต้องการใช้งาน เพื่อสุ่มเฉพาะค่านั้น หรือตรวจสอบความถูกต้องอย่างละเอียด
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          }}
        >
          {MODES.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.key}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => setMode(item.key)}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.title}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    {item.badges.map((badge) => (
                      <Chip key={badge} label={badge} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                    ))}
                  </Stack>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 2.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode(item.key);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    เปิดใช้งานโหมดนี้
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </Box>
      </Stack>
    );
  }

  // =========================================================================
  // 2. หน้าเครื่องมือเดี่ยว (SINGLE TOOL VIEW WITH BACK BUTTON)
  // =========================================================================
  return (
    <Stack spacing={3}>
      {/* แถบนำทางด้านบน พร้อมปุ่ม Back เพื่อกลับไปเลือกโหมดใหม่ */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => setMode("hub")}
          sx={{ borderRadius: 2, px: 2 }}
        >
          ย้อนกลับไปเลือกโหมด
        </Button>

        {currentModeInfo && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              โหมดปัจจุบัน:
            </Typography>
            <Chip
              label={currentModeInfo.shortTitle}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        )}
      </Stack>

      {/* ===================== MODE: THAI ID & VALIDATOR ===================== */}
      {mode === "thai-id" && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
            }}
          >
            {/* กล่องซ้าย: สุ่มเลขบัตร ปชช. */}
            <Card variant="outlined">
              <CardHeader
                title="สุ่มเลขบัตรประชาชน 13 หลัก (ผ่านสูตร Check Digit)"
                subheader="สร้างเลขบัตรที่ถูกต้องตามหลักคณิตศาสตร์ราชการไทยสำหรับกรอกแบบฟอร์มทดสอบ"
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={2.5}>
                  {/* ตัวเลือกฟิลด์ (ประเภทบุคคล และ จัดรูปแบบ) */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="thai-id-type-label">ประเภทบุคคล (หลักที่ 1)</InputLabel>
                      <Select
                        labelId="thai-id-type-label"
                        value={thaiIdType}
                        label="ประเภทบุคคล (หลักที่ 1)"
                        onChange={(e) => setThaiIdType(Number(e.target.value))}
                      >
                        <MenuItem value={0}>สุ่มทุกประเภท (1-8)</MenuItem>
                        {Object.entries(THAI_ID_TYPES).map(([k, v]) => (
                          <MenuItem key={k} value={Number(k)}>
                            {k} — {v}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={thaiIdHyphen}
                      onChange={(_e, v) => v !== null && setThaiIdHyphen(v)}
                      sx={{ flexShrink: 0 }}
                    >
                      <ToggleButton value={true}>มีขีด (-)</ToggleButton>
                      <ToggleButton value={false}>เลขล้วน</ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>

                  {/* แถบเลือกจำนวน และปุ่มสุ่ม */}
                  <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      จำนวน:
                    </Typography>
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={thaiIdCount}
                      onChange={(_e, v) => v && setThaiIdCount(v)}
                      aria-label="เลือกจำนวนรายการ"
                    >
                      {COUNT_PRESETS.map((n) => (
                        <ToggleButton key={n} value={n} sx={{ px: 1.25, minWidth: 36 }}>
                          {n}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                    <TextField
                      type="text"
                      size="small"
                      label="กำหนดเอง"
                      value={thaiIdCount}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "");
                        setThaiIdCount(clean ? Math.max(1, Math.min(100, parseInt(clean, 10))) : 1);
                      }}
                      slotProps={{
                        htmlInput: {
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                          maxLength: 3,
                        },
                      }}
                      sx={{ width: 95 }}
                    />

                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleGenerateThaiIds(thaiIdCount)}
                    >
                      สุ่มใหม่ ({thaiIdCount} รายการ)
                    </Button>

                    {generatedThaiIds.length > 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyAllThaiIds}
                      >
                        คัดลอกทั้งหมด
                      </Button>
                    )}
                  </Stack>

                  <Divider />

                  {/* รายการผลลัพธ์ */}
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ผลการสุ่ม ({generatedThaiIds.length} รายการ):
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        คลิก &quot;คัดลอก&quot; หรือ &quot;ตรวจสูตร&quot; ในแต่ละรายการ
                      </Typography>
                    </Stack>

                    <Stack spacing={1.5} sx={{ maxHeight: 520, overflowY: "auto", pr: 0.5 }}>
                      {generatedThaiIds.map((id, index) => {
                        const display = thaiIdHyphen ? formatThaiNationalId(id) : id;
                        const d1 = parseInt(id[0], 10);
                        const meaning = THAI_ID_TYPES[d1] || "";

                        return (
                          <Paper
                            key={id + index}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1.5,
                              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
                              <Chip label={`#${index + 1}`} size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontFamily: "var(--font-google-sans-code), monospace",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {display}
                                </Typography>
                                <Tooltip title={meaning} arrow placement="top-start">
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {meaning}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: "center" }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                onClick={() => copyValue(display, "เลขบัตรประชาชน")}
                              >
                                คัดลอก
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  setVerifyInput(id);
                                  setShowExplanation(true);
                                }}
                              >
                                ตรวจสูตร
                              </Button>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* กล่องขวา: ตรวจสอบความถูกต้อง (Validator & Formula Analyzer) */}
            <Card variant="outlined">
              <CardHeader
                title="ตัวตรวจความถูกต้อง (Check Digit Validator)"
                subheader="วางหรือพิมพ์เลขบัตรประชาชน 13 หลัก (ใส่ได้เฉพาะตัวเลข)"
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={2.5}>
                  <TextField
                    label="กรอกหรือวางเลขบัตรประชาชน (13 หลัก)"
                    placeholder="เช่น 1234567890123"
                    value={verifyInput}
                    onChange={(e) => {
                      // รับเฉพาะตัวเลข 0-9 และจำกัดความยาวไม่เกิน 13 หลัก
                      const clean = e.target.value.replace(/\D/g, "").slice(0, 13);
                      setVerifyInput(clean);
                    }}
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 13,
                      },
                      input: {
                        sx: { fontFamily: "var(--font-google-sans-code), monospace", fontWeight: 600 },
                      },
                    }}
                    helperText={
                      verifyInput.length > 0 && verifyInput.length < 13
                        ? `กรอกตัวเลขแล้ว: ${verifyInput.length}/13 หลัก (ยังขาดอีก ${13 - verifyInput.length} หลัก)`
                        : verifyInput.length === 13
                        ? "ครบ 13 หลักแล้ว (ตัวเลขล้วน)"
                        : "ใส่ได้เฉพาะตัวเลข ความยาว 13 หลัก"
                    }
                    error={verifyInput.length > 0 && verifyInput.length < 13}
                  />

                  {verifyInput.trim() ? (
                    <Stack spacing={2}>
                      {explanation.isValid ? (
                        <Alert
                          icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
                          severity="success"
                          variant="filled"
                        >
                          เลขบัตรถูกต้อง! (Check Digit ผ่านการตรวจสอบตามสูตร Mod 11)
                        </Alert>
                      ) : (
                        <Alert
                          icon={<HighlightOffIcon fontSize="inherit" />}
                          severity={explanation.length === 13 ? "error" : "info"}
                          variant="filled"
                        >
                          {explanation.length === 13
                            ? `เลขบัตรไม่ถูกต้อง! หลักสุดท้ายคือ ${explanation.actualCheckDigit} แต่ตามสูตรต้องเป็น ${explanation.expectedCheckDigit}`
                            : `กรอกตัวเลขแล้ว ${explanation.length}/13 หลัก (ต้องการครบ 13 หลัก)`}
                        </Alert>
                      )}

                      <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
                        <Stack spacing={1}>
                          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              จัดรูปแบบ (มีขีด):
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                              {explanation.formatted || "—"}
                            </Typography>
                          </Stack>

                          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              ความหมายหลักแรก (ประเภทบุคคล):
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>
                              {explanation.firstDigitMeaning || "—"}
                            </Typography>
                          </Stack>

                          {explanation.steps.length === 12 && (
                            <>
                              <Divider sx={{ my: 0.5 }} />
                              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="body2" color="text.secondary">
                                  ผลรวมคูณน้ำหนัก (Sum):
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                                  {explanation.sum}
                                </Typography>
                              </Stack>

                              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Typography variant="body2" color="text.secondary">
                                  สูตรคำนวณ Check Digit:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                                  {explanation.ruleFormula}
                                </Typography>
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Paper>

                      {explanation.steps.length === 12 && (
                        <Box>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setShowExplanation(!showExplanation)}
                          >
                            {showExplanation ? "ซ่อนตารางขั้นตอนการคูณ" : "ดูขั้นตอนการคำนวณแต่ละหลัก (12 หลัก)"}
                          </Button>

                          {showExplanation && (
                            <Box sx={{ mt: 1, overflowX: "auto" }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>หลักที่</TableCell>
                                    <TableCell align="center">ตัวเลข</TableCell>
                                    <TableCell align="center">ตัวคูณ</TableCell>
                                    <TableCell align="right">ผลคูณ</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {explanation.steps.map((s) => (
                                    <TableRow key={s.position}>
                                      <TableCell>{s.position}</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                                        {s.digit}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "text.secondary" }}>
                                        × {s.multiplier}
                                      </TableCell>
                                      <TableCell align="right" sx={{ fontFamily: "monospace" }}>
                                        {s.product}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                                      ผลบวกทั้งหมด (Sum)
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                                      {explanation.sum}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                      พิมพ์หรือวางเลขบัตรประชาชนด้านบนเพื่อวิเคราะห์ (13 หลัก)
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      )}

      {/* ===================== MODE: PHONE GENERATOR & VALIDATOR ===================== */}
      {mode === "phone" && (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
          }}
        >
          {/* กล่องซ้าย: สุ่มเบอร์โทรศัพท์ */}
          <Card variant="outlined">
            <CardHeader
              title="สุ่มเบอร์โทรศัพท์ไทย (มือถือ & เบอร์บ้าน/สำนักงาน)"
              subheader="สุ่มหมายเลขโทรศัพท์ตามโครงสร้างมาตรฐานประเทศไทย"
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={phoneType}
                    onChange={(_e, v) => v && setPhoneType(v)}
                  >
                    <ToggleButton value="mobile">เบอร์มือถือ (06, 08, 09)</ToggleButton>
                    <ToggleButton value="landline">เบอร์บ้าน/สำนักงาน (02)</ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={phoneFormat}
                    onChange={(_e, v) => v && setPhoneFormat(v)}
                  >
                    <ToggleButton value="hyphen">มีขีด (081-xxx-xxxx)</ToggleButton>
                    <ToggleButton value="raw">เลขล้วน (081xxxxxxx)</ToggleButton>
                    <ToggleButton value="inter">สากล (+6681xxxxxxx)</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>

                {/* เลือกจำนวน และปุ่มสุ่ม */}
                <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    จำนวน:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={phoneCount}
                    onChange={(_e, v) => v && setPhoneCount(v)}
                    aria-label="เลือกจำนวนรายการ"
                  >
                    {COUNT_PRESETS.map((n) => (
                      <ToggleButton key={n} value={n} sx={{ px: 1.25, minWidth: 36 }}>
                        {n}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <TextField
                    type="text"
                    size="small"
                    label="กำหนดเอง"
                    value={phoneCount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      setPhoneCount(clean ? Math.max(1, Math.min(100, parseInt(clean, 10))) : 1);
                    }}
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 3,
                      },
                    }}
                    sx={{ width: 95 }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleGeneratePhones(phoneCount)}
                  >
                    สุ่มใหม่ ({phoneCount} รายการ)
                  </Button>

                  {generatedPhones.length > 1 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyAllPhones}
                    >
                      คัดลอกทั้งหมด
                    </Button>
                  )}
                </Stack>

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    maxHeight: 520,
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {generatedPhones.map((p, idx) => (
                    <Paper
                      key={p + idx}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {phoneType === "mobile" ? "เบอร์มือถือไทย" : "เบอร์สำนักงาน"} #{idx + 1}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "var(--font-google-sans-code), monospace",
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {p}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyValue(p, "เบอร์โทรศัพท์")}
                        sx={{ flexShrink: 0, ml: 1 }}
                      >
                        คัดลอก
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* กล่องขวา: ตรวจสอบเบอร์โทรศัพท์ */}
          <Card variant="outlined">
            <CardHeader
              title="ตัวตรวจเบอร์โทรศัพท์ไทย (Phone Validator)"
              subheader="วางหรือพิมพ์หมายเลขโทรศัพท์ 9-10 หลัก (ใส่ได้เฉพาะตัวเลข)"
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="กรอกหรือวางเบอร์โทรศัพท์ (ใส่เฉพาะตัวเลข)"
                  placeholder="เช่น 0812345678 หรือ 021234567"
                  value={phoneVerifyInput}
                  onChange={(e) => {
                    // รับเฉพาะตัวเลข 0-9 และตัดความยาวไม่เกิน 10 หลัก
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhoneVerifyInput(clean);
                  }}
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 10,
                    },
                    input: {
                      sx: { fontFamily: "var(--font-google-sans-code), monospace", fontWeight: 600 },
                    },
                  }}
                  helperText={
                    phoneVerifyInput.length > 0 && phoneVerifyInput.length < 9
                      ? `กรอกตัวเลขแล้ว: ${phoneVerifyInput.length} หลัก (ต้องการ 9 หรือ 10 หลัก)`
                      : phoneVerifyInput.length >= 9
                      ? `กรอกครบแล้ว (${phoneVerifyInput.length} หลัก)`
                      : "ใส่ได้เฉพาะตัวเลข 9-10 หลัก"
                  }
                  error={phoneVerifyInput.length > 0 && phoneVerifyInput.length < 9}
                />

                {phoneVerifyInput.trim() ? (
                  <Stack spacing={2}>
                    {phoneValidation.isValid ? (
                      <Alert
                        icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
                        severity="success"
                        variant="filled"
                      >
                        เบอร์โทรศัพท์ถูกต้อง! ({phoneValidation.typeName})
                      </Alert>
                    ) : (
                      <Alert
                        icon={<HighlightOffIcon fontSize="inherit" />}
                        severity={phoneVerifyInput.length >= 9 ? "error" : "info"}
                        variant="filled"
                      >
                        {phoneVerifyInput.length >= 9
                          ? "หมายเลขไม่ตรงกับโครงสร้างเบอร์โทรศัพท์ไทย (มือถือ 06/08/09 หรือเบอร์บ้าน 02/03/04/05/07)"
                          : `กรอกตัวเลขแล้ว ${phoneVerifyInput.length} หลัก (ต้องการ 9 หรือ 10 หลัก)`}
                      </Alert>
                    )}

                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
                      <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            จัดรูปแบบ:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                            {phoneValidation.formatted || "—"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            ประเภท:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {phoneValidation.typeName || "—"}
                          </Typography>
                        </Stack>

                        {phoneValidation.isValid && (
                          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              รหัสสากล (E.164):
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                              +66{phoneValidation.cleanPhone.slice(1)}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    พิมพ์หรือวางเบอร์โทรศัพท์ด้านบนเพื่อตรวจสอบ
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ===================== MODE: TAX ID & CORPORATE ===================== */}
      {mode === "tax-id" && (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" },
          }}
        >
          {/* กล่องซ้าย: สุ่มเลขนิติบุคคล */}
          <Card variant="outlined">
            <CardHeader
              title="สุ่มเลขนิติบุคคล / เลขผู้เสียภาษี 13 หลัก"
              subheader="สร้างเลขนิติบุคคลพร้อมชื่อบริษัทจำลองและรหัสสาขา สำหรับเทสระบบ e-Tax, ERP, B2B"
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={3}>
                {/* เลือกจำนวน และปุ่มสุ่ม */}
                <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    จำนวน:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={taxIdCount}
                    onChange={(_e, v) => v && setTaxIdCount(v)}
                    aria-label="เลือกจำนวนรายการ"
                  >
                    {COUNT_PRESETS.map((n) => (
                      <ToggleButton key={n} value={n} sx={{ px: 1.25, minWidth: 36 }}>
                        {n}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <TextField
                    type="text"
                    size="small"
                    label="กำหนดเอง"
                    value={taxIdCount}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, "");
                      setTaxIdCount(clean ? Math.max(1, Math.min(100, parseInt(clean, 10))) : 1);
                    }}
                    slotProps={{
                      htmlInput: {
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 3,
                      },
                    }}
                    sx={{ width: 95 }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={() => handleGenerateTaxList(taxIdCount)}
                  >
                    สุ่มใหม่ ({taxIdCount} บริษัท)
                  </Button>

                  {generatedTaxList.length > 1 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyAllTaxIds}
                    >
                      คัดลอกทั้งหมด
                    </Button>
                  )}
                </Stack>

                <Divider />

                <Stack spacing={1.5} sx={{ maxHeight: 520, overflowY: "auto", pr: 0.5 }}>
                  {generatedTaxList.map((item, idx) => (
                    <Paper
                      key={item.taxId + idx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                          {item.company}
                        </Typography>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 0.5, flexWrap: "wrap" }}>
                          <Chip
                            label={`เลขนิติบุคคล: ${item.taxId}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontFamily: "monospace", fontWeight: 600, flexShrink: 0 }}
                          />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {item.branch}
                          </Typography>
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0, alignItems: "center" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => copyValue(item.taxId, "เลขประจำตัวผู้เสียภาษี")}
                        >
                          คัดลอกเลขภาษี
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            setTaxVerifyInput(item.taxId);
                          }}
                        >
                          ตรวจสูตร
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* กล่องขวา: ตรวจสอบเลขนิติบุคคล */}
          <Card variant="outlined">
            <CardHeader
              title="ตัวตรวจเลขนิติบุคคล (Tax ID Validator)"
              subheader="วางหรือพิมพ์เลขประจำตัวผู้เสียภาษี 13 หลัก (ใส่ได้เฉพาะตัวเลข)"
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="กรอกหรือวางเลขนิติบุคคล (13 หลัก)"
                  placeholder="เช่น 0105558000000"
                  value={taxVerifyInput}
                  onChange={(e) => {
                    // รับเฉพาะตัวเลข 0-9 และตัดความยาวไม่เกิน 13 หลัก
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 13);
                    setTaxVerifyInput(clean);
                  }}
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 13,
                    },
                    input: {
                      sx: { fontFamily: "var(--font-google-sans-code), monospace", fontWeight: 600 },
                    },
                  }}
                  helperText={
                    taxVerifyInput.length > 0 && taxVerifyInput.length < 13
                      ? `กรอกตัวเลขแล้ว: ${taxVerifyInput.length}/13 หลัก (ยังขาดอีก ${13 - taxVerifyInput.length} หลัก)`
                      : taxVerifyInput.length === 13
                      ? "ครบ 13 หลักแล้ว (ตัวเลขล้วน)"
                      : "ใส่ได้เฉพาะตัวเลข ความยาว 13 หลัก"
                  }
                  error={taxVerifyInput.length > 0 && taxVerifyInput.length < 13}
                />

                {taxVerifyInput.trim() ? (
                  <Stack spacing={2}>
                    {taxExplanation.isValid ? (
                      <Alert
                        icon={<CheckCircleOutlinedIcon fontSize="inherit" />}
                        severity="success"
                        variant="filled"
                      >
                        เลขนิติบุคคลถูกต้อง! (Check Digit ผ่านการตรวจสอบตามสูตร Mod 11)
                      </Alert>
                    ) : (
                      <Alert
                        icon={<HighlightOffIcon fontSize="inherit" />}
                        severity={taxExplanation.length === 13 ? "error" : "info"}
                        variant="filled"
                      >
                        {taxExplanation.length === 13
                          ? `เลขนิติบุคคลไม่ถูกต้อง! หลักสุดท้ายคือ ${taxExplanation.actualCheckDigit} แต่ตามสูตรต้องเป็น ${taxExplanation.expectedCheckDigit}`
                          : `กรอกตัวเลขแล้ว ${taxExplanation.length}/13 หลัก (ต้องการครบ 13 หลัก)`}
                      </Alert>
                    )}

                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
                      <Stack spacing={1}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            ความยาว:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                            {taxExplanation.length}/13 หลัก
                          </Typography>
                        </Stack>

                        {taxExplanation.ruleFormula && (
                          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2" color="text.secondary">
                              สูตร Check Digit:
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                              {taxExplanation.ruleFormula}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    พิมพ์หรือวางเลขนิติบุคคลด้านบนเพื่อตรวจสอบ (13 หลัก)
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ===================== MODE: DEV TOKENS ===================== */}
      {mode === "dev-tokens" && (
        <Card variant="outlined">
          <CardHeader
            title="Developer & Security Tokens"
            subheader="สุ่ม UUID v4, OTP 6 หลัก, Ref Code, Dummy API Key สำหรับนักพัฒนาและ QA"
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleGenerateDevTokens(uuidCount)}
                >
                  สุ่มใหม่ทั้งหมด
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                {/* OTP & Ref */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    OTP จำลอง 6 หลัก พร้อมรหัสอ้างอิง (Ref)
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1,
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 3 }}
                      >
                        {mockOtp.otp}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ref: {mockOtp.ref}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyValue(mockOtp.otp, "OTP")}
                    >
                      คัดลอก OTP
                    </Button>
                  </Stack>
                </Paper>

                {/* API Key */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Dummy Test API Key (Secret Key)
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 1,
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        fontWeight: 600,
                        maxWidth: "70%",
                      }}
                    >
                      {mockApiKey}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyValue(mockApiKey, "API Key")}
                    >
                      คัดลอก
                    </Button>
                  </Stack>
                </Paper>
              </Box>

              {/* UUID v4 List */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    UUID v4 ({generatedUuids.length} รายการ)
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      จำนวน:
                    </Typography>
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={uuidCount}
                      onChange={(_e, v) => {
                        if (v) {
                          setUuidCount(v);
                          handleGenerateDevTokens(v);
                        }
                      }}
                    >
                      {[1, 5, 10, 20].map((n) => (
                        <ToggleButton key={n} value={n} sx={{ px: 1, py: 0.25, fontSize: 12 }}>
                          {n}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                    {generatedUuids.length > 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyAllUuids}
                        sx={{ fontSize: 12 }}
                      >
                        คัดลอกทั้งหมด
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Stack spacing={1} sx={{ mt: 1, maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
                  {generatedUuids.map((u, i) => (
                    <Stack
                      key={u + i}
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}
                      >
                        {u}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyValue(u, "UUID")}
                      >
                        คัดลอก
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
