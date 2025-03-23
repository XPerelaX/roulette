import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "../App.css";

const Header = () => {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setBalance(storedUser.balance || 0);
        } else {
            setUser(null);
            setBalance(0);
        }
    }, []); // 🔄 Wykonuje się tylko raz po załadowaniu komponentu

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        setBalance(0);
        navigate("/zaloguj");
    };

    return (
        <header className="app-header">
            <Link to="/" className="home-button">
                <FaHome size={60} />
            </Link>
            <div className="auth-buttons">
                {user ? (
                    <>
                        <span>Witaj, {user.name} | Saldo: {balance} PLN</span>
                        <button onClick={logout} className="auth-link">Wyloguj</button>
                    </>
                ) : (
                    <Link to="/zaloguj" className="auth-link">Zaloguj</Link>
                )}
            </div>
        </header>
    );
};

export default Header;
