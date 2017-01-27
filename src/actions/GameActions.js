import {
    GET_GAME_DATA_REQUEST,
    GET_GAME_DATA,
    UPDATE_GAME_STATUS,
    UPDATE_PLAYER_SETTINGS,
    RESET_GAME_STATUS,
    UPDATE_GAME_DATA
} from '../constants/Game';
// import reqwest from 'reqwest';
// import fetch from 'isomorphic-fetch';
// import {getPlayers,updateWinner} from './GameInfoActions';
const API_ROOT_URL = 'http://606ep.ru:8080/';
let gameField = [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    gameStatus = 0,
    winLine = [],
    settings = {
        autoPlay: false,
        players: {
            player: 0,
            enemy: 0,
            tie: 0
        }
    },
    winners = {
        player: 0,
        enemy: 0
    },
    gameOver = false;
let recurseWinner = {
    '1': board=>[1, board],
    '0': board=>[-1, board],
    '-1': board=>[0, board]
};
let playersValues = [-1, 1];
function loadGameFieldData(dispatch) {
    fetch(API_ROOT_URL)
        .then(
            function (response) {
                if (response.status !== 200) {
                    dispatch({
                        type: GET_GAME_DATA,
                        error: true,
                        payload: new Error(response)
                    });
                    return;
                }
                response.json().then(function (data) {
                    gameField = data;
                    dispatch({
                        type: GET_GAME_DATA,
                        payload: data
                    });
                });
            }
        )
        .catch(function (err) {
            console.log(err);
        });
}
function findWinner(board, collectWinLine = false) {
    // Check if someone won
    let allNotEmpty = true;
    for (var k = 0; k < playersValues.length; k++) {
        let value = playersValues[k];
        let isEnemyValue = value == settings.players.enemy;
        // Check rows, columns, and diagonals on playing field
        let diagonalCompleted = true,
            reverseDiagonalCompleted = true;
        for (var i = 0; i < 3; i++) {
            if (board[i][i] != value) {
                diagonalCompleted = false;
            }
            // else {
            //     winLine.push('r' + i + 'c' + i);
            // }
            if (board[2 - i][i] != value) {
                reverseDiagonalCompleted = false;
            }
            // else {
            //     winLine.push('r' + (2 - i) + 'c' + i);
            // }
            let rowComplete = true,
                colComplete = true;
            //TODO
            if (board[i][0] != value || board[i][1] != value || board[i][2] != value) {
                // colComplete = false;{
                rowComplete = false;
            }
            for (var j = 0; j < 3; j++) {
                // if (board[i][j] != value) {
                //     rowComplete = false;
                // }
                if (board[j][i] != value) {
                    colComplete = false;
                }
                if (board[i][j] == 0) {
                    allNotEmpty = false;
                }
            }
            if (rowComplete || colComplete) {
                return isEnemyValue ? 1 : 0;

            }
        }
        if (diagonalCompleted || reverseDiagonalCompleted) {
            return isEnemyValue ? 1 : 0;
        }
    }
    if (allNotEmpty) {
        return -1;
    }
    return null;
}
function minimaxTurn(board, player) {
    var winner = findWinner(board);
    if (winner != null) {
        return recurseWinner[winner](board);
    } else {
        let nextVal = null,
            nextBoard = null;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (board[i][j] == 0) {
                    board[i][j] = player;
                    var value = minimaxTurn(board, player == -1 ? 1 : player == 1 ? -1 : 0)[0];
                    var playerIsEnemy = player == settings.players.enemy;
                    if ((playerIsEnemy && (nextVal == null || value > nextVal)) || (!playerIsEnemy && (nextVal == null || value < nextVal))) {
                        nextBoard = board.map(arr => arr.slice());
                        nextVal = value;
                    }
                    board[i][j] = 0;
                }
            }
        }
        return [nextVal, nextBoard];
    }
}

function winnerFinded(dispatch, winner) {
    gameStatus = winner;
    if (gameStatus !== 'D') {
        let whoWinner = '';
        Object.keys(settings.players).map((index)=> {
            if (settings.players[index] === winner) {
                whoWinner = index;
            }
        });
        // Object.keys(settings.players).map(index=>
        //     settings.players[index] === winner ?
        //         whoWinner = index :
        //         whoWinner = '');
        if (!gameOver) {
            winners[whoWinner]++;
            gameOver = true;
        }
    }
    else {
        winLine = [];
    }
    dispatch({
        type: UPDATE_GAME_STATUS,
        gameStatus, winLine, winners
    });

}
export function getGameFieldData() {
    return (dispatch) => {
        dispatch({
            type: GET_GAME_DATA_REQUEST
        });
        gameOver = false;
        winLine = [];
        gameStatus = 0;
        dispatch({
            type: UPDATE_GAME_STATUS,
            winLine, winners, gameStatus
        });
        let randGameFieldData = Math.floor(Math.random() * 19);
        if (randGameFieldData > 10) {
            loadGameFieldData(dispatch);
        } else {
            gameField = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            dispatch({
                type: GET_GAME_DATA,
                payload: gameField
            });
        }
    }

}
export function resetGameStatus() {
    gameStatus = 0;
    return (dispatch) => {
        dispatch({
            type: RESET_GAME_STATUS,
            gameStatus
        });
    }
}
function findCoefficientSquare(value) {
    // debugger;
    if(typeof value == 'number')
        return 0;
    else{
        var players = value.match(/p/g);
        var enemy = value.match(/e/g);
        return (players === null ? 0 : players.length) + (enemy === null ? 0 : enemy.length);
    }
    // let coef = 0;
    // if (value == 0) {
    //     coef = 1;
    // }
    // if (value < 0) {
    //     if (value <= -3) {
    //         coef = 9;
    //     }
    //     coef = 5;
    // } else {
    //     if (value <= 3) {
    //         coef = 9;
    //     }
    //     coef = 5;
    // }
    // return coef;
}
function angleCoefficient(i, j, array) {
    //                                  0 _ 0
    //                                  _ _ _
    //                                  0 _ 0
    //  [i][j]   [i][j+1]   [i][j+2]
    // [i+1][j] [i+1][j+1] [i+1][j+2]
    // [i+2][j] [i+2][j+1] [i+2][j+2]
    if (i == 0 && j == 0) {
        let value = 0;
        // if (array[i][j + 1] == 0 && array[i][j + 2] == 0) {
        //     value++;
        // }
        // if (array[i][j + 1] == settings.players.enemy && array[i][j + 2] == 0 || array[i][j + 1] == 0 && array[i][j + 2] == settings.players.enemy) {
        //     value++;
        // }
        // if ((array[i][j + 1] == settings.players.enemy && array[i][j + 2] == settings.players.enemy) || array[i][j + 1] == settings.players.player && array[i][j + 2] == settings.players.player) {
        //     value+=10;
        // }
        let leftTop = array[i][j + 1] + array[i][j + 2] + array[i + 1][j + 1] + array[i + 2][j + 2] + array[i + 1][j] + array[i + 2][j];
        return findCoefficientSquare(leftTop);
    }
    //  [i][j-2]   [i][j-1]   [i][j]
    // [i+1][j-2] [i+1][j-1] [i+1][j]
    // [i+2][j-2] [i+2][j-1] [i+2][j]
    if (i == 0 && j == 2) {
        let rightTop = array[i][j - 1] + array[i][j - 2] + array[i + 1][j] + array[i + 2][j] + array[i + 1][j - 1] + array[i + 2][j - 2];
        return findCoefficientSquare(rightTop);
    }
    // [i-2][j-2] [i-2][j-1] [i-2][j]
    // [i-1][j-2] [i-1][j-1] [i-1][j]
    //  [i][j-2]   [i][j-1]   [i][j]
    if (i == 2 && j == 2) {
        let rightBot = array[i][j - 1] + array[i][j - 2] + array[i - 1][j - 1] + array[i - 2][j - 2] + array[i - 1][j] + array[i - 2][j];
        return findCoefficientSquare(rightBot);
    }
    // [i-2][j] [i-2][j+1] [i-2][j+2]
    // [i-1][j] [i-1][j+1] [i-1][j+2]
    //  [i][j]   [i][j+1]   [i][j+2]
    if (i == 2 && j == 0) {
        let leftBot = array[i][j - 1] + array[i][j - 2] + array[i][j + 1] + array[i][j + 2] + array[i - 1][j + 1] + array[i - 2][j + 2];
        return findCoefficientSquare(leftBot);
    }
    // return 0;
}
function centerCoefficient(i, j, array) {
    // let reverseDiagonal = array[i - 1][j + 1] + array[i + 1][j - 1];
    // let diagonal = array[i - 1][j + 1] + array[i + 1][j - 1];
    // let column = ;
    // let row = ;
    return findCoefficientSquare(array[i - 1][j + 1] + array[i + 1][j - 1] + array[i - 1][j + 1] + array[i + 1][j - 1] + array[i - 1][j] + array[i + 1][j] + array[i][j - 1] + array[i][j + 1], true);
}
function centerAngularCoefficient(i, j, array) {

    //                                  _ 0 _
    //                                  0 _ 0
    //                                  _ 0 _
    //  [i][j-1]   [i][j]   [i][j+1]
    // [i+1][j-1] [i+1][j] [i+1][j+1]
    // [i+2][j-1] [i+2][j] [i+2][j+1]
    if (i == 0 && j == 1) {
        let middleTop = array[i + 1][j] + array[i + 2][j] + array[i][j - 1] + array[i][j + 1];
        return findCoefficientSquare(middleTop);
    }
    //  [i-1][j-2] [i-1][j-1] [i-1][j]
    //   [i][j-2]   [i][j-1]   [i][j]
    //  [i+1][j-2] [i+1][j-1] [i+1][j]
    if (i == 1 && j == 2) {
        let rightMiddle = array[i][j - 2] + array[i][j - 1] + array[i - 1][j] + array[i + 1][j];
        return findCoefficientSquare(rightMiddle);
    }
    // [i-2][j-1] [i-2][j] [i-2][j+1]
    // [i-1][j-1] [i-1][j] [i-1][j+1]
    //  [i][j-1]   [i][j]   [i][j+1]
    if (i == 2 && j == 1) {
        let botMiddle = array[i - 1][j] + array[i - 2][j] + array[i][j - 1] + array[i][j + 1];
        return findCoefficientSquare(botMiddle);
    }
    //  [i-1][j] [i-1][j+1] [i-1][j+2]
    //   [i][j]   [i][j+1]   [i][j+2]
    //  [i+1][j] [i+1][j+1] [i+1][j+2]
    if (i == 1 && j == 0) {
        let leftMiddle = array[i][j + 1] + array[i][j + 2]+ array[i - 1][j] + array[i + 1][j];
        return findCoefficientSquare(leftMiddle);
    }


}
function findFactorSquare(i, j, array) {
    let factor = 0;
    // O _ O
    // _ _ _
    // O _ O
    if ((i == 0 && j == 0) || (i == 2 && j == 0) || (i == 0 && j == 2) || (i == 2 && j == 2)) {
        factor = angleCoefficient(i, j, array);
    }
    // _ _ _
    // _ O _
    // _ _ _
    if (i == 1 && j == 1) {
        factor = centerCoefficient(i, j, array);
    }
    // _ O _
    // O _ O
    // _ O _
    if ((i == 1 && j == 0) || (i == 0 && j == 1) || (i == 1 && j == 2) || (i == 2 && j == 1)) {
        factor = centerAngularCoefficient(i, j, array);
    }
    return [i, j, factor];
}
function minimaxTurn2(gField) {
    // 0 0 1
    // 1 0 1 - 1 можно чтобы
    // 0 5 0 - 5 нужно сюда ходить
    let factorsArray = [];
    let gameField = gField;
    gField.map((array, cIndex) =>
        array.map((square, rIndex) => {
            gameField[cIndex][rIndex] = gameField[cIndex][rIndex] == settings.players.enemy ? 'e' : gameField[cIndex][rIndex] == settings.players.player ? 'p' : 0;
        })
    );

    gField.map((array, cIndex) =>
        array.map((square, rIndex) => {
            factorsArray.push(square ? [0, 0, 0] : findFactorSquare(cIndex, rIndex, gameField));
        })
    );
    // for (let i = 0; i < gField.length; i++) {
    //     for (let j = 0; j < gField[i].length; j++) {
    //         if (gField[i][j] == 0) {
    //             factorsArray.push(findFactorSquare(i, j, gField));
    //         }
    //     }
    // };
    let betterTurn = [];
    // factorsArray.reduce((prev, curr, index, arr)=> {
    //     if(prev[2] < curr[2]){
    //         betterTurn = curr;
    //     }
    // });
    return factorsArray.reduce(function (prev, cur) {
        return cur[2] > prev[2] ? cur : prev;
    }, [0, 0, -Infinity]);
    console.log(betterTurn);

    // gameField[betterTurn[0]][betterTurn[1]]=settings.players.enemy;


    // gameField[betterTurn[0]][betterTurn[1]] = settings.players.enemy;
}
export function makePlayerTurn(row, cell, value) {
    return (dispatch) => {
        if (!gameOver) {
            var victory = findWinner(gameField, true); // проверка на победу.
            if (victory === null) {
                gameField[row][cell] = value;
                let AIturn = minimaxTurn2(gameField.map(array=>array.slice()));
                gameField[AIturn[0]][AIturn[1]]=settings.players.enemy;
                // gameField = minimaxTurn(gameField, settings.players.enemy)[1];
                dispatch({
                    type: UPDATE_GAME_DATA,
                    payload: gameField
                });
            } else {
                winnerFinded(dispatch, victory);
            }
        }

    }
}
export function updatePlayersData(playerChoice) {
    return (dispatch) => {
        settings.players.player = playerChoice;
        settings.players.enemy = playerChoice > 0 ? -1 : 1;
        dispatch({
            type: UPDATE_PLAYER_SETTINGS,
            payload: settings
        })
    }
}
export function updatePlayerSettings(option, value) {
    return (dispatch) => {
        settings[option] = value || typeof settings[option] === 'boolean' ? !settings[option] : settings[option];
        dispatch({
            type: UPDATE_PLAYER_SETTINGS,
            payload: settings
        })
    }
}