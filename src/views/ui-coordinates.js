/**
 * UI Coordinate Utilities
 * Handles conversion between DOM coordinates and game board coordinates
 */

import { BOARD_SIZE, ORIENTATIONS } from "../constants/game-constants";
import { CSS_CLASSES } from "./ui-constants";

export class CoordinateUtils {
  /**
   * Convert cell DOM element to game board coordinates (0-indexed)
   * @param {HTMLElement} cell - The DOM cell element
   * @returns {{x: number, y: number}} - Coordinates in 0-indexed format
   */
  static getCellCoordinates(cell) {
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    // Convert from 1-indexed to 0-indexed
    return { x: row - 1, y: col - 1 };
  }

  /**
   * Get DOM cell element from game board coordinates (0-indexed)
   * @param {number} x - X coordinate (0-indexed)
   * @param {number} y - Y coordinate (0-indexed)
   * @param {HTMLElement} board - The board DOM element
   * @returns {HTMLElement|null} - The cell DOM element
   */
  static getCellFromCoordinates(x, y, board) {
    // Convert from 0-indexed to 1-indexed
    const cellSelector = `.${CSS_CLASSES.CELL}[data-row="${x + 1}"][data-col="${y + 1}"]`;
    return board.querySelector(cellSelector);
  }

  /**
   * Get all DOM cells that a ship occupies
   * @param {Object} ship - The ship object
   * @param {HTMLElement} board - The board DOM element
   * @param {Object} gameBoard - The game board logic object
   * @returns {HTMLElement[]} - Array of cell DOM elements
   */
  static getShipCells(ship, board, gameBoard) {
    const position = gameBoard.getShipPosition(ship);
    if (!position) return [];

    const cells = [];
    const { x, y, orientation } = position;

    for (let i = 0; i < ship.length; i++) {
      const cellCoords = this.calculateShipCellPosition(x, y, i, orientation);
      const cell = this.getCellFromCoordinates(cellCoords.x, cellCoords.y, board);
      if (cell) cells.push(cell);
    }

    return cells;
  }

  /**
   * Calculate the position of a specific cell in a ship
   * @param {number} startX - Starting X coordinate
   * @param {number} startY - Starting Y coordinate
   * @param {number} index - Index of the cell within the ship
   * @param {string} orientation - Ship orientation (horizontal/vertical)
   * @returns {{x: number, y: number}} - Coordinates of the cell
   */
  static calculateShipCellPosition(startX, startY, index, orientation) {
    return {
      x: startX + (orientation === ORIENTATIONS.VERTICAL ? index : 0),
      y: startY + (orientation === ORIENTATIONS.HORIZONTAL ? index : 0),
    };
  }

  /**
   * Check if coordinates are within board bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - True if coordinates are valid
   */
  static isValidBoardPosition(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  }
}

