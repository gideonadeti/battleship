import GameBoard from './game-board'

export default class Player {
  constructor (name) {
    this.name = name
    this.gameBoard = new GameBoard()
  }

  attack (opponent, x, y) {
    return opponent.gameBoard.receiveAttack(x, y)
  }
}
