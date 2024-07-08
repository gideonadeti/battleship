import Player from '../src/models/player'

test('Player can attack enemy gameboard', () => {
  const player = new Player()
  const opponent = new Player()
  player.attack(opponent, 0, 0)
  expect(opponent.gameboard.missedAttacks).toContainEqual([0, 0])
})
