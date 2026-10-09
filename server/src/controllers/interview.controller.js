import Interview from '../models/Interview.js';
import Response from '../models/Response.js';
import Resume from '../models/Resume.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { generateQuestions, evaluateInterview } from '../services/gemini.js';

export const generate = asyncHandler(async (req, res) => {
  const { role, difficulty, type } = req.body;
  let skills = req.body.skills;
  if (!Array.isArray(skills) || !skills.length) {
    const latest = await Resume.findOne({ userId: req.user._id }).sort({ uploadDate: -1 });
    skills = latest?.extractedSkills || [];
  }
  skills = skills.slice(0, 25);
  const questions = await generateQuestions({ role, skills, difficulty, type });
  const interview = await Interview.create({ userId: req.user._id, role, difficulty, type, skills, questions });
  res.status(201).json({ success: true, interview });
});

export const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found');
  const responses = interview.status === 'completed' ? await Response.find({ interviewId: interview._id }).sort('order') : [];
  res.json({ success: true, interview, responses });
});

export const submit = asyncHandler(async (req, res) => {
  const { interviewId, answers = [], durationSeconds } = req.body;
  const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
  if (!interview) throw new ApiError(404, 'Interview not found');
  if (interview.status === 'completed') throw new ApiError(409, 'This interview was already submitted');

  const items = interview.questions.map((q, i) => ({
    question: q.text,
    answer: String(answers[i] ?? '').trim().slice(0, 5000),
  }));
  if (!items.some((it) => it.answer)) throw new ApiError(400, 'Answer at least one question before submitting');

  const result = await evaluateInterview({ role: interview.role, difficulty: interview.difficulty, items });

  await Response.insertMany(
    interview.questions.map((q, i) => ({
      interviewId: interview._id,
      userId: req.user._id,
      order: i,
      question: q.text,
      category: q.category,
      skill: q.skill,
      answer: items[i].answer,
      aiFeedback: {
        feedback: result.evaluations[i].feedback,
        improvement: result.evaluations[i].improvement,
        idealAnswer: result.evaluations[i].idealAnswer,
      },
      score: result.evaluations[i].score,
    }))
  );

  const total = result.evaluations.reduce((s, e) => s + e.score, 0);
  interview.score = Math.round((total / interview.questions.length) * 10);
  interview.feedback = {
    summary: result.summary,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    suggestions: result.suggestions,
  };
  interview.status = 'completed';
  interview.completedAt = new Date();
  interview.durationSeconds = Number(durationSeconds) || undefined;
  await interview.save();

  res.json({ success: true, interviewId: interview._id, score: interview.score });
});

export const history = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const filter = { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const [interviews, total] = await Promise.all([
    Interview.find(filter).select('-questions').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Interview.countDocuments(filter),
  ]);
  res.json({ success: true, interviews, total, page, pages: Math.ceil(total / limit) });
});

export const removeInterview = asyncHandler(async (req, res) => {
  const found = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!found) throw new ApiError(404, 'Interview not found');
  await Response.deleteMany({ interviewId: found._id });
  res.json({ success: true });
});
