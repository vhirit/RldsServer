
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor() {
        this.wss = null;
        this.connections = new Map();
        this.adminConnections = new Map();
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws/notifications'
        });
        
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        console.log('WebSocket Notification Service initialized');
    }

    handleConnection(ws, req) {
        try {
            // Extract token from query string or headers
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token') || 
                         req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                ws.close(1008, 'Authentication token required');
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            const userRole = decoded.role;

            // Store connection
            this.connections.set(userId, ws);
            
            // Store admin connections separately
            if (userRole === 'admin') {
                this.adminConnections.set(userId, ws);
                console.log(`Admin ${userId} connected to notification service`);
            } else {
                console.log(`User ${userId} connected to notification service`);
            }

            ws.on('message', (message) => {
                this.handleMessage(userId, userRole, message);
            });

            ws.on('close', () => {
                this.connections.delete(userId);
                this.adminConnections.delete(userId);
                console.log(`User ${userId} disconnected from notification service`);
            });

            // Send connection confirmation
            this.sendToUser(userId, {
                type: 'CONNECTION_ESTABLISHED',
                message: 'WebSocket notification connection established',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('WebSocket authentication failed:', error);
            ws.close(1008, 'Authentication failed');
        }
    }

    // Send message to specific user
    sendToUser(userId, message) {
        const ws = this.connections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Broadcast to all admins
    broadcastToAdmins(message) {
        let sentCount = 0;
        this.adminConnections.forEach((ws, userId) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                sentCount++;
            }
        });
        console.log(`Broadcasted to ${sentCount} admins`);
        return sentCount;
    }

    // Broadcast to all connected users
    broadcastToAll(message) {
        let sentCount = 0;
        this.connections.forEach((ws, userId) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
                sentCount++;
            }
        });
        return sentCount;
    }

    handleMessage(userId, userRole, message) {
        try {
            const data = JSON.parse(message);
            console.log(`Message from ${userRole} ${userId}:`, data);
            
            switch (data.type) {
                case 'PING':
                    this.sendToUser(userId, { type: 'PONG', timestamp: new Date().toISOString() });
                    break;
                case 'SUBSCRIBE_VERIFICATIONS':
                    if (userRole === 'admin') {
                        this.sendToUser(userId, { 
                            type: 'SUBSCRIBED', 
                            channel: 'verifications',
                            timestamp: new Date().toISOString()
                        });
                    }
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    // Notify admins about new user registration
    notifyNewUserRegistration(user) {
        const message = {
            type: 'NEW_USER_REGISTERED',
            message: 'New user has registered and requires verification',
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                createdAt: user.createdAt,
                kycStatus: user.kycStatus
            },
            timestamp: new Date().toISOString(),
            priority: 'high'
        };

        return this.broadcastToAdmins(message);
    }

    // Notify user about verification status update
    notifyUserVerificationStatus(userId, status, message = '') {
        const statusMessage = {
            type: 'VERIFICATION_STATUS_UPDATE',
            status: status,
            message: message || `Your account has been ${status}`,
            timestamp: new Date().toISOString()
        };

        if (status === 'verified') {
            statusMessage.action = {
                text: 'Login to Dashboard',
                url: `${process.env.CLIENT_URL}/login`
            };
        } else if (status === 'rejected') {
            statusMessage.action = {
                text: 'Contact Support',
                url: 'mailto:support@rlds.com'
            };
        }

        return this.sendToUser(userId, statusMessage);
    }

    // Notify admins about verification status change
    notifyAdminsVerificationUpdate(user, oldStatus, newStatus) {
        const message = {
            type: 'USER_VERIFICATION_UPDATED',
            message: `User ${user.email} verification status changed from ${oldStatus} to ${newStatus}`,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString()
        };

        return this.broadcastToAdmins(message);
    }
    // Notify about user deletion
    notifyUserDeletion(userDetails) {
        try {
            this.io.emit('user_deleted', {
                type: 'USER_DELETED',
                timestamp: new Date(),
                data: {
                    userId: userDetails.userId,
                    email: userDetails.email,
                    name: `${userDetails.firstName} ${userDetails.lastName}`,
                    deletedAt: new Date().toISOString()
                }
            });
            console.log(`🔔 WebSocket notification: User ${userDetails.email} deleted`);
        } catch (error) {
            console.error('WebSocket user deletion notification failed:', error);
        }
    }

    // Get connection statistics
    getStats() {
        return {
            totalConnections: this.connections.size,
            adminConnections: this.adminConnections.size,
            userConnections: this.connections.size - this.adminConnections.size
        };
    }
}

module.exports = new WebSocketService();