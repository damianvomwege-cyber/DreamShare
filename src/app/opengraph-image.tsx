import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";
import { defaultSeoDescription } from "@/lib/seo";

export const alt = "DreamShare social dream journal";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #06111f 0%, #071b2f 40%, #0f766e 100%)",
          color: "#f8fafc",
          padding: 64,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 86,
              height: 86,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              background: "#22d3ee",
              color: "#04111f",
              fontSize: 54,
              fontWeight: 900,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 54, fontWeight: 900 }}>{APP_NAME}</div>
            <div style={{ color: "#a7f3d0", fontSize: 24 }}>
              Social dream journal
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              maxWidth: 900,
              fontSize: 76,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            Share the dreams you wake up remembering.
          </div>
          <div
            style={{
              maxWidth: 880,
              color: "#dbeafe",
              fontSize: 28,
              lineHeight: 1.35,
            }}
          >
            {defaultSeoDescription()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#bae6fd",
            fontSize: 24,
          }}
        >
          <span>Post dreams</span>
          <span>React and comment</span>
          <span>Explore trending stories</span>
        </div>
      </div>
    ),
    size,
  );
}
