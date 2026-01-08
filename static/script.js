document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.body.classList.add(savedTheme + '-mode');
    if (themeSwitcher) {
        themeSwitcher.textContent = savedTheme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair';
        themeSwitcher.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(newTheme + '-mode');
            localStorage.setItem('theme', newTheme);
            themeSwitcher.textContent = newTheme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair';
        });
    }

    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const resetButton = document.getElementById('reset-button');
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = true;

    const updateStatus = (msg) => { statusMessage.textContent = msg; };

    const checkWinner = () => {
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                gameActive = false;
                condition.forEach(i => cells[i].classList.add('win'));
                updateStatus(board[a] === "X" ? "Théo a Gagné !" : "L'ordinateur a Gagné !");
                return true;
            }
        }
        if (!board.includes("")) {
            gameActive = false;
            updateStatus("Égalité !");
            return true;
        }
        return false;
    };

    const aiMove = () => {
        if (!gameActive) return;
        const emptyIndices = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        const move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        if (move !== undefined) {
            board[move] = "O";
            cells[move].classList.add('o');
            if (!checkWinner()) {
                currentPlayer = "X";
                updateStatus("C'est à vous, Théo !");
            }
        }
    };

    const handleCellClick = (i) => {
        if (board[i] !== "" || !gameActive || currentPlayer !== "X") return;
        board[i] = "X";
        cells[i].classList.add('x');
        if (!checkWinner()) {
            currentPlayer = "O";
            updateStatus("L'ordinateur réfléchit...");
            setTimeout(aiMove, 600);
        }
    };

    const resetGame = () => {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        gameActive = true;
        cells.forEach(c => {
            c.classList.remove('x', 'o', 'win');
        });
        updateStatus("Début du jeu. C'est à vous, Théo !");
    };

    cells.forEach((cell, i) => cell.addEventListener('click', () => handleCellClick(i)));
    resetButton.addEventListener('click', resetGame);
    resetGame();
});