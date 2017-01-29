import React, {PropTypes, Component} from 'react'

export default class Game extends Component {
    constructor(props) {
        props.gameActions.getGameFieldData();
        super(props);
        this.checkWinSquare.bind(this);
    }

    inputToSquare(row, cell, value) {
        let {gameActions, player} = this.props;
        if (value === 0) {
            gameActions.makePlayerTurn(row, cell, player);
        }
    }

    checkWinSquare(row, column) {
        debugger;
        if (this.props.winLine !== undefined) {
            return this.props.winLine.includes(column * 3 + row) ? ' winner' : '';
        }
        return '';
    }

    checkValueSquare(value) {
        return value === -1 ? ' X' : value === 1 ? ' O' : '';
    }

    //key={'square'+cellIndex+''} add to return <button ....
    collectPlayingField(gField) {
        return gField.map((rowArray, rIndex)=> {
            let rowIndex = rIndex;
            return <div className='game-row' key={'row' + rowIndex}>
                {rowArray.map((value, cellIndex) => {
                    return <button
                        className={'square' + (this.checkValueSquare(value)) + (this.checkWinSquare(rowIndex,cellIndex))}
                        key={'square'+cellIndex+''}
                        disabled={gField[rowIndex][cellIndex] !== 0}
                        onClick={this.inputToSquare.bind(this,rowIndex,cellIndex,value)}>
                        <span className='value'></span>
                    </button>
                })}
            </div>
        });
    }

    render() {
        let {fetching, gameField} = this.props;
        return <div className={'game-field' + (fetching ? ' loading' : '')}>
            <div className='game-loading'>Loading game...</div>
            {this.collectPlayingField(gameField)}
        </div>
    }

    static propTypes = {
        gameActions: PropTypes.object.isRequired,
        gameField: PropTypes.array.isRequired,
        winLine: PropTypes.array,
        fetching: PropTypes.bool,
        error: PropTypes.string.isRequired,
        player: PropTypes.number.isRequired
    }
}

// Game.propTypes = {
//     gameActions: PropTypes.object.isRequired,
//     gameField: PropTypes.array.isRequired,
//     winLine: PropTypes.array,
//     fetching: PropTypes.bool,
//     error: PropTypes.string.isRequired,
//     player: PropTypes.number.isRequired
// }
