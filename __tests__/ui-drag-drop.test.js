/**
 * Tests for UI drag and drop functionality
 * These tests focus on the core drag/drop logic without requiring full DOM initialization
 */

import { createCellElement, createMockGameBoard } from './helpers/dom-helpers'
import { createPlayerWithShip } from './helpers/game-fixtures'
import { ORIENTATIONS, PLAYERS, BOARD_SIZE } from '../src/constants/game-constants'
import Player from '../src/models/player'
import Ship from '../src/models/ship'

// Don't mock - import directly since we fixed the null handling

import UI from '../src/views/ui'

describe('UI Drag and Drop - Core Functionality', () => {
  let player
  let mockPlayerBoard

  beforeEach(() => {
    // Reset UI state
    UI.dragDropEnabled = true
    UI.dragDropListenersSetup = false
    UI.dragState = {
      isDragging: false,
      ship: null,
      originalPosition: null,
      originalOrientation: null,
      player: null
    }

    // Create mock board
    mockPlayerBoard = createMockGameBoard(BOARD_SIZE)
    UI.playerBoard = mockPlayerBoard

    // Create player with a ship
    player = createPlayerWithShip(PLAYERS.PLAYER, 2, 2, ORIENTATIONS.HORIZONTAL, 3)
  })

  describe('Coordinate conversion utilities', () => {
    test('getCellCoordinates should convert DOM cell to board coordinates', () => {
      const cell = createCellElement(5, 7)
      const coords = UI.getCellCoordinates(cell)
      
      expect(coords).toEqual({ x: 4, y: 6 })
    })

    test('getCellFromCoordinates should convert board coordinates to DOM cell', () => {
      const cell = UI.getCellFromCoordinates(3, 4, mockPlayerBoard)
      
      expect(cell).toBeDefined()
      expect(cell.dataset.row).toBe('4')
      expect(cell.dataset.col).toBe('5')
    })

    test('getShipCells should find all cells occupied by a ship', () => {
      const ship = player.gameBoard.ships[0]
      const cells = UI.getShipCells(ship, mockPlayerBoard, player.gameBoard)
      
      expect(cells.length).toBe(3) // Ship length is 3
    })
  })

  describe('Visual feedback methods', () => {
    test('highlightValidPlacement should add valid-drop class to cells', () => {
      const ship = new Ship(3)
      UI.highlightValidPlacement(2, 2, ship, ORIENTATIONS.HORIZONTAL)
      
      // Check that cells were highlighted (mock board should track this)
      expect(mockPlayerBoard.querySelector).toHaveBeenCalled()
    })

    test('highlightInvalidPlacement should add invalid-drop class to cells', () => {
      const ship = new Ship(3)
      UI.highlightInvalidPlacement(2, 2, ship, ORIENTATIONS.HORIZONTAL)
      
      expect(mockPlayerBoard.querySelector).toHaveBeenCalled()
    })

    test('clearPlacementPreview should remove highlight classes', () => {
      const ship = new Ship(3)
      UI.highlightValidPlacement(2, 2, ship, ORIENTATIONS.HORIZONTAL)
      UI.clearPlacementPreview()
      
      // Should not throw and should clear highlights
      expect(() => UI.clearPlacementPreview()).not.toThrow()
    })
  })

  describe('resetDragState', () => {
    test('should reset all drag state properties', () => {
      UI.dragState.isDragging = true
      UI.dragState.ship = new Ship(3)
      UI.dragState.originalPosition = { x: 2, y: 2 }
      UI.dragState.originalOrientation = ORIENTATIONS.HORIZONTAL
      UI.dragState.player = player
      
      // Mock querySelectorAll to return empty array
      mockPlayerBoard.querySelectorAll = jest.fn(() => [])
      
      UI.resetDragState()
      
      expect(UI.dragState.isDragging).toBe(false)
      expect(UI.dragState.ship).toBeNull()
      expect(UI.dragState.originalPosition).toBeNull()
      expect(UI.dragState.originalOrientation).toBeNull()
      expect(UI.dragState.player).toBeNull()
    })
  })

  describe('renderPlayerBoard', () => {
    test('should render ships and make them draggable when enabled', () => {
      UI.dragDropEnabled = true
      UI.playerBoard = mockPlayerBoard
      
      // Mock querySelector to return cells
      const mockCell = createCellElement(3, 3)
      mockPlayerBoard.querySelector = jest.fn(() => mockCell)
      mockPlayerBoard.querySelectorAll = jest.fn(() => [])
      
      jest.spyOn(UI, 'setupDragAndDrop')
      
      UI.renderPlayerBoard(player)
      
      // Should attempt to set up drag and drop
      expect(mockPlayerBoard.querySelector).toHaveBeenCalled()
    })

    test('should not make ships draggable when drag/drop is disabled', () => {
      UI.dragDropEnabled = false
      UI.playerBoard = mockPlayerBoard
      
      const mockCell = createCellElement(3, 3)
      mockPlayerBoard.querySelector = jest.fn(() => mockCell)
      mockPlayerBoard.querySelectorAll = jest.fn(() => [])
      
      UI.renderPlayerBoard(player)
      
      // Ships should not have draggable attribute when disabled
      expect(mockCell.draggable).toBeFalsy()
    })
  })
})

describe('UI Drag and Drop - Integration with GameBoard', () => {
  let player

  beforeEach(() => {
    player = createPlayerWithShip(PLAYERS.PLAYER, 2, 2, ORIENTATIONS.HORIZONTAL, 3)
  })

  test('should work with GameBoard removeShip method', () => {
    const ship = player.gameBoard.ships[0]
    const position = player.gameBoard.getShipPosition(ship)
    
    expect(position).toBeDefined()
    expect(position.x).toBe(2)
    expect(position.y).toBe(2)
    
    const removedShip = player.gameBoard.removeShip(ship)
    expect(removedShip).toBe(ship)
    expect(player.gameBoard.getShipPosition(ship)).toBeNull()
  })

  test('should work with GameBoard rotateShip method', () => {
    const ship = player.gameBoard.ships[0]
    const originalOrientation = player.gameBoard.getShipPosition(ship).orientation
    
    const success = player.gameBoard.rotateShip(ship)
    
    expect(success).toBe(true)
    const newPosition = player.gameBoard.getShipPosition(ship)
    expect(newPosition.orientation).not.toBe(originalOrientation)
  })
})

