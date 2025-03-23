import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./automat.css";
import logo from "../../assets/logo_dzordzo.png";

const SlotMachine = () => {
    const [balance, setBalance] = useState(0);
    const [bet, setBet] = useState(10);
    const [result, setResult] = useState('');
    const [reels, setReels] = useState(Array(9).fill('start'));
    const icons = ['banana', 'seven', 'cherry', 'plum', 'orange', 'bell', 'bar', 'lemon', 'melon'];

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/zaloguj");
            return;
        }
        const user = JSON.parse(storedUser);
        setBalance(user.balance);
    }, [navigate]);

    const rollReels = () => {
        return new Promise(resolve => {
            const newReels = reels.map(() => icons[Math.floor(Math.random() * icons.length)]);
            setReels(newReels);
            setTimeout(() => resolve(newReels), 1000);
        });
    };

    const spin = async () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/zaloguj");
            return;
        }

        if (bet <= 0 || bet > balance) {
            alert('Wprowadź poprawną stawkę.');
            return;
        }

        setResult('');
        setBalance(prev => {
            const newBalance = prev - bet;
            updateUserBalance(newBalance);
            return newBalance;
        });

        const newResults = await rollReels();

        const winningLines = checkWin(newResults);
        if (winningLines.length > 0) {
            setBalance(prev => {
                const newBalance = prev + bet * 2;
                updateUserBalance(newBalance);
                return newBalance;
            });
            setResult('MEGA BIG WIN!');
        } else {
            setResult('Spróbuj ponownie!');
        }
    };

    const checkWin = (results) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];

        return lines.filter(line => {
            const [a, b, c] = line;
            return results[a] === results[b] && results[b] === results[c];
        });
    };

    const updateUserBalance = async (newBalance) => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);

            // Aktualizacja localStorage
            user.balance = newBalance;
            localStorage.setItem("user", JSON.stringify(user));

            // Wysyłanie aktualizacji do backendu
            try {
                const response = await fetch("http://localhost:5000/api/user/update-balance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ socialId: user.socialId, balance: newBalance })
                });

                const data = await response.json();
                if (!response.ok) {
                    console.error("Błąd aktualizacji salda:", data.error || "Nieznany błąd");
                }
            } catch (error) {
                console.error("Błąd połączenia z serwerem:", error);
            }
        }

};

    return (
        <div className={`game-container ${result === 'MEGA BIG WIN!' ? 'flash-border' : ''}`}>
            <img src={logo} alt="logo" width={300}/>
            <div className="slots">
                {reels.map((icon, index) => (
                    <div
                        key={index}
                        className="reel"
                        style={{
                            backgroundImage: `url('https://assets.codepen.io/439000/slotreel.webp')`,
                            backgroundPositionY: icon === 'start' ? '0' : `${icons.indexOf(icon) * -80}px`,
                            transition: 'background-position 1s ease'
                        }}
                    ></div>
                ))}
            </div>

            <div className="stats">
                <p>Saldo: <span>{balance}</span> zł</p>
                <p><input type="number" value={bet} min="1" max="100" step="1" onChange={(e) => setBet(Number(e.target.value))} /> zł</p>
            </div>

            <div className="controls">
                <button onClick={spin}>Zakręć</button>
            </div>

            <p className={result === 'MEGA BIG WIN!' ? 'mega-win' : 'win'}>{result}</p>
        </div>
    );
};

export default SlotMachine;
