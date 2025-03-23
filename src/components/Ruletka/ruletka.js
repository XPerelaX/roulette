import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ruletka.css';

const numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];
const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const numberBlocksArray = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
const redBlocksArray = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const bo3BlocksArray = ['1 to 12', '13 to 24', '25 to 36'];
const otoBlocksArray = ['EVEN', 'RED', 'BLACK', 'ODD'];
const chipValuesArray = [1, 5, 10, 100, 'clear'];
const bbtopBlocksArray = ['1 to 18', '19 to 36'];

function Roulette() {
    const [bankValue, setBankValue] = useState(1000);
    const [currentBet, setCurrentBet] = useState(0);
    const [wager, setWager] = useState(5);
    const [lastWager, setLastWager] = useState(0);
    const [bet, setBetState] = useState([]);
    const [numbersBet, setNumbersBet] = useState([]);
    const [previousNumbers, setPreviousNumbers] = useState([]);
    const [notification, setNotification] = useState(null);
    const [spinButton, setSpinButton] = useState(false);
    const [wheelSpinning, setWheelSpinning] = useState(false);
    const [ballSpinning, setBallSpinning] = useState(false);
    const [ballStopAnimation, setBallStopAnimation] = useState(false);
    const [winningNumberDisplay, setWinningNumberDisplay] = useState(null);
    const [balance, setBalance] = useState(0);

    const pnContentRef = useRef(null);
    const wheelRef = useRef(null);
    const ballTrackRef = useRef(null);
    const bettingBoardRef = useRef(null);
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
        startGame();
    }, [navigate]);

    const updateUserBalance = async (amountChange) => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const user = JSON.parse(storedUser);
        const newBalance = balance + amountChange;

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

    const resetGame = () => {
        setBankValue(1000);
        setCurrentBet(0);
        setWager(5);
        setBetState([]);
        setNumbersBet([]);
        setPreviousNumbers([]);
        setNotification(null);
        setSpinButton(false);
        setWinningNumberDisplay(null);
        removeBettingBoard();
        buildBettingBoard();
    };

    const removeBettingBoard = () => {
        const bettingBoardElement = document.getElementById('betting_board');
        if (bettingBoardElement) {
            bettingBoardElement.remove();
        }
        const notificationElement = document.getElementById('notification');
        if (notificationElement) {
            notificationElement.remove();
        }
    };

    const startGame = () => {
        buildWheel();
        buildBettingBoard();
    };

    const gameOver = () => {
        setNotification(
            <div id='notification'>
                <span className='nSpan'>Bankrupt</span>
                <div className='nBtn' onClick={resetGame}>Play again</div>
            </div>
        );
    };

    const buildWheel = () => {
        return (
            <div className='wheel' ref={wheelRef}>
                <div className='outerRim'></div>
                {wheelNumbers.map((number, i) => {
                    const a = i + 1;
                    const spanClass = (number < 10) ? 'single' : 'double';
                    return (
                        <div key={`sect-${a}`} id={`sect${a}`} className='sect'>
                            <span className={spanClass}>{number}</span>
                            <div className='block'></div>
                        </div>
                    );
                })}
                <div className='pocketsRim'></div>
                <div className='ballTrack' ref={ballTrackRef}>
                    <div className='ball'></div>
                </div>
                <div className='pockets'></div>
                <div className='cone'></div>
                <div className='turret'></div>
                <div className='turretHandle'>
                    <div className='thendOne'></div>
                    <div className='thendTwo'></div>
                </div>
            </div>
        );
    };

    const buildBettingBoard = () => {
        return (
            <div id='betting_board' ref={bettingBoardRef}>
                <div className='winning_lines'>
                    <div id='wlttb_top' className='wlttb'>
                        {Array.from({ length: 11 }).map((_, i) => {
                            const j = i;
                            const numA = (1 + (3 * j));
                            const numB = (2 + (3 * j));
                            const numC = (3 + (3 * j));
                            const numD = (4 + (3 * j));
                            const numE = (5 + (3 * j));
                            const numF = (6 + (3 * j));
                            const num = `${numA}, ${numB}, ${numC}, ${numD}, ${numE}, ${numF}`;
                            const objType = 'double_street';
                            return (
                                <div key={`wlttb_top-${i}`} className='ttbbetblock' onClick={(e) => setBet(e.currentTarget, num, objType, 5)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, objType, 5); }}></div>
                            );
                        })}
                    </div>
                    {Array.from({ length: 3 }).map((_, c) => {
                        const d = c + 1;
                        return (
                            <div key={`wlttb_${d}`} id={`wlttb_${d}`} className='wlttb'>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const j = i;
                                    let num, objType, odd;
                                    if (d === 1 || d === 2) {
                                        const numA = ((2 - (d - 1)) + (3 * j));
                                        const numB = ((3 - (d - 1)) + (3 * j));
                                        num = `${numA}, ${numB}`;
                                        objType = 'split';
                                        odd = 17;
                                    } else {
                                        const numA = (1 + (3 * j));
                                        const numB = (2 + (3 * j));
                                        const numC = (3 + (3 * j));
                                        num = `${numA}, ${numB}, ${numC}`;
                                        objType = 'street';
                                        odd = 11;
                                    }
                                    return (
                                        <div key={`wlttb_${d}-${i}`} className='ttbbetblock' onClick={(e) => setBet(e.currentTarget, num, objType, odd)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, objType, odd); }}></div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    {Array.from({ length: 11 }).map((_, c) => {
                        const d = c + 1;
                        return (
                            <div key={`wlrtl_${d}`} id={`wlrtl_${d}`} className='wlrtl'>
                                {Array.from({ length: 3 }).map((_, i) => {
                                    const j = i + 1;
                                    const numA = (3 + (3 * (d - 1))) - (j - 1);
                                    const numB = (6 + (3 * (d - 1))) - (j - 1);
                                    const num = `${numA}, ${numB}`;
                                    return (
                                        <div key={`wlrtl_${d}-${i}`} className={`rtlbb${i + 1}`} onClick={(e) => setBet(e.currentTarget, num, 'split', 17)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, 'split', 17); }}></div>
                                    );
                                })}
                            </div>
                        );
                    })}
                    {Array.from({ length: 2 }).map((_, c) => {
                        return (
                            <div key={`wlcb_${c + 1}`} id={`wlcb_${c + 1}`} className='wlcb'>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const count = (c === 0) ? i + 1 : i + 12;
                                    const numA = '2';
                                    const numB = '3';
                                    const numC = '5';
                                    const numD = '6';
                                    const num = (count >= 1 && count < 12) ? `${parseInt(numA) + ((count - 1) * 3)}, ${parseInt(numB) + ((count - 1) * 3)}, ${parseInt(numC) + ((count - 1) * 3)}, ${parseInt(numD) + ((count - 1) * 3)}` : `${(parseInt(numA) - 1) + ((count - 12) * 3)}, ${(parseInt(numB) - 1) + ((count - 12) * 3)}, ${(parseInt(numC) - 1) + ((count - 12) * 3)}, ${(parseInt(numD) - 1) + ((count - 12) * 3)}`;
                                    const objType = 'corner_bet';
                                    return (
                                        <div key={`wlcb_${c + 1}-${i}`} id={`cbbb_${count}`} className='cbbb' onClick={(e) => setBet(e.currentTarget, num, objType, 8)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, objType, 8); }}></div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <div className='bbtop'>
                    {bbtopBlocksArray.map((block, i) => {
                        const f = i;
                        const num = (f === 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
                        const objType = (f === 0) ? 'outside_low' : 'outside_high';
                        return (
                            <div key={`bbtop-${i}`} className='bbtoptwo' onClick={(e) => setBet(e.currentTarget, num, objType, 1)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, objType, 1); }}>
                                {block}
                            </div>
                        );
                    })}
                </div>

                <div className='number_board'>
                    <div className='number_0' onClick={(e) => setBet(e.currentTarget, '0', 'zero', 35)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, '0', 'zero', 35); }}>
                        <div className='nbn'>0</div>
                    </div>
                    {numberBlocksArray.map((block, i) => {
                        const a = i;
                        const nbClass = (block === '2 to 1') ? 'tt1_block' : 'number_block';
                        const colourClass = (redBlocksArray.includes(block)) ? ' redNum' : ((nbClass === 'number_block') ? ' blackNum' : '');
                        let num, objType, odds;
                        if (block !== '2 to 1') {
                            num = '' + block + '';
                            objType = 'inside_whole';
                            odds = 35;
                        } else {
                            num = (a === 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a === 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
                            objType = 'outside_column';
                            odds = 2;
                        }
                        return (
                            <div key={`number_block-${i}`} className={`${nbClass}${colourClass}`} onClick={(e) => setBet(e.currentTarget, num, objType, odds)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, objType, odds); }}>
                                <div className='nbn'>{block}</div>
                            </div>
                        );
                    })}
                </div>

                <div className='bo3_board'>
                    {bo3BlocksArray.map((block, i) => {
                        const b = i;
                        let num;
                        if (b === 0) num = '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12';
                        else if (b === 1) num = '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24';
                        else num = '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
                        return (
                            <div key={`bo3_block-${i}`} className='bo3_block' onClick={(e) => setBet(e.currentTarget, num, 'outside_dozen', 2)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, 'outside_dozen', 2); }}>
                                {block}
                            </div>
                        );
                    })}
                </div>

                <div className='oto_board'>
                    {otoBlocksArray.map((block, i) => {
                        const d = i;
                        const colourClass = (block === 'RED') ? ' redNum' : ((block === 'BLACK') ? ' blackNum' : '');
                        let num;
                        if (d === 0) num = '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36';
                        if (d === 1) num = '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36';
                        else if (d === 2) num = '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35';
                        else num = '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35';
                        return (
                            <div key={`oto_block-${i}`} className={`oto_block${colourClass}`} onClick={(e) => setBet(e.currentTarget, num, 'outside_oerb', 1)} onContextMenu={(e) => { e.preventDefault(); removeBet(e.currentTarget, num, 'outside_oerb', 1); }}>
                                {block}
                            </div>
                        );
                    })}
                </div>

                <div className='chipDeck'>
                    {chipValuesArray.map((value, i) => {
                        const cvi = i;
                        const chipColour = (i === 0) ? 'red' : ((i === 1) ? 'blue cdChipActive' : ((i === 2) ? 'orange' : ((i === 3) ? 'gold' : 'clearBet')));
                        return (
                            <div key={`chip-${i}`} className={`cdChip ${chipColour}`} onClick={() => {
                                if (cvi !== 4) {
                                    const cdChipActiveElements = document.getElementsByClassName('cdChipActive');
                                    Array.from(cdChipActiveElements).forEach(el => el.classList.remove('cdChipActive'));

                                    const activeChip = document.querySelector(`.cdChip.cdChipActive`);

                                    const clickedChip = document.querySelector(`.cdChip.${chipColour}`); // Select the chip that was just clicked
                                    if (clickedChip) {
                                        clickedChip.className = `cdChip ${chipColour} cdChipActive`; // Set the active class for the clicked chip
                                    }

                                    setWager(parseInt(value));
                                } else {
                                    clearCurrentBet();
                                    removeChipsFromBoard();
                                }
                            }}>
                                <span className='cdChipSpan'>{value}</span>
                            </div>
                        );
                    })}
                </div>

                <div className='bankContainer'>
                    <div className='bank'>
                        <span id='bankSpan'>{balance.toLocaleString("en-GB")}</span>
                    </div>
                    <div className='bet'>
                        <span id='betSpan'>{currentBet.toLocaleString("en-GB")}</span>
                    </div>
                </div>
            </div>
        );
    };

    const clearCurrentBet = () => {
        setBankValue(bankValue + currentBet);
        setCurrentBet(0);
        setBetState([]);
        setNumbersBet([]);
    };

    const setBet = (element, n, t, o) => {
        let currentWager = Math.min(wager, balance);
        if (currentWager <= 0) return;

        if (!spinButton) {
            setSpinButton(true);
        }

        setBankValue(prevBankValue => prevBankValue - currentWager);
        setCurrentBet(prevCurrentBet => prevCurrentBet + currentWager);
        setLastWager(currentWager);

        const existingBetIndex = bet.findIndex(b => b.numbers === n && b.type === t);

        if (existingBetIndex > -1) {
            const updatedBet = [...bet];
            updatedBet[existingBetIndex].amt += currentWager;
            setBetState(updatedBet);
            updateChipDisplay(element, updatedBet[existingBetIndex].amt);
        } else {
            const newBet = { amt: currentWager, type: t, odds: o, numbers: n };
            setBetState(prevBet => [...prevBet, newBet]);
            setNumbersBet(prevNumbersBet => {
                const numArray = n.split(',').map(Number);
                return [...prevNumbersBet, ...numArray.filter(num => !prevNumbersBet.includes(num))];
            });
            createChipDisplay(element, currentWager);
        }
    };

    const updateChipDisplay = (element, betAmount) => {
        const chipElement = element.querySelector('.chip');
        if (chipElement) {
            const chipColour = getChipColor(betAmount);
            chipElement.className = `chip ${chipColour}`;
            chipElement.querySelector('.chipSpan').innerText = betAmount;
        }
    };

    const createChipDisplay = (element, betAmount) => {
        if (!element.querySelector('.chip')) {
            const chipColour = getChipColor(betAmount);
            const chip = document.createElement('div');
            chip.className = `chip ${chipColour}`;
            const chipSpan = document.createElement('span');
            chipSpan.className = 'chipSpan';
            chipSpan.innerText = betAmount;
            chip.appendChild(chipSpan);
            element.appendChild(chip);
        }
    };

    const getChipColor = (amount) => {
        if (amount < 5) return 'red';
        if (amount < 10) return 'blue';
        if (amount < 100) return 'orange';
        return 'gold';
    };

    const spin = () => {
        if (balance - currentBet < 0) {
            alert("Wprowadź poprawną stawkę.");
            return;
        }
        setSpinButton(false);
        setWheelSpinning(true);
        setBallSpinning(true);
        setWinningNumberDisplay(null);

        const winningSpin = Math.floor(Math.random() * 37);
        spinWheelAnimation(winningSpin);

        setTimeout(() => {
            if (numbersBet.includes(winningSpin)) {
                let winValue = 0;
                let betTotal = 0;
                bet.forEach(currentBetItem => {
                    const numArray = currentBetItem.numbers.split(',').map(Number);
                    if (numArray.includes(winningSpin)) {
                        const winAmount = (currentBetItem.odds * currentBetItem.amt) + currentBetItem.amt;
                        updateUserBalance(winAmount);
                        winValue += winAmount;
                        betTotal += currentBetItem.amt;
                    }
                });
                winNotification(winningSpin, winValue, betTotal);
            } else {
                updateUserBalance(-currentBet);
            }

            setCurrentBet(0);
            setPreviousNumbers(prevNumbers => [...prevNumbers, winningSpin]);

            const pnClass = numRed.includes(winningSpin) ? 'pnRed' : (winningSpin === 0 ? 'pnGreen' : 'pnBlack');
            setWinningNumberDisplay(<span className={pnClass}>{winningSpin}</span>);

            setBetState([]);
            setNumbersBet([]);
            removeChipsFromBoard();
            setWager(lastWager);

            if (balance === 0 && currentBet === 0) {
                gameOver();
            }
            setWheelSpinning(false);
            setBallSpinning(false);
            setBallStopAnimation(false);

        }, 10000);
    };

    const winNotification = (winningSpin, winValue, betTotal) => {
        if (winValue > 0) {
            setNotification(
                <div id='notification'>
                    <div className='nSpan'>
                        <span className='nsnumber' style={{ color: numRed.includes(winningSpin) ? 'red' : 'black' }}>{winningSpin}</span>
                        <span className='nsTxt'> Win</span>
                        <div className='nsWin'>
                            <div className='nsWinBlock'>Bet: {betTotal}</div>
                            <div className='nsWinBlock'>Win: {winValue}</div>
                            <div className='nsWinBlock'>Payout: {winValue + betTotal}</div>
                        </div>
                    </div>
                </div>
            );

            setTimeout(() => {
                setNotification(prevNotification => {
                    return {
                        ...prevNotification,
                        props: {
                            ...prevNotification.props,
                            style: { ...prevNotification.props.style, opacity: '0' }
                        }
                    };
                });
            }, 3000);
            setTimeout(() => {
                setNotification(null);
            }, 4000);
        }
    };

    const removeBet = (element, n, t, o) => {
        let currentWager = wager === 0 ? 100 : wager;

        const betIndexToRemove = bet.findIndex(b => b.numbers === n && b.type === t);

        if (betIndexToRemove > -1) {
            const updatedBet = [...bet];
            if (updatedBet[betIndexToRemove].amt > 0) {
                currentWager = Math.min(currentWager, updatedBet[betIndexToRemove].amt);
                updatedBet[betIndexToRemove].amt -= currentWager;

                setBankValue(prevBankValue => prevBankValue + currentWager);
                setCurrentBet(prevCurrentBet => prevCurrentBet - currentWager);
                setBetState(updatedBet);

                if (updatedBet[betIndexToRemove].amt <= 0) {
                    const chipElement = element.querySelector('.chip');
                    if (chipElement) {
                        chipElement.style.display = 'none';
                    }
                } else {
                    updateChipDisplay(element, updatedBet[betIndexToRemove].amt);
                }
            }
            if (currentBet - currentWager <= 0) {
                setSpinButton(false);
            }
        }
    };

    const spinWheelAnimation = (winningSpin) => {
        let degree = 0;
        for (let i = 0; i < wheelnumbersAC.length; i++) {
            if (wheelnumbersAC[i] === winningSpin) {
                degree = (i * 9.73) + 362;
                break;
            }
        }

        if (wheelRef.current && ballTrackRef.current) {
            wheelRef.current.style.animation = 'wheelRotate 5s linear infinite';
            ballTrackRef.current.style.animation = 'ballRotate 1s linear infinite';

            setTimeout(() => {
                ballTrackRef.current.style.animation = 'ballRotate 2s linear infinite';
                const style = document.createElement('style');
                style.type = 'text/css';
                style.innerText = `@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-${degree}deg);}}`;
                document.head.appendChild(style);
            }, 2000);

            setTimeout(() => {
                setBallStopAnimation(true);
                ballTrackRef.current.style.animation = 'ballStop 3s linear';
            }, 6000);

            setTimeout(() => {
                ballTrackRef.current.style.transform = `rotate(-${degree}deg)`;
            }, 9000);

            setTimeout(() => {
                wheelRef.current.style.animation = '';
                const styleElement = document.querySelector('style[innerText*="ballStop"]');
                if (styleElement) {
                    styleElement.remove();
                }
            }, 10000);
        }
    };

    const removeChipsFromBoard = () => {
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => chip.remove());
    };

    return (
        <div id="container">
            {notification}
            {buildWheel()}
            {buildBettingBoard()}
            {spinButton && <div className='spinBtn' onClick={spin}>spin</div>}
            <div className='pnBlock'>
                <div id='pnContent' ref={pnContentRef} onWheel={(e) => { e.preventDefault(); pnContentRef.current.scrollLeft += e.deltaY; }}>
                    {previousNumbers.map((number, index) => {
                        const pnClass = numRed.includes(number) ? 'pnRed' : (number === 0 ? 'pnGreen' : 'pnBlack');
                        return <span key={index} className={pnClass}>{number}</span>;
                    })}
                    {winningNumberDisplay}
                </div>
            </div>
        </div>
    );
}

export default Roulette;
