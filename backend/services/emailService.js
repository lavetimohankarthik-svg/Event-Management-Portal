// Email service using Brevo (Sendinblue) HTTP API
const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "Recstacy Notifications",
                    email: process.env.BREVO_SENDER_EMAIL || "lavetimohankarthik@gmail.com"
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log("Email sent successfully via Brevo. Message ID:", result.messageId);
        return result;
    } catch (error) {
        console.error("Brevo sendEmail error:", error);
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