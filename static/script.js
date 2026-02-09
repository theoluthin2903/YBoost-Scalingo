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

    const grid1El = document.getElementById('grid-p1');
    const grid2El = document.getElementById('grid-p2');
    const drawBtn = document.getElementById('draw-button');
    const numSpan = document.getElementById('number-span');
    const letSpan = document.getElementById('letter-span');
    const statusMsg = document.getElementById('status-message');
    const scoreP1El = document.getElementById('score-p1');
    const scoreP2El = document.getElementById('score-p2');
    const calledListEl = document.getElementById('called-numbers-list');

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

    const generateTraditionalCard = () => {
        let card = Array(25).fill(0);
        let b = getUniqueRandoms(5, 1, 15);
        let i = getUniqueRandoms(5, 16, 30);
        let n = getUniqueRandoms(4, 31, 45);
        let g = getUniqueRandoms(5, 46, 60);
        let o = getUniqueRandoms(5, 61, 75);

        for(let r = 0; r < 5; r++) {
            card[r*5 + 0] = b[r];
            card[r*5 + 1] = i[r];
            if (r < 2) card[r*5 + 2] = n[r];
            else if (r === 2) card[r*5 + 2] = "FREE";
            else card[r*5 + 2] = n[r-1];
            card[r*5 + 3] = g[r];
            card[r*5 + 4] = o[r];
        }
        return card;
    };

    const renderGrids = () => {
        grid1El.innerHTML = ''; grid2El.innerHTML = '';
        board1.forEach((v, i) => grid1El.appendChild(createCell(v, i, 1)));
        board2.forEach((v, i) => grid2El.appendChild(createCell(v, i, 2)));
    };

    const createCell = (val, index, player) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (val === "FREE") {
            cell.classList.add('free', 'marked');
            cell.innerText = "⭐";
        } else {
            cell.innerText = val;
        }
        cell.addEventListener('click', () => handleMark(index, player));
        return cell;
    };

    const getLetter = (n) => {
        if(n<=15) return 'B'; if(n<=30) return 'I'; if(n<=45) return 'N'; if(n<=60) return 'G'; return 'O';
    };

    const drawNumber = () => {
        if (!gameActive) return;
        const checkOubli = (board, marked) => board.some((v, i) => v === currentDrawnNumber && !marked[i]);
        if (checkOubli(board1, marked1) || checkOubli(board2, marked2)) {
            statusMsg.innerText = "⚠️ Quelqu'un a oublié de cocher !";
            drawBtn.classList.add('error-shake');
            setTimeout(() => drawBtn.classList.remove('error-shake'), 400);
            return;
        }

        if (drawnNumbersHistory.length >= 75) { statusMsg.innerText = "Toutes les boules sont sorties !"; return; }

        let n;
        do { n = Math.floor(Math.random() * 75) + 1; } while (drawnNumbersHistory.includes(n));

        currentDrawnNumber = n;
        drawnNumbersHistory.push(n);
        
        letSpan.innerText = getLetter(n);
        numSpan.innerText = n;
        statusMsg.innerText = `${getLetter(n)}-${n} !`;

        Array.from(calledListEl.children).forEach(b => b.classList.remove('latest'));
        const miniBall = document.createElement('div');
        miniBall.className = 'mini-ball latest';
        miniBall.innerHTML = `<span class="ball-letter">${getLetter(n)}</span><span>${n}</span>`;
        calledListEl.prepend(miniBall);
    };

    const handleMark = (index, player) => {
        if (!gameActive || currentDrawnNumber === null) return;
        const board = (player === 1) ? board1 : board2;
        const marked = (player === 1) ? marked1 : marked2;
        const grid = (player === 1) ? grid1El : grid2El;

        if (board[index] === currentDrawnNumber && !marked[index]) {
            marked[index] = true;
            grid.children[index].classList.add('marked');
            checkWinner(player);
        }
    };

    const checkWinner = (player) => {
        const marked = (player === 1) ? marked1 : marked2;
        const grid = (player === 1) ? grid1El : grid2El;
        const win = winConditions.find(cond => cond.every(idx => marked[idx]));

        if (win) {
            gameActive = false;
            win.forEach(i => grid.children[i].classList.add('win'));
            if (player === 1) { scoreP1++; scoreP1El.innerText = scoreP1; statusMsg.innerText = "BINGO ! Victoire J1 !"; }
            else { scoreP2++; scoreP2El.innerText = scoreP2; statusMsg.innerText = "BINGO ! Victoire J2 !"; }
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
        }
    };

    const resetGame = () => {
        gameActive = true; currentDrawnNumber = null; drawnNumbersHistory = [];
        marked1 = Array(25).fill(false); marked2 = Array(25).fill(false);
        marked1[12] = true; marked2[12] = true;
        numSpan.innerText = "?"; letSpan.innerText = "";
        calledListEl.innerHTML = '';
        statusMsg.innerText = "Nouvelle partie !";
        board1 = generateTraditionalCard();
        board2 = generateTraditionalCard();
        renderGrids();
    };

    drawBtn.addEventListener('click', drawNumber);
    document.getElementById('reset-button').addEventListener('click', resetGame);
    window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() === 'r') resetGame(); });
    resetGame();
});