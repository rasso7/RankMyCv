"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  pdfDataUrl: string;
}

export default function PdfViewer({ pdfDataUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageImages, setPageImages] = useState<string[]>([]);

  // Revoke old blob URLs to avoid memory leaks
  const prevUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!pdfDataUrl) return;

    let cancelled = false;

    async function renderPdf() {
      setLoading(true);
      setError(null);
      setPageImages([]);

      // Revoke previous blob URLs
      prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      prevUrlsRef.current = [];

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // Convert data URL → Uint8Array
        const base64 = pdfDataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        const totalPages = pdf.numPages;
        const dpr = window.devicePixelRatio || 2; // use at least 2× for sharpness
        const renderScale = Math.max(dpr, 2); // render at 2-3× then show at CSS size

        const blobUrls: string[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);

          // Base viewport at scale=1 to get natural dimensions
          const baseViewport = page.getViewport({ scale: 1 });

          // We want to fill the container width — calculate CSS scale first
          const containerWidth =
            containerRef.current?.clientWidth || 600;
          const cssScale = (containerWidth - 24) / baseViewport.width;

          // Render at cssScale × renderScale for high-DPI sharpness
          const renderViewport = page.getViewport({ scale: cssScale * renderScale });

          // Offscreen canvas at full render resolution
          const canvas = document.createElement("canvas");
          canvas.width = renderViewport.width;
          canvas.height = renderViewport.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

          // Convert canvas → PNG Blob → object URL
          const blobUrl = await new Promise<string>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(URL.createObjectURL(blob));
              else reject(new Error("toBlob failed"));
            }, "image/png");
          });

          if (!cancelled) {
            blobUrls.push(blobUrl);
            // Stream pages in as they render
            setPageImages((prev) => [...prev, blobUrl]);
          } else {
            URL.revokeObjectURL(blobUrl);
          }
        }

        if (!cancelled) {
          prevUrlsRef.current = blobUrls;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("PDF render error:", err);
          setError("Failed to render PDF.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    renderPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfDataUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        background: "#e8e8e8",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 12,
            color: "#6b7280",
          }}
        >
          <svg
            className="spin-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p style={{ fontSize: 13 }}>Loading resume…</p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .spin-icon { animation: spin 0.8s linear infinite; }
          `}</style>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            gap: 8,
            color: "#6b7280",
          }}
        >
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={{ fontSize: 13 }}>{error}</p>
        </div>
      )}

      {/* Blob image pages — crisp PNG snapshots of each PDF page */}
      <div ref={containerRef}>
        {pageImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Resume page ${i + 1}`}
            style={{
              display: "block",
              width: "100%",
              borderRadius: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
              marginBottom: i < pageImages.length - 1 ? 16 : 0,
              background: "#fff",
            }}
          />
        ))}
      </div>
    </div>
  );
}
