import { spawn } from "node:child_process";
import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "assets");

const imageExt = new Set([".png", ".jpg", ".jpeg"]);
let savedBytes = 0;

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
};

const maxWidthFor = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");

  if (normalized.includes("/members/")) return 420;
  if (normalized.includes("/clips/") && /poster|homepage/i.test(normalized)) return 1280;
  if (/logo/i.test(normalized)) return 720;
  if (/homepage|poster/i.test(normalized)) return 1920;
  return 1600;
};

const optimizeImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!imageExt.has(ext)) return;

  const webpPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
  const before = (await stat(filePath)).size;

  const pipeline = sharp(filePath).rotate().resize({
    width: maxWidthFor(filePath),
    withoutEnlargement: true,
  });

  await pipeline.webp({ quality: 82, effort: 4 }).toFile(webpPath);

  const after = (await stat(webpPath)).size;
  savedBytes += Math.max(0, before - after);
  console.log(`webp  ${path.relative(root, webpPath)} (${formatMb(before)} -> ${formatMb(after)})`);
};

const hasFfmpeg = async () => {
  try {
    await access("ffmpeg");
    return true;
  } catch {
    return new Promise((resolve) => {
      const probe = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
      probe.on("error", () => resolve(false));
      probe.on("close", (code) => resolve(code === 0));
    });
  }
};

const optimizeVideo = (filePath) =>
  new Promise((resolve) => {
    const tempPath = `${filePath}.optimized.mp4`;
    const args = [
      "-y",
      "-i",
      filePath,
      "-c:v",
      "libx264",
      "-crf",
      "28",
      "-preset",
      "medium",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      tempPath,
    ];

    const ffmpeg = spawn("ffmpeg", args, { stdio: "inherit" });
    ffmpeg.on("error", () => {
      console.warn("ffmpeg not available, skipped video compression.");
      resolve();
    });
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        console.warn(`ffmpeg failed for ${filePath}`);
        resolve();
        return;
      }
      import("node:fs/promises")
        .then((fs) => fs.rename(tempPath, filePath))
        .then(() => {
          console.log(`video ${path.relative(root, filePath)}`);
          resolve();
        })
        .catch(resolve);
    });
  });

const formatMb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const main = async () => {
  try {
    await access(assetsDir);
  } catch {
    console.error("assets/ folder not found.");
    process.exit(1);
  }

  const files = await walk(assetsDir);
  const images = files.filter((file) => imageExt.has(path.extname(file).toLowerCase()));
  const videos = files.filter((file) => path.extname(file).toLowerCase() === ".mp4");

  console.log(`Optimizing ${images.length} images...`);
  for (const file of images) {
    await optimizeImage(file);
  }

  if (videos.length && (await hasFfmpeg())) {
    console.log(`Optimizing ${videos.length} videos...`);
    for (const file of videos) {
      await optimizeVideo(file);
    }
  } else if (videos.length) {
    console.log("Install ffmpeg to compress .mp4 files automatically.");
  }

  console.log(`Done. Estimated image savings: ~${formatMb(savedBytes)} (original PNG/JPG kept as fallback).`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
