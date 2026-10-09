import { ApiError } from '../utils/ApiError.js';

const endpoint = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}:generateContent`;

const parseJson = (text) => {
  const clean = String(text || '').replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(clean);
};

async function callGemini(prompt, { temperature = 0.6, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) {
        if (res.status === 429) throw new ApiError(429, 'AI service is busy. Try again in a moment');
        throw new Error(`Gemini ${res.status}`);
      }
      const data = await res.json();
      return parseJson(data?.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (err) {
      if (err instanceof ApiError || attempt === retries) {
        throw err instanceof ApiError ? err : new ApiError(502, 'The AI service could not complete this request. Please try again');
      }
    }
  }
}

const clampScore = (n) => Math.max(0, Math.min(10, Math.round(Number(n) * 10) / 10 || 0));
const strList = (arr, max = 6) => (Array.isArray(arr) ? arr.map(String).filter(Boolean).slice(0, max) : []);

export async function extractSkills(resumeText) {
  const data = await callGemini(
    `You are a technical recruiter. Read the resume text and return JSON only:
{"skills": string[], "summary": string}
- "skills": up to 25 distinct, normalised technical and professional skills (e.g. "React", "System Design", "Leadership").
- "summary": one sentence (max 30 words) describing the candidate's profile.

RESUME:
"""${resumeText.slice(0, 12000)}"""`,
    { temperature: 0.2 }
  );
  const skills = [...new Set(strList(data.skills, 25).map((s) => s.trim()))];
  return { skills, summary: String(data.summary || '').slice(0, 300) };
}

export async function generateQuestions({ role, skills, difficulty, type }) {
  const mix =
    type === 'Mixed'
      ? 'a balanced mix of Technical, HR and Behavioral questions'
      : `${type} questions only`;
  const data = await callGemini(
    `You are a senior interviewer. Create exactly 10 ${difficulty}-level interview questions for a "${role}" candidate.
Candidate skills: ${skills.length ? skills.join(', ') : 'not provided'}.
Interview type: ${mix}.
Return JSON only: {"questions":[{"text": string, "category": "Technical"|"HR"|"Behavioral", "skill": string}]}
Rules: each question is specific and answerable in 2-4 minutes; "skill" is the main skill or topic it tests (1-3 words); no duplicates; order from easier to harder.`,
    { temperature: 0.8 }
  );
  const questions = (data.questions || [])
    .filter((q) => q?.text)
    .slice(0, 10)
    .map((q) => ({
      text: String(q.text).trim(),
      category: ['Technical', 'HR', 'Behavioral'].includes(q.category) ? q.category : type === 'Mixed' ? 'Technical' : type,
      skill: String(q.skill || 'General').slice(0, 40),
    }));
  if (questions.length < 5) throw new ApiError(502, 'The AI returned too few questions. Please try again');
  return questions;
}

export async function evaluateInterview({ role, difficulty, items }) {
  const payload = items.map((it, i) => ({ index: i, question: it.question, answer: it.answer || '(no answer)' }));
  const data = await callGemini(
    `You are a strict but encouraging interview coach evaluating a ${difficulty} interview for a "${role}" position.
Score each answer from 0 to 10 (0 = no answer or irrelevant, 5 = acceptable, 8+ = strong with specifics, examples and depth).
Return JSON only:
{
 "evaluations":[{"index": number, "score": number, "feedback": string, "improvement": string, "idealAnswer": string}],
 "summary": string,
 "strengths": string[],
 "weaknesses": string[],
 "suggestions": string[]
}
- feedback: 1-2 sentences on what was good or missing. improvement: one concrete action. idealAnswer: 2-3 sentence model answer.
- summary: 2-3 sentences overall. strengths / weaknesses / suggestions: 3-5 short items each, specific to this candidate.

INTERVIEW:
${JSON.stringify(payload)}`,
    { temperature: 0.3 }
  );
  const byIndex = new Map((data.evaluations || []).map((e) => [Number(e.index), e]));
  const evaluations = items.map((it, i) => {
    const e = byIndex.get(i) || {};
    return {
      score: it.answer?.trim() ? clampScore(e.score) : 0,
      feedback: String(e.feedback || (it.answer?.trim() ? 'No feedback generated.' : 'No answer was provided.')),
      improvement: String(e.improvement || ''),
      idealAnswer: String(e.idealAnswer || ''),
    };
  });
  return {
    evaluations,
    summary: String(data.summary || ''),
    strengths: strList(data.strengths),
    weaknesses: strList(data.weaknesses),
    suggestions: strList(data.suggestions),
  };
}
