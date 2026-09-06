"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  FileSpreadsheet,
  Braces,
  Binary,
  Image as ImageIcon,
  FileType as FileTypeIcon,
  Download,
  Loader2,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
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

const FILE_KINDS: { key: FileKind; label: string; ext: string; icon: typeof FileText; exact: boolean }[] = [
  { key: "txt", label: "ข้อความ", ext: "txt", icon: FileText, exact: true },
  { key: "csv", label: "CSV", ext: "csv", icon: FileSpreadsheet, exact: true },
  { key: "json", label: "JSON", ext: "json", icon: Braces, exact: true },
  { key: "bin", label: "Binary", ext: "bin", icon: Binary, exact: true },
  { key: "image", label: "รูปภาพ", ext: "jpg", icon: ImageIcon, exact: false },
  { key: "pdf", label: "PDF", ext: "pdf", icon: FileTypeIcon, exact: false },
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">สร้างไฟล์ทดสอบขนาดต่างๆ</h1>
        <p className="text-sm text-muted mt-1">
          เลือกชนิดไฟล์ กำหนดขนาด แล้วสร้างเพื่อทดสอบระบบอัปโหลด/จำกัดขนาดไฟล์ได้ทันที
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ชนิดไฟล์</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 pt-0 sm:grid-cols-3 md:grid-cols-6">
          {FILE_KINDS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.key;
            return (
              <button
                key={k.key}
                onClick={() => setKind(k.key)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors",
                  active ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:bg-surface-2"
                )}
              >
                <Icon size={20} />
                {k.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ขนาดไฟล์</CardTitle>
          <CardDescription>
            {currentKindDef.exact
              ? "ขนาดไฟล์จะตรงตามที่กำหนดแบบเป๊ะๆ (ไบต์)"
              : kind === "image"
              ? "เติม padding ท้ายไฟล์ให้ได้ขนาดตามกำหนด ภาพยังเปิดดูได้ปกติ"
              : "ขนาด PDF เป็นค่าประมาณ (เพิ่มจำนวนหน้าจนใกล้เคียงเป้าหมาย)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            {SIZE_PRESETS.filter((p) => p.bytes <= MAX_BYTES[kind]).map((p) => (
              <button
                key={p.label}
                onClick={() => setSizeBytes(p.bytes)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium",
                  sizeBytes === p.bytes ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"
                )}
              >
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1">
              <input
                type="number"
                min={1}
                value={Math.round(sizeBytes / 1024)}
                onChange={(e) => setSizeBytes(Math.max(1, Number(e.target.value) || 1) * 1024)}
                className="w-24 bg-transparent text-xs outline-none"
              />
              <span className="text-xs text-muted">KB (กำหนดเอง)</span>
            </div>
          </div>
          <p className="text-xs text-muted">
            ขนาดที่จะสร้าง: <span className="font-semibold text-foreground">{formatBytes(clampedBytes)}</span>
            {sizeBytes > MAX_BYTES[kind] && ` (จำกัดสูงสุด ${formatBytes(MAX_BYTES[kind])} สำหรับชนิดไฟล์นี้)`}
          </p>

          {kind === "image" && (
            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {IMAGE_DIMENSIONS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setImageDim(d)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs",
                      imageDim.label === d.label
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                {(["jpeg", "png"] as ImageFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setImageFormat(f)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium uppercase",
                      imageFormat === f ? "bg-surface-2 text-foreground" : "text-muted"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={useTargetSizeForImage}
                  onChange={(e) => setUseTargetSizeForImage(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                />
                บังคับขนาดไฟล์ตามที่กำหนด
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>จำนวนไฟล์</CardTitle>
          <CardDescription>สร้างหลายไฟล์พร้อมกันได้ในคลิกเดียว (ดาวน์โหลดรวมเป็น .zip)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 pt-0">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            {[1, 2, 5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium",
                  count === n ? "bg-accent text-accent-foreground" : "text-muted"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="ml-auto">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGenerating ? "กำลังสร้างไฟล์..." : `สร้าง & ดาวน์โหลด ${count > 1 ? `(${count} ไฟล์)` : ""}`}
          </Button>
        </CardContent>
      </Card>

      <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ไฟล์ล่าสุดที่สร้าง</CardTitle>
            {results.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleDownloadAllZip}>
                <Archive size={13} /> ดาวน์โหลดรวม .zip
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
            {results.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"
              >
                <span className="font-mono">{f.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted">{formatBytes(f.blob.size)}</span>
                  <button
                    onClick={() => downloadBlob(f.blob, f.name)}
                    className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => setResults((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
