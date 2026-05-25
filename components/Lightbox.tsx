"use client";

import { useEffect, useCallback, useState } from "react";
import type { MediaFile } from "@/lib/r2";

interface Props {
  items: MediaFile[];
  startIndex: number;
  onClose: () => void;
  onCopy: (url: string) => void;
  copied: string | null;
}

export default function Lightbox({ items, startIndex, onClose, onCopy, copied }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const file = items[idx];

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(items.length - 1, i + 1)), [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = file.publicUrl;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  if (!file) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 16, right: 16, zIndex: 10001,
          background: "rgba(0,0,0,0.6)", border: "1px solid #333",
          borderRadius: 6, color: "#fff", padding: "6px 12px",
          fontSize: 14, cursor: "pointer",
        }}
      >✕ Close</button>

      {/* Prev */}
      {idx > 0 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{
            position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 10001, background: "rgba(0,0,0,0.7)", border: "1px solid #333",
            borderRadius: 6, color: "#fff", padding: "12px 16px",
            fontSize: 20, cursor: "pointer",
          }}
        >‹</button>
      )}

      {/* Next */}
      {idx < items.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{
            position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
            zIndex: 10001, background: "rgba(0,0,0,0.7)", border: "1px solid #333",
            borderRadius: 6, color: "#fff", padding: "12px 16px",
            fontSize: 20, cursor: "pointer",
          }}
        >›</button>
      )}

      {/* Image / Video */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "90vw", maxHeight: "80vh",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}
      >
        {file.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.publicUrl}
            alt={file.name}
            style={{ maxWidth: "90vw", maxHeight: "72vh", objectFit: "contain", borderRadius: 4 }}
          />
        ) : file.type === "video" ? (
          <video
            src={file.publicUrl}
            controls
            autoPlay
            style={{ maxWidth: "90vw", maxHeight: "72vh", borderRadius: 4 }}
          />
        ) : (
          <div style={{
            width: 400, height: 300, background: "#111",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 12, borderRadius: 8,
          }}>
            <span style={{ fontSize: 48 }}>📄</span>
            <span style={{ color: "#888", fontSize: 14 }}>{file.name}</span>
            <span style={{ color: "#555", fontSize: 12 }}>{file.sizeMb} MB</span>
          </div>
        )}

        {/* Info + actions bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>{file.name}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>
              {file.category} · {file.sizeMb} MB · {idx + 1} of {items.length}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onCopy(file.publicUrl)}
              style={{
                padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: copied === file.publicUrl ? "#22c55e" : "#FF4A00",
                color: "#fff", border: "none", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              {copied === file.publicUrl ? "✓ Copied!" : "Copy URL"}
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: "transparent", border: "1px solid #444",
                color: "#ccc", cursor: "pointer",
              }}
            >
              ↓ Download
            </button>
            <a
              href={file.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: "transparent", border: "1px solid #333",
                color: "#888", cursor: "pointer", textDecoration: "none",
                display: "inline-block",
              }}
            >
              ↗ Open
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
