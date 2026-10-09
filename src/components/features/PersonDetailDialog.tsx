"use client";

import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { copyToClipboard } from "@/lib/utils";
import type { PersonRecord } from "@/lib/generators/person";
import { FIELD_DEFS, type FieldKey } from "@/types/schema";

/** ใช้ id เดียวกับ toast ของ DataTable คลิกรัวๆ จะอัปเดต toast เดิมแทนการซ้อนกัน */
const COPY_TOAST_ID = "data-table-copy";

function truncateForToast(value: string, max = 60): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

async function copyWithToast(text: string, successMessage?: string) {
  const ok = await copyToClipboard(text);
  toast[ok ? "success" : "error"](
    ok ? successMessage ?? `คัดลอก "${truncateForToast(text)}" แล้ว` : "คัดลอกไม่สำเร็จ",
    { id: COPY_TOAST_ID }
  );
}

interface PersonDetailDialogProps {
  open: boolean;
  /** คงค่าเดิมไว้ตอนปิด เพื่อไม่ให้เนื้อหาหายไปกลาง animation ปิด modal */
  person: PersonRecord | null;
  /** ฟิลด์ที่แสดง เรียงตามที่เลือกไว้ในตาราง */
  fields: FieldKey[];
  onClose: () => void;
}

/**
 * modal แสดงข้อมูลของคนเดียวแบบแนวตั้ง — กันการคัดลอกผิดแถวตอนตารางยาวๆ
 * คลิกที่แถวไหนก็ได้เพื่อคัดลอกค่านั้น หรือคัดลอกทั้งคนเป็น JSON
 */
export function PersonDetailDialog({ open, person, fields, onClose }: PersonDetailDialogProps) {
  const fullName = person ? `${person.titleTh}${person.firstNameTh} ${person.lastNameTh}` : "";

  const handleCopyJson = () => {
    if (!person) return;
    const json = JSON.stringify(Object.fromEntries(fields.map((f) => [f, person[f]])), null, 2);
    copyWithToast(json, `คัดลอกข้อมูลของ ${fullName} เป็น JSON แล้ว`);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      {person && (
        <>
          <DialogTitle sx={{ pr: 7 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Chip label={`#${person.id}`} size="small" color="primary" variant="outlined" />
              <Typography variant="h6" component="span" noWrap>
                {fullName}
              </Typography>
            </Stack>
            <IconButton
              onClick={onClose}
              aria-label="ปิด"
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0 }}>
            <List disablePadding>
              {fields.map((f) => {
                const label = FIELD_DEFS.find((d) => d.key === f)?.label ?? f;
                const value = String(person[f] ?? "");
                return (
                  <Tooltip key={f} title="คลิกเพื่อคัดลอก" placement="left" enterDelay={400} enterNextDelay={400}>
                    <ListItemButton
                      divider
                      disabled={!value}
                      onClick={() => copyWithToast(value)}
                      aria-label={`คัดลอก ${label}`}
                      sx={{ px: 3, py: 1.25, gap: 2, alignItems: "center" }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {label}
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                          {value || "—"}
                        </Typography>
                      </Box>
                      <ContentCopyIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0 }} />
                    </ListItemButton>
                  </Tooltip>
                );
              })}
            </List>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={onClose}>ปิด</Button>
            <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyJson}>
              คัดลอกทั้งหมดเป็น JSON
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
