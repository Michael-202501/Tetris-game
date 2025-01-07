class Game {
    constructor() {
        this.setupCanvas();
        this.setupNextPieceCanvas();
        this.setupEventListeners();
        this.reset();
        this.isAutoMode = false;
    }

    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONSTANTS.COLS * CONSTANTS.BLOCK_SIZE;
        this.canvas.height = CONSTANTS.ROWS * CONSTANTS.BLOCK_SIZE;
    }

    setupNextPieceCanvas() {
        this.nextCanvas = document.getElementById('next-piece-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.nextCanvas.width = 4 * CONSTANTS.BLOCK_SIZE;
        this.nextCanvas.height = 4 * CONSTANTS.BLOCK_SIZE;
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('start-game').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMainMenu());
        document.addEventListener('keydown', (event) => {
            if (event.keyCode === 65) { // 'A' 键切换自动模式
                this.toggleAutoMode();
            }
        });
    }

    reset() {
        this.board = new Board(this.ctx);
        this.currentPiece = new Tetromino();
        this.nextPiece = new Tetromino();
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.updateScore();
        this.loadHighScore();
    }

    start() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.gameLoop();
    }

    showMainMenu() {
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '继续' : '暂停';
    }

    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch (event.keyCode) {
            case 37: // 左箭头
                if (this.board.isValidMove(this.currentPiece, -1, 0)) {
                    this.currentPiece.moveLeft();
                }
                break;
            case 39: // 右箭头
                if (this.board.isValidMove(this.currentPiece, 1, 0)) {
                    this.currentPiece.moveRight();
                }
                break;
            case 40: // 下箭头
                if (this.board.isValidMove(this.currentPiece, 0, 1)) {
                    this.currentPiece.moveDown();
                }
                break;
            case 38: // 上箭头
                const rotated = this.currentPiece.rotate();
                if (this.board.isValidMove(this.currentPiece, 0, 0, rotated)) {
                    this.currentPiece.shape = rotated;
                }
                break;
            case 32: // 空格
                this.hardDrop();
                break;
        }
        this.draw();
    }

    hardDrop() {
        while (this.board.isValidMove(this.currentPiece, 0, 1)) {
            this.currentPiece.moveDown();
        }
        this.placePiece();
    }

    placePiece() {
        this.board.place(this.currentPiece);
        const linesCleared = this.board.clearLines();
        this.updateScore(linesCleared);
        this.currentPiece = this.nextPiece;
        this.nextPiece = new Tetromino();
        
        if (!this.board.isValidMove(this.currentPiece)) {
            this.gameOver = true;
            this.endGame();
        }
    }

    updateScore(linesCleared = 0) {
        const points = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 行的分数
        this.score += points[linesCleared];
        
        // 更新等级
        this.level = Math.floor(this.score / 1000) + 1;
        if (this.level > 10) this.level = 10;

        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;

        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetris-high-score', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('tetris-high-score')) || 0;
        document.getElementById('high-score').textContent = this.highScore;
    }

    endGame() {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
    }

    draw() {
        this.board.draw();
        
        // 绘制当前方块
        this.currentPiece.getBlocks().forEach(block => {
            this.board.drawBlock(block.x, block.y, block.color);
        });

        // 绘制下一个方块
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const nextPieceOffset = {
            x: Math.floor((4 - this.nextPiece.shape[0].length) / 2),
            y: Math.floor((4 - this.nextPiece.shape.length) / 2)
        };

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        (x + nextPieceOffset.x) * CONSTANTS.BLOCK_SIZE,
                        (y + nextPieceOffset.y) * CONSTANTS.BLOCK_SIZE,
                        CONSTANTS.BLOCK_SIZE,
                        CONSTANTS.BLOCK_SIZE
                    );
                    this.nextCtx.strokeStyle = '#fff';
                    this.nextCtx.strokeRect(
                        (x + nextPieceOffset.x) * CONSTANTS.BLOCK_SIZE,
                        (y + nextPieceOffset.y) * CONSTANTS.BLOCK_SIZE,
                        CONSTANTS.BLOCK_SIZE,
                        CONSTANTS.BLOCK_SIZE
                    );
                }
            });
        });
    }

    gameLoop() {
        if (!this.gameOver && !this.isPaused) {
            if (this.board.isValidMove(this.currentPiece, 0, 1)) {
                this.currentPiece.moveDown();
            } else {
                this.placePiece();
            }
            this.draw();
        }
        
        const speed = CONSTANTS.LEVEL_SPEED[this.level];
        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), speed);
    }

    toggleAutoMode() {
        this.isAutoMode = !this.isAutoMode;
        if (this.isAutoMode) {
            this.autoPlay();
        }
    }

    autoPlay() {
        if (!this.isAutoMode || this.gameOver || this.isPaused) return;

        const bestMove = this.findBestMove();
        if (bestMove) {
            this.executeMove(bestMove);
        }

        // 继续自动游戏
        setTimeout(() => {
            requestAnimationFrame(() => this.autoPlay());
        }, 100);
    }

    findBestMove() {
        const piece = this.currentPiece;
        let bestScore = -Infinity;
        let bestMove = null;

        // 尝试所有可能的位置和旋转
        for (let rotation = 0; rotation < 4; rotation++) {
            let testPiece = new Tetromino();
            testPiece.shape = piece.shape;
            testPiece.x = piece.x;
            testPiece.y = piece.y;
            testPiece.color = piece.color;

            // 应用旋转
            for (let r = 0; r < rotation; r++) {
                const rotated = this.rotatePiece(testPiece.shape);
                if (this.board.isValidMove(testPiece, 0, 0, rotated)) {
                    testPiece.shape = rotated;
                }
            }

            // 尝试所有可能的水平位置
            for (let x = -5; x < CONSTANTS.COLS + 5; x++) {
                let testX = piece.x;
                let moveX = x - testX;
                
                testPiece.x = x;
                if (!this.board.isValidMove(testPiece, 0, 0)) continue;

                // 下落到底部
                let testY = piece.y;
                while (this.board.isValidMove(testPiece, 0, 1)) {
                    testY++;
                    testPiece.y = testY;
                }

                // 评估这个位置
                const score = this.evaluatePosition(testPiece);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        rotation,
                        moveX,
                        hardDrop: true
                    };
                }
            }
        }

        return bestMove;
    }

    executeMove(move) {
        // 执行旋转
        for (let i = 0; i < move.rotation; i++) {
            const rotated = this.currentPiece.rotate();
            if (this.board.isValidMove(this.currentPiece, 0, 0, rotated)) {
                this.currentPiece.shape = rotated;
            }
        }

        // 执行水平移动
        const moveStep = Math.sign(move.moveX);
        for (let i = 0; i < Math.abs(move.moveX); i++) {
            if (this.board.isValidMove(this.currentPiece, moveStep, 0)) {
                if (moveStep > 0) {
                    this.currentPiece.moveRight();
                } else {
                    this.currentPiece.moveLeft();
                }
            }
        }

        // 执行硬降落
        if (move.hardDrop) {
            this.hardDrop();
        }

        this.draw();
    }

    evaluatePosition(piece) {
        let score = 0;
        const testBoard = this.getTestBoard(piece);
        
        // 1. 完整行数
        const completeLines = this.countCompleteLines(testBoard);
        score += completeLines * 100;

        // 2. 空洞数量
        const holes = this.countHoles(testBoard);
        score -= holes * 30;

        // 3. 高度惩罚
        const height = this.getHeight(testBoard);
        score -= height * 2;

        // 4. 平整度（相邻列高度差）
        const bumpiness = this.getBumpiness(testBoard);
        score -= bumpiness * 2;

        return score;
    }

    getTestBoard(piece) {
        const testBoard = this.board.grid.map(row => [...row]);
        piece.getBlocks().forEach(block => {
            if (block.y >= 0 && block.y < CONSTANTS.ROWS &&
                block.x >= 0 && block.x < CONSTANTS.COLS) {
                testBoard[block.y][block.x] = piece.color;
            }
        });
        return testBoard;
    }

    countCompleteLines(board) {
        return board.filter(row => row.every(cell => cell !== null)).length;
    }

    countHoles(board) {
        let holes = 0;
        for (let col = 0; col < CONSTANTS.COLS; col++) {
            let block = false;
            for (let row = 0; row < CONSTANTS.ROWS; row++) {
                if (board[row][col] !== null) {
                    block = true;
                } else if (block && board[row][col] === null) {
                    holes++;
                }
            }
        }
        return holes;
    }

    getHeight(board) {
        for (let row = 0; row < CONSTANTS.ROWS; row++) {
            if (board[row].some(cell => cell !== null)) {
                return CONSTANTS.ROWS - row;
            }
        }
        return 0;
    }

    getBumpiness(board) {
        let bumpiness = 0;
        let heights = [];

        // 计算每列的高度
        for (let col = 0; col < CONSTANTS.COLS; col++) {
            let height = CONSTANTS.ROWS;
            for (let row = 0; row < CONSTANTS.ROWS; row++) {
                if (board[row][col] !== null) {
                    height = row;
                    break;
                }
            }
            heights.push(height);
        }

        // 计算相邻列的高度差
        for (let i = 0; i < heights.length - 1; i++) {
            bumpiness += Math.abs(heights[i] - heights[i + 1]);
        }

        return bumpiness;
    }

    rotatePiece(shape) {
        const newShape = [];
        for (let i = 0; i < shape[0].length; i++) {
            newShape.push([]);
            for (let j = shape.length - 1; j >= 0; j--) {
                newShape[i].push(shape[j][i]);
            }
        }
        return newShape;
    }
}

// 启动游戏
window.onload = () => {
    new Game();
}; 