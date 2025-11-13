import ComputerAI from '../src/ai/computer-ai'
import { BOARD_SIZE, ORIENTATIONS } from '../src/constants/game-constants'
import Ship from '../src/models/ship'

describe('ComputerAI', () => {
  let computerAI

  beforeEach(() => {
    computerAI = new ComputerAI()
  })

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(computerAI.targetShip).toBeNull()
      expect(computerAI.initialX).toBeNull()
      expect(computerAI.initialY).toBeNull()
      expect(computerAI.currentX).toBeNull()
      expect(computerAI.currentY).toBeNull()
      expect(computerAI.currentIndex).toBe(0)
      expect(computerAI.orientation).toBeNull()
    })
  })

  describe('getDelayTime', () => {
    test('should return delay time for smart attack', () => {
      const delay = computerAI.getDelayTime(true)
      expect(delay).toBeGreaterThanOrEqual(500)
      expect(delay).toBeLessThanOrEqual(1250)
    })

    test('should return delay time for random attack', () => {
      const delay = computerAI.getDelayTime(false)
      expect(delay).toBeGreaterThanOrEqual(500)
      expect(delay).toBeLessThanOrEqual(2000)
    })

    test('should return delay time when no parameter provided', () => {
      const delay = computerAI.getDelayTime()
      expect(delay).toBeGreaterThanOrEqual(500)
      expect(delay).toBeLessThanOrEqual(2000)
    })
  })

  describe('isValidCell', () => {
    test('should return true for valid cell coordinates', () => {
      expect(computerAI.isValidCell(0, 0)).toBe(true)
      expect(computerAI.isValidCell(5, 5)).toBe(true)
      expect(computerAI.isValidCell(BOARD_SIZE - 1, BOARD_SIZE - 1)).toBe(true)
    })

    test('should return false for invalid cell coordinates', () => {
      expect(computerAI.isValidCell(-1, 0)).toBe(false)
      expect(computerAI.isValidCell(0, -1)).toBe(false)
      expect(computerAI.isValidCell(BOARD_SIZE, 0)).toBe(false)
      expect(computerAI.isValidCell(0, BOARD_SIZE)).toBe(false)
      expect(computerAI.isValidCell(-1, -1)).toBe(false)
      expect(computerAI.isValidCell(BOARD_SIZE, BOARD_SIZE)).toBe(false)
    })
  })

  describe('prepareSmartAttack', () => {
    test('should set up smart attack state', () => {
      const ship = new Ship(3)
      const x = 5
      const y = 5

      computerAI.prepareSmartAttack(x, y, ship)

      expect(computerAI.targetShip).toBe(ship)
      expect(computerAI.initialX).toBe(x)
      expect(computerAI.initialY).toBe(y)
      expect(computerAI.currentX).toBe(x)
      expect(computerAI.currentY).toBe(y)
      expect(computerAI.currentIndex).toBe(0)
      expect(computerAI.orientation).toBeNull()
    })
  })

  describe('getDirectionVector', () => {
    test('should return correct direction vectors for all indices', () => {
      const directions = [
        { dx: 0, dy: 1 }, // Right
        { dx: -1, dy: 0 }, // Up
        { dx: 0, dy: -1 }, // Left
        { dx: 1, dy: 0 } // Down
      ]

      for (let i = 0; i < 4; i++) {
        const vector = computerAI.getDirectionVector(i)
        expect(vector).toEqual(directions[i])
      }
    })
  })

  describe('updateSmartAttackOnHit', () => {
    test('should update current coordinates on hit', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)

      computerAI.updateSmartAttackOnHit(5, 6)

      expect(computerAI.currentX).toBe(5)
      expect(computerAI.currentY).toBe(6)
    })

    test('should set orientation to horizontal when index is even', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentIndex = 0

      computerAI.updateSmartAttackOnHit(5, 6)

      expect(computerAI.orientation).toBe(ORIENTATIONS.HORIZONTAL)
    })

    test('should set orientation to vertical when index is odd', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentIndex = 1

      computerAI.updateSmartAttackOnHit(4, 5)

      expect(computerAI.orientation).toBe(ORIENTATIONS.VERTICAL)
    })

    test('should not change orientation if already set', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.orientation = ORIENTATIONS.HORIZONTAL

      computerAI.updateSmartAttackOnHit(5, 6)

      expect(computerAI.orientation).toBe(ORIENTATIONS.HORIZONTAL)
    })
  })

  describe('updateSmartAttackOnMiss', () => {
    test('should increment currentIndex when orientation is not set', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentIndex = 0

      computerAI.updateSmartAttackOnMiss()

      expect(computerAI.currentIndex).toBe(1)
      expect(computerAI.orientation).toBeNull()
    })

    test('should reset to initial coordinates when orientation is set', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentX = 5
      computerAI.currentY = 6
      computerAI.orientation = ORIENTATIONS.HORIZONTAL

      computerAI.updateSmartAttackOnMiss()

      expect(computerAI.currentX).toBe(5)
      expect(computerAI.currentY).toBe(5)
      expect(computerAI.currentIndex).toBe(2) // Should be 2 for horizontal
    })

    test('should set index to 3 when orientation is vertical', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.orientation = ORIENTATIONS.VERTICAL

      computerAI.updateSmartAttackOnMiss()

      expect(computerAI.currentIndex).toBe(3)
    })
  })

  describe('resetSmartAttackToInitial', () => {
    test('should reset to initial coordinates', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentX = 7
      computerAI.currentY = 8

      computerAI.resetSmartAttackToInitial()

      expect(computerAI.currentX).toBe(5)
      expect(computerAI.currentY).toBe(5)
    })

    test('should set index to 2 for horizontal orientation', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.orientation = ORIENTATIONS.HORIZONTAL

      computerAI.resetSmartAttackToInitial()

      expect(computerAI.currentIndex).toBe(2)
    })

    test('should set index to 3 for vertical orientation', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.orientation = ORIENTATIONS.VERTICAL

      computerAI.resetSmartAttackToInitial()

      expect(computerAI.currentIndex).toBe(3)
    })
  })

  describe('updateSmartAttackAfterInvalidMove', () => {
    test('should increment currentIndex when orientation is not set', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentIndex = 0

      computerAI.updateSmartAttackAfterInvalidMove()

      expect(computerAI.currentIndex).toBe(1)
    })

    test('should reset to initial coordinates when orientation is set', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentX = 5
      computerAI.currentY = 6
      computerAI.orientation = ORIENTATIONS.HORIZONTAL

      computerAI.updateSmartAttackAfterInvalidMove()

      expect(computerAI.currentX).toBe(5)
      expect(computerAI.currentY).toBe(5)
      expect(computerAI.currentIndex).toBe(2)
    })
  })

  describe('resetSmartAttack', () => {
    test('should reset all smart attack state', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)
      computerAI.currentX = 7
      computerAI.currentY = 8
      computerAI.currentIndex = 2
      computerAI.orientation = ORIENTATIONS.HORIZONTAL

      computerAI.resetSmartAttack()

      expect(computerAI.targetShip).toBeNull()
      expect(computerAI.initialX).toBeNull()
      expect(computerAI.initialY).toBeNull()
      expect(computerAI.currentX).toBeNull()
      expect(computerAI.currentY).toBeNull()
      expect(computerAI.currentIndex).toBe(0)
      expect(computerAI.orientation).toBeNull()
    })
  })

  describe('reset', () => {
    test('should reset smart attack state', () => {
      const ship = new Ship(3)
      computerAI.prepareSmartAttack(5, 5, ship)

      computerAI.reset()

      expect(computerAI.targetShip).toBeNull()
      expect(computerAI.initialX).toBeNull()
      expect(computerAI.initialY).toBeNull()
      expect(computerAI.currentX).toBeNull()
      expect(computerAI.currentY).toBeNull()
      expect(computerAI.currentIndex).toBe(0)
      expect(computerAI.orientation).toBeNull()
    })
  })
})

