import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/adminAuth";
import { saveFile } from "@/lib/cloudStorage";

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type")?.toString() || "vault_file") as
      | "thumbnail"
      | "vault_file";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await saveFile(file, uploadType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to upload file." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filename: result.filename,
      fileName: result.filename,
      url: result.url,
      originalName: file.name,
      size: file.size,
      isCloud: result.isCloud,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
