import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  order: Number,
  question: { type: String, required: true },
  category: String,
  skill: String,
  answer: { type: String, default: '' },
  aiFeedback: {
    feedback: String,
    improvement: String,
    idealAnswer: String,
  },
  score: { type: Number, min: 0, max: 10, default: 0 },
});

export default mongoose.model('Response', responseSchema);
