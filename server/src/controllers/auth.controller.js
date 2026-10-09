import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { uploadBuffer, destroyAsset } from '../config/cloudinary.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const session = (user) => ({ success: true, token: sign(user._id), user: user.toSafe() });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({ name, email, password });
  res.status(201).json(session(user));
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) throw new ApiError(401, 'Incorrect email or password');
  res.json(session(user));
});

export const me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user.toSafe() }));

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const body = { success: true, message: 'If that email exists, a reset link has been sent' };
  if (!user) return res.json(body);
  const raw = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const link = `${process.env.CLIENT_URL}/reset-password/${raw}`;
  // TODO: plug in your email provider (Resend, SES, SendGrid) here.
  console.log(`[password reset] ${user.email}: ${link}`);
  if (process.env.NODE_ENV !== 'production') body.devResetLink = link;
  res.json(body);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetToken: hashed, resetTokenExpires: { $gt: Date.now() } }).select(
    '+resetToken +resetTokenExpires'
  );
  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired');
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json(session(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (req.body.name) user.name = req.body.name;
  if (req.file) {
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'interviewace/avatars',
      resource_type: 'image',
      transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
    });
    if (user.avatar?.publicId) await destroyAsset(user.avatar.publicId);
    user.avatar = { url: result.secure_url, publicId: result.public_id };
  }
  await user.save();
  res.json({ success: true, user: user.toSafe() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
