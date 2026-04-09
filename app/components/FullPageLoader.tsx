"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Parsing your resume",
  "Analyzing your experience",
  "Extracting your skills",
  "Generating recommendations",
];

export default function FullPageLoader() {
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setDoneSteps((prev) => [...prev, i]);
          setActiveStep(i + 1);
        }, 900 + i * 1100)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fpl-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .fpl-shimmer {
          background: linear-gradient(90deg, #e8edf5 25%, #f4f6fb 50%, #e8edf5 75%);
          background-size: 1200px 100%;
          animation: fpl-shimmer 1.4s infinite linear;
          border-radius: 999px;
        }
        @keyframes fpl-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fpl-fadein {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
        .fpl-card {
          animation: fpl-fadein 0.5s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#f0f2fa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* ── Navbar ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            padding: "0 32px",
            gap: 10,
            zIndex: 1,
          }}
        >
          <img src="/logo.png" alt="RankMyCV" style={{ height: 40, objectFit: "contain" }} />
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            RankMyCV
          </span>
        </div>

        {/* ── Cards ── */}
        <div
          className="fpl-card"
          style={{
            display: "flex",
            gap: 20,
            alignItems: "stretch",
            width: "100%",
            maxWidth: 900,
            padding: "0 28px",
          }}
        >
          {/* ══ Left: Score card (exact match to screenshot) ══ */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "36px 32px 32px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.09)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 280,
              flex: "0 0 280px",
            }}
          >
            {/* Title */}
            <p style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: "0 0 28px", textAlign: "center" }}>
              Your Score
            </p>

            {/* ── Half-circle gauge ── */}
            <div style={{ position: "relative", width: 180, height: 100, marginBottom: 4 }}>
              {/* Gray half-ring */}
              <svg
                width="180"
                height="100"
                viewBox="0 0 180 100"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                {/* Background arc (bottom half of circle, clipped to top) */}
                <path
                  d="M 10 90 A 80 80 0 0 1 170 90"
                  fill="none"
                  stroke="#e5e8f0"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Shimmer-ish short filled arc (left portion, hint of progress) */}
                <path
                  d="M 10 90 A 80 80 0 0 1 60 24"
                  fill="none"
                  stroke="#d1d5e8"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>

              {/* Horizontal baseline */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "10%",
                  right: "10%",
                  height: 1.5,
                  background: "#d1d5db",
                }}
              />

              {/* Center dot on baseline */}
              <div
                style={{
                  position: "absolute",
                  bottom: -5,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "#374151",
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1.5px #374151",
                }}
              />
            </div>

            {/* Two shimmer bars below gauge (score number + label) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, margin: "20px 0 0" }}>
              <div className="fpl-shimmer" style={{ height: 20, width: 100 }} />
              <div className="fpl-shimmer" style={{ height: 14, width: 140 }} />
            </div>

            {/* Divider */}
            <div style={{ width: "100%", height: 1, background: "#f0f2f8", margin: "24px 0 20px" }} />

            {/* Four category rows */}
            {["CONTENT", "SECTION", "ATS ESSENTIALS", "TAILORING"].map((label) => (
              <div
                key={label}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    letterSpacing: "0.09em",
                  }}
                >
                  {label}
                </span>
                <div className="fpl-shimmer" style={{ height: 14, width: 72 }} />
              </div>
            ))}
          </div>

          {/* ══ Right: Steps card ══ */}
          <div
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)",
              borderRadius: 20,
              padding: "44px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0,
              boxShadow: "0 4px 32px rgba(99,102,241,0.10)",
            }}
          >
            {STEPS.map((step, i) => {
              const done = doneSteps.includes(i);
              const active = activeStep === i && !done;
              return (
                <div key={step}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 0",
                      opacity: i > activeStep ? 0.35 : 1,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {done ? <CheckIcon /> : active ? <SpinnerIcon /> : <PendingIcon />}
                    </div>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: done ? 600 : 500,
                        color: done ? "#312e81" : active ? "#4338ca" : "#6b7280",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ height: 1, background: "rgba(99,102,241,0.15)", marginLeft: 44 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Icon helpers ── */
function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="1.5" />
      <polyline points="9,15 13,19 21,10" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      style={{ animation: "fpl-spin 0.8s linear infinite" }}
    >
      <circle cx="15" cy="15" r="12" stroke="#c7d2fe" strokeWidth="2.5" />
      <path d="M27 15A12 12 0 0 0 15 3" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="14" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}
