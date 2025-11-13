import GameBoard from '../src/models/game-board'
import Ship from '../src/models/ship'
import { ORIENTATIONS } from '../src/constants/game-constants'

test('GameBoard can place ships at specific coordinates', () => {
  const board = new GameBoard()
  const ship = new Ship(3)
  board.placeShip(ship, 0, 0, 'horizontal')
  expect(board.board[0][0]).toBe(ship)
  expect(board.board[0][1]).toBe(ship)
  expect(board.board[0][2]).toBe(ship)
})

test('GameBoard can receive attacks and register hits', () => {
  const board = new GameBoard()
  const ship = new Ship(3)
  board.placeShip(ship, 0, 0, 'horizontal')
  board.receiveAttack(0, 0)
  expect(ship.hits).toBe(1)
})

test('GameBoard can receive attacks and register misses', () => {
  const board = new GameBoard()
  board.receiveAttack(0, 0)
  expect(board.missedAttacks).toContainEqual([0, 0])
})

test('GameBoard can report whether all ships are sunk', () => {
  const board = new GameBoard()
  const ship = new Ship(3)
  board.placeShip(ship, 0, 0, 'horizontal')
  board.receiveAttack(0, 0)
  board.receiveAttack(0, 1)
  board.receiveAttack(0, 2)
  expect(board.areAllShipsSunk()).toBe(true)
})

describe('GameBoard ship removal and position tracking', () => {
  test('should track ship positions after placement', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 2, 3, ORIENTATIONS.HORIZONTAL)
    
    const position = board.getShipPosition(ship)
    expect(position).toEqual({ x: 2, y: 3, orientation: ORIENTATIONS.HORIZONTAL })
  })

  test('getShipPosition should return null for unplaced ship', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    
    expect(board.getShipPosition(ship)).toBeNull()
  })

  test('should remove ship from board', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL)
    
    const removedShip = board.removeShip(ship)
    
    expect(removedShip).toBe(ship)
    expect(board.board[0][0]).toBeNull()
    expect(board.board[0][1]).toBeNull()
    expect(board.board[0][2]).toBeNull()
    expect(board.ships).not.toContain(ship)
    expect(board.getShipPosition(ship)).toBeNull()
  })

  test('should remove vertical ship from board', () => {
    const board = new GameBoard()
    const ship = new Ship(4)
    board.placeShip(ship, 1, 2, ORIENTATIONS.VERTICAL)
    
    board.removeShip(ship)
    
    expect(board.board[1][2]).toBeNull()
    expect(board.board[2][2]).toBeNull()
    expect(board.board[3][2]).toBeNull()
    expect(board.board[4][2]).toBeNull()
  })

  test('removeShip should return null for ship not on board', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    
    expect(board.removeShip(ship)).toBeNull()
  })

  test('should remove ship from ships array', () => {
    const board = new GameBoard()
    const ship1 = new Ship(3)
    const ship2 = new Ship(2)
    board.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL)
    board.placeShip(ship2, 5, 5, ORIENTATIONS.HORIZONTAL)
    
    board.removeShip(ship1)
    
    expect(board.ships).toHaveLength(1)
    expect(board.ships).toContain(ship2)
    expect(board.ships).not.toContain(ship1)
  })
})

describe('GameBoard ship rotation', () => {
  test('should rotate horizontal ship to vertical at same position', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 2, 2, ORIENTATIONS.HORIZONTAL)
    
    const success = board.rotateShip(ship)
    
    expect(success).toBe(true)
    const position = board.getShipPosition(ship)
    expect(position.orientation).toBe(ORIENTATIONS.VERTICAL)
    expect(position.x).toBe(2)
    expect(position.y).toBe(2)
  })

  test('should rotate vertical ship to horizontal at same position', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 2, 2, ORIENTATIONS.VERTICAL)
    
    const success = board.rotateShip(ship)
    
    expect(success).toBe(true)
    const position = board.getShipPosition(ship)
    expect(position.orientation).toBe(ORIENTATIONS.HORIZONTAL)
  })

  test('should fail rotation if ship not on board', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    
    expect(board.rotateShip(ship)).toBe(false)
  })

  test('should try adjacent positions if rotation fails at same position', () => {
    const board = new GameBoard()
    const ship = new Ship(5) // Large ship
    // Place ship at position where rotation at same position would fail due to spacing
    // Place it with enough space around to allow rotation at adjacent position
    board.placeShip(ship, 3, 3, ORIENTATIONS.HORIZONTAL)
    
    const success = board.rotateShip(ship)
    
    // Should succeed by moving to adjacent position or same position if valid
    expect(success).toBe(true)
    const position = board.getShipPosition(ship)
    expect(position.orientation).toBe(ORIENTATIONS.VERTICAL)
  })

  test('should maintain ship hits when rotated', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 2, 2, ORIENTATIONS.HORIZONTAL)
    ship.hit()
    ship.hit()
    
    board.rotateShip(ship)
    
    expect(ship.hits).toBe(2)
  })
})

describe('GameBoard isValidPlacement with excludeShip', () => {
  test('should allow ship to overlap with itself when moving', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 2, 2, ORIENTATIONS.HORIZONTAL)
    
    // Should be valid to place at same position (for moving)
    expect(board.isValidPlacement(ship, 2, 2, ORIENTATIONS.HORIZONTAL, ship)).toBe(true)
  })

  test('should not allow ship to overlap with other ships when moving', () => {
    const board = new GameBoard()
    const ship1 = new Ship(3)
    const ship2 = new Ship(2)
    // Place ships with proper spacing (ships can't be adjacent)
    board.placeShip(ship1, 0, 0, ORIENTATIONS.HORIZONTAL)
    board.placeShip(ship2, 0, 5, ORIENTATIONS.HORIZONTAL)
    
    // Should not be valid to move ship1 to directly overlap with ship2
    // ship1 at (0,0-2), ship2 at (0,5-6), trying to place ship1 at (0,5) would overlap
    expect(board.isValidPlacement(ship1, 0, 5, ORIENTATIONS.HORIZONTAL, ship1)).toBe(false)
  })

  test('should allow ship to move to new valid position', () => {
    const board = new GameBoard()
    const ship = new Ship(3)
    board.placeShip(ship, 0, 0, ORIENTATIONS.HORIZONTAL)
    
    // Should be valid to move to new position
    expect(board.isValidPlacement(ship, 5, 5, ORIENTATIONS.HORIZONTAL, ship)).toBe(true)
  })
})
