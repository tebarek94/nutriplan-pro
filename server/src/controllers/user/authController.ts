import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { OperationalError, asyncHandler } from '../../middleware/errorHandler';
import { LoginRequest, RegisterRequest, AuthResponse, User, UserProfile } from '../../types';

class AuthController {
  /**
   * User registration
   */
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, first_name, last_name, role = 'user' }: RegisterRequest = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new OperationalError('User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name, role]
    );

    const userId = (result as any).insertId;

    // Get created user (without password)
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0] as Omit<User, 'password'>;

    // Generate JWT token
    const token = this.generateToken(user);

    const response: AuthResponse = {
      user,
      token
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: response
    });
  });

  /**
   * User login
   */
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new OperationalError('Invalid email or password', 401);
    }

    const user = users[0] as User;

    // Check if user is active
    if (!user.is_active) {
      throw new OperationalError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new OperationalError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: response
    });
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Get user with profile
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, 
              u.email_verified, u.created_at, u.updated_at,
              up.age, up.gender, up.weight, up.height, up.activity_level, 
              up.fitness_goal, up.dietary_preferences, up.allergies, up.medical_conditions,
              up.phone, up.date_of_birth
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    const userData = users[0];
    const user = {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      is_active: userData.is_active,
      email_verified: userData.email_verified,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      profile: userData.age ? {
        age: userData.age,
        gender: userData.gender,
        weight: userData.weight,
        height: userData.height,
        activity_level: userData.activity_level,
        fitness_goal: userData.fitness_goal,
        dietary_preferences: userData.dietary_preferences ? JSON.parse(userData.dietary_preferences) : [],
        allergies: userData.allergies ? JSON.parse(userData.allergies) : [],
        medical_conditions: userData.medical_conditions,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth
      } : null
    };

    res.json({
      success: true,
      data: user
    });
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const profileData = req.body;

    // Check if profile exists
    const [existingProfiles] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (existingProfiles.length > 0) {
      // Update existing profile
      await pool.execute(
        `UPDATE user_profiles SET 
         age = ?, gender = ?, weight = ?, height = ?, activity_level = ?,
         fitness_goal = ?, dietary_preferences = ?, allergies = ?, medical_conditions = ?,
         phone = ?, date_of_birth = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          profileData.age || null,
          profileData.gender || null,
          profileData.weight || null,
          profileData.height || null,
          profileData.activity_level || null,
          profileData.fitness_goal || null,
          profileData.dietary_preferences ? JSON.stringify(profileData.dietary_preferences) : null,
          profileData.allergies ? JSON.stringify(profileData.allergies) : null,
          profileData.medical_conditions || null,
          profileData.phone || null,
          profileData.date_of_birth || null,
          userId
        ]
      );
    } else {
      // Create new profile
      await pool.execute(
        `INSERT INTO user_profiles 
         (user_id, age, gender, weight, height, activity_level, fitness_goal, dietary_preferences, allergies, medical_conditions, phone, date_of_birth)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          profileData.age || null,
          profileData.gender || null,
          profileData.weight || null,
          profileData.height || null,
          profileData.activity_level || null,
          profileData.fitness_goal || null,
          profileData.dietary_preferences ? JSON.stringify(profileData.dietary_preferences) : null,
          profileData.allergies ? JSON.stringify(profileData.allergies) : null,
          profileData.medical_conditions || null,
          profileData.phone || null,
          profileData.date_of_birth || null
        ]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  });

  /**
   * Update user information (first_name, last_name, email)
   */
  updateUserInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const { first_name, last_name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        throw new OperationalError('Email is already taken by another user', 409);
      }
    }

    // Update user information
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [first_name, last_name, email, userId]
    );

    // Get updated user data
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = users[0];

    res.json({
      success: true,
      message: 'User information updated successfully',
      data: updatedUser
    });
  });

  /**
   * Change password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const { current_password, new_password } = req.body;

    // Get current user
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);
    if (!isCurrentPasswordValid) {
      throw new OperationalError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  /**
   * Request password reset
   */
  requestPasswordReset = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;

    // Find user by email
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, first_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists or not
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
      return;
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    );

    // Send email (in production, use a proper email service)
    await this.sendPasswordResetEmail(email, resetToken, user.first_name);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  });

  /**
   * Reset password with token
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token, new_password } = req.body;

    // Find user with valid reset token
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      throw new OperationalError('Invalid or expired reset token', 400);
    }

    const userId = users[0].id;

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password and clear reset token
    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  });

  /**
   * Logout (client-side token removal)
   */
  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * Generate JWT token
   */
  private generateToken(user: User | Omit<User, 'password'>): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn } as any);
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    // In production, use a proper email service like SendGrid, AWS SES, etc.
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - NutriPlan Pro',
      html: `
        <h2>Hello ${firstName},</h2>
        <p>You requested a password reset for your NutriPlan Pro account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>NutriPlan Pro Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      // Don't throw error as this is not critical for the user experience
    }
  }
}

export default new AuthController();
