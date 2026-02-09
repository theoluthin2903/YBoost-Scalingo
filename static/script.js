document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const applyTheme = (t) => { document.body.className = t + '-mode'; themeSwitcher.textContent = t === 'light' ? '🌙' : '☀️'; };
    applyTheme(localStorage.getItem('theme') || 'dark');
    themeSwitcher.addEventListener('click', () => {
        const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(next); localStorage.setItem('theme', next);
    });

    const grid1El = document.getElementById('grid-p1');
    const grid2El = document.getElementById('grid-p2');
    const drawBtn = document.getElementById('draw-button');
    const numSpan = document.getElementById('number-span');
    const letSpan = document.getElementById('letter-span');
    const statusMsg = document.getElementById('status-message');
    const scoreP1El = document.getElementById('score-p1');
    const scoreP2El = document.getElementById('score-p2');
    const calledNumbersListEl = document.getElementById('called-numbers-list');

    let scoreP1 = 0, scoreP2 = 0;
    let currentDrawnNumber = null;
    let drawnNumbersHistory = [];
    let gameActive = true;

    let board1 = [], board2 = [];
    let marked1 = Array(25).fill(false);
    let marked2 = Array(25).fill(false);

    const winConditions = [
        [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
        [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
        [0,6,12,18,24], [4,8,12,16,20]
    ];

    const getUniqueRandoms = (count, min, max) => {
        let nums = new Set();
        while(nums.size < count) nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
        return Array.from(nums);
    };

    const generateBingoCard = () => {
        let card = Array(25).fill(0);
        let b = getUniqueRandoms(5, 1, 15);
        let i = getUniqueRandoms(5, 16, 30);
        let n = getUniqueRandoms(4, 31, 45);
        let g = getUniqueRandoms(5, 46, 60);
        let o = getUniqueRandoms(5, 61, 75);

        for(let row = 0; row < 5; row++) {
            card[row*5 + 0] = b[row];
            card[row*5 + 1] = i[row];
            if (row < 2) card[row*5 + 2] = n[row];
            else if (row > 2) card[row*5 + 2] = n[row-1];
            card[row*5 + 3] = g[row];
            card[row*5 + 4] = o[row];
        }
        card[12] = "FREE";
        return card;
    };

    const initGrids = () => {
        board1 = generateBingoCard(); board2 = generateBingoCard();
        marked1[12] = true; marked2[12] = true;
        renderGrids();
    };

    const renderGrids = () => {
        grid1El.innerHTML = ''; grid2El.innerHTML = '';
        board1.forEach((val, idx) => grid1El.appendChild(createCell(val, idx, 1)));
        board2.forEach((val, idx) => grid2El.appendChild(createCell(val, idx, 2)));
    };

    const createCell = (val, index, player) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (val === "FREE") { cell.classList.add('free', 'marked'); cell.innerText = "⭐"; }
        else { cell.innerText = val; }
        cell.addEventListener('click', () => handleMark(index, player));
        return cell;
    };

    const getLetterForNumber = (n) => {
        if(n<=15) return 'B'; if(n<=30) return 'I'; if(n<=45) return 'N'; if(n<=60) return 'G'; return 'O';
    };

    const createMiniBall = (n, isLatest = false) => {
        const letter = getLetterForNumber(n);
        const ball = document.createElement('div');
        ball.className = `mini-ball ${isLatest ? 'latest' : ''}`;
        ball.innerHTML = `<span class="ball-letter">${letter}</span><span>${n}</span>`;
        return ball;
    };

    const drawNumber = () => {
        if (!gameActive) return;
        if (drawnNumbersHistory.length >= 75) { statusMsg.innerText = "Plus de numéros !"; return; }

        let n;
        do { n = Math.floor(Math.random() * 75) + 1; } while (drawnNumbersHistory.includes(n));

        currentDrawnNumber = n;
        drawnNumbersHistory.push(n);
        
        const letter = getLetterForNumber(n);
        letSpan.innerText = letter;
        numSpan.innerText = n;
        statusMsg.innerText = `${letter}-${n} tiré ! Vérifiez vos colonnes.`;

        const existingBalls = calledNumbersListEl.getElementsByClassName('mini-ball');
        Array.from(existingBalls).forEach(b => b.classList.remove('latest'));
        const newBall = createMiniBall(n, true);
        calledNumbersListEl.prepend(newBall);
    };

    const handleMark = (index, player) => {
        if (!gameActive) return;
        const board = player === 1 ? board1 : board2;
        const marked = player === 1 ? marked1 : marked2;
        const grid = player === 1 ? grid1El : grid2El;

        if (board[index] === currentDrawnNumber && !marked[index] && board[index] !== "FREE") {
            marked[index] = true;
            grid.children[index].classList.add('marked');
            checkWinner(player);
        }
    };

    const checkWinner = (playerLastMoved) => {
        const marked = playerLastMoved === 1 ? marked1 : marked2;
        const grid = playerLastMoved === 1 ? grid1El : grid2El;
        const winningLine = winConditions.find(cond => cond.every(idx => marked[idx]));

        if (winningLine) {
            gameActive = false;
            winningLine.forEach(idx => grid.children[idx].classList.add('win'));
            if (playerLastMoved === 1) { scoreP1++; scoreP1El.innerText = scoreP1; statusMsg.innerText = "BINGO ! Joueur 1 gagne !"; }
            else { scoreP2++; scoreP2El.innerText = scoreP2; statusMsg.innerText = "BINGO ! Joueur 2 gagne !"; }
            if (typeof confetti === 'function') confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        }
    };

    const resetGame = () => {
        gameActive = true; currentDrawnNumber = null; drawnNumbersHistory = [];
        marked1 = Array(25).fill(false); marked2 = Array(25).fill(false);
        numSpan.innerText = "?"; letSpan.innerText = "";
        statusMsg.innerText = "Nouvelle partie 5x5 !";
        calledNumbersListEl.innerHTML = '';
        initGrids();
    };

    drawBtn.addEventListener('click', drawNumber);
    document.getElementById('reset-button').addEventListener('click', resetGame);
    window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() === 'r') resetGame(); });

    initGrids();
});