"use client";

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useColorScheme } from "@mui/material/styles";

export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ค่าโหมดจริงอ่านได้หลัง mount เท่านั้น ถ้า render ก่อนจะไม่ตรงกับฝั่ง server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // จองพื้นที่ปุ่มไว้ก่อน mount เพื่อไม่ให้ toolbar ขยับตอน hydrate
  if (!mounted) return <IconButton disabled aria-hidden sx={{ visibility: "hidden" }}><DarkModeOutlinedIcon /></IconButton>;

  const resolved = mode === "system" ? systemMode : mode;
  const isDark = resolved === "dark";

  return (
    <Tooltip title={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}>
      <IconButton onClick={() => setMode(isDark ? "light" : "dark")} aria-label="สลับโหมดสีของเว็บไซต์">
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
