const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      console.log("Email transporter initialized");
    } catch (error) {
      console.error("Failed to initialize email transporter:", error);
    }
  }

  async sendEmail(to, subject, html, text = "") {
    try {
      // Check if transporter is initialized
      if (!this.transporter) {
        this.initializeTransporter();
        if (!this.transporter) {
          throw new Error("Email transporter not available");
        }
      }

      const mailOptions = {
        from:
          process.env.SMTP_FROM || `"RLDS Pvt Ltd" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      };

      console.log("Attempting to send email to:", to);
      console.log("Using SMTP user:", process.env.SMTP_USER);

      const result = await this.transporter.sendMail(mailOptions);

      return result;
    } catch (error) {
      console.error(" Email sending failed:", error.message);

      // More specific error handling
      if (error.code === "EAUTH") {
        console.error("🔐 Authentication failed. Please check:");
        console.error("1. Gmail username and password are correct");
        console.error("2. 2-Step Verification is enabled");
        console.error("3. App Password is used instead of regular password");
        console.error(
          "4. App Password has correct format (16 characters, no spaces)"
        );
      } else if (error.code === "ECONNECTION") {
        console.error(
          "🌐 Connection failed. Please check network and SMTP settings"
        );
      }

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
      }

      await this.transporter.verify();
      console.log(
        " Email configuration is correct - SMTP connection successful"
      );
      return true;
    } catch (error) {
      console.error(" Email configuration error:", error.message);

      if (error.code === "EAUTH") {
        console.error("\n🔧 TROUBLESHOOTING STEPS:");
        console.error("1. Go to: https://myaccount.google.com/");
        console.error("2. Enable 2-Step Verification");
        console.error(
          "3. Generate App Password: Security → App passwords → Generate"
        );
        console.error('4. Select "Mail" and "Other", name it "RLDS App"');
        console.error("5. Use the 16-character app password in your .env file");
        console.error("6. Make sure SMTP_USER is your full email address");
      }

      return false;
    }
  }

  // Send a test email
  async sendTestEmail() {
    try {
      const testEmail = process.env.SMTP_USER; // Send test to yourself
      const subject = "Test Email - RLDS System";
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Test Email Successful</h1>
                </div>
                <div class="content">
                    <p>This is a test email from your RLDS application.</p>
                    <p>If you received this email, your email configuration is working correctly!</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div class="footer">
                    <p>RLDS Pvt Limited &copy; ${new Date().getFullYear()}</p>
                </div>
            </div>
        </body>
        </html>
      `;

      await this.sendEmail(
        testEmail,
        subject,
        html,
        "Test email from RLDS system"
      );
      console.log("✅ Test email sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Test email failed:", error.message);
      return false;
    }
  }

  // Email template for new user registration notification to admin
  getAdminRegistrationEmail(user) {
    const subject = `New User Registration - ${user.firstName} ${user.lastName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .user-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
              .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>New User Registration</h1>
              </div>
              <div class="content">
                  <p>A new user has registered on RLDS platform:</p>
                  
                  <div class="user-info">
                      <h3>User Details:</h3>
                      <p><strong>Name:</strong> ${user.firstName} ${
      user.lastName
    }</p>
                      <p><strong>Email:</strong> ${user.email}</p>
                      <p><strong>Phone:</strong> ${user.phone}</p>
                      <p><strong>Registration Date:</strong> ${new Date(
                        user.createdAt
                      ).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Verification</span></p>
                  </div>

                  <p>Please review this user in the admin panel and update their verification status.</p>
                  
                  <a href="${
                    process.env.ADMIN_URL || "http://localhost:3000/admin"
                  }" class="button">
                      Go to Admin Panel
                  </a>
              </div>
              <div class="footer">
                  <p>RLDS Pvt Limited &copy; ${new Date().getFullYear()}</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const text = `New user registration: ${user.firstName} ${user.lastName} (${user.email}). Please review in admin panel.`;

    return { subject, html, text };
  }

  // Email template for user verification status update
  getUserVerificationEmail(user, status) {
    const statusConfig = {
      verified: {
        subject: "Account Verified - Welcome to RLDS Platform",
        color: "#006d77",
        statusText: "Verified",
        message:
          "Your account has been successfully verified. You are now able to log in and use all available features of our platform.",
        buttonText: "Login to Dashboard",
      },
      rejected: {
        subject: "Account Verification Update - RLDS Platform",
        color: "#ef4444",
        statusText: "Rejected",
        message:
          "We regret to inform you that your account verification could not be completed. Please contact support for more information.",
        buttonText: "Contact Support",
      },
      hold: {
        subject: "Account Verification On Hold - RLDS Platform",
        color: "#f59e0b",
        statusText: "On Hold",
        message:
          "Your account verification is currently on hold. Our team requires additional information or documents to complete the verification process. Please check your email for further instructions or contact our support team.",
        buttonText: "Contact Support",
      },
    };

    const config = statusConfig[status];
    const loginUrl = process.env.CLIENT_URL || "http://localhost:3001";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${
                config.color
              }; color: white; padding: 20px; text-align: center; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .status-badge { 
                  background: ${config.color}; 
                  color: white; 
                  padding: 8px 16px; 
                  border-radius: 20px; 
                  display: inline-block; 
                  font-weight: bold; 
              }
              .button { 
                  background: ${config.color}; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  display: inline-block; 
                  margin: 15px 0; 
              }
              .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Account Verification Completed</h1>
              </div>
              <div class="content">
                  <p>Dear ${user.firstName} ${user.lastName},</p>
                  
                  <p>${config.message}</p>
                  
                  <div style="text-align: center;">
                      <div class="status-badge">
                          Status: ${config.statusText.toUpperCase()}
                      </div>
                  </div>

                  <p>If you have any questions, feel free to reach out to our support team anytime.</p>
                  
                  <div style="text-align: center;">
                      <a href="${
                        status === "verified"
                          ? `${loginUrl}/login`
                          : "mailto:support@rlds.com"
                      }" class="button">
                          ${config.buttonText}
                      </a>
                  </div>
              </div>
              <div class="footer">
                  <p>RLDS Pvt Limited &copy; ${new Date().getFullYear()}</p>
                  <p>This is an automated message, please do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const text = `Your account verification status has been updated to: ${config.statusText}. ${config.message}`;

    return { subject: config.subject, html, text };
  }

  // Password reset email template
  getPasswordResetEmail(user, resetToken) {
    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:3001"
    }/reset-password?token=${resetToken}`;

    const subject = "Password Reset Request - RLDS Platform";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
              .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
              .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
              .token { background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                  <p>Dear ${user.firstName} ${user.lastName},</p>
                  
                  <p>You have requested to reset your password for your RLDS account.</p>
                  
                  <p>Click the button below to reset your password:</p>
                  
                  <div style="text-align: center;">
                      <a href="${resetUrl}" class="button">
                          Reset Your Password
                      </a>
                  </div>

                  <p>Or use this reset token:</p>
                  <div class="token">${resetToken}</div>

                  <p><strong>This link will expire in 1 hour.</strong></p>
                  
                  <p>If you didn't request this reset, please ignore this email.</p>
              </div>
              <div class="footer">
                  <p>RLDS Pvt Limited &copy; ${new Date().getFullYear()}</p>
                  <p>This is an automated message, please do not reply to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const text = `Password reset requested for your RLDS account. Use this token to reset: ${resetToken} or visit: ${resetUrl}`;

    return { subject, html, text };
  }
  // Email template for account deletion notification
  getAccountDeletionEmail(userDetails) {
    const subject = "Account Deletion Notification - RLDS Platform";
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
                    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
                    .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Account Deletion Notification</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${userDetails.firstName} ${
      userDetails.lastName
    },</p>
                        
                        <div class="info-box">
                            <p><strong>We regret to inform you that your RLDS account has been deleted.</strong></p>
                            <p>Account Details:</p>
                            <ul>
                                <li><strong>Email:</strong> ${
                                  userDetails.email
                                }</li>
                                <li><strong>Name:</strong> ${
                                  userDetails.firstName
                                } ${userDetails.lastName}</li>
                                <li><strong>Deletion Date:</strong> ${new Date().toLocaleString()}</li>
                            </ul>
                        </div>

                        <p><strong>What this means:</strong></p>
                        <ul>
                            <li>Your account and all associated data have been permanently removed from our system</li>
                            <li>You will no longer be able to access the RLDS platform</li>
                            <li>All your sessions have been invalidated</li>
                        </ul>

                        <p>If you believe this action was taken in error, or if you have any questions, 
                        please contact our support team immediately.</p>

                        <p>We thank you for having been part of the RLDS community.</p>

                        <div style="text-align: center; margin: 20px 0;">
                            <a href="mailto:support@rlds.com" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Contact Support
                            </a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>RLDS Pvt Limited &copy; ${new Date().getFullYear()}</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

    const text = `Your RLDS account has been deleted. 
Account: ${userDetails.email}
Name: ${userDetails.firstName} ${userDetails.lastName}
Deletion Date: ${new Date().toLocaleString()}

If this was an error, please contact support immediately.

Thank you for being part of RLDS.`;

    return { subject, html, text };
  }

  async sendRoleChangeNotification({ email, firstName, oldRole, newRole, changedBy }) {
    try {
      const { subject, html, text } = this.generateRoleChangeEmail({
        firstName,
        oldRole,
        newRole,
        changedBy
      });

      await this.sendEmail(email, subject, html, text);
      console.log(`Role change notification sent to ${email}`);
    } catch (error) {
      console.error('Failed to send role change notification:', error);
      throw error;
    }
  }

  generateRoleChangeEmail({ firstName, oldRole, newRole, changedBy }) {
    const subject = `RLDS Account - Role Updated to ${newRole}`;
    
    const roleDescriptions = {
      'Standard User': 'Standard user access with basic features',
      'Contract User': 'Contract user access with extended features',
      'Administrator': 'Full administrative access to all system features',
      'Verifier': 'Verification specialist access for document processing'
    };

    const roleColors = {
      'Standard User': '#6B7280',
      'Contract User': '#059669', 
      'Administrator': '#7C3AED',
      'Verifier': '#2563EB'
    };

    const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Role Updated - RLDS</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                            <h1 style="color: #1f2937; margin: 0; font-size: 28px;">🔧 Role Updated</h1>
                            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Your RLDS account role has been changed</p>
                        </div>

                        <!-- Main Content -->
                        <div style="margin-bottom: 30px;">
                            <p style="font-size: 18px; margin-bottom: 20px;">Hello ${firstName},</p>
                            
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Your account role has been updated by an administrator.
                            </p>

                            <!-- Role Change Details -->
                            <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${roleColors[newRole] || '#2563EB'};">
                                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Role Change Details:</h3>
                                
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <strong style="color: #374151; min-width: 120px;">Previous Role:</strong>
                                    <span style="background-color: #e5e7eb; padding: 4px 12px; border-radius: 20px; font-size: 14px; color: #4b5563;">${oldRole}</span>
                                </div>
                                
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <strong style="color: #374151; min-width: 120px;">New Role:</strong>
                                    <span style="background-color: ${roleColors[newRole] || '#2563EB'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">${newRole}</span>
                                </div>
                                
                                <div style="margin-bottom: 10px;">
                                    <strong style="color: #374151;">Changed By:</strong> ${changedBy}
                                </div>
                                
                                <div>
                                    <strong style="color: #374151;">Date:</strong> ${new Date().toLocaleString()}
                                </div>
                            </div>

                            <!-- Role Description -->
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                                <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Your New Access Level:</h4>
                                <p style="margin: 0; color: #1f2937; font-size: 14px;">${roleDescriptions[newRole] || 'Updated role access as configured by your administrator.'}</p>
                            </div>

                            <!-- Next Steps -->
                            <div style="margin: 25px 0;">
                                <h4 style="color: #1f2937; font-size: 16px; margin-bottom: 10px;">📋 Next Steps:</h4>
                                <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px;">
                                    <li style="margin-bottom: 5px;">Log out and log back in to see your new permissions</li>
                                    <li style="margin-bottom: 5px;">Explore the features available to your new role</li>
                                    <li style="margin-bottom: 5px;">Contact support if you have any questions about your new access level</li>
                                </ul>
                            </div>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                               style="background-color: ${roleColors[newRole] || '#2563EB'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
                                Login to RLDS Dashboard
                            </a>
                        </div>

                        <!-- Footer -->
                        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                            <p>If you believe this role change was made in error, please contact your administrator immediately.</p>
                            <p>This is an automated message, please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

    const text = `Your RLDS account role has been updated.

Hello ${firstName},

Your account role has been changed by an administrator.

Role Change Details:
- Previous Role: ${oldRole}
- New Role: ${newRole}
- Changed By: ${changedBy}
- Date: ${new Date().toLocaleString()}

Your New Access Level:
${roleDescriptions[newRole] || 'Updated role access as configured by your administrator.'}

Next Steps:
1. Log out and log back in to see your new permissions
2. Explore the features available to your new role
3. Contact support if you have any questions about your new access level

Login to RLDS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

If you believe this role change was made in error, please contact your administrator immediately.

This is an automated message, please do not reply to this email.`;

    return { subject, html, text };
  }
}

module.exports = new EmailService();
