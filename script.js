document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const resetButton = document.getElementById('reset-btn');
    const modeButton = document.getElementById('mode-btn');
    const robotThinking = document.querySelector('.robot-thinking');
    
    let gameActive = true;
    let currentPlayer = 'X'; // Human is X, Robot is O
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let hardMode = true;
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize the game
    function initializeGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.textContent = 'Your turn (X)';
        statusDisplay.className = 'status human-turn';
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('human', 'robot', 'winning-cell');
        });
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already filled or game not active, ignore
        if (gameState[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'X') {
            return;
        }
        
        // Make human move
        makeMove(clickedCell, clickedCellIndex, 'X');
        
        // Check if human won
        if (checkWin('X')) {
            statusDisplay.textContent = 'Human wins!';
            statusDisplay.className = 'status human-turn';
            gameActive = false;
            highlightWinningCells('X');
            return;
        }
        
        // Check for draw
        if (checkDraw()) {
            statusDisplay.textContent = 'Game ended in a draw!';
            statusDisplay.className = 'status';
            gameActive = false;
            return;
        }
        
        // Switch to robot's turn
        currentPlayer = 'O';
        statusDisplay.textContent = 'Robot thinking...';
        statusDisplay.className = 'status robot-turn';
        
        // Show thinking animation
        robotThinking.classList.add('active');
        
        // Robot makes move after a delay (for dramatic effect)
        setTimeout(() => {
            robotMove();
            robotThinking.classList.remove('active');
            
            // Check if robot won
            if (checkWin('O')) {
                statusDisplay.textContent = 'Robot wins!';
                statusDisplay.className = 'status robot-turn';
                gameActive = false;
                highlightWinningCells('O');
                return;
            }
            
            // Check for draw
            if (checkDraw()) {
                statusDisplay.textContent = 'Game ended in a draw!';
                statusDisplay.className = 'status';
                gameActive = false;
                return;
            }
            
            // Switch back to human's turn
            currentPlayer = 'X';
            statusDisplay.textContent = 'Your turn (X)';
            statusDisplay.className = 'status human-turn';
        }, hardMode ? 1000 : 500); // Longer delay in hard mode
    }
    
    // Make a move on the board
    function makeMove(cell, index, player) {
        gameState[index] = player;
        cell.textContent = player;
        cell.classList.add(player === 'X' ? 'human' : 'robot');
    }
    
    // Check for win
    function checkWin(player) {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return gameState[index] === player;
            });
        });
    }
    
    // Highlight winning cells
    function highlightWinningCells(player) {
        const winningCondition = winningConditions.find(condition => {
            return condition.every(index => {
                return gameState[index] === player;
            });
        });
        
        if (winningCondition) {
            winningCondition.forEach(index => {
                cells[index].classList.add('winning-cell');
            });
        }
    }
    
    // Check for draw
    function checkDraw() {
        return gameState.every(cell => cell !== '');
    }
    
    // Robot's move
    function robotMove() {
        let move;
        
        if (hardMode) {
            // Hard mode - minimax algorithm
            move = findBestMove();
        } else {
            // Easy mode - random move
            const emptyCells = gameState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        
        if (move !== undefined) {
            makeMove(cells[move], move, 'O');
        }
    }
    
    // Minimax algorithm for hard mode
    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                let score = minimax(gameState, 0, false);
                gameState[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    function minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (checkWin('O')) return 10 - depth;
        if (checkWin('X')) return depth - 10;
        if (checkDraw()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    // Event listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', initializeGame);
    
    modeButton.addEventListener('click', () => {
        hardMode = !hardMode;
        modeButton.textContent = hardMode ? 'Switch to Easy' : 'Switch to Hard';
        initializeGame();
    });
    
    // Initialize the game
    initializeGame();
});
