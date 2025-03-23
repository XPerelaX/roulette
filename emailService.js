const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationEmail(email, verificationLink) {
    console.log("🌍 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);
    console.log("📧 Email user:", process.env.EMAIL_USER);
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Potwierdzenie rejestracji",
            html: `<p>Kliknij w poniższy link, aby zweryfikować swoje konto:</p><a href="${verificationLink}">${verificationLink}</a>`,
        });
        console.log("✅ E-mail wysłany!");
        return true;
    } catch (error) {
        console.error("Błąd wysyłania e-maila:", error);
        return false;
    }
}

module.exports = sendVerificationEmail;
