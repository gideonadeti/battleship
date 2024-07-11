// Import dependencies and modules
import './index.scss'
import * as bootstrap from 'bootstrap'
import UI from './views/ui'
import createPlayers from './models/create-players'
import startGame from './models/start-game'
import playSound from './models/sounds'

let player, computer

function playGame () {
  UI.initialize();

  // Create new players each time playGame is called
  ({ player, computer } = createPlayers())

  UI.renderBoards([player, computer])

  function startGameHandler () {
    UI.showComputerBoard()
    startGame.initialize(player, computer)

    UI.randomizeButton.disabled = true
  }

  // Remove previous event listener if it exists
  if (UI.startButton.hasEventListener) {
    UI.startButton.removeEventListener('click', UI.startButton.clickHandler)
  }

  // Add event listener with updated player and computer
  UI.startButton.clickHandler = startGameHandler // Store reference to the handler
  UI.startButton.addEventListener('click', startGameHandler)
  UI.startButton.hasEventListener = true
}

document.addEventListener('DOMContentLoaded', () => {
  playGame()

  UI.randomizeButton.addEventListener('click', () => {
    playSound('click')
    playGame()
  })
})
