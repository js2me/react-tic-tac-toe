import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import GameField from '../components/GameField'
import GamePanel from '../components/GamePanel'
import GameLogo from '../components/GameLogo'
import * as gameActions from '../actions/GameActions'
// import * as playerActions from '../actions/GameInfoActions'


class Game extends Component {
    render() {
        const {fetching, gameField, error,gameStatus, winners, winLine, settings} = this.props.game;
        const gameActions = this.props.gameActions;        
        return <div className='game-container'>
                <GameLogo gameStatus={gameStatus}/>
                <GameField gameActions={gameActions} winLine={winLine}
                           gameField={gameField}
                           player={settings.players.player}
                           fetching={fetching} error={error}/>
                <GamePanel gameActions={gameActions} gameStatus={gameStatus} winners={winners}
                           settings={settings}/>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        game: state.game
    }
}

function mapDispatchToProps(dispatch) {
    return {
        gameActions: bindActionCreators(gameActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Game)
