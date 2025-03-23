const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware - CORS i JSON
app.use(cors());
app.use(express.json());

// Content-Security-Policy (CSP)
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    );
    next();
});

// Połączenie z MongoDB
mongoose.connect('mongodb://mongo:27017/casino', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Połączono z MongoDB'))
    .catch(err => console.error('❌ Błąd połączenia:', err));

// Trasy API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Poprawiona ścieżka do userRoutes

// Status API
app.get('/api/status', (req, res) => {
    res.json({ status: "OK", message: "Backend działa!" });
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Wewnętrzny błąd serwera", error: err.message });
});

// Uruchomienie serwera
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Serwer działa na porcie ${PORT}`));
