import { BOARD_SIZE, ORIENTATIONS } from '../constants/game-constants'

export default class GameBoard {
  constructor () {
    this.board = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
    this.ships = []
    this.missedAttacks = []
    // Track ship positions and orientations for drag/rotate operations
    this.shipPositions = new Map() // Map<Ship, {x, y, orientation}>
  }

  placeShip (ship, x, y, orientation) {
    if (!this.isValidPlacement(ship, x, y, orientation)) {
      return false
    }

    for (let i = 0; i < ship.length; i++) {
      if (orientation === ORIENTATIONS.HORIZONTAL) {
        this.board[x][y + i] = ship
      } else if (orientation === ORIENTATIONS.VERTICAL) {
        this.board[x + i][y] = ship
      }
    }

    this.ships.push(ship)
    // Store ship position and orientation
    this.shipPositions.set(ship, { x, y, orientation })
    return true
  }

  isValidPlacement (ship, x, y, orientation, excludeShip = null) {
    // Boundaries check
    if (
      x < 0 ||
      y < 0 ||
      (orientation === ORIENTATIONS.HORIZONTAL && y + ship.length > BOARD_SIZE) ||
      (orientation === ORIENTATIONS.VERTICAL && x + ship.length > BOARD_SIZE)
    ) {
      return false
    }

    // Overlap check
    for (let i = 0; i < ship.length; i++) {
      const checkX = x + (orientation === ORIENTATIONS.VERTICAL ? i : 0)
      const checkY = y + (orientation === ORIENTATIONS.HORIZONTAL ? i : 0)

      // Allow overlap with the ship being moved
      if (this.board[checkX][checkY] !== null && this.board[checkX][checkY] !== excludeShip) {
        return false
      }

      // Spacing check
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const adjX = checkX + dx
          const adjY = checkY + dy
          if (
            adjX >= 0 &&
            adjX < BOARD_SIZE &&
            adjY >= 0 &&
            adjY < BOARD_SIZE &&
            this.board[adjX][adjY] !== null &&
            this.board[adjX][adjY] !== excludeShip
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

  /**
   * Remove a ship from the board
   * @param {Ship} ship - The ship instance to remove
   * @returns {Ship|null} - The removed ship instance, or null if not found
   */
  removeShip (ship) {
    if (!this.shipPositions.has(ship)) {
      return null
    }

    const { x, y, orientation } = this.shipPositions.get(ship)

    // Clear all cells occupied by the ship
    for (let i = 0; i < ship.length; i++) {
      if (orientation === ORIENTATIONS.HORIZONTAL) {
        this.board[x][y + i] = null
      } else if (orientation === ORIENTATIONS.VERTICAL) {
        this.board[x + i][y] = null
      }
    }

    // Remove from ships array
    const shipIndex = this.ships.indexOf(ship)
    if (shipIndex > -1) {
      this.ships.splice(shipIndex, 1)
    }

    // Remove from positions map
    this.shipPositions.delete(ship)

    return ship
  }

  /**
   * Get the position and orientation of a ship
   * @param {Ship} ship - The ship instance
   * @returns {{x: number, y: number, orientation: string}|null} - Position info or null if not found
   */
  getShipPosition (ship) {
    if (!this.shipPositions.has(ship)) {
      return null
    }
    return this.shipPositions.get(ship)
  }

  /**
   * Rotate a ship (toggle orientation)
   * @param {Ship} ship - The ship instance to rotate
   * @returns {boolean} - True if rotation was successful, false otherwise
   */
  rotateShip (ship) {
    const position = this.getShipPosition(ship)
    if (!position) {
      return false
    }

    const { x, y, orientation: oldOrientation } = position
    const newOrientation = oldOrientation === ORIENTATIONS.HORIZONTAL
      ? ORIENTATIONS.VERTICAL
      : ORIENTATIONS.HORIZONTAL

    // Try to place at same position with new orientation
    if (this.isValidPlacement(ship, x, y, newOrientation, ship)) {
      this.removeShip(ship)
      return this.placeShip(ship, x, y, newOrientation)
    }

    // Try adjacent positions
    const offsets = [
      [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
    ]

    for (const [dx, dy] of offsets) {
      const newX = x + dx
      const newY = y + dy

      if (this.isValidPlacement(ship, newX, newY, newOrientation, ship)) {
        this.removeShip(ship)
        return this.placeShip(ship, newX, newY, newOrientation)
      }
    }

    // If all attempts fail, restore original position
    // (ship is still in original position since we didn't remove it)
    return false
  }
}
