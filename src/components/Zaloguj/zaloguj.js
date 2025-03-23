import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./zaloguj.css";

function Zalogujsie() {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [socialId, setSocialId] = useState("");
    const [balance, setBalance] = useState(100);
    const [t, setT] = useState("");


    useEffect(() => {
        const fetchBalance = async () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                navigate("/zaloguj");
                return;
            }
            try {
                const user = JSON.parse(storedUser);
                if (!user || !user.socialId) {
                    console.error("Nieprawidłowy obiekt użytkownika w localStorage");
                    navigate("/zaloguj");
                    return;
                }
                const response = await fetch("http://localhost:5000/api/user/get-balance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ socialId: user.socialId })
                });
                const data = await response.json();
                if (response.ok) {
                    setBalance(data.balance);
                } else {
                    console.error("Błąd pobierania salda:", data.error || "Nieznany błąd");
                }
            } catch (error) {
                console.error("Błąd połączenia z serwerem:", error);
            }
        };
        fetchBalance();
    }, [navigate]);

    const updateUserBalance = async (amountChange) => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
            const user = JSON.parse(storedUser);
            if (!user || !user.socialId) {
                console.error("Nieprawidłowy obiekt użytkownika w localStorage");
                return;
            }

            const newBalance = user.balance + amountChange;
            user.balance = newBalance;
            localStorage.setItem("user", JSON.stringify(user));
            setBalance(newBalance);

            const response = await fetch("http://localhost:5000/api/user/update-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ socialId: user.socialId, balance: newBalance })
            });

            if (!response.ok) {
                console.error("Błąd aktualizacji salda");
            }
        } catch (error) {
            console.error("Błąd przetwarzania JSON:", error);
        }
    };


    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");


        // ✅ WALIDACJA
        const validatePesel = (pesel) => {
            if (pesel.length !== 11 || !/^\d{11}$/.test(pesel)) return false;

            const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
            let sum = 0;

            for (let i = 0; i < 10; i++) {
                sum += parseInt(pesel[i]) * weights[i];
            }

            const controlDigit = (10 - (sum % 10)) % 10;
            return controlDigit === parseInt(pesel[10]);
        };

        if (!firstName.trim() || !lastName.trim()) {
            setError("Imię i nazwisko nie mogą być puste");
            return;
        }
        if (!/^\d{11}$/.test(socialId)) {
            setError("PESEL musi składać się z 11 cyfr");
            return;
        }
        if (!validatePesel(socialId)) {
            setError("Niepoprawny numer PESEL");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(registerEmail)) {
            setError("Niepoprawny format email");
            return;
        }
        if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(registerPassword)) {
            setError("Hasło musi mieć min. 8 znaków, 1 dużą literę, cyfrę i znak specjalny");
            return;
        }


        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: registerEmail, password: registerPassword, firstName, lastName, socialId, balance: 100 }) // ✅ Ustawienie balansu na 100
            });

            const data = await response.json();
            console.log("📥 Odpowiedź z serwera:", data);

            if (!response.ok) throw new Error(data.error || "Błąd rejestracji");

            alert("Rejestracja zakończona sukcesem! Sprawdź email w celu aktywacji konta!");
            setRegisterEmail("");
            setRegisterPassword("");
            setFirstName("");
            setLastName("");
            setSocialId("");

        } catch (err) {
            console.error("❌ Błąd rejestracji:", err.message);
            setError(err.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        console.log("📤 Wysyłam dane logowania:", { email: loginEmail, password: loginPassword });

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await response.json();
            console.log("📥 Odpowiedź z serwera:", data);

            if (response.ok) {
                if (data.token && data.user) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user);
                    setBalance(data.user.balance);
                    navigate("/"); // Przekierowanie na stronę główną
                    window.location.reload(); // Odświeżenie strony
                } else {
                    setError("Nieprawidłowa odpowiedź z serwera");
                }
            } else {
                console.error("⚠️ Błąd logowania:", data.error);
                setError(data.error || "Błąd logowania");
            }
        } catch (error) {
            console.error("❌ Błąd połączenia z serwerem:", error);
            setError("Błąd połączenia z serwerem");
            setRegisterEmail("");
            setRegisterPassword("");
            setFirstName("");
            setLastName("");
            setSocialId("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/zaloguj");
        window.location.reload();
    };

    return (
        <div className="login-container">
            {user ? (
                <div className="welcome-message">
                    <h2 onClick={() => navigate("/profil")} className="user-welcome">Witaj, {user.firstName}!</h2>
                    <p className="user-balance">Saldo: {user.balance} kredytów</p>
                    <button onClick={handleLogout} className="logout-button">Wyloguj</button>
                    <button onClick={() => navigate("/automat")} className="play-button">Zagraj w automat</button>
                </div>
            ) : (
                <div className="main">
                    <input type="checkbox" id="chk" aria-hidden="true" />
                    <div className="signup">
                        <form onSubmit={handleRegister} className="auth-form">
                            <label htmlFor="chk" className="auth-label">Rejestracja</label>
                            <input type="text" placeholder="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="auth-input" />
                            <input type="text" placeholder="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="auth-input" />
                            <input type="text" placeholder="Pesel" value={socialId} onChange={(e) => setSocialId(e.target.value)} required className="auth-input" />
                            <input type="email" placeholder="Email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required className="auth-input" />
                            <input type="password" placeholder="Hasło" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required className="auth-input" />
                            <button type="submit" className="auth-button">Zarejestruj się</button>
                        </form>
                    </div>
                    <div className="login">
                        <form onSubmit={handleLogin} className="auth-form">
                            <label htmlFor="chk" className="auth-label">Logowanie</label>
                            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="auth-input" />
                            <input type="password" placeholder="Hasło" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="auth-input" />
                            <button type="submit" className="auth-button">Zaloguj się</button>
                        </form>
                    </div>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default Zalogujsie;
