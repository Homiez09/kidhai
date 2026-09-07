import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS, SITE_NAME } from "@/lib/site";

const FAQ_ITEMS = [
  {
    q: `${SITE_NAME} คืออะไร ใช้ทำอะไรได้บ้าง`,
    a: `${SITE_NAME} เป็นเว็บแอป mock data generator ฟรี สำหรับสร้างข้อมูลทดสอบ (test data) จำนวนมากอย่างรวดเร็ว เช่น ชื่อ-นามสกุลไทย/อังกฤษ, เลขบัตรประชาชน, ที่อยู่, อีเมล, เลขบัตรเครดิตทดสอบ และไฟล์ตัวอย่างขนาดต่างๆ (TXT, CSV, JSON, รูปภาพ, PDF) เหมาะสำหรับนักพัฒนาและทีม QA ที่ต้องการข้อมูลตัวอย่างไปทดสอบฟอร์ม, ฐานข้อมูล หรือระบบอัปโหลดไฟล์`,
  },
  {
    q: "ข้อมูลบัตรประชาชนและบัตรเครดิตที่สร้างขึ้นเป็นข้อมูลจริงหรือไม่",
    a: "ไม่ใช่ข้อมูลจริงทั้งหมด ระบบสุ่มตัวเลขขึ้นใหม่โดยใช้สูตรคำนวณ checksum ที่ถูกต้องตามหลักวิชาการ (เช่น Luhn algorithm สำหรับบัตรเครดิต) เพื่อให้ผ่านการตรวจสอบรูปแบบในระบบทดสอบเท่านั้น ไม่สามารถนำไปใช้ทำธุรกรรมทางการเงินหรือแอบอ้างเป็นบุคคลจริงได้",
  },
  {
    q: "ไฟล์ทดสอบที่สร้างมีขนาดตรงตามที่กำหนดหรือไม่",
    a: "ไฟล์ประเภทข้อความ (TXT), CSV, JSON และ Binary จะมีขนาดตรงตามที่กำหนดแบบเป๊ะๆ ทุกไบต์ ส่วนไฟล์รูปภาพจะเติม padding ให้ได้ขนาดตามต้องการโดยยังเปิดดูได้ปกติ และไฟล์ PDF จะเป็นขนาดโดยประมาณ",
  },
  {
    q: "สามารถ export หรือคัดลอกข้อมูลออกไปใช้ต่อได้อย่างไร",
    a: "สามารถคัดลอกข้อมูลเป็น JSON ได้ทันทีด้วยปุ่มคัดลอก หรือดาวน์โหลดเป็นไฟล์ JSON/CSV และยังสร้างข้อมูลหรือไฟล์หลายรายการพร้อมกันได้ในคลิกเดียว",
  },
  {
    q: `ใช้งาน ${SITE_NAME} ฟรีหรือไม่`,
    a: "ใช้งานได้ฟรี 100% ไม่ต้องสมัครสมาชิกหรือติดตั้งโปรแกรมเพิ่มเติม เว็บไซต์มีพื้นที่โฆษณาบางส่วนเพื่อสนับสนุนค่าใช้จ่ายในการดูแลระบบ",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function MarketingFaq() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Stack spacing={1} sx={{ textAlign: "center" }}>
            <Typography variant="h4" component="h2">
              คำถามที่พบบ่อย
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ทุกสิ่งที่ควรรู้ก่อนใช้งาน {SITE_NAME}
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            {FAQ_ITEMS.map((item, i) => (
              <Accordion
                key={item.q}
                sx={{
                  "&::before": { display: "none" },
                  borderTop: i === 0 ? "none" : "1px solid",
                  borderColor: "divider",
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>

          <AdSlot slotId={AD_SLOTS.inContent} format="horizontal" minHeight={90} />
        </Stack>
      </Container>
    </Box>
  );
}
