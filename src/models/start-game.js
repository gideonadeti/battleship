import UI from '../views/ui'
import playSound from './sounds'

export default class StartGame {
  static currentPlayer
  static player
  static computer
  static handlePlayerAttackBound
  static playerShip
  static initialX
  static initialY
  static currentX
  static currentY
  static currentIndex
  static orientation
  static computerShip

  // Initialize the game with random starter
  static initialize (player, computer) {
    this.player = player
    this.computer = computer
    this.currentPlayer = Math.random() > 0.5 ? 'player' : 'computer'

    playSound('gameStarted')
    UI.updateNotification(
      this.currentPlayer === 'player'
        ? 'The game started, your turn.'
        : "The game started, computer's turn."
    )

    if (this.currentPlayer === 'computer') {
      setTimeout(() => this.handleComputerAttack(), this.getDelayTime())
    }

    // Bind the player attack handler and add event listener
    this.handlePlayerAttackBound = this.handlePlayerAttack.bind(this)
    UI.computerBoard.addEventListener('click', this.handlePlayerAttackBound)
  }

  // Get delay time for the computer's move
  static getDelayTime (smart = false) {
    return smart ? Math.random() * 750 + 500 : Math.random() * 1500 + 500
  }

  // Handle computer attack logic
  static handleComputerAttack () {
    let x, y, cell

    // Find a random cell that hasn't been attacked
    do {
      x = Math.floor(Math.random() * 10)
      y = Math.floor(Math.random() * 10)
      cell = document.querySelector(
        `.player .game-board .cell[data-row="${x + 1}"][data-col="${y + 1}"]`
      )
    } while (cell.classList.contains('attacked'))

    const hit = this.computer.attack(this.player, x, y)
    UI.fillCell(cell, hit)
    playSound(hit ? 'wounded' : 'missed')

    if (hit) {
      this.prepareSmartAttack(x, y, this.player.gameBoard.board[x][y])
    } else {
      this.currentPlayer = 'player'
      UI.updateNotification('Your turn.')
    }
  }

  // Prepare smart attack
  static prepareSmartAttack (initialX, initialY, playerShip) {
    this.playerShip = playerShip
    this.initialX = initialX
    this.initialY = initialY
    this.currentX = initialX
    this.currentY = initialY
    this.currentIndex = 0
    this.orientation = null

    setTimeout(() => this.handleSmartComputerAttack(), this.getDelayTime(true))
  }

  // Handle smart computer attack logic
  static handleSmartComputerAttack () {
    if (!this.playerShip.isSunk()) {
      const { dx, dy } = this.getDirectionVector(this.currentIndex)
      const adjacentX = this.currentX + dx
      const adjacentY = this.currentY + dy

      if (this.isValidCell(adjacentX, adjacentY)) {
        const adjacentCell = document.querySelector(
          `.player .game-board .cell[data-row="${adjacentX + 1}"][data-col="${
            adjacentY + 1
          }"]`
        )
        if (!adjacentCell.classList.contains('attacked')) {
          this.processSmartAttack(adjacentX, adjacentY, adjacentCell)
        } else {
          this.updateSmartAttackAfterInvalidMove()
        }
      } else {
        this.updateSmartAttackAfterInvalidMove()
      }
    } else {
      this.handleComputerAttack()
    }
  }

  // Validate cell within board bounds
  static isValidCell (x, y) {
    return x >= 0 && x < 10 && y >= 0 && y < 10
  }

  // Process smart attack
  static processSmartAttack (x, y, cell) {
    const hit = this.computer.attack(this.player, x, y)
    UI.fillCell(cell, hit)
    playSound(
      hit ? (this.playerShip.isSunk() ? 'killed' : 'wounded') : 'missed'
    )

    if (this.player.gameBoard.areAllShipsSunk()) {
      playSound('lose')
      UI.showGameOverModal('You lose!')
      UI.updateNotification('You lose!')
      UI.computerBoard.removeEventListener(
        'click',
        this.handlePlayerAttackBound
      )
    } else {
      if (hit) {
        this.updateSmartAttackOnHit(x, y)
      } else {
        this.updateSmartAttackOnMiss()
      }
    }
  }

  // Update state on smart attack hit
  static updateSmartAttackOnHit (x, y) {
    this.currentX = x
    this.currentY = y
    this.orientation =
      this.orientation || (this.currentIndex % 2 ? 'vertical' : 'horizontal')

    setTimeout(() => this.handleSmartComputerAttack(), this.getDelayTime(true))
  }

  // Update state on smart attack miss
  static updateSmartAttackOnMiss () {
    if (this.orientation) {
      this.resetSmartAttackToInitial()
    } else {
      this.currentIndex++
    }
    this.currentPlayer = 'player'
    UI.updateNotification('Your turn.')
  }

  // Reset smart attack to initial coordinates
  static resetSmartAttackToInitial () {
    this.currentX = this.initialX
    this.currentY = this.initialY
    this.currentIndex = this.orientation === 'horizontal' ? 2 : 3
  }

  // Update smart attack after invalid move
  static updateSmartAttackAfterInvalidMove () {
    if (this.orientation) {
      this.resetSmartAttackToInitial()
    } else {
      this.currentIndex++
    }

    setTimeout(() => this.handleSmartComputerAttack(), this.getDelayTime(true))
  }

  // Get direction vector based on index
  static getDirectionVector (index) {
    const directions = [
      { dx: 0, dy: 1 }, // Right
      { dx: -1, dy: 0 }, // Up
      { dx: 0, dy: -1 }, // Left
      { dx: 1, dy: 0 } // Down
    ]
    return directions[index]
  }

  // Handle player attack logic
  static handlePlayerAttack (event) {
    if (this.currentPlayer === 'player') {
      const cell = event.target
      if (
        cell.classList.contains('cell') &&
        !cell.classList.contains('attacked') &&
        !cell.classList.contains('label')
      ) {
        const x = parseInt(cell.dataset.row, 10) - 1
        const y = parseInt(cell.dataset.col, 10) - 1
        const hit = this.player.attack(this.computer, x, y)

        if (hit) {
          this.computerShip = this.computer.gameBoard.board[x][y]
        }

        UI.fillCell(cell, hit)

        playSound(
          hit ? (this.computerShip.isSunk() ? 'killed' : 'wounded') : 'missed'
        )

        if (this.computer.gameBoard.areAllShipsSunk()) {
          playSound('win')
          UI.showGameOverModal('You won!')
          UI.updateNotification('You won!')
          UI.computerBoard.removeEventListener(
            'click',
            this.handlePlayerAttackBound
          )
        } else {
          if (!hit) {
            this.currentPlayer = 'computer'
            UI.updateNotification("Computer's turn, please wait.")
            setTimeout(() => {
              this.playerShip
                ? this.handleSmartComputerAttack()
                : this.handleComputerAttack()
            }, this.getDelayTime())
          }
        }
      }
    }
  }
}
