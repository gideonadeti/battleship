import Player from './player'
import Ship from './ship'

export default function createPlayers () {
  const player = new Player('player')
  const computer = new Player('computer')

  // Create player ships
  const playerCarrier = new Ship(5)
  const playerBattleship = new Ship(4)
  const playerCruiser = new Ship(3)
  const playerSubmarine = new Ship(3)
  const playerDestroyer = new Ship(2)

  // Place ships on the player's board
  player.gameBoard.placeShip(playerCarrier, 1, 2, 'horizontal')
  player.gameBoard.placeShip(playerBattleship, 3, 2, 'vertical')
  player.gameBoard.placeShip(playerCruiser, 3, 6, 'horizontal')
  player.gameBoard.placeShip(playerSubmarine, 5, 5, 'vertical')
  player.gameBoard.placeShip(playerDestroyer, 6, 7, 'horizontal')

  // Create computer ships
  const computerCarrier = new Ship(5)
  const computerBattleship = new Ship(4)
  const computerCruiser = new Ship(3)
  const computerSubmarine = new Ship(3)
  const computerDestroyer = new Ship(2)

  // Place ships on the computer's board (for now, use fixed positions)
  computer.gameBoard.placeShip(computerCarrier, 3, 3, 'horizontal')
  computer.gameBoard.placeShip(computerBattleship, 4, 1, 'vertical')
  computer.gameBoard.placeShip(computerCruiser, 7, 7, 'horizontal')
  computer.gameBoard.placeShip(computerSubmarine, 5, 4, 'vertical')
  computer.gameBoard.placeShip(computerDestroyer, 1, 2, 'horizontal')

  // Return the players
  return {
    player,
    computer
  }
}
