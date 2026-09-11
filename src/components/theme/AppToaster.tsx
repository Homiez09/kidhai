"use client";

import { useColorScheme } from "@mui/material/styles";
import { Toaster } from "sonner";

/**
 * ห่อ sonner Toaster ให้ธีมของ toast ตามโหมดสีที่ resolve จริงของ MUI เสมอ
 * ไม่ใช้ theme="system" ตรงๆ เพราะดีฟอลต์ของเว็บนี้ตั้งเป็น dark ไว้ล่วงหน้า (ไม่ได้ตาม OS)
 * ถ้าใช้ system เฉยๆ toast อาจขึ้นผิดธีมตอนหน้าเว็บเป็น dark แต่ OS ของผู้ใช้เป็น light
 */
export function AppToaster() {
  const { mode, systemMode } = useColorScheme();
  const resolved = mode === "system" ? systemMode : mode;

  return <Toaster richColors position="bottom-right" theme={resolved ?? "dark"} />;
}
