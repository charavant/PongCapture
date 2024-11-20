// main.js

// Declare playerIndex at the top
let playerIndex = null;

// Players data (from playerProperties in HTML)
const playersData = playerProperties;

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gravity = 0.5;
let gameStarted = false;
let gamePaused = false;
let gameCountdown = 60; // 1-minute game duration
let preGameCountdown = 3; // Countdown before game starts

// Adjust the game area dimensions
const gameArea = {
    x: 0,
    y: 0,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
};

// Adjust canvas size to match the game area
canvas.width = gameArea.width;
canvas.height = gameArea.height;

// Initialize boxes
const boxes = [];
const boxSize = 40; // Adjusted box size
const boxesPerRow = Math.floor(gameArea.width / boxSize);
const totalBoxWidth = boxesPerRow * boxSize;
const boxesPerColumn = Math.floor((gameArea.height * 0.6) / boxSize);
const totalBoxHeight = boxesPerColumn * boxSize;

// Calculate offset to center the boxes
const xOffset = gameArea.x + (gameArea.width - totalBoxWidth) / 2;
const yOffset = (gameArea.height * 0.2 - totalBoxHeight) / 2;

for (let i = 0; i < boxesPerColumn; i++) {
    for (let j = 0; j < boxesPerRow; j++) {
        boxes.push(new Box(xOffset + j * boxSize, yOffset + i * boxSize, boxSize));
    }
}

// Display player stats on selection screen
function displayPlayerStats() {
    playersData.forEach((data, index) => {
        document.getElementById(`player${index + 1}-height`).innerText = data.height;
        document.getElementById(`player${index + 1}-speed`).innerText = data.speed;
        document.getElementById(`player${index + 1}-jump`).innerText = data.jumpPower;
    });
}

displayPlayerStats();

// Initialize players
let players = [];
let balls = [];
let userPlayer;

// Player selection
function selectPlayer(index) {
    playerIndex = index;
    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('initial-countdown').style.display = 'flex';
    initGame();
}

// Initialize game
function initGame() {
    // Display countdown
    const countdownNumber = document.getElementById('countdown-number');

    // Create players
    players = playersData.map((data, index) => {
        const xPos = gameArea.x + index * (gameArea.width / 4) + 50;
        const playerHeight = data.height;
        if (index === playerIndex) {
            userPlayer = new Player(
                xPos,
                gameArea.y + gameArea.height - playerHeight,
                40,
                playerHeight,
                data.color,
                data.speed,
                data.jumpPower,
                index
            );
            return userPlayer;
        } else {
            return new AIPlayer(
                xPos,
                gameArea.y + gameArea.height - data.height,
                40,
                data.height,
                data.color,
                data.speed,
                data.jumpPower,
                index
            );
        }
    });

    // Create balls
    balls = players.map((player) => {
        return new Ball(
            player.x + player.width / 2,
            player.y - 30,
            20,
            player.color,
            3,
            -3,
            player.id
        );
    });

    // Start pre-game countdown
    let preGameInterval = setInterval(() => {
        countdownNumber.innerText = preGameCountdown + 1;

        preGameCountdown--;
        if (preGameCountdown < 0) {
            clearInterval(preGameInterval);
            gameStarted = true;
            document.getElementById('initial-countdown').style.display = 'none';
            startGame();
        }
    }, 1000);

    // Start rendering during countdown
    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    // Display game info
    document.getElementById('sidebar').style.display = 'block';
    document.getElementById('initial-countdown').style.display = 'none';

    // Start game countdown
    const timeLeftElement = document.getElementById('time-left');
    let gameTimeInterval = setInterval(() => {
        if (!gamePaused) {
            gameCountdown--;
            timeLeftElement.innerText = gameCountdown;
            if (gameCountdown <= 0) {
                clearInterval(gameTimeInterval);
                endGame();
            }
        }
    }, 1000);
}

// Handle user input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Pause game on 'P' key
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Toggle Pause Function
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        document.getElementById('pause-menu').style.display = 'block';
    } else {
        document.getElementById('pause-menu').style.display = 'none';
        requestAnimationFrame(gameLoop);
    }
}

// Game loop
function gameLoop() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game area background
    ctx.fillStyle = '#34495E'; // Slightly lighter dark color
    ctx.fillRect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);

    // Draw boxes
    boxes.forEach((box) => box.draw(ctx));

    if (gameStarted) {
        // Update and draw players
        players.forEach((player) => {
            if (player instanceof AIPlayer) {
                let playerBall = balls.find((b) => b.ownerId === player.id);
                if (playerBall) {
                    player.updateAI(playerBall, gravity, gameArea, players);
                }
            } else {
                // User player
                if (keys['ArrowLeft'] || keys['a']) player.moveLeft(gameArea);
                if (keys['ArrowRight'] || keys['d']) player.moveRight(gameArea);
                if (keys['ArrowUp'] || keys['w']) player.jump();
                player.update(gravity, gameArea, players);
            }
            player.draw(ctx);
        });

        // Update and draw balls
        balls.forEach((ball) => {
            ball.update(gameArea, players);
            ball.draw(ctx, players);

            // Collision with boxes
            boxes.forEach((box) => {
                if (
                    ball.x + ball.radius > box.x &&
                    ball.x - ball.radius < box.x + box.size &&
                    ball.y + ball.radius > box.y &&
                    ball.y - ball.radius < box.y + box.size
                ) {
                    if (box.ownerNumber !== ball.ownerId) {
                        box.ownerNumber = ball.ownerId;
                        const owner = players.find((p) => p.id === ball.ownerId);
                        box.color = owner ? owner.color : '#fff';
                        box.animate = true;
                        setTimeout(() => {
                            box.animate = false;
                        }, 500);
                    }
                }
            });
        });

        // Update leaderboard
        updateLeaderboard();
    } else {
        // During pre-game countdown, just draw players and balls
        players.forEach((player) => {
            player.draw(ctx);
        });
        balls.forEach((ball) => {
            ball.draw(ctx, players);
        });
    }

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Update leaderboard
function updateLeaderboard() {
    const scores = players.map((player) => {
        const count = boxes.filter((box) => box.ownerNumber === player.id).length;
        return { player, score: count };
    });

    // Sort scores descending
    scores.sort((a, b) => b.score - a.score);

    // Update the score list
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = ''; // Clear existing list

    scores.forEach((score) => {
        const li = document.createElement('li');
        li.style.color = score.player.color;
        li.innerHTML = `<span class="player-color" style="background-color: ${score.player.color};"></span> Player ${score.player.number + 1}: ${score.score}`;
        scoreList.appendChild(li);
    });
}

// End the game
function endGame() {
    gameStarted = false;
    document.getElementById('sidebar').style.display = 'none';

    // Calculate scores
    const scores = players.map((player) => {
        const count = boxes.filter((box) => box.ownerNumber === player.id).length;
        return { player, score: count };
    });

    // Determine winner
    scores.sort((a, b) => b.score - a.score);
    const winner = scores[0];

    // Display winner
    alert(
        `Game Over! The winner is Player ${winner.player.number + 1} with ${winner.score} boxes colored.`
    );
    location.reload();
}
