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

  // Initialize random starter
  static initialize (player, computer) {
    this.player = player
    this.computer = computer
    this.currentPlayer = Math.random() > 0.5 ? 'player' : 'computer'

    if (this.currentPlayer === 'player') {
      playSound('gameStarted')
      UI.updateNotification('The game started, your turn.')
    } else {
      playSound('gameStarted')
      UI.updateNotification("The game started, computer's turn.")
      setTimeout(
        () => this.handleComputerAttack(this.player, this.computer),
        this.getDelayTime()
      )
    }

    // Bind the function once and store the reference
    this.handlePlayerAttackBound = this.handlePlayerAttack.bind(this)
    UI.computerBoard.addEventListener('click', this.handlePlayerAttackBound)
  }

  static getDelayTime (smart = false) {
    return smart ? Math.random() * 750 + 500 : Math.random() * 1500 + 500
  }

  static handleComputerAttack (player, computer) {
    let x, y
    let cell
    do {
      x = Math.floor(Math.random() * 10)
      y = Math.floor(Math.random() * 10)
      cell = document.querySelector(
        `.player .game-board .cell[data-row="${x + 1}"][data-col="${y + 1}"]`
      )
    } while (cell.classList.contains('attacked'))

    const hit = computer.attack(player, x, y)
    UI.fillCell(cell, hit)

    if (hit) {
      playSound('wounded')
    } else {
      playSound('missed')
    }

    if (player.gameBoard.areAllShipsSunk()) {
      playSound('lose')
      UI.updateNotification('You lose!')
      UI.computerBoard.removeEventListener(
        'click',
        this.handlePlayerAttackBound
      )
    } else {
      if (!hit) {
        this.currentPlayer = 'player'
        UI.updateNotification('Your turn.')
      } else {
        this.playerShip = player.gameBoard.board[x][y]
        this.initialX = x
        this.initialY = y
        this.currentX = x
        this.currentY = y
        this.currentIndex = 0
        this.orientation = null
        setTimeout(
          () => this.handleSmartComputerAttack(player, computer),
          this.getDelayTime(true)
        )
      }
    }
  }

  static handleSmartComputerAttack (player, computer) {
    if (!this.playerShip.isSunk()) {
      const direction = this.getDirectionVector(this.currentIndex)
      const adjacentX = this.currentX + direction.dx
      const adjacentY = this.currentY + direction.dy

      if (
        adjacentX >= 0 &&
        adjacentX < 10 &&
        adjacentY >= 0 &&
        adjacentY < 10
      ) {
        const adjacentCell = document.querySelector(
          `.player .game-board .cell[data-row="${adjacentX + 1}"][data-col="${
            adjacentY + 1
          }"]`
        )
        if (!adjacentCell.classList.contains('attacked')) {
          const hit = computer.attack(player, adjacentX, adjacentY)
          UI.fillCell(adjacentCell, hit)

          if (hit && this.playerShip.isSunk()) {
            playSound('killed')
          } else if (hit) {
            playSound('wounded')
          } else {
            playSound('missed')
          }

          if (player.gameBoard.areAllShipsSunk()) {
            playSound('lose')
            UI.updateNotification('You lose!')
            UI.computerBoard.removeEventListener(
              'click',
              this.handlePlayerAttackBound
            )
          } else {
            if (hit) {
              if (direction.dy) {
                this.orientation = 'horizontal'
              } else {
                this.orientation = 'vertical'
              }
              this.currentX = adjacentX
              this.currentY = adjacentY
              setTimeout(
                () => this.handleSmartComputerAttack(player, computer),
                this.getDelayTime(true)
              )
            } else {
              if (this.orientation) {
                this.currentX = this.initialX
                this.currentY = this.initialY
                if (
                  this.orientation === 'horizontal' &&
                  this.currentIndex === 0
                ) {
                  this.currentIndex = 2
                } else {
                  this.currentIndex = 3
                }
                this.currentPlayer = 'player'
                UI.updateNotification('Your turn.')
              } else {
                this.currentIndex++
                this.currentPlayer = 'player'
                UI.updateNotification('Your turn.')
              }
            }
          }
        } else {
          if (this.orientation) {
            this.currentX = this.initialX
            this.currentY = this.initialY
            if (this.orientation === 'horizontal' && this.currentIndex === 0) {
              this.currentIndex = 2
              setTimeout(
                () => this.handleSmartComputerAttack(player, computer),
                this.getDelayTime(true)
              )
            } else {
              this.currentIndex = 3
              setTimeout(
                () => this.handleSmartComputerAttack(player, computer),
                this.getDelayTime(true)
              )
            }
          } else {
            this.currentIndex++
            setTimeout(
              () => this.handleSmartComputerAttack(player, computer),
              this.getDelayTime(true)
            )
          }
        }
      } else {
        if (this.orientation) {
          this.currentX = this.initialX
          this.currentY = this.initialY
          if (this.orientation === 'horizontal' && this.currentIndex === 0) {
            this.currentIndex = 2
            setTimeout(
              () => this.handleSmartComputerAttack(player, computer),
              this.getDelayTime(true)
            )
          } else {
            this.currentIndex = 3
            setTimeout(
              () => this.handleSmartComputerAttack(player, computer),
              this.getDelayTime(true)
            )
          }
        } else {
          this.currentIndex++
          setTimeout(
            () => this.handleSmartComputerAttack(player, computer),
            this.getDelayTime(true)
          )
        }
      }
    } else {
      this.handleComputerAttack(player, computer)
    }
  }

  static getDirectionVector (index) {
    const directions = [
      { dx: 0, dy: 1 }, // Right
      { dx: -1, dy: 0 }, // Up
      { dx: 0, dy: -1 }, // Left
      { dx: 1, dy: 0 } // Down
    ]
    return directions[index]
  }

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
        if (hit && this.computerShip.isSunk()) {
          playSound('killed')
        } else if (hit) {
          playSound('wounded')
        } else {
          playSound('missed')
        }

        if (this.computer.gameBoard.areAllShipsSunk()) {
          playSound('win')
          UI.updateNotification('You won!')
          UI.computerBoard.removeEventListener(
            'click',
            this.handlePlayerAttackBound
          )
        } else {
          if (!hit) {
            this.currentPlayer = 'computer'
            UI.updateNotification("Computer's turn, please wait.")
            setTimeout(
              () =>
                this.playerShip
                  ? this.handleSmartComputerAttack(this.player, this.computer)
                  : this.handleComputerAttack(this.player, this.computer),
              this.getDelayTime()
            )
          }
        }
      }
    }
  }
}
