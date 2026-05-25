import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const PUBLIC_URL = process.env.R2_PUBLIC_URL!;
export const BUCKET = process.env.R2_BUCKET!;

export type MediaType = "image" | "video" | "pdf" | "other";

export interface MediaFile {
  key: string;
  name: string;
  folder: string;
  category: string;
  type: MediaType;
  sizeMb: number;
  publicUrl: string;
  lastModified: string;
}

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".avi", ".webm"]);
const DOC_EXTS   = new Set([".pdf"]);

// Camera thumbnail paths to exclude
const THUMBNAIL_PATHS = ["XDROOT/Thmbnl/", "M4ROOT/THMBNL/"];

// Raw video folders to exclude from video list (too large)
const RAW_VIDEO_DIRS = ["Raw Videos/Match Ftg/Card", "Raw Videos/Match Ftg/Sean", "Raw Videos/Match Ftg/card", "Raw Videos/Stephen", "Raw Videos/Robert"];

function getExt(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function getMediaType(name: string): MediaType {
  const ext = getExt(name);
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (DOC_EXTS.has(ext)) return "pdf";
  return "other";
}

function getCategory(key: string): string {
  if (key.startsWith("batch30/")) return "Matchday Photos";
  if (key.startsWith("resized/")) return "Web-Ready";
  if (key.startsWith("instagram/")) return "Instagram";
  if (key.startsWith("sponsorship/")) return "Sponsorship";
  if (key.includes("Sam Matchday/Trophy") || key.includes("Photos/Trophy")) return "Trophy";
  if (key.includes("Sam Matchday/Pregame")) return "Pregame";
  if (key.includes("Sam Matchday/MISC")) return "Matchday Misc";
  if (key.includes("Sam Matchday/First Quarter")) return "Matchday Q1";
  if (key.includes("Sam Matchday/2nd Half")) return "Matchday 2H";
  if (key.includes("Reception and Dinner")) return "Reception & Dinner";
  if (key.includes("Training Photos/RAWS")) return "Training (RAW)";
  if (key.includes("Training Photos")) return "Training";
  if (key.includes("Photoshoot BTS")) return "Photoshoot BTS";
  if (key.includes("Edited Content/Broadcast")) return "Broadcast Videos";
  if (key.includes("Edited Content/Social")) return "Social Videos";
  return "Other";
}

function shouldInclude(key: string, type: MediaType): boolean {
  const name = key.split("/").pop() ?? "";
  // Skip macOS hidden files
  if (name.startsWith(".")) return false;
  // Skip camera thumbnails
  if (THUMBNAIL_PATHS.some(p => key.includes(p))) return false;
  // Skip raw video files (keep only edited content)
  if (type === "video" && RAW_VIDEO_DIRS.some(d => key.includes(d))) return false;
  return type !== "other";
}

let cache: MediaFile[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function listAllMedia(): Promise<MediaFile[]> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const files: MediaFile[] = [];
  let continuationToken: string | undefined;

  do {
    const cmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    });
    const res = await r2.send(cmd);

    for (const obj of res.Contents ?? []) {
      if (!obj.Key || !obj.Size) continue;
      const name = obj.Key.split("/").pop() ?? "";
      const type = getMediaType(name);
      if (!shouldInclude(obj.Key, type)) continue;

      const parts = obj.Key.split("/");
      const folder = parts.slice(0, -1).join("/") || "/";

      files.push({
        key: obj.Key,
        name,
        folder,
        category: getCategory(obj.Key),
        type,
        sizeMb: Math.round((obj.Size / 1024 / 1024) * 100) / 100,
        publicUrl: `${PUBLIC_URL}/${encodeURIComponent(obj.Key).replace(/%2F/g, "/")}`,
        lastModified: obj.LastModified?.toISOString() ?? "",
      });
    }

    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  // Sort: images first, then videos, then PDFs; within each by category then name
  files.sort((a, b) => {
    const typeOrder: Record<MediaType, number> = { image: 0, video: 1, pdf: 2, other: 3 };
    const td = typeOrder[a.type] - typeOrder[b.type];
    if (td !== 0) return td;
    const cd = a.category.localeCompare(b.category);
    if (cd !== 0) return cd;
    return a.name.localeCompare(b.name);
  });

  cache = files;
  cacheTime = Date.now();
  return files;
}
