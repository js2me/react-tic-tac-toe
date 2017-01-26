import React, {PropTypes, Component} from 'react'

export default class GameLogo extends Component {
    // constructor(props) {
    //     // props.gameActions.getGameData();
    //     super(props);
    //     this.createNewGame.bind(this);
    // }

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


    // componentWillUpdate(nextProps) {
    //     console.log('АААА', nextProps);
    // }
    // chooseWhomToPlay(choice) {
    //     this.props.playerActions.chooseWhomToPlay(choice);
    // }
    // createNewGame(){
    //     this.props.playerActions.createNewGame();
    // }
    // autoPlayHandler(){
    //     this.props.playerActions.updatePlayerSettings('autoplay');
    // }
    render() {
        // let {players,info} = this.props.playersInfo;
        // let {chooseWhomToPlay} = this.props.playerActions;
        // const { year, photos, fetching, error } = this.props;
        // const years = [2016,2015,2014,2013,2012,2011,2010];
        return <div className='game-logo'></div>
    }
}

GameLogo.propTypes = {
    gameStatus: PropTypes.any.isRequired
};
