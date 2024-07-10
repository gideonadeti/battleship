export default class GameBoard {
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
    // Boundaries check
    if (
      x < 0 ||
      y < 0 ||
      (orientation === 'horizontal' && y + ship.length > 10) ||
      (orientation === 'vertical' && x + ship.length > 10)
    ) {
      return false
    }

    // Overlap check
    for (let i = 0; i < ship.length; i++) {
      const checkX = x + (orientation === 'vertical' ? i : 0)
      const checkY = y + (orientation === 'horizontal' ? i : 0)

      if (this.board[checkX][checkY] !== null) {
        return false
      }

      // Spacing check
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const adjX = checkX + dx
          const adjY = checkY + dy
          if (
            adjX >= 0 &&
            adjX < 10 &&
            adjY >= 0 &&
            adjY < 10 &&
            this.board[adjX][adjY] !== null
          ) {
            return false
          }
        }
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
