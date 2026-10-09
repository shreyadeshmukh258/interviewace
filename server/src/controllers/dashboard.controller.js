import Interview from '../models/Interview.js';
import Response from '../models/Response.js';
import Resume from '../models/Resume.js';
import { asyncHandler } from '../utils/ApiError.js';

const round = (n) => Math.round((n || 0) * 10) / 10;

export const stats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const done = { userId, status: 'completed' };

  const [completed, skillAgg, typeAgg, diffAgg, recent, latestResume] = await Promise.all([
    Interview.find(done).select('role score type difficulty createdAt completedAt').sort({ createdAt: 1 }),
    Response.aggregate([
      { $match: { userId } },
      { $group: { _id: '$skill', avg: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Interview.aggregate([{ $match: done }, { $group: { _id: '$type', count: { $sum: 1 }, avg: { $avg: '$score' } } }]),
    Interview.aggregate([{ $match: done }, { $group: { _id: '$difficulty', count: { $sum: 1 }, avg: { $avg: '$score' } } }]),
    Interview.find({ userId }).select('-questions').sort({ createdAt: -1 }).limit(5),
    Resume.findOne({ userId }).sort({ uploadDate: -1 }).select('extractedSkills uploadDate'),
  ]);

  const scores = completed.map((i) => i.score);
  const avgScore = scores.length ? round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const half = Math.floor(scores.length / 2);
  const improvement =
    scores.length >= 2
      ? round(
          scores.slice(half).reduce((a, b) => a + b, 0) / (scores.length - half) -
            scores.slice(0, half).reduce((a, b) => a + b, 0) / half
        )
      : 0;

  res.json({
    success: true,
    totals: {
      interviews: completed.length,
      avgScore,
      bestScore: scores.length ? Math.max(...scores) : 0,
      improvement,
      skillsTracked: latestResume?.extractedSkills?.length || 0,
    },
    scoreTrend: completed.slice(-20).map((i) => ({
      id: i._id,
      date: i.completedAt || i.createdAt,
      score: i.score,
      role: i.role,
    })),
    skillPerformance: skillAgg.map((s) => ({ skill: s._id || 'General', score: round(s.avg * 10), count: s.count })),
    byType: typeAgg.map((t) => ({ name: t._id, count: t.count, avg: round(t.avg) })),
    byDifficulty: diffAgg.map((d) => ({ name: d._id, count: d.count, avg: round(d.avg) })),
    recent,
  });
});
