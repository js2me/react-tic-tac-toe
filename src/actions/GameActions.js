import {
    GET_GAME_DATA_REQUEST,
    GET_GAME_DATA,
    UPDATE_GAME_STATUS,
    UPDATE_PLAYER_SETTINGS,
    RESET_GAME_STATUS,
    UPDATE_GAME_DATA
} from '../constants/Game';

//Адрес сервера с которого запрашивать данные о состоянии игрового поля
const API_ROOT_URL = 'http://606ep.ru:8080/';
//Игровое поле
let gameField = [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
//Статус игры (победа - , проигрыш - , ничья - )
    gameStatus = 0,
//Победная линия текущей игры (Необходима только для одного css класса)
    winLine = [],
//Настройки и данные об игре
    settings = {
        //Автозапуск новой игры при изменении статуса игры
        autoPlay: false,
        //Значения игроков на поле ( 1 - это нолик, -1 - крестик )
        players: {
            player: 0,
            enemy: 0
        }
    },
//Кто сколько раз победил (Необходима для отображения количества побед)//TODO добавить ничью
    winners = {
        player: 0,
        enemy: 0
    },
//Переменная обозначения окончания игры, блокирует ходы.
    gameOver = false;
//Настройки бота, задает уровень сложности , агрессивность
let AIoptions = {
    player: [1, 2, 9],
    own: [1, 2, 10],
    middleAngularLinesPref: 5
};
//Массив с координатами победных линий
let lineCoordinates = [
    [[0, 0], [0, 1], [0, 2]],// 0
    [[1, 0], [1, 1], [1, 2], AIoptions.middleAngularLinesPref],// 1
    [[2, 0], [2, 1], [2, 2]],// 2
    [[0, 0], [1, 0], [2, 0]],// 3
    [[0, 1], [1, 1], [2, 1], AIoptions.middleAngularLinesPref],// 4
    [[0, 2], [1, 2], [2, 2]],// 5
    [[0, 0], [1, 1], [2, 2]],// 6
    [[0, 2], [1, 1], [2, 0]] // 7
];
//Массив с победными линиями для каждого квадрата с ссылками на массивы координат точек.
//Каждый индекс элемента массива это квадрат на поле (Например : 2 квадрат - это 0*3+1(строка 0, столбец 1))
let lines = [
    [lineCoordinates[0], lineCoordinates[3], lineCoordinates[6]],
    [lineCoordinates[0], lineCoordinates[4]],
    [lineCoordinates[0], lineCoordinates[5], lineCoordinates[7]],
    [lineCoordinates[1], lineCoordinates[3]],
    [lineCoordinates[1], lineCoordinates[4], lineCoordinates[6], lineCoordinates[7]],
    [lineCoordinates[1], lineCoordinates[5]],
    [lineCoordinates[2], lineCoordinates[3], lineCoordinates[7]],
    [lineCoordinates[2], lineCoordinates[4]],
    [lineCoordinates[2], lineCoordinates[5], lineCoordinates[6]]
];
//Отправка и получение данных с сервера о состоянии игрового поля
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
                })
            }
        )
        .catch(function () {
            gameField = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            dispatch({
                type: GET_GAME_DATA,
                payload: gameField
            });
        })
}
//Поиск победителя в игре
function findWinner(board) {
    let allNotEmpty = true;
    let playerValues = [settings.players.player,settings.players.enemy];
    for (var k = 0; k < playerValues.length; k++) {
        let value = playerValues[k];
        let playerWinLines = [[],[], [],[]];
        let diagonalCompleted = true,
            reverseDiagonalCompleted = true;
        for (var i = 0; i < 3; i++) {
            if (board[i][i] != value) {
                diagonalCompleted = false;
            }else playerWinLines[0].push(i*3+i);
            if (board[2 - i][i] != value) {
                reverseDiagonalCompleted = false;
            }else playerWinLines[1].push(i*3+(2-i));
            let rowComplete = true,
                colComplete = true;
            for (var j = 0; j < 3; j++) {
                if (board[i][j] != value) {
                    rowComplete = false;
                }else playerWinLines[2].push(i*3+j);
                if (board[j][i] != value) {
                    colComplete = false;
                }else playerWinLines[3].push(i*3+j);
                if (board[i][j] == 0) {
                    allNotEmpty = false;
                }
            }
            if (rowComplete || colComplete) {
                winLine = rowComplete ? playerWinLines[2] : playerWinLines[3];
                return value;
            }else{
                playerWinLines[2] = playerWinLines[3] = [];
            }
        }
        if (diagonalCompleted || reverseDiagonalCompleted) {
            winLine = diagonalCompleted ? playerWinLines[0] : playerWinLines[1];
            return value;
        }else{
            playerWinLines[0] = playerWinLines[1] = [];
        }
    }
    if (allNotEmpty) {
        return 'D';
    }
    return null;
}
//Проверка на победу, а также подведение результатов игры
function checkWinner(dispatch) {
    let winner = findWinner(gameField);
    if (winner !== null) {
        gameStatus = winner;
        if (gameStatus !== 'D') {
            let whoWinner = '';
            Object.keys(settings.players).map(index=> {
                if (settings.players[index] === winner) {
                    whoWinner = index;
                }
            });
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
}
//Функция запроса игровых данных с сервера, также с некоторой вероятностью могут быть пустыми [[0,0,0],[0,0,0],[0,0,0]]
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
//Функция сброса игрового статуса при старте новой игры
export function resetGameStatus() {
    gameStatus = 0;
    return (dispatch) => {
        dispatch({
            type: RESET_GAME_STATUS,
            gameStatus
        });
    }
}
//Нахождение коэффициента линии
function findLineCoefficient(squares, commonLineCoefficient = 0) {
    let {enemy, player} = settings.players;
    let ownCoef = 0, playerCoef = 0;
    for (let square of squares) {
        if (square == enemy) {
            ownCoef++;
        }
        if (square == player) {
            playerCoef++;
        }
    }
    return (playerCoef < 0 ? 0 : AIoptions.own[ownCoef]) +
        (ownCoef < 0 ? 0 : AIoptions.player[playerCoef]) +
        (playerCoef == 0 ? commonLineCoefficient : 0);
}
//Поиск коэффициента клетки по i и j
function findCoefficient(i, j, array) {
    let coefficient = 0;
    for (let winLine of lines[i * 3 + j]) {
        coefficient += findLineCoefficient([
            array[winLine[0][0]][winLine[0][1]],
            array[winLine[1][0]][winLine[1][1]],
            array[winLine[2][0]][winLine[2][1]]
        ], winLine[3]);
    }
    return {position: [i, j], value: coefficient};

}
//Ход бота
function AITurn(gField = gameField) {
    let bestCoefficient = {
        position: [],
        value: 0
    };
    gField.map((array, rIndex) =>
        array.map((square, cIndex) => {
            if (!square) {
                let coefficient = findCoefficient(rIndex, cIndex, gField);
                bestCoefficient = bestCoefficient.value <= coefficient.value ? coefficient : bestCoefficient;
            }
        })
    );
    gameField[bestCoefficient.position[0]][bestCoefficient.position[1]] = settings.players.enemy;

}
//Ход игрока, но и в то же время ход бота.
export function makePlayerTurn(row, cell, value) {
    return (dispatch) => {
        if (!gameOver) {
            gameField[row][cell] = value;
            AITurn();
            checkWinner(dispatch);
            // var victory = findWinner(gameField, true); // проверка на победу.
            // if (victory === null) {
            // let AIturn = minimaxTurn2(gameField.map(array=>array.slice()));
            // let AIturn =

            // gameField = minimaxTurn(gameField, settings.players.enemy)[1];
            dispatch({
                type: UPDATE_GAME_DATA,
                payload: gameField
            });
            // } else {
            //     winnerFinded(dispatch, victory);
            // }
        }

    }
}
//Функция обновления состояния данных игрока
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
//Функция обновления состояния игровых настроек
export function updatePlayerSettings(option, value) {
    return (dispatch) => {
        settings[option] = value || typeof settings[option] === 'boolean' ? !settings[option] : settings[option];
        dispatch({
            type: UPDATE_PLAYER_SETTINGS,
            payload: settings
        })
    }
}