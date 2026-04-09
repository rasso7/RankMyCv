"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ATSResult } from "../types";
import PdfViewer from "../components/PdfViewer";

/* ─────────────── tiny helpers ─────────────── */
function getScoreColor(s: number) {
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#3b82f6";
  if (s >= 40) return "#f59e0b";
  return "#ef4444";
}
function getScoreLabel(s: number): { label: string; color: string } {
  if (s >= 80) return { label: "Excellent", color: "#10b981" };
  if (s >= 65) return { label: "Good Start", color: "#3b82f6" };
  if (s >= 50) return { label: "Average", color: "#f59e0b" };
  return { label: "Needs Work", color: "#ef4444" };
}
function getBadgeClass(s: number) {
  if (s >= 65) return "badge-green";
  if (s >= 40) return "badge-amber";
  return "badge-red";
}

/* ─────────────── Animated arc ring (hero score) ─────────────── */
function ArcRing({ score, size = 110 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const color = getScoreColor(score);
  const r = (size - 18) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;

  useEffect(() => {
    let v = 0;
    const step = () => {
      v += 1.5;
      if (v <= score) { setDisplayed(Math.floor(v)); requestAnimationFrame(step); }
      else setDisplayed(score);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 150);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9ecef" strokeWidth="9" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{displayed}</span>
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>/100</span>
      </div>
    </div>
  );
}

/* ─────────────── Score row (Tone & Style, Content, etc.) ─────────────── */
function ScoreRow({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = getScoreColor(pct);
  const sl = getScoreLabel(pct);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>{label}</span>
        <span className={`db-badge ${getBadgeClass(pct)}`}>{sl.label}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color, whiteSpace: "nowrap" }}>{score}/{max}</span>
    </div>
  );
}

/* ─────────────── Expandable detail section ─────────────── */
function ExpandSection({
  icon, label, score, children,
}: { icon: string; label: string; score: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const color = getScoreColor(score);
  return (
    <div style={{ borderBottom: "1px solid #f1f5f9" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0", background: "none", border: "none", cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 500, color: "#111827" }}>
          {icon}&nbsp;{label}
          <span style={{ fontSize: 12, color, fontWeight: 700, background: color + "18", padding: "2px 8px", borderRadius: 99 }}>
            {score}/100
          </span>
        </span>
        <span style={{ fontSize: 18, color: "#9ca3af", transform: open ? "rotate(180deg)" : "none", transition: "transform .25s" }}>⌄</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 14, paddingLeft: 4, paddingRight: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Inline SVGs ─────────────── */
const IconFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconWarning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<ATSResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [sidebarWidth, setSidebarWidth] = useState(38); // % of viewport
  const dragging = useRef(false);

  /* ── load from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("RankMyCV_result");
      const pdfData = localStorage.getItem("RankMyCV_pdf");
      const name = localStorage.getItem("RankMyCV_pdf_name") || "resume.pdf";
      if (raw) setResult(JSON.parse(raw));
      if (pdfData) setPdfUrl(pdfData);
      setPdfFileName(name);
    } catch { /* ignore */ }
  }, []);

  /* ── drag-to-resize divider ── */
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const pct = (ev.clientX / window.innerWidth) * 100;
      setSidebarWidth(Math.min(Math.max(pct, 25), 65));
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!result) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 20 }}>
        <div style={{ fontSize: 48 }}>📄</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>No analysis found</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Upload a resume and run the analysis first.</p>
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          <IconBack /> Go to Home
        </button>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(result.atsScore);

  /* computed sub-scores from existing data (map to the image's categories) */
  const toneScore = result.keywordMatch;
  const contentScore = result.skillMatch;
  const structureScore = result.experienceMatch;
  const skillsScore = Math.round((result.keywordMatch + result.skillMatch) / 2 * 0.5);

  return (
    <>
      {/* ── global styles scoped to dashboard ── */}
      <style>{`
        .db-badge { display:inline-flex; align-items:center; padding:2px 9px; border-radius:99px; font-size:11px; font-weight:600; }
        .badge-green  { background:#dcfce7; color:#16a34a; }
        .badge-amber  { background:#fef3c7; color:#d97706; }
        .badge-red    { background:#fee2e2; color:#dc2626; }
        .db-scroll::-webkit-scrollbar { width:4px; }
        .db-scroll::-webkit-scrollbar-track { background:transparent; }
        .db-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
        .db-scroll::-webkit-scrollbar-thumb:hover { background:#2563eb; }
        .db-card { background:#fff; border:1px solid #f1f5f9; border-radius:14px; padding:20px 22px; box-shadow:0 1px 4px rgba(0,0,0,0.05); margin-bottom:16px; }
        .db-card:last-child { margin-bottom:0; }
        .chip-tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:500; margin:3px; }
        .chip-tag.green { background:#dcfce7; color:#16a34a; }
        .chip-tag.red   { background:#fee2e2; color:#dc2626; }
        .chip-tag.amber { background:#fef3c7; color:#d97706; }
        .chip-tag.blue  { background:#dbeafe; color:#2563eb; }
        @keyframes dbFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .db-fade { animation: dbFadeUp .5s cubic-bezier(.22,1,.36,1) both; }
        .divider-bar { width:5px; cursor:col-resize; background:transparent; flex-shrink:0; position:relative; z-index:10; transition:background .2s; }
        .divider-bar::after { content:''; position:absolute; top:0; bottom:0; left:50%; transform:translateX(-50%); width:1px; background:#e5e7eb; }
        .divider-bar:hover { background:#e0e7ff; }
        .divider-bar:hover::after { background:#2563eb; width:2px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f8fafc", fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Top navbar ── */}
        <nav style={{
          height: 56, background: "#fff", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16,
          flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", zIndex: 50,
        }}>
          <button
            onClick={() => router.push("/")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e5e7eb", borderRadius: 8, fontWeight: 500, fontSize: 13, color: "#374151", cursor: "pointer" }}
          >
            <IconBack /> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IconFile />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, background: "linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>RankMyCV</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>ATS Analyzer</span>
          </div>

          <div style={{ flex: 1 }} />

          {pdfFileName && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", padding: "5px 12px", borderRadius: 8 }}>
              📄 {pdfFileName}
            </span>
          )}

          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
            background: getScoreColor(result.atsScore) + "15",
            border: `1px solid ${getScoreColor(result.atsScore)}40`,
            borderRadius: 10, fontSize: 13, fontWeight: 700, color: getScoreColor(result.atsScore)
          }}>
            ATS Score: {result.atsScore}/100
          </div>
        </nav>

        {/* ── Main split layout ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ════ LEFT: PDF viewer (canvas, no browser chrome) ════ */}
          <div
            style={{
              width: `${sidebarWidth}%`, flexShrink: 0, overflow: "hidden",
              background: "#e8e8e8", display: "flex", flexDirection: "column",
            }}
          >
            {pdfUrl ? (
              <PdfViewer pdfDataUrl={pdfUrl} />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#9ca3af" }}>
                <span style={{ fontSize: 40 }}>📄</span>
                <p style={{ fontSize: 13, fontWeight: 500 }}>PDF preview not available</p>
              </div>
            )}
          </div>

          {/* ════ DIVIDER ════ */}
          <div className="divider-bar" onMouseDown={startDrag} />

          {/* ════ RIGHT: Analysis panel ════ */}
          <div
            className="db-scroll"
            style={{ flex: 1, overflow: "auto", padding: "20px 24px 40px" }}
          >

            {/* ── Resume Score card ── */}
            <div className="db-card db-fade" style={{ animationDelay: "0ms", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ArcRing score={result.atsScore} size={110} />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Your Resume Score</h2>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>This score is calculated based on the variables listed below.</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className={`db-badge ${getBadgeClass(result.atsScore)}`}>{scoreInfo.label}</span>
                    <span className="db-badge badge-blue" style={{ background: "#dbeafe", color: "#2563eb" }}>📊 {result.ranking}</span>
                    <span className="db-badge badge-green">🎯 {result.hiringProbability} Hire Probability</span>
                  </div>
                </div>
              </div>

              {/* Score rows */}
              <div style={{ marginTop: 16 }}>
                <ScoreRow label="Tone & Style" score={toneScore} />
                <ScoreRow label="Content" score={contentScore} />
                <ScoreRow label="Structure" score={structureScore} />
                <ScoreRow label="Skills" score={skillsScore} />
              </div>
            </div>

            {/* ── ATS Score card ── */}
            <div
              className="db-card db-fade"
              style={{
                animationDelay: "80ms",
                background: result.atsScore >= 50 ? "#fff" : "#fff8f8",
                border: `1px solid ${result.atsScore >= 50 ? "#f1f5f9" : "#fde8e8"}`,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{result.atsScore >= 50 ? "🟢" : "🔴"}</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                  ATS Score —{" "}
                  <span style={{ color: getScoreColor(result.atsScore) }}>{result.atsScore}/100</span>
                </h3>
              </div>

              <div style={{
                background: result.atsScore >= 50 ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${result.atsScore >= 50 ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 10, padding: "10px 14px", marginBottom: 12,
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: result.atsScore >= 50 ? "#16a34a" : "#dc2626", marginBottom: 4 }}>
                  {result.atsScore >= 80 ? "Excellent" : result.atsScore >= 65 ? "Good" : result.atsScore >= 50 ? "Average" : "Needs Improvement"}
                </p>
                <p style={{ fontSize: 12, color: "#6b7280" }}>
                  This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
                </p>
              </div>

              {/* Missing keywords as warning items */}
              {result.missingKeywords.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.missingKeywords.slice(0, 4).map((kw, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><IconWarning /></span>
                      <span>{kw}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.skillGaps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {result.skillGaps.slice(0, 3).map((sg, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><IconWarning /></span>
                      <span>{sg}</span>
                    </div>
                  ))}
                </div>
              )}

              {(result.missingKeywords.length > 0 || result.skillGaps.length > 0) && (
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 14, fontStyle: "italic" }}>
                  Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
                </p>
              )}
            </div>

            {/* ── Expandable detail sections ── */}
            <div className="db-card db-fade" style={{ animationDelay: "160ms", marginBottom: 16 }}>
              <ExpandSection icon="🎨" label="Tone & Style" score={toneScore}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 6 }}>
                  {result.matchedKeywords.slice(0, 6).map((kw, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: "#10b981" }}>✔</span> {kw}
                    </div>
                  ))}
                  {result.sectionFeedback.formatting && (
                    <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{result.sectionFeedback.formatting}</p>
                  )}
                </div>
              </ExpandSection>

              <ExpandSection icon="📝" label="Content" score={contentScore}>
                <div style={{ paddingTop: 6 }}>
                  {result.sectionFeedback.summary && (
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 8 }}>{result.sectionFeedback.summary}</p>
                  )}
                  {result.sectionFeedback.experience && (
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{result.sectionFeedback.experience}</p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
                    {result.matchedKeywords.slice(0, 10).map(kw => (
                      <span key={kw} className="chip-tag green">{kw}</span>
                    ))}
                    {result.missingKeywords.slice(0, 5).map(kw => (
                      <span key={kw} className="chip-tag red">{kw}</span>
                    ))}
                  </div>
                </div>
              </ExpandSection>

              <ExpandSection icon="📐" label="Structure" score={structureScore}>
                <div style={{ paddingTop: 6 }}>
                  {result.sectionFeedback.formatting && (
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{result.sectionFeedback.formatting}</p>
                  )}
                  {result.finalTips.slice(0, 3).map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: "#2563eb", flexShrink: 0 }}>▸</span> {tip}
                    </div>
                  ))}
                </div>
              </ExpandSection>

              <ExpandSection icon="⚡" label="Skills" score={skillsScore}>
                <div style={{ paddingTop: 6 }}>
                  {result.sectionFeedback.skills && (
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{result.sectionFeedback.skills}</p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {result.matchedKeywords.map(kw => <span key={kw} className="chip-tag green">{kw}</span>)}
                    {result.skillGaps.map(kw => <span key={kw} className="chip-tag amber">{kw}</span>)}
                    {result.missingKeywords.map(kw => <span key={kw} className="chip-tag red">{kw}</span>)}
                  </div>
                </div>
              </ExpandSection>
            </div>

            {/* ── Improvements ── */}
            {result.improvements.length > 0 && (
              <div className="db-card db-fade" style={{ animationDelay: "240ms", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 3, height: 18, borderRadius: 2, background: "linear-gradient(#f59e0b,#ef4444)", display: "inline-block" }} />
                  Actionable Improvements
                </h3>
                {result.improvements.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e5e7eb", marginBottom: 8 }}>
                    <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}.</span>
                    <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Rewritten Bullet Points ── */}
            {result.rewrittenPoints.length > 0 && (
              <div className="db-card db-fade" style={{ animationDelay: "300ms", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 3, height: 18, borderRadius: 2, background: "linear-gradient(#9333ea,#ec4899)", display: "inline-block" }} />
                  Rewritten Bullet Points
                </h3>
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>Using STAR method with strong action verbs and measurable impact</p>
                {result.rewrittenPoints.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 10, background: "#faf5ff", border: "1px solid #e9d5ff", marginBottom: 8 }}>
                    <span style={{ color: "#9333ea", flexShrink: 0 }}>✦</span>
                    <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65, fontStyle: "italic" }}>{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Projects & Certs ── */}
            {(result.suggestedProjects.length > 0 || result.suggestedCertifications.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {result.suggestedProjects.length > 0 && (
                  <div className="db-card db-fade" style={{ animationDelay: "360ms", marginBottom: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>🛠️ Suggested Projects</h3>
                    {result.suggestedProjects.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4b5563", marginBottom: 8 }}>
                        <span style={{ color: "#0891b2", flexShrink: 0 }}>▸</span> {item}
                      </div>
                    ))}
                  </div>
                )}
                {result.suggestedCertifications.length > 0 && (
                  <div className="db-card db-fade" style={{ animationDelay: "400ms", marginBottom: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>🏅 Recommended Certifications</h3>
                    {result.suggestedCertifications.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4b5563", marginBottom: 8 }}>
                        <span style={{ color: "#9333ea", flexShrink: 0 }}>▸</span> {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Final Checklist ── */}
            {result.finalTips.length > 0 && (
              <div className="db-card db-fade" style={{ animationDelay: "440ms", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 3, height: 18, borderRadius: 2, background: "linear-gradient(#10b981,#06b6d4)", display: "inline-block" }} />
                  Checklist to Reach 90+ ATS Score
                </h3>
                {result.finalTips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < result.finalTips.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: "1.5px solid #86efac", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Analyze again CTA ── */}
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <button
                onClick={() => router.push("/")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" /></svg>
                Analyze Another Resume
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
