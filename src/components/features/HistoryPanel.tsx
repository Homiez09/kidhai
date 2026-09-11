"use client";

import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { getHistory, removeHistoryEntry, clearHistory, HistoryEntry } from "@/lib/history";

// เก็บเป็น component ไม่ใช่ element (ดูเหตุผลใน MarketingHero)
const KIND_ICON = {
  person: PeopleAltOutlinedIcon,
  card: CreditCardOutlinedIcon,
  file: FolderZipOutlinedIcon,
} as const;

const KIND_LABEL = { person: "ข้อมูลบุคคล", card: "บัตรเครดิต", file: "ไฟล์ทดสอบ" } as const;

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export function HistoryPanel() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // อ่านจาก localStorage หลัง mount เท่านั้น เพื่อไม่ให้ชนกับ SSR
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getHistory());
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Stack spacing={0.5}>
          <Typography variant="h5" component="h1">
            ประวัติการสร้างข้อมูล
          </Typography>
          <Typography variant="body2" color="text.secondary">
            บันทึกไว้ในเบราว์เซอร์ของคุณเท่านั้น (localStorage)
          </Typography>
        </Stack>
        {entries.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlinedIcon />}
            sx={{ flexShrink: 0 }}
            onClick={() => {
              clearHistory();
              setEntries([]);
            }}
          >
            ล้างประวัติทั้งหมด
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent sx={{ p: entries.length === 0 ? 3 : 1 }}>
          {entries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
              ยังไม่มีประวัติการสร้างข้อมูล
            </Typography>
          ) : (
            <List disablePadding>
              {entries.map((e) => {
                const KindIcon = KIND_ICON[e.kind];
                return (
                <ListItem
                  key={e.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label={`ลบ ${e.title}`}
                      onClick={() => {
                        removeHistoryEntry(e.id);
                        setEntries((prev) => prev.filter((x) => x.id !== e.id));
                      }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ bgcolor: "action.hover", color: "text.secondary" }}>
                      <KindIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={e.title}
                    secondary={
                      <Stack direction="row" spacing={1} component="span" sx={{ alignItems: "center", mt: 0.5 }}>
                        <Chip label={KIND_LABEL[e.kind]} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {timeAgo(e.createdAt)}
                        </Typography>
                      </Stack>
                    }
                    slotProps={{ secondary: { component: "div" } }}
                  />
                </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
