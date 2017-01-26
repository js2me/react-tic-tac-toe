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
    '1':board=>[1,board],
    '0':board=>[-1,board],
    '-1':board=>[0,board]
};
let playersValues = [-1,1];
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
            }else{
                winLine.push('r'+i+'c'+i);
            }
            if (board[2 - i][i] != value) {
                reverseDiagonalCompleted = false;
            }else{
                winLine.push('r'+(2 - i)+'c'+i);
            }
            let rowComplete = true,
                colComplete = true;
            //TODO
            if(board[])
            for (var j = 0; j < 3; j++) {
                if (board[i][j] != value) {
                    rowComplete = false;
                }
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
export function makePlayerTurn(row, cell, value) {
    return (dispatch) => {
        if (!gameOver) {
            var victory = findWinner(gameField,true); // проверка на победу.
            if (victory === null) {
                gameField[row][cell] = value;
                gameField = minimaxTurn(gameField, settings.players.enemy)[1];
                dispatch({
                    type: UPDATE_GAME_DATA,
                    payload: gameField
                });
            }else{
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