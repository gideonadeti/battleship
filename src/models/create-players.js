import Player from './player'
import Ship from './ship'

export default function createPlayers () {
  const player = new Player('player')
  const computer = new Player('computer')

  const shipLengths = [5, 4, 3, 3, 2]

  // Function to randomly place ships on a player's board
  const placeShipsRandomly = (player) => {
    shipLengths.forEach((length) => {
      const ship = new Ship(length)
      let placed = false
      do {
        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)
        const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical'
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
