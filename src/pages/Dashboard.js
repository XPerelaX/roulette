import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Upewnij się, że masz plik CSS

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="dashboard-container">
            {user ? (
                <div className="dashboard-card">
                    <h2 className="dashboard-title">Profil użytkownika</h2>
                    <div className="dashboard-info">
                        <p><strong>Imię:</strong> {user.firstName}</p>
                        <p><strong>Nazwisko:</strong> {user.lastName}</p>
                        <p><strong>PESEL:</strong> {user.socialId}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p className="balance"><strong>Saldo:</strong> {user.balance} PLN</p>
                    </div>
                    <button className="dashboard-button" onClick={() => navigate("/")}>Powrót</button>
                </div>
            ) : (
                <p className="loading-text">Ładowanie...</p>
            )}
        </div>
    );
};

export default Dashboard;