class Ball {
    constructor(x, y, radius, color, velocityX, velocityY, ownerId) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.ownerId = ownerId; // Owner's id
    }

    update(gameArea, players) {
        // Apply movement
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Bounce off walls
        if (this.x - this.radius <= gameArea.x || this.x + this.radius >= gameArea.x + gameArea.width) {
            this.velocityX *= -1;
            this.x += this.velocityX; // Adjust position to prevent sticking
        }

        // Bounce off ceiling and floor
        if (this.y - this.radius <= gameArea.y) {
            this.velocityY *= -1;
            this.y += this.velocityY;
        } else if (this.y + this.radius >= gameArea.y + gameArea.height) {
            this.velocityY *= -1;
            this.y += this.velocityY;
        }

        // Collision with players
        players.forEach((player) => {
            if (this.checkCollision(player)) {
                const hitSound = document.getElementById('hit-sound');
                hitSound.currentTime = 0;
                hitSound.play();
                this.velocityY *= -1;
                this.ownerId = player.id;
            }
        });
    }

    draw(ctx, players) {
        // Find the owner to get the color
        const owner = players.find((p) => p.id === this.ownerId);
        ctx.fillStyle = owner ? owner.color : '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Add black border
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }

    checkCollision(player) {
        // Simple circle-rectangle collision detection
        let closestX = Math.max(player.x, Math.min(this.x, player.x + player.width));
        let closestY = Math.max(player.y, Math.min(this.y, player.y + player.height));

        let distanceX = this.x - closestX;
        let distanceY = this.y - closestY;

        return distanceX * distanceX + distanceY * distanceY < this.radius * this.radius;
    }
}
