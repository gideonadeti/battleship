import { BOARD_SIZE, ORIENTATIONS } from "../constants/game-constants";

/**
 * ComputerAI handles computer player's attack logic
 * This class encapsulates the smart attack logic used by the computer
 */
export default class ComputerAI {
  constructor() {
    this.targetShip = null;
    this.initialX = null;
    this.initialY = null;
    this.currentX = null;
    this.currentY = null;
    this.currentIndex = 0;
    this.orientation = null;
  }

  /**
   * Get delay time for computer's move
   * @param {boolean} smart - Whether this is a smart attack
   * @returns {number} Delay time in milliseconds
   */
  getDelayTime(smart = false) {
    return smart ? Math.random() * 750 + 500 : Math.random() * 1500 + 500;
  }

  /**
   * Validate cell coordinates
   * @param {number} x - Row coordinate
   * @param {number} y - Column coordinate
   * @returns {boolean} True if cell is valid
   */
  isValidCell(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  }

  /**
   * Prepare smart attack after hitting a ship
   * @param {number} x - Row coordinate of the hit
   * @param {number} y - Column coordinate of the hit
   * @param {Object} ship - The ship that was hit
   */
  prepareSmartAttack(x, y, ship) {
    this.targetShip = ship;
    this.initialX = x;
    this.initialY = y;
    this.currentX = x;
    this.currentY = y;
    this.currentIndex = 0;
    this.orientation = null;
  }

  /**
   * Get direction vector based on index
   * @param {number} index - Direction index (0-3)
   * @returns {Object} Object with dx and dy
   */
  getDirectionVector(index) {
    const directions = [
      { dx: 0, dy: 1 }, // Right
      { dx: -1, dy: 0 }, // Up
      { dx: 0, dy: -1 }, // Left
      { dx: 1, dy: 0 }, // Down
    ];
    return directions[index];
  }

  /**
   * Update smart attack state after a hit
   * @param {number} x - Row coordinate of the hit
   * @param {number} y - Column coordinate of the hit
   */
  updateSmartAttackOnHit(x, y) {
    this.currentX = x;
    this.currentY = y;
    this.orientation =
      this.orientation ||
      (this.currentIndex % 2 ? ORIENTATIONS.VERTICAL : ORIENTATIONS.HORIZONTAL);
  }

  /**
   * Update smart attack state after a miss
   */
  updateSmartAttackOnMiss() {
    if (this.orientation) {
      this.resetSmartAttackToInitial();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Reset smart attack to initial coordinates
   */
  resetSmartAttackToInitial() {
    this.currentX = this.initialX;
    this.currentY = this.initialY;
    this.currentIndex = this.orientation === ORIENTATIONS.HORIZONTAL ? 2 : 3;
  }

  /**
   * Update smart attack after invalid move
   */
  updateSmartAttackAfterInvalidMove() {
    if (this.orientation) {
      this.resetSmartAttackToInitial();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Reset smart attack state
   */
  resetSmartAttack() {
    this.targetShip = null;
    this.initialX = null;
    this.initialY = null;
    this.currentX = null;
    this.currentY = null;
    this.currentIndex = 0;
    this.orientation = null;
  }

  /**
   * Reset AI state for a new game
   */
  reset() {
    this.resetSmartAttack();
  }
}
