import Ship from '../src/models/ship'

test('Ship should have correct length', () => {
  const ship = new Ship(3)
  expect(ship.length).toBe(3)
})

test('Ship should record hits', () => {
  const ship = new Ship(3)
  ship.hit()
  expect(ship.hits).toBe(1)
})

test('Ship should sink when hits equal length', () => {
  const ship = new Ship(3)
  ship.hit()
  ship.hit()
  ship.hit()
  expect(ship.isSunk()).toBe(true)
})

test('Ship should not sink when hits are less than length', () => {
  const ship = new Ship(3)
  ship.hit()
  ship.hit()
  expect(ship.isSunk()).toBe(false)
})
