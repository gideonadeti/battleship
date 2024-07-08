export default class Gameboard {
  constructor () {
    this.board = Array(10)
      .fill(null)
      .map(() => Array(10).fill(null))
    this.ships = []
    this.missedAttacks = []
  }

  placeShip (ship, x, y, orientation) {
    if (!this.isValidPlacement(ship, x, y, orientation)) {
      return false
    }

    for (let i = 0; i < ship.length; i++) {
      if (orientation === 'horizontal') {
        this.board[x][y + i] = ship
      } else if (orientation === 'vertical') {
        this.board[x + i][y] = ship
      }
    }

    this.ships.push(ship)
    return true
  }

  isValidPlacement (ship, x, y, orientation) {
    if (
      x < 0 ||
      y < 0 ||
      (orientation === 'horizontal' && y + ship.length > 10) ||
      (orientation === 'vertical' && x + ship.length > 10)
    ) {
      return false
    }

    for (let i = 0; i < ship.length; i++) {
      if (orientation === 'horizontal' && this.board[x][y + i] !== null) {
        return false
      } else if (orientation === 'vertical' && this.board[x + i][y] !== null) {
        return false
      }
    }

    return true
  }

  receiveAttack (x, y) {
    const target = this.board[x][y]
    if (target) {
      target.hit()
      return true
    } else {
      this.missedAttacks.push([x, y])
      return false
    }
  }

  areAllShipsSunk () {
    return this.ships.every((ship) => ship.isSunk())
  }
}
