const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendInvitationEmail = async (email, token, boardName, inviterName) => {
    try {
        const templatePath = path.join(
            __dirname,
            '../templates/invitation-email.html'
        );
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);

        const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;

        const html = template({
            boardName,
            inviterName,
            acceptUrl,
            expirationDays: 7,
            currentYear: new Date().getFullYear()
        });

        const mailOptions = {
            from: `"DevBoard Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You've been invited to ${boardName}`,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending invitation email:', error);
        return false;
    }
};

module.exports = { sendInvitationEmail };
