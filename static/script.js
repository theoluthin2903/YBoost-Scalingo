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

    const generateTraditionalCard = () => {
        const getU = (c, min, max) => {
            let s = new Set();
            while(s.size < c) s.add(Math.floor(Math.random()*(max-min+1))+min);
            return Array.from(s);
        };
        let c = Array(25).fill(0);
        let b=getU(5,1,15), i=getU(5,16,30), n=getU(4,31,45), g=getU(5,46,60), o=getU(5,61,75);
        for(let r=0; r<5; r++){
            c[r*5+0]=b[r]; c[r*5+1]=i[r]; c[r*5+3]=g[r]; c[r*5+4]=o[r];
            if(r<2) c[r*5+2]=n[r]; else if(r===2) c[r*5+2]="FREE"; else c[r*5+2]=n[r-1];
        }
        return c;
    };

    const createCell = (v, i, p) => {
        const div = document.createElement('div');
        div.className = 'cell';
        if(v === "FREE") { div.classList.add('free', 'marked'); div.innerText = "⭐"; }
        else div.innerText = v;
        div.addEventListener('click', () => handleMark(i, p));
        return div;
    };

    const renderGrids = () => {
        grid1El.innerHTML = ''; grid2El.innerHTML = '';
        board1.forEach((v, i) => grid1El.appendChild(createCell(v, i, 1)));
        board2.forEach((v, i) => grid2El.appendChild(createCell(v, i, 2)));
    };

    const drawNumber = () => {
        if (!gameActive) return;
        const oubli = (b, m) => b.some((v, i) => v === currentDrawnNumber && !m[i]);
        if (oubli(board1, marked1) || oubli(board2, marked2)) {
            statusMsg.innerText = "⚠️ Quelqu'un a oublié de cocher !";
            drawBtn.classList.add('error-shake');
            setTimeout(() => drawBtn.classList.remove('error-shake'), 400);
            return;
        }

        if (drawnNumbersHistory.length >= 75) return;
        let n; do { n = Math.floor(Math.random() * 75) + 1; } while (drawnNumbersHistory.includes(n));
        currentDrawnNumber = n;
        drawnNumbersHistory.push(n);
        
        const L = (n) => n<=15?'B':n<=30?'I':n<=45?'N':n<=60?'G':'O';
        letSpan.innerText = L(n); numSpan.innerText = n;
        statusMsg.innerText = `${L(n)}-${n} !`;

        Array.from(calledListEl.children).forEach(b => b.classList.remove('latest'));
        const mb = document.createElement('div');
        mb.className = 'mini-ball latest';
        mb.innerHTML = `<span>${L(n)}</span><span>${n}</span>`;
        calledListEl.prepend(mb);
    };

    const handleMark = (index, player) => {
    if (!gameActive || currentDrawnNumber === null) return;
    
    const b1 = board1[index];
    const b2 = board2[index];

    if (player === 1 && b1 === currentDrawnNumber && !marked1[index]) {
        marked1[index] = true;
        grid1El.children[index].classList.add('marked');
    }

    if (player === 2 && b2 === currentDrawnNumber && !marked2[index]) {
        marked2[index] = true;
        grid2El.children[index].classList.add('marked');
    }

    checkAllWinners();
};

    const checkAllWinners = () => {
        const winsP1 = winConditions.filter(cond => cond.every(idx => marked1[idx]));
        const winsP2 = winConditions.filter(cond => cond.every(idx => marked2[idx]));

        const p1HasBingo = winsP1.length > 0;
        const p2HasBingo = winsP2.length > 0;

        if (p1HasBingo || p2HasBingo) {
            gameActive = false;

            if (p1HasBingo) {
                const cells1 = grid1El.querySelectorAll('.cell');
                winsP1.forEach(line => line.forEach(idx => cells1[idx].classList.add('win')));
            }
            if (p2HasBingo) {
                const cells2 = grid2El.querySelectorAll('.cell');
                winsP2.forEach(line => line.forEach(idx => cells2[idx].classList.add('win')));
            }

            if (p1HasBingo && p2HasBingo) {
                statusMsg.innerText = "🤝 ÉGALITÉ ! Les deux ont BINGO !";
                scoreP1++; scoreP2++;
            } else if (p1HasBingo) {
                statusMsg.innerText = "BINGO J1 !";
                scoreP1++;
            } else if (p2HasBingo) {
                statusMsg.innerText = "BINGO J2 !";
                scoreP2++;
            }

            scoreP1El.innerText = scoreP1;
            scoreP2El.innerText = scoreP2;
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
        }
    };

    const resetGame = () => {
        gameActive = true; currentDrawnNumber = null; drawnNumbersHistory = [];
        marked1 = Array(25).fill(false); marked2 = Array(25).fill(false);
        marked1[12] = true; marked2[12] = true;
        numSpan.innerText = "?"; letSpan.innerText = ""; calledListEl.innerHTML = '';
        statusMsg.innerText = "Prêt ?";
        board1 = generateTraditionalCard(); board2 = generateTraditionalCard();
        renderGrids();
    };

    drawBtn.addEventListener('click', drawNumber);
    document.getElementById('reset-button').addEventListener('click', resetGame);
    resetGame();
});