const User = require('../models/User');

// Funkcja losująca wynik ruletki
const generateRouletteResult = () => {
    const colors = ['red', 'black', 'green']; // Kolory na kole ruletki
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

// Endpoint: rozpoczęcie gry
const startGame = async (req, res) => {
    try {
        const { userId, bet, color } = req.body;

        if (!userId || !bet || !color) {
            return res.status(400).json({ message: 'Brak wymaganych danych!' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Użytkownik nie istnieje!' });

        if (user.balance < bet) {
            return res.status(400).json({ message: 'Brak wystarczających środków na zakład!' });
        }

        const result = generateRouletteResult();
        let payout = 0;

        if (result === color) {
            payout = color === 'green' ? bet * 14 : bet * 2; // Zielony wygrywa 14x, reszta 2x
            user.balance += payout;
        } else {
            user.balance -= bet;
        }

        await user.save();

        return res.json({
            result,
            payout,
            balance: user.balance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera!' });
    }
};

module.exports = { startGame };
