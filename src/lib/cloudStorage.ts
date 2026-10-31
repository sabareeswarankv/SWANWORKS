import fs from "fs";
import path from "path";

interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  isCloud: boolean;
  error?: string;
}

/**
 * Uploads a file (PDF, image, ZIP, etc.) to UploadThing cloud storage,
 * with an automatic fallback to local disk storage if offline or unconfigured.
 */
export async function saveFile(
  file: File,
  type: "thumbnail" | "vault_file"
): Promise<UploadResult> {
  const token = process.env.UPLOADTHING_TOKEN;
  const apiKey = process.env.UPLOADTHING_SECRET || "";

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeBaseName = path
    .basename(file.name)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePrefix = Date.now();
  const finalFilename = `${uniquePrefix}_${safeBaseName}`;

  // 1. Try UploadThing Cloud Storage if credentials exist
  if (apiKey) {
    try {
      // Step A: Request presigned upload URL from UploadThing API (with 6s timeout)
      const requestRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
        method: "POST",
        signal: AbortSignal.timeout(6000),
        headers: {
          "Content-Type": "application/json",
          "x-uploadthing-api-key": apiKey,
          "x-uploadthing-be-adapter": "custom",
        },
        body: JSON.stringify({
          files: [
            {
              name: safeBaseName,
              size: file.size,
              type: file.type || "application/octet-stream",
            },
          ],
          acl: "public-read",
        }),
      });

      if (requestRes.ok) {
        const json = await requestRes.json();
        const uploadData = json.data?.[0];

        if (uploadData?.presignedUrl) {
          // Step B: Post the file to the presigned S3 storage URL
          const uploadFormData = new FormData();
          if (uploadData.fields) {
            Object.entries(uploadData.fields).forEach(([k, v]) => {
              uploadFormData.append(k, String(v));
            });
          }
          uploadFormData.append("file", file);

          const s3Res = await fetch(uploadData.presignedUrl, {
            method: "POST",
            signal: AbortSignal.timeout(10000),
            body: uploadFormData,
          });

          // Some endpoints use PUT or return 200/204
          if (s3Res.ok || s3Res.status === 204) {
            const cloudUrl =
              uploadData.fileUrl ||
              uploadData.url ||
              `https://utfs.io/f/${uploadData.key}`;

            return {
              success: true,
              url: cloudUrl,
              filename: cloudUrl,
              isCloud: true,
            };
          }
        }
      }
    } catch (cloudErr) {
      console.warn("UploadThing cloud upload failed, using local vault:", cloudErr);
    }
  }

  // 2. Reliable Local Vault Fallback
  if (type === "thumbnail") {
    const coversDir = path.join(process.cwd(), "public", "uploads", "covers");
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true });
    }
    const filePath = path.join(coversDir, finalFilename);
    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      url: `/uploads/covers/${finalFilename}`,
      filename: finalFilename,
      isCloud: false,
    };
  } else {
    const vaultDir = path.join(process.cwd(), "storage", "digital_vault");
    if (!fs.existsSync(vaultDir)) {
      fs.mkdirSync(vaultDir, { recursive: true });
    }
    const filePath = path.join(vaultDir, finalFilename);
    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      url: `/api/download/local_${finalFilename}`,
      filename: finalFilename,
      isCloud: false,
    };
  }
}
