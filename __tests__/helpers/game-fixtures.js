/**
 * Game fixtures for testing
 */

import Player from "../../src/models/player";
import Ship from "../../src/models/ship";
import { ORIENTATIONS, SHIP_LENGTHS } from "../../src/constants/game-constants";

/**
 * Create a player with ships placed
 * @param {string} name - Player name
 * @param {Array} shipPlacements - Array of {x, y, orientation, length}
 * @returns {Player} Player instance
 */
export function createPlayerWithShips(name, shipPlacements = []) {
  const player = new Player(name);

  if (shipPlacements.length === 0) {
    // Default: place all ships randomly
    SHIP_LENGTHS.forEach((length) => {
      const ship = new Ship(length);
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const orientation =
          Math.random() > 0.5 ? ORIENTATIONS.HORIZONTAL : ORIENTATIONS.VERTICAL;
        placed = player.gameBoard.placeShip(ship, x, y, orientation);
        attempts++;
      }
    });
  } else {
    // Place ships according to placements
    shipPlacements.forEach((placement) => {
      const ship = new Ship(placement.length || 3);
      player.gameBoard.placeShip(
        ship,
        placement.x,
        placement.y,
        placement.orientation || ORIENTATIONS.HORIZONTAL
      );
    });
  }

  return player;
}

/**
 * Create a player with a single ship
 * @param {string} name - Player name
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} orientation - Ship orientation
 * @param {number} length - Ship length
 * @returns {Player} Player instance
 */
export function createPlayerWithShip(name, x, y, orientation, length = 3) {
  return createPlayerWithShips(name, [{ x, y, orientation, length }]);
}

/**
 * Create two players for testing
 * @returns {Object} Object with player and computer
 */
export function createTestPlayers() {
  const player = createPlayerWithShips("player");
  const computer = createPlayerWithShips("computer");
  return { player, computer };
}

/**
 * Place a ship on an existing player's game board
 * @param {Player} player - The player instance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} orientation - Ship orientation
 * @param {number} length - Ship length
 * @returns {Ship} The created ship instance
 */
export function placeShipOnPlayer(player, x, y, orientation, length = 3) {
  const ship = new Ship(length);
  player.gameBoard.placeShip(ship, x, y, orientation);
  return ship;
}
