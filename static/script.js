document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const applyTheme = (t) => {
        document.body.className = t + '-mode';
        themeSwitcher.textContent = t === 'light' ? '🌙' : '☀️';
    };
    
    applyTheme(localStorage.getItem('theme') || 'dark');

    themeSwitcher.addEventListener('click', () => {
        const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    const cells = document.querySelectorAll('.cell');
    const statusMsg = document.getElementById('status-message');
    const scoreP1El = document.getElementById('score-p1');
    const scoreP2El = document.getElementById('score-p2');
    
    let board = Array(9).fill("");
    let gameActive = true;
    let currentPlayer = "X";
    let nextStarter = "X";
    let scoreP1 = 0;
    let scoreP2 = 0;

    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]           
    ];

    const launchConfetti = () => {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4a90e2', '#ffcc00', '#ffffff']
            });
        }
    };

    const checkWinner = () => {
        let roundWon = false;
        let winningSequence = [];

        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                winningSequence = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            gameActive = false;
            winningSequence.forEach(idx => cells[idx].classList.add('win'));
            
            if (currentPlayer === "X") {
                scoreP1++;
                scoreP1El.innerText = scoreP1;
                statusMsg.innerText = "Victoire du Joueur 1!";
                nextStarter = "X";
            } else {
                scoreP2++;
                scoreP2El.innerText = scoreP2;
                statusMsg.innerText = "Victoire du Joueur 2 !";
                nextStarter = "O";
            }
            
            launchConfetti();
            return true;
        }

        if (!board.includes("")) {
            gameActive = false;
            statusMsg.innerText = "Match nul !";
            return true;
        }

        return false;
    };

    const playMove = (index) => {
        if (board[index] !== "" || !gameActive) return;

        board[index] = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());

        if (!checkWinner()) {
            currentPlayer = (currentPlayer === "X") ? "O" : "X";
            const name = (currentPlayer === "X") ? "Joueur 1" : "Joueur 2";
            statusMsg.innerText = `Au tour de : ${name} (${currentPlayer})`;
        }
    };

    const resetGame = () => {
        board = Array(9).fill("");
        gameActive = true;
        
        currentPlayer = nextStarter; 
        
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'win');
        });

        const name = (currentPlayer === "X") ? "Joueur 1" : "Joueur 2";
        statusMsg.innerText = `${name} commence la revanche !`;
    };

    cells.forEach((cell, i) => {
        cell.addEventListener('click', () => playMove(i));
    });

    document.getElementById('reset-button').addEventListener('click', resetGame);

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') {
            resetGame();
            return;
        }

        const keyMap = {
            "7": 0, "8": 1, "9": 2,
            "4": 3, "5": 4, "6": 5,
            "1": 6, "2": 7, "3": 8
        };

        if (keyMap[e.key] !== undefined) {
            playMove(keyMap[e.key]);
        }
    });
});