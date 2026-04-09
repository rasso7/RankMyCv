import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 10 MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });

    const trimmed = text?.trim();
    if (!trimmed || trimmed.length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Please ensure it is not a scanned image." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: trimmed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
