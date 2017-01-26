import React, {PropTypes, Component} from 'react'

export default class GamePanel extends Component {
    constructor(props) {
        // props.gameActions.getGameData();
        super(props);
    }

    // inputToSquare(row, cell, value) {
    // console.log(`clicked by [${row}-${cell}]`);
    // debugger;
    // if (value === 0) {
    //     this.props.gameActions.makeGameMove(row, cell, 1);
    //     // let newPlayingField = this.state.playingField;
    //     // newPlayingField[row][cell] = 1;
    //     // this.setState({playingField:newPlayingField});
    // }
    // }

    componentWillReceiveProps(nextProps) {
        if(nextProps.settings.autoPlay && nextProps.gameStatus !== 0){
            nextProps.gameActions.resetGameStatus();
            setTimeout(nextProps.gameActions.getGameFieldData,1000);
        }
    }
    // chooseWhomToPlay(choice) {
    //     this.props.playerActions.chooseWhomToPlay(choice);
    // }
    // createNewGame(){
    //     this.props.playerActions.createNewGame();
    // }
    // autoPlayHandler(){
    //     this.props.gameAtions.updatePlayerSettings('autoplay');
    // }
    render() {
        let winners = this.props.winners;
        let {autoPlay, players} = this.props.settings;
        let {updatePlayersData, getGameFieldData, updatePlayerSettings} = this.props.gameActions;
        // let {chooseWhomToPlay} = this.props.playerActions;
        // const { year, photos, fetching, error } = this.props;
        // const years = [2016,2015,2014,2013,2012,2011,2010];
        return <div className={'player-info' + (players.player !== 0 ? ' reduced' : '')}>
            <div className='start-game-container'>
                <div className='start-game-container_text'>
                    <label>Choose whom you play:</label>
                </div>
                <div className='start-game-container_wrapper'>
                    <button className='O' onClick={updatePlayersData.bind(this,1)}>O</button>
                    <button className='X' onClick={updatePlayersData.bind(this,-1)}>X</button>
                </div>
            </div>
            <div className='player-statistic'>
                <div className='player-statistic_wrapper'>
                    <label>YOU : {winners.player}</label>
                    <label>ENEMY : {winners.enemy}</label>
                    <button className='new-game-button' onClick={getGameFieldData}>NEW GAME</button>
                </div>
                <div className='player-statistic_wrapper'>
                    <label className='autoplay-checkbox'>
                        autoplay
                        <input type='checkbox' onClick={updatePlayerSettings.bind(this,'autoPlay')} checked={autoPlay}/>
                    </label>
                </div>
            </div>
        </div>
    }
}

GamePanel.propTypes = {
    gameActions: PropTypes.object.isRequired,
    gameStatus: PropTypes.any.isRequired,
    winners: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}
