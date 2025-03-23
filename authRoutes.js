const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/emailService"); // Poprawiony import
require("dotenv").config();

const router = express.Router();

// Rejestracja użytkownika
router.post("/register", async (req, res) => {
    console.log("🌍 EMAIL_USER:", process.env.EMAIL_USER);
    console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);

    try {
        console.log("📥 Odebrane dane z frontendu:", req.body); // 🔍 LOG na backendzie

        const { email, password, firstName, lastName, socialId } = req.body;

        if (!email || !password || !firstName || !lastName || !socialId) {
            console.error("❌ Błąd: Brak wymaganych pól!");
            return res.status(400).json({ error: "Wszystkie pola są wymagane!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error("❌ Błąd: Użytkownik już istnieje!");
            return res.status(400).json({ error: "Użytkownik już istnieje!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, firstName, lastName, socialId, balance: 100 });

        console.log("✅ Tworzony użytkownik:", newUser); // 🔍 LOG nowego użytkownika

        await newUser.save();
        res.status(201).json({ message: "Rejestracja zakończona sukcesem!", user: newUser });

        // Generowanie tokena JWT do weryfikacji e-maila
        const verificationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;

        console.log("📨 Link do weryfikacji:", verificationLink); // 🔍 Sprawdzenie linku w logach

// Wyślij e-mail z linkiem weryfikacyjnym
        const emailSent = await sendVerificationEmail(newUser.email, verificationLink);

        if (!emailSent) {
            console.error("❌ Nie udało się wysłać e-maila!");
            return res.status(500).json({ error: "Błąd podczas wysyłania e-maila!" });
        }

        res.status(201).json({ message: "Rejestracja zakończona sukcesem! Sprawdź e-mail.", user: newUser });

    } catch (error) {
        console.error("❌ Błąd serwera:", error);
        res.status(500).json({ error: "Błąd serwera!" });
    }
});



// Logowanie użytkownika
router.post("/login", async (req, res) => {
    try {
        const testUser = await User.findOne();
        console.log("🔍 Testowe pobranie użytkownika:", testUser);

        const { email, password } = req.body;
        console.log("📥 Logowanie - Odebrane dane:", { email, password });

        const user = await User.findOne({ email });
        console.log("🔍 Znaleziony użytkownik:", user);

        if (!user) {
            console.error("❌ Użytkownik nie istnieje!");
            return res.status(401).json({ error: "Nieprawidłowy e-mail lub hasło!" });
        }

        if (!user.isVerified) {
            console.error("⚠️ Konto niezweryfikowane!");
            return res.status(403).json({ error: "Konto niezweryfikowane! Sprawdź e-mail." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Wynik porównania haseł:", isMatch);

        if (!isMatch) {
            console.error("❌ Błędne hasło!");
            return res.status(401).json({ error: "Nieprawidłowy e-mail lub hasło!" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("✅ Token JWT wygenerowany!");

        res.json({ message: "Zalogowano pomyślnie!", token, user });
    } catch (error) {
        console.error("❌ Błąd logowania:", error);
        res.status(500).json({ error: "Błąd serwera!" });
    }
});



// Weryfikacja e-maila
router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;
        console.log("🔑 Token:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("📜 Dekodowany JWT:", decoded);

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ error: "Nieprawidłowy token weryfikacyjny!" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "Konto już zweryfikowane!" });
        }

        user.isVerified = true;
        await user.save();

        res.json({ message: "Konto zweryfikowane pomyślnie!" });
    } catch (error) {
        console.error("❌ Błąd weryfikacji tokena:", error);
        res.status(400).json({ error: "Nieprawidłowy lub wygasły token!" });
    }
});


module.exports = router;
