"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { SvgIconComponent } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { downloadBlob, formatBytes } from "@/lib/download";
import {
  createTextBlob,
  createBinaryBlob,
  createCsvBlob,
  createJsonBlob,
  createImageBlob,
  createPdfBlob,
  bundleFilesAsZip,
  ImageFormat,
} from "@/lib/generators/file";
import { addHistoryEntry } from "@/lib/history";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/site";

type FileKind = "txt" | "csv" | "json" | "bin" | "image" | "pdf";

// เก็บเป็น component ไม่ใช่ element (ดูเหตุผลใน MarketingHero)
const FILE_KINDS: { key: FileKind; label: string; ext: string; Icon: SvgIconComponent; exact: boolean }[] = [
  { key: "txt", label: "ข้อความ", ext: "txt", Icon: DescriptionOutlinedIcon, exact: true },
  { key: "csv", label: "CSV", ext: "csv", Icon: TableChartOutlinedIcon, exact: true },
  { key: "json", label: "JSON", ext: "json", Icon: DataObjectIcon, exact: true },
  { key: "bin", label: "Binary", ext: "bin", Icon: MemoryOutlinedIcon, exact: true },
  { key: "image", label: "รูปภาพ", ext: "jpg", Icon: ImageOutlinedIcon, exact: false },
  { key: "pdf", label: "PDF", ext: "pdf", Icon: PictureAsPdfOutlinedIcon, exact: false },
];

const SIZE_PRESETS = [
  { label: "1 KB", bytes: 1024 },
  { label: "10 KB", bytes: 10 * 1024 },
  { label: "100 KB", bytes: 100 * 1024 },
  { label: "500 KB", bytes: 500 * 1024 },
  { label: "1 MB", bytes: 1024 * 1024 },
  { label: "5 MB", bytes: 5 * 1024 * 1024 },
  { label: "10 MB", bytes: 10 * 1024 * 1024 },
  { label: "50 MB", bytes: 50 * 1024 * 1024 },
];

const IMAGE_DIMENSIONS = [
  { label: "150×150", w: 150, h: 150 },
  { label: "640×480", w: 640, h: 480 },
  { label: "1280×720 (HD)", w: 1280, h: 720 },
  { label: "1920×1080 (FHD)", w: 1920, h: 1080 },
  { label: "3840×2160 (4K)", w: 3840, h: 2160 },
];

const MAX_BYTES: Record<FileKind, number> = {
  txt: 50 * 1024 * 1024,
  csv: 50 * 1024 * 1024,
  json: 50 * 1024 * 1024,
  bin: 500 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  // PDF ถูกจำกัดไว้ต่ำกว่าชนิดอื่นมากเพราะการเพิ่มจำนวนหน้าใน pdf-lib
  // มีต้นทุนด้าน performance ต่อหน้าที่เพิ่มขึ้นเร็วมาก (ทดสอบแล้วพบว่า ~190 หน้าใช้เวลา
  // เกิน 20 วินาที) ค่านี้อยู่ในช่วงที่ยังตอบสนองไว
  pdf: 200 * 1024,
};

interface GeneratedFile {
  name: string;
  blob: Blob;
}

export function FileGenerator() {
  const [kind, setKind] = useState<FileKind>("txt");
  const [sizeBytes, setSizeBytes] = useState(1024 * 1024);
  const [count, setCount] = useState(1);
  const [imageDim, setImageDim] = useState(IMAGE_DIMENSIONS[2]);
  const [imageFormat, setImageFormat] = useState<ImageFormat>("jpeg");
  const [useTargetSizeForImage, setUseTargetSizeForImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedFile[]>([]);

  const currentKindDef = FILE_KINDS.find((k) => k.key === kind)!;

  const clampedBytes = Math.min(sizeBytes, MAX_BYTES[kind]);

  async function generateSingle(index: number): Promise<GeneratedFile> {
    const suffix = count > 1 ? `-${index + 1}` : "";
    switch (kind) {
      case "txt":
        return { name: `test-file${suffix}.txt`, blob: createTextBlob(clampedBytes) };
      case "csv":
        return { name: `test-data${suffix}.csv`, blob: createCsvBlob(clampedBytes) };
      case "json":
        return { name: `test-data${suffix}.json`, blob: createJsonBlob(clampedBytes) };
      case "bin":
        return { name: `test-file${suffix}.bin`, blob: createBinaryBlob(clampedBytes) };
      case "image": {
        const { blob } = await createImageBlob({
          width: imageDim.w,
          height: imageDim.h,
          format: imageFormat,
          targetSizeBytes: useTargetSizeForImage ? clampedBytes : undefined,
        });
        return { name: `test-image${suffix}.${imageFormat === "png" ? "png" : "jpg"}`, blob };
      }
      case "pdf": {
        const { blob } = await createPdfBlob(clampedBytes);
        return { name: `test-document${suffix}.pdf`, blob };
      }
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const files: GeneratedFile[] = [];
      for (let i = 0; i < count; i++) {
        files.push(await generateSingle(i));
      }
      setResults(files);

      if (files.length === 1) {
        downloadBlob(files[0].blob, files[0].name);
      } else {
        const zip = await bundleFilesAsZip(files);
        downloadBlob(zip, `test-files-${Date.now()}.zip`);
      }
      addHistoryEntry({
        kind: "file",
        title: `ไฟล์ ${currentKindDef.label} ${files.length} ไฟล์ (${formatBytes(clampedBytes)}/ไฟล์)`,
        count: files.length,
      });
      toast.success(`สร้างและดาวน์โหลด ${files.length} ไฟล์แล้ว`);
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดระหว่างสร้างไฟล์");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAllZip = async () => {
    const zip = await bundleFilesAsZip(results);
    downloadBlob(zip, `test-files-${Date.now()}.zip`);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          สร้างไฟล์ทดสอบขนาดต่างๆ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เลือกชนิดไฟล์ กำหนดขนาด แล้วสร้างเพื่อทดสอบระบบอัปโหลด/จำกัดขนาดไฟล์ได้ทันที
        </Typography>
      </Stack>

      <Card>
        <CardHeader title={<Typography variant="h6">ชนิดไฟล์</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
            }}
          >
            {FILE_KINDS.map((k) => (
              <Button
                key={k.key}
                variant={kind === k.key ? "contained" : "outlined"}
                onClick={() => setKind(k.key)}
                sx={{ flexDirection: "column", gap: 1, py: 2 }}
              >
                <k.Icon />
                {k.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={<Typography variant="h6">ขนาดไฟล์</Typography>}
          subheader={
            currentKindDef.exact
              ? "ขนาดไฟล์จะตรงตามที่กำหนดแบบเป๊ะๆ (ไบต์)"
              : kind === "image"
              ? "เติม padding ท้ายไฟล์ให้ได้ขนาดตามกำหนด ภาพยังเปิดดูได้ปกติ"
              : "ขนาด PDF เป็นค่าประมาณ (เพิ่มจำนวนหน้าจนใกล้เคียงเป้าหมาย)"
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={sizeBytes}
                onChange={(_e, v) => v && setSizeBytes(v)}
                aria-label="ขนาดไฟล์"
              >
                {SIZE_PRESETS.filter((p) => p.bytes <= MAX_BYTES[kind]).map((p) => (
                  <ToggleButton key={p.label} value={p.bytes}>
                    {p.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <TextField
                type="number"
                size="small"
                label="กำหนดเอง (KB)"
                value={Math.round(sizeBytes / 1024)}
                onChange={(e) => setSizeBytes(Math.max(1, Number(e.target.value) || 1) * 1024)}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ width: 150 }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              ขนาดที่จะสร้าง:{" "}
              <Typography component="span" variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                {formatBytes(clampedBytes)}
              </Typography>
              {sizeBytes > MAX_BYTES[kind] && ` (จำกัดสูงสุด ${formatBytes(MAX_BYTES[kind])} สำหรับชนิดไฟล์นี้)`}
            </Typography>

            {kind === "image" && (
              <>
                <Divider />
                <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={imageDim.label}
                    onChange={(_e, v) => v && setImageDim(IMAGE_DIMENSIONS.find((d) => d.label === v)!)}
                    aria-label="ขนาดภาพ"
                  >
                    {IMAGE_DIMENSIONS.map((d) => (
                      <ToggleButton key={d.label} value={d.label}>
                        {d.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={imageFormat}
                    onChange={(_e, v) => v && setImageFormat(v)}
                    aria-label="รูปแบบไฟล์ภาพ"
                  >
                    <ToggleButton value="jpeg">JPEG</ToggleButton>
                    <ToggleButton value="png">PNG</ToggleButton>
                  </ToggleButtonGroup>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={useTargetSizeForImage}
                        onChange={(e) => setUseTargetSizeForImage(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">บังคับขนาดไฟล์ตามที่กำหนด</Typography>}
                  />
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={<Typography variant="h6">จำนวนไฟล์</Typography>}
          subheader="สร้างหลายไฟล์พร้อมกันได้ในคลิกเดียว (ดาวน์โหลดรวมเป็น .zip)"
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={count}
              onChange={(_e, v) => v && setCount(v)}
              aria-label="จำนวนไฟล์"
            >
              {[1, 2, 5, 10, 20].map((n) => (
                <ToggleButton key={n} value={n}>
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Button
              variant="contained"
              size="large"
              disabled={isGenerating}
              onClick={handleGenerate}
              startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              sx={{ ml: { sm: "auto" } }}
            >
              {isGenerating ? "กำลังสร้างไฟล์..." : `สร้าง & ดาวน์โหลด ${count > 1 ? `(${count} ไฟล์)` : ""}`}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      {results.length > 0 && (
        <Card>
          <CardHeader
            title={<Typography variant="h6">ไฟล์ล่าสุดที่สร้าง</Typography>}
            action={
              results.length > 1 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FolderZipOutlinedIcon />}
                  onClick={handleDownloadAllZip}
                >
                  ดาวน์โหลดรวม .zip
                </Button>
              )
            }
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={1}>
              {results.map((f, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1 }}
                >
                  <Typography variant="body2" sx={{ fontFamily: "var(--font-google-sans-code), monospace" }}>
                    {f.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatBytes(f.blob.size)}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label={`ดาวน์โหลด ${f.name}`}
                      onClick={() => downloadBlob(f.blob, f.name)}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`ลบ ${f.name} ออกจากรายการ`}
                      onClick={() => setResults((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
