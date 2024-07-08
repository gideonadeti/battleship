import Player from '../src/models/player'

test('Player can attack enemy game board', () => {
  const player = new Player()
  const opponent = new Player()
  player.attack(opponent, 0, 0)
  expect(opponent.gameBoard.missedAttacks).toContainEqual([0, 0])
})
