import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendVerificationCode = async (email, code) => {
    const mailOptions = {
        from: `"Global Pearl Ventures" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verification Code for Your simplyBooked Account',
        text: `Dear user,\n\nPlease use the following verification code to verify your email address.\n\nCode: ${code}\n\nBest regards,\nsimplyBooked Team`,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

export {sendVerificationCode};
