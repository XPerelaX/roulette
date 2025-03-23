import React, { useState, useEffect } from "react";
import logo from "../../assets/spin_dzordzo.png";
import './blackjack.css'
import {useNavigate} from "react-router-dom";
const Blackjack = () => {
    const [deck, setDeck] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [yourCards, setYourCards] = useState([]);
    const [hiddenCard, setHiddenCard] = useState(null);
    const [dealerSum, setDealerSum] = useState(0);
    const [yourSum, setYourSum] = useState(0);
    const [dealerAceCount, setDealerAceCount] = useState(0);
    const [yourAceCount, setYourAceCount] = useState(0);
    const [canHit, setCanHit] = useState(false);
    const [message, setMessage] = useState("");

    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(10);
    const [gameStarted, setGameStarted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBalance = async () => {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                navigate("/zaloguj");
                return;
            }
            const user = JSON.parse(storedUser);
            try {
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

        const user = JSON.parse(storedUser);
        const newBalance = user.balance + amountChange;

        user.balance = newBalance;
        localStorage.setItem("user", JSON.stringify(user));
        setBalance(newBalance);

        try {
            const response = await fetch("http://localhost:5000/api/user/update-balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ socialId: user.socialId, balance: newBalance })
            });

            if (!response.ok) {
                console.error("Błąd aktualizacji salda");
            }
        } catch (error) {
            console.error("Błąd połączenia z serwerem:", error);
        }
    };


    const buildDeck = () => {
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        let types = ["C", "D", "H", "S"];
        let newDeck = [];
        for (let type of types) {
            for (let value of values) {
                newDeck.push(`${value}-${type}`);
            }
        }
        return newDeck;
    };

    const shuffleDeck = (deck) => {
        return deck.sort(() => Math.random() - 0.5);
    };

    const startGame = () => {
        if (bet <= 0 || bet > balance) {
            alert("Wprowadź poprawną stawkę.");
            return;
        }

        setBalance(prev => prev - bet);
        setMessage("");
        setCanHit(true);
        setGameStarted(true);

        let newDeck = shuffleDeck(buildDeck());
        let tempDeck = [...newDeck];

        let hidden = tempDeck.pop();
        setHiddenCard(hidden);

        let dealerHand = [hidden];
        let yourHand = [tempDeck.pop(), tempDeck.pop()];

        let dealerValue = getValue(hidden);
        let yourValue = yourHand.reduce((acc, card) => acc + getValue(card), 0);
        let dealerAces = checkAce(hidden);
        let yourAces = yourHand.reduce((acc, card) => acc + checkAce(card), 0);

        setDeck(tempDeck);
        setDealerCards(dealerHand);
        setYourCards(yourHand);
        setDealerSum(dealerValue);
        setYourSum(yourValue);
        setDealerAceCount(dealerAces);
        setYourAceCount(yourAces);
    };

    const getValue = (card) => {
        let value = card.split("-")[0];
        return isNaN(value) ? (value === "A" ? 11 : 10) : parseInt(value);
    };

    const checkAce = (card) => (card.startsWith("A") ? 1 : 0);

    const reduceAce = (sum, aceCount) => {
        while (sum > 21 && aceCount > 0) {
            sum -= 10;
            aceCount -= 1;
        }
        return sum;
    };

    const hit = () => {
        if (!canHit) return;
        let tempDeck = [...deck];
        let card = tempDeck.pop();
        let newYourCards = [...yourCards, card];
        let newYourSum = yourSum + getValue(card);
        let newYourAceCount = yourAceCount + checkAce(card);

        if (reduceAce(newYourSum, newYourAceCount) > 21) {
            setCanHit(false);
            setMessage("Przegrałeś!");
        }

        setDeck(tempDeck);
        setYourCards(newYourCards);
        setYourSum(newYourSum);
        setYourAceCount(newYourAceCount);
    };

    const stay = () => {
        let finalDealerSum = reduceAce(dealerSum, dealerAceCount);
        let finalYourSum = reduceAce(yourSum, yourAceCount);
        setCanHit(false);

        let tempDeck = [...deck];
        let tempDealerCards = [...dealerCards];
        let dealerAces = dealerAceCount;

        while (finalDealerSum < 17 && tempDeck.length > 0) {
            let card = tempDeck.pop();
            tempDealerCards.push(card);
            finalDealerSum += getValue(card);
            dealerAces += checkAce(card);
            finalDealerSum = reduceAce(finalDealerSum, dealerAces);
        }

        setDeck(tempDeck);
        setDealerCards(tempDealerCards);
        setDealerSum(finalDealerSum);
        setDealerAceCount(dealerAces);

        let result = "";
        let balanceChange = 0;

        if (finalYourSum > 21) {
            result = "Przegrałeś!";
            balanceChange = 0;  // Odejmujemy stawkę
        } else if (finalDealerSum > 21 || finalYourSum > finalDealerSum) {
            result = "Wygrałeś!";
            balanceChange = bet;  // Zysk = bet (bo zakład już jest odjęty)
        } else if (finalYourSum === finalDealerSum) {
            result = "Remis!";
            balanceChange = 0;  // Zwrot stawki, brak zmiany salda
        } else {
            result = "Przegrałeś!";
            balanceChange = 0;
        }

        updateUserBalance(balanceChange);
        setMessage(result);
    };



    const resetGame = () => {
        setDeck([]);
        setDealerCards([]);
        setYourCards([]);
        setHiddenCard(null);
        setDealerSum(0);
        setYourSum(0);
        setDealerAceCount(0);
        setYourAceCount(0);
        setCanHit(false);
        setMessage("");
        setGameStarted(false);
    };

    return (
        <div className="main">
            <img src={logo} alt="Blackjack logo" width={200} />
            <div className="stats">
                <p>Saldo: <span>{balance}</span> zł | Stawka: <input type="number" value={bet} min="1" max="{balance}" step="1" onChange={(e) => setBet(Number(e.target.value))} /> zł</p>
                <p>

                </p>
            </div>

            {!gameStarted ? (
                <button onClick={startGame}>Zagraj</button>
            ) : (
                <>
                    <h2>Krupier</h2>
                    <div id="dealer-cards">
                        {dealerCards.map((card, index) => (
                            <img
                                key={index}
                                src={index === 0 && canHit ? `/karty/BACK.png` : `/karty/${card}.png`}
                                alt={card}
                                height="175"
                                width="125"
                                style={{ margin: "1px" }}
                            />
                        ))}
                    </div>
                    <h3 id="dealer-sum">{canHit ? "?" : dealerSum}</h3>

                    <h2>Ty</h2>
                    <div id="your-cards">
                        {yourCards.map((card, index) => (
                            <img
                                key={index}
                                src={`/karty/${card}.png`}
                                alt={card}
                                height="175"
                                width="125"
                                style={{ margin: "1px" }}
                            />
                        ))}
                    </div>
                    <h3 id="your-sum">{yourSum}</h3>

                    <button onClick={hit} disabled={!canHit}>Dobierz</button>
                    <button style={{marginLeft:"25px", marginTop: "15px"}} onClick={stay} disabled={!canHit}>Trzymaj</button>
                    <h2 id="results">{message}</h2>
                    {message && <button onClick={resetGame}>Zagraj ponownie</button>}
                </>
            )}
        </div>
    );
};

export default Blackjack;

