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
    const scoreHumanEl = document.getElementById('score-human');
    const scoreAiEl = document.getElementById('score-ai');
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    let board = Array(9).fill("");
    let gameActive = true;
    let scoreHuman = 0;
    let scoreAi = 0;

    const checkWinner = (b) => {
        for (let s of wins) {
            if (b[s[0]] && b[s[0]] === b[s[1]] && b[s[0]] === b[s[2]]) return { p: b[s[0]], s };
        }
        return null;
    };

    const minimax = (currBoard, depth, isMax) => {
        const res = checkWinner(currBoard);
        if (res && res.p === "O") return 10 - depth;
        if (res && res.p === "X") return depth - 10;
        if (!currBoard.includes("")) return 0;

        let best = isMax ? -Infinity : Infinity;
        for (let i = 0; i < 9; i++) {
            if (currBoard[i] === "") {
                currBoard[i] = isMax ? "O" : "X";
                let val = minimax(currBoard, depth + 1, !isMax);
                currBoard[i] = "";
                best = isMax ? Math.max(best, val) : Math.min(best, val);
            }
        }
        return best;
    };

    const updateUI = () => {
        const result = checkWinner(board);
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
            scoreHumanEl.textContent = scoreHuman;
            scoreAiEl.textContent = scoreAi;
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
        if (Math.random() < 0.75) {
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
            const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
            move = empty[Math.floor(Math.random() * empty.length)];
        }
        board[move] = "O";
        cells[move].classList.add('o');
        if (!updateUI()) statusMsg.textContent = "C'est à vous, Théo !";
    };

    const handlePlay = (i) => {
        if (board[i] !== "" || !gameActive) return;
        board[i] = "X";
        cells[i].classList.add('x');
        if (!updateUI()) {
            statusMsg.textContent = "L'ordinateur réfléchit...";
            setTimeout(aiMove, 600);
        }
    };

    const reset = () => {
        board.fill(""); gameActive = true;
        cells.forEach(c => c.classList.remove('x', 'o', 'win'));
        statusMsg.textContent = "C'est à vous, Théo !";
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key.toLowerCase() === 'r') reset();
        const keyMap = {"7":0,"8":1,"9":2,"4":3,"5":4,"6":5,"1":6,"2":7,"3":8};
        if (keyMap[e.key] !== undefined) handlePlay(keyMap[e.key]);
    });

    cells.forEach((c, i) => c.addEventListener('click', () => handlePlay(i)));
    document.getElementById('reset-button').addEventListener('click', reset);
});