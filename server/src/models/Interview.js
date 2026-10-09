import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    type: { type: String, enum: ['Technical', 'HR', 'Behavioral', 'Mixed'], required: true },
    skills: [String],
    questions: [{ text: String, category: String, skill: String }],
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
    },
    durationSeconds: Number,
    completedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

interviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Interview', interviewSchema);
