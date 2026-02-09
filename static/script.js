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
    const numberDisplay = document.getElementById('current-number');
    const statusMsg = document.getElementById('status-message');
    const scoreP1El = document.getElementById('score-p1');
    const scoreP2El = document.getElementById('score-p2');

    let scoreP1 = 0;
    let scoreP2 = 0;
    let currentDrawnNumber = null;
    let drawnNumbersHistory = [];
    let gameActive = true;
    let board1 = [];
    let board2 = [];
    let marked1 = Array(9).fill(false);
    let marked2 = Array(9).fill(false);

    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]        
    ];

    const getRandomNumbers = (count, max) => {
        let nums = new Set();
        while(nums.size < count) {
            nums.add(Math.floor(Math.random() * max) + 1);
        }
        return Array.from(nums);
    };

    const initGrids = () => {
        board1 = getRandomNumbers(9, 30);
        board2 = getRandomNumbers(9, 30);
        renderGrids();
    };

    const renderGrids = () => {
        grid1El.innerHTML = '';
        grid2El.innerHTML = '';
        
        board1.forEach((num, i) => {
            const cell = createCell(num, i, 1);
            grid1El.appendChild(cell);
        });

        board2.forEach((num, i) => {
            const cell = createCell(num, i, 2);
            grid2El.appendChild(cell);
        });
    };

    const createCell = (num, index, player) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.innerText = num;
        cell.addEventListener('click', () => handleMark(index, player));
        return cell;
    };

    const handleMark = (index, player) => {
        if (!gameActive || currentDrawnNumber === null) return;

        const board = (player === 1) ? board1 : board2;
        const marked = (player === 1) ? marked1 : marked2;
        const grid = (player === 1) ? grid1El : grid2El;

        if (board[index] === currentDrawnNumber && !marked[index]) {
            marked[index] = true;
            grid.children[index].classList.add('marked');
            checkWinner();
        }
    };

    const drawNumber = () => {
        if (!gameActive) return;
        if (drawnNumbersHistory.length >= 30) {
            statusMsg.innerText = "Tous les numéros ont été tirés !";
            return;
        }

        let n;
        do { n = Math.floor(Math.random() * 30) + 1; } 
        while (drawnNumbersHistory.includes(n));

        currentDrawnNumber = n;
        drawnNumbersHistory.push(n);
        numberDisplay.innerText = n;
        statusMsg.innerText = `Numéro ${n} tiré ! Cochez vos grilles.`;
    };

    const checkWinner = () => {
        const check = (marked) => {
            return winConditions.find(cond => cond.every(idx => marked[idx]));
        };

        const win1 = check(marked1);
        const win2 = check(marked2);

        if (win1 || win2) {
            gameActive = false;
            if (win1) {
                scoreP1++;
                scoreP1El.innerText = scoreP1;
                statusMsg.innerText = "Joueur 1 gagne le BINGO !";
                win1.forEach(i => grid1El.children[i].classList.add('win'));
            } else {
                scoreP2++;
                scoreP2El.innerText = scoreP2;
                statusMsg.innerText = "Joueur 2 gagne le BINGO !";
                win2.forEach(i => grid2El.children[i].classList.add('win'));
            }
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    };

    const resetGame = () => {
        gameActive = true;
        currentDrawnNumber = null;
        drawnNumbersHistory = [];
        marked1 = Array(9).fill(false);
        marked2 = Array(9).fill(false);
        numberDisplay.innerText = "?";
        statusMsg.innerText = "Nouvelle partie !";
        initGrids();
    };

    drawBtn.addEventListener('click', drawNumber);
    document.getElementById('reset-button').addEventListener('click', resetGame);
    window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() === 'r') resetGame(); });

    initGrids();
});