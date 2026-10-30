const Gameboard = (function () {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const placeToken = (row, column, player) => {
        if (row < 0 || row >= rows || column < 0 || column >= columns) return false; // off the board
        const cell = board[row][column];
        if (cell.getValue() !== 0) return false; // square taken
        cell.addToken(player);
        return true;
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => 
            row.map((cell) => cell.getValue())
        );
        console.log(boardWithCellValues);
        // const grid = boardWithCellValues
        //     .map((row) => `[${row.join(", ")}]`)
        //     .join("\n");
        // console.log(grid);
    };

    function Cell() {
        let value = 0;
      
        // Accept a player's token to change the value of the cell
        const addToken = (player) => {
          value = player;
        };
      
        // How we will retrieve the current value of this cell through closure
        const getValue = () => value;
      
        return {
          addToken,
          getValue,
        };
      }

    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                board[i][j] = Cell();
            }
        }
    };

    return { getBoard, placeToken, printBoard, resetBoard };
})();

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard;
    let winner = null;
    const getWinner = () => winner;

    const players = [
        {
            name: playerOneName,
            token: 1,
        },
        {
            name: playerTwoName,
            token: 2,
        },
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const checkForWin = () => {
        const winCondition = [
            [[0,0], [0,1], [0,2]], // top row
            [[1,0], [1,1], [1,2]], // middle row
            [[2,0], [2,1], [2,2]], // bottom row
            [[0,0], [1,0], [2,0]], // left column
            [[0,1], [1,1], [2,1]], // middle column
            [[0,2], [1,2], [2,2]], // right column
            [[0,0], [1,1], [2,2]], // diagonal
            [[0,2], [1,1], [2,0]], // other diagonal
        ];
        const grid = board.getBoard();

        const hasMatch = winCondition.some((line) =>
            line.every(([r, c]) => grid[r][c].getValue() === getActivePlayer().token)
        );
        return hasMatch;
    }

    const playRound = (row, column) => {
        console.log(
          `Placing ${getActivePlayer().name}'s token at ${row}, ${column}...`
        );
        if (!board.placeToken(row, column, getActivePlayer().token)) {
            console.log("Invalid move. Try again.");
            return;
        }

        /*  This is where we would check for a winner and handle that logic,
          such as a win message. */
        if (checkForWin()) {
            console.log(`${getActivePlayer().name} Wins!`);
            board.resetBoard();
            activePlayer = players[0]; // Player One starts the next game
            printNewRound();
            return;
        }
        // Switch player turn
        switchPlayerTurn();
        printNewRound();
    };

    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version, so I'm revealing it now
    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    };

}

function ScreenControler() {
    const game = GameController();
    const playerTurnDiv = document.querySelector(".turn");
    const boardDiv = document.querySelector(".board");

    const updateScreen = () => {
        // clear the board
        boardDiv.textContent = "";

        // get the new version of the board and player turn
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        // Display player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

        // Render board squares
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            });
        });
    };

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const { row, column } = e.target.dataset;
        if (row === undefined) return; // clicked a gap, not a cell
        game.playRound(Number(row), Number(column));
        updateScreen();
    }
    boardDiv.addEventListener("click", clickHandlerBoard);
    updateScreen();
};

ScreenControler();