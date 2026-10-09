import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeUrl: { type: String, required: true },
  publicId: String,
  fileName: String,
  extractedSkills: [String],
  summary: String,
  uploadDate: { type: Date, default: Date.now },
});

export default mongoose.model('Resume', resumeSchema);
