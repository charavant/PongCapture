class Player {
    constructor(x, y, width, height, color, speed, jumpPower, number) {
        this.id = number; // Unique identifier
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed; // Horizontal speed
        this.jumpPower = jumpPower;
        this.velocityY = 0;
        this.onGround = false;
        this.number = number; // Player number (0-based index)
    }

    update(gravity, gameArea, players) {
        // Apply gravity
        this.velocityY += gravity;

        // Move vertically
        this.y += this.velocityY;

        // Collision with the floor
        if (this.y + this.height >= gameArea.y + gameArea.height) {
            this.y = gameArea.y + gameArea.height - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // Collision with ceiling
        if (this.y <= gameArea.y) {
            this.y = gameArea.y;
            this.velocityY = 0;
        }

        // Collision with other players (allow jumping on them)
        players.forEach((other) => {
            if (other !== this && this.checkCollision(other)) {
                if (this.velocityY > 0 && this.y + this.height <= other.y + other.height / 2) {
                    // Landing on top of another player
                    this.y = other.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                } else {
                    // Side collision, simple resolution
                    if (this.x < other.x) {
                        this.x = other.x - this.width;
                    } else {
                        this.x = other.x + other.width;
                    }
                }
            }
        });
    }

    moveLeft(gameArea) {
        this.x -= this.speed;
        if (this.x < gameArea.x) this.x = gameArea.x;
    }

    moveRight(gameArea) {
        this.x += this.speed;
        if (this.x + this.width > gameArea.x + gameArea.width) {
            this.x = gameArea.x + gameArea.width - this.width;
        }
    }

    jump() {
        if (this.onGround) {
            const jumpSound = document.getElementById('jump-sound');
            jumpSound.currentTime = 0;
            jumpSound.play();
            this.velocityY = -this.jumpPower;
            this.onGround = false;
        }
    }


    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    checkCollision(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}
