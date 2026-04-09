"use client";

import { useEffect, useState } from "react";
import type { ATSResult } from "../types";

interface Props {
  result: ATSResult;
}

function ScoreRing({
  score,
  size = 120,
  color,
  label,
  delay = 0,
}: {
  score: number;
  size?: number;
  color: string;
  label: string;
  delay?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        if (start <= score) {
          setDisplayed(start);
          requestAnimationFrame(step);
        } else {
          setDisplayed(score);
        }
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const getColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#3b82f6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const ringColor = color === "auto" ? getColor(score) : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-ring -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color: ringColor }}>
            {displayed}
          </span>
          <span className="text-[10px] font-medium" style={{color:'#94a3b8'}}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-center" style={{color:'#64748b'}}>{label}</span>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="result-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div style={{width:32,height:32,borderRadius:8,background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}>{icon}</div>
        <h3 className="font-semibold" style={{color:'#0f172a'}}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Chip({ label, type }: { label: string; type: "green" | "red" | "blue" | "amber" }) {
  return <span className={`chip chip-${type}`}>{label}</span>;
}

function ListItem({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="animate-slide-left"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both", display:'flex', gap:12, padding:'12px 14px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0' }}
    >
      <span style={{color:'#2563eb',fontWeight:700,fontSize:14,flexShrink:0,marginTop:2}}>{index + 1}.</span>
      <p style={{fontSize:14,color:'#475569',lineHeight:1.65}}>{text}</p>
    </div>
  );
}

function StarItem({ text, index }: { text: string; index: number }) {
  return (
    <div
      className="animate-slide-right"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both", display:'flex', gap:12, padding:16, borderRadius:10, background:'#faf5ff', border:'1px solid #e9d5ff' }}
    >
      <span style={{color:'#9333ea',flexShrink:0,marginTop:2}}>✦</span>
      <p style={{fontSize:14,color:'#4b5563',lineHeight:1.65,fontStyle:'italic'}}>{text}</p>
    </div>
  );
}

export default function ResultsDashboard({ result }: Props) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#3b82f6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return { label: "Excellent", color: "text-emerald-400" };
    if (s >= 65) return { label: "Good", color: "text-blue-400" };
    if (s >= 50) return { label: "Average", color: "text-amber-400" };
    return { label: "Needs Work", color: "text-red-400" };
  };

  const scoreInfo = getScoreLabel(result.atsScore);

  const sectionFeedbackItems = [
    { key: "summary", label: "Summary", icon: "📝" },
    { key: "skills", label: "Skills", icon: "⚡" },
    { key: "experience", label: "Experience", icon: "💼" },
    { key: "projects", label: "Projects", icon: "🛠️" },
    { key: "education", label: "Education", icon: "🎓" },
    { key: "formatting", label: "Formatting", icon: "📐" },
  ] as const;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:32,paddingBottom:64}}>
      {/* Header Banner */}
      <div
        className="animate-fade-in-up"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, ${getScoreColor(result.atsScore)}18 0%, transparent 60%), #fff`,
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <ScoreRing score={result.atsScore} size={130} color="auto" label="ATS Score" delay={100} />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-extrabold" style={{color:'#0f172a'}}>
                  {result.atsScore}/100
                </h2>
                <span className={`text-base font-semibold ${scoreInfo.color}`}>
                  — {scoreInfo.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                <span className="chip chip-blue">📊 {result.ranking}</span>
                <span className="chip chip-green">🎯 {result.hiringProbability} Hire Probability</span>
              </div>
              <p className="text-sm max-w-md" style={{color:'#64748b'}}>
                Your resume scored <strong style={{color: getScoreColor(result.atsScore)}}>{result.atsScore} points</strong> out of 100 against this job description. Scroll down for detailed feedback and improvements.
              </p>
            </div>
          </div>

          {/* Sub-scores */}
          <div style={{display:'flex',gap:24,padding:'16px 20px',borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
            <ScoreRing score={result.keywordMatch} size={90} color={getScoreColor(result.keywordMatch)} label="Keywords" delay={200} />
            <ScoreRing score={result.skillMatch} size={90} color={getScoreColor(result.skillMatch)} label="Skills" delay={300} />
            <ScoreRing score={result.experienceMatch} size={90} color={getScoreColor(result.experienceMatch)} label="Experience" delay={400} />
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="animate-fade-in-up delay-200" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {[
          { label: "Keyword Match", value: result.keywordMatch, color: getScoreColor(result.keywordMatch) },
          { label: "Skill Match", value: result.skillMatch, color: getScoreColor(result.skillMatch) },
          { label: "Experience Match", value: result.experienceMatch, color: getScoreColor(result.experienceMatch) },
        ].map(({ label, value, color }) => (
          <div key={label} className="result-card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <span style={{fontSize:14,fontWeight:500,color:'#475569'}}>{label}</span>
              <span style={{fontSize:14,fontWeight:700,color}}>{value}%</span>
            </div>
            <ProgressBar value={value} color={color} />
          </div>
        ))}
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title={`Matched Keywords (${result.matchedKeywords.length})`}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          delay={0}
        >
          {result.matchedKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.map((kw) => (
                <Chip key={kw} label={kw} type="green" />
              ))}
            </div>
          ) : (
            <p style={{fontSize:14,color:'#94a3b8'}}>No matched keywords found.</p>
          )}
        </SectionCard>

        <SectionCard
          title={`Missing Keywords (${result.missingKeywords.length})`}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          delay={100}
        >
          {result.missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((kw) => (
                <Chip key={kw} label={kw} type="red" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-400">🎉 No critical keywords missing!</p>
          )}
        </SectionCard>
      </div>

      {/* Skill Gaps */}
      {result.skillGaps.length > 0 && (
        <SectionCard
          title={`Skill Gaps (${result.skillGaps.length})`}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          delay={100}
        >
          <div className="flex flex-wrap gap-2">
            {result.skillGaps.map((gap) => (
              <Chip key={gap} label={gap} type="amber" />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Section Feedback */}
      <div>
        <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:4,height:24,borderRadius:2,background:'linear-gradient(#2563eb,#7c3aed)',display:'inline-block'}} />
          Section-by-Section Feedback
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sectionFeedbackItems.map(({ key, label, icon }, i) => {
            const feedback = result.sectionFeedback[key];
            if (!feedback) return null;
            return (
              <div
                key={key}
                className="result-card animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span>{icon}</span>
                  <span style={{fontSize:14,fontWeight:600,color:'#0f172a'}}>{label}</span>
                </div>
                <p style={{fontSize:14,color:'#475569',lineHeight:1.65}}>{feedback}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvements */}
      {result.improvements.length > 0 && (
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <span style={{width:4,height:24,borderRadius:2,background:'linear-gradient(#f59e0b,#ef4444)',display:'inline-block'}} />
            Actionable Improvements
            <span style={{fontSize:14,fontWeight:400,color:'#94a3b8'}}>(to increase score by +20 points)</span>
          </h2>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {result.improvements.map((item, i) => (
              <ListItem key={i} text={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Bullet Points */}
      {result.rewrittenPoints.length > 0 && (
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:4,height:24,borderRadius:2,background:'linear-gradient(#9333ea,#ec4899)',display:'inline-block'}} />
            Rewritten Bullet Points
          </h2>
          <p style={{fontSize:14,color:'#94a3b8',marginBottom:16}}>Using STAR method with strong action verbs and measurable impact</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {result.rewrittenPoints.map((item, i) => (
              <StarItem key={i} text={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Projects & Certifications */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:24}}>
        {result.suggestedProjects.length > 0 && (
          <SectionCard
            title="Suggested High-Impact Projects"
            icon={<span>🛠️</span>}
            delay={0}
          >
            <ul style={{display:'flex',flexDirection:'column',gap:10}}>
              {result.suggestedProjects.map((item, i) => (
                <li key={i} style={{display:'flex',gap:10,fontSize:14,color:'#475569'}}>
                  <span style={{color:'#0891b2',flexShrink:0,marginTop:2}}>▸</span>
                  <span style={{lineHeight:1.6}}>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {result.suggestedCertifications.length > 0 && (
          <SectionCard
            title="Recommended Certifications"
            icon={<span>🏅</span>}
            delay={100}
          >
            <ul style={{display:'flex',flexDirection:'column',gap:10}}>
              {result.suggestedCertifications.map((item, i) => (
                <li key={i} style={{display:'flex',gap:10,fontSize:14,color:'#475569'}}>
                  <span style={{color:'#9333ea',flexShrink:0,marginTop:2}}>▸</span>
                  <span style={{lineHeight:1.6}}>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* Final Tips Checklist */}
      {result.finalTips.length > 0 && (
        <div>
          <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:4,height:24,borderRadius:2,background:'linear-gradient(#10b981,#06b6d4)',display:'inline-block'}} />
            Checklist to Reach 90+ ATS Score
          </h2>
          <div className="result-card">
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {result.finalTips.map((tip, i) => (
                <div
                  key={i}
                  className="animate-slide-left"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both", display:'flex', gap:12, alignItems:'flex-start', padding:12, borderRadius:8, transition:'background 0.2s' }}
                >
                  <div style={{width:20,height:20,borderRadius:4,border:'1.5px solid #86efac',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p style={{fontSize:14,color:'#475569',lineHeight:1.65}}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Re-analyze CTA */}
      <div style={{textAlign:'center',paddingTop:16}}>
        <button
          id="re-analyze-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn-blue"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Analyze Another Resume
        </button>
      </div>
    </div>
  );
}
