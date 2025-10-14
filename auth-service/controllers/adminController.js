
const User = require('../models/User');
const authService = require('../services/authService');

class AdminController {
    // Update user verification status with WebSocket notifications
    async updateUserVerification(req, res) {
        try {
            const { userId } = req.params;
            const { kycStatus } = req.body;
            const webSocketService = req.webSocketService;

      

            // Validate kycStatus
            if (!['pending', 'verified', 'rejected', 'not_started','hold'].includes(kycStatus)) {
                
                return res.status(400).json({
                    success: false,
                    error: 'Invalid verification status. Must be: pending, verified, rejected, hold, or not_started'
                });
            }

            // Get current user to compare status
            const currentUser = await User.findById(userId);
            if (!currentUser) {
                console.log(' User not found:', userId);
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const oldStatus = currentUser.kycStatus;
            console.log(` Updating user ${userId} from ${oldStatus} to ${kycStatus}`);

            // Update user verification status
            const user = await User.findByIdAndUpdate(
                userId,
                { 
                    kycStatus,
                    // Auto-verify email when KYC is verified
                    ...(kycStatus === 'verified' && { isVerified: true })
                },
                { new: true, runValidators: true }
            ).select('-password -resetPasswordToken -resetPasswordExpires');

            if (!user) {
               
                return res.status(404).json({
                    success: false,
                    error: 'User not found after update'
                });
            }

         

            // Send email notification for status changes
            if (kycStatus === 'verified' || kycStatus === 'rejected' || kycStatus === 'hold' || kycStatus === 'pending' ) {
                try {
                  
                    await authService.sendVerificationStatusEmail(userId, kycStatus);
                   
                } catch (emailError) {
                    console.error(' Email notification failed:', emailError.message);
                    // Don't fail the request if email fails
                }
            }

            // Broadcast real-time notification via WebSocket
            if (webSocketService) {
                try {
                  
                    webSocketService.notifyUserVerification(user, oldStatus, kycStatus);
                } catch (wsError) {
                    console.error(' WebSocket notification failed:', wsError.message);
                }
            }

            // Success response
            res.json({
                success: true,
                data: { user },
                message: `User verification status updated to ${kycStatus} successfully. Email notification sent.`
            });

        } catch (error) {
            console.error('💥 Error in updateUserVerification:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update user verification: ' + error.message
            });
        }
    }

    // Get all users with pagination
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find()
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await User.countDocuments();

            res.json({
                success: true,
                data: {
                    users,
                    totalCount: total,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users'
            });
        }
    }

    // Get user by ID
    async getUserById(req, res) {
        try {
            const { userId } = req.params;

            const user = await User.findById(userId)
                .select('-password -resetPasswordToken -resetPasswordExpires');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch user'
            });
        }
    }
     // Delete user with email notification
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const webSocketService = req.webSocketService;

            console.log(`🗑️ Attempting to delete user: ${userId}`);

            // Find user before deletion to get details for email
            const userToDelete = await User.findById(userId);
            if (!userToDelete) {
                console.log('❌ User not found for deletion:', userId);
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Store user details for email notification
            const userDetails = {
                email: userToDelete.email,
                firstName: userToDelete.firstName,
                lastName: userToDelete.lastName,
                userId: userToDelete._id
            };

            // Delete the user
            await User.findByIdAndDelete(userId);
            console.log(`✅ User deleted successfully: ${userId}`);

            // Send account deletion email notification
            try {
                await authService.sendAccountDeletionEmail(userDetails);
                console.log(`📧 Account deletion email sent to: ${userDetails.email}`);
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError.message);
                // Continue with deletion even if email fails
            }

            // Broadcast real-time notification via WebSocket
            if (webSocketService) {
                try {
                    webSocketService.notifyUserDeletion(userDetails);
                    console.log(`🔔 WebSocket notification sent for user deletion: ${userId}`);
                } catch (wsError) {
                    console.error('❌ WebSocket notification failed:', wsError.message);
                }
            }

            // Invalidate all user sessions
            try {
                await authService.invalidateUserSessions(userId);
                console.log(`🔒 Sessions invalidated for deleted user: ${userId}`);
            } catch (sessionError) {
                console.error('❌ Session invalidation failed:', sessionError.message);
            }

            // Success response
            res.json({
                success: true,
                message: `User account deleted successfully. Notification sent to ${userDetails.email}.`,
                data: {
                    deletedUser: {
                        id: userDetails.userId,
                        email: userDetails.email,
                        name: `${userDetails.firstName} ${userDetails.lastName}`
                    }
                }
            });

        } catch (error) {
            console.error('💥 Error in deleteUser:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete user: ' + error.message
            });
        }
    }

    // Update user role (admin, contract, verifier, user)
    async updateUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const webSocketService = req.webSocketService;

            console.log(`🔧 Admin ${req.user.id} updating user ${userId} role to ${role}`);

            // Validate role
            if (!['user', 'contract', 'admin', 'verifier'].includes(role)) {
                console.log('❌ Invalid role provided:', role);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid role. Must be: user, contract, admin, or verifier'
                });
            }

            // Get current user to compare role and prevent self-demotion
            const currentUser = await User.findById(userId);
            if (!currentUser) {
                console.log('❌ User not found:', userId);
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Prevent admin from demoting themselves (optional security measure)
            if (userId === req.user.id && role !== 'admin') {
                console.log('⚠️ Admin attempting to demote themselves');
                return res.status(403).json({
                    success: false,
                    error: 'You cannot change your own admin role'
                });
            }

            const oldRole = currentUser.role;
            console.log(`📝 Updating user ${userId} from ${oldRole} to ${role}`);

            // Update user role
            const user = await User.findByIdAndUpdate(
                userId,
                { role },
                { new: true, runValidators: true }
            ).select('-password -resetPasswordToken -resetPasswordExpires');

            if (!user) {
                console.log('❌ Failed to update user role');
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            console.log(`✅ User role updated successfully: ${oldRole} → ${role}`);

            // Send real-time notification via WebSocket
            if (webSocketService) {
                const roleChangeData = {
                    type: 'role_updated',
                    userId: userId,
                    oldRole: oldRole,
                    newRole: role,
                    updatedBy: req.user.id,
                    timestamp: new Date().toISOString(),
                    message: `Your account role has been updated to ${role.toUpperCase()}`
                };

                // Notify the specific user
                webSocketService.sendToUser(userId, 'role_change', roleChangeData);
                
                // Notify all admins about the role change
                webSocketService.sendToAdmins('admin_notification', {
                    type: 'role_change',
                    message: `User ${user.firstName} ${user.lastName} role changed from ${oldRole} to ${role}`,
                    adminId: req.user.id,
                    targetUserId: userId,
                    timestamp: new Date().toISOString()
                });

                console.log('📡 WebSocket notifications sent for role change');
            }

            // Send email notification (optional)
            try {
                const emailService = require('../services/emailService');
                const roleNames = {
                    user: 'Standard User',
                    contract: 'Contract User', 
                    admin: 'Administrator',
                    verifier: 'Verifier'
                };

                await emailService.sendRoleChangeNotification({
                    email: user.email,
                    firstName: user.firstName,
                    oldRole: roleNames[oldRole] || oldRole,
                    newRole: roleNames[role] || role,
                    changedBy: req.user.firstName + ' ' + req.user.lastName
                });

                console.log('📧 Role change email notification sent');
            } catch (emailError) {
                console.warn('⚠️ Failed to send role change email:', emailError.message);
            }

            res.status(200).json({
                success: true,
                message: `User role updated successfully from ${oldRole} to ${role}. Email notification sent to ${user.email}.`,
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        oldRole: oldRole,
                        newRole: role,
                        updatedAt: new Date().toISOString()
                    }
                }
            });

        } catch (error) {
            console.error('💥 Error in updateUserRole:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update user role: ' + error.message
            });
        }
    }
}

module.exports = new AdminController();