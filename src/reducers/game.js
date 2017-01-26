import {
    GET_GAME_DATA_REQUEST,
    GET_GAME_DATA,
    UPDATE_GAME_DATA,
    UPDATE_PLAYER_SETTINGS,
    RESET_GAME_STATUS,
    UPDATE_GAME_STATUS
} from '../constants/Game'
const initialState = {
    gameField: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    fetching: false,
    gameStatus: 0,
    winLine: [],
    settings: {
        autoPlay: false,
        players: {
            player: 0,
            enemy: 0
        }
    },
    winners: {
        player: 0,
        enemy: 0
    },
    error: ''
};

export default function game(state = initialState, action) {

    switch (action.type) {
        case GET_GAME_DATA_REQUEST:
            return {...state, fetching: true, error: ''};

        case GET_GAME_DATA:
            return {...state, gameField: action.payload, fetching: false, error: ''};

        case UPDATE_GAME_DATA:
            return {...state, gameField: action.payload, fetching: false};

        case UPDATE_GAME_STATUS:
            let {gameStatus, winLine,winners} = action;
            return {...state, gameStatus, winLine,winners};

        case UPDATE_PLAYER_SETTINGS:
            return {...state, settings: action.payload};

        case RESET_GAME_STATUS:
            return {...state,gameStatus:action.gameStatus};
        
        default:
            return state;
    }

}
