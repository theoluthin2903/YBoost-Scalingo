document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');

    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(savedTheme + '-mode');

    if (themeSwitcher) {
        if (savedTheme === 'light') {
            themeSwitcher.textContent = '🌙 Mode Sombre';
        } else {
            themeSwitcher.textContent = '☀️ Mode Clair';
        }

        themeSwitcher.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.classList.remove(currentTheme + '-mode');
            document.body.classList.add(newTheme + '-mode');
            
            localStorage.setItem('theme', newTheme);

            if (newTheme === 'light') {
                themeSwitcher.textContent = '🌙 Mode Sombre';
            } else {
                themeSwitcher.textContent = '☀️ Mode Clair';
            }
        });
    }
const morpionGrid = document.getElementById('morpion-grid');
    if (morpionGrid) { 
        
        const cells = document.querySelectorAll('.morpion-grid .cell');
        const statusMessage = document.getElementById('status-message');
        const currentPlayerSpan = document.getElementById('current-player');
        const resetButton = document.getElementById('reset-button');
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]
        ];

        let board = ["", "", "", "", "", "", "", "", ""];
        const humanPlayer = "X";
        const aiPlayer = "O";
        let currentPlayer = humanPlayer;
        let gameActive = true;
        const AIMOVE_DELAY = 500;

        const updateStatus = (message) => {
            if(statusMessage) {
                statusMessage.innerHTML = message;
            }
        };

        const checkWinner = () => {
            let roundWon = false;
            let winningCells = [];

            for (let i = 0; i < winConditions.length; i++) {
                const [a, b, c] = winConditions[i];
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    roundWon = true;
                    winningCells = [a, b, c];
                    break;
                }
            }

            if (roundWon) {
                gameActive = false;
                const winnerName = (board[winningCells[0]] === humanPlayer) ? "Théo" : "L'ordinateur";
                updateStatus(`${winnerName} a <span style="color: #ffcc00; text-shadow: 0 0 5px #ffcc00;">Gagné</span> !`);
                
                winningCells.forEach(index => {
                    cells[index].classList.add('win');
                });
                return true;
            }

            if (!board.includes("")) {
                gameActive = false;
                updateStatus(`Égalité !`);
                return true;
            }
            
            return false;
        };
        const getBestMove = () => {
            const findThreatMove = (p) => {
                for (let i = 0; i < winConditions.length; i++) {
                    const [a, b, c] = winConditions[i];
                    if (board[a] === p && board[b] === p && board[c] === "") return c;
                    if (board[a] === p && board[c] === p && board[b] === "") return b;
                    if (board[b] === p && board[c] === p && board[a] === "") return a;
                }
                return -1;
            };
            
            let winningMove = findThreatMove(aiPlayer);
            if (winningMove !== -1) return winningMove;

            let blockingMove = findThreatMove(humanPlayer);
            if (blockingMove !== -1) return blockingMove;

            if (board[4] === "") return 4;

            const corners = [0, 2, 6, 8].filter(i => board[i] === "");
            if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

            const sides = [1, 3, 5, 7].filter(i => board[i] === "");
            if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];

            return -1; 
        };
        const makeAIMove = () => {
            if (!gameActive || currentPlayer !== aiPlayer) return;

            gameActive = false;

            setTimeout(() => {
                const moveIndex = getBestMove();
                
                if (moveIndex !== -1) {
                    board[moveIndex] = aiPlayer;
                    const cell = cells[moveIndex];
                    cell.setAttribute('data-content', aiPlayer);
                    cell.classList.add(aiPlayer.toLowerCase());
                    if (!checkWinner()) {
                        currentPlayer = humanPlayer;
                        if (currentPlayerSpan) currentPlayerSpan.textContent = humanPlayer;
                        updateStatus(`À vous de jouer, Théo !`);
                        gameActive = true;
                    }
                }
            }, AIMOVE_DELAY);
        };
        const handlePlay = (cellIndex) => {
            if (board[cellIndex] !== "" || !gameActive || currentPlayer !== humanPlayer) {
                return;
            }

            board[cellIndex] = humanPlayer;
            const cell = cells[cellIndex];
            cell.setAttribute('data-content', humanPlayer);
            cell.classList.add(humanPlayer.toLowerCase());
            if (!checkWinner()) {
                currentPlayer = aiPlayer;
                if (currentPlayerSpan) currentPlayerSpan.textContent = aiPlayer;
                updateStatus(`L'ordinateur (${aiPlayer}) réfléchit...`);
                makeAIMove();
            }
        };
        const resetGame = () => {
            board = ["", "", "", "", "", "", "", "", ""];
            currentPlayer = humanPlayer; 
            gameActive = true;
            
            cells.forEach(cell => {
                cell.setAttribute('data-content', "");
                cell.classList.remove('x', 'o', 'win');
            });

            if (currentPlayerSpan) {
                currentPlayerSpan.textContent = currentPlayer;
            }
            updateStatus(`Début du jeu. C'est à vous, Théo !`);
        };
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.getAttribute('data-index'));
                handlePlay(index);
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'r' || event.key === 'R') {
                resetGame();
                return; 
            }
            if (!gameActive || currentPlayer !== humanPlayer) return; 

            
            const codeToDataKey = {
                'Numpad7': '7', 'Numpad8': '8', 'Numpad9': '9',
                'Numpad4': '4', 'Numpad5': '5', 'Numpad6': '6',
                'Numpad1': '1', 'Numpad2': '2', 'Numpad3': '3',
                'Digit7': '7', 'Digit8': '8', 'Digit9': '9',
                'Digit4': '4', 'Digit5': '5', 'Digit6': '6',
                'Digit1': '1', 'Digit2': '2', 'Digit3': '3'
            };

            const cellKey = codeToDataKey[event.code];
            
            if (cellKey) {
                const targetCell = document.querySelector(`.morpion-grid .cell[data-key="${cellKey}"]`);
                
                if (targetCell) {
                    const index = parseInt(targetCell.getAttribute('data-index'));
                    handlePlay(index);
                }
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', resetGame);
        }

        resetGame();
    }
});