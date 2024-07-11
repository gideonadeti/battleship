export default class UI {
  static startButton = document.querySelector('.start-button')
  static notification = document.querySelector('.notification')
  static computerBoard = document.querySelector('.computer .game-board')
  static playerBoard = document.querySelector('.player .game-board')
  static randomizeButton = document.querySelector('.randomize')
  static boards = document.querySelectorAll('.game-board')

  static soundOn () {
    return document.querySelector('#sound-on').checked
  }

  static initialize () {
    this.clearBoards()
    this.createBoards()
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
      for (let row = 1; row <= 10; row++) {
        // Create row label
        const rowLabelDiv = document.createElement('div')
        rowLabelDiv.textContent = row
        rowLabelDiv.classList.add('cell', 'label')
        board.appendChild(rowLabelDiv)

        // Create cells for the row
        for (let col = 1; col <= 10; col++) {
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
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const cell = board.querySelector(
            `.cell[data-row="${x + 1}"][data-col="${y + 1}"]`
          )
          if (player.gameBoard.board[x][y] !== null) {
            cell.classList.add(`${player.name}-ship`)
          }
        }
      }
    })
  }

  static showComputerBoard () {
    this.startButton.style.display = 'none'
    this.computerBoard.style.opacity = 1
    this.computerBoard.style.pointerEvents = 'auto'
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
}
