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
        statusMsg.style.color = "var(--text-main)";

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
        fillRowWithFoundLetters();
    }

    function fillRowWithFoundLetters() {
        const row = board.children[attempts];
        foundLetters.forEach((letter, i) => {
            if (letter) row.children[i].innerText = letter;
        });
    }

    function submitGuess() {
        if (currentGuess.length !== wordLength) return;
        if (!dictionary.includes(currentGuess)) {
            statusMsg.innerText = "MOT INCONNU !";
            statusMsg.style.color = "#f39c12";
            gameActive = false;
            animateIncorrectWord();
            return;
        }

        processResult();
    }

    function animateIncorrectWord() {
        const row = board.children[attempts];
        for (let i = 0; i < wordLength; i++) {
            setTimeout(() => {
                row.children[i].classList.add('absent');
                if (i === wordLength - 1) finalizeTurn();
            }, i * 100);
        }
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
                playSound(status);
                tile.innerText = letter;
                tile.className = `tile flip ${status}`;
                if (i === wordLength - 1) setTimeout(finalizeTurn, 500);
            }, i * 250);
        });
    }

    function finalizeTurn() {
        if (currentGuess === targetWord) {
            statusMsg.innerText = `GAGNÉ ! 🎉 : Le mot à trouver était bien ${targetWord}`;
            confetti();
        } else {
            attempts++;
            currentGuess = "";
            if (attempts >= maxAttempts) {
                revealFullRedWord();
            } else {
                gameActive = true;
                statusMsg.innerText = "";
                fillRowWithFoundLetters();
            }
        }
    }

    function revealFullRedWord() {
        statusMsg.innerText = "PERDU...";
        const row = board.children[maxAttempts - 1];
        targetWord.split('').forEach((letter, i) => {
            setTimeout(() => {
                const tile = row.children[i];
                tile.innerText = letter;
                tile.className = 'tile flip correct';
            }, i * 150);
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { initGame(); return; }
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

    function updateDisplay() {
        const row = board.children[attempts];
        for (let i = 0; i < wordLength; i++) {
            row.children[i].innerText = currentGuess[i] || foundLetters[i] || "";
        }
    }

    function updateDisplay() {
    const row = board.children[attempts];
    for (let i = 0; i < wordLength; i++) {
        const tile = row.children[i];
        if (currentGuess[i]) {
            tile.innerText = currentGuess[i];
            tile.style.opacity = "1";
        } 
        else if (foundLetters[i]) {
            tile.innerText = foundLetters[i];
            tile.style.opacity = "0.5"; 
        } 
        else {
            tile.innerText = "";
        }
    }

    const sounds = {
    correct: new Audio('/static/correct.mp3'),
    present: new Audio('/static/present.mp3'),
    absent: new Audio('/static/absent.mp3')
    };

    function playSound(type) {
    if (sounds[type]) {
        const soundClone = sounds[type].cloneNode(); // Permet de jouer le son en rafale
        soundClone.play().catch(e => console.log("Audio bloqué par le navigateur"));
    }
}
}

    loadDictionary();
    initGame();
});