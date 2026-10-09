"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, keyframes } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { copyToClipboard } from "@/lib/utils";

/** ระยะเวลาของ animation พื้นหลังตอนคัดลอกเซลล์ (ms) */
const FLASH_MS = 900;

/** toast ทุกครั้งที่คัดลอกใช้ id เดียวกัน คลิกรัวๆ จะอัปเดต toast เดิมแทนการเด้งซ้อนกันเป็นตั้ง */
const COPY_TOAST_ID = "data-table-copy";

/** ตัดข้อความยาวๆ (เช่นที่อยู่/JSON) ก่อนโชว์ใน toast ไม่ให้ล้นกล่อง */
function truncateForToast(value: string, max = 60): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * พื้นหลังวาบขึ้นทันทีที่คัดลอก แล้วค่อยๆ จางกลับเป็นปกติ — ตอบรับแบบเงียบๆ ในเซลล์ ส่วนข้อความ
 * "คัดลอกแล้ว" ไปขึ้นเป็น toast ต่างหาก (ลอยแบดจ์ทับตารางแบบเดิมดูรก)
 * มีสองชุดที่ให้ผลเหมือนกันเป๊ะแต่เขียนต่างกัน (from/to กับ 0%/100%) เพื่อให้ emotion สร้างชื่อ animation
 * คนละชื่อ แล้วสลับใช้ตาม nonce — ไม่งั้นการคลิกเซลล์เดิมซ้ำภายใน FLASH_MS จะไม่เล่น animation ใหม่
 */
const flashKeyframes = [
  keyframes`
    from { background-color: var(--kh-flash-color); }
    to   { background-color: transparent; }
  `,
  keyframes`
    0%   { background-color: var(--kh-flash-color); }
    100% { background-color: transparent; }
  `,
];

export interface DataTableColumn<T> {
  /** คีย์ของคอลัมน์ ต้องไม่ซ้ำกันภายในตารางเดียว */
  key: string;
  label: ReactNode;
  /** ข้อความจริงของเซลล์ ใช้ทั้งแสดงผลและเป็นค่าที่คัดลอก */
  value: (row: T, index: number) => string;
  /** แทนที่การแสดงผล (ยังคัดลอกค่าจาก value หรือ copyValue) */
  render?: (row: T, index: number) => ReactNode;
  /** ระบุเมื่อค่าที่ต้องการคัดลอกต่างจากค่าที่แสดง เช่น เลขบัตรที่จัดรูปแบบเว้นวรรคไว้ */
  copyValue?: (row: T, index: number) => string;
  /** ปิดการคลิกคัดลอกเฉพาะคอลัมน์นี้ (ค่าเริ่มต้น: เปิด) */
  copyable?: boolean;
  align?: "left" | "right" | "center";
  /** ไม่ตัดบรรทัด */
  nowrap?: boolean;
  /** ใช้ฟอนต์ monospace */
  mono?: boolean;
  sx?: SxProps<Theme>;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /**
   * เปิด/ปิดการคลิกที่เซลล์เพื่อคัดลอก ทั้งตาราง (ค่าเริ่มต้น: true)
   * ตั้ง false เมื่อไม่ต้องการให้ตารางคัดลอกได้เลย ส่วนการปิดเฉพาะคอลัมน์ใช้ column.copyable
   */
  copyOnCellClick?: boolean;
  /** เรียกหลังผู้ใช้คลิกคัดลอกเซลล์ (toast ขึ้นให้อัตโนมัติแล้ว) ใช้ต่อยอดเป็น analytics เพิ่มได้ */
  onCopyCell?: (info: {
    row: T;
    rowIndex: number;
    column: DataTableColumn<T>;
    value: string;
    ok: boolean;
  }) => void;
  /** คอลัมน์แรกสุดสำหรับปุ่มประจำแถว (เช่น ดูรายละเอียด) */
  leadingActions?: (row: T, index: number) => ReactNode;
  /** หัวคอลัมน์ของ leadingActions */
  leadingActionsLabel?: ReactNode;
  /** คอลัมน์ท้ายสุดสำหรับปุ่มประจำแถว */
  rowActions?: (row: T, index: number) => ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
  emptyMessage?: ReactNode;
  size?: "small" | "medium";
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

interface CopyFlash {
  cellId: string;
  ok: boolean;
  /** เพิ่มขึ้นทุกครั้งที่คัดลอก เพื่อสลับ keyframes ให้ animation เริ่มใหม่แม้คลิกเซลล์เดิมซ้ำ */
  nonce: number;
}

export function DataTable<T>({
  columns,
  rows,
  copyOnCellClick = true,
  onCopyCell,
  leadingActions,
  leadingActionsLabel,
  rowActions,
  getRowKey,
  emptyMessage = "ยังไม่มีข้อมูล",
  size = "small",
  stickyHeader = false,
  maxHeight,
}: DataTableProps<T>) {
  const [flash, setFlash] = useState<CopyFlash | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nonceRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const handleCopy = useCallback(
    async (row: T, rowIndex: number, column: DataTableColumn<T>, cellId: string) => {
      const text = column.copyValue?.(row, rowIndex) ?? column.value(row, rowIndex);
      if (!text) return;

      const ok = await copyToClipboard(text);

      nonceRef.current += 1;
      setFlash({ cellId, ok, nonce: nonceRef.current });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFlash(null), FLASH_MS);

      toast[ok ? "success" : "error"](
        ok ? `คัดลอก "${truncateForToast(text)}" แล้ว` : "คัดลอกไม่สำเร็จ",
        { id: COPY_TOAST_ID }
      );

      onCopyCell?.({ row, rowIndex, column, value: text, ok });
    },
    [onCopyCell]
  );

  return (
    <TableContainer component={Paper} variant="outlined" sx={maxHeight ? { maxHeight } : undefined}>
      <Table size={size} stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {leadingActions && (
              <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600, width: 0 }}>
                {leadingActionsLabel}
              </TableCell>
            )}
            {columns.map((c) => (
              <TableCell key={c.key} align={c.align} sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                {c.label}
              </TableCell>
            ))}
            {rowActions && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={getRowKey?.(row, rowIndex) ?? rowIndex} hover>
              {leadingActions && (
                <TableCell align="center" padding="none" sx={{ px: 1 }}>
                  {leadingActions(row, rowIndex)}
                </TableCell>
              )}
              {columns.map((column) => {
                const cellId = `${rowIndex}:${column.key}`;
                const text = column.value(row, rowIndex);
                const canCopy = copyOnCellClick && column.copyable !== false && text.length > 0;
                const active = flash?.cellId === cellId ? flash : null;

                const cell = (
                  <TableCell
                    key={column.key}
                    align={column.align}
                    onClick={canCopy ? () => handleCopy(row, rowIndex, column, cellId) : undefined}
                    onKeyDown={
                      canCopy
                        ? (e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            handleCopy(row, rowIndex, column, cellId);
                          }
                        : undefined
                    }
                    role={canCopy ? "button" : undefined}
                    tabIndex={canCopy ? 0 : undefined}
                    aria-label={canCopy ? `คัดลอก ${text}` : undefined}
                    sx={[
                      {
                        position: "relative",
                        whiteSpace: column.nowrap ? "nowrap" : undefined,
                        fontFamily: column.mono ? "var(--font-google-sans-code), monospace" : undefined,
                      },
                      ...(canCopy
                        ? [
                            (theme: Theme) => ({
                              cursor: "pointer",
                              userSelect: "none" as const,
                              transition: theme.transitions.create("background-color", { duration: 120 }),
                              "&:hover": { backgroundColor: theme.palette.action.hover },
                              "&:focus-visible": {
                                outline: `2px solid ${theme.palette.primary.main}`,
                                outlineOffset: "-2px",
                              },
                            }),
                          ]
                        : []),
                      ...(active
                        ? [
                            (theme: Theme) => ({
                              "--kh-flash-color": alpha(
                                theme.palette[active.ok ? "success" : "error"].main,
                                0.3
                              ),
                              animation: `${flashKeyframes[active.nonce % 2]} ${FLASH_MS}ms ease-out`,
                              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                            }),
                          ]
                        : []),
                      ...(column.sx ? (Array.isArray(column.sx) ? column.sx : [column.sx]) : []),
                    ]}
                  >
                    {column.render ? column.render(row, rowIndex) : text}
                  </TableCell>
                );

                return canCopy ? (
                  <Tooltip key={column.key} title="คลิกเพื่อคัดลอก" enterDelay={400} enterNextDelay={400}>
                    {cell}
                  </Tooltip>
                ) : (
                  cell
                );
              })}

              {rowActions && <TableCell padding="none">{rowActions(row, rowIndex)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 5 }}>
          {emptyMessage}
        </Typography>
      )}
    </TableContainer>
  );
}
