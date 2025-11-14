import Player from './player'
import Ship from './ship'
import { BOARD_SIZE, SHIP_LENGTHS, PLAYERS, ORIENTATIONS } from '../constants/game-constants'

export default function createPlayers () {
  const player = new Player(PLAYERS.PLAYER)
  const computer = new Player(PLAYERS.COMPUTER)

  // Function to randomly place ships on a player's board
  const placeShipsRandomly = (player) => {
    SHIP_LENGTHS.forEach((length) => {
      const ship = new Ship(length)
      let placed = false
      do {
        const x = Math.floor(Math.random() * BOARD_SIZE)
        const y = Math.floor(Math.random() * BOARD_SIZE)
        const orientation = Math.random() > 0.5 ? ORIENTATIONS.HORIZONTAL : ORIENTATIONS.VERTICAL
        placed = player.gameBoard.placeShip(ship, x, y, orientation)
      } while (!placed)
    })
  }

  // Randomly place ships for both players
  placeShipsRandomly(player)
  placeShipsRandomly(computer)

  // Return the players
  return {
    player,
    computer
  }
}
