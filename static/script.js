document.addEventListener('DOMContentLoaded', () => {
    // --- GESTION DU THÈME ---
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

    // --- VARIABLES DU JEU ---
    const cells = document.querySelectorAll('.cell');
    const statusMsg = document.getElementById('status-message');
    const resetBtn = document.getElementById('reset-button');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    let board = Array(9).fill("");
    let gameActive = true;
    const aiIntelligence = 0.50;

    // --- LOGIQUE DE VICTOIRE ---
    const getWinner = (b) => {
        for (let s of wins) {
            if (b[s[0]] && b[s[0]] === b[s[1]] && b[s[0]] === b[s[2]]) {
                return { p: b[s[0]], s: s };
            }
        }
        return null;
    };

    // --- ALGORITHME MINIMAX (IA IMBATTABLE) ---
    const minimax = (currBoard, depth, isMax) => {
        const res = getWinner(currBoard);
        if (res && res.p === "O") return 10 - depth;
        if (res && res.p === "X") return depth - 10;
        if (!currBoard.includes("")) return 0;

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

    // --- ACTIONS DE JEU ---
    const endTurn = () => {
        const result = getWinner(board);
        if (result) {
            gameActive = false;
            result.s.forEach(i => cells[i].classList.add('win'));
            statusMsg.textContent = result.p === "X" ? "Théo a Gagné !" : "L'ordinateur a Gagné !";
            return true;
        }
        if (!board.includes("")) {
            gameActive = false;
            statusMsg.textContent = "Égalité !";
            return true;
        }
        return false;
    };

    const aiMove = () => {
        if (!gameActive) return;
        let move = -1;
        const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);

        // Décision Aléatoire : Coup Parfait vs Coup au Hasard
        if (Math.random() < aiIntelligence) {
            let bestVal = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let val = minimax(board, 0, false);
                    board[i] = "";
                    if (val > bestVal) { bestVal = val; move = i; }
                }
            }
        } else {
            move = empty[Math.floor(Math.random() * empty.length)];
        }

        if (move !== -1) {
            board[move] = "O";
            cells[move].classList.add('o');
            if (!endTurn()) statusMsg.textContent = "C'est à vous, Théo !";
        }
    };

    const handlePlay = (i) => {
        if (board[i] !== "" || !gameActive) return;
        board[i] = "X";
        cells[i].classList.add('x');
        if (!endTurn()) {
            statusMsg.textContent = "L'ordinateur réfléchit...";
            setTimeout(aiMove, 600);
        }
    };

    const reset = () => {
        board.fill("");
        gameActive = true;
        cells.forEach(c => c.classList.remove('x', 'o', 'win'));
        statusMsg.textContent = "C'est à vous, Théo !";
    };

    // --- CONTRÔLES (CLAVIER & PAVÉ TACTILE) ---
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
        if (e.key.toLowerCase() === 'r') reset();
        const idx = keyMap[e.code] ?? keyMap[e.key];
        if (idx !== undefined) handlePlay(idx);
    });

    cells.forEach((c, i) => c.addEventListener('click', () => handlePlay(i)));
    resetBtn.addEventListener('click', reset);
    reset();
});