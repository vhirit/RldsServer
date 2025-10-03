
const User = require('../models/User');
const Session = require('../models/Session');
const jwtService = require('./jwtService');
const encryptionService = require('./encryptionService');
const emailService = require('./emailService');

class AuthService {
    constructor() {
        this.webSocketService = null;
    }

    // Set WebSocket service instance
    setWebSocketService(webSocketService) {
        this.webSocketService = webSocketService;
    }

    async registerUser(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Create new user with default verification status
            const user = new User({
                ...userData,
                isVerified: false, // Default to false for new registrations
                kycStatus: 'pending' // Set KYC status to pending
            });
            await user.save();

            // Generate token and create session
            const token = jwtService.generateToken(user);
            await jwtService.createSession(user, token);

            // Send email notification to admin
            await this.notifyAdminNewRegistration(user);

            // Broadcast real-time notification to admins
            if (this.webSocketService) {
                this.webSocketService.notifyUserRegistration(user);
            }

            return { user, token };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async authenticateUser(email, password) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Check if user is verified
            if (!user.isVerified && user.kycStatus !== 'verified') {
                throw new Error('Please verify your account before logging in. Check your email for verification instructions.');
            }

            if (user.kycStatus === 'hold') {
              throw new Error('Your account verification is on hold. Please check your email for further instructions or contact support.');
           }

            // Check if KYC is verified
            if (user.kycStatus !== 'verified') {
                throw new Error('Your account is pending verification. Please wait for admin approval.');
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token and create session
            const token = jwtService.generateToken(user);
            await jwtService.createSession(user, token);

            // Broadcast login success via WebSocket
            if (this.webSocketService) {
                this.webSocketService.notifyUserLogin(user);
            }

            return { user, token };
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    // Notify admin about new registration
    async notifyAdminNewRegistration(user) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@rlds.com';
            
            if (!adminEmail) {
                console.warn('ADMIN_EMAIL not configured, skipping admin notification');
                return;
            }

            const emailContent = emailService.getAdminRegistrationEmail(user);
            await emailService.sendEmail(
                adminEmail,
                emailContent.subject,
                emailContent.html,
                emailContent.text
            );

            console.log('Admin notification email sent for new user registration');
        } catch (error) {
            console.error('Failed to send admin notification email:', error);
        }
    }

    // Send verification status email to user
    async sendVerificationStatusEmail(userId, status) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const emailContent = emailService.getUserVerificationEmail(user, status);
            await emailService.sendEmail(
                user.email,
                emailContent.subject,
                emailContent.html,
                emailContent.text
            );

            console.log(`Verification status email sent to ${user.email}: ${status}`);
        } catch (error) {
            console.error('Failed to send verification status email:', error);
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
    }

    // Send password reset email to user
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const emailContent = emailService.getPasswordResetEmail(user, resetToken);
            await emailService.sendEmail(
                user.email,
                emailContent.subject,
                emailContent.html,
                emailContent.text
            );

            console.log(`Password reset email sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }
    }

    // Verify user account (for email verification)
    async verifyUserAccount(token) {
        try {
            const decoded = jwtService.verifyToken(token);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                throw new Error('User not found');
            }

            if (user.isVerified) {
                throw new Error('Account is already verified');
            }

            user.isVerified = true;
            await user.save();

            return { message: 'Account verified successfully' };
        } catch (error) {
            throw new Error(`Account verification failed: ${error.message}`);
        }
    }

    // Check if user can login (verification status)
    async canUserLogin(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return { canLogin: false, reason: 'User not found' };
            }

            if (!user.isVerified) {
                return { canLogin: false, reason: 'Email not verified' };
            }
            if (user.kycStatus === 'hold') {
              return { canLogin: false, reason: 'Account verification on hold' };
           }
            if (user.kycStatus !== 'verified') {
                return { canLogin: false, reason: 'KYC verification pending' };
            }

            return { canLogin: true };
        } catch (error) {
            return { canLogin: false, reason: 'Error checking user status' };
        }
    }

    async logout(token) {
        try {
            await jwtService.invalidateToken(token);
            return true;
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }

    async forgotPassword(email) {
        try {
            const user = await User.findOne({ email });
            console.log('userreset:', user);
            if (!user) {
                // Don't reveal if user exists or not
                return { message: 'If the email exists, a reset link will be sent' };
            }

            // Generate reset token
            const resetToken = encryptionService.generateResetToken();
            const hashedToken = encryptionService.hashResetToken(resetToken);

            // Set token and expiry (1 hour)
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // Send password reset email to user
            await this.sendPasswordResetEmail(user, resetToken);

            return { 
                message: 'If the email exists, a reset link will be sent',
                resetToken // In production, remove this and only send via email
            };
        } catch (error) {
            throw new Error(`Password reset request failed: ${error.message}`);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const hashedToken = encryptionService.hashResetToken(token);

            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Update password and clear reset token
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            console.log('user', user);
            await user.save();

            // Invalidate all existing sessions for security
            await this.invalidateUserSessions(user._id);

            return { message: 'Password reset successfully' };
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    async invalidateUserSessions(userId) {
        try {
            await Session.updateMany(
                { userId, invalidated: false },
                { 
                    invalidated: true,
                    invalidatedAt: new Date()
                }
            );
        } catch (error) {
            console.error('Error invalidating user sessions:', error);
        }
    }

    async validateToken(token) {
        return jwtService.validateToken(token);
    }

     // Send account deletion email to user
    async sendAccountDeletionEmail(userDetails) {
        try {
            const emailContent = emailService.getAccountDeletionEmail(userDetails);
            await emailService.sendEmail(
                userDetails.email,
                emailContent.subject,
                emailContent.html,
                emailContent.text
            );

            console.log(`✅ Account deletion email sent to ${userDetails.email}`);
        } catch (error) {
            console.error('❌ Failed to send account deletion email:', error);
            throw new Error(`Failed to send account deletion email: ${error.message}`);
        }
    }
}

module.exports = new AuthService();