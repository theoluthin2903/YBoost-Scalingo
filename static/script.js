document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const applyTheme = (t) => {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(t + '-mode');
        themeSwitcher.textContent = t === 'light' ? '🌙' : '☀️';
    };
    applyTheme(savedTheme);

    themeSwitcher.addEventListener('click', () => {
        const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    const cells = document.querySelectorAll('.cell');
    const statusMsg = document.getElementById('status-message');
    const resetBtn = document.getElementById('reset-button');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let board = Array(9).fill("");
    let gameActive = true;
    
    const perfectMoveProbability = 0.5; 

    const checkWin = (b, p) => wins.some(s => s.every(i => b[i] === p));
    const isFull = (b) => !b.includes("");

    const minimax = (currBoard, depth, isMax) => {
        if (checkWin(currBoard, "O")) return 10 - depth;
        if (checkWin(currBoard, "X")) return depth - 10;
        if (isFull(currBoard)) return 0;

        if (isMax) {
            let best = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currBoard[i] === "") {
                    currBoard[i] = "O";
                    best = Math.max(best, minimax(currBoard, depth + 1, false));
                    currBoard[i] = "";
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currBoard[i] === "") {
                    currBoard[i] = "X";
                    best = Math.min(best, minimax(currBoard, depth + 1, true));
                    currBoard[i] = "";
                }
            }
            return best;
        }
    };

    const aiMove = () => {
        if (!gameActive) return;

        const emptyIndices = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        let move = -1;

        if (Math.random() < perfectMoveProbability) {
            let bestVal = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let val = minimax(board, 0, false);
                    board[i] = "";
                    if (val > bestVal) {
                        bestVal = val;
                        move = i;
                    }
                }
            }
        } else {
            move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }

        if (move !== -1) {
            board[move] = "O";
            cells[move].classList.add('o');
            if (checkWin(board, "O")) {
                gameActive = false;
                wins.find(s => s.every(i => board[i] === "O")).forEach(i => cells[i].classList.add('win'));
                statusMsg.textContent = "L'ordinateur a Gagné !";
            } else if (isFull(board)) {
                gameActive = false;
                statusMsg.textContent = "Égalité !";
            } else {
                statusMsg.textContent = "C'est à vous, Théo !";
            }
        }
    };

    const handlePlay = (i) => {
        if (board[i] !== "" || !gameActive) return;
        board[i] = "X";
        cells[i].classList.add('x');
        if (checkWin(board, "X")) {
            gameActive = false;
            statusMsg.textContent = "Théo a Gagné !";
        } else if (isFull(board)) {
            gameActive = false;
            statusMsg.textContent = "Égalité !";
        } else {
            statusMsg.textContent = "L'ordinateur réfléchit...";
            setTimeout(aiMove, 500);
        }
    };

    const reset = () => {
        board.fill("");
        gameActive = true;
        cells.forEach(c => c.classList.remove('x', 'o', 'win'));
        statusMsg.textContent = "Début du jeu. C'est à vous, Théo !";
    };

    const keyMap = {
        "Numpad7": 0, "7": 0, "Home": 0, "Numpad8": 1, "8": 1, "ArrowUp": 1,
        "Numpad9": 2, "9": 2, "PageUp": 2, "Numpad4": 3, "4": 3, "ArrowLeft": 3,
        "Numpad5": 4, "5": 4, "Clear": 4, "Numpad6": 5, "6": 5, "ArrowRight": 5,
        "Numpad1": 6, "1": 6, "End": 6, "Numpad2": 7, "2": 7, "ArrowDown": 7,
        "Numpad3": 8, "3": 8, "PageDown": 8
    };

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') reset();
        const idx = keyMap[e.code] ?? keyMap[e.key];
        if (idx !== undefined) handlePlay(idx);
    });

    cells.forEach((c, i) => c.addEventListener('click', () => handlePlay(i)));
    resetBtn.addEventListener('click', reset);
    reset();
});