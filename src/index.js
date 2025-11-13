// Import dependencies and modules
import './index.scss'
import * as bootstrap from 'bootstrap'
import UI from './views/ui'
import createPlayers from './models/create-players'
import GameController from './game/game-controller'
import playSound from './models/sounds'

let player, computer
let gameController = null

function playGame () {
  UI.initialize();

  // Create new players each time playGame is called
  ({ player, computer } = createPlayers())

  UI.renderBoards([player, computer])

  // Cleanup previous game controller if it exists
  if (gameController) {
    gameController.cleanup()
    gameController = null
  }

  function startGameHandler () {
    UI.showComputerBoard()
    
    // Create new game controller instance
    gameController = new GameController(player, computer)
    gameController.initialize()

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

  UI.playAgainButton.addEventListener('click', () => {
    UI.fadeComputerBoard()
    UI.updateNotification('Place your ships.')
    UI.randomizeButton.disabled = false
    playSound('click')
    playGame()
  })
})
