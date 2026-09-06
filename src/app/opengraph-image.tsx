import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d5bff 0%, #22c3a6 50%, #ff8fd6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            marginBottom: 36,
            fontSize: 72,
          }}
        >
          ✨
        </div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 800, color: "white", letterSpacing: -2 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.92)", marginTop: 16 }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
