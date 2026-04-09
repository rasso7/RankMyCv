import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Act as a real-world ATS (Applicant Tracking System) combined with a senior recruiter from a top tech company.

You must analyze the resume with strict, realistic hiring standards.

ANALYSIS FRAMEWORK:
1. Perform keyword extraction from the Job Description.
2. Perform exact keyword matching + semantic matching with the Resume.
3. Evaluate:
   - Technical skills match
   - Tools & technologies relevance
   - Experience relevance (role, years, domain)
   - Impact of work (quantified achievements)
4. Penalize:
   - Missing important keywords
   - Generic statements
   - Lack of metrics (numbers, % improvement)
   - Poor formatting (ATS-unfriendly)

SCORING:
If Job Description is provided, calculate:
- Keyword Match % (0–100)
- Skill Match % (0–100)
- Experience Match % (0–100)
Then compute:
- Overall ATS Score (0–100)
Also determine:
- Resume Ranking (Top 10%, Top 25%, Top 50%, etc.)
- Hiring Probability (in %)

OUTPUT (STRICT JSON ONLY — NO EXTRA TEXT, NO MARKDOWN CODE BLOCKS):
{
  "atsScore": number,
  "keywordMatch": number,
  "skillMatch": number,
  "experienceMatch": number,
  "ranking": "Top X%",
  "hiringProbability": "X%",
  "matchedKeywords": [],
  "missingKeywords": [],
  "skillGaps": [],
  "sectionFeedback": {
    "summary": "",
    "skills": "",
    "experience": "",
    "projects": "",
    "education": "",
    "formatting": ""
  },
  "improvements": [],
  "rewrittenPoints": [],
  "suggestedProjects": [],
  "suggestedCertifications": [],
  "finalTips": []
}

IMPORTANT RULES:
- Be brutally honest and precise (no generic advice)
- Prefer measurable, data-driven feedback
- Keep suggestions practical and implementable
- Do NOT return anything outside JSON
- Do NOT wrap JSON in markdown code blocks`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, apiKey } = await req.json();

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const geminiKey = apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "A Gemini API key is required. Please provide one in the settings." },
        { status: 400 }
      );
    }

    const userMessage = `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message =
        (errData as { error?: { message?: string } })?.error?.message ||
        `Gemini API error: ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again.", raw: cleaned },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
