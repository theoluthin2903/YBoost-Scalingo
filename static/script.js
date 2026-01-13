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
    let scoreP1 = 0;
    let scoreP2 = 0;

    let currentPlayer = "X";
    let nextStarter = "X";

    const winConditions = [
        [0,1,2],[3,4,5],[6,7,8], [0,3,6],[1,4,7],[2,5,8], [0,4,8],[2,4,6]
    ];

    const launchConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4a90e2', '#ffcc00', '#ffffff']
        });
    };

    const checkWinner = () => {
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
                gameActive = false;
                condition.forEach(i => cells[i].classList.add('win'));
                
                if (board[a] === "X") {
                    scoreP1++;
                    scoreP1El.textContent = scoreP1;
                    statusMsg.textContent = "Victoire de Théo !";
                    nextStarter = "X";
                } else {
                    scoreP2++;
                    scoreP2El.textContent = scoreP2;
                    statusMsg.textContent = "Victoire du Joueur 2 !";
                    nextStarter = "O";
                }
                launchConfetti();
                return true;
            }
        }
        if (!board.includes("")) {
            gameActive = false;
            statusMsg.textContent = "Égalité !";
            return true;
        }
        return false;
    };

    const handleCellClick = (index) => {
        if (board[index] !== "" || !gameActive) return;

        board[index] = currentPlayer;
        cells[index].classList.add(currentPlayer.toLowerCase());

        if (!checkWinner()) {
            currentPlayer = (currentPlayer === "X") ? "O" : "X";
            updateStatusText();
        }
    };

    const updateStatusText = () => {
        const name = (currentPlayer === "X") ? "Théo" : "Joueur 2";
        statusMsg.textContent = `Au tour de : ${name} (${currentPlayer})`;
    };

    const resetGame = () => {
        board.fill("");
        gameActive = true;
        currentPlayer = nextStarter; 
        cells.forEach(cell => cell.classList.remove('x', 'o', 'win'));
        updateStatusText();
        statusMsg.textContent += " (Gagnant précédent)";
    };

    cells.forEach((cell, i) => cell.addEventListener('click', () => handleCellClick(i)));
    document.getElementById('reset-button').addEventListener('click', resetGame);
    
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') resetGame();
        const keyMap = {"7":0,"8":1,"9":2,"4":3,"5":4,"6":5,"1":6,"2":7,"3":8};
        if (keyMap[e.key] !== undefined) handleCellClick(keyMap[e.key]);
    });
});