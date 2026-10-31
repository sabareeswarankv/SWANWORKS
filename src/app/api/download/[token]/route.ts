import { NextRequest, NextResponse } from "next/server";
import { verifyAndConsumeDownloadTokenAsync } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface DownloadRouteProps {
  params: Promise<{ token: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: DownloadRouteProps
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Download token is required." },
        { status: 400 }
      );
    }

    // Verify token and entitlement in database (async checks Neon cloud DB)
    const verification = await verifyAndConsumeDownloadTokenAsync(token);

    if (!verification.valid || !verification.product) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Download Link Error — SWANWORKS</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F9F8FF; color: #22212B; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
              .box { max-width: 480px; background: #FFF; border-radius: 20px; border: 1px solid #E9E5FF; padding: 36px; box-shadow: 0 10px 30px rgba(112, 96, 245, 0.08); text-align: center; }
              h1 { font-size: 20px; margin: 0 0 12px; color: #22212B; }
              p { font-size: 14px; color: #777486; line-height: 1.5; margin-bottom: 24px; }
              a { display: inline-block; background: #7060F5; color: #FFF; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="box">
              <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
              <h1>Unable to Process Download</h1>
              <p>${verification.reason || "Invalid or expired download link."}</p>
              <a href="/retrieve-order">Retrieve Fresh Link →</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const { product } = verification;
    const isCloudFile =
      product.vaultFile.startsWith("http://") ||
      product.vaultFile.startsWith("https://");

    // 1. Determine clean, user-friendly file name with proper extension (e.g. "The_Freelance_Client_Acquisition_Toolkit.pdf")
    let rawFileName = "";
    if (product.includedFiles && product.includedFiles.length > 0 && product.includedFiles[0]) {
      rawFileName = product.includedFiles[0].trim();
    }

    // If includedFiles is generic or missing, construct cleanly from product title
    if (!rawFileName || rawFileName.toLowerCase().includes("download file") || !path.extname(rawFileName)) {
      const sanitized = product.title
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .replace(/\s+/g, "_");
      rawFileName = `${sanitized || product.slug || "SWANWORKS_Resource"}.pdf`;
    }

    // Always ensure a valid extension exists (defaults to .pdf)
    let ext = path.extname(rawFileName).toLowerCase();
    if (!ext) {
      ext = ".pdf";
      rawFileName += ".pdf";
    }

    const cleanFileName = path.basename(rawFileName);

    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".zip": "application/zip",
      ".epub": "application/epub+zip",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".txt": "text/plain; charset=utf-8",
    };
    const contentType = mimeMap[ext] || "application/pdf";

    // A. Handle UploadThing Cloud File
    if (isCloudFile) {
      try {
        const cloudRes = await fetch(product.vaultFile);
        if (cloudRes.ok) {
          const cloudBuffer = Buffer.from(await cloudRes.arrayBuffer());
          return new NextResponse(cloudBuffer, {
            status: 200,
            headers: {
              "Content-Disposition": `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
              "Content-Type": contentType,
              "Content-Length": cloudBuffer.length.toString(),
              "Cache-Control": "private, no-cache, no-store, must-revalidate",
            },
          });
        }
      } catch (cloudFetchErr) {
        console.error("Cloud file stream failed, falling back to redirect:", cloudFetchErr);
        return NextResponse.redirect(product.vaultFile);
      }
    }

    // B. Handle Local Vault File
    const vaultFilePath = path.join(
      process.cwd(),
      "storage",
      "digital_vault",
      product.vaultFile
    );

    if (!fs.existsSync(vaultFilePath)) {
      console.error(`Vault file not found: ${vaultFilePath}`);
      return NextResponse.json(
        { error: "Resource file is currently being packaged. Please contact support." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(vaultFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`,
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("Download route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while downloading." },
      { status: 500 }
    );
  }
}
