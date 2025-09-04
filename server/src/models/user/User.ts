import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { User, UserProfile, CreateUserProfileRequest } from '../../types';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.email, userData.password, userData.first_name, userData.last_name, userData.role, userData.is_active, userData.email_verified]
    );
    return (result as any).insertId;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] as User : null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] as User : null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: number, profileData: Partial<UserProfile>): Promise<void> {
    const fields = Object.keys(profileData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(profileData);
    
    await pool.execute(
      `UPDATE user_profiles SET ${fields}, updated_at = NOW() WHERE user_id = ?`,
      [...values, userId]
    );
  }

  /**
   * Create or update user profile
   */
  static async upsertProfile(userId: number, profileData: CreateUserProfileRequest): Promise<void> {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing profile
      const fields = Object.keys(profileData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(profileData);
      
      await pool.execute(
        `UPDATE user_profiles SET ${fields}, updated_at = NOW() WHERE user_id = ?`,
        [...values, userId]
      );
    } else {
      // Create new profile
      const fields = Object.keys(profileData).join(', ');
      const placeholders = Object.keys(profileData).map(() => '?').join(', ');
      const values = Object.values(profileData);
      
      await pool.execute(
        `INSERT INTO user_profiles (user_id, ${fields}, created_at, updated_at) VALUES (?, ${placeholders}, NOW(), NOW())`,
        [userId, ...values]
      );
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: number): Promise<UserProfile | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    return rows.length > 0 ? rows[0] as UserProfile : null;
  }

  /**
   * Update user status
   */
  static async updateStatus(userId: number, isActive: boolean): Promise<void> {
    await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [isActive, userId]
    );
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
  }

  /**
   * Set reset token
   */
  static async setResetToken(email: string, token: string, expires: Date): Promise<void> {
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
      [token, expires, email]
    );
  }

  /**
   * Clear reset token
   */
  static async clearResetToken(userId: number): Promise<void> {
    await pool.execute(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [userId]
    );
  }

  /**
   * Find user by reset token
   */
  static async findByResetToken(token: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows.length > 0 ? rows[0] as User : null;
  }
}
