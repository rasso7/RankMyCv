"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ResultsDashboard from "./components/ResultsDashboard";
import type { ATSResult } from "./types";

/* ─── small inline SVGs ─── */
const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconCheck = ({ color = "#10b981" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconSpin = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(d => setHasServerKey(d.hasServerKey))
      .catch(() => { });
  }, []);

  const handlePdfFile = useCallback(async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setError(null);
    setPdfLoading(true);
    setPdfFileName(file.name);
    try {
      // Store PDF as data URL for the dashboard preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        try { localStorage.setItem("RankMyCV_pdf", dataUrl); } catch { /* quota */ }
        localStorage.setItem("RankMyCV_pdf_name", file.name);
      };
      reader.readAsDataURL(file);

      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to read PDF.");
        setPdfFileName(null);
      } else {
        setResumeText(data.text);
        setShowJdModal(true);
      }
    } catch {
      setError("Network error reading PDF. Please try again.");
      setPdfFileName(null);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
  };

  const clearResume = () => {
    setResumeText("");
    setPdfFileName(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setShowJdModal(false);
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        // Save result to localStorage and navigate to dashboard
        try { localStorage.setItem("RankMyCV_result", JSON.stringify(data)); } catch { /* quota */ }
        setResult(data);
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const needsApiKey = !hasServerKey && !apiKey;
  const jdValid = jobDescription.trim().length > 30;



  return (
    <div style={{ background: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ height: 64 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo — no ATS Analyzer badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="RankMyCV Logo" style={{ height: 40, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RankMyCV</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* "Get Started" button — always visible, triggers file upload */}
            <button
              className="btn-blue"
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 14, padding: "10px 22px" }}
            >
              Get Started
            </button>

            {/* API Key toggle — only shown when no server key */}
            {!hasServerKey && (
              <button
                id="api-key-toggle"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "transparent", color: "#475569", cursor: "pointer" }}
              >
                🔑 API Key
              </button>
            )}
          </div>
        </div>

        {!hasServerKey && showApiKey && (
          <div className="animate-fade-in" style={{ borderTop: "1px solid #e2e8f0", padding: "14px 32px", background: "#f8fafc" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>Gemini API Key</span>
              <input
                id="gemini-api-key"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="input-field"
                style={{ maxWidth: 320, padding: "9px 14px" }}
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#2563eb", textDecoration: "underline", whiteSpace: "nowrap" }}>
                Get free key →
              </a>
              {apiKey && <span style={{ fontSize: 12, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}><IconCheck color="#16a34a" />Saved</span>}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          padding: 0 0 0 32px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-left {
          /* default desktop */
        }
        .hero-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          /* push image so it bleeds to right viewport edge */
          margin-right: calc(-1 * (50vw - 600px));
        }
        .hero-right img {
          width: 120%;
          max-width: 760px;
          border-radius: 16px 0 0 16px;
          display: block;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 0 20px;
            text-align: center;
          }
          .hero-left {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-left h1 {
            font-size: 32px !important;
          }
          .hero-left p {
            max-width: 100% !important;
            text-align: center;
          }
          .hero-right {
            margin-right: -20px;
            justify-content: center;
          }
          .hero-right img {
            width: 100%;
            max-width: 100%;
            border-radius: 16px 0 0 16px;
          }
          .trust-row {
            justify-content: center !important;
          }
        }
      `}</style>

      <section className="hero-section animate-fade-in-up" style={{ overflow: "hidden" }}>
        <div className="hero-grid">

          {/* Left column */}
          <div className="hero-left">
            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", color: "#0f172a", marginBottom: 20 }}>
              Get Expert Feedback on<br />
              your <span style={{ color: "#2563eb" }}>Resume</span>, instantly.
            </h1>

            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Our free AI resume checker scores your resume and gives quick tips to improve it and land more interviews.
            </p>

            {/* ── Blue dotted square border wrapper ── */}
            <div style={{
              border: "2px dotted #2563eb",
              borderRadius: 12,
              padding: 6,
              background: "#eff6ff22",
              width: "100%",
            }}>
              <div
                id="upload-zone"
                className={`upload-box${dragOver ? " drag-over" : ""}${pdfFileName ? " uploaded" : ""}`}
                onClick={() => !pdfLoading && !pdfFileName && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ padding: "32px 24px", textAlign: "center", cursor: pdfFileName ? "default" : "pointer" }}
              >
                <input ref={fileInputRef} id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileInputChange} style={{ display: "none" }} />

                {pdfLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <IconSpin />
                    <p style={{ fontSize: 14, color: "#64748b" }}>Extracting resume text…</p>
                  </div>
                ) : pdfFileName ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconCheck color="#16a34a" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#16a34a" }}>{pdfFileName}</p>
                      <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Resume uploaded successfully</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button
                        className="btn-blue"
                        onClick={e => { e.stopPropagation(); setShowJdModal(true); }}
                        style={{ fontSize: 13, padding: "10px 20px" }}
                      >
                        Analyze with Job Description
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); clearResume(); }}
                        style={{ fontSize: 12, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <IconUpload />
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "#334155" }}>
                        Drop your resume here or <span style={{ color: "#2563eb" }}>choose a file.</span>
                      </p>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>PDF only. Max 10MB file size.</p>
                    </div>
                    <button className="btn-blue" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ fontSize: 14, padding: "12px 28px" }}>
                      Drop your Resume
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="error-box animate-fade-in" style={{ marginTop: 12 }}>⚠ {error}</p>}

            {/* Trust row */}
            <div className="trust-row" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <p style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>
                Trusted by over <span style={{ color: "#2563eb", fontWeight: 700 }}>one million</span> job seekers globally.
              </p>
              <div className="avatar-stack">
                {[1, 2, 3, 4, 5].map((num) => (
                  <img key={num} src={`/user${num}.png`} alt={`Trusted user ${num}`} className="avatar" style={{ objectFit: "cover", background: "#fff" }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ color: "#fbbf24", fontSize: 18, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>+100 Reviews</span>
            </div>
          </div>

          {/* ── Right column: bleeds to right viewport edge ── */}
          <div className="hero-right animate-fade-in-up delay-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/showcase.png"
              alt="RankMyCV dashboard showcase"
            />
          </div>

        </div>
      </section>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 16 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="shimmer" style={{ height: 120 }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="shimmer" style={{ height: 180 }} />)}
          </div>
          <div className="shimmer" style={{ height: 220 }} />
        </div>
      )}

      {/* ── Results ── */}
      {result && !loading && (
        <div ref={resultsRef} style={{ maxWidth: 1100, margin: "40px auto", padding: "0 32px 60px" }}>
          <ResultsDashboard result={result} />
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "28px 32px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>RankMyCV · AI-powered resume analysis</p>
      </footer>

      {/* ── Job Description Modal ── */}
      {showJdModal && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setShowJdModal(false)}>
          <div className="modal-box animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "32px 32px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>
                    Paste the Job Description
                  </h2>
                  <p style={{ fontSize: 14, color: "#64748b" }}>
                    We&apos;ll compare your resume against the role&apos;s requirements for an accurate ATS score.
                  </p>
                </div>
                <button
                  onClick={() => setShowJdModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 22, lineHeight: 1, padding: 4, marginLeft: 16, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>

              <textarea
                id="jd-input"
                className="input-field"
                style={{ minHeight: 240, fontSize: 14 }}
                placeholder={`Senior Software Engineer — Acme Corp\n\nAbout the role:\nWe are looking for a Senior Software Engineer…\n\nRequirements:\n• 3+ years of experience with Python or Node.js\n• Proficiency in React or similar frontend frameworks\n• Experience with AWS, Docker, and Kubernetes…`}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                autoFocus
              />

              {needsApiKey && (
                <p style={{ fontSize: 12, color: "#d97706", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  ⚠ You need a Gemini API key. Add it via the &quot;API Key&quot; button in the nav.
                </p>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  className="btn-blue"
                  style={{ flex: 1 }}
                  disabled={!jdValid || needsApiKey}
                  onClick={handleAnalyze}
                >
                  {loading ? <><IconSpin /> Analyzing…</> : "Analyze My Resume →"}
                </button>
                <button
                  className="btn-outline"
                  onClick={() => setShowJdModal(false)}
                >
                  Cancel
                </button>
              </div>

              {!jdValid && jobDescription.length > 0 && (
                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
                  Please paste at least 30 characters from the job description.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}