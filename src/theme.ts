import { createTheme } from "@mui/material/styles";

/** สีหลักของแบรนด์ KidHai — ม่วงอมน้ำเงิน คู่กับเขียวมิ้นต์ */
const BRAND = {
  primaryLight: "#5b4bdb",
  primaryDark: "#a396ff",
  secondaryLight: "#12897a",
  secondaryDark: "#3ddcbd",
} as const;

export const theme = createTheme({
  // เปิด CSS variables เพื่อให้สลับโหมดสว่าง/มืดได้โดยไม่กระพริบตอนโหลด
  // (ทำงานคู่กับ <InitColorSchemeScript /> ใน layout)
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND.primaryLight },
        secondary: { main: BRAND.secondaryLight },
        background: { default: "#f6f7fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: BRAND.primaryDark },
        secondary: { main: BRAND.secondaryDark },
        background: { default: "#0e1016", paper: "#161923" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-google-sans), system-ui, -apple-system, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    // เงาเริ่มต้นของ MUI หนักเกินไปสำหรับหน้าเครื่องมือที่มีการ์ดเยอะ
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      defaultProps: { elevation: 0, variant: "outlined" },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 56 } },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});
