const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Witaj w API ruletki!' });
});

router.post('/spin', (req, res) => {
    const result = Math.random() > 0.5 ? 'win' : 'lose';
    res.json({ message: 'Obrót ruletki zakończony', result });
});

module.exports = router;
