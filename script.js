// Variables globales del juego
let gameStats = {
    gamesPlayed: 0,
    goalsScored: 0,
    penaltiesMissed: 0,
    wins: 0,
    losses: 0
};

let gameData = {
    team1Score: 0,
    team2Score: 0,
    currentRound: 1,
    totalRounds: 5,
    playerTurn: true,
    coins: 100,
    unlockedItems: {}
};

// Inicializar el juego cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos guardados si existen
    loadGameData();
    updateUIElements();

    // Configurar los botones del menú principal
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('view-stats').addEventListener('click', showStats);
    document.getElementById('shop-btn').addEventListener('click', showShop);

    // Botones para volver al menú principal
    document.getElementById('back-to-menu').addEventListener('click', showMainMenu);
    document.getElementById('stats-back').addEventListener('click', showMainMenu);
    document.getElementById('shop-back').addEventListener('click', showMainMenu);

    // Botones para continuar el juego
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('game-over').addEventListener('click', endGame);

    // Configurar eventos para el control del balón
    setupBallControls();

    // Configurar eventos para la tienda
    setupShopEvents();
});

// Funciones para el control del juego
function startGame() {
    gameData.team1Score = 0;
    gameData.team2Score = 0;
    gameData.currentRound = 1;
    gameData.playerTurn = true;
    showScreen('game-screen');
    updateScoreboard();
    resetBallPosition();
}

function showStats() {
    updateStatsDisplay();
    showScreen('stats-screen');
}

function showShop() {
    updateShopDisplay();
    showScreen('shop-screen');
}

function showMainMenu() {
    showScreen('main-menu');
}

function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Mostrar la pantalla solicitada
    document.getElementById(screenId).classList.add('active');
}

function updateScoreboard() {
    document.getElementById('team1-score').textContent = gameData.team1Score;
    document.getElementById('team2-score').textContent = gameData.team2Score;
    document.getElementById('round').textContent = `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>g</mi><mi>a</mi><mi>m</mi><mi>e</mi><mi>D</mi><mi>a</mi><mi>t</mi><mi>a</mi><mi mathvariant="normal">.</mi><mi>c</mi><mi>u</mi><mi>r</mi><mi>r</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>R</mi><mi>o</mi><mi>u</mi><mi>n</mi><mi>d</mi></mrow><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">{gameData.currentRound}/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">am</span><span class="mord mathnormal" style="margin-right:0.02778em;">eD</span><span class="mord mathnormal">a</span><span class="mord mathnormal">t</span><span class="mord mathnormal">a</span><span class="mord">.</span><span class="mord mathnormal">c</span><span class="mord mathnormal">u</span><span class="mord mathnormal">rre</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.00773em;">tR</span><span class="mord mathnormal">o</span><span class="mord mathnormal">u</span><span class="mord mathnormal">n</span><span class="mord mathnormal">d</span></span><span class="mord">/</span></span></span></span>{gameData.totalRounds}`;
}

function updateStatsDisplay() {
    document.getElementById('games-played').textContent = gameStats.gamesPlayed;
    document.getElementById('goals-scored').textContent = gameStats.goalsScored;
    document.getElementById('penalties-missed').textContent = gameStats.penaltiesMissed;
    document.getElementById('wins').textContent = gameStats.wins;
    document.getElementById('losses').textContent = gameStats.losses;
}

function updateShopDisplay() {
    document.getElementById('shop-coins').textContent = gameData.coins;
    document.querySelectorAll('.shop-item').forEach(item => {
        const itemId = item.getAttribute('data-item');
        const buyButton = item.querySelector('.buy-btn');
        
        if (gameData.unlockedItems[itemId]) {
            buyButton.textContent = 'ADQUIRIDO';
            buyButton.disabled = true;
            buyButton.style.backgroundColor = '#888';
        } else {
            buyButton.textContent = 'COMPRAR';
            buyButton.disabled = false;
            buyButton.style.backgroundColor = '#ffcc00';
        }
    });
}

// Control del balón y mecánica del juego
function setupBallControls() {
    const ball = document.getElementById('ball');
    let isDragging = false;
    let powerLevel = 0;
    let powerBarInterval;
    let startY = 0;
    
    ball.addEventListener('mousedown', (e) => {
        isDragging = true;
        ball.style.cursor = 'grabbing';
        startY = e.clientY;
        
        // Iniciar la barra de potencia
        powerBarInterval = setInterval(() => {
            powerLevel = (powerLevel + 2) % 100;
            document.getElementById('power-level').style.width = `${powerLevel}%`;
        }, 50);
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            ball.style.cursor = 'grab';
            clearInterval(powerBarInterval);
            
            // Calcular dirección y potencia del disparo
            const endY = e.clientY;
            const direction = startY - endY; // Positivo = arriba, Negativo = abajo
            const power = powerLevel;
            
            // Ejecutar el tiro
            shootPenalty(direction, power);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // No mover el balón, solo registrar el movimiento
            e.preventDefault();
        }
    });
}

function shootPenalty(direction, power) {
    const ball = document.getElementById('ball');
    const goalkeeper = document.getElementById('goalkeeper');
    const targets = document.querySelectorAll('.target');
    
    // Determinar la posición final del balón basada en dirección y potencia
    let targetIndex;
    if (direction > 50) {
        // Tiro alto
        targetIndex = Math.floor(Math.random() * 3);
    } else if (direction > 0) {
        // Tiro medio
        targetIndex = 3 + Math.floor(Math.random() * 3);
    } else {
        // Tiro bajo
        targetIndex = 6 + Math.floor(Math.random() * 3);
    }
    
    // Ajustar por potencia (influye en la precisión)
    if (power > 80) {
        // Con mucha potencia puede desviarse
        targetIndex = Math.floor(Math.random() * 9);
    }
    
    // Obtener la posición del objetivo
    const target = targets[targetIndex];
    const targetRect = target.getBoundingClientRect();
    const gameFieldRect = document.getElementById('game-field').getBoundingClientRect();
    
    // Calcular posición relativa al campo de juego
    const targetX = targetRect.left - gameFieldRect.left + (targetRect.width / 2) - (ball.offsetWidth / 2);
    const targetY = targetRect.top - gameFieldRect.top + (targetRect.height / 2) - (ball.offsetHeight / 2);
    
    // Mover el balón
    ball.style.transition = `transform 1s cubic-bezier(0.2, 0.8, 0.3, 1)`;
    ball.style.transform = `translate(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>t</mi><mi>a</mi><mi>r</mi><mi>g</mi><mi>e</mi><mi>t</mi><mi>X</mi></mrow><mi>p</mi><mi>x</mi><mo separator="true">,</mo></mrow><annotation encoding="application/x-tex">{targetX}px, </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">tX</span></span><span class="mord mathnormal">p</span><span class="mord mathnormal">x</span><span class="mpunct">,</span></span></span></span>{targetY - 300}px)`;
    
    // Mover al portero (IA)
    moveGoalkeeper();
    
    // Comprobar si fue gol después de la animación
    setTimeout(() => {
        const isGoal = checkGoal(targetIndex);
        showResult(isGoal);
    }, 1000);
}

function moveGoalkeeper() {
    const goalkeeper = document.getElementById('goalkeeper');
    const positions = ['left', 'center', 'right'];
    const heightPositions = ['top', 'middle', 'bottom'];
    
    // Elegir una posición aleatoria para el portero
    const horizontalPos = positions[Math.floor(Math.random() * 3)];
    const verticalPos = heightPositions[Math.floor(Math.random() * 3)];
    
    // Aplicar la posición
    if (horizontalPos === 'left') {
        goalkeeper.style.left = '25%';
    } else if (horizontalPos === 'right') {
        goalkeeper.style.left = '65%';
    } else {
        goalkeeper.style.left = '45%';
    }
    
    if (verticalPos === 'top') {
        goalkeeper.style.top = '20px';
    } else if (verticalPos === 'bottom') {
        goalkeeper.style.top = '120px';
    } else {
        goalkeeper.style.top = '70px';
    }
}

function checkGoal(targetIndex) {
    const goalkeeper = document.getElementById('goalkeeper');
    const goalkeeperRect = goalkeeper.getBoundingClientRect();
    const targets = document.querySelectorAll('.target');
    const targetRect = targets[targetIndex].getBoundingClientRect();
    
    // Comprobar si el portero interceptó el balón
    const isBlocked = (
        goalkeeperRect.left < targetRect.right &&
        goalkeeperRect.right > targetRect.left &&
        goalkeeperRect.top < targetRect.bottom &&
        goalkeeperRect.bottom > targetRect.top
    );
    
    return !isBlocked;
}

function showResult(isGoal) {
    const resultOverlay = document.getElementById('result-overlay');
    const resultMessage = document.getElementById('result-message');
    const nextRoundBtn = document.getElementById('next-round');
    const gameOverBtn = document.getElementById('game-over');
    
    if (gameData.playerTurn) {
        if (isGoal) {
            resultMessage.textContent = '¡GOOOOL!';
            gameData.team1Score++;
            gameStats.goalsScored++;
            // Dar monedas por gol
            gameData.coins += 10;
        } else {
            resultMessage.textContent = '¡ATAJADO!';
            gameStats.penaltiesMissed++;
        }
        // Siguiente turno para la CPU
        gameData.playerTurn = false;
    } else {
        // Turno de la CPU
        if (isGoal) {
            resultMessage.textContent = '¡LA CPU ANOTA!';
            gameData.team2Score++;
        } else {
            resultMessage.textContent = '¡TU PORTERO ATAJA!';
        }
        // Siguiente ronda
        gameData.currentRound++;
        gameData.playerTurn = true;
    }
    
    updateScoreboard();
    
    // Mostrar el botón adecuado
    if (gameData.currentRound > gameData.totalRounds) {
        nextRoundBtn.style.display = 'none';
        gameOverBtn.style.display = 'block';
    } else if (gameData.playerTurn) {
        nextRoundBtn.style.display = 'block';
        gameOverBtn.style.display = 'none';
    } else {
        // Cuando la CPU va a tirar
        setTimeout(() => {
            resultOverlay.style.display = 'none';
            cpuShoot();
        }, 1500);
        return;
    }
    
    resultOverlay.style.display = 'flex';
    saveGameData();
}

function cpuShoot() {
    // Simular el tiro de la CPU
    const direction = Math.random() * 100;
    const power = 50 + Math.random() * 50;
    
    shootPenalty(direction, power);
}

function nextRound() {
    document.getElementById('result-overlay').style.display = 'none';
    resetBallPosition();
}

function resetBallPosition() {
    const ball = document.getElementById('ball');
    ball.style.transition = 'none';
    ball.style.transform = 'translate(0, 0)';
    
    document.getElementById('goalkeeper').style.left = 'calc(50% - 30px)';
    document.getElementById('goalkeeper').style.top = '50px';
    
    document.getElementById('power-level').style.width = '0%';
}

function endGame() {
    document.getElementById('result-overlay').style.display = 'none';
    
    // Actualizar estadísticas
    gameStats.gamesPlayed++;
    if (gameData.team1Score > gameData.team2Score) {
        gameStats.wins++;
        // Bonus de monedas por victoria
        gameData.coins += 50;
    } else if (gameData.team1Score < gameData.team2Score) {
        gameStats.losses++;
    }
    
    saveGameData();
    showMainMenu();
}

// Sistema de compras
function setupShopEvents() {
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const shopItem = e.target.closest('.shop-item');
            const itemId = shopItem.getAttribute('data-item');
            const price = parseInt(shopItem.getAttribute('data-price'));
            
            if (gameData.coins >= price && !gameData.unlockedItems[itemId]) {
                gameData.coins -= price;
                gameData.unlockedItems[itemId] = true;
                saveGameData();
                updateShopDisplay();
                updateUIElements();
                
                // Feedback visual
                button.textContent = 'ADQUIRIDO';
                button.disabled = true;
                button.style.backgroundColor = '#888';
                
                // Actualizar monedas en la interfaz
                document.getElementById('shop-coins').textContent = gameData.coins;
            }
        });
    });
}

// Funciones para guardar y cargar datos
function saveGameData() {
    localStorage.setItem('penaltyGame_stats', JSON.stringify(gameStats));
    localStorage.setItem('penaltyGame_data', JSON.stringify(gameData));
}

function loadGameData() {
    const savedStats = localStorage.getItem('penaltyGame_stats');
    const savedData = localStorage.getItem('penaltyGame_data');
    
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
    }
    
    if (savedData) {
        gameData = JSON.parse(savedData);
    }
}

function updateUIElements() {
    document.getElementById('coins').textContent = gameData.coins;
}

