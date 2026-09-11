import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// เก็บเป็น component ไม่ใช่ element — MUI clone element ที่ส่งเข้า prop icon
// ถ้าใช้ element เดิมซ้ำระดับโมดูล ลำดับ DOM ฝั่ง server/client จะไม่ตรงกันจน hydration พัง
const FEATURES = [
  { Icon: PeopleAltOutlinedIcon, label: "ข้อมูลบุคคลไทย/อังกฤษ 30+ ฟิลด์" },
  { Icon: CreditCardOutlinedIcon, label: "เลขบัตรเครดิตทดสอบทุกค่าย (Luhn valid)" },
  { Icon: FolderZipOutlinedIcon, label: "ไฟล์ทดสอบทุกชนิด ทุกขนาด" },
];

export function MarketingHero() {
  return (
    <Box
      component="section"
      sx={{
        // ไล่สีจาง ๆ ด้านหลังหัวเรื่องให้ต่างจากพื้นหลังเนื้อหาเล็กน้อย
        background:
          "radial-gradient(ellipse at 50% -20%, color-mix(in srgb, var(--mui-palette-primary-main) 13%, transparent), transparent 60%)",
        pt: { xs: 6, md: 10 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
          <Chip label="ฟรี 100% • ไม่ต้องสมัครสมาชิก" color="primary" variant="outlined" size="small" />

          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: "1.9rem", sm: "2.5rem", md: "3rem" } }}>
            {SITE_NAME} — {SITE_TAGLINE}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            เว็บแอปสำหรับสุ่มสร้างข้อมูลทดสอบ (mock data / test data generator) ครบวงจร ทั้งชื่อ-นามสกุลไทย,
            เลขบัตรประชาชน, เลขบัตรเครดิตทดสอบ, ที่อยู่, อีเมล และไฟล์ทดสอบขนาดต่างๆ (TXT, CSV, JSON, รูปภาพ, PDF)
            พร้อม export เป็น JSON/CSV ได้ทันที — เหมาะสำหรับนักพัฒนา, QA และทีมทดสอบระบบที่ต้องการ temp data
            จำนวนมากอย่างรวดเร็วและปลอดภัย โดยไม่ใช้ข้อมูลบุคคลจริง
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "center" }}>
            {FEATURES.map((f) => (
              <Chip
                key={f.label}
                variant="outlined"
                // ไม่ใช้ prop icon เพราะ MUI v9 render ไอคอนฝั่ง server แต่ไม่ render ฝั่ง client
                // ทำให้ hydration ไม่ตรงกัน — ใส่ไอคอนไว้ใน label แทนได้ผลเหมือนกันและเสถียร
                label={
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <f.Icon sx={{ fontSize: 16, color: "primary.main" }} />
                    <span>{f.label}</span>
                  </Stack>
                }
              />
            ))}
          </Stack>

          <Button
            href="#app"
            variant="contained"
            size="large"
            endIcon={<ArrowDownwardIcon />}
            sx={{ borderRadius: 999, px: 4 }}
          >
            เริ่มสร้างข้อมูลทดสอบ
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
