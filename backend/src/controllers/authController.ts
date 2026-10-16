import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendWelcomeEmail, sendPasswordResetEmail, isEmailConfigured } from '../services/emailService';

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_kavah_coffee_jwt_key_2026_dev';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both an email and a password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
      return;
    }

    // Determine first and last names gracefully
    let userFirstName = firstName?.trim();
    let userLastName = lastName?.trim() || '';

    if (!userFirstName) {
      const emailPrefix = normalizedEmail.split('@')[0];
      userFirstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }

    const user = await User.create({
      firstName: userFirstName,
      lastName: userLastName,
      email: normalizedEmail,
      password,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      addresses: []
    });

    const token = generateToken(user._id.toString());

    const configured = isEmailConfigured();
    // Send Welcome Email asynchronously from instahelper7109648@gmail.com
    sendWelcomeEmail(user.email, user.firstName).catch((err) => {
      console.error('[Signup] Error sending welcome email:', err.message);
    });

    res.status(201).json({
      success: true,
      message: configured
        ? `Account created successfully! We sent a welcome message with your 10% coupon to ${user.email} from instahelper7109648@gmail.com.`
        : `Account created successfully! (Note: Real email delivery to ${user.email} requires setting EMAIL_PASS in backend/.env).`,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating account.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error signing in.' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide an email address.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return positive generic message to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent from instahelper7109648@gmail.com.'
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await user.save({ validateBeforeSave: false });

    // Send Password Reset Email from instahelper7109648@gmail.com
    const emailResult = await sendPasswordResetEmail(user.email, user.firstName, resetToken);

    res.status(200).json({
      success: true,
      message: emailResult.success
        ? `A password reset link has been sent to ${user.email} from instahelper7109648@gmail.com. Please check your inbox and spam folder.`
        : `Password reset token generated! (To send to your real inbox, add EMAIL_PASS to backend/.env). You can use the direct link below.`,
      resetToken, // Provided in response for easy local testing & development
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing request.' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new one.'
      });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error resetting password.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { firstName, lastName, phone } = req.body;
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        addresses: user.addresses
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('+password');
    if (!user || !user.password) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password provided is incorrect.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add customer address
// @route   POST /api/auth/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { fullName, phone, street, apartment, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      res.status(400).json({ success: false, message: 'Please provide all required address details.' });
      return;
    }

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    } else if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      apartment: apartment || '',
      city,
      state,
      postalCode,
      country: country || 'United States',
      isDefault: isDefault ?? (user.addresses.length === 0)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      addresses: user.addresses
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer address
// @route   PUT /api/auth/addresses/:id
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const addressId = req.params.id;
    const address = user.addresses.find(a => a._id?.toString() === addressId);

    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    const { fullName, phone, street, apartment, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (apartment !== undefined) address.apartment = apartment;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      addresses: user.addresses
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete customer address
// @route   DELETE /api/auth/addresses/:id
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const addressId = req.params.id;
    user.addresses = user.addresses.filter(a => a._id?.toString() !== addressId);

    // If no default exists and addresses remain, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address removed successfully.',
      addresses: user.addresses
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
