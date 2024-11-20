class AIPlayer extends Player {
    constructor(x, y, width, height, color, speed, jumpPower, number) {
        super(x, y, width, height, color, speed, jumpPower, number);
    }

    updateAI(ball, gravity, gameArea, players) {
        if (ball) {
            // Move towards the ball
            if (ball.x < this.x) {
                this.moveLeft(gameArea);
            } else if (ball.x > this.x + this.width) {
                this.moveRight(gameArea);
            }

            // Simple jump logic
            if (ball.y < this.y && this.onGround) {
                this.jump();
            }
        }

        super.update(gravity, gameArea, players);
    }
}
