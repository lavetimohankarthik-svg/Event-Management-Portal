const nodemailer = require("nodemailer");

// Create transporter using Gmail SMTP service
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Helper function to send email via SMTP transporter
const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `Recstacy Notifications <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
    } catch (error) {
        console.error("Nodemailer sendMail error:", error);
        throw error;
    }
};

const sendTicketEmail = async (
    email,
    participantName,
    event,
    ticketId
) => {
    await sendEmail({
        to: email,
        subject: `Registration Confirmed - ${event.eventName}`,
        html: `
            <h2>Registration Successful</h2>
            <p>Hello ${participantName},</p>
            <p>You have successfully registered for <strong>${event.eventName}</strong>.</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Start:</strong> ${event.startDate}</p>
            <p><strong>End:</strong> ${event.endDate}</p>
            <p>Please keep your Ticket ID for verification.</p>
        `
    });
};

const sendMerchandiseOrderEmail = async (
    email,
    participantName,
    merchandise,
    quantity,
    totalPrice,
    ticketId
) => {
    await sendEmail({
        to: email,
        subject: `Order Confirmed - ${merchandise.name}`,
        html: `
            <h2>Merchandise Purchase Successful</h2>
            <p>Hello ${participantName},</p>
            <p>Your order for <strong>${merchandise.name}</strong> has been approved.</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total Price:</strong> ₹${totalPrice}</p>
            <p><strong>Ticket/Order ID:</strong> ${ticketId}</p>
            <p>Please keep this Ticket/Order ID for pickup verification.</p>
        `
    });
};

const sendPasswordResetApprovedEmail = async (
    email,
    organizerName,
    newPassword
) => {
    await sendEmail({
        to: email,
        subject: `Password Reset Request Approved`,
        html: `
            <h2>Password Reset Approved</h2>
            <p>Hello ${organizerName},</p>
            <p>Your request to reset your password has been approved by the Admin.</p>
            <p>Your new login password is: <strong>${newPassword}</strong></p>
            <p>Please log in and update your password immediately for security reasons.</p>
        `
    });
};

const sendTeamInvitationEmail = async (
    email,
    receiverName,
    leaderName,
    teamName,
    eventName
) => {
    await sendEmail({
        to: email,
        subject: `Invitation to join Team ${teamName}`,
        html: `
            <h2>Team Invitation Received</h2>
            <p>Hello ${receiverName},</p>
            <p><strong>${leaderName}</strong> has invited you to join their team, <strong>${teamName}</strong>, for the event <strong>${eventName}</strong>.</p>
            <p>Please log in to your dashboard to review and accept the invitation.</p>
        `
    });
};

const sendOrganizerCreatedEmail = async (
    email,
    organizerName,
    temporaryPassword
) => {
    await sendEmail({
        to: email,
        subject: `Organizer Account Created`,
        html: `
            <h2>Welcome to Recstacy!</h2>
            <p>Hello ${organizerName},</p>
            <p>An organizer account has been created for you by the Admin.</p>
            <p><strong>Login Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            <p>Please log in and update your password under your profile security settings immediately.</p>
        `
    });
};

module.exports = {
    sendTicketEmail,
    sendMerchandiseOrderEmail,
    sendPasswordResetApprovedEmail,
    sendTeamInvitationEmail,
    sendOrganizerCreatedEmail
};