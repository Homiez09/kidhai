"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { CopyButton } from "@/components/ui/CopyButton";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { copyToClipboard } from "@/lib/utils";
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

  const columns = useMemo<DataTableColumn<PersonRecord>[]>(
    () =>
      selectedFields.map((f) => ({
        key: f,
        label: FIELD_DEFS.find((d) => d.key === f)?.label ?? f,
        value: (r: PersonRecord) => String(r[f] ?? ""),
        nowrap: true,
      })),
    [selectedFields]
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
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          สร้างข้อมูลบุคคลสำหรับทดสอบ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เลือกฟิลด์ที่ต้องการ กำหนดจำนวน แล้วสุ่มข้อมูลได้ทันที — คัดลอกหรือ export เป็น JSON / CSV
        </Typography>
      </Stack>

      <Card>
        <Accordion defaultExpanded sx={{ "&::before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontWeight: 600 }}>เลือกฟิลด์ข้อมูล</Typography>
              <Chip label={`${selected.size} ฟิลด์`} size="small" color="primary" variant="outlined" />
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              }}
            >
              {FIELD_GROUPS.map((group) => {
                const fields = FIELD_DEFS.filter((f) => f.group === group.key);
                const allOn = fields.every((f) => selected.has(f.key));
                return (
                  <Paper key={group.key} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="overline" color="text.secondary">
                        {group.label}
                      </Typography>
                      <Button size="small" onClick={() => toggleGroup(group.key, allOn)}>
                        {allOn ? "ล้าง" : "เลือกทั้งหมด"}
                      </Button>
                    </Stack>
                    <Stack>
                      {fields.map((f) => (
                        <FormControlLabel
                          key={f.key}
                          control={
                            <Checkbox
                              size="small"
                              checked={selected.has(f.key)}
                              onChange={() => toggleField(f.key)}
                            />
                          }
                          label={<Typography variant="body2">{f.label}</Typography>}
                        />
                      ))}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Typography variant="h6">ผลลัพธ์</Typography>
              <Chip label={`${records.length.toLocaleString()} รายการ`} size="small" />
            </Stack>
          }
          action={
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_e, v) => v && setView(v)}
              aria-label="รูปแบบการแสดงผล"
            >
              <ToggleButton value="table">
                <TableChartOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> ตาราง
              </ToggleButton>
              <ToggleButton value="json">
                <DataObjectIcon fontSize="small" sx={{ mr: 0.5 }} /> JSON
              </ToggleButton>
            </ToggleButtonGroup>
          }
          sx={{ flexWrap: "wrap", gap: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={count}
                onChange={(_e, v) => v && setCount(v)}
                aria-label="จำนวนรายการ"
              >
                {COUNT_PRESETS.map((n) => (
                  <ToggleButton key={n} value={n}>
                    {n}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <TextField
                type="number"
                size="small"
                label="กำหนดเอง"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
                slotProps={{ htmlInput: { min: 1, max: 5000 } }}
                sx={{ width: 120 }}
              />

              <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => generate()}>
                สุ่มข้อมูลใหม่
              </Button>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", ml: { sm: "auto" } }}>
                <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyAllJson}>
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

            {view === "table" ? (
              <Stack spacing={1}>
                <DataTable
                  rows={records}
                  columns={columns}
                  copyOnCellClick
                  stickyHeader
                  maxHeight={560}
                  emptyMessage={'ยังไม่มีข้อมูล กด "สุ่มข้อมูลใหม่"'}
                  rowActions={(r) => (
                    <CopyButton
                      value={JSON.stringify(Object.fromEntries(selectedFields.map((f) => [f, r[f]])), null, 2)}
                    />
                  )}
                />
                <Typography variant="caption" color="text.secondary">
                  คลิกที่ช่องไหนก็ได้เพื่อคัดลอกเฉพาะค่านั้น หรือกดปุ่มท้ายแถวเพื่อคัดลอกทั้งแถวเป็น JSON
                </Typography>
              </Stack>
            ) : (
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
        </CardContent>
      </Card>
    </Stack>
  );
}
