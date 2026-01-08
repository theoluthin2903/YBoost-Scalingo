document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');

    themeSwitcher.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(newTheme + '-mode');
        localStorage.setItem('theme', newTheme);
    });

    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const resetButton = document.getElementById('reset-button');
    const winConditions = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = true;

    const updateStatus = (msg) => statusMessage.textContent = msg;

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
        const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        const move = empty[Math.floor(Math.random() * empty.length)];
        if (move !== undefined) {
            board[move] = "O";
            cells[move].classList.add('o');
            if (!checkWinner()) {
                currentPlayer = "X";
                updateStatus("C'est à vous, Théo !");
            }
        }
    };

    const handlePlay = (i) => {
        if (board[i] !== "" || !gameActive || currentPlayer !== "X") return;
        board[i] = "X";
        cells[i].classList.add('x');
        if (!checkWinner()) {
            currentPlayer = "O";
            updateStatus("L'ordinateur réfléchit...");
            setTimeout(aiMove, 500);
        }
    };

    const resetGame = () => {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        gameActive = true;
        cells.forEach(c => c.classList.remove('x', 'o', 'win'));
        updateStatus("Début du jeu. C'est à vous, Théo !");
    };

    const keyMap = {
        "Numpad7": 0, "7": 0, "Home": 0,
        "Numpad8": 1, "8": 1, "ArrowUp": 1,
        "Numpad9": 2, "9": 2, "PageUp": 2,
        "Numpad4": 3, "4": 3, "ArrowLeft": 3,
        "Numpad5": 4, "5": 4, "Clear": 4,
        "Numpad6": 5, "6": 5, "ArrowRight": 5,
        "Numpad1": 6, "1": 6, "End": 6,
        "Numpad2": 7, "2": 7, "ArrowDown": 7,
        "Numpad3": 8, "3": 8, "PageDown": 8
    };

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') resetGame();
        const index = keyMap[e.code] ?? keyMap[e.key];
        if (index !== undefined) handlePlay(index);
    });

    cells.forEach((cell, i) => cell.addEventListener('click', () => handlePlay(i)));
    resetButton.addEventListener('click', resetGame);
    resetGame();
});