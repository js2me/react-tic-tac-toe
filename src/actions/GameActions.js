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
            enemy: 0
        }
    },
    winners = {
        player: 0,
        enemy: 0
    },
    gameover = false;

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
function checkWin(gField) {
    // проверка зон 3 на 3...
    for (var stX = 0; stX <= gField.length - 3; stX++)
        for (var stY = 0; stY <= gField[0].length - 3; stY++) // Если размер поля больше трёх.
        {
            var lC = gField[stX][stY];
            if (lC != 0) {
                //проверка на диагональ
                winLine = [];
                for (var i = 0; i < 3; i++) {
                    if (gField[i + stX][i + stY] != lC) {
                        lC = 0;
                    } else {
                        winLine.push('r' + (i + stX) + 'c' + (i + stY));
                    }
                }
            }
            if (lC != 0) return lC; // если победа обнаружена.
            lC = gField[2 + stX][stY];
            if (lC != 0) {
                winLine = [];
                for (var b = 0; b < 3; b++) {
                    if (gField[2 - b + stX][b + stY] != lC) {
                        lC = 0;
                    } else {
                        winLine.push('r' + (2 - b + stX) + 'c' + (b + stY));
                    }
                }
            }
            if (lC != 0) return lC;

            for (i = 0; i < 3; i++) { // проверка по вертикали
                lC = gField[stX + i][stY];
                if (lC != 0) {
                    winLine = [];
                    for (var j = 0; j < 3; j++) {
                        if (gField[i + stX][j + stY] != lC) {
                            lC = 0;
                        } else {
                            winLine.push('r' + (i + stX) + 'c' + (j + stY));
                        }
                    }
                }
                if (lC != 0) return lC;
            }
            for (j = 0; j < 3; j++) { // проверка по горизонтали
                lC = gField[stX][stY + j];
                if (lC != 0) {
                    winLine = [];
                    for (i = 0; i < 3; i++) {
                        if (gField[i + stX][j + stY] != lC) {
                            lC = 0;
                        } else {
                            winLine.push('r' + (i + stX) + 'c' + (j + stY));
                        }
                    }
                }
                if (lC != 0) return lC;
            }
        }
    var FieldsIsNotFill = false;
    var ContinueExecuting = true;
    for (stX = 0; stX < gField.length; stX++) {
        for (stY = 0; stY < gField[0].length; stY++) {
            if (gField[stX][stY] == 0) {
                FieldsIsNotFill = true;
                ContinueExecuting = false;
                break;
            }//if
        }//for(strY)
        if (!ContinueExecuting) break;
    }//for(stX)
    if (!FieldsIsNotFill) {
        // DrawGame = true;
        return 'D';
    }
    return false; //если никто не победил
}
function AITurn() {
    let players = settings.players;
    let gField = [].concat(gameField);
    // let aiTurn = '';
    // let winningCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    // let inputs = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
    // for (let i = 0; i < gameData.length; i++) {
    //     if(aiTurn === '' && (gameData[i][0] == players.player || gameData[i][1] == players.player || gameData[i][2] == players.player)){
    //         AIHorizontalRow();
    //     }
    //     if(aiTurn === '' && (gameData[i][0] == players.player || gameData[i][0] == players.player || gameData[i][0] == players.player)){
    //
    //     }
    //     // var attempts = 0;
    //     // if(gameData)
    //     // for (let j = 0; j < gameData[i].length; j++) {
    //     //     inputs[i+j] = players.enemy == gameData[i][j] ? players.enemy : players.player == gameData[i][j] ? players.player : 0;
    //     // }
    // }


    var tx = null, ty = null, tp = 0; // tp - приоритет выбранной целевой клетки.
    var stX = 0, stY = 0;
    for (stX = 0; stX < gField.length; stX++)
        for (stY = 0; stY < gField[0].length; stY++) // для каждой клетки
        {
            var lC = gField[stX][stY];
            if ((lC != players.player) && (lC != players.enemy)) { // только для пустых клеток
                gField[stX][stY] = players.player;
                if (checkWin(gField) == players.player) { // пробуем победить
                    tx = stX;
                    ty = stY;
                    tp = 3;
                    // alert('ГОНДОН ПОБЕДИЛ');
                } else if (tp < 3) {
                    gField[stX][stY] = players.enemy;
                    if (checkWin(gField) == players.enemy) { // или помешать победить игроку.
                        tx = stX;
                        ty = stY;
                        tp = 2;
                    } else if (tp < 2) { // или...
                        var mini = -1, maxi = 1, minj = -1, maxj = 1;
                        if (stX >= gField.length - 1) maxi = 0;
                        if (stY >= gField[0].length - 1) maxj = 0;
                        if (stX < 1) mini = 0;
                        if (stY < 1) minj = 0;
// найти ближайший нолик...
                        for (var i = mini; i <= maxi; i++) for (var j = minj; j <= maxj; j++) if ((i != 0) && (j != 0)) { // если есть рядом своя занятая клетка - поближе к своим
                            if (gField[stX + i][stY + j] == players.enemy) {
                                tx = stX;
                                ty = stY;
                                tp = 1;
                            }
                        }
                        if (tp < 1) { // или хотя бы на свободную клетку поставить.
                            tx = stX;
                            ty = stY;
                        }
                    }
                }
                gField[stX][stY] = lC;
            }
        }
    if ((tx != null) && (ty != null)) { // если целевая клетка выбранна
        // makeGameMove(tx, ty, players.player); // поставим нолик в клетку.
        gameField[tx][ty] = players.enemy;
        // makeGameMove(tx,ty,players.enemy);
        // dispatch({
        //     type: UPDATE_GAME_DATA,
        //     payload: gameField
        // });
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
        if (!gameover) {
            winners[whoWinner]++;
            gameover = true;
        }
    } else winLine = [];
    // if(settings.autoPlay){
    //     console.log('ЗАШЛО :');
    //     setTimeout(getGameFieldData,2000);
    // }
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
        gameover = false;
        winLine = [];
        gameStatus = 0;
        dispatch({
            type: UPDATE_GAME_STATUS,
            winLine, winners, gameStatus
        });
        let randGameFieldData = Math.floor(Math.random() * 19);
        if(randGameFieldData > 10){
            loadGameFieldData(dispatch);
        }else{
            gameField = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            dispatch({
                type: GET_GAME_DATA,
                payload: gameField
            });
        }
    }

}
export function resetGameStatus(){
    gameStatus = 0;
    return (dispatch) =>{
        dispatch({
            type: RESET_GAME_STATUS,
            gameStatus
        });
    }
}
export function makeGameTurn(row, cell, value) {
        return (dispatch) => {

            if (!gameover) {
                var victory = checkWin(gameField); // проверка на победу.
                if (!victory) {
                    gameField[row][cell] = value;
                    AITurn();
                    victory = checkWin(gameField); // проверка на победу
                    dispatch({
                        type: UPDATE_GAME_DATA,
                        payload: gameField
                    });
                }
                if (victory === 'D' || victory) {
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