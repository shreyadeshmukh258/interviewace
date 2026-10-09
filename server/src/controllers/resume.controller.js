import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import Resume from '../models/Resume.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { uploadBuffer, destroyAsset } from '../config/cloudinary.js';
import { extractSkills } from '../services/gemini.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Attach a PDF resume in the "resume" field');

  let text = '';
  try {
    text = (await pdfParse(req.file.buffer)).text.replace(/\s+/g, ' ').trim();
  } catch {
    throw new ApiError(422, 'We could not read this PDF. Try exporting it again');
  }
  if (text.length < 100) throw new ApiError(422, 'No readable text found. Scanned PDFs are not supported yet');

  const [{ skills, summary }, upload] = await Promise.all([
    extractSkills(text),
    uploadBuffer(req.file.buffer, {
      folder: 'interviewace/resumes',
      resource_type: 'image', // PDFs are served inline via the image pipeline
      format: 'pdf',
    }),
  ]);

  const resume = await Resume.create({
    userId: req.user._id,
    resumeUrl: upload.secure_url,
    publicId: upload.public_id,
    fileName: req.file.originalname,
    extractedSkills: skills,
    summary,
  });
  res.status(201).json({ success: true, resume });
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ uploadDate: -1 }).limit(20);
  res.json({ success: true, resumes });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new ApiError(404, 'Resume not found');
  if (resume.publicId) await destroyAsset(resume.publicId);
  res.json({ success: true });
});
