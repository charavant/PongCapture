class Box {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = null; // No color initially
        this.ownerNumber = null; // Number of the player who claimed the box
    }

    draw(ctx) {
        ctx.fillStyle = this.color || '#ADD8E6'; // Light blue default color
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    
        if (this.animate) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.restore();
        }
    
        // Draw player number if the box is claimed
        if (this.ownerNumber !== null) {
            ctx.fillStyle = '#fff';
            ctx.font = `${this.size / 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.ownerNumber + 1,
                this.x + this.size / 2,
                this.y + this.size / 2
            );
        }
    }
    
}
