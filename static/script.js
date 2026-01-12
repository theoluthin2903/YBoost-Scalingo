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
    const scoreHumanEl = document.getElementById('score-human');
    const scoreAiEl = document.getElementById('score-ai');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    let board = Array(9).fill("");
    let gameActive = true;
    let scoreHuman = 0;
    let scoreAi = 0;
    const aiIntelligence = 0.75;

    const getWinner = (b) => {
        for (let s of wins) {
            if (b[s[0]] && b[s[0]] === b[s[1]] && b[s[0]] === b[s[2]]) return { p: b[s[0]], s };
        }
        return null;
    };

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

    const updateScoreUI = () => {
        scoreHumanEl.textContent = scoreHuman;
        scoreAiEl.textContent = scoreAi;
    };

    const endTurn = () => {
        const result = getWinner(board);
        if (result) {
            gameActive = false;
            result.s.forEach(i => cells[i].classList.add('win'));
            if (result.p === "X") {
                scoreHuman++;
                statusMsg.textContent = "Théo a Gagné !";
            } else {
                scoreAi++;
                statusMsg.textContent = "L'ordinateur a Gagné !";
            }
            updateScoreUI();
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

    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r' || e.key === 'Enter') reset();
        const keyMap = {"7":0,"8":1,"9":2,"4":3,"5":4,"6":5,"1":6,"2":7,"3":8};
        if (keyMap[e.key] !== undefined) handlePlay(keyMap[e.key]);
    });

    cells.forEach((c, i) => c.addEventListener('click', () => handlePlay(i)));
    resetBtn.addEventListener('click', reset);
    reset();
});