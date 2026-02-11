document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('theme-switcher');
    const board = document.getElementById('board');
    const statusMsg = document.getElementById('status-message');

    let dictionary = [];
    let targetWord = "";
    let currentGuess = "";
    let attempts = 0;
    const maxAttempts = 6;
    let wordLength = 0;
    let gameActive = false;
    let foundLetters = [];

    const soundCorrect = new Audio('/static/correct.mp3');

    async function loadDictionary() {
        try {
            statusMsg.innerText = "Chargement du dictionnaire...";
            const response = await fetch('/static/dictionary.csv');
            const text = await response.text();
            
            dictionary = text.split('\n')
                .map(mot => mot.trim())
                .filter(mot => mot.length >= 6 && mot.length <= 9)
                .filter(mot => /^[a-zA-Zàâäéèêëïîôöùûüç-]+$/.test(mot))
                .map(mot => mot.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase());

            dictionary = [...new Set(dictionary)];
            console.log(dictionary.length + " mots chargés !");
            initGame();
        } catch (error) {
            statusMsg.innerText = "Erreur de dictionnaire";
            console.error(error);
        }
    }

    function initGame() {
        if (dictionary.length === 0) return;
        targetWord = dictionary[Math.floor(Math.random() * dictionary.length)];
        wordLength = targetWord.length;
        attempts = 0;
        currentGuess = "";
        gameActive = true;
        foundLetters = Array(wordLength).fill(null);
        foundLetters[0] = targetWord[0];

        board.innerHTML = "";
        board.style.setProperty('--cols', wordLength);
        statusMsg.innerText = `Mot de ${wordLength} lettres`;

        for (let i = 0; i < maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < wordLength; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
            }
            board.appendChild(row);
        }
        updateDisplay();
    }

    function updateDisplay() {
        const row = board.children[attempts];
        if (!row) return;
        for (let i = 0; i < wordLength; i++) {
            const tile = row.children[i];
            if (currentGuess[i]) {
                tile.innerText = currentGuess[i];
                tile.style.opacity = "1";
            } else if (foundLetters[i]) {
                tile.innerText = foundLetters[i];
                tile.style.opacity = "0.5";
            } else {
                tile.innerText = ".";
                tile.style.opacity = "0.3";
            }
        }
    }

    function submitGuess() {
        if (!gameActive || currentGuess.length !== wordLength) return;

        if (!dictionary.includes(currentGuess)) {
            statusMsg.innerText = "MOT INCONNU";
            return;
        }

        processResult();
    }

    function processResult() {
        gameActive = false;
        const row = board.children[attempts];
        const guessArr = currentGuess.split('');
        const results = Array(wordLength).fill('absent');
        const tempTarget = targetWord.split('');
    
        guessArr.forEach((l, i) => {
            if (l === targetWord[i]) {
                results[i] = 'correct';
                foundLetters[i] = l;
                tempTarget[i] = null;
            }
        });

        guessArr.forEach((l, i) => {
            if (results[i] !== 'correct' && tempTarget.includes(l)) {
                results[i] = 'present';
                tempTarget[tempTarget.indexOf(l)] = null;
            }
        });

        guessArr.forEach((letter, i) => {
            setTimeout(() => {
                const tile = row.children[i];
                const status = results[i];
                if (status === 'correct') {
                    soundCorrect.cloneNode().play().catch(() => {});
                }

                tile.innerText = letter;
                tile.className = `tile flip ${status}`;
                tile.style.opacity = "1";

                if (i === wordLength - 1) {
                    setTimeout(finalizeTurn, 500);
                }
            }, i * 250);
        });
    }

    function finalizeTurn() {
        if (currentGuess === targetWord) {
            statusMsg.innerText = "GAGNÉ ! 🎉";
        } else {
            attempts++;
            currentGuess = "";
            if (attempts >= maxAttempts) {
                statusMsg.innerText = "PERDU : " + targetWord;
                gameActive = false;
            } else {
                gameActive = true;
                updateDisplay();
            }
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            initGame();
            return;
        }

        if (!gameActive) return;

        if (e.key === 'Enter') {
            submitGuess();
        } else if (e.key === 'Backspace') {
            currentGuess = currentGuess.slice(0, -1);
            updateDisplay();
        } else if (e.key.length === 1 && /^[a-z]$/i.test(e.key)) {
            if (currentGuess.length < wordLength) {
                currentGuess += e.key.toUpperCase();
                updateDisplay();
            }
        }
    });

    loadDictionary();
    initGame();
});