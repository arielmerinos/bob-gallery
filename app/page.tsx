import { Suspense } from "react";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a" }} className="sticky top-0 z-40 backdrop-blur-sm" >
        <div style={{ background: "rgba(10,10,10,0.9)" }} className="px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span style={{ color: "#FF4A00", fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
              BoB
            </span>
            <span style={{ color: "#555", fontSize: 14 }}>|</span>
            <span style={{ color: "#888", fontSize: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Media Gallery
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2" style={{ color: "#444", fontSize: 12 }}>
            <span>Cloudflare R2</span>
            <span style={{ color: "#FF4A00" }}>●</span>
            <span>bob-media</span>
          </div>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ height: "80vh", color: "#444" }}>
          Loading media…
        </div>
      }>
        <Gallery />
      </Suspense>
    </div>
  );
}
