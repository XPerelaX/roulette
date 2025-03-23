const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// ✅ Debugowanie: Logowanie żądań
router.use((req, res, next) => {
    console.log(`🛠  Otrzymano żądanie: ${req.method} ${req.path}`, req.body);
    next();
});

// ✅ Aktualizacja balansu po `socialId`
router.post("/update-balance", async (req, res) => {
    try {
        const { socialId, balance } = req.body;

        if (!socialId || balance === undefined) {
            return res.status(400).json({ error: "Brak wymaganych danych!" });
        }

        const user = await User.findOne({ socialId });
        if (!user) {
            return res.status(404).json({ error: "Użytkownik nie znaleziony!" });
        }

        user.balance = balance;
        await user.save();

        res.json({ message: "Saldo zaktualizowane!", balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd serwera podczas aktualizacji salda!" });
    }
});


// Zmiana hasła użytkownika
router.post("/change-password", async (req, res) => {
    try {
        const { socialId, currentPassword, newPassword } = req.body;

        if (!socialId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: "Brak wymaganych danych!" });
        }

        const user = await User.findOne({ socialId });
        if (!user) return res.status(404).json({ error: "Użytkownik nie znaleziony!" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Błędne aktualne hasło!" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Hasło zmienione pomyślnie!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Błąd serwera podczas zmiany hasła!" });
    }
});

// ✅ Pobieranie balansu użytkownika po `socialId`
router.post("/get-balance", async (req, res) => {
    try {
        const { socialId } = req.body;

        if (!socialId) {
            return res.status(400).json({ error: "Brak ID użytkownika!" });
        }

        const user = await User.findOne({ socialId });
        if (!user) {
            return res.status(404).json({ error: "Użytkownik nie znaleziony!" });
        }

        res.json({ balance: user.balance });
    } catch (error) {
        console.error("Błąd pobierania balansu:", error);
        res.status(500).json({ error: "Błąd serwera!" });
    }
});



module.exports = router;
