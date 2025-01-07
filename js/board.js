class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.grid = Array(CONSTANTS.ROWS).fill().map(() => 
            Array(CONSTANTS.COLS).fill(null)
        );
    }

    // 检查是否可以移动到新位置
    isValidMove(tetromino, offsetX = 0, offsetY = 0, newShape = null) {
        const shape = newShape || tetromino.shape;
        return shape.every((row, dy) => {
            return row.every((value, dx) => {
                if (!value) return true;
                
                const newX = tetromino.x + dx + offsetX;
                const newY = tetromino.y + dy + offsetY;

                return (
                    newX >= 0 &&
                    newX < CONSTANTS.COLS &&
                    newY < CONSTANTS.ROWS &&
                    newY >= 0 &&
                    !this.grid[newY][newX]
                );
            });
        });
    }

    // 将方块固定到游戏板上
    place(tetromino) {
        tetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.grid[tetromino.y + y][tetromino.x + x] = tetromino.color;
                }
            });
        });
    }

    // 清除完整的行并返回清除的行数
    clearLines() {
        let linesCleared = 0;
        
        for (let y = CONSTANTS.ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) {
                // 删除该行并在顶部添加新行
                this.grid.splice(y, 1);
                this.grid.unshift(Array(CONSTANTS.COLS).fill(null));
                linesCleared++;
                y++; // 重新检查当前行，因为上面的行已经下移
            }
        }
        
        return linesCleared;
    }

    // 绘制游戏板
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        // 绘制网格
        this.grid.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    this.drawBlock(x, y, color);
                } else {
                    this.drawEmptyCell(x, y);
                }
            });
        });
    }

    // 绘制方块
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * CONSTANTS.BLOCK_SIZE,
            y * CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE
        );
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(
            x * CONSTANTS.BLOCK_SIZE,
            y * CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE
        );
    }

    // 绘制空单元格
    drawEmptyCell(x, y) {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.strokeRect(
            x * CONSTANTS.BLOCK_SIZE,
            y * CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE,
            CONSTANTS.BLOCK_SIZE
        );
    }
} 