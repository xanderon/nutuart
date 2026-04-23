import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const subtitle =
    "Autocolante, geamuri sablate, lucrari pentru biserici si trofee personalizate pentru spatii comerciale si rezidentiale.";
  const cta = "Vezi portofoliul și proiectele realizate.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 18% 18%, rgba(244,197,108,0.28), transparent 34%), linear-gradient(135deg, #101827 0%, #06080f 55%, #030409 100%)",
          color: "#f3f4f8",
          padding: "58px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "28px",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: 22,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(243,244,248,0.7)",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "#ff7d64",
              }}
            />
            {siteConfig.previewLabel}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: 860 }}>
            <div style={{ fontSize: 72, lineHeight: 1.03, fontWeight: 700 }}>
              Lucrări decorative pe sticlă, realizate la comandă
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.45, color: "rgba(243,244,248,0.76)" }}>
              {subtitle}
            </div>
            <div style={{ fontSize: 24, lineHeight: 1.4, color: "#f6d28e" }}>{cta}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "rgba(243,244,248,0.72)",
            }}
          >
            <div>{siteConfig.location}</div>
            <div>{siteConfig.url.replace("https://", "")}</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
