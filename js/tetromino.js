class Tetromino {
    constructor(shape = null) {
        this.spawn();
        if (shape !== null) {
            this.shape = shape;
        }
    }

    spawn() {
        // 随机选择一个形状
        const shapeIndex = Math.floor(Math.random() * CONSTANTS.SHAPES.length);
        this.shape = CONSTANTS.SHAPES[shapeIndex];
        this.color = CONSTANTS.COLORS[shapeIndex];
        
        // 设置初始位置（从顶部中间出现）
        this.x = Math.floor((CONSTANTS.COLS - this.shape[0].length) / 2);
        this.y = 0;
    }

    rotate() {
        // 矩阵转置然后反转每一行，实现顺时针旋转
        const newShape = [];
        for (let i = 0; i < this.shape[0].length; i++) {
            newShape.push([]);
            for (let j = this.shape.length - 1; j >= 0; j--) {
                newShape[i].push(this.shape[j][i]);
            }
        }
        return newShape;
    }

    moveLeft() {
        this.x--;
    }

    moveRight() {
        this.x++;
    }

    moveDown() {
        this.y++;
    }

    // 获取方块在游戏板上的实际位置
    getBlocks() {
        const blocks = [];
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    blocks.push({
                        x: this.x + x,
                        y: this.y + y,
                        color: this.color
                    });
                }
            });
        });
        return blocks;
    }
} 