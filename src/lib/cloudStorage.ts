import { UTApi } from "uploadthing/server";
import fs from "fs";
import path from "path";
import os from "os";

interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  isCloud: boolean;
  error?: string;
}

/**
 * Resolves a valid UploadThing token from environment variables.
 */
function getUploadThingToken(): string | null {
  if (process.env.UPLOADTHING_TOKEN) {
    return process.env.UPLOADTHING_TOKEN;
  }

  // Synthesize token from secret & appId if individual keys are provided
  const apiKey = process.env.UPLOADTHING_SECRET;
  const appId = process.env.UPLOADTHING_APP_ID;

  if (apiKey && appId) {
    try {
      return Buffer.from(
        JSON.stringify({ apiKey, appId, regions: ["sea1"] })
      ).toString("base64");
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Uploads a file (PDF, image, ZIP, etc.) to UploadThing cloud storage,
 * with an automatic fallback to local disk storage if offline or unconfigured.
 */
export async function saveFile(
  file: File,
  type: "thumbnail" | "vault_file"
): Promise<UploadResult> {
  const token = getUploadThingToken();
  const safeBaseName = path
    .basename(file.name)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePrefix = Date.now();
  const finalFilename = `${uniquePrefix}_${safeBaseName}`;

  // 1. Try UploadThing Cloud Storage (Permanent, CDN-backed, Vercel-compatible)
  if (token) {
    try {
      const utapi = new UTApi({ token });
      const uploadResponses = await utapi.uploadFiles([file]);
      const uploadRes = Array.isArray(uploadResponses)
        ? uploadResponses[0]
        : uploadResponses;

      if (uploadRes?.data) {
        const cloudUrl =
          uploadRes.data.ufsUrl ||
          uploadRes.data.url ||
          `https://utfs.io/f/${uploadRes.data.key}`;

        return {
          success: true,
          url: cloudUrl,
          filename: cloudUrl,
          isCloud: true,
        };
      } else if (uploadRes?.error) {
        console.warn("UploadThing API returned error:", uploadRes.error);
      }
    } catch (cloudErr) {
      console.warn("UploadThing cloud upload failed, falling back:", cloudErr);
    }
  }

  // 2. Local Vault / Disk Fallback (Handles local dev and Vercel serverless /tmp)
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (type === "thumbnail") {
      let targetDir = path.join(process.cwd(), "public", "uploads", "covers");
      let urlPath = `/uploads/covers/${finalFilename}`;

      // If running in a read-only serverless environment (Vercel), write to /tmp
      try {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
      } catch {
        targetDir = path.join(os.tmpdir(), "swanworks_uploads");
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        urlPath = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;
      }

      const filePath = path.join(targetDir, finalFilename);
      fs.writeFileSync(filePath, buffer);

      return {
        success: true,
        url: urlPath,
        filename: finalFilename,
        isCloud: false,
      };
    } else {
      let targetDir = path.join(process.cwd(), "storage", "digital_vault");
      try {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
      } catch {
        targetDir = path.join(os.tmpdir(), "swanworks_vault");
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
      }

      const filePath = path.join(targetDir, finalFilename);
      fs.writeFileSync(filePath, buffer);

      return {
        success: true,
        url: `/api/download/local_${finalFilename}`,
        filename: finalFilename,
        isCloud: false,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Disk write failed";
    console.error("Local storage fallback also failed:", msg);
    return {
      success: false,
      url: "",
      filename: "",
      isCloud: false,
      error: `Storage error: ${msg}`,
    };
  }
}
