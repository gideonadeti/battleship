import * as bootstrap from 'bootstrap'
import { BOARD_SIZE, ORIENTATIONS } from '../constants/game-constants'

export default class UI {
  static startButton = document.querySelector('.start-button')
  static notification = document.querySelector('.notification')
  static computerBoard = document.querySelector('.computer .game-board')
  static playerBoard = document.querySelector('.player .game-board')
  static randomizeButton = document.querySelector('.randomize')
  static boards = document.querySelectorAll('.game-board')
  static gameOverModal = document.querySelector('#game-over-modal')
  static playAgainButton = this.gameOverModal.querySelector('.play-again')

  // Drag and drop state
  static dragState = {
    isDragging: false,
    ship: null,
    originalPosition: null,
    originalOrientation: null,
    player: null
  }

  // Track if drag/drop is enabled (only during setup phase)
  static dragDropEnabled = true
  // Track if drag/drop listeners are set up
  static dragDropListenersSetup = false

  static showModal (modal) {
    const myModal = new bootstrap.Modal(modal)
    myModal.show()
  }

  static showGameOverModal (outcome) {
    this.gameOverModal.querySelector('.outcome').textContent = outcome
    this.showModal(this.gameOverModal)
  }

  static soundOn () {
    return document.querySelector('#sound-on').checked
  }

  static initialize () {
    this.clearBoards()
    this.createBoards()
    // Reset drag/drop listeners flag
    this.dragDropListenersSetup = false
  }

  static clearBoards () {
    this.boards.forEach((board) => {
      board.innerHTML = ''
    })
  }

  static createBoards () {
    this.boards.forEach((board) => {
      // Create column labels
      const columnLabels = [
        '',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J'
      ]
      columnLabels.forEach((label) => {
        const labelDiv = document.createElement('div')
        labelDiv.textContent = label
        labelDiv.classList.add('cell', 'label')
        board.appendChild(labelDiv)
      })

      // Create rows
      for (let row = 1; row <= BOARD_SIZE; row++) {
        // Create row label
        const rowLabelDiv = document.createElement('div')
        rowLabelDiv.textContent = row
        rowLabelDiv.classList.add('cell', 'label')
        board.appendChild(rowLabelDiv)

        // Create cells for the row
        for (let col = 1; col <= BOARD_SIZE; col++) {
          const cellDiv = document.createElement('div')
          cellDiv.classList.add('cell')
          cellDiv.dataset.row = row
          cellDiv.dataset.col = col
          board.appendChild(cellDiv)
        }
      }
    })
  }

  static renderBoards (players) {
    players.forEach((player) => {
      const board = document.querySelector(`.${player.name} .game-board`)
      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
          const cell = board.querySelector(
            `.cell[data-row="${x + 1}"][data-col="${y + 1}"]`
          )
          if (player.gameBoard.board[x][y] !== null) {
            cell.classList.add(`${player.name}-ship`)
            // Make player ships draggable during setup
            if (player.name === 'player' && this.dragDropEnabled) {
              cell.classList.add('ship-cell')
              cell.draggable = true
            }
          }
        }
      }
    })

    // Set up drag and drop handlers for player board
    if (this.dragDropEnabled) {
      this.setupDragAndDrop(players.find(p => p.name === 'player'))
    }
  }

  static showComputerBoard () {
    this.startButton.style.display = 'none'
    this.computerBoard.style.opacity = 1
    this.computerBoard.style.pointerEvents = 'auto'
    // Disable drag and drop when game starts
    this.dragDropEnabled = false
    // Remove draggable attributes from ship cells
    const shipCells = this.playerBoard.querySelectorAll('.ship-cell')
    shipCells.forEach(cell => {
      cell.draggable = false
      cell.classList.remove('ship-cell')
    })
  }

  static fadeComputerBoard () {
    this.startButton.style.display = 'block'
    this.computerBoard.style.opacity = 0.25
    this.computerBoard.style.pointerEvents = 'none'
    // Re-enable drag and drop for new game
    this.dragDropEnabled = true
  }

  static updateNotification (text) {
    this.notification.textContent = text
  }

  static fillCell (cell, hit) {
    const content = document.createElement('p')
    content.classList.add('content')
    cell.classList.add('attacked')

    if (hit) {
      content.textContent = 'X'
      content.classList.add('text-danger')
    } else {
      content.textContent = 'O'
      content.classList.add('text-primary')
    }

    cell.appendChild(content)
  }

  // Coordinate conversion utilities
  static getCellCoordinates (cell) {
    const row = parseInt(cell.dataset.row, 10)
    const col = parseInt(cell.dataset.col, 10)
    // Convert from 1-indexed to 0-indexed
    return { x: row - 1, y: col - 1 }
  }

  static getCellFromCoordinates (x, y, board) {
    // Convert from 0-indexed to 1-indexed
    return board.querySelector(`.cell[data-row="${x + 1}"][data-col="${y + 1}"]`)
  }

  static getShipCells (ship, board, gameBoard) {
    const position = gameBoard.getShipPosition(ship)
    if (!position) return []

    const cells = []
    const { x, y, orientation } = position

    for (let i = 0; i < ship.length; i++) {
      const cellX = x + (orientation === ORIENTATIONS.VERTICAL ? i : 0)
      const cellY = y + (orientation === ORIENTATIONS.HORIZONTAL ? i : 0)
      const cell = this.getCellFromCoordinates(cellX, cellY, board)
      if (cell) cells.push(cell)
    }

    return cells
  }

  // Visual feedback methods
  static highlightValidPlacement (x, y, ship, orientation) {
    const board = this.playerBoard
    this.clearPlacementPreview()

    for (let i = 0; i < ship.length; i++) {
      const cellX = x + (orientation === ORIENTATIONS.VERTICAL ? i : 0)
      const cellY = y + (orientation === ORIENTATIONS.HORIZONTAL ? i : 0)

      if (cellX >= 0 && cellX < BOARD_SIZE && cellY >= 0 && cellY < BOARD_SIZE) {
        const cell = this.getCellFromCoordinates(cellX, cellY, board)
        if (cell && !cell.classList.contains('label')) {
          cell.classList.add('valid-drop')
        }
      }
    }
  }

  static highlightInvalidPlacement (x, y, ship, orientation) {
    const board = this.playerBoard
    this.clearPlacementPreview()

    for (let i = 0; i < ship.length; i++) {
      const cellX = x + (orientation === ORIENTATIONS.VERTICAL ? i : 0)
      const cellY = y + (orientation === ORIENTATIONS.HORIZONTAL ? i : 0)

      if (cellX >= 0 && cellX < BOARD_SIZE && cellY >= 0 && cellY < BOARD_SIZE) {
        const cell = this.getCellFromCoordinates(cellX, cellY, board)
        if (cell && !cell.classList.contains('label')) {
          cell.classList.add('invalid-drop')
        }
      }
    }
  }

  static clearPlacementPreview () {
    const cells = this.playerBoard.querySelectorAll('.valid-drop, .invalid-drop')
    cells.forEach(cell => {
      cell.classList.remove('valid-drop', 'invalid-drop')
    })
  }

  // Drag and drop setup
  static setupDragAndDrop (player) {
    if (!player || this.dragDropListenersSetup) return

    this.dragDropListenersSetup = true

    // Add dragstart handler to ship cells
    this.playerBoard.addEventListener('dragstart', (e) => {
      if (!this.dragDropEnabled) {
        e.preventDefault()
        return
      }

      const cell = e.target
      if (!cell.classList.contains('ship-cell')) {
        return
      }

      const { x, y } = this.getCellCoordinates(cell)
      const ship = player.gameBoard.board[x][y]

      if (!ship) {
        e.preventDefault()
        return
      }

      const position = player.gameBoard.getShipPosition(ship)
      if (!position) {
        e.preventDefault()
        return
      }

      this.dragState.isDragging = true
      this.dragState.ship = ship
      this.dragState.originalPosition = { ...position }
      this.dragState.originalOrientation = position.orientation
      this.dragState.player = player

      // Add dragging class to ship cells
      const shipCells = this.getShipCells(ship, this.playerBoard, player.gameBoard)
      shipCells.forEach(c => c.classList.add('dragging'))

      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', '') // Required for Firefox
    })

    // Add dragover handler to board cells
    this.playerBoard.addEventListener('dragover', (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return

      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      const cell = e.target.closest('.cell')
      if (!cell || cell.classList.contains('label')) {
        this.clearPlacementPreview()
        return
      }

      const { x, y } = this.getCellCoordinates(cell)
      const { ship, originalOrientation } = this.dragState

      // Use original orientation for preview
      const isValid = this.dragState.player.gameBoard.isValidPlacement(
        ship,
        x,
        y,
        originalOrientation,
        ship
      )

      if (isValid) {
        this.highlightValidPlacement(x, y, ship, originalOrientation)
      } else {
        this.highlightInvalidPlacement(x, y, ship, originalOrientation)
      }
    })

    // Add drop handler
    this.playerBoard.addEventListener('drop', (e) => {
      if (!this.dragDropEnabled || !this.dragState.isDragging) return

      e.preventDefault()
      this.clearPlacementPreview()

      const cell = e.target.closest('.cell')
      if (!cell || cell.classList.contains('label')) {
        this.resetDragState()
        return
      }

      const { x, y } = this.getCellCoordinates(cell)
      const { ship, player: playerRef, originalOrientation } = this.dragState

      // Try to place ship at new position
      if (playerRef.gameBoard.isValidPlacement(ship, x, y, originalOrientation, ship)) {
        // Remove ship from old position
        playerRef.gameBoard.removeShip(ship)
        // Place at new position
        playerRef.gameBoard.placeShip(ship, x, y, originalOrientation)
        // Re-render player board only
        this.renderPlayerBoard(playerRef)
      } else {
        // Invalid placement, restore original
        this.resetDragState()
      }

      this.resetDragState()
    })

    // Add dragend handler for cleanup
    this.playerBoard.addEventListener('dragend', (e) => {
      if (this.dragState.isDragging) {
        this.clearPlacementPreview()
        this.resetDragState()
      }
    })

    // Add double-click handler for rotation
    this.playerBoard.addEventListener('dblclick', (e) => {
      if (!this.dragDropEnabled) return

      const cell = e.target.closest('.cell')
      if (!cell || cell.classList.contains('label') || !cell.classList.contains('ship-cell')) {
        return
      }

      const { x, y } = this.getCellCoordinates(cell)
      const ship = player.gameBoard.board[x][y]

      if (!ship) return

      const success = player.gameBoard.rotateShip(ship)
      if (success) {
        // Re-render player board only
        this.renderPlayerBoard(player)
      }
    })
  }

  static resetDragState () {
    // Remove dragging class from all cells
    const draggingCells = this.playerBoard.querySelectorAll('.dragging')
    draggingCells.forEach(cell => cell.classList.remove('dragging'))

    this.dragState.isDragging = false
    this.dragState.ship = null
    this.dragState.originalPosition = null
    this.dragState.originalOrientation = null
    this.dragState.player = null
  }

  // Render only the player board (for drag/drop updates)
  static renderPlayerBoard (player) {
    const board = this.playerBoard
    // Clear existing ship classes
    const cells = board.querySelectorAll('.cell')
    cells.forEach(cell => {
      cell.classList.remove('player-ship', 'ship-cell', 'dragging')
      cell.draggable = false
    })

    // Re-render ships
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const cell = board.querySelector(
          `.cell[data-row="${x + 1}"][data-col="${y + 1}"]`
        )
        if (player.gameBoard.board[x][y] !== null) {
          cell.classList.add('player-ship')
          if (this.dragDropEnabled) {
            cell.classList.add('ship-cell')
            cell.draggable = true
          }
        }
      }
    }

    // Re-setup drag and drop if enabled (reset flag first)
    if (this.dragDropEnabled) {
      this.dragDropListenersSetup = false
      this.setupDragAndDrop(player)
    }
  }
}
