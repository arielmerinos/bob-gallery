"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MediaCard from "./MediaCard";
import Lightbox from "./Lightbox";
import type { MediaFile } from "@/lib/r2";

interface ApiResponse {
  items: MediaFile[];
  total: number;
  page: number;
  pages: number;
  categories: Record<string, number>;
}

const ALL = "__ALL__";

export default function Gallery() {
  const [data, setData]           = useState<ApiResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState(ALL);
  const [type, setType]           = useState(ALL);
  const [q, setQ]                 = useState("");
  const [page, setPage]           = useState(1);
  const [lightbox, setLightbox]   = useState<{ items: MediaFile[]; index: number } | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const searchRef                 = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== ALL) params.set("category", category);
    if (type !== ALL)     params.set("type", type);
    if (q)                params.set("q", q);
    params.set("page", String(page));
    params.set("perPage", "60");

    const res = await fetch(`/api/files?${params}`);
    const json: ApiResponse = await res.json();
    setData(json);
    setLoading(false);
  }, [category, type, q, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, type, q]);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const openLightbox = (items: MediaFile[], index: number) => {
    setLightbox({ items, index });
  };

  const categories = data ? Object.entries(data.categories).sort((a, b) => b[1] - a[1]) : [];
  const totalImages = categories.filter(([k]) => {
    // Only image categories
    return !["Broadcast Videos", "Social Videos", "Sponsorship"].includes(k);
  }).reduce((s, [,v]) => s + v, 0);

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 53px)" }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240, minWidth: 240, background: "#0f0f0f",
        borderRight: "1px solid #1a1a1a", padding: "20px 0",
        position: "sticky", top: 53, height: "calc(100vh - 53px)",
        overflowY: "auto",
      }}>
        {/* Search */}
        <div style={{ padding: "0 16px 16px" }}>
          <input
            ref={searchRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search files…"
            style={{
              width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: 6, padding: "7px 10px", color: "#fff", fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Type filter */}
        <div style={{ padding: "0 16px 8px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Type
          </div>
          {[
            { id: ALL,     label: "All" },
            { id: "image", label: "Images" },
            { id: "video", label: "Videos" },
            { id: "pdf",   label: "Documents" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "5px 8px", borderRadius: 4, fontSize: 13,
                background: type === t.id ? "rgba(255,74,0,0.15)" : "transparent",
                color: type === t.id ? "#FF4A00" : "#888",
                border: "none", cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Category
          </div>
          <button
            onClick={() => setCategory(ALL)}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              width: "100%", textAlign: "left", padding: "5px 8px", borderRadius: 4,
              fontSize: 13, background: category === ALL ? "rgba(255,74,0,0.15)" : "transparent",
              color: category === ALL ? "#FF4A00" : "#888", border: "none", cursor: "pointer",
            }}
          >
            <span>All</span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>{data?.total ?? "…"}</span>
          </button>
          {categories.map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                width: "100%", textAlign: "left", padding: "5px 8px", borderRadius: 4,
                fontSize: 13,
                background: category === cat ? "rgba(255,74,0,0.15)" : "transparent",
                color: category === cat ? "#FF4A00" : "#888", border: "none", cursor: "pointer",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{cat}</span>
              <span style={{ fontSize: 11, opacity: 0.6, flexShrink: 0 }}>{count}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: 20, overflow: "hidden" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-5" style={{ flexWrap: "wrap" }}>
          <div style={{ color: "#555", fontSize: 13 }}>
            {loading ? "Loading…" : `${data?.total.toLocaleString()} files`}
            {category !== ALL && <span style={{ color: "#FF4A00" }}> · {category}</span>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4,
                    color: page === 1 ? "#333" : "#888", padding: "4px 10px", fontSize: 13,
                    cursor: page === 1 ? "default" : "pointer",
                  }}
                >←</button>
                <span style={{ color: "#555", fontSize: 13, padding: "0 8px" }}>
                  {page} / {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4,
                    color: page === data.pages ? "#333" : "#888", padding: "4px 10px", fontSize: 13,
                    cursor: page === data.pages ? "default" : "pointer",
                  }}
                >→</button>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="masonry">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="masonry-item"
                style={{
                  background: "#141414", borderRadius: 8,
                  height: [160, 200, 140, 240, 180][i % 5],
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="masonry">
            {data.items.map((file, idx) => (
              <div key={file.key} className="masonry-item">
                <MediaCard
                  file={file}
                  onOpen={() => openLightbox(data.items, idx)}
                  onCopy={() => copyUrl(file.publicUrl)}
                  copied={copied === file.publicUrl}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#444", textAlign: "center", paddingTop: 80, fontSize: 15 }}>
            No files found
          </div>
        )}

        {/* Bottom pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: page === 1 ? "#333" : "#888", padding: "6px 16px", fontSize: 13, cursor: page === 1 ? "default" : "pointer" }}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }}
                  style={{
                    background: page === p ? "#FF4A00" : "#1a1a1a",
                    border: `1px solid ${page === p ? "#FF4A00" : "#2a2a2a"}`,
                    borderRadius: 4, color: page === p ? "#fff" : "#888",
                    padding: "6px 12px", fontSize: 13, cursor: "pointer",
                  }}
                >{p}</button>
              );
            })}
            {data.pages > 7 && <span style={{ color: "#444" }}>…{data.pages}</span>}
            <button disabled={page === data.pages} onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4, color: page === data.pages ? "#333" : "#888", padding: "6px 16px", fontSize: 13, cursor: page === data.pages ? "default" : "pointer" }}>
              Next →
            </button>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onCopy={copyUrl}
          copied={copied}
        />
      )}
    </div>
  );
}
