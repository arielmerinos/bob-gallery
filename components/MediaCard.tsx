"use client";

import { useState } from "react";
import type { MediaFile } from "@/lib/r2";

interface Props {
  file: MediaFile;
  onOpen: () => void;
  onCopy: () => void;
  copied: boolean;
}

const TYPE_ICON: Record<string, string> = {
  video: "▶",
  pdf:   "📄",
  image: "",
};

export default function MediaCard({ file, onOpen, onCopy, copied }: Props) {
  const [hover, setHover] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = file.publicUrl;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        background: "#141414",
        cursor: "pointer",
        border: `1px solid ${hover ? "#333" : "#1a1a1a"}`,
        transition: "border-color 0.15s",
      }}
    >
      {/* Media preview */}
      {file.type === "image" && !imgErr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.publicUrl}
          alt={file.name}
          loading="lazy"
          onError={() => setImgErr(true)}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
      ) : file.type === "video" ? (
        <div style={{
          background: "#0d0d0d", height: 140,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 32, color: "#FF4A00" }}>▶</span>
          <span style={{ color: "#555", fontSize: 11 }}>VIDEO</span>
        </div>
      ) : file.type === "pdf" ? (
        <div style={{
          background: "#0d0d0d", height: 140,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8,
        }}>
          <span style={{ fontSize: 32 }}>📄</span>
          <span style={{ color: "#555", fontSize: 11 }}>PDF</span>
        </div>
      ) : (
        <div style={{ background: "#0d0d0d", height: 100,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#333", fontSize: 11 }}>No preview</span>
        </div>
      )}

      {/* Hover overlay */}
      {hover && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: 10, gap: 6,
        }}>
          {/* Filename */}
          <div style={{
            fontSize: 11, color: "#ccc",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {file.name}
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>
            {file.sizeMb} MB · {file.category}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <button
              onClick={e => { e.stopPropagation(); onCopy(); }}
              style={{
                flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 11,
                fontWeight: 600, cursor: "pointer", border: "none",
                background: copied ? "#22c55e" : "#FF4A00",
                color: "#fff", transition: "background 0.2s",
              }}
            >
              {copied ? "✓ Copied" : "Copy URL"}
            </button>
            <button
              onClick={handleDownload}
              style={{
                flex: 1, padding: "5px 0", borderRadius: 4, fontSize: 11,
                fontWeight: 600, cursor: "pointer",
                background: "transparent", border: "1px solid #444",
                color: "#ccc",
              }}
            >
              ↓ Download
            </button>
          </div>
        </div>
      )}

      {/* Type badge */}
      {file.type !== "image" && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.7)", borderRadius: 4,
          padding: "2px 6px", fontSize: 10, color: "#FF4A00",
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          {file.type}
        </div>
      )}
    </div>
  );
}
